from datetime import datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

Difficulty = Literal["easy", "medium", "hard"]


class TagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str


class EntryCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)
    study_hours: Decimal | None = Field(default=None, ge=0)
    difficulty: Difficulty = "medium"
    tags: list[str] = Field(default_factory=list)


class EntryUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    content: str | None = Field(default=None, min_length=1)
    study_hours: Decimal | None = Field(default=None, ge=0)
    difficulty: Difficulty | None = None
    tags: list[str] | None = None


class EntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    content: str
    study_hours: Decimal | None
    difficulty: Difficulty
    tags: list[TagResponse]
    created_at: datetime
    updated_at: datetime


class EntryListResponse(BaseModel):
    items: list[EntryResponse]
    total: int
