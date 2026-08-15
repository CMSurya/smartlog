import re
from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models import LogEntry, Tag, entry_tags_table
from app.schemas.entry import EntryResponse, TagResponse


async def get_or_create_tags(session: AsyncSession, tag_names: list[str]) -> list[Tag]:
    normalized = [name.strip().lower() for name in tag_names if name.strip()]
    if not normalized:
        return []

    result = await session.execute(select(Tag).where(Tag.name.in_(normalized)))
    existing = {tag.name: tag for tag in result.scalars().all()}
    tags: list[Tag] = []

    for name in normalized:
        tag = existing.get(name)
        if tag is None:
            tag = Tag(name=name)
            session.add(tag)
            await session.flush()
            existing[name] = tag
        tags.append(tag)

    return tags


async def fetch_entry(session: AsyncSession, entry_id: UUID, user_id: UUID) -> LogEntry | None:
    result = await session.execute(
        select(LogEntry)
        .options(selectinload(LogEntry.tags))
        .where(LogEntry.id == entry_id, LogEntry.user_id == user_id),
    )
    return result.scalar_one_or_none()


def entry_to_response(entry: LogEntry) -> EntryResponse:
    return EntryResponse(
        id=entry.id,
        title=entry.title,
        content=entry.content,
        study_hours=entry.study_hours,
        difficulty=entry.difficulty,  # type: ignore[arg-type]
        tags=[TagResponse.model_validate(tag) for tag in entry.tags],
        created_at=entry.created_at,
        updated_at=entry.updated_at,
    )


async def list_entries(
    session: AsyncSession,
    user_id: UUID,
    search: str | None = None,
    tag: str | None = None,
    skip: int = 0,
    limit: int = 20,
) -> tuple[list[LogEntry], int]:
    base = (
        select(LogEntry)
        .options(selectinload(LogEntry.tags))
        .where(LogEntry.user_id == user_id)
    )

    if search:
        pattern = f"%{search.strip()}%"
        base = base.where(or_(LogEntry.title.ilike(pattern), LogEntry.content.ilike(pattern)))

    if tag:
        base = base.join(LogEntry.tags).where(Tag.name == tag.strip().lower())

    count_stmt = select(func.count()).select_from(base.subquery())
    total = (await session.execute(count_stmt)).scalar_one()

    result = await session.execute(base.order_by(LogEntry.created_at.desc()).offset(skip).limit(limit))
    return list(result.scalars().unique().all()), total
