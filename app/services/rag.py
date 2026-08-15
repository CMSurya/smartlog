import asyncio
import json
import logging
import re
from uuid import UUID

from groq import AuthenticationError, Groq, RateLimitError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.db.models import LogEntry
from app.services.embeddings import embed_text_async

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are SmartLog, an AI assistant that answers questions using the user's personal "
    "learning journal entries.\n"
    "Use ONLY the provided context from their notes. If the context does not contain enough "
    "information, say so clearly.\n"
    "Be concise, accurate, and cite which entry titles you used when relevant."
)

MAX_TAGS = 5
TAG_PATTERN = re.compile(r"^[a-z0-9][a-z0-9\-_]{0,48}[a-z0-9]$|^[a-z0-9]$")


class RagError(Exception):
    """Base error for RAG/LLM failures."""


class MissingApiKeyError(RagError):
    pass


class InvalidApiKeyError(RagError):
    pass


class GroqServiceError(RagError):
    pass


async def retrieve_similar_entries(
    db: AsyncSession,
    user_id: UUID,
    question: str,
    limit: int = 5,
) -> list[LogEntry]:
    query_embedding = await embed_text_async(question)

    stmt = (
        select(LogEntry)
        .where(LogEntry.user_id == user_id, LogEntry.embedding.isnot(None))
        .order_by(LogEntry.embedding.cosine_distance(query_embedding))
        .limit(limit)
        .options(selectinload(LogEntry.tags))
    )

    result = await db.execute(stmt)
    return list(result.scalars().all())


def _build_context(entries: list[LogEntry]) -> str:
    if not entries:
        return "No relevant journal entries were found."

    blocks: list[str] = []
    for index, entry in enumerate(entries, start=1):
        tag_names = ", ".join(tag.name for tag in entry.tags) or "none"
        blocks.append(
            f"Entry {index} ---\n"
            f"Title: {entry.title}\n"
            f"Difficulty: {entry.difficulty or 'unspecified'}\n"
            f"Study hours: {entry.study_hours if entry.study_hours is not None else 'unspecified'}\n"
            f"Tags: {tag_names}\n"
            f"Content:\n{entry.content}"
        )
    return "\n\n".join(blocks)


def _call_groq(question: str, context: str) -> str:
    if not settings.groq_api_key.strip():
        raise MissingApiKeyError(
            "GROQ_API_KEY is not configured. Set GROQ_API_KEY in your environment to enable AI answers."
        )

    client = Groq(api_key=settings.groq_api_key)

    try:
        response = client.chat.completions.create(
            model=settings.groq_model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": (
                        f"Context from my learning journal:\n\n{context}\n\nMy question: {question}"
                    ),
                },
            ],
            temperature=0.7,
            max_tokens=1024,
        )
    except AuthenticationError as exc:
        raise InvalidApiKeyError("Invalid Groq API key. Check GROQ_API_KEY in your environment.") from exc
    except RateLimitError as exc:
        raise GroqServiceError("Groq rate limit exceeded. Please try again shortly.") from exc
    except Exception as exc:
        raise GroqServiceError(f"Groq API request failed: {exc}") from exc

    content = response.choices[0].message.content
    return content.strip() if content else "No answer generated."


async def generate_answer(question: str, context: str) -> str:
    return await asyncio.to_thread(_call_groq, question, context)


async def ask_from_notes(db: AsyncSession, user_id: UUID, question: str) -> tuple[str, int]:
    entries = await retrieve_similar_entries(db, user_id, question)
    context = _build_context(entries)
    answer = await generate_answer(question, context)
    return answer, len(entries)


FILE_SYSTEM_PROMPT = (
    "You are SmartLog, an AI assistant. The user has uploaded a document and asked a question about it.\n"
    "You also have access to relevant entries from the user's personal learning journal for extra context.\n"
    "Answer using BOTH sources — prioritise the uploaded document but use journal entries to supplement.\n"
    "Be concise, accurate, and structured. Use bullet points or headings when it helps clarity."
)


def _call_groq_with_file(question: str, file_context: str, notes_context: str, filename: str) -> str:
    if not settings.groq_api_key.strip():
        raise MissingApiKeyError(
            "GROQ_API_KEY is not configured. Set GROQ_API_KEY in your environment to enable AI answers."
        )

    client = Groq(api_key=settings.groq_api_key)

    user_content = (
        f"--- Uploaded document: {filename} ---\n"
        f"{file_context}\n\n"
        f"--- Relevant journal entries ---\n"
        f"{notes_context}\n\n"
        f"My question: {question}"
    )

    try:
        response = client.chat.completions.create(
            model=settings.groq_model,
            messages=[
                {"role": "system", "content": FILE_SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            temperature=0.6,
            max_tokens=2048,
        )
    except AuthenticationError as exc:
        raise InvalidApiKeyError("Invalid Groq API key. Check GROQ_API_KEY in your environment.") from exc
    except RateLimitError as exc:
        raise GroqServiceError("Groq rate limit exceeded. Please try again shortly.") from exc
    except Exception as exc:
        raise GroqServiceError(f"Groq API request failed: {exc}") from exc

    content = response.choices[0].message.content
    return content.strip() if content else "No answer generated."


async def ask_with_file_context(
    db: AsyncSession,
    user_id: UUID,
    question: str,
    file_context: str,
    filename: str,
) -> tuple[str, int]:
    """Answer a question using an uploaded file as primary context plus relevant journal entries."""
    entries = await retrieve_similar_entries(db, user_id, question, limit=3)
    notes_context = _build_context(entries)
    answer = await asyncio.to_thread(
        _call_groq_with_file, question, file_context, notes_context, filename
    )
    return answer, len(entries)


async def suggest_tags(title: str, content: str) -> list[str]:
    prompt = (
        "Suggest up to 5 short lowercase tags for this learning journal entry. "
        "Return ONLY a JSON array of strings.\n\n"
        f"Title: {title}\nContent: {content[:1500]}"
    )

    try:
        if not settings.groq_api_key.strip():
            return _fallback_tags(title, content)

        def _call() -> str:
            client = Groq(api_key=settings.groq_api_key)
            response = client.chat.completions.create(
                model=settings.groq_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=128,
            )
            return response.choices[0].message.content or "[]"

        raw = await asyncio.to_thread(_call)
        tags = json.loads(raw)
        if not isinstance(tags, list):
            return _fallback_tags(title, content)
        normalized = [_normalize_tag(str(tag)) for tag in tags]
        return [tag for tag in normalized if tag][:MAX_TAGS] or _fallback_tags(title, content)
    except Exception:
        logger.exception("Auto-tagging failed; using fallback tags")
        return _fallback_tags(title, content)


def _normalize_tag(tag: str) -> str:
    cleaned = tag.strip().lower().replace(" ", "-")
    if TAG_PATTERN.match(cleaned):
        return cleaned
    return ""


def _fallback_tags(title: str, content: str) -> list[str]:
    stopwords = {"the", "and", "for", "with", "from", "that", "this", "about", "into", "your"}
    words = re.findall(r"[a-zA-Z]{3,}", f"{title} {content}".lower())
    seen: set[str] = set()
    tags: list[str] = []
    for word in words:
        if word in stopwords or word in seen:
            continue
        seen.add(word)
        tags.append(word)
        if len(tags) >= MAX_TAGS:
            break
    return tags
