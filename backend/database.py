
import sqlite3
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DB_PATH = PROJECT_ROOT / "civictrack.db"
SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"


def get_connection(db_path=None):
    """Open a connection to the configured SQLite database."""
    path = Path(db_path) if db_path is not None else DB_PATH

    connection = sqlite3.connect(str(path), timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_db(db_path=None):
    """Initialize tables in the selected database."""
    schema = SCHEMA_PATH.read_text(encoding="utf-8")

    with get_connection(db_path) as connection:
        connection.executescript(schema)

    path = Path(db_path) if db_path is not None else DB_PATH
    print(f"Database initialized: {path}")


def get_all_projects(db_path=None):
    """Return all projects as dictionaries."""
    with get_connection(db_path) as connection:
        rows = connection.execute(
            "SELECT * FROM projects ORDER BY id DESC"
        ).fetchall()

    return [dict(row) for row in rows]


def get_all_feedback(db_path=None):
    """Return all feedback as dictionaries."""
    with get_connection(db_path) as connection:
        rows = connection.execute(
            "SELECT * FROM feedback ORDER BY id DESC"
        ).fetchall()

    return [dict(row) for row in rows]


def migrate_projects_table(db_path=None):
    """Safely add missing columns to the selected projects table."""
    required_columns = {
        "contractor": "TEXT DEFAULT ''",
        "revised_end_date": "TEXT",
        "delay_reason": "TEXT DEFAULT ''",
        "status": "TEXT NOT NULL DEFAULT 'Planned'",
        "progress": "INTEGER NOT NULL DEFAULT 0",
    }

    with get_connection(db_path) as connection:
        existing_columns = {
            row["name"]
            for row in connection.execute(
                "PRAGMA table_info(projects)"
            ).fetchall()
        }

        for column, definition in required_columns.items():
            if column not in existing_columns:
                connection.execute(
                    f"ALTER TABLE projects ADD COLUMN "
                    f"{column} {definition}"
                )
                print(f"Added missing column: {column}")

    print("Projects table migration completed.")


if __name__ == "__main__":
    init_db()
    print("Projects:", get_all_projects())
    print("Feedback:", get_all_feedback())
