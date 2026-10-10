
import sqlite3
from pathlib import Path
from .database import DB_PATH, init_db


def detect_overlaps(db_path=None):
    """Find projects scheduled on the same road during overlapping dates.

    Args:
        db_path: Optional SQLite database path. If omitted, use the
                 existing CivicTrack database.
    """
    database_path = Path(db_path) if db_path else Path(DB_PATH)

    # Initialize the default database only when using the default path.
    # For a supplied test database, the test setup creates its tables.
    if db_path is None:
        init_db()

    connection = sqlite3.connect(str(database_path), timeout=10)
    connection.row_factory = sqlite3.Row

    try:
        rows = connection.execute(
            """
            SELECT
                id, name, road, start_date, end_date,
                original_end_date, revised_end_date, status
            FROM projects
            WHERE road IS NOT NULL
              AND TRIM(road) != ''
            ORDER BY road, start_date, id
            """
        ).fetchall()
    finally:
        connection.close()

    projects = [dict(row) for row in rows]
    alerts = []

    for i, first in enumerate(projects):
        for second in projects[i + 1:]:
            first_road = (first["road"] or "").strip().casefold()
            second_road = (second["road"] or "").strip().casefold()

            if first_road != second_road:
                continue

            first_start = first["start_date"]
            first_end = first["revised_end_date"] or first["end_date"]
            second_start = second["start_date"]
            second_end = second["revised_end_date"] or second["end_date"]

            if not all((first_start, first_end, second_start, second_end)):
                continue

            if first_start <= second_end and second_start <= first_end:
                alerts.append({
                    "project_1": first["name"],
                    "project_2": second["name"],
                    "road": first["road"],
                    "overlap_start": max(first_start, second_start),
                    "overlap_end": min(first_end, second_end),
                    "message": (
                        f'{first["name"]} and {second["name"]} '
                        f'are scheduled on {first["road"]} at the same time.'
                    ),
                })

    return alerts


if __name__ == "__main__":
    alerts = detect_overlaps()
    print("Coordination Radar")
    print("------------------")
    print(f"Total conflicts: {len(alerts)}")

    for alert in alerts:
        print(alert["message"])
        print(
            f'  Overlap: {alert["overlap_start"]} '
            f'to {alert["overlap_end"]}'
        )