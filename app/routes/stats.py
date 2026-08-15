from collections import defaultdict
from datetime import date, timedelta
from decimal import Decimal

from fastapi import APIRouter
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.db.models import LogEntry
from app.dependencies import CurrentUser, DbSession
from app.schemas.stats import HeatmapDay, StatsResponse, TopicHours

router = APIRouter(prefix="/stats", tags=["stats"])


def _compute_streaks(entry_dates: set[date]) -> tuple[int, int]:
    if not entry_dates:
        return 0, 0

    sorted_dates = sorted(entry_dates)
    longest = 1
    current_run = 1
    for index in range(1, len(sorted_dates)):
        if sorted_dates[index] - sorted_dates[index - 1] == timedelta(days=1):
            current_run += 1
            longest = max(longest, current_run)
        else:
            current_run = 1

    today = date.today()
    current_streak = 0
    cursor = today
    while cursor in entry_dates:
        current_streak += 1
        cursor -= timedelta(days=1)

    return current_streak, longest


@router.get("", response_model=StatsResponse)
async def get_stats(db: DbSession, current_user: CurrentUser) -> StatsResponse:
    entries_result = await db.execute(
        select(LogEntry)
        .options(selectinload(LogEntry.tags))
        .where(LogEntry.user_id == current_user.id)
        .order_by(LogEntry.created_at.desc()),
    )
    entries = list(entries_result.scalars().all())

    entry_dates = {entry.created_at.date() for entry in entries}
    current_streak, longest_streak = _compute_streaks(entry_dates)

    total_hours = float(sum((entry.study_hours or Decimal("0")) for entry in entries))
    topic_hours: dict[str, float] = defaultdict(float)

    for entry in entries:
        hours = float(entry.study_hours or 0)
        if entry.tags:
            for tag in entry.tags:
                topic_hours[tag.name] += hours
        else:
            topic_hours["untagged"] += hours

    heatmap_map: dict[date, dict[str, float | int]] = defaultdict(lambda: {"count": 0, "hours": 0.0})
    for entry in entries:
        day = entry.created_at.date()
        heatmap_map[day]["count"] = int(heatmap_map[day]["count"]) + 1
        heatmap_map[day]["hours"] = float(heatmap_map[day]["hours"]) + float(entry.study_hours or 0)

    start = date.today() - timedelta(days=90)
    heatmap = [
        HeatmapDay(
            date=day,
            count=int(heatmap_map[day]["count"]),
            hours=float(heatmap_map[day]["hours"]),
        )
        for day in sorted(heatmap_map.keys())
        if day >= start
    ]

    return StatsResponse(
        current_streak=current_streak,
        longest_streak=longest_streak,
        total_hours=total_hours,
        total_entries=len(entries),
        hours_by_topic=[
            TopicHours(topic=topic, hours=round(hours, 2))
            for topic, hours in sorted(topic_hours.items(), key=lambda item: item[1], reverse=True)
        ],
        heatmap=heatmap,
    )
