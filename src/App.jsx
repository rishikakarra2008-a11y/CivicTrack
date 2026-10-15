import { getReports, saveReport } from "./offlineStore";
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const initialProjects = [
  {
    id: 1,
    name: "Road Repair",
    category: "Road",
    location: "Zone 1",
    description:
      "Repair damaged road surfaces and improve pedestrian safety.",
    budget: "₹12,00,000",
    contractor: "City Roads Department",
    startDate: "2026-08-01",
    deadline: "2026-10-05",
    progress: 60,
    status: "In Progress",
  },
  {
    id: 2,
    name: "Drainage Improvement",
    category: "Drainage",
    location: "Zone 2",
    description:
      "Improve stormwater drainage and reduce waterlogging.",
    budget: "₹8,50,000",
    contractor: "Public Works Department",
    startDate: "2026-08-15",
    deadline: "2026-10-25",
    progress: 30,
    status: "In Progress",
  },
  {
    id: 3,
    name: "Water Pipeline Work",
    category: "Pipeline",
    location: "Zone 3",
    description:
      "Upgrade the local water pipeline and inspect connections.",
    budget: "₹15,00,000",
    contractor: "Water Supply Department",
    startDate: "2026-06-01",
    deadline: "2026-09-20",
    progress: 100,
    status: "Completed",
  },
  {
    id: 4,
    name: "Streetlight Installation",
    category: "Electrical",
    location: "Zone 4",
    description:
      "Install and test energy-efficient streetlights.",
    budget: "₹5,00,000",
    contractor: "City Electrical Division",
    startDate: "2026-10-12",
    deadline: "2026-11-30",
    progress: 0,
    status: "Not Started",
  },
];

const translations = {
  English: {
    brand: "CivicTrack",
    subtitle: "Public works. Visible progress.",
    dashboard: "Project Dashboard",
    search: "Search project or location...",
    all: "All Statuses",
    notStarted: "Not Started",
    inProgress: "In Progress",
    delayed: "Delayed",
    completed: "Completed",
    projects: "Public Projects",
    details: "View Details",
    progress: "Work completed",
    deadline: "Deadline",
    report: "Report a Civic Problem",
    feedback: "Citizen Experiences",
    feedbackHint: "Share your experience or suggestion.",
    category: "Problem category",
    location: "Location / Zone",
    description: "Describe the problem",
    submit: "Save Report",
    name: "Your name (optional)",
    rating: "Your experience",
    comment: "Feedback or suggestion",
    sendFeedback: "Save Feedback",
    pending: "Pending Sync",
    local: "Saved on this device",
    cached: "Cached translation",
    online: "Translation ready",
    noProjects: "No matching projects found.",
    deadlinePassed: "Deadline passed",
    daysLeft: "days remaining",
    detailsTitle: "Project Details",
    budget: "Budget",
    contractor: "Department / Contractor",
    startDate: "Start date",
    status: "Status",
    close: "Close",
    reportList: "Your Reports",
    feedbackList: "Submitted Feedback",
    noReports: "No reports submitted yet.",
    noFeedback: "No feedback submitted yet.",
    selectLanguage: "Language",
    stars: "Rating (1–5)",
    syncNote: "Reports are stored locally until a backend is connected.",
    cacheNote: "Previously saved translations can be shown without a network request.",
  },
 
  te: {
  brand: "CivicTrack",
  subtitle: "ప్రజా పనులు. పారదర్శక పురోగతి.",

  // Dashboard
  dashboard: "ప్రాజెక్టుల డాష్‌బోర్డ్",
  search: "ప్రాజెక్ట్ లేదా ప్రాంతం కోసం వెతకండి...",
  all: "అన్ని స్థితులు",
  allStatuses: "అన్ని స్థితులు",
  notStarted: "ప్రారంభం కాలేదు",
  inProgress: "పనులు జరుగుతున్నాయి",
  delayed: "ఆలస్యం",
  completed: "పూర్తయింది",
  projects: "ప్రజా ప్రాజెక్టులు",
  details: "వివరాలను చూడండి",
  progress: "పని పురోగతి",
  deadline: "గడువు తేదీ",
  detailsTitle: "ప్రాజెక్ట్ వివరాలు",
  budget: "బడ్జెట్",
  contractor: "శాఖ / కాంట్రాక్టర్",
  startDate: "ప్రారంభ తేదీ",
  status: "స్థితి",
  close: "మూసివేయండి",

  // Language
  language: "భాష",
  selectLanguage: "భాషను ఎంచుకోండి",

  // Civic issue reporting
  report: "పౌర సమస్యను నివేదించండి",
  category: "సమస్య వర్గం",
  problemCategory: "సమస్య వర్గం",
  location: "ప్రాంతం / స్థానం",
  description: "సమస్యను వివరించండి",
  describeProblem: "సమస్యను వివరించండి",
  submit: "నివేదికను సేవ్ చేయండి",
  saveReport: "నివేదికను సేవ్ చేయండి",
  name: "మీ పేరు (ఐచ్ఛికం)",

  // Issue categories
  road: "రోడ్డు సమస్య",
  drainage: "మురుగు కాలువ సమస్య",
  water: "నీటి సమస్య",
  other: "ఇతర సమస్య",

  // Citizen feedback
  feedback: "పౌరుల అభిప్రాయాలు",
  experiences: "పౌరుల అనుభవాలు",
  feedbackHint: "మీ అనుభవం లేదా సూచనను పంచుకోండి.",
  rating: "మీ అనుభవం",
  stars: "రేటింగ్ (1–5)",
  comment: "అభిప్రాయం లేదా సూచన",
  sendFeedback: "అభిప్రాయాన్ని సేవ్ చేయండి",

  // Saved reports and synchronization
  pending: "సింక్ పెండింగ్‌లో ఉంది",
  pendingSync: "సింక్ కోసం వేచి ఉంది",
  local: "ఈ పరికరంలో సేవ్ చేయబడింది",
  reportList: "మీ నివేదికలు",
  yourReports: "మీ నివేదికలు",
  feedbackList: "సమర్పించిన అభిప్రాయాలు",
  noReports: "ఇంకా నివేదికలు లేవు.",
  noFeedback: "ఇంకా అభిప్రాయాలు లేవు.",
  syncNote: "సర్వర్‌కు కనెక్ట్ అయ్యే వరకు నివేదికలు ఈ పరికరంలో సేవ్ చేయబడతాయి.",

  // Translation and offline messages
  cached: "క్యాష్‌లో సేవ్ చేసిన అనువాదం",
  online: "అనువాదం అందుబాటులో ఉంది",
  cacheNote: "ముందుగా సేవ్ చేసిన అనువాదాలను ఇంటర్నెట్ లేకుండానే చూపించవచ్చు.",

  // Other messages
  noProjects: "సరిపోలే ప్రాజెక్టులు ఏవీ లేవు.",
  deadlinePassed: "గడువు తేదీ దాటిపోయింది",
  daysLeft: "మిగిలిన రోజులు",
},

  Tamil: {
    brand: "CivicTrack",
    subtitle: "பொதுப் பணிகள். வெளிப்படையான முன்னேற்றம்.",
    dashboard: "திட்டப் பலகை",
    search: "திட்டம் அல்லது இடத்தைத் தேடுங்கள்...",
    all: "அனைத்து நிலைகளும்",
    notStarted: "தொடங்கவில்லை",
    inProgress: "நடைபெறுகிறது",
    delayed: "தாமதம்",
    completed: "முடிந்தது",
    projects: "பொதுத் திட்டங்கள்",
    details: "விவரங்களைப் பார்க்க",
    progress: "பணி நிறைவு",
    deadline: "கடைசி தேதி",
    report: "குடிமைப் பிரச்சினையைப் புகாரளிக்கவும்",
    feedback: "குடிமக்கள் கருத்துகள்",
    feedbackHint: "உங்கள் அனுபவம் அல்லது பரிந்துரையைப் பகிரவும்.",
    category: "பிரச்சினை வகை",
    location: "இடம் / மண்டலம்",
    description: "பிரச்சினையை விவரிக்கவும்",
    submit: "புகாரைச் சேமிக்கவும்",
    name: "உங்கள் பெயர் (விருப்பம்)",
    rating: "உங்கள் அனுபவம்",
    comment: "கருத்து அல்லது பரிந்துரை",
    sendFeedback: "கருத்தைச் சேமிக்கவும்",
    pending: "ஒத்திசைவு நிலுவையில்",
    local: "இந்தச் சாதனத்தில் சேமிக்கப்பட்டது",
    cached: "தற்காலிகமாகச் சேமித்த மொழிபெயர்ப்பு",
    online: "மொழிபெயர்ப்பு தயார்",
    noProjects: "பொருந்தும் திட்டங்கள் இல்லை.",
    deadlinePassed: "கடைசி தேதி கடந்தது",
    daysLeft: "நாட்கள் மீதமுள்ளன",
    detailsTitle: "திட்ட விவரங்கள்",
    budget: "பட்ஜெட்",
    contractor: "துறை / ஒப்பந்ததாரர்",
    startDate: "தொடக்க தேதி",
    status: "நிலை",
    close: "மூடு",
    reportList: "உங்கள் புகார்கள்",
    feedbackList: "சமர்ப்பித்த கருத்துகள்",
    noReports: "இன்னும் புகார்கள் இல்லை.",
    noFeedback: "இன்னும் கருத்துகள் இல்லை.",
    selectLanguage: "மொழி",
    stars: "மதிப்பீடு (1–5)",
    syncNote: "சேவையகம் இணைக்கப்படும் வரை புகார்கள் இந்தச் சாதனத்தில் சேமிக்கப்படும்.",
    cacheNote: "முன்பு சேமித்த மொழிபெயர்ப்புகளை இணையக் கோரிக்கையின்றி காட்டலாம்.",
  },
  Hindi: {
    brand: "CivicTrack",
    subtitle: "सार्वजनिक कार्य। पारदर्शी प्रगति।",
    dashboard: "परियोजना डैशबोर्ड",
    search: "परियोजना या स्थान खोजें...",
    all: "सभी स्थितियाँ",
    notStarted: "शुरू नहीं हुआ",
    inProgress: "कार्य प्रगति पर",
    delayed: "देरी",
    completed: "पूरा हुआ",
    projects: "सार्वजनिक परियोजनाएँ",
    details: "विवरण देखें",
    progress: "कार्य पूरा",
    deadline: "अंतिम तिथि",
    report: "नागरिक समस्या की रिपोर्ट करें",
    feedback: "नागरिक अनुभव",
    feedbackHint: "अपना अनुभव या सुझाव साझा करें।",
    category: "समस्या की श्रेणी",
    location: "स्थान / ज़ोन",
    description: "समस्या का विवरण",
    submit: "रिपोर्ट सहेजें",
    name: "आपका नाम (वैकल्पिक)",
    rating: "आपका अनुभव",
    comment: "प्रतिक्रिया या सुझाव",
    sendFeedback: "प्रतिक्रिया सहेजें",
    pending: "सिंक लंबित",
    local: "इस डिवाइस पर सहेजा गया",
    cached: "कैश किया गया अनुवाद",
    online: "अनुवाद उपलब्ध",
    noProjects: "कोई मिलती-जुलती परियोजना नहीं मिली।",
    deadlinePassed: "अंतिम तिथि बीत गई",
    daysLeft: "दिन शेष",
    detailsTitle: "परियोजना विवरण",
    budget: "बजट",
    contractor: "विभाग / ठेकेदार",
    startDate: "शुरुआत की तारीख",
    status: "स्थिति",
    close: "बंद करें",
    reportList: "आपकी रिपोर्टें",
    feedbackList: "जमा की गई प्रतिक्रियाएँ",
    noReports: "अभी तक कोई रिपोर्ट नहीं है।",
    noFeedback: "अभी तक कोई प्रतिक्रिया नहीं है।",
    selectLanguage: "भाषा",
    stars: "रेटिंग (1–5)",
    syncNote: "बैकएंड जुड़ने तक रिपोर्ट इसी डिवाइस पर रहेंगी।",
    cacheNote: "पहले से सहेजे गए अनुवाद बिना नेटवर्क अनुरोध के दिखाए जा सकते हैं।",
  },
};

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function getProjectStatus(project) {
  if (project.progress >= 100 || project.status === "Completed") {
    return "Completed";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(`${project.deadline}T00:00:00`);

  if (
    project.deadline &&
    !Number.isNaN(deadline.getTime()) &&
    deadline < today
  ) {
    return "Delayed";
  }

  return project.status === "Not Started" && project.progress === 0
    ? "Not Started"
    : "In Progress";
}

function getDeadlineMessage(project, t) {
  if (getProjectStatus(project) === "Completed") return t.completed;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(`${project.deadline}T00:00:00`);
  const days = Math.ceil((deadline - today) / 86400000);

  if (days < 0) return `${t.deadlinePassed} (${Math.abs(days)} days)`;
  if (days === 0) return "Due today";
  return `${days} ${t.daysLeft}`;
}

function App() {
  const [projects] = useState(() =>
    readStorage("civictrack-projects", initialProjects)
  );
  const [photos, setPhotos] = useState([]);
const [isOnline, setIsOnline] = useState(navigator.onLine);
const [storageReady, setStorageReady] = useState(false);
const [storageError, setStorageError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [selectedProject, setSelectedProject] = useState(null);

  const [language, setLanguage] = useState(() =>
    readStorage("civictrack-language", "English")
  );
  const [translationCache, setTranslationCache] = useState(() =>
    readStorage("civictrack-translations", translations)
  );

  const [reports, setReports] = useState(() =>
    readStorage("civictrack-reports", [])
  );
  const [feedbackList, setFeedbackList] = useState(() =>
    readStorage("civictrack-feedback", [])
  );

  const [reportForm, setReportForm] = useState({
    category: "Road",
    location: "",
    description: "",
  });
  const [feedbackForm, setFeedbackForm] = useState({
    name: "",
    rating: "5",
    comment: "",
  });
  const [notice, setNotice] = useState("");

  const t = translationCache[language] || translations.English;

  useEffect(() => {
    saveStorage("civictrack-projects", projects);
  }, [projects]);

  useEffect(() => {
    saveStorage("civictrack-language", language);
  }, [language]);

  useEffect(() => {
    saveStorage("civictrack-translations", translationCache);
  }, [translationCache]);

  useEffect(() => {
    saveStorage("civictrack-reports", reports);
  }, [reports]);

  useEffect(() => {
    saveStorage("civictrack-feedback", feedbackList);
  }, [feedbackList]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        project.name.toLowerCase().includes(query) ||
        project.location.toLowerCase().includes(query) ||
        project.category.toLowerCase().includes(query);

      const status = getProjectStatus(project);
      const matchesStatus =
        statusFilter === "All Statuses" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

async function changeLanguage(nextLanguage) {
  const languageCodes = {
    English: "en",
    Tamil: "ta",
    Hindi: "hi",
    Telugu: "te",
  };

  const code = languageCodes[nextLanguage];

  if (!code) {
    setNotice("Unsupported language");
    return;
  }

  setNotice("Loading language...");

  try {
    const response = await fetch(
      `http://10.173.118.16:5000/ui-translations?language=${code}`
    );

    if (!response.ok) {
      throw new Error("Backend request failed");
    }

    const data = await response.json();

    if (!data.translations) {
      throw new Error("Translations were not returned");
    }

    const backend = data.translations;

    // Map backend keys to the names used by the frontend.
    const mapped = {
      ...translations.English,
      brand: backend.brand,
      subtitle: backend.subtitle,
      dashboard: backend.dashboard,
      projects: backend.projects,
      report: backend.report,
      feedback: backend.feedback,
      search: backend.search,
      details: backend.details,
      progress: backend.progress,
      deadline: backend.deadline,
      category: backend.category,
      location: backend.location,
      description: backend.description,
      submit: backend.submit,
      name: backend.name,
      rating: backend.rating,
      comment: backend.comment,
      sendFeedback: backend.sendFeedback,
      selectLanguage: backend.selectLanguage,
      close: backend.close,
    };

    setTranslationCache((current) => ({
      ...current,
      [nextLanguage]: mapped,
    }));

    setLanguage(nextLanguage);
    setNotice(`${nextLanguage} loaded from backend`);
  } catch (error) {
    console.error("Language loading failed:", error);
    setNotice("Could not load language. Check the backend connection.");
  }
}

  function submitReport(event) {
    event.preventDefault();

    const report = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      ...reportForm,
      createdAt: new Date().toISOString(),
      syncStatus: "Pending Sync",
    };

    setReports((current) => [report, ...current]);
    setReportForm({
      category: "Road",
      location: "",
      description: "",
    });
    setNotice("Report saved on this device. Sync is pending.");
  }

  function submitFeedback(event) {
    event.preventDefault();

    const feedback = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      ...feedbackForm,
      rating: Number(feedbackForm.rating),
      createdAt: new Date().toISOString(),
      syncStatus: "Pending Sync",
    };

    setFeedbackList((current) => [feedback, ...current]);
    setFeedbackForm({ name: "", rating: "5", comment: "" });
    setNotice("Feedback saved on this device. Sync is pending.");
  }

  const pendingCount =
    reports.filter((item) => item.syncStatus === "Pending Sync").length +
    feedbackList.filter((item) => item.syncStatus === "Pending Sync").length;

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home">
          <span className="brand-mark">C</span>
          <span>
            <strong>{t.brand}</strong>
            <small>{t.subtitle}</small>
          </span>
        </a>

        <nav className="nav-links">
          <a href="#projects">{t.dashboard}</a>
          <a href="#report">{t.report}</a>
          <a href="#feedback">{t.feedback}</a>
        </nav>

        <label className="language-picker">
          <span>{t.selectLanguage}</span>
          <select
            value={language}
            onChange={(event) => changeLanguage(event.target.value)}
            aria-label={t.selectLanguage}
          >
            <option value="English">English</option>
            <option value="Tamil">தமிழ் (Tamil)</option>
            <option value="Hindi">हिन्दी (Hindi)</option>
            <option value="te">తెలుగు</option>
          </select>
        </label>
      </header>

      <main>
        <section className="welcome-panel" id="home">
          <div>
            <p className="eyebrow">CITIZEN TRANSPARENCY PORTAL</p>
            <h1>Know what is happening in your neighbourhood.</h1>
            <p>
              Track public projects, check deadlines, and share your experience
              with your community.
            </p>
            <a className="primary-button" href="#projects">
              Explore Projects
            </a>
          </div>

          <div className="welcome-stats">
            <div>
              <strong>{projects.length}</strong>
              <span>Projects</span>
            </div>
            <div>
              <strong>
                {projects.filter((p) => getProjectStatus(p) === "Delayed").length}
              </strong>
              <span>Delayed</span>
            </div>
            <div>
              <strong>
                {projects.filter((p) => getProjectStatus(p) === "Completed").length}
              </strong>
              <span>Completed</span>
            </div>
          </div>
        </section>

        <section className="section" id="projects">
          <div className="section-heading">
            <div>
              <p className="eyebrow">PUBLIC WORKS</p>
              <h2>{t.projects}</h2>
              <p>Search projects and filter them by their current status.</p>
            </div>
            <span className="result-count">
              {filteredProjects.length} results
            </span>
          </div>

          <div className="filters">
            <input
              type="search"
              placeholder={t.search}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter projects by status"
            >
              <option value="All Statuses">{t.all}</option>
              <option value="Not Started">{t.notStarted}</option>
              <option value="In Progress">{t.inProgress}</option>
              <option value="Delayed">{t.delayed}</option>
              <option value="Completed">{t.completed}</option>
            </select>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="empty-state">{t.noProjects}</div>
          ) : (
            <div className="project-grid">
              {filteredProjects.map((project) => {
                const status = getProjectStatus(project);

                return (
                  <article className="project-card" key={project.id}>
                    <div className="card-topline">
                      <span className="category-label">{project.category}</span>
                      <span
                        className={`status-badge ${status
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {t[
                          status === "Not Started"
                            ? "notStarted"
                            : status === "In Progress"
                              ? "inProgress"
                              : status.toLowerCase()
                        ]}
                      </span>
                    </div>

                    <h3>{project.name}</h3>
                    <p className="project-location">📍 {project.location}</p>

                    <div className="progress-label">
                      <span>{t.progress}</span>
                      <strong>{project.progress}%</strong>
                    </div>
                    <div
                      className="progress-track"
                      role="progressbar"
                      aria-valuenow={project.progress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-label={`${project.name} progress`}
                    >
                      <div
                        className="progress-fill"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>

                    <div className="deadline-line">
                      <span>{t.deadline}</span>
                      <strong
                        className={status === "Delayed" ? "overdue-text" : ""}
                      >
                        {project.deadline}
                      </strong>
                    </div>
                    <p
                      className={`deadline-message ${
                        status === "Delayed" ? "overdue-text" : ""
                      }`}
                    >
                      {getDeadlineMessage(project, t)}
                    </p>

                    <button
                      className="secondary-button full-width"
                      onClick={() => setSelectedProject(project)}
                    >
                      {t.details}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="section two-column" id="report">
          <div className="section-intro">
            <p className="eyebrow">CITIZEN PARTICIPATION</p>
            <h2>{t.report}</h2>
            <p>
              Notice a road, drainage, or pipeline problem? Save a report so it
              can be sent to the server when sync is available.
            </p>
            <div className="info-note">
              <strong>{t.pending}: {pendingCount}</strong>
              <span>{t.syncNote}</span>
            </div>
          </div>

          <form className="form-card" onSubmit={submitReport}>
            <h3>{t.report}</h3>

            <label>
              {t.category}
              <select
                value={reportForm.category}
                onChange={(event) =>
                  setReportForm({ ...reportForm, category: event.target.value })
                }
              >
                <option>Road</option>
                <option>Drainage</option>
                <option>Pipeline</option>
                <option>Streetlight</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              {t.location}
              <input
                required
                value={reportForm.location}
                onChange={(event) =>
                  setReportForm({ ...reportForm, location: event.target.value })
                }
                placeholder="e.g. Zone 1, Main Road"
              />
            </label>

            <label>
              {t.description}
              <textarea
                required
                minLength={8}
                rows={4}
                value={reportForm.description}
                onChange={(event) =>
                  setReportForm({
                    ...reportForm,
                    description: event.target.value,
                  })
                }
                placeholder="Explain what needs attention..."
              />
            </label>

            <button className="primary-button" type="submit">
              {t.submit}
            </button>
          </form>
        </section>

        <section className="section" id="my-reports">
          <div className="section-heading">
            <div>
              <p className="eyebrow">LOCAL OUTBOX</p>
              <h2>{t.reportList}</h2>
            </div>
            <span className="sync-pill">
              {pendingCount} {t.pending}
            </span>
          </div>

          {reports.length === 0 ? (
            <div className="empty-state">{t.noReports}</div>
          ) : (
            <div className="submission-list">
              {reports.map((report) => (
                <article className="submission-card" key={report.id}>
                  <div>
                    <span className="category-label">{report.category}</span>
                    <h3>{report.location}</h3>
                    <p>{report.description}</p>
                    <small>
                      Saved {new Date(report.createdAt).toLocaleString()}
                    </small>
                  </div>
                  <span className="status-badge pending-badge">
                    {report.syncStatus}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="section two-column" id="feedback">
          <div className="section-intro">
            <p className="eyebrow">YOUR VOICE MATTERS</p>
            <h2>{t.feedback}</h2>
            <p>{t.feedbackHint}</p>
            <div className="info-note">
              <strong>{t.cached}</strong>
              <span>{t.cacheNote}</span>
            </div>
          </div>

          <form className="form-card" onSubmit={submitFeedback}>
            <h3>{t.feedback}</h3>

            <label>
              {t.name}
              <input
                value={feedbackForm.name}
                onChange={(event) =>
                  setFeedbackForm({ ...feedbackForm, name: event.target.value })
                }
                placeholder="Anonymous citizen"
              />
            </label>

            <label>
              {t.rating}
              <select
                value={feedbackForm.rating}
                onChange={(event) =>
                  setFeedbackForm({
                    ...feedbackForm,
                    rating: event.target.value,
                  })
                }
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Average</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Very poor</option>
              </select>
            </label>

            <label>
              {t.comment}
              <textarea
                required
                minLength={5}
                rows={4}
                value={feedbackForm.comment}
                onChange={(event) =>
                  setFeedbackForm({
                    ...feedbackForm,
                    comment: event.target.value,
                  })
                }
                placeholder="Share your experience or suggestion..."
              />
            </label>

            <button className="primary-button" type="submit">
              {t.sendFeedback}
            </button>
          </form>
        </section>

        <section className="section" id="feedback-history">
          <div className="section-heading">
            <div>
              <p className="eyebrow">COMMUNITY VOICES</p>
              <h2>{t.feedbackList}</h2>
            </div>
          </div>

          {feedbackList.length === 0 ? (
            <div className="empty-state">{t.noFeedback}</div>
          ) : (
            <div className="feedback-grid">
              {feedbackList.map((feedback) => (
                <article className="feedback-card" key={feedback.id}>
                  <div className="feedback-topline">
                    <strong>{feedback.name.trim() || "Anonymous citizen"}</strong>
                    <span className="rating">★ {feedback.rating}/5</span>
                  </div>
                  <p>{feedback.comment}</p>
                  <small>
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </small>
                  <span className="status-badge pending-badge">
                    {feedback.syncStatus}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="footer">
          <strong>CivicTrack</strong>
          <span>Local-first citizen transparency demo</span>
          <span>{t.local} · {t.cached}</span>
        </footer>
      </main>

      {notice && (
        <div className="toast" role="status">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss message">
            ×
          </button>
        </div>
      )}

      {selectedProject && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedProject(null)}
          role="presentation"
        >
          <section
            className="details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="details-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow">{selectedProject.category}</p>
                <h2 id="details-title">{selectedProject.name}</h2>
              </div>
              <button
                className="close-button"
                onClick={() => setSelectedProject(null)}
                aria-label={t.close}
              >
                ×
              </button>
            </div>

            <p>{selectedProject.description}</p>

            <div className="detail-grid">
              <div>
                <span>{t.status}</span>
                <strong>{getProjectStatus(selectedProject)}</strong>
              </div>
              <div>
                <span>{t.progress}</span>
                <strong>{selectedProject.progress}%</strong>
              </div>
              <div>
                <span>{t.location}</span>
                <strong>{selectedProject.location}</strong>
              </div>
              <div>
                <span>{t.budget}</span>
                <strong>{selectedProject.budget}</strong>
              </div>
              <div>
                <span>{t.contractor}</span>
                <strong>{selectedProject.contractor}</strong>
              </div>
              <div>
                <span>{t.startDate}</span>
                <strong>{selectedProject.startDate}</strong>
              </div>
              <div>
                <span>{t.deadline}</span>
                <strong>{selectedProject.deadline}</strong>
              </div>
              <div>
                <span>Deadline status</span>
                <strong>{getDeadlineMessage(selectedProject, t)}</strong>
              </div>
            </div>

            <button
              className="primary-button full-width"
              onClick={() => setSelectedProject(null)}
            >
              {t.close}
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;