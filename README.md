# CivicTrack

A multilingual civic platform for transparent public works tracking and offline civic reporting.

## 1. Problem Statement

Scattered public works information makes it difficult for citizens to track project progress, deadlines, and delays or report civic issues. Language barriers and unreliable internet connectivity further limit access to civic information and reporting.

## 2. Proposed Solution 

CivicTrack centralizes public works information, tracks deadlines and delays, and enables citizens to report local problems and share feedback. **Multilingual support and offline-first reporting** let users access information in their preferred language and save reports without an internet connection.

## 3. Main Features

- **Project Dashboard & Statistics:** View project progress, status, deadlines, and statistics.
- **Project Search, Filtering & Details:** Find projects and explore their information.
- **Deadline Tracking & Delay Alerts:** Identify overdue projects through alerts, status badges, and visual indicators.
- **Civic Problem Reporting & Feedback:** Report local issues and submit feedback and experience ratings.
- **OFFLINE REPORTING & SYNCHRONIZATION:** Save reports without internet, view pending reports in the Local Outbox, and synchronize them when connectivity returns.
- **MULTILINGUAL SUPPORT:** Use the interface in **English, Hindi, Telugu, and Tamil**.
- **Local Translation Cache:** Reuse cached translations offline; new translations requiring an external service need internet access.
- **Navigation Bar:** Easily access projects, reports, and other features.

## 4. Technologies Used

- **React** – For building the interactive citizen-facing user interface.
- **Vite** – For frontend development and running the local development server.
- **JavaScript** – For application logic and user interactions.
- **HTML5 and CSS3** – For structuring and styling the user interface.
- **Browser LocalStorage** – For storing prototype data locally in the browser.
- **Python and Flask** – For developing the backend API and handling citizen reports.
- **SQLite** – For storing application data in a database.
- **Git and GitHub** – For version control, collaboration, and source code hosting.
- **Vercel** – For frontend deployment.

## 5. Instructions to Run the Project

### Prerequisites

Install the following software:

- Node.js and npm
- Git
- Python 3

### A. Clone the Repository

Open a terminal and execute:

```bash
git clone -b srinidhi_civicTrack https://github.com/rishikakarra2008-a11y/CivicTrack.git
```

Navigate to the frontend folder:

```bash
cd CivicTrack/citizen-app
```

### B. Install Frontend Dependencies

Run:

```bash
npm install
```

### C. Start the Frontend Development Server

Run:

```bash
npm run dev
```

Open the local URL displayed in the terminal, usually something like `http://localhost:5173/`. The actual port may differ.

### D. Start the Backend

Open a second terminal from the repository root and install the Python dependencies:

```bash
cd backend
pip install -r requirements.txt
```

Return to the repository root:

```bash
cd ..
```

Start the Flask backend:

```bash
python app.py
```

The backend runs at the address and port configured in `app.py`.

### E. Access the Application

Open the frontend URL displayed by Vite in your browser. Ensure the backend is running and that the frontend API URL and backend CORS configuration match your environment.
