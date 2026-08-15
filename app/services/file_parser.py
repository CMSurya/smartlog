"""Utilities for extracting plain text from uploaded files."""
from __future__ import annotations

import io
import logging
import re

logger = logging.getLogger(__name__)

SUPPORTED_MIME_TYPES: set[str] = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  # .docx
    "application/msword",  # .doc (best-effort)
    "text/plain",
    "text/markdown",
    "text/csv",
}

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


class UnsupportedFileTypeError(ValueError):
    pass


class FileTooLargeError(ValueError):
    pass


def _extract_pdf(data: bytes) -> str:
    try:
        import pypdf  # lazy import

        reader = pypdf.PdfReader(io.BytesIO(data))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n\n".join(pages).strip()
    except ImportError:
        logger.warning("pypdf not installed; cannot parse PDF")
        raise UnsupportedFileTypeError(
            "PDF parsing requires the 'pypdf' package. Install it with: pip install pypdf"
        )


def _extract_docx(data: bytes) -> str:
    try:
        import docx  # lazy import — python-docx

        doc = docx.Document(io.BytesIO(data))
        paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
        return "\n\n".join(paragraphs).strip()
    except ImportError:
        logger.warning("python-docx not installed; cannot parse DOCX")
        raise UnsupportedFileTypeError(
            "DOCX parsing requires the 'python-docx' package. Install it with: pip install python-docx"
        )


def _extract_text(data: bytes) -> str:
    return data.decode("utf-8", errors="replace").strip()


def extract_text(filename: str, content_type: str, data: bytes) -> str:
    """Return plain text extracted from the uploaded file."""
    if len(data) > MAX_FILE_SIZE_BYTES:
        raise FileTooLargeError(f"File exceeds the 10 MB limit ({len(data) // 1024} KB uploaded).")

    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    # Determine handler by MIME type first, then extension fallback
    if content_type == "application/pdf" or ext == "pdf":
        return _extract_pdf(data)

    if (
        content_type
        == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        or ext == "docx"
    ):
        return _extract_docx(data)

    if content_type in ("text/plain", "text/markdown", "text/csv") or ext in (
        "txt",
        "md",
        "csv",
        "log",
    ):
        return _extract_text(data)

    # Generic fallback: try UTF-8 decode
    try:
        return _extract_text(data)
    except Exception:
        raise UnsupportedFileTypeError(
            f"Unsupported file type '{content_type}' (extension: .{ext}). "
            "Supported formats: PDF, DOCX, TXT, MD, CSV."
        )


def truncate_context(text: str, max_chars: int = 12_000) -> str:
    """Truncate extracted text to keep prompts within token limits."""
    if len(text) <= max_chars:
        return text
    truncated = text[:max_chars]
    # Trim to last complete sentence
    last_period = max(truncated.rfind("."), truncated.rfind("\n"))
    if last_period > max_chars // 2:
        truncated = truncated[: last_period + 1]
    return truncated + "\n\n[…content truncated to fit context limit…]"
