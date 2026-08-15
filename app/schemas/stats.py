from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class TopicHours(BaseModel):
    topic: str
    hours: float


class HeatmapDay(BaseModel):
    date: date
    count: int
    hours: float


class StatsResponse(BaseModel):
    current_streak: int
    longest_streak: int
    total_hours: float
    total_entries: int
    hours_by_topic: list[TopicHours]
    heatmap: list[HeatmapDay]
