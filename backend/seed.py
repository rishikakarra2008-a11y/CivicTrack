
from .database import get_connection, init_db


SAMPLE_PROJECTS = [
    {
        "name": "Main Road Drainage Repair",
        "department": "Municipal Corporation",
        "contractor": "ABC Constructions",
        "road": "Main Road, Ward 5",
        "start_date": "2026-10-12",
        "end_date": "2026-10-25",
        "original_end_date": "2026-10-25",
        "revised_end_date": None,
        "delay_reason": "",
        "status": "In Progress",
        "progress": 40,
    },
    {
        "name": "Water Pipeline Installation",
        "department": "Water Supply Department",
        "contractor": "XYZ Utilities",
        "road": "Main Road, Ward 5",
        "start_date": "2026-10-18",
        "end_date": "2026-10-30",
        "original_end_date": "2026-10-30",
        "revised_end_date": None,
        "delay_reason": "",
        "status": "Planned",
        "progress": 0,
    },
    {
        "name": "Village Road Resurfacing",
        "department": "Rural Roads Department",
        "contractor": "Village Works Team",
        "road": "Lake Road, Ward 2",
        "start_date": "2026-10-15",
        "end_date": "2026-10-22",
        "original_end_date": "2026-10-22",
        "revised_end_date": "2026-10-28",
        "delay_reason": "Heavy rainfall",
        "status": "Delayed",
        "progress": 60,
    },
]


def seed_projects():
    init_db()

    with get_connection() as connection:
        for project in SAMPLE_PROJECTS:
            existing = connection.execute(
                "SELECT id FROM projects WHERE name = ?",
                (project["name"],),
            ).fetchone()

            if existing:
                print(f"Skipping existing project: {project['name']}")
                continue

            connection.execute(
                """
                INSERT INTO projects (
                    name, department, contractor, road,
                    start_date, end_date, original_end_date,
                    revised_end_date, delay_reason, status, progress
                )
                VALUES (
                    :name, :department, :contractor, :road,
                    :start_date, :end_date, :original_end_date,
                    :revised_end_date, :delay_reason, :status, :progress
                )
                """,
                project,
            )

    print("Sample projects added successfully.")


if __name__ == "__main__":
    seed_projects()
