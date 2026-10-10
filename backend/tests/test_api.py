
import os
import sys
import sqlite3
import tempfile
import unittest
from unittest.mock import patch

# Make backend modules importable.
BACKEND_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

import app as civic_app


class CivicTrackAPITests(unittest.TestCase):

    def setUp(self):
        # Create an isolated temporary SQLite database.
        temp_file = tempfile.NamedTemporaryFile(
            suffix=".db",
            delete=False
        )
        self.db_file = temp_file.name
        temp_file.close()

        with sqlite3.connect(self.db_file) as con:
            con.executescript("""
                CREATE TABLE projects (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    department TEXT NOT NULL,
                    contractor TEXT DEFAULT '',
                    road TEXT NOT NULL,
                    start_date TEXT NOT NULL,
                    end_date TEXT NOT NULL,
                    original_end_date TEXT NOT NULL,
                    revised_end_date TEXT,
                    delay_reason TEXT DEFAULT '',
                    progress INTEGER DEFAULT 0,
                    status TEXT DEFAULT 'Planned'
                );

                CREATE TABLE feedback (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    project_id INTEGER,
                    statement TEXT NOT NULL,
                    original_language TEXT DEFAULT 'auto',
                    preferred_language TEXT DEFAULT 'en',
                    translated_statement TEXT DEFAULT '',
                    status TEXT DEFAULT 'Received',
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                );
            """)

        # Make the application use the temporary database.
        self.db_patcher = patch.object(
            civic_app,
            "DB",
            self.db_file
        )
        self.db_patcher.start()

        self.client = civic_app.app.test_client()

    def tearDown(self):
        self.db_patcher.stop()

        # Remove the temporary database after the test.
        try:
            if os.path.exists(self.db_file):
                os.remove(self.db_file)
        except PermissionError:
            pass

    def insert_project(
        self,
        name,
        department,
        road,
        start_date,
        end_date,
        contractor=""
    ):
        with sqlite3.connect(self.db_file) as con:
            cursor = con.execute("""
                INSERT INTO projects (
                    name,
                    department,
                    contractor,
                    road,
                    start_date,
                    end_date,
                    original_end_date,
                    revised_end_date,
                    delay_reason,
                    progress,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, NULL, '', 0, 'Planned')
            """, (
                name,
                department,
                contractor,
                road,
                start_date,
                end_date,
                end_date
            ))

            return cursor.lastrowid

    # 1. Home endpoint
    def test_home_endpoint(self):
        response = self.client.get("/")

        self.assertEqual(response.status_code, 200)

        data = response.get_json()
        self.assertEqual(data["app"], "CivicTrack")
        self.assertEqual(data["status"], "running")

    # 2. Get projects
    def test_projects_endpoint(self):
        self.insert_project(
            "Test Road Repair",
            "Municipal Corporation",
            "Test Road",
            "2026-10-12",
            "2026-10-20"
        )

        response = self.client.get("/projects")

        self.assertEqual(response.status_code, 200)

        projects = response.get_json()
        self.assertEqual(len(projects), 1)
        self.assertEqual(
            projects[0]["name"],
            "Test Road Repair"
        )

    # 3. Create project
    def test_create_project(self):
        response = self.client.post("/projects", json={
            "name": "Drain Repair",
            "department": "Municipal Corporation",
            "road": "Market Road",
            "start_date": "2026-10-12",
            "end_date": "2026-10-20"
        })

        self.assertEqual(response.status_code, 201)

        projects = self.client.get("/projects").get_json()
        self.assertEqual(len(projects), 1)
        self.assertEqual(projects[0]["name"], "Drain Repair")

    # 4. Validate project dates
    def test_create_project_validation(self):
        response = self.client.post("/projects", json={
            "name": "Invalid Project",
            "department": "Municipal Corporation",
            "road": "Market Road",
            "start_date": "2026-10-20",
            "end_date": "2026-10-12"
        })

        self.assertEqual(response.status_code, 400)

    # 5. Update project
    def test_update_project(self):
        project_id = self.insert_project(
            "Road Repair",
            "Municipal Corporation",
            "Main Road",
            "2026-10-12",
            "2026-10-20"
        )

        response = self.client.patch(
            f"/projects/{project_id}",
            json={
                "progress": 50,
                "status": "In Progress"
            }
        )

        self.assertEqual(response.status_code, 200)

        projects = self.client.get("/projects").get_json()
        project = next(
            p for p in projects if p["id"] == project_id
        )

        self.assertEqual(project["progress"], 50)
        self.assertEqual(project["status"], "In Progress")

    # 6. Detect project conflicts
    
    def test_conflicts_endpoint(self):
        # Start with a clean projects table.
        with sqlite3.connect(self.db_file) as con:
            con.execute("DELETE FROM projects")

        # Insert exactly two projects that overlap on Main Road.
        self.insert_project(
            "Drainage Repair",
            "Municipal Corporation",
            "Main Road",
            "2026-10-12",
            "2026-10-25"
        )

        self.insert_project(
            "Water Pipeline",
            "Water Supply Department",
            "Main Road",
            "2026-10-18",
            "2026-10-30"
        )

        response = self.client.get("/conflicts")

        self.assertEqual(response.status_code, 200)

        data = response.get_json()
        self.assertEqual(data["total_conflicts"], 1)
        self.assertEqual(len(data["alerts"]), 1)
        self.assertEqual(data["alerts"][0]["road"], "Main Road")

    # 7. Submit and retrieve feedback
    def test_feedback_endpoint(self):
        response = self.client.post("/feedback", json={
            "statement": "The road repair work is delayed.",
            "original_language": "en",
            "preferred_language": "en"
        })

        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            response.get_json()["status"],
            "Received"
        )

        feedback_response = self.client.get("/feedback")

        self.assertEqual(feedback_response.status_code, 200)

        feedback = feedback_response.get_json()
        self.assertEqual(len(feedback), 1)
        self.assertEqual(
            feedback[0]["statement"],
            "The road repair work is delayed."
        )

    # 8. Reject empty translation requests
    def test_translate_validation(self):
        response = self.client.post("/translate", json={
            "statement": "   ",
            "source_language": "en",
            "target_language": "te"
        })

        self.assertEqual(response.status_code, 400)

    # 9. Successful translation
    def test_translate_success(self):
        with patch.object(
            civic_app,
            "GoogleTranslator"
        ) as translator_class:

            translator_class.return_value.translate.return_value = (
                "అనువాద పరీక్ష"
            )

            response = self.client.post("/translate", json={
                "statement": "Translation test",
                "source_language": "en",
                "target_language": "te"
            })

        self.assertEqual(response.status_code, 200)

        data = response.get_json()
        self.assertEqual(data["original"], "Translation test")
        self.assertEqual(data["translation"], "అనువాద పరీక్ష")
        self.assertEqual(data["target_language"], "te")

    # 10. Translation service failure
    def test_translate_service_failure(self):
        with patch.object(
            civic_app,
            "GoogleTranslator",
            side_effect=Exception("Service unavailable")
        ):
            response = self.client.post("/translate", json={
                "statement": "Translation test",
                "source_language": "en",
                "target_language": "te"
            })

        self.assertEqual(response.status_code, 503)

        data = response.get_json()
        self.assertIsNone(data["translation"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
