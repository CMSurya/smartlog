import asyncio
import logging
from functools import lru_cache
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db.base import AsyncSessionLocal
from app.db.models import LogEntry

logger = logging.getLogger(__name__)


@lru_cache
def _get_model():
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(settings.embedding_model)


def embed_text(text: str) -> list[float]:
    model = _get_model()
    vector = model.encode(text, normalize_embeddings=True)
    return vector.tolist()


async def embed_text_async(text: str) -> list[float]:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, embed_text, text)


async def update_entry_embedding(entry_id: UUID, text: str) -> None:
    embedding = await embed_text_async(text)
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(LogEntry).where(LogEntry.id == entry_id))
        entry = result.scalar_one_or_none()
        if entry is None:
            return
        entry.embedding = embedding
        await session.commit()


async def embed_entry_in_session(session: AsyncSession, entry: LogEntry, text: str) -> None:
    entry.embedding = await embed_text_async(text)
    session.add(entry)
