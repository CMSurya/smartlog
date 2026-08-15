import logging

from fastapi import APIRouter, Form, HTTPException, UploadFile, status

from app.dependencies import CurrentUser, DbSession
from app.schemas.ask import AskRequest, AskResponse
from app.services.file_parser import (
    FileTooLargeError,
    UnsupportedFileTypeError,
    extract_text,
    truncate_context,
)
from app.services.rag import (
    GroqServiceError,
    InvalidApiKeyError,
    MissingApiKeyError,
    ask_from_notes,
    ask_with_file_context,
)

logger = logging.getLogger(__name__)

router = APIRouter(tags=["ai"])


@router.post("/ask", response_model=AskResponse)
async def ask_question(payload: AskRequest, db: DbSession, current_user: CurrentUser) -> AskResponse:
    question = payload.question.strip()
    if not question:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Question cannot be empty")

    try:
        answer, sources_used = await ask_from_notes(db, current_user.id, question)
    except MissingApiKeyError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except InvalidApiKeyError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
    except GroqServiceError as exc:
        logger.exception("Groq API failure for user %s", current_user.id)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unexpected /ask failure for user %s", current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate an answer. Please try again.",
        ) from exc

    return AskResponse(answer=answer, sources_used=sources_used)


@router.post("/ask/file", response_model=AskResponse)
async def ask_with_file(
    db: DbSession,
    current_user: CurrentUser,
    question: str = Form(..., min_length=3, max_length=2000),
    file: UploadFile = ...,
) -> AskResponse:
    """Ask a question with an uploaded file (PDF, DOCX, TXT, MD, CSV) as context."""
    if not question.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Question cannot be empty")

    # Read and parse the file
    try:
        data = await file.read()
        file_text = extract_text(
            filename=file.filename or "upload",
            content_type=file.content_type or "application/octet-stream",
            data=data,
        )
    except FileTooLargeError as exc:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=str(exc)) from exc
    except UnsupportedFileTypeError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("File parsing failed for user %s", current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to read the uploaded file.",
        ) from exc

    if not file_text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The uploaded file appears to be empty or could not be parsed.",
        )

    file_context = truncate_context(file_text)

    try:
        answer, sources_used = await ask_with_file_context(
            db=db,
            user_id=current_user.id,
            question=question.strip(),
            file_context=file_context,
            filename=file.filename or "uploaded file",
        )
    except MissingApiKeyError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except InvalidApiKeyError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
    except GroqServiceError as exc:
        logger.exception("Groq API failure for user %s", current_user.id)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unexpected /ask/file failure for user %s", current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate an answer. Please try again.",
        ) from exc

    return AskResponse(answer=answer, sources_used=sources_used)
