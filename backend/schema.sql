
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    contractor TEXT DEFAULT '',
    road TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    revised_end_date TEXT,
    delay_reason TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Planned',
    progress INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    statement TEXT NOT NULL,
    original_language TEXT DEFAULT 'en',
    preferred_language TEXT DEFAULT 'en',
    translated_statement TEXT,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);
