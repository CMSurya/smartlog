from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, HTTPException, Query, status

from app.db.models import LogEntry
from app.dependencies import CurrentUser, DbSession
from app.schemas.entry import EntryCreate, EntryListResponse, EntryResponse, EntryUpdate
from app.services.auto_tag import suggest_tags
from app.services.embeddings import update_entry_embedding
from app.services.entries import entry_to_response, fetch_entry, get_or_create_tags, list_entries

router = APIRouter(prefix="/entries", tags=["entries"])


def _embedding_text(title: str, content: str) -> str:
    return f"{title}\n\n{content}"


@router.post("", response_model=EntryResponse, status_code=status.HTTP_201_CREATED)
async def create_entry(
    payload: EntryCreate,
    background_tasks: BackgroundTasks,
    db: DbSession,
    current_user: CurrentUser,
) -> EntryResponse:
    tag_names = payload.tags or await suggest_tags(payload.title, payload.content)
    tags = await get_or_create_tags(db, tag_names)

    entry = LogEntry(
        user_id=current_user.id,
        title=payload.title.strip(),
        content=payload.content.strip(),
        study_hours=payload.study_hours,
        difficulty=payload.difficulty,
        tags=tags,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry, attribute_names=["tags"])

    background_tasks.add_task(
        update_entry_embedding,
        entry.id,
        _embedding_text(entry.title, entry.content),
    )
    return entry_to_response(entry)


@router.get("", response_model=EntryListResponse)
async def get_entries(
    db: DbSession,
    current_user: CurrentUser,
    search: str | None = Query(default=None),
    tag: str | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
) -> EntryListResponse:
    entries, total = await list_entries(db, current_user.id, search, tag, skip, limit)
    return EntryListResponse(items=[entry_to_response(entry) for entry in entries], total=total)


@router.get("/{entry_id}", response_model=EntryResponse)
async def get_entry(entry_id: UUID, db: DbSession, current_user: CurrentUser) -> EntryResponse:
    entry = await fetch_entry(db, entry_id, current_user.id)
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")
    return entry_to_response(entry)


@router.put("/{entry_id}", response_model=EntryResponse)
async def update_entry(
    entry_id: UUID,
    payload: EntryUpdate,
    background_tasks: BackgroundTasks,
    db: DbSession,
    current_user: CurrentUser,
) -> EntryResponse:
    entry = await fetch_entry(db, entry_id, current_user.id)
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")

    content_changed = False
    if payload.title is not None:
        entry.title = payload.title.strip()
        content_changed = True
    if payload.content is not None:
        entry.content = payload.content.strip()
        content_changed = True
    if payload.study_hours is not None:
        entry.study_hours = payload.study_hours
    if payload.difficulty is not None:
        entry.difficulty = payload.difficulty
    if payload.tags is not None:
        entry.tags = await get_or_create_tags(db, payload.tags)

    await db.commit()
    await db.refresh(entry, attribute_names=["tags"])

    if content_changed:
        background_tasks.add_task(
            update_entry_embedding,
            entry.id,
            _embedding_text(entry.title, entry.content),
        )

    return entry_to_response(entry)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entry(entry_id: UUID, db: DbSession, current_user: CurrentUser) -> None:
    entry = await fetch_entry(db, entry_id, current_user.id)
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")
    await db.delete(entry)
    await db.commit()
