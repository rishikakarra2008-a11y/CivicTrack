from flask import Flask, request, jsonify

from flask_cors import CORS


from backend.radar import detect_overlaps

import sqlite3

from datetime import date

from backend.translation import translate_text
from backend.ui_translations import UI_TRANSLATIONS



app = Flask(__name__)

CORS(app, origins=[
    "http://localhost:5177",
    "http://127.0.0.1:5177",
    "http://localhost:5178",
    "http://127.0.0.1:5178",
])



DB = "civictrack.db"





# ---------- DATABASE ----------

def connect_db():

    con = sqlite3.connect(DB)

    con.row_factory = sqlite3.Row

    return con





def init_db():

    with connect_db() as con:

        con.executescript("""

        CREATE TABLE IF NOT EXISTS projects (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT NOT NULL,

            department TEXT NOT NULL,

            road TEXT NOT NULL,

            start_date TEXT NOT NULL,

            end_date TEXT NOT NULL,

            original_end_date TEXT NOT NULL,

            revised_end_date TEXT,

            delay_reason TEXT DEFAULT '',

            progress INTEGER DEFAULT 0,

            status TEXT DEFAULT 'Planned'

        );



        CREATE TABLE IF NOT EXISTS feedback (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            project_id INTEGER,

            statement TEXT NOT NULL,

            original_language TEXT DEFAULT 'auto',

            preferred_language TEXT DEFAULT 'en',

            translated_statement TEXT DEFAULT '',

            status TEXT DEFAULT 'Received',

            created_at TEXT DEFAULT CURRENT_TIMESTAMP

        );

        CREATE TABLE IF NOT EXISTS citizen_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id TEXT UNIQUE,
            category TEXT NOT NULL,
            location TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT DEFAULT 'Received',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        """)





def row_to_dict(row):

    return dict(row)





# ---------- HOME ----------

@app.get("/")

def home():

    return jsonify({

        "app": "CivicTrack",

        "status": "running",

        "features": [

            "Project Dashboard",

            "Coordination Radar",

            "Delay Transparency",

            "Citizen Feedback",

            "Multilingual Translation"

        ]

    })





# ---------- PROJECT DASHBOARD ----------

@app.get("/projects")

def get_projects():

    with connect_db() as con:

        rows = con.execute(

            "SELECT * FROM projects ORDER BY id DESC"

        ).fetchall()



    return jsonify([row_to_dict(row) for row in rows])





# ---------- CREATE PROJECT ----------

@app.post("/projects")

def create_project():

    data = request.get_json(silent=True) or {}



    required = [

        "name", "department", "road",

        "start_date", "end_date"

    ]



    if any(

        not isinstance(data.get(field), str)

        or not data[field].strip()

        for field in required

    ):

        return jsonify({

            "error": "Name, department, road and dates are required"

        }), 400



    try:

        start = date.fromisoformat(data["start_date"])

        end = date.fromisoformat(data["end_date"])

    except ValueError:

        return jsonify({

            "error": "Dates must use YYYY-MM-DD"

        }), 400



    if end < start:

        return jsonify({

            "error": "End date must not precede start date"

        }), 400



    with connect_db() as con:

        cur = con.execute("""

            INSERT INTO projects (

                name, department, road, start_date,

                end_date, original_end_date

            )

            VALUES (?, ?, ?, ?, ?, ?)

        """, (

            data["name"].strip(),

            data["department"].strip(),

            data["road"].strip(),

            start.isoformat(),

            end.isoformat(),

            end.isoformat()

        ))



        project_id = cur.lastrowid



    return jsonify({

        "id": project_id,

        "message": "Project created successfully"

    }), 201





# ---------- UPDATE PROJECT / DELAYS ----------

@app.patch("/projects/<int:project_id>")

def update_project(project_id):

    data = request.get_json(silent=True) or {}



    allowed = {

        "progress", "status",

        "revised_end_date", "delay_reason"

    }



    updates = {

        key: data[key]

        for key in allowed if key in data

    }



    if not updates:

        return jsonify({

            "error": "No fields to update"

        }), 400



    if "progress" in updates:

        try:

            progress = int(updates["progress"])

            if not 0 <= progress <= 100:

                raise ValueError

            updates["progress"] = progress

        except (ValueError, TypeError):

            return jsonify({

                "error": "Progress must be between 0 and 100"

            }), 400



    if "revised_end_date" in updates:

        revised = updates["revised_end_date"]



        if revised is not None and revised != "":

            if not isinstance(revised, str):

                return jsonify({

                    "error": "Invalid revised date"

                }), 400



            try:

                date.fromisoformat(revised)

            except ValueError:

                return jsonify({

                    "error": "Invalid revised date"

                }), 400



    for field in ("status", "delay_reason"):

        if field in updates and not isinstance(updates[field], str):

            return jsonify({

                "error": f"{field} must be text"

            }), 400



    fields = ", ".join(

        f"{key} = ?" for key in updates

    )



    with connect_db() as con:

        cur = con.execute(

            f"UPDATE projects SET {fields} WHERE id = ?",

            list(updates.values()) + [project_id]

        )



        if cur.rowcount == 0:

            return jsonify({

                "error": "Project not found"

            }), 404



    return jsonify({

        "message": "Project updated successfully"

    })





# ---------- COORDINATION RADAR ----------

@app.get("/conflicts")

def get_conflicts():

    try:

        alerts = detect_overlaps(DB)



        return jsonify({

            "total_conflicts": len(alerts),

            "alerts": alerts

        }), 200



    except Exception:

        app.logger.exception("Coordination Radar failed")

        return jsonify({

            "error": "Coordination Radar failed"

        }), 500



# ---------- CITIZEN FEEDBACK ----------

@app.post("/feedback")

def create_feedback():

    data = request.get_json(silent=True) or {}

    statement = data.get("statement", "")



    if not isinstance(statement, str) or not statement.strip():

        return jsonify({

            "error": "Statement is required"

        }), 400



    project_id = data.get("project_id")



    if project_id is not None:

        try:

            project_id = int(project_id)

        except (ValueError, TypeError):

            return jsonify({

                "error": "project_id must be an integer"

            }), 400



        with connect_db() as con:

            exists = con.execute(

                "SELECT id FROM projects WHERE id = ?",

                (project_id,)

            ).fetchone()



        if not exists:

            return jsonify({

                "error": "Project not found"

            }), 404



    original_language = data.get("original_language", "auto")

    preferred_language = data.get("preferred_language", "en")



    if not isinstance(original_language, str) or not isinstance(

        preferred_language, str

    ):

        return jsonify({

            "error": "Language values must be text"

        }), 400



    with connect_db() as con:

        cur = con.execute("""

            INSERT INTO feedback (

                project_id, statement, original_language,

                preferred_language

            )

            VALUES (?, ?, ?, ?)

        """, (

            project_id,

            statement.strip(),

            original_language,

            preferred_language

        ))



        feedback_id = cur.lastrowid



    return jsonify({

        "id": feedback_id,

        "message": "Feedback received",

        "status": "Received"

    }), 201





@app.get("/feedback")

def get_feedback():

    with connect_db() as con:

        rows = con.execute(

            "SELECT * FROM feedback ORDER BY id DESC"

        ).fetchall()



    return jsonify([

        row_to_dict(row) for row in rows

    ])





@app.patch("/feedback/<int:feedback_id>")

def update_feedback(feedback_id):

    data = request.get_json(silent=True) or {}

    status = data.get("status", "")



    allowed_statuses = {

        "Received",

        "Under Review",

        "In Progress",

        "Resolved",

        "Rejected"

    }



    if not isinstance(status, str) or status not in allowed_statuses:

        return jsonify({

            "error": "Invalid feedback status"

        }), 400



    with connect_db() as con:

        cur = con.execute(

            "UPDATE feedback SET status = ? WHERE id = ?",

            (status, feedback_id)

        )



        if cur.rowcount == 0:

            return jsonify({

                "error": "Feedback not found"

            }), 404



    return jsonify({

        "message": "Feedback status updated"

    })





# ---------- CITIZEN REPORTS ----------

@app.post("/reports")
def create_report():
    """Save a citizen report. client_id makes offline retries idempotent."""
    data = request.get_json(silent=True) or {}

    client_id = data.get("id", data.get("client_id"))
    category = data.get("category")
    location = data.get("location")
    description = data.get("description")

    for field, value in {
        "category": category,
        "location": location,
        "description": description,
    }.items():
        if not isinstance(value, str) or not value.strip():
            return jsonify({"error": f"{field} is required"}), 400

    if client_id is not None and (
        not isinstance(client_id, str) or not client_id.strip()
    ):
        return jsonify({"error": "id must be a non-empty string"}), 400

    with connect_db() as con:
        if client_id:
            con.execute("""
                INSERT OR IGNORE INTO citizen_reports
                    (client_id, category, location, description)
                VALUES (?, ?, ?, ?)
            """, (
                client_id.strip(), category.strip(),
                location.strip(), description.strip()
            ))
            row = con.execute("""
                SELECT id, client_id, category, location, description,
                       status, created_at
                FROM citizen_reports WHERE client_id = ?
            """, (client_id.strip(),)).fetchone()
        else:
            cur = con.execute("""
                INSERT INTO citizen_reports (category, location, description)
                VALUES (?, ?, ?)
            """, (category.strip(), location.strip(), description.strip()))
            row = con.execute("""
                SELECT id, client_id, category, location, description,
                       status, created_at
                FROM citizen_reports WHERE id = ?
            """, (cur.lastrowid,)).fetchone()

    return jsonify({
        "message": "Report received",
        "report": row_to_dict(row),
        "status": "Received",
    }), 201


@app.get("/reports")
def get_reports():
    with connect_db() as con:
        rows = con.execute(
            "SELECT * FROM citizen_reports ORDER BY id DESC"
        ).fetchall()
    return jsonify([row_to_dict(row) for row in rows]), 200


# ---------- MULTILINGUAL TRANSLATION ----------

@app.post("/translate")
def translate_statement():
    data = request.get_json(silent=True) or {}

    # Accept both field names to support existing frontend/test clients.
    statement = data.get("statement", data.get("text", ""))
    source = data.get("source_language", "auto")
    target = data.get("target_language", "en")

    if not isinstance(statement, str) or not statement.strip():
        return jsonify({"error": "Statement is required"}), 400

    if not isinstance(source, str) or not isinstance(target, str):
        return jsonify({"error": "Language codes must be text"}), 400

    supported_languages = {"en", "ta", "hi", "te"}
    if target not in supported_languages:
        return jsonify({"error": "Unsupported target language"}), 400
    if source != "auto" and source not in supported_languages:
        return jsonify({"error": "Unsupported source language"}), 400

    statement = statement.strip()

    try:
        translated = translate_text(
            statement,
            source_language=source,
            target_language=target,
        )
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except RuntimeError:
        app.logger.exception("Translation failed")
        return jsonify({
            "error": "Translation unavailable. Please retry when internet is available.",
            "original": statement,
            "translation": None,
            "original_text": statement,
            "translated_text": None,
            "source_language": source,
            "target_language": target,
        }), 503

    # Include both response naming styles for frontend compatibility.
    return jsonify({
        "original": statement,
        "translation": translated,
        "original_text": statement,
        "translated_text": translated,
        "source_language": source,
        "target_language": target,
    }), 200


# ---------- FRONTEND UI TRANSLATIONS ----------

@app.get("/ui-translations")
def get_ui_translations():
    language = request.args.get("language", "en")
    if language not in {"en", "ta", "hi", "te"}:
        return jsonify({"error": "Unsupported language"}), 400
    return jsonify({
        "language": language,
        "translations": UI_TRANSLATIONS.get(language, UI_TRANSLATIONS["en"]),
    }), 200


# ---------- START SERVER ----------

if __name__ == "__main__":

    init_db()

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
    )
