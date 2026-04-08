import { useState, useEffect } from "react";
import { isSupabaseConfigured, supabase } from "./lib/supabase";

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) || "";
const CLOUD_CONFIG_ERROR =
  "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable cloud accounts and syncing.";

// ─── Legacy localStorage helpers kept for migration ───
const getLegacyUsers = () => {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("markd_users") || "{}"); } catch { return {}; }
};
const getLegacyUserByEmail = (email) => {
  const users = getLegacyUsers();
  return users[email.toLowerCase().trim()] || null;
};
const readLegacyUserStorage = (userId, key, defaultValue) => {
  if (typeof window === "undefined" || !userId) return defaultValue;
  try {
    const stored = localStorage.getItem(`markd_${userId}_${key}`);
    return stored !== null ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const normaliseCalendarUrl = (value) => value.trim().replace(/^webcal:\/\//i, "https://");

// ─── Colour palette for subjects ───
const PALETTE = [
  "#f7a26a", "#7c6af7", "#6af7c4", "#f76a6a", "#f7e96a",
  "#6ab4f7", "#f76ab8", "#a26af7", "#6af7a2", "#f7cf6a",
];

const EXAM_BOARDS = ["AQA", "Edexcel", "OCR", "WJEC", "Cambridge (CIE)", "IB", "Other"];
const GRADES_GCSE = ["9","8","7","6","5","4","3","2","1"];
const GRADES_IB = ["7","6","5","4","3","2","1"];
const GRADES_IGCSE = ["A*","A","B","C","D","E","F","G"];
const GRADES = ["9","8","7","6","5","4","3","2","1","A*","A","B","C","D","E","F","G"];
const HORIZONS = ["3 months","6 months","9 months","12 months"];
const PORTFOLIO_TYPES = ["Project","Achievement","Competition","Leadership"];
const TYPE_COLOURS = { Project:"#7c6af7", Achievement:"#6af7c4", Competition:"#f7a26a", Leadership:"#f76ab8" };
const PRIORITY_ORDER = ["urgent", "soon", "later"];
const PRIORITY_META = {
  urgent: { label: "Urgent", color: "var(--danger)" },
  soon: { label: "Soon", color: "var(--accent2)" },
  later: { label: "Later", color: "var(--accent3)" },
};
const DAILY_PLANNER_LIMIT = 6;
const XP_PER_LEVEL = 120;

// ─── Curriculum catalogues ───
const CURRICULA = {
  GCSE: {
    label: "GCSE",
    defaultBoard: "AQA",
    grades: GRADES_GCSE,
    defaultTarget: "5",
    subjects: [
      { name:"English Language", board:"AQA" },
      { name:"English Literature", board:"AQA" },
      { name:"Mathematics", board:"Edexcel" },
      { name:"Further Mathematics", board:"AQA" },
      { name:"Biology", board:"AQA" },
      { name:"Chemistry", board:"AQA" },
      { name:"Physics", board:"AQA" },
      { name:"Combined Science", board:"AQA" },
      { name:"History", board:"Edexcel" },
      { name:"Geography", board:"AQA" },
      { name:"Religious Studies", board:"AQA" },
      { name:"French", board:"AQA" },
      { name:"Spanish", board:"AQA" },
      { name:"German", board:"AQA" },
      { name:"Mandarin", board:"AQA" },
      { name:"Urdu", board:"AQA" },
      { name:"Arabic", board:"AQA" },
      { name:"Computer Science", board:"OCR" },
      { name:"ICT", board:"Edexcel" },
      { name:"Art & Design", board:"AQA" },
      { name:"Music", board:"Edexcel" },
      { name:"Drama", board:"AQA" },
      { name:"Media Studies", board:"AQA" },
      { name:"Business Studies", board:"Edexcel" },
      { name:"Economics", board:"Edexcel" },
      { name:"Physical Education", board:"AQA" },
      { name:"Design & Technology", board:"AQA" },
      { name:"Food Preparation & Nutrition", board:"AQA" },
      { name:"Sociology", board:"AQA" },
      { name:"Psychology", board:"AQA" },
      { name:"Citizenship Studies", board:"AQA" },
      { name:"Astronomy", board:"Edexcel" },
      { name:"Statistics", board:"Edexcel" },
      { name:"Film Studies", board:"WJEC" },
    ],
  },
  IGCSE: {
    label: "IGCSE",
    defaultBoard: "Cambridge (CIE)",
    grades: GRADES_IGCSE,
    defaultTarget: "A",
    subjects: [
      { name:"English - First Language", board:"Cambridge (CIE)" },
      { name:"English - Literature", board:"Cambridge (CIE)" },
      { name:"English - Second Language", board:"Cambridge (CIE)" },
      { name:"Mathematics", board:"Cambridge (CIE)" },
      { name:"Additional Mathematics", board:"Cambridge (CIE)" },
      { name:"International Mathematics", board:"Edexcel" },
      { name:"Biology", board:"Cambridge (CIE)" },
      { name:"Chemistry", board:"Cambridge (CIE)" },
      { name:"Physics", board:"Cambridge (CIE)" },
      { name:"Combined Science", board:"Cambridge (CIE)" },
      { name:"Co-ordinated Sciences", board:"Cambridge (CIE)" },
      { name:"Environmental Management", board:"Cambridge (CIE)" },
      { name:"History", board:"Cambridge (CIE)" },
      { name:"Geography", board:"Cambridge (CIE)" },
      { name:"Economics", board:"Cambridge (CIE)" },
      { name:"Business Studies", board:"Cambridge (CIE)" },
      { name:"Accounting", board:"Cambridge (CIE)" },
      { name:"Computer Science", board:"Cambridge (CIE)" },
      { name:"ICT", board:"Cambridge (CIE)" },
      { name:"Art & Design", board:"Cambridge (CIE)" },
      { name:"Music", board:"Cambridge (CIE)" },
      { name:"Drama", board:"Cambridge (CIE)" },
      { name:"French", board:"Cambridge (CIE)" },
      { name:"Spanish", board:"Cambridge (CIE)" },
      { name:"German", board:"Cambridge (CIE)" },
      { name:"Mandarin Chinese", board:"Cambridge (CIE)" },
      { name:"Hindi", board:"Cambridge (CIE)" },
      { name:"Arabic", board:"Cambridge (CIE)" },
      { name:"Urdu", board:"Cambridge (CIE)" },
      { name:"Global Perspectives", board:"Cambridge (CIE)" },
      { name:"Sociology", board:"Cambridge (CIE)" },
      { name:"Psychology", board:"Cambridge (CIE)" },
      { name:"Physical Education", board:"Cambridge (CIE)" },
      { name:"Design & Technology", board:"Cambridge (CIE)" },
      { name:"Food & Nutrition", board:"Cambridge (CIE)" },
      { name:"Travel & Tourism", board:"Cambridge (CIE)" },
      { name:"Enterprise", board:"Cambridge (CIE)" },
      { name:"World Literature", board:"Cambridge (CIE)" },
      { name:"Marine Science", board:"Cambridge (CIE)" },
    ],
  },
  IB: {
    label: "IB (Diploma)",
    defaultBoard: "IB",
    grades: GRADES_IB,
    defaultTarget: "5",
    subjects: [
      { name:"English A: Literature", board:"IB", group:"Language & Literature" },
      { name:"English A: Language & Literature", board:"IB", group:"Language & Literature" },
      { name:"Hindi A: Literature", board:"IB", group:"Language & Literature" },
      { name:"French A: Literature", board:"IB", group:"Language & Literature" },
      { name:"Spanish A: Literature", board:"IB", group:"Language & Literature" },
      { name:"Mandarin A: Literature", board:"IB", group:"Language & Literature" },
      { name:"Arabic A: Literature", board:"IB", group:"Language & Literature" },
      { name:"French B", board:"IB", group:"Language Acquisition" },
      { name:"Spanish B", board:"IB", group:"Language Acquisition" },
      { name:"Mandarin B", board:"IB", group:"Language Acquisition" },
      { name:"German B", board:"IB", group:"Language Acquisition" },
      { name:"Hindi B", board:"IB", group:"Language Acquisition" },
      { name:"Arabic B", board:"IB", group:"Language Acquisition" },
      { name:"French ab initio", board:"IB", group:"Language Acquisition" },
      { name:"Spanish ab initio", board:"IB", group:"Language Acquisition" },
      { name:"Mandarin ab initio", board:"IB", group:"Language Acquisition" },
      { name:"History", board:"IB", group:"Individuals & Societies" },
      { name:"Geography", board:"IB", group:"Individuals & Societies" },
      { name:"Economics", board:"IB", group:"Individuals & Societies" },
      { name:"Business Management", board:"IB", group:"Individuals & Societies" },
      { name:"Psychology", board:"IB", group:"Individuals & Societies" },
      { name:"Global Politics", board:"IB", group:"Individuals & Societies" },
      { name:"Philosophy", board:"IB", group:"Individuals & Societies" },
      { name:"World Religions", board:"IB", group:"Individuals & Societies" },
      { name:"Social & Cultural Anthropology", board:"IB", group:"Individuals & Societies" },
      { name:"Digital Society", board:"IB", group:"Individuals & Societies" },
      { name:"Biology", board:"IB", group:"Sciences" },
      { name:"Chemistry", board:"IB", group:"Sciences" },
      { name:"Physics", board:"IB", group:"Sciences" },
      { name:"Computer Science", board:"IB", group:"Sciences" },
      { name:"Design Technology", board:"IB", group:"Sciences" },
      { name:"Environmental Systems & Societies", board:"IB", group:"Sciences" },
      { name:"Sports, Exercise & Health Science", board:"IB", group:"Sciences" },
      { name:"Mathematics: Analysis & Approaches", board:"IB", group:"Mathematics" },
      { name:"Mathematics: Applications & Interpretation", board:"IB", group:"Mathematics" },
      { name:"Visual Arts", board:"IB", group:"The Arts" },
      { name:"Music", board:"IB", group:"The Arts" },
      { name:"Theatre", board:"IB", group:"The Arts" },
      { name:"Film", board:"IB", group:"The Arts" },
      { name:"Dance", board:"IB", group:"The Arts" },
      { name:"Theory of Knowledge (TOK)", board:"IB", group:"Core" },
      { name:"Extended Essay (EE)", board:"IB", group:"Core" },
      { name:"CAS (Creativity, Activity, Service)", board:"IB", group:"Core" },
    ],
  },
};

// ─── Helpers ───
const uid = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `markd_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};
const today = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
const toDateKey = (input = new Date()) => {
  const date = input instanceof Date ? new Date(input) : new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0,0,0,0);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const shiftDateKey = (dateKey, amount) => {
  const base = dateKey ? new Date(`${dateKey}T00:00:00`) : today();
  base.setDate(base.getDate() + amount);
  return toDateKey(base);
};
const daysUntil = (dateStr) => {
  const t = today();
  const d = new Date(dateStr); d.setHours(0,0,0,0);
  return Math.ceil((d - t) / 86400000);
};
const fmtDate = (d) => new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const formatMinutes = (minutes) => {
  if (!minutes) return "0m";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
};
const gradeToPercent = (g) => {
  const map = {"9":90,"8":80,"7":70,"6":60,"5":50,"4":40,"3":30,"2":20,"1":10,"A*":90,"A":80,"B":70,"C":60,"D":50,"E":40,"F":30,"G":20};
  return map[g] || 50;
};
const inferPriorityFromText = (text = "") => {
  const value = text.toLowerCase();
  if (/(asap|urgent|today|tonight|tomorrow|immediately)/.test(value)) return "urgent";
  if (/(exam|mock|essay|deadline|coursework|revision|study|practice)/.test(value)) return "soon";
  return "later";
};
const estimateFromText = (text = "") => {
  const value = text.toLowerCase();
  if (!value) return 30;
  if (/(essay|coursework|project|investigation|presentation|write[- ]?up|mock|practice paper|past paper|extended)/.test(value)) return 60;
  if (/(debug|coding|program|worksheet|problem set|questions|revision)/.test(value)) return 45;
  if (/(flashcard|quiz|recap|review|read|label|plan|outline|notes|speaking|vocab)/.test(value)) return 25;
  return 35;
};
const sanitiseEstimate = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
};
const normaliseTask = (task = {}) => {
  const done = Boolean(task.done);
  return {
    ...task,
    id: task.id || uid(),
    subjectId: task.subjectId || null,
    text: typeof task.text === "string" ? task.text : "",
    done,
    priority: PRIORITY_ORDER.includes(task.priority) ? task.priority : inferPriorityFromText(task.text),
    estimateMinutes: sanitiseEstimate(task.estimateMinutes),
    topic: typeof task.topic === "string" ? task.topic : "",
    createdAt: typeof task.createdAt === "string" ? task.createdAt : new Date().toISOString(),
    completedAt: done && typeof task.completedAt === "string" ? task.completedAt : null,
  };
};
const normaliseGoal = (goal = {}) => {
  const done = Boolean(goal.done);
  return {
    ...goal,
    id: goal.id || uid(),
    text: typeof goal.text === "string" ? goal.text : "",
    horizon: HORIZONS.includes(goal.horizon) ? goal.horizon : "3 months",
    subjectId: goal.subjectId || null,
    done,
    completedAt: done && typeof goal.completedAt === "string" ? goal.completedAt : null,
  };
};
const buildTask = (task = {}) =>
  normaliseTask({
    id: uid(),
    done: false,
    priority: inferPriorityFromText(task.text),
    estimateMinutes: estimateFromText(task.text),
    topic: "",
    createdAt: new Date().toISOString(),
    completedAt: null,
    ...task,
  });
const buildGoal = (goal = {}) =>
  normaliseGoal({
    id: uid(),
    done: false,
    completedAt: null,
    ...goal,
  });

// ─── Empty defaults for new users ───
const EMPTY_SUBJECTS = [];
const EMPTY_TASKS = [];
const EMPTY_DEADLINES = [];
const EMPTY_EXAMS = [];
const EMPTY_PAPERS = [];
const EMPTY_GOALS = [];
const EMPTY_PORTFOLIO = [];
const EMPTY_ACTIVITIES = [];

const createEmptyAppData = () => ({
  subjects: [],
  tasks: [],
  deadlines: [],
  exams: [],
  papers: [],
  goals: [],
  portfolio: [],
  activities: [],
  deleted: [],
  theme: "dark",
  revisionMode: false,
  outlookCalendarUrl: "",
  calendarLastSync: null,
});

const normaliseAppData = (appData = {}) => {
  const fallback = createEmptyAppData();
  return {
    subjects: Array.isArray(appData.subjects) ? appData.subjects : fallback.subjects,
    tasks: Array.isArray(appData.tasks) ? appData.tasks.map(normaliseTask) : fallback.tasks,
    deadlines: Array.isArray(appData.deadlines) ? appData.deadlines : fallback.deadlines,
    exams: Array.isArray(appData.exams) ? appData.exams : fallback.exams,
    papers: Array.isArray(appData.papers) ? appData.papers : fallback.papers,
    goals: Array.isArray(appData.goals) ? appData.goals.map(normaliseGoal) : fallback.goals,
    portfolio: Array.isArray(appData.portfolio) ? appData.portfolio : fallback.portfolio,
    activities: Array.isArray(appData.activities) ? appData.activities : fallback.activities,
    deleted: Array.isArray(appData.deleted) ? appData.deleted : fallback.deleted,
    theme: appData.theme === "light" ? "light" : "dark",
    revisionMode: Boolean(appData.revisionMode),
    outlookCalendarUrl: typeof appData.outlookCalendarUrl === "string" ? appData.outlookCalendarUrl : "",
    calendarLastSync:
      typeof appData.calendarLastSync === "string" || appData.calendarLastSync === null
        ? appData.calendarLastSync
        : null,
  };
};

const isEmptyAppData = (appData = {}) => {
  const data = normaliseAppData(appData);
  return (
    data.subjects.length === 0 &&
    data.tasks.length === 0 &&
    data.deadlines.length === 0 &&
    data.exams.length === 0 &&
    data.papers.length === 0 &&
    data.goals.length === 0 &&
    data.portfolio.length === 0 &&
    data.activities.length === 0 &&
    data.deleted.length === 0 &&
    data.theme === "dark" &&
    data.revisionMode === false &&
    data.outlookCalendarUrl === "" &&
    data.calendarLastSync === null
  );
};

const readLegacyAppData = (legacyUserId) => ({
  subjects: readLegacyUserStorage(legacyUserId, "subjects", EMPTY_SUBJECTS),
  tasks: readLegacyUserStorage(legacyUserId, "tasks", EMPTY_TASKS),
  deadlines: readLegacyUserStorage(legacyUserId, "deadlines", EMPTY_DEADLINES),
  exams: readLegacyUserStorage(legacyUserId, "exams", EMPTY_EXAMS),
  papers: readLegacyUserStorage(legacyUserId, "papers", EMPTY_PAPERS),
  goals: readLegacyUserStorage(legacyUserId, "goals", EMPTY_GOALS),
  portfolio: readLegacyUserStorage(legacyUserId, "portfolio", EMPTY_PORTFOLIO),
  activities: readLegacyUserStorage(legacyUserId, "activities", EMPTY_ACTIVITIES),
  deleted: readLegacyUserStorage(legacyUserId, "deleted", []),
  theme: readLegacyUserStorage(legacyUserId, "theme", "dark"),
  outlookCalendarUrl: readLegacyUserStorage(legacyUserId, "outlook_calendar_url", ""),
  calendarLastSync: readLegacyUserStorage(legacyUserId, "outlook_calendar_last_sync", null),
});

const getLegacyBundleForEmail = (email) => {
  if (!email) return null;
  const legacyUser = getLegacyUserByEmail(email);
  if (!legacyUser) return null;

  return {
    profile: {
      email: legacyUser.email || email.toLowerCase().trim(),
      name: legacyUser.name || "",
      school: legacyUser.school || "",
    },
    appData: normaliseAppData(readLegacyAppData(legacyUser.userId)),
  };
};

const PAPER_LINKS = [
  { name:"AQA", url:"https://www.aqa.org.uk/find-past-papers-and-mark-schemes", desc:"Official AQA past papers and mark schemes" },
  { name:"Edexcel", url:"https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html", desc:"Pearson Edexcel past papers" },
  { name:"OCR", url:"https://www.ocr.org.uk/students/past-papers/", desc:"OCR past papers by subject" },
  { name:"Save My Exams", url:"https://www.savemyexams.com/", desc:"Revision notes, topic questions and past papers" },
  { name:"Physics & Maths Tutor", url:"https://www.physicsandmathstutor.com/", desc:"Past papers and worked solutions" },
  { name:"Revision World", url:"https://revisionworld.com/gcse-revision/gcse-past-papers", desc:"Free GCSE past papers collection" },
];

// ─── Icons ───
const Icon = ({ d, size=20, color="currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);

const icons = {
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z",
  check: "M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  calendar: "M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M16 2v4 M8 2v4 M3 10h18",
  clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6",
  target: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  briefcase: "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2",
  plus: "M12 5v14 M5 12h14",
  x: "M18 6L6 18 M6 6l12 12",
  trash: "M3 6h18 M8 6V4h8v2 M19 6l-1 14H6L5 6",
  link: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14L21 3",
  chevron: "M9 18l6-6-6-6",
  sparkle: "M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z",
  send: "M22 2L11 13 M22 2l-7 20-4-9-9-4z",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  sync: "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  trophy: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6 M18 9h1.5a2.5 2.5 0 0 0 0-5H18 M4 22h16 M10 14.66V17c0 .55.47.98.97 1.21C12.15 18.75 13 20.24 13 22 M14 14.66V17c0 .55-.47.98-.97 1.21C11.85 18.75 11 20.24 11 22 M18 2H6v7a6 6 0 0 0 12 0V2z",
  undo: "M3 7v6h6 M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  eyeOff: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94 M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19 M1 1l22 22",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
};

const NAV_ITEMS = [
  { key:"home", label:"Home", icon:icons.home },
  { key:"subjects", label:"Subjects", icon:icons.book },
  { key:"tasks", label:"Tasks", icon:icons.check },
  { key:"deadlines", label:"Deadlines", icon:icons.calendar },
  { key:"exams", label:"Exams", icon:icons.clock },
  { key:"papers", label:"Papers", icon:icons.file },
  { key:"goals", label:"Goals", icon:icons.target },
  { key:"activities", label:"Activities", icon:icons.trophy },
  { key:"portfolio", label:"Portfolio", icon:icons.briefcase },
];

const TYPE_LABELS = {
  subject: "Subject", task: "Task", deadline: "Deadline", exam: "Exam",
  paper: "Past Paper", goal: "Goal", portfolio: "Portfolio", activity: "Activity",
};

const DEMO_ADMIN_EMAIL = "admin@demo.markd";
const DEMO_ADMIN_PASSWORD = "markddemo";
const DEMO_ADMIN_USER_ID = "demo-admin";
const DEMO_ADMIN_PROFILE = {
  userId: DEMO_ADMIN_USER_ID,
  email: DEMO_ADMIN_EMAIL,
  name: "Markd Admin",
  school: "Markd Demo Academy",
};

const SCHOOL_BY_EMAIL_DOMAIN = {
  "british-school.org": "The British School New Delhi",
};

const getSchoolFromEmail = (email) => {
  const normalisedEmail = String(email || "").trim().toLowerCase();
  const domain = normalisedEmail.includes("@") ? normalisedEmail.split("@").pop() : "";
  return SCHOOL_BY_EMAIL_DOMAIN[domain] || "";
};

const buildSessionUser = (authUser, profile) => ({
  userId: authUser.id,
  email: (profile?.email || authUser.email || "").toLowerCase(),
  name: profile?.name || authUser.user_metadata?.name || authUser.email?.split("@")[0] || "Student",
  school: profile?.school || authUser.user_metadata?.school || "",
});

const upsertProfile = async ({ id, email, name, school, appData }) => {
  if (!supabase) throw new Error(CLOUD_CONFIG_ERROR);

  const payload = {
    id,
    email: email.toLowerCase(),
    name: name || "",
    school: school || "",
  };

  if (appData !== undefined) {
    payload.app_data = normaliseAppData(appData);
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select("id, email, name, school, app_data")
    .single();

  if (error) throw error;
  return data;
};

const ensureProfile = async (authUser, fallback = {}) => {
  if (!supabase) throw new Error(CLOUD_CONFIG_ERROR);

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, name, school, app_data")
    .eq("id", authUser.id)
    .maybeSingle();

  if (error) throw error;
  if (data) return data;

  return upsertProfile({
    id: authUser.id,
    email: fallback.email || authUser.email || "",
    name: fallback.name || authUser.user_metadata?.name || "",
    school: fallback.school || authUser.user_metadata?.school || "",
    appData: createEmptyAppData(),
  });
};

const createDemoAppData = () => {
  const addDays = (days) => {
    const next = new Date();
    next.setDate(next.getDate() + days);
    return next.toISOString().slice(0, 10);
  };

  const mathsId = uid();
  const bioId = uid();
  const englishId = uid();
  const historyId = uid();
  const chemistryId = uid();
  const computerScienceId = uid();
  const spanishId = uid();
  const deletedTask = { id: uid(), subjectId: chemistryId, text: "Tidy titration notes", done: false };
  const deletedGoal = { id: uid(), text: "Join a summer STEM challenge", horizon: "9 months", subjectId: computerScienceId, done: false };

  return {
    subjects: [
      { id: mathsId, name: "Mathematics", board: "Edexcel", target: "8", colour: PALETTE[0] },
      { id: bioId, name: "Biology", board: "AQA", target: "9", colour: PALETTE[1] },
      { id: englishId, name: "English Literature", board: "AQA", target: "7", colour: PALETTE[2] },
      { id: historyId, name: "History", board: "Edexcel", target: "8", colour: PALETTE[3] },
      { id: chemistryId, name: "Chemistry", board: "AQA", target: "8", colour: PALETTE[4] },
      { id: computerScienceId, name: "Computer Science", board: "OCR", target: "9", colour: PALETTE[5] },
      { id: spanishId, name: "Spanish", board: "AQA", target: "7", colour: PALETTE[6] },
    ],
    tasks: [
      buildTask({ subjectId: mathsId, text: "Finish algebra revision set", priority: "urgent", estimateMinutes: 45, topic: "Algebra" }),
      buildTask({ subjectId: bioId, text: "Make flashcards for respiration", done: true, completedAt: new Date().toISOString(), priority: "soon", estimateMinutes: 25, topic: "Respiration" }),
      buildTask({ subjectId: englishId, text: "Annotate Macbeth Act 2", priority: "soon", estimateMinutes: 35, topic: "Macbeth" }),
      buildTask({ subjectId: historyId, text: "Plan Cold War essay", priority: "urgent", estimateMinutes: 60, topic: "Cold War" }),
      buildTask({ subjectId: chemistryId, text: "Complete organic chemistry recap quiz", priority: "soon", estimateMinutes: 30, topic: "Organic Chemistry" }),
      buildTask({ subjectId: computerScienceId, text: "Debug binary search trace questions", done: true, completedAt: new Date().toISOString(), priority: "soon", estimateMinutes: 40, topic: "Algorithms" }),
      buildTask({ subjectId: spanishId, text: "Practise speaking answers for theme 2", priority: "later", estimateMinutes: 25, topic: "Speaking" }),
      buildTask({ subjectId: mathsId, text: "Review mistakes from last mock", done: true, completedAt: new Date().toISOString(), priority: "soon", estimateMinutes: 30, topic: "Mocks" }),
      buildTask({ subjectId: bioId, text: "Label heart and circulation diagrams", priority: "soon", estimateMinutes: 20, topic: "Circulation" }),
    ],
    deadlines: [
      { id: uid(), subjectId: historyId, title: "Cold War source analysis", date: addDays(4) },
      { id: uid(), subjectId: englishId, title: "Macbeth essay draft", date: addDays(7) },
      { id: uid(), subjectId: bioId, title: "Required practical write-up", date: addDays(11) },
      { id: uid(), subjectId: chemistryId, title: "Bonding revision booklet", date: addDays(5) },
      { id: uid(), subjectId: computerScienceId, title: "Programming challenge submission", date: addDays(13) },
      { id: uid(), subjectId: spanishId, title: "Speaking recording upload", date: addDays(16) },
    ],
    exams: [
      { id: uid(), subjectId: mathsId, name: "Maths Paper 1", board: "Edexcel", date: addDays(9) },
      { id: uid(), subjectId: bioId, name: "Biology Mock", board: "AQA", date: addDays(15) },
      { id: uid(), subjectId: englishId, name: "Poetry Comparison Test", board: "AQA", date: addDays(20) },
      { id: uid(), subjectId: chemistryId, name: "Chemistry Paper 2", board: "AQA", date: addDays(22) },
      { id: uid(), subjectId: computerScienceId, name: "OCR Algorithms Assessment", board: "OCR", date: addDays(27) },
      { id: uid(), subjectId: historyId, name: "Elizabethan England Mock", board: "Edexcel", date: addDays(31) },
      { id: uid(), subjectId: spanishId, name: "Spanish Listening Test", board: "AQA", date: addDays(35) },
    ],
    papers: [
      { id: uid(), subjectId: mathsId, title: "November Mock", year: "2025", paper: "1", scored: 67, total: 80, file: null },
      { id: uid(), subjectId: bioId, title: "Practice Paper", year: "2025", paper: "2", scored: 74, total: 90, file: null },
      { id: uid(), subjectId: historyId, title: "Depth Study Paper", year: "2025", paper: "", scored: 42, total: 52, file: null },
      { id: uid(), subjectId: chemistryId, title: "Rates and Energy Checkpoint", year: "2025", paper: "1", scored: 61, total: 70, file: null },
      { id: uid(), subjectId: computerScienceId, title: "Programming Techniques Mock", year: "2025", paper: "2", scored: 59, total: 70, file: null },
      { id: uid(), subjectId: spanishId, title: "Reading Practice", year: "2025", paper: "", scored: 46, total: 60, file: null },
    ],
    goals: [
      buildGoal({ text: "Push Maths average above 85%", horizon: "3 months", subjectId: mathsId, done: false }),
      buildGoal({ text: "Finish Biology flashcards before mocks", horizon: "3 months", subjectId: bioId, done: true, completedAt: new Date().toISOString() }),
      buildGoal({ text: "Build a strong essay bank for History", horizon: "6 months", subjectId: historyId, done: false }),
      buildGoal({ text: "Reach grade 8 confidence in Chemistry calculations", horizon: "6 months", subjectId: chemistryId, done: false }),
      buildGoal({ text: "Ship one polished coding project for portfolio", horizon: "9 months", subjectId: computerScienceId, done: false }),
      buildGoal({ text: "Hold a 10-minute Spanish conversation confidently", horizon: "12 months", subjectId: spanishId, done: false }),
    ],
    portfolio: [
      { id: uid(), subjectId: bioId, title: "Independent enzyme investigation", type: "Project", desc: "Designed and analysed a practical exploring pH and enzyme activity, then presented the findings.", tags: ["Practical", "Analysis", "Presentation"] },
      { id: uid(), subjectId: historyId, title: "Regional debate finalist", type: "Achievement", desc: "Reached the final round of an inter-school historical debate competition.", tags: ["Debate", "Public Speaking"] },
      { id: uid(), subjectId: computerScienceId, title: "Revision planner prototype", type: "Project", desc: "Built a lightweight revision-planning prototype with subject cards, deadline priorities, and exam countdown logic.", tags: ["Coding", "UX", "JavaScript"] },
      { id: uid(), subjectId: spanishId, title: "Spanish speaking award", type: "Achievement", desc: "Won the department prize for consistency and confidence in oral practice sessions.", tags: ["Languages", "Speaking"] },
      { id: uid(), subjectId: mathsId, title: "UKMT challenge commendation", type: "Competition", desc: "Earned a silver-level score and helped run peer practice sessions after school.", tags: ["Competition", "Problem Solving"] },
    ],
    activities: [
      {
        id: uid(),
        name: "Debate Society",
        role: "Vice Captain",
        organisation: "Markd Demo Academy",
        desc: "Lead weekly drills, prep novice speakers, and organise inter-school practice rounds.",
        colour: PALETTE[6],
        hoursPerWeek: 3,
        events: [
          { title: "Regional practice round", date: addDays(6) },
          { title: "Senior showcase", date: addDays(18) },
        ],
        achievements: ["Best Speaker at winter invitational", "Mentored Year 9 debate team"],
        tags: ["Leadership", "Speaking"],
      },
      {
        id: uid(),
        name: "Code Club",
        role: "Project Lead",
        organisation: "Markd Demo Academy",
        desc: "Run lunchtime build sessions, support beginner coders, and demo small tools for revision and organisation.",
        colour: PALETTE[7],
        hoursPerWeek: 2,
        events: [
          { title: "App showcase lunch session", date: addDays(8) },
          { title: "Hackathon planning meeting", date: addDays(24) },
        ],
        achievements: ["Released a homework tracker MVP", "Led a 20-student debugging workshop"],
        tags: ["Technology", "Mentoring"],
      },
      {
        id: uid(),
        name: "Basketball",
        role: "Starting Guard",
        organisation: "Markd Demo Academy",
        desc: "Train twice a week and support match-day prep for the senior team.",
        colour: PALETTE[8],
        hoursPerWeek: 4,
        events: [
          { title: "League fixture vs Riverside", date: addDays(10) },
        ],
        achievements: ["Player of the month in February"],
        tags: ["Sport", "Teamwork"],
      },
    ],
    deleted: [
      { id: uid(), type: "task", item: deletedTask, label: deletedTask.text, deletedAt: "08:45" },
      { id: uid(), type: "goal", item: deletedGoal, label: deletedGoal.text, deletedAt: "13:10" },
    ],
    theme: "dark",
    revisionMode: false,
    outlookCalendarUrl: "",
    calendarLastSync: null,
  };
};

// ═══════════════════════════════════════════
// Auth Screen
// ═══════════════════════════════════════════
function AuthScreen({ onAuth, onDemoAuth, cloudError = "" }) {
  const [screen, setScreen] = useState("welcome"); // welcome | login | signup
  const [form, setForm] = useState({ name:"", school:"", email:"", password:"", confirm:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [demoTapCount, setDemoTapCount] = useState(0);
  const [demoUnlocked, setDemoUnlocked] = useState(false);

  const detectedSchool = getSchoolFromEmail(form.email);

  const upd = (k, v) => {
    setForm(f => {
      const next = { ...f, [k]: v };

      if (k === "email") {
        const nextDetectedSchool = getSchoolFromEmail(v);
        const previousDetectedSchool = getSchoolFromEmail(f.email);

        if (nextDetectedSchool) {
          next.school = nextDetectedSchool;
        } else if (f.school === previousDetectedSchool) {
          next.school = "";
        }
      }

      return next;
    });
    setError("");
  };
  const openDemoAdmin = () => {
    setError("");
    onDemoAuth?.();
  };
  const handleLogoTap = () => {
    setDemoTapCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setDemoUnlocked(true);
        setScreen("login");
      }
      return next >= 5 ? 0 : next;
    });
  };

  const handleSignup = async () => {
    if (!isSupabaseConfigured || !supabase) return setError(cloudError || CLOUD_CONFIG_ERROR);
    const resolvedSchool = detectedSchool || form.school.trim();
    if (!form.name.trim()) return setError("Please enter your name.");
    if (!form.email.trim() || !form.email.includes("@")) return setError("Please enter a valid email.");
    if (!resolvedSchool) return setError("Please enter your school name.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirm) return setError("Passwords don't match.");
    setLoading(true);
    try {
      const email = form.email.toLowerCase().trim();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: {
          data: {
            name: form.name.trim(),
            school: resolvedSchool,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error("Signup failed. Please try again.");

      if (!data.session) {
        setError("Check your email to confirm your account, then sign in.");
        setScreen("login");
        return;
      }

      const profile = await upsertProfile({
        id: data.user.id,
        email,
        name: form.name.trim(),
        school: resolvedSchool,
        appData: createEmptyAppData(),
      });

      onAuth({ authUser: data.user, profile });
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Could not create your account.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!form.email.trim() || !form.password) return setError("Please fill in all fields.");
    const email = form.email.toLowerCase().trim();
    if (email === DEMO_ADMIN_EMAIL && form.password === DEMO_ADMIN_PASSWORD) {
      setLoading(false);
      openDemoAdmin();
      return;
    }
    if (!isSupabaseConfigured || !supabase) return setError(cloudError || CLOUD_CONFIG_ERROR);
    setLoading(true);
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: form.password,
      });

      if (loginError) throw loginError;
      if (!data.user) throw new Error("No account found with this email.");

      const profile = await ensureProfile(data.user, { email });
      onAuth({ authUser: data.user, profile });
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Could not sign you in.");
    } finally {
      setLoading(false);
    }
  };

  const initial = form.name ? form.name.trim()[0].toUpperCase() : "M";

  return (
    <div className="auth-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        html, body { height:100%; }
        .auth-root { min-height:100vh; min-height:100dvh; background:#080810; background-image:radial-gradient(circle at 18% 18%, rgba(124,106,247,0.22) 0%, transparent 52%), radial-gradient(circle at 82% 82%, rgba(106,247,196,0.16) 0%, transparent 50%); color:#e8e8f0; font-family:'DM Mono',monospace; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:24px; }
        .auth-card { width:100%; max-width:400px; background:rgba(255,255,255,0.07); backdrop-filter:blur(28px) saturate(1.5); -webkit-backdrop-filter:blur(28px) saturate(1.5); border:1px solid rgba(255,255,255,0.12); border-radius:20px; padding:32px 28px; display:flex; flex-direction:column; gap:20px; }
        .auth-logo { font-family:'Syne',sans-serif; font-weight:800; font-size:28px; color:#e8e8f0; text-align:center; }
        .auth-logo.tap-target { cursor:pointer; user-select:none; }
        .auth-logo-dot { display:inline-block; width:9px; height:9px; background:#7c6af7; border-radius:50%; margin-left:3px; vertical-align:middle; position:relative; top:-2px; box-shadow:0 0 12px #7c6af7; }
        .auth-avatar-wrap { display:flex; justify-content:center; margin-bottom:4px; }
        .auth-avatar { width:64px; height:64px; border-radius:50%; background:rgba(124,106,247,0.12); border:2px solid rgba(124,106,247,0.3); display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-weight:700; font-size:24px; color:#7c6af7; }
        .auth-title { font-family:'Syne',sans-serif; font-weight:700; font-size:20px; text-align:center; color:#e8e8f0; }
        .auth-sub { font-size:12px; color:#6b6b80; text-align:center; line-height:1.5; }
        .auth-input-wrap { position:relative; }
        .auth-input { width:100%; padding:12px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.11); background:rgba(255,255,255,0.07); color:#e8e8f0; font-family:'DM Mono',monospace; font-size:13px; outline:none; transition:border-color 0.2s, box-shadow 0.2s; }
        .auth-input:focus { border-color:#7c6af7; }
        .auth-input::placeholder { color:#6b6b80; }
        .auth-input.has-toggle { padding-right:44px; }
        .auth-eye { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#6b6b80; display:flex; align-items:center; padding:4px; }
        .auth-eye:hover { color:#e8e8f0; }
        .auth-btn { width:100%; padding:13px; border-radius:10px; border:none; background:#7c6af7; color:white; font-family:'Syne',sans-serif; font-weight:700; font-size:15px; cursor:pointer; transition:opacity 0.2s; }
        .auth-btn:hover:not(:disabled) { opacity:0.88; }
        .auth-btn:disabled { opacity:0.5; cursor:default; }
        .auth-btn.secondary { background:transparent; border:1px solid #2a2a38; color:#e8e8f0; font-family:'DM Mono',monospace; font-weight:400; font-size:13px; }
        .auth-btn.secondary:hover { background:#1a1a24; }
        .auth-error { background:rgba(247,106,106,0.1); border:1px solid rgba(247,106,106,0.25); border-radius:8px; padding:10px 14px; font-size:12px; color:#f76a6a; }
        .auth-divider { display:flex; align-items:center; gap:10px; }
        .auth-divider-line { flex:1; height:1px; background:#2a2a38; }
        .auth-divider-text { font-size:11px; color:#6b6b80; }
        .auth-link { background:none; border:none; color:#7c6af7; font-family:'DM Mono',monospace; font-size:12px; cursor:pointer; text-decoration:underline; text-underline-offset:3px; }
        .auth-link:hover { opacity:0.8; }
        .auth-footer { text-align:center; font-size:11px; color:#6b6b80; }
        .auth-helper { font-size:11px; color:#9d9db4; line-height:1.5; margin-top:-4px; }
        .auth-demo-note { font-size:11px; color:#9d9db4; line-height:1.6; text-align:center; }
        .auth-demo-creds { display:block; color:#e8e8f0; margin-top:4px; }
        .auth-secret-hint { text-align:center; font-size:10px; color:#6b6b80; letter-spacing:0.2px; }
        .auth-welcome-art { display:flex; justify-content:center; gap:8px; }
        .auth-dot { width:10px; height:10px; border-radius:50%; animation:authPulse 2s infinite ease-in-out; }
        .auth-dot:nth-child(2) { animation-delay:0.3s; }
        .auth-dot:nth-child(3) { animation-delay:0.6s; }
        @keyframes authPulse { 0%,100% { transform:scale(1); opacity:0.6; } 50% { transform:scale(1.3); opacity:1; } }
      `}</style>

      {screen === "welcome" && (
        <div className="auth-card">
          <div className="auth-logo tap-target" onClick={handleLogoTap}>Markd<span className="auth-logo-dot"/></div>
          <div className="auth-welcome-art">
            <div className="auth-dot" style={{background:"#7c6af7"}}/>
            <div className="auth-dot" style={{background:"#6af7c4"}}/>
            <div className="auth-dot" style={{background:"#f7a26a"}}/>
          </div>
          <div>
            <div className="auth-title">Your study organiser</div>
            <div className="auth-sub" style={{marginTop:8}}>Track subjects, deadlines, exams, and goals — all in one place.</div>
          </div>
          <button className="auth-btn" onClick={() => setScreen("signup")}>Get started</button>
          {demoUnlocked && <button className="auth-btn secondary" onClick={openDemoAdmin}>Use presenter workspace</button>}
          <div className="auth-footer">
            Already have an account?{" "}
            <button className="auth-link" onClick={() => setScreen("login")}>Sign in</button>
          </div>
        </div>
      )}

      {screen === "signup" && (
        <div className="auth-card">
          <div className="auth-logo tap-target" onClick={handleLogoTap}>Markd<span className="auth-logo-dot"/></div>
          <div className="auth-avatar-wrap">
            <div className="auth-avatar">{initial}</div>
          </div>
          <div className="auth-title">Create account</div>
          {(cloudError || error) && <div className="auth-error">{error || cloudError}</div>}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <input className="auth-input" placeholder="Your name" value={form.name} onChange={e=>upd("name",e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSignup()}/>
            <input className="auth-input" placeholder="Email address" type="email" value={form.email} onChange={e=>upd("email",e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSignup()}/>
            <input className="auth-input" placeholder="School name" value={form.school} onChange={e=>upd("school",e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSignup()} readOnly={Boolean(detectedSchool)} />
            {detectedSchool && <div className="auth-helper">School detected from your email: {detectedSchool}</div>}
            <div className="auth-input-wrap">
              <input className="auth-input has-toggle" placeholder="Password (min. 6 characters)" type={showPass?"text":"password"} value={form.password} onChange={e=>upd("password",e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSignup()}/>
              <button className="auth-eye" onClick={()=>setShowPass(s=>!s)}><Icon d={showPass?icons.eyeOff:icons.eye} size={16}/></button>
            </div>
            <input className="auth-input" placeholder="Confirm password" type="password" value={form.confirm} onChange={e=>upd("confirm",e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSignup()}/>
          </div>
          <button className="auth-btn" onClick={handleSignup} disabled={loading}>{loading ? "Creating account…" : "Create account"}</button>
          <div className="auth-footer">
            Already have an account?{" "}
            <button className="auth-link" onClick={() => { setScreen("login"); setError(""); setForm(f=>({...f,password:"",confirm:""})); }}>Sign in</button>
          </div>
        </div>
      )}

      {screen === "login" && (
        <div className="auth-card">
          <div className="auth-logo tap-target" onClick={handleLogoTap}>Markd<span className="auth-logo-dot"/></div>
          <div className="auth-title">Welcome back</div>
          <div className="auth-sub">Sign in to your account</div>
          {(cloudError || error) && <div className="auth-error">{error || cloudError}</div>}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <input className="auth-input" placeholder="Email address" type="email" value={form.email} onChange={e=>upd("email",e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
            <div className="auth-input-wrap">
              <input className="auth-input has-toggle" placeholder="Password" type={showPass?"text":"password"} value={form.password} onChange={e=>upd("password",e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
              <button className="auth-eye" onClick={()=>setShowPass(s=>!s)}><Icon d={showPass?icons.eyeOff:icons.eye} size={16}/></button>
            </div>
          </div>
          <button className="auth-btn" onClick={handleLogin} disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
          {demoUnlocked && (
            <>
              <div className="auth-divider">
                <div className="auth-divider-line"/>
                <div className="auth-divider-text">presenter</div>
                <div className="auth-divider-line"/>
              </div>
              <button className="auth-btn secondary" onClick={openDemoAdmin}>Use presenter workspace</button>
              <div className="auth-demo-note">
                Presenter login
                <span className="auth-demo-creds">{DEMO_ADMIN_EMAIL} / {DEMO_ADMIN_PASSWORD}</span>
              </div>
            </>
          )}
          <div className="auth-footer">
            Don't have an account?{" "}
            <button className="auth-link" onClick={() => { setScreen("signup"); setError(""); setForm(f=>({...f,password:""})); }}>Sign up</button>
          </div>
          {demoUnlocked && <div className="auth-secret-hint">Presenter access unlocked. Click the logo five times again after refresh if you need it later.</div>}
        </div>
      )}
    </div>
  );
}

function AppBootScreen({ message }) {
  return (
    <div className="auth-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        html, body { height:100%; }
        .auth-root { min-height:100vh; min-height:100dvh; background:#080810; background-image:radial-gradient(circle at 18% 18%, rgba(124,106,247,0.22) 0%, transparent 52%), radial-gradient(circle at 82% 82%, rgba(106,247,196,0.16) 0%, transparent 50%); color:#e8e8f0; font-family:'DM Mono',monospace; display:flex; align-items:center; justify-content:center; padding:24px; }
        .boot-card { width:100%; max-width:400px; background:rgba(255,255,255,0.07); backdrop-filter:blur(28px) saturate(1.5); -webkit-backdrop-filter:blur(28px) saturate(1.5); border:1px solid rgba(255,255,255,0.12); border-radius:20px; padding:32px 28px; display:flex; flex-direction:column; gap:16px; align-items:center; text-align:center; }
        .boot-logo { font-family:'Syne',sans-serif; font-weight:800; font-size:28px; color:#e8e8f0; }
        .boot-logo-dot { display:inline-block; width:9px; height:9px; background:#7c6af7; border-radius:50%; margin-left:3px; vertical-align:middle; position:relative; top:-2px; box-shadow:0 0 12px #7c6af7; }
        .boot-spinner { width:28px; height:28px; border-radius:50%; border:3px solid rgba(124,106,247,0.2); border-top-color:#7c6af7; animation:bootSpin 0.9s linear infinite; }
        .boot-message { font-size:12px; color:#6b6b80; line-height:1.6; }
        @keyframes bootSpin { to { transform:rotate(360deg); } }
      `}</style>
      <div className="boot-card">
        <div className="boot-logo">Markd<span className="boot-logo-dot"/></div>
        <div className="boot-spinner"/>
        <div className="boot-message">{message}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Main App
// ═══════════════════════════════════════════
export default function Markd() {
  const [authUser, setAuthUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [authInitialising, setAuthInitialising] = useState(true);
  const [cloudHydrating, setCloudHydrating] = useState(false);
  const userId = authUser?.id || null;

  const [page, setPage] = useState("home");
  const [modal, setModal] = useState(null);

  // ─── All persisted state scoped per user ───
  const [subjects, setSubjects] = useState(EMPTY_SUBJECTS);
  const [tasks, setTasks] = useState(EMPTY_TASKS);
  const [deadlines, setDeadlines] = useState(EMPTY_DEADLINES);
  const [exams, setExams] = useState(EMPTY_EXAMS);
  const [papers, setPapers] = useState(EMPTY_PAPERS);
  const [goals, setGoals] = useState(EMPTY_GOALS);
  const [portfolio, setPortfolio] = useState(EMPTY_PORTFOLIO);
  const [activities, setActivities] = useState(EMPTY_ACTIVITIES);
  const [recentlyDeleted, setRecentlyDeleted] = useState([]);
  const [theme, setTheme] = useState("dark");
  const [revisionMode, setRevisionMode] = useState(false);
  const [outlookCalendarUrl, setOutlookCalendarUrl] = useState("");
  const [calendarLastSync, setCalendarLastSync] = useState(null);
  const [loadedUserId, setLoadedUserId] = useState(null);

  // ─── Non-persisted UI state ───
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [resetStep, setResetStep] = useState(0);
  const [paperTab, setPaperTab] = useState("my");
  const [goalTab, setGoalTab] = useState("goals");
  const [goalHorizon, setGoalHorizon] = useState("3 months");
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [browseCurriculum, setBrowseCurriculum] = useState("GCSE");
  const [browseSelected, setBrowseSelected] = useState(new Set());
  const [browseSearch, setBrowseSearch] = useState("");
  const [subjectTab, setSubjectTab] = useState("browse");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("general");
  const [form, setForm] = useState({});
  const [teamsConnected, setTeamsConnected] = useState(false);
  const [teamsSyncing, setTeamsSyncing] = useState(false);
  const [teamsLastSync, setTeamsLastSync] = useState(null);
  const [teamsUser, setTeamsUser] = useState(null);
  const [syncLog, setSyncLog] = useState([]);
  const [autoSync, setAutoSync] = useState(true);
  const [calendarInput, setCalendarInput] = useState("");
  const [calendarSyncing, setCalendarSyncing] = useState(false);
  const [calendarSyncError, setCalendarSyncError] = useState("");
  const [quickTaskText, setQuickTaskText] = useState("");
  const [quickTaskSubjectId, setQuickTaskSubjectId] = useState("");
  const [quickTaskTopic, setQuickTaskTopic] = useState("");
  const [highlightedTaskId, setHighlightedTaskId] = useState(null);
  const [completionBurstId, setCompletionBurstId] = useState(null);

  const resetPersistedState = () => {
    const empty = createEmptyAppData();
    setSubjects(empty.subjects);
    setTasks(empty.tasks);
    setDeadlines(empty.deadlines);
    setExams(empty.exams);
    setPapers(empty.papers);
    setGoals(empty.goals);
    setPortfolio(empty.portfolio);
    setActivities(empty.activities);
    setRecentlyDeleted(empty.deleted);
    setTheme(empty.theme);
    setRevisionMode(empty.revisionMode);
    setOutlookCalendarUrl(empty.outlookCalendarUrl);
    setCalendarLastSync(empty.calendarLastSync);
    setCalendarInput("");
    setCalendarSyncError("");
  };

  const applyPersistedState = (appData) => {
    const next = normaliseAppData(appData);
    setSubjects(next.subjects);
    setTasks(next.tasks);
    setDeadlines(next.deadlines);
    setExams(next.exams);
    setPapers(next.papers);
    setGoals(next.goals);
    setPortfolio(next.portfolio);
    setActivities(next.activities);
    setRecentlyDeleted(next.deleted);
    setTheme(next.theme);
    setRevisionMode(next.revisionMode);
    setOutlookCalendarUrl(next.outlookCalendarUrl);
    setCalendarLastSync(next.calendarLastSync);
    setCalendarInput(next.outlookCalendarUrl);
  };

  const exportPersistedState = () => normaliseAppData({
    subjects,
    tasks,
    deadlines,
    exams,
    papers,
    goals,
    portfolio,
    activities,
    deleted: recentlyDeleted,
    theme,
    revisionMode,
    outlookCalendarUrl,
    calendarLastSync,
  });

  useEffect(() => {
    if (demoMode) {
      applyPersistedState(createDemoAppData());
      setCalendarInput("");
      setCalendarSyncError("");
      setLoadedUserId(DEMO_ADMIN_USER_ID);
      return;
    }
  }, [demoMode, userId]);

  useEffect(() => {
    setCalendarInput(outlookCalendarUrl);
  }, [outlookCalendarUrl]);

  useEffect(() => {
    if (quickTaskSubjectId && !subjects.some(subject => subject.id === quickTaskSubjectId)) {
      setQuickTaskSubjectId("");
    }
  }, [quickTaskSubjectId, subjects]);

  useEffect(() => {
    if (revisionMode && ["activities", "portfolio"].includes(page)) {
      setPage("home");
    }
  }, [page, revisionMode]);

  useEffect(() => {
    let cancelled = false;

    const syncAuthState = async (session) => {
      if (!isSupabaseConfigured || !supabase) {
        if (!cancelled) setAuthInitialising(false);
        return;
      }

      if (!session?.user) {
        if (!cancelled) {
          setAuthUser(null);
          setCurrentUser(null);
          setLoadedUserId(null);
          resetPersistedState();
          setAuthInitialising(false);
        }
        return;
      }

      try {
        const profile = await ensureProfile(session.user);
        if (!cancelled) {
          setAuthUser(session.user);
          setCurrentUser(buildSessionUser(session.user, profile));
        }
      } catch (error) {
        console.error("Failed to restore auth session", error);
        if (!cancelled) {
          setAuthUser(null);
          setCurrentUser(null);
        }
      } finally {
        if (!cancelled) setAuthInitialising(false);
      }
    };

    if (!isSupabaseConfigured || !supabase) {
      setAuthInitialising(false);
      return () => {
        cancelled = true;
      };
    }

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Failed to read Supabase session", error);
      }
      void syncAuthState(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncAuthState(session);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const hydrateCloudState = async () => {
      if (demoMode) {
        setCloudHydrating(false);
        return;
      }

      if (!authUser) {
        resetPersistedState();
        setLoadedUserId(null);
        setCloudHydrating(false);
        return;
      }

      setCloudHydrating(true);

      try {
        let profile = await ensureProfile(authUser);
        const legacyBundle = getLegacyBundleForEmail(profile.email || authUser.email || "");
        const shouldImportLegacy =
          isEmptyAppData(profile.app_data) &&
          legacyBundle &&
          !isEmptyAppData(legacyBundle.appData);

        const nextName = profile.name || legacyBundle?.profile.name || authUser.user_metadata?.name || "";
        const nextSchool = profile.school || legacyBundle?.profile.school || authUser.user_metadata?.school || "";
        const nextEmail = profile.email || legacyBundle?.profile.email || authUser.email || "";
        let nextAppData = shouldImportLegacy ? legacyBundle.appData : normaliseAppData(profile.app_data);

        if (
          shouldImportLegacy ||
          profile.name !== nextName ||
          profile.school !== nextSchool ||
          profile.email !== nextEmail
        ) {
          profile = await upsertProfile({
            id: authUser.id,
            email: nextEmail,
            name: nextName,
            school: nextSchool,
            appData: nextAppData,
          });
          nextAppData = normaliseAppData(profile.app_data);
        }

        if (!cancelled) {
          setCurrentUser(buildSessionUser(authUser, profile));
          applyPersistedState(nextAppData);
          setLoadedUserId(authUser.id);
        }
      } catch (error) {
        console.error("Failed to load cloud workspace", error);
        if (!cancelled) {
          resetPersistedState();
          setLoadedUserId(null);
        }
      } finally {
        if (!cancelled) setCloudHydrating(false);
      }
    };

    void hydrateCloudState();

    return () => {
      cancelled = true;
    };
  }, [authUser, demoMode]);

  useEffect(() => {
    if (!authUser || !currentUser || loadedUserId !== userId || cloudHydrating || demoMode) return;

    const timeoutId = setTimeout(() => {
      upsertProfile({
        id: authUser.id,
        email: currentUser.email,
        name: currentUser.name,
        school: currentUser.school,
        appData: exportPersistedState(),
      }).catch((error) => {
        console.error("Failed to sync cloud workspace", error);
      });
    }, 450);

    return () => clearTimeout(timeoutId);
  }, [
    activities,
    calendarLastSync,
    cloudHydrating,
    currentUser,
    deadlines,
    demoMode,
    exams,
    goals,
    loadedUserId,
    papers,
    portfolio,
    recentlyDeleted,
    subjects,
    tasks,
    theme,
    revisionMode,
    outlookCalendarUrl,
    userId,
    authUser,
  ]);
  // ─── Auth ───
  const handleAuth = ({ authUser: nextAuthUser, profile }) => {
    setDemoMode(false);
    setAuthUser(nextAuthUser);
    setCurrentUser(buildSessionUser(nextAuthUser, profile));
    setPage("home");
  };

  const handleDemoAuth = () => {
    setDemoMode(true);
    setAuthUser(null);
    setCurrentUser(DEMO_ADMIN_PROFILE);
    applyPersistedState(createDemoAppData());
    setLoadedUserId(DEMO_ADMIN_USER_ID);
    setCloudHydrating(false);
    setAiMessages([]);
    setSettingsOpen(false);
    setPage("home");
  };

  const handleLogout = async () => {
    if (!demoMode && supabase) {
      await supabase.auth.signOut();
    }
    setDemoMode(false);
    setAuthUser(null);
    setCurrentUser(null);
    setLoadedUserId(null);
    resetPersistedState();
    setAiMessages([]);
    setSettingsOpen(false);
  };

  if (authInitialising) {
    return <AppBootScreen message="Connecting to your cloud workspace..." />;
  }

  if (!currentUser) {
    return <AuthScreen onAuth={handleAuth} onDemoAuth={handleDemoAuth} cloudError={!isSupabaseConfigured ? CLOUD_CONFIG_ERROR : ""} />;
  }

  if (cloudHydrating && loadedUserId !== userId) {
    return <AppBootScreen message="Loading your subjects, deadlines, and exams..." />;
  }

  const userInitial = currentUser.name ? currentUser.name[0].toUpperCase() : "?";

  const pushDeleted = (type, item, label) => {
    const entry = { id:uid(), type, item, label, deletedAt: new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}) };
    setRecentlyDeleted(prev => [entry, ...prev].slice(0, 10));
  };

  const restoreDeleted = (entry) => {
    const { type, item } = entry;
    if (type==="subject") setSubjects(s=>[...s,item]);
    else if (type==="task") setTasks(s=>[...s,item]);
    else if (type==="deadline") setDeadlines(s=>[...s,item]);
    else if (type==="exam") setExams(s=>[...s,item]);
    else if (type==="paper") setPapers(s=>[...s,item]);
    else if (type==="goal") setGoals(s=>[...s,item]);
    else if (type==="portfolio") setPortfolio(s=>[...s,item]);
    else if (type==="activity") setActivities(s=>[...s,item]);
    setRecentlyDeleted(prev => prev.filter(e => e.id !== entry.id));
  };

  const confirmDelete = (message, onConfirm) => setConfirmDialog({ message, onConfirm });

  const deleteSubject = (id) => { const s=subjects.find(x=>x.id===id); confirmDelete(`Delete "${s?.name}"?`,()=>{ pushDeleted("subject",s,s?.name); setSubjects(ss=>ss.filter(x=>x.id!==id)); }); };
  const deleteTask = (id) => { const t=tasks.find(x=>x.id===id); confirmDelete(`Delete task "${t?.text}"?`,()=>{ pushDeleted("task",t,t?.text); setTasks(ts=>ts.filter(x=>x.id!==id)); }); };
  const deleteDeadline = (id) => { const d=deadlines.find(x=>x.id===id); confirmDelete(`Delete deadline "${d?.title}"?`,()=>{ pushDeleted("deadline",d,d?.title); setDeadlines(ds=>ds.filter(x=>x.id!==id)); }); };
  const deleteExam = (id) => { const e=exams.find(x=>x.id===id); confirmDelete(`Delete exam "${e?.name}"?`,()=>{ pushDeleted("exam",e,e?.name); setExams(es=>es.filter(x=>x.id!==id)); }); };
  const deletePaper = (id) => { const p=papers.find(x=>x.id===id); confirmDelete(`Delete paper "${p?.title}"?`,()=>{ pushDeleted("paper",p,p?.title); setPapers(ps=>ps.filter(x=>x.id!==id)); }); };
  const deleteGoal = (id) => { const g=goals.find(x=>x.id===id); confirmDelete(`Delete goal "${g?.text}"?`,()=>{ pushDeleted("goal",g,g?.text); setGoals(gs=>gs.filter(x=>x.id!==id)); }); };
  const deletePortfolio = (id) => { const p=portfolio.find(x=>x.id===id); confirmDelete(`Delete portfolio entry "${p?.title}"?`,()=>{ pushDeleted("portfolio",p,p?.title); setPortfolio(ps=>ps.filter(x=>x.id!==id)); }); };
  const deleteActivity = (id) => { const a=activities.find(x=>x.id===id); confirmDelete(`Delete activity "${a?.name}"?`,()=>{ pushDeleted("activity",a,a?.name); setActivities(as=>as.filter(x=>x.id!==id)); }); };

  const resetAllData = () => {
    resetPersistedState();
    setResetStep(0);
  };

  // ─── Subject helpers ───
  const sub = (id) => subjects.find(s => s.id === id);
  const subColour = (id) => sub(id)?.colour || "var(--muted)";
  const subName = (id) => sub(id)?.name || "Unknown";
  const inferSubjectIdFromTitle = (title) => {
    const match = [...subjects]
      .sort((a, b) => b.name.length - a.name.length)
      .find(subject => title.toLowerCase().includes(subject.name.toLowerCase()));
    return match?.id || null;
  };
  const avgMark = (sId) => { const sp=papers.filter(p=>p.subjectId===sId); if(!sp.length) return null; return Math.round(sp.reduce((a,p)=>a+(p.scored/p.total)*100,0)/sp.length); };
  const subjectDeadlineCount = (sId) => deadlines.filter(d=>d.subjectId===sId).length;
  const subjectTaskProgress = (sId) => { const st=tasks.filter(t=>t.subjectId===sId); if(!st.length) return null; return { done:st.filter(t=>t.done).length, total:st.length }; };
  const todayKey = toDateKey();
  const getTaskEstimateMinutes = (task) => sanitiseEstimate(task?.estimateMinutes) || estimateFromText(task?.text);
  const getUpcomingDaysForSubject = (subjectId) => {
    const subjectDeadlines = deadlines
      .filter(item => item.subjectId === subjectId)
      .map(item => daysUntil(item.date))
      .filter(days => days >= 0);
    const subjectExams = exams
      .filter(item => item.subjectId === subjectId)
      .map(item => daysUntil(item.date))
      .filter(days => days >= 0);
    const combined = [...subjectDeadlines, ...subjectExams];
    return combined.length ? Math.min(...combined) : null;
  };
  const getNextExamForSubject = (subjectId) =>
    [...exams]
      .filter(exam => exam.subjectId === subjectId && daysUntil(exam.date) >= 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0] || null;
  const getEffectivePriority = (task) => {
    const explicitPriority = PRIORITY_ORDER.includes(task.priority) ? task.priority : inferPriorityFromText(task.text);
    const upcomingDays = task.subjectId ? getUpcomingDaysForSubject(task.subjectId) : null;

    if (upcomingDays !== null && upcomingDays <= 3) return "urgent";
    if (upcomingDays !== null && upcomingDays <= 10 && explicitPriority === "later") return "soon";
    return explicitPriority;
  };
  const getPriorityMeta = (priority) => PRIORITY_META[priority] || PRIORITY_META.later;
  const getTaskScore = (task) => {
    const priority = getEffectivePriority(task);
    const priorityWeight = { urgent: 320, soon: 220, later: 120 }[priority];
    const estimateWeight = Math.max(0, 55 - Math.min(getTaskEstimateMinutes(task), 60));
    const upcomingDays = task.subjectId ? getUpcomingDaysForSubject(task.subjectId) : null;
    const pressureWeight = upcomingDays === null ? 0 : Math.max(0, 28 - upcomingDays) * 6;
    const ageWeight = task.createdAt ? clamp(Math.floor((today() - new Date(task.createdAt)) / 86400000), 0, 21) * 3 : 0;
    const topicWeight = task.topic ? 8 : 0;
    return priorityWeight + estimateWeight + pressureWeight + ageWeight + topicWeight;
  };
  const rankedTasks = [...tasks]
    .filter(task => !task.done)
    .map(task => ({
      ...task,
      effectivePriority: getEffectivePriority(task),
      resolvedEstimateMinutes: getTaskEstimateMinutes(task),
      score: getTaskScore(task),
    }))
    .sort((a, b) => b.score - a.score || a.resolvedEstimateMinutes - b.resolvedEstimateMinutes);
  const dailyPlannerTasks = rankedTasks.slice(0, DAILY_PLANNER_LIMIT);
  const suggestedTask = dailyPlannerTasks[0] || null;
  const completedTodayTasks = tasks.filter(task => task.done && task.completedAt && toDateKey(task.completedAt) === todayKey);
  const completedTodayGoals = goals.filter(goal => goal.done && goal.completedAt && toDateKey(goal.completedAt) === todayKey);
  const weeklyCompletedTasks = tasks.filter(task => task.done && task.completedAt && toDateKey(task.completedAt) >= shiftDateKey(todayKey, -6));
  const weeklyCompletedGoals = goals.filter(goal => goal.done && goal.completedAt && toDateKey(goal.completedAt) >= shiftDateKey(todayKey, -6));
  const weeklyCompletedMinutes = weeklyCompletedTasks.reduce((sum, task) => sum + getTaskEstimateMinutes(task), 0);
  const completedDates = Array.from(
    new Set(
      [
        ...tasks.map(task => (task.done && task.completedAt ? toDateKey(task.completedAt) : null)),
        ...goals.map(goal => (goal.done && goal.completedAt ? toDateKey(goal.completedAt) : null)),
      ].filter(Boolean)
    )
  ).sort();
  const streakStart = completedDates.length ? completedDates[completedDates.length - 1] : null;
  let streak = 0;
  if (streakStart && (streakStart === todayKey || streakStart === shiftDateKey(todayKey, -1))) {
    let cursor = streakStart;
    const completedDateSet = new Set(completedDates);
    while (completedDateSet.has(cursor)) {
      streak += 1;
      cursor = shiftDateKey(cursor, -1);
    }
  }
  const totalXp =
    tasks.filter(task => task.done).reduce((sum, task) => {
      const priorityBonus = { urgent: 14, soon: 10, later: 6 }[getEffectivePriority(task)];
      return sum + Math.round(getTaskEstimateMinutes(task) / 5) + priorityBonus;
    }, 0) +
    goals.filter(goal => goal.done).length * 24 +
    papers.length * 12;
  const level = Math.max(1, Math.floor(totalXp / XP_PER_LEVEL) + 1);
  const levelProgress = totalXp % XP_PER_LEVEL;
  const plannerProgressBase = completedTodayTasks.length + completedTodayGoals.length + dailyPlannerTasks.length;
  const plannerProgressPct = plannerProgressBase === 0 ? 0 : Math.round(((completedTodayTasks.length + completedTodayGoals.length) / plannerProgressBase) * 100);
  const paperTrendDelta = (() => {
    if (papers.length < 2) return 0;
    const percentages = papers.map(paper => Math.round((paper.scored / paper.total) * 100));
    return percentages[percentages.length - 1] - percentages[0];
  })();
  const achievements = [
    { id: "first-finish", title: "First Finish", desc: "Complete your first task", earned: tasks.some(task => task.done) },
    { id: "focus-streak", title: "Focus Streak", desc: "Keep a 3-day productivity streak", earned: streak >= 3 },
    { id: "deep-work", title: "Deep Work", desc: "Log 3+ study hours in a week", earned: weeklyCompletedMinutes >= 180 },
    { id: "paper-trail", title: "Paper Trail", desc: "Log 5 past papers", earned: papers.length >= 5 },
    { id: "goal-getter", title: "Goal Getter", desc: "Complete 2 goals", earned: goals.filter(goal => goal.done).length >= 2 },
  ];
  const unlockedAchievements = achievements.filter(achievement => achievement.earned);
  const getSubjectHealth = (subjectId) => {
    const avg = avgMark(subjectId);
    const taskProgress = subjectTaskProgress(subjectId);
    const upcomingDays = getUpcomingDaysForSubject(subjectId);
    const avgScore = avg ?? 58;
    const taskScore = taskProgress ? Math.round((taskProgress.done / taskProgress.total) * 100) : 62;
    const deadlineBuffer = upcomingDays === null ? 82 : clamp(100 - (14 - Math.min(upcomingDays, 14)) * 6, 28, 100);
    const health = Math.round(avgScore * 0.45 + taskScore * 0.3 + deadlineBuffer * 0.25);
    return clamp(health, 0, 100);
  };
  const getHealthTone = (score) => (score >= 75 ? "var(--accent3)" : score >= 55 ? "var(--accent2)" : "var(--danger)");
  const getProjectedGrade = (subject) => {
    if (!subject) return null;
    const avg = avgMark(subject.id);
    if (avg === null) return null;
    const scale =
      subject.board === "IB"
        ? GRADES_IB
        : GRADES_IGCSE.includes(subject.target)
          ? GRADES_IGCSE
          : GRADES_GCSE;

    return scale.reduce((best, grade) => {
      if (!best) return grade;
      return Math.abs(gradeToPercent(grade) - avg) < Math.abs(gradeToPercent(best) - avg) ? grade : best;
    }, null);
  };
  const getTopicProgress = (subjectId) => {
    const topicMap = new Map();
    tasks
      .filter(task => task.subjectId === subjectId && task.topic)
      .forEach(task => {
        const key = task.topic.trim();
        if (!key) return;
        const current = topicMap.get(key) || { total: 0, done: 0 };
        current.total += 1;
        current.done += task.done ? 1 : 0;
        topicMap.set(key, current);
      });
    return Array.from(topicMap.entries())
      .map(([topic, stats]) => ({ topic, ...stats }))
      .sort((a, b) => b.total - a.total || a.topic.localeCompare(b.topic))
      .slice(0, 3);
  };
  const weeklySummary = {
    tasks: weeklyCompletedTasks.length,
    goals: weeklyCompletedGoals.length,
    minutes: weeklyCompletedMinutes,
    urgentLeft: rankedTasks.filter(task => task.effectivePriority === "urgent").length,
    trend: paperTrendDelta,
  };
  const motivationalInsight = (() => {
    if (streak >= 5) return `You’re on a ${streak}-day streak. Protect it by finishing ${suggestedTask ? `"${suggestedTask.text}"` : "one focused task"} next.`;
    if (weeklySummary.tasks >= 6) return `Strong week so far: ${weeklySummary.tasks} tasks down and ${formatMinutes(weeklySummary.minutes)} of focused work logged.`;
    if (weeklySummary.urgentLeft > 0 && suggestedTask) return `${subName(suggestedTask.subjectId)} needs attention. ${suggestedTask.text} is the best move to lower pressure today.`;
    if (suggestedTask) return `Best next step: ${suggestedTask.text}. It should take about ${formatMinutes(suggestedTask.resolvedEstimateMinutes)}.`;
    return "Add a few tasks and Markd will build a sharper daily plan for you.";
  })();
  const triggerCompletionBurst = (taskId) => {
    setCompletionBurstId(taskId);
    setTimeout(() => {
      setCompletionBurstId(current => (current === taskId ? null : current));
    }, 900);
  };
  const toggleTaskDone = (taskId) => {
    const target = tasks.find(task => task.id === taskId);
    if (!target) return;
    const nextDone = !target.done;
    setTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === taskId
          ? normaliseTask({
              ...task,
              done: nextDone,
              completedAt: nextDone ? new Date().toISOString() : null,
            })
          : task
      )
    );
    if (nextDone) triggerCompletionBurst(taskId);
    if (nextDone && highlightedTaskId === taskId) setHighlightedTaskId(null);
  };
  const toggleGoalDone = (goalId) => {
    const target = goals.find(goal => goal.id === goalId);
    if (!target) return;
    const nextDone = !target.done;
    setGoals(currentGoals =>
      currentGoals.map(goal =>
        goal.id === goalId
          ? normaliseGoal({
              ...goal,
              done: nextDone,
              completedAt: nextDone ? new Date().toISOString() : null,
            })
          : goal
      )
    );
  };
  const focusTask = (taskId) => {
    setHighlightedTaskId(taskId);
    setPage("tasks");
  };
  const quickAddTask = () => {
    const text = quickTaskText.trim();
    if (!text) return;
    const subjectId = quickTaskSubjectId || inferSubjectIdFromTitle(text) || subjects[0]?.id || null;
    if (!subjectId) return;
    setTasks(currentTasks => [
      ...currentTasks,
      buildTask({
        subjectId,
        text,
        topic: quickTaskTopic.trim(),
      }),
    ]);
    setQuickTaskText("");
    setQuickTaskTopic("");
  };
  const downloadBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      profile: {
        name: currentUser.name,
        email: currentUser.email,
        school: currentUser.school,
      },
      appData: exportPersistedState(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `markd-backup-${toDateKey() || "export"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const importBackup = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw);
      const nextData = normaliseAppData(parsed.appData || parsed);
      applyPersistedState(nextData);
    } catch (error) {
      console.error("Failed to import backup", error);
      window.alert("That backup file could not be imported.");
    } finally {
      event.target.value = "";
    }
  };

  // ─── Modal form state ───
  const updateForm = (k,v) => setForm(f=>({...f,[k]:v}));

  const openModal = (type) => {
    setForm({});
    if (type === "addSubject") { setBrowseSelected(new Set()); setBrowseSearch(""); }
    setModal(type);
  };

  const fabAction = () => {
    const map = { home:null,subjects:"addSubject",tasks:"addTask",deadlines:"addDeadline",exams:"examActions",papers:"addPaper",goals:"addGoal",portfolio:"addPortfolio",activities:"addActivity" };
    const m = map[page];
    if (m) openModal(m);
  };

  const toggleBrowseSubject = (name) => {
    setBrowseSelected(prev => { const next=new Set(prev); if(next.has(name)) next.delete(name); else next.add(name); return next; });
  };

  const addBrowsedSubjects = () => {
    if (browseSelected.size === 0) return;
    const curr = CURRICULA[browseCurriculum];
    const existingNames = new Set(subjects.map(s=>s.name.toLowerCase()));
    const newSubjects = [];
    let colourIdx = subjects.length;
    browseSelected.forEach(name => {
      if (existingNames.has(name.toLowerCase())) return;
      const catalogEntry = curr.subjects.find(s=>s.name===name);
      newSubjects.push({ id:uid(), name, board:catalogEntry?.board||curr.defaultBoard, target:curr.defaultTarget, colour:PALETTE[colourIdx%PALETTE.length] });
      colourIdx++;
    });
    if (newSubjects.length > 0) setSubjects(s=>[...s,...newSubjects]);
    setModal(null);
  };

  // ─── Teams Integration ───
  const loginTeams = () => {
    if (!API_BASE_URL) {
      addSyncLog("Set VITE_API_URL to enable Teams integration.");
      return;
    }
    window.open(`${API_BASE_URL}/auth/login`,"_blank","width=500,height=700");
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/status`,{credentials:"include"});
        const data = await res.json();
        if (data.authenticated) { clearInterval(poll); setTeamsConnected(true); setTeamsUser(data.user); addSyncLog("Connected to Microsoft Teams"); syncTeams(); }
      } catch {}
    }, 2000);
    setTimeout(()=>clearInterval(poll), 120000);
  };

  const logoutTeams = async () => {
    if (API_BASE_URL) {
      try { await fetch(`${API_BASE_URL}/auth/logout`,{method:"POST",credentials:"include"}); } catch {}
    }
    setTeamsConnected(false); setTeamsUser(null); setTeamsLastSync(null); addSyncLog("Disconnected from Teams");
  };

  const addSyncLog = (msg) => {
    const entry = { time:new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}), msg };
    setSyncLog(prev=>[entry,...prev].slice(0,20));
  };

  const syncTeams = async () => {
    if (teamsSyncing) return;
    if (!API_BASE_URL) {
      addSyncLog("Set VITE_API_URL to enable Teams sync.");
      return;
    }
    setTeamsSyncing(true); addSyncLog("Syncing with Teams...");
    try {
      const res = await fetch(`${API_BASE_URL}/api/teams/sync`,{credentials:"include"});
      if (!res.ok) throw new Error("Sync failed");
      const data = await res.json();
      let subjectMap = {};
      const currentSubjects = [...subjects];
      let colourIdx = currentSubjects.length;
      (data.subjects||[]).forEach(cls => {
        const existing = currentSubjects.find(s=>s.name.toLowerCase()===cls.name.toLowerCase());
        if (existing) { subjectMap[cls.name]=existing.id; }
        else { const newId=uid(); currentSubjects.push({id:newId,name:cls.name,board:cls.board||"Other",target:cls.target||"5",colour:cls.colour||PALETTE[colourIdx%PALETTE.length],teamsClassId:cls.teamsClassId}); subjectMap[cls.name]=newId; colourIdx++; }
      });
      setSubjects(currentSubjects);
      const existingTeamsDeadlines = new Set(deadlines.filter(d=>d.teamsId).map(d=>d.teamsId));
      const newDeadlines = (data.deadlines||[]).filter(d=>d.date&&!existingTeamsDeadlines.has(d.teamsId)).map(d=>({id:uid(),subjectId:subjectMap[d.className]||null,title:d.title,date:d.date,teamsId:d.teamsId})).filter(d=>d.subjectId);
      if (newDeadlines.length>0) { setDeadlines(prev=>[...prev,...newDeadlines]); addSyncLog(`Added ${newDeadlines.length} deadline${newDeadlines.length>1?"s":""}`); }
      const existingTeamsTasks = new Set(tasks.filter(t=>t.teamsId).map(t=>t.teamsId));
      const newTasks = (data.tasks||[])
        .filter(t=>!existingTeamsTasks.has(t.teamsId))
        .map(t=>buildTask({subjectId:subjectMap[t.className]||null,text:t.text,done:t.done||false,completedAt:t.done?new Date().toISOString():null,teamsId:t.teamsId}))
        .filter(t=>t.subjectId);
      if (newTasks.length>0) { setTasks(prev=>[...prev,...newTasks]); addSyncLog(`Added ${newTasks.length} task${newTasks.length>1?"s":""}`); }
      const existingTeamsExams = new Set(exams.filter(e=>e.teamsId).map(e=>e.teamsId));
      const newExams = (data.exams||[]).filter(e=>e.date&&!existingTeamsExams.has(e.teamsId)).map(e=>({id:uid(),subjectId:subjectMap[e.className]||subjects[0]?.id,name:e.name,board:"Other",date:e.date,teamsId:e.teamsId}));
      if (newExams.length>0) { setExams(prev=>[...prev,...newExams]); addSyncLog(`Added ${newExams.length} exam${newExams.length>1?"s":""}`); }
      const totalNew = newDeadlines.length+newTasks.length+newExams.length;
      if (totalNew===0) addSyncLog("Everything up to date");
      setTeamsLastSync(new Date().toISOString()); addSyncLog("Sync complete");
    } catch { addSyncLog("Sync failed. Check connection."); }
    finally { setTeamsSyncing(false); }
  };

  const syncOutlookCalendar = async (rawUrl = calendarInput, shouldPersistLink = true) => {
    const calendarUrl = normaliseCalendarUrl(rawUrl || outlookCalendarUrl);
    if (!calendarUrl) {
      setCalendarSyncError("Paste your Outlook assessment calendar link first.");
      return;
    }

    setCalendarSyncing(true);
    setCalendarSyncError("");

    try {
      const response = await fetch("/api/outlook-calendar", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ url: calendarUrl }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Calendar sync failed.");

      const nextImportedExams = data.events.map(event => {
        const existing = exams.find(exam => exam.outlookEventId === event.id);
        return {
          id: existing?.id || uid(),
          subjectId: existing?.subjectId || inferSubjectIdFromTitle(event.title),
          name: event.title,
          board: "Outlook Calendar",
          date: event.date,
          description: event.description || "",
          location: event.location || "",
          outlookEventId: event.id,
        };
      });

      setExams(prev => [...prev.filter(exam => !exam.outlookEventId), ...nextImportedExams]);
      if (shouldPersistLink) setOutlookCalendarUrl(calendarUrl);
      setCalendarInput(calendarUrl);
      setCalendarLastSync(new Date().toISOString());
      if (nextImportedExams.length === 0) {
        setCalendarSyncError("The calendar synced, but no future assessments were found in the published feed.");
      }
    } catch (error) {
      setCalendarSyncError(error instanceof Error ? error.message : "Calendar sync failed.");
    } finally {
      setCalendarSyncing(false);
    }
  };

  const disconnectOutlookCalendar = () => {
    setOutlookCalendarUrl("");
    setCalendarInput("");
    setCalendarLastSync(null);
    setCalendarSyncError("");
    setExams(prev => prev.filter(exam => !exam.outlookEventId));
  };

  // ─── AI Assistant ───
  const buildSystemPrompt = () => {
    const now = new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
    const subSummaries = subjects.map(s => { const avg=avgMark(s.id); const tp=subjectTaskProgress(s.id); const dlCount=subjectDeadlineCount(s.id); return `- ${s.name} (${s.board}, target grade ${s.target}, avg mark ${avg!==null?avg+"%":"no papers yet"}, ${dlCount} deadlines, tasks ${tp?tp.done+"/"+tp.total+" done":"none"})`; }).join("\n");
    const dlSummaries = [...deadlines].sort((a,b)=>new Date(a.date)-new Date(b.date)).map(d=>`- ${d.title} [${subName(d.subjectId)}] due ${fmtDate(d.date)} (${daysUntil(d.date)} days away)`).join("\n");
    const examSummaries = [...exams].sort((a,b)=>new Date(a.date)-new Date(b.date)).map(e=>`- ${e.name} (${e.board}) on ${fmtDate(e.date)} (${daysUntil(e.date)} days away)`).join("\n");
    const taskSummaries = tasks.map(t=>`- [${t.done?"DONE":"TODO"}] ${t.text} [${subName(t.subjectId)}] (${getPriorityMeta(getEffectivePriority(t)).label}, ${formatMinutes(getTaskEstimateMinutes(t))}${t.topic ? `, topic ${t.topic}` : ""})`).join("\n");
    const goalSummaries = goals.map(g=>`- [${g.done?"DONE":"TODO"}] ${g.text} (${g.horizon}${g.subjectId?", "+subName(g.subjectId):""})`).join("\n");
    const plannerSummaries = dailyPlannerTasks.map(task => `- ${task.text} [${subName(task.subjectId)}] (${getPriorityMeta(task.effectivePriority).label}, ${formatMinutes(task.resolvedEstimateMinutes)})`).join("\n");
    return `You are the AI study assistant built into Markd, a student organiser app. You are talking to ${currentUser.name}${currentUser.school ? ` from ${currentUser.school}` : ""}. Today is ${now}. Revision mode is ${revisionMode ? "enabled" : "disabled"}.\n\nHelp them stay on top of schoolwork, plan revision, suggest priorities, and motivate them. Be concise and supportive. Use their actual data below.\n\nTODAY'S SMART PLAN:\n${plannerSummaries||"No planner suggestions yet"}\n\nSUBJECTS:\n${subSummaries||"None yet"}\n\nUPCOMING DEADLINES:\n${dlSummaries||"None"}\n\nUPCOMING EXAMS:\n${examSummaries||"None"}\n\nCURRENT TASKS:\n${taskSummaries||"None"}\n\nGOALS:\n${goalSummaries||"None"}`;
  };

  const sendAiMessage = async () => {
    const text = aiInput.trim();
    if (!text || aiLoading) return;
    const userMsg = { role:"user", content:text };
    const updatedMessages = [...aiMessages, userMsg];
    setAiMessages(updatedMessages);
    setAiInput("");
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({system:buildSystemPrompt(),messages:updatedMessages.map(m=>({role:m.role,content:m.content}))}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI request failed");
      const assistantText = typeof data.text === "string" && data.text.trim()
        ? data.text.trim()
        : "Sorry, I couldn't process that. Try again?";
      setAiMessages(prev=>[...prev,{role:"assistant",content:assistantText}]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Connection issue. Check your network and try again.";
      setAiMessages(prev=>[...prev,{role:"assistant",content:message}]);
    } finally { setAiLoading(false); }
  };

  // ─── Add handlers ───
  const addSubject = () => { if(!form.name) return; setSubjects(s=>[...s,{id:uid(),name:form.name,board:form.board||"AQA",target:form.target||"5",colour:form.colour||PALETTE[0]}]); setModal(null); };
  const addTask = () => {
    if(!form.text||!form.subjectId) return;
    setTasks(t=>[...t,buildTask({
      subjectId:form.subjectId,
      text:form.text,
      priority:form.priority,
      estimateMinutes:form.estimateMinutes,
      topic:form.topic,
    })]);
    setModal(null);
  };
  const addDeadline = () => { if(!form.title||!form.subjectId||!form.date) return; setDeadlines(d=>[...d,{id:uid(),subjectId:form.subjectId,title:form.title,date:form.date}]); setModal(null); };
  const addExam = () => { if(!form.name||!form.subjectId||!form.date) return; setExams(e=>[...e,{id:uid(),subjectId:form.subjectId,name:form.name,board:form.board||sub(form.subjectId)?.board||"AQA",date:form.date}]); setModal(null); };
  const addPaper = () => { if(!form.subjectId||!form.title||!form.scored||!form.total) return; setPapers(p=>[...p,{id:uid(),subjectId:form.subjectId,title:form.title,year:form.year||"",paper:form.paper||"",scored:Number(form.scored),total:Number(form.total),file:form.file||null}]); setModal(null); };
  const addGoal = () => { if(!form.text) return; setGoals(g=>[...g,buildGoal({text:form.text,horizon:form.horizon||"3 months",subjectId:form.subjectId||null,done:false})]); setModal(null); };
  const addPortfolio = () => { if(!form.title||!form.subjectId) return; setPortfolio(p=>[...p,{id:uid(),subjectId:form.subjectId,title:form.title,type:form.type||"Project",desc:form.desc||"",tags:(form.tags||"").split(",").map(t=>t.trim()).filter(Boolean)}]); setModal(null); };
  const addActivity = () => { if(!form.name) return; setActivities(a=>[...a,{id:uid(),name:form.name,role:form.role||"",organisation:form.organisation||"",desc:form.desc||"",colour:form.colour||PALETTE[activities.length%PALETTE.length],hoursPerWeek:Number(form.hoursPerWeek)||0,events:[],achievements:(form.achievements||"").split("\n").map(s=>s.trim()).filter(Boolean),tags:(form.tags||"").split(",").map(t=>t.trim()).filter(Boolean)}]); setModal(null); };

  const urgency = (dateStr) => { const d=daysUntil(dateStr); if(d<7) return{label:"Urgent",color:"var(--danger)"}; if(d<21) return{label:"Soon",color:"var(--accent2)"}; return{label:"Later",color:"var(--accent3)"}; };
  const countdownColor = (d) => d<7?"var(--danger)":d<21?"var(--accent2)":"var(--accent3)";

  const groupBySubject = (items) => {
    const groups = {};
    items.forEach(item => { const sId=item.subjectId; if(!groups[sId]) groups[sId]=[]; groups[sId].push(item); });
    return groups;
  };

  const DeleteBtn = ({ onClick }) => (
    <button className="delete-btn" onClick={(e)=>{e.stopPropagation();onClick();}} aria-label="Delete">
      <Icon d={icons.trash} size={16} color="var(--muted)"/>
    </button>
  );

  // ─── Empty state helper ───
  const EmptyState = ({ icon, message, action, actionLabel }) => (
    <div className="empty-state-full">
      <div className="empty-state-icon"><Icon d={icon} size={32} color="var(--muted)"/></div>
      <div className="empty-state-msg">{message}</div>
      {action && <button className="empty-state-btn" onClick={action}>{actionLabel}</button>}
    </div>
  );
  const renderTaskMeta = (task) => {
    const priority = task.effectivePriority || getEffectivePriority(task);
    const priorityMeta = getPriorityMeta(priority);
    const estimate = task.resolvedEstimateMinutes || getTaskEstimateMinutes(task);
    return (
      <div className="task-meta-row">
        <span className="badge" style={{background:priorityMeta.color+"22",color:priorityMeta.color}}>{priorityMeta.label}</span>
        <span className="task-time-pill">{formatMinutes(estimate)}</span>
        {task.topic && <span className="task-topic-pill">{task.topic}</span>}
      </div>
    );
  };
  const renderQuickAddComposer = () => {
    const previewSubjectId = quickTaskSubjectId || inferSubjectIdFromTitle(quickTaskText) || null;
    const previewPriority = getPriorityMeta(
      getEffectivePriority({
        text: quickTaskText,
        priority: inferPriorityFromText(quickTaskText),
        subjectId: previewSubjectId,
        createdAt: new Date().toISOString(),
      })
    );
    const previewEstimate = estimateFromText(quickTaskText);
    return (
      <div className="quick-add-card">
        <div className="quick-add-header">
          <div>
            <div className="quick-add-title">Quick add</div>
            <div className="quick-add-sub">Create a task instantly. Markd will suggest the time and urgency.</div>
          </div>
        </div>
        <div className="quick-add-grid">
          <input
            className="modal-input"
            placeholder="What do you need to do?"
            value={quickTaskText}
            onChange={event => setQuickTaskText(event.target.value)}
            onKeyDown={event => event.key === "Enter" && quickAddTask()}
          />
          <select className="modal-input" value={quickTaskSubjectId} onChange={event => setQuickTaskSubjectId(event.target.value)}>
            <option value="">Auto subject</option>
            {subjects.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          </select>
          <input
            className="modal-input"
            placeholder="Topic (optional)"
            value={quickTaskTopic}
            onChange={event => setQuickTaskTopic(event.target.value)}
            onKeyDown={event => event.key === "Enter" && quickAddTask()}
          />
          <button className="quick-add-btn" onClick={quickAddTask} disabled={!quickTaskText.trim()}>Add task</button>
        </div>
        {quickTaskText.trim() && (
          <div className="quick-add-preview">
            <span>Suggested plan:</span>
            <span className="badge" style={{background:previewPriority.color+"22",color:previewPriority.color}}>{previewPriority.label}</span>
            <span className="task-time-pill">{formatMinutes(previewEstimate)}</span>
            {previewSubjectId && <span className="task-topic-pill">{subName(previewSubjectId)}</span>}
          </div>
        )}
      </div>
    );
  };
  const renderPlannerPanel = () => (
    <div className="planner-card">
      <div className="planner-head">
        <div>
          <div className="planner-eyebrow">Smart daily planner</div>
          <div className="planner-title">Today’s focus list</div>
        </div>
        <button className={`revision-toggle ${revisionMode ? "active" : ""}`} onClick={() => setRevisionMode(mode => !mode)}>
          {revisionMode ? "Revision mode on" : "Revision mode off"}
        </button>
      </div>
      <div className="planner-sub">Refreshes every day and carries unfinished work forward automatically.</div>
      <div className="planner-summary-grid">
        <div className="planner-summary-card">
          <span className="planner-summary-label">Planned focus</span>
          <span className="planner-summary-value">{formatMinutes(dailyPlannerTasks.reduce((sum, task) => sum + task.resolvedEstimateMinutes, 0))}</span>
        </div>
        <div className="planner-summary-card">
          <span className="planner-summary-label">Done today</span>
          <span className="planner-summary-value">{completedTodayTasks.length + completedTodayGoals.length}</span>
        </div>
        <div className="planner-summary-card">
          <span className="planner-summary-label">Streak</span>
          <span className="planner-summary-value">{streak} day{streak === 1 ? "" : "s"}</span>
        </div>
      </div>
      {suggestedTask ? (
        <div className="next-task-card">
          <div style={{flex:1}}>
            <div className="next-task-label">Do next</div>
            <div className="next-task-name">{suggestedTask.text}</div>
            <div className="next-task-sub">{subName(suggestedTask.subjectId)}</div>
            {renderTaskMeta(suggestedTask)}
          </div>
          <button className="next-task-btn" onClick={() => focusTask(suggestedTask.id)}>Do Next</button>
        </div>
      ) : (
        <div className="empty-state" style={{padding:"18px 0 8px"}}>Add a few tasks and Markd will build your plan.</div>
      )}
      {dailyPlannerTasks.length > 0 && (
        <div className="planner-task-list">
          {dailyPlannerTasks.map(task => (
            <div key={task.id} className={`planner-task-item ${highlightedTaskId === task.id ? "highlighted" : ""}`}>
              <button
                className={`task-check ${task.done ? "checked" : ""} ${completionBurstId === task.id ? "burst" : ""}`}
                style={{borderColor:subColour(task.subjectId),background:task.done?subColour(task.subjectId):"transparent"}}
                onClick={() => toggleTaskDone(task.id)}
              >
                {task.done ? "✓" : ""}
              </button>
              <div style={{flex:1}}>
                <div className="planner-task-name">{task.text}</div>
                <div className="planner-task-sub">{subName(task.subjectId)}</div>
                {renderTaskMeta(task)}
              </div>
              <button className="focus-chip" onClick={() => focusTask(task.id)}>Open</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const Field = ({ label, children }) => (
    <div className="modal-field">
      <div className="field-label">{label}</div>
      {children}
    </div>
  );

  // ═══════════════════════════════════
  // PAGES
  // ═══════════════════════════════════
  const renderHome = () => {
    const totalDeadlines = deadlines.length;
    const tasksDone = tasks.filter(t=>t.done).length;
    const totalTasks = tasks.length;
    const sortedExams = [...exams].sort((a,b)=>new Date(a.date)-new Date(b.date));
    const nextExam = sortedExams[0];
    const sortedDeadlines = [...deadlines].sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,3);
    const recentTasks = tasks.slice(-4);
    const firstName = currentUser.name.split(" ")[0];
    return (
      <div className="page">
        {demoMode && <div className="demo-note-card">Demo admin mode is loaded with sample data. Any changes you make here reset the next time you open the demo.</div>}
        <h2 className="page-title">Hey, {firstName} 👋</h2>
        {subjects.length === 0 ? (
          <div className="onboarding-card">
            <div className="onboarding-title">Welcome to Markd</div>
            <div className="onboarding-sub">Start by adding your subjects, then track deadlines, exams, and goals.</div>
            <button className="onboarding-btn" onClick={()=>{ setPage("subjects"); openModal("addSubject"); }}>Add your first subject</button>
          </div>
        ) : (<>
          {renderPlannerPanel()}
          <div className="stat-row">
            <div className="stat-card"><div className="stat-num">{totalDeadlines}</div><div className="stat-label">Deadlines</div></div>
            <div className="stat-card"><div className="stat-num">{tasksDone}/{totalTasks}</div><div className="stat-label">Tasks Done</div></div>
            <div className="stat-card"><div className="stat-num">{subjects.length}</div><div className="stat-label">Subjects</div></div>
          </div>
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-card-title">Weekly summary</div>
              <div className="summary-card-main">{weeklySummary.tasks} tasks</div>
              <div className="summary-card-sub">{formatMinutes(weeklySummary.minutes)} focused work · {weeklySummary.goals} goals finished</div>
            </div>
            <div className="summary-card">
              <div className="summary-card-title">Level {level}</div>
              <div className="progress-bar"><div className="progress-fill" style={{width:`${Math.round((levelProgress / XP_PER_LEVEL) * 100)}%`,background:"var(--accent)"}}/></div>
              <div className="summary-card-sub">{levelProgress}/{XP_PER_LEVEL} XP into this level</div>
            </div>
            <div className="summary-card">
              <div className="summary-card-title">Momentum</div>
              <div className="summary-card-main">{streak} day streak</div>
              <div className="summary-card-sub">{unlockedAchievements.length} achievements unlocked</div>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-title">Insight</div>
            <div className="insight-copy">{motivationalInsight}</div>
          </div>
          {!revisionMode && unlockedAchievements.length > 0 && (
            <>
              <div className="section-header"><span>Achievements</span><span className="link-btn" style={{cursor:"default"}}>{unlockedAchievements.length} unlocked</span></div>
              <div className="achievement-grid">
                {unlockedAchievements.slice(0, 4).map(achievement => (
                  <div key={achievement.id} className="achievement-card">
                    <div className="achievement-title">{achievement.title}</div>
                    <div className="achievement-desc">{achievement.desc}</div>
                  </div>
                ))}
              </div>
            </>
          )}
          {nextExam && (
            <div className="next-exam-card" onClick={()=>setPage("exams")}>
              <div className="next-exam-label">Next Exam</div>
              <div className="next-exam-name">{nextExam.name}</div>
              <div className="next-exam-date">{fmtDate(nextExam.date)}</div>
              <div className="next-exam-days" style={{color:countdownColor(daysUntil(nextExam.date))}}>{daysUntil(nextExam.date)} days</div>
            </div>
          )}
          <div className="section-header"><span>Subject health</span><button className="link-btn" onClick={()=>setPage("subjects")}>Open subjects <Icon d={icons.chevron} size={14}/></button></div>
          <div className="health-grid">
            {subjects.map(subject => {
              const health = getSubjectHealth(subject.id);
              const nextSubjectExam = getNextExamForSubject(subject.id);
              return (
                <div key={subject.id} className="health-card" style={{borderTop:`3px solid ${subject.colour}`}}>
                  <div className="health-card-name">{subject.name}</div>
                  <div className="health-card-score" style={{color:getHealthTone(health)}}>{health}</div>
                  <div className="health-card-label">health score</div>
                  <div className="health-card-sub">{nextSubjectExam ? `${daysUntil(nextSubjectExam.date)} days to ${nextSubjectExam.name}` : "No exam scheduled"}</div>
                </div>
              );
            })}
          </div>
          {sortedDeadlines.length > 0 && <>
            <div className="section-header"><span>Upcoming Deadlines</span><button className="link-btn" onClick={()=>setPage("deadlines")}>View all <Icon d={icons.chevron} size={14}/></button></div>
            {sortedDeadlines.map(dl => { const u=urgency(dl.date); return (<div key={dl.id} className="list-item" style={{borderLeft:`3px solid ${subColour(dl.subjectId)}`}}><div><div className="list-item-title">{dl.title}</div><div className="list-item-sub">{fmtDate(dl.date)}</div></div><span className="badge" style={{background:u.color+"22",color:u.color}}>{u.label}</span></div>); })}
          </>}
          {!revisionMode && (
            <>
              <div className="section-header"><span>Subjects</span><button className="link-btn" onClick={()=>setPage("subjects")}>View all <Icon d={icons.chevron} size={14}/></button></div>
              <div className="subjects-mini-grid">
                {subjects.map(s => (<div key={s.id} className="subject-mini" style={{borderTop:`3px solid ${s.colour}`}}><div className="subject-mini-name">{s.name}</div><div className="subject-mini-stats"><span>Target: {s.target}</span>{avgMark(s.id)!==null&&<span>Avg: {avgMark(s.id)}%</span>}</div></div>))}
              </div>
              {recentTasks.length > 0 && <>
                <div className="section-header"><span>Recent Tasks</span><button className="link-btn" onClick={()=>setPage("tasks")}>View all <Icon d={icons.chevron} size={14}/></button></div>
                {recentTasks.map(t => (<div key={t.id} className="list-item" style={{borderLeft:`3px solid ${subColour(t.subjectId)}`}}><div style={{display:"flex",alignItems:"center",gap:8}}><span className={`task-check ${t.done?"checked":""}`} style={{borderColor:subColour(t.subjectId),background:t.done?subColour(t.subjectId):"transparent"}}>{t.done?"✓":""}</span><div><span style={{textDecoration:t.done?"line-through":"none",color:t.done?"var(--muted)":"var(--text)"}}>{t.text}</span>{renderTaskMeta(t)}</div></div></div>))}
              </>}
            </>
          )}
        </>)}
      </div>
    );
  };

  const renderSubjects = () => (
    <div className="page">
      <h2 className="page-title">Subjects</h2>
      {subjects.length === 0 ? <EmptyState icon={icons.book} message="No subjects yet. Tap + to add your first subject." action={()=>openModal("addSubject")} actionLabel="Add Subject"/> :
      subjects.map(s => {
        const avg=avgMark(s.id); const dlCount=subjectDeadlineCount(s.id); const tp=subjectTaskProgress(s.id);
        const health = getSubjectHealth(s.id);
        const nextSubjectExam = getNextExamForSubject(s.id);
        const topicProgress = getTopicProgress(s.id);
        return (
          <div key={s.id} className="subject-card" style={{borderLeft:`4px solid ${s.colour}`}}>
            <div className="subject-card-header"><div><div className="subject-card-name">{s.name}</div><div className="subject-card-board">{s.board}</div></div><DeleteBtn onClick={()=>deleteSubject(s.id)}/></div>
            <div className="subject-card-stats">
              <div className="subject-stat"><span className="subject-stat-label">Target</span><span className="subject-stat-val" style={{color:s.colour}}>{s.target}</span></div>
              <div className="subject-stat"><span className="subject-stat-label">Avg Mark</span><span className="subject-stat-val">{avg!==null?avg+"%":"---"}</span></div>
              <div className="subject-stat"><span className="subject-stat-label">Deadlines</span><span className="subject-stat-val">{dlCount}</span></div>
              <div className="subject-stat"><span className="subject-stat-label">Health</span><span className="subject-stat-val" style={{color:getHealthTone(health)}}>{health}</span></div>
            </div>
            {tp && (<div className="progress-wrap"><div className="progress-bar"><div className="progress-fill" style={{width:`${(tp.done/tp.total)*100}%`,background:s.colour}}/></div><span className="progress-label">{tp.done}/{tp.total} tasks</span></div>)}
            <div className="subject-card-meta">
              <span>{nextSubjectExam ? `${daysUntil(nextSubjectExam.date)} days to ${nextSubjectExam.name}` : "No exam scheduled"}</span>
              {avg !== null && <span>Projected grade {getProjectedGrade(s) || s.target}</span>}
            </div>
            {topicProgress.length > 0 && (
              <div className="topic-row">
                {topicProgress.map(topic => (
                  <span key={topic.topic} className="topic-chip">
                    {topic.topic} {topic.done}/{topic.total}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderTasks = () => {
    const sortedTasks = [...tasks].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return getTaskScore(b) - getTaskScore(a);
    });
    const grouped = groupBySubject(sortedTasks);
    return (
      <div className="page">
        <h2 className="page-title">Tasks</h2>
        {renderPlannerPanel()}
        {renderQuickAddComposer()}
        {tasks.length === 0 ? <EmptyState icon={icons.check} message="No tasks yet. Tap + to add a task." action={()=>openModal("addTask")} actionLabel="Add Task"/> :
        Object.entries(grouped).map(([sId,items]) => (
          <div key={sId} className="group-section">
            <div className="group-label" style={{color:subColour(sId)}}>{subName(sId)}</div>
            {items.map(t => (
              <div key={t.id} className={`list-item task-list-item ${highlightedTaskId === t.id ? "highlighted" : ""} ${completionBurstId === t.id ? "completed-burst" : ""}`} style={{borderLeft:`3px solid ${subColour(t.subjectId)}`}}>
                <div style={{display:"flex",alignItems:"center",gap:10,flex:1}}>
                  <span className={`task-check ${t.done?"checked":""} ${completionBurstId === t.id ? "burst" : ""}`} style={{borderColor:subColour(t.subjectId),background:t.done?subColour(t.subjectId):"transparent"}} onClick={()=>toggleTaskDone(t.id)}>{t.done?"✓":""}</span>
                  <div style={{flex:1}}>
                    <div style={{textDecoration:t.done?"line-through":"none",color:t.done?"var(--muted)":"var(--text)"}}>{t.text}</div>
                    {renderTaskMeta(t)}
                  </div>
                </div>
                {!t.done && <button className="focus-chip" onClick={()=>focusTask(t.id)}>Next</button>}
                <DeleteBtn onClick={()=>deleteTask(t.id)}/>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderDeadlines = () => {
    const grouped = groupBySubject([...deadlines].sort((a,b)=>new Date(a.date)-new Date(b.date)));
    return (
      <div className="page">
        <h2 className="page-title">Deadlines</h2>
        {deadlines.length === 0 ? <EmptyState icon={icons.calendar} message="No deadlines yet. Tap + to add one." action={()=>openModal("addDeadline")} actionLabel="Add Deadline"/> :
        Object.entries(grouped).map(([sId,items]) => (
          <div key={sId} className="group-section">
            <div className="group-label" style={{color:subColour(sId)}}>{subName(sId)}</div>
            {items.map(dl => { const u=urgency(dl.date); const d=daysUntil(dl.date); return (
              <div key={dl.id} className="list-item" style={{borderLeft:`3px solid ${subColour(dl.subjectId)}`}}>
                <div style={{flex:1}}><div className="list-item-title">{dl.title}</div><div className="list-item-sub">{fmtDate(dl.date)} · {d} days</div></div>
                <span className="badge" style={{background:u.color+"22",color:u.color}}>{u.label}</span>
                <DeleteBtn onClick={()=>deleteDeadline(dl.id)}/>
              </div>
            ); })}
          </div>
        ))}
      </div>
    );
  };

  const renderExams = () => {
    const sorted = [...exams].sort((a,b)=>new Date(a.date)-new Date(b.date));
    return (
      <div className="page">
        <h2 className="page-title">Exams</h2>
        {exams.length === 0 ? <EmptyState icon={icons.clock} message="No exams yet. Tap + to add one manually or import your assessment calendar." action={()=>openModal("examActions")} actionLabel="Add to Exams"/> :
        sorted.map(ex => { const d=daysUntil(ex.date); return (
          <div key={ex.id} className="exam-card" style={{borderLeft:`4px solid ${subColour(ex.subjectId)}`}}>
            <div style={{flex:1}}><div className="exam-name">{ex.name}</div><div className="exam-board">{ex.board}</div><div className="exam-date">{fmtDate(ex.date)}</div></div>
            <div className="exam-days" style={{color:countdownColor(d)}}>{d}<span className="exam-days-label">days</span></div>
            <DeleteBtn onClick={()=>deleteExam(ex.id)}/>
          </div>
        ); })}
      </div>
    );
  };

  const renderPapers = () => {
    const grouped = groupBySubject(papers);
    return (
      <div className="page">
        <h2 className="page-title">Past Papers</h2>
        <div className="tab-row">
          <button className={`tab-btn ${paperTab==="my"?"active":""}`} onClick={()=>setPaperTab("my")}>My Papers</button>
          <button className={`tab-btn ${paperTab==="find"?"active":""}`} onClick={()=>setPaperTab("find")}>Find Papers</button>
        </div>
        {paperTab === "my" ? (
          papers.length === 0 ? <EmptyState icon={icons.file} message="No papers logged yet. Tap + to add one." action={()=>openModal("addPaper")} actionLabel="Add Paper"/> :
          Object.entries(grouped).map(([sId,items]) => {
            const sAvg = Math.round(items.reduce((a,p)=>a+(p.scored/p.total)*100,0)/items.length);
            const subject = sub(sId);
            const projected = getProjectedGrade(subject);
            return (
              <div key={sId} className="group-section">
                <div className="group-label" style={{color:subColour(sId)}}>{subName(sId)} <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,marginLeft:8,color:"var(--text)"}}>Avg: {sAvg}%</span></div>
                <div className="paper-summary-strip">
                  <span className="paper-summary-pill">Trend {items.length >= 2 ? `${Math.round((items[items.length - 1].scored / items[items.length - 1].total) * 100) - Math.round((items[0].scored / items[0].total) * 100) >= 0 ? "+" : ""}${Math.round((items[items.length - 1].scored / items[items.length - 1].total) * 100) - Math.round((items[0].scored / items[0].total) * 100)}%` : "Building"}</span>
                  {projected && <span className="paper-summary-pill">Projected {projected}</span>}
                </div>
                <div className="trend-bars">
                  {items.map(paper => {
                    const pct = Math.round((paper.scored / paper.total) * 100);
                    return <div key={paper.id} className="trend-bar" style={{height:`${Math.max(18, pct)}%`, background: pct>=70?"var(--accent3)":pct>=50?"var(--accent2)":"var(--danger)"}} title={`${paper.title}: ${pct}%`} />;
                  })}
                </div>
                {items.map(p => { const pct=Math.round((p.scored/p.total)*100); return (
                  <div key={p.id} className="paper-card" style={{borderLeft:`3px solid ${subColour(p.subjectId)}`}}>
                    <div className="paper-header"><div><div className="list-item-title">{p.title}</div><div className="list-item-sub">{p.year}{p.paper?` - Paper ${p.paper}`:""}</div></div><div style={{display:"flex",alignItems:"center",gap:8}}><div className="paper-score">{p.scored}/{p.total} <span className="paper-pct">({pct}%)</span></div><DeleteBtn onClick={()=>deletePaper(p.id)}/></div></div>
                    <div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`,background:pct>=70?"var(--accent3)":pct>=50?"var(--accent2)":"var(--danger)"}}/></div>
                  </div>
                ); })}
              </div>
            );
          })
        ) : (
          <div className="link-list">
            {PAPER_LINKS.map(l => (<a key={l.name} className="link-card" href={l.url} target="_blank" rel="noopener noreferrer"><div><div className="link-card-name">{l.name}</div><div className="link-card-desc">{l.desc}</div></div><Icon d={icons.link} size={18} color="var(--accent)"/></a>))}
          </div>
        )}
      </div>
    );
  };

  const renderGoals = () => {
    const filtered = goals.filter(g=>g.horizon===goalHorizon);
    const horizonProgress = (h) => { const hg=goals.filter(g=>g.horizon===h); if(!hg.length) return 0; return Math.round((hg.filter(g=>g.done).length/hg.length)*100); };
    const marksVsTarget = subjects.map(s => { const avg=avgMark(s.id); const tPct=gradeToPercent(s.target); return {...s,avg,targetPct:tPct,gap:avg!==null?avg-tPct:null}; }).filter(s=>s.avg!==null);
    return (
      <div className="page">
        <h2 className="page-title">Goals</h2>
        <div className="tab-row">
          <button className={`tab-btn ${goalTab==="goals"?"active":""}`} onClick={()=>setGoalTab("goals")}>Goals</button>
          <button className={`tab-btn ${goalTab==="marks"?"active":""}`} onClick={()=>setGoalTab("marks")}>Marks vs Target</button>
        </div>
        {goalTab === "goals" ? (<>
          <div className="horizon-row">{HORIZONS.map(h=><button key={h} className={`horizon-btn ${goalHorizon===h?"active":""}`} onClick={()=>setGoalHorizon(h)}>{h}</button>)}</div>
          {filtered.length === 0 ? <EmptyState icon={icons.target} message={`No goals for ${goalHorizon}. Tap + to add one.`} action={()=>openModal("addGoal")} actionLabel="Add Goal"/> :
          filtered.map(g => (
            <div key={g.id} className="list-item">
              <div style={{display:"flex",alignItems:"flex-start",gap:10,flex:1}}>
                <span className={`goal-check ${g.done?"checked":""}`} onClick={()=>toggleGoalDone(g.id)}/>
                <div><span style={{color:g.done?"var(--muted)":"var(--text)",textDecoration:g.done?"line-through":"none"}}>{g.text}</span>{g.subjectId&&<div className="goal-subject-tag" style={{background:subColour(g.subjectId)+"22",color:subColour(g.subjectId)}}>{subName(g.subjectId)}</div>}</div>
              </div>
              <DeleteBtn onClick={()=>deleteGoal(g.id)}/>
            </div>
          ))}
          <div className="goals-overview"><div className="goals-overview-title">Progress Overview</div>{HORIZONS.map(h=><div key={h} className="goals-overview-row"><span className="goals-overview-label">{h}</span><div className="progress-bar" style={{flex:1}}><div className="progress-fill" style={{width:`${horizonProgress(h)}%`,background:"var(--accent)"}}/></div><span className="goals-overview-pct">{horizonProgress(h)}%</span></div>)}</div>
        </>) : (<>
          {marksVsTarget.length===0?<div className="empty-state">Log some past papers to see your marks vs targets.</div>:marksVsTarget.map(s=>(
            <div key={s.id} className="mvt-card"><div className="mvt-name">{s.name}</div><div className="mvt-bars"><div className="mvt-bar-row"><span className="mvt-bar-label">Actual</span><div className="progress-bar" style={{flex:1}}><div className="progress-fill" style={{width:`${s.avg}%`,background:s.avg>=s.targetPct?"var(--accent3)":"var(--danger)"}}/></div><span className="mvt-bar-val">{s.avg}%</span></div><div className="mvt-bar-row"><span className="mvt-bar-label">Target</span><div className="progress-bar" style={{flex:1}}><div className="progress-fill" style={{width:`${s.targetPct}%`,background:s.colour}}/></div><span className="mvt-bar-val">{s.targetPct}%</span></div></div><div className="mvt-gap" style={{color:s.gap>=0?"var(--accent3)":"var(--danger)"}}>{s.gap>=0?"+":""}{s.gap}%</div></div>
          ))}
        </>)}
      </div>
    );
  };

  const exportPortfolioPDF = () => {
    const today_str = new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
    const entries = portfolio.map(pf => { const sCol=subColour(pf.subjectId); const sNm=subName(pf.subjectId); const typeCol=TYPE_COLOURS[pf.type]||"#7c6af7"; const tagsHtml=pf.tags.length>0?`<div class="tags">${pf.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</div>`:""; return `<div class="entry" style="border-left:4px solid ${sCol}"><div class="entry-header"><h3>${pf.title}</h3><div class="meta"><span class="type-badge" style="background:${typeCol}22;color:${typeCol}">${pf.type}</span><span class="subject" style="color:${sCol}">${sNm}</span></div></div>${pf.desc?`<p class="desc">${pf.desc}</p>`:""}${tagsHtml}</div>`; }).join("");
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Markd Portfolio — ${currentUser.name}</title><link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'DM Mono',monospace;font-size:12px;color:#1a1a24;padding:40px;max-width:700px;margin:0 auto}.header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:8px;padding-bottom:16px;border-bottom:2px solid #7c6af7}.logo{font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:#0a0a0f}.entry{background:#fafafe;border:1px solid #e8e8f0;border-radius:10px;padding:18px;margin-bottom:14px}.entry-header h3{font-family:'Syne',sans-serif;font-weight:700;font-size:15px;margin-bottom:8px}.meta{display:flex;align-items:center;gap:10px;margin-bottom:6px}.type-badge{font-size:10px;padding:3px 8px;border-radius:5px}.desc{font-size:12px;color:#3a3a4a;line-height:1.6;margin-top:8px}.tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.tag{font-size:10px;padding:3px 8px;border-radius:4px;background:#f0f0f8;color:#6b6b80}</style></head><body><div class="header"><div><div class="logo">Markd</div><div style="font-size:13px;color:#6b6b80;margin-top:4px">${currentUser.name}</div></div><div>${today_str}</div></div>${entries}</body></html>`;
    const w = window.open("","_blank");
    if (w) { w.document.write(html); w.document.close(); setTimeout(()=>w.print(),400); }
  };

  const renderPortfolio = () => (
    <div className="page">
      <div className="portfolio-page-header">
        <h2 className="page-title" style={{marginBottom:0}}>Portfolio</h2>
        {portfolio.length>0&&<button className="export-btn" onClick={exportPortfolioPDF}><Icon d={icons.download} size={16} color="var(--accent)"/><span>Export PDF</span></button>}
      </div>
      {portfolio.length===0?<EmptyState icon={icons.briefcase} message="No portfolio entries yet. Tap + to add one." action={()=>openModal("addPortfolio")} actionLabel="Add Entry"/>:
      portfolio.map(pf => (
        <div key={pf.id} className="portfolio-card" style={{borderLeft:`4px solid ${subColour(pf.subjectId)}`}}>
          <div className="portfolio-header"><div className="portfolio-title">{pf.title}</div><DeleteBtn onClick={()=>deletePortfolio(pf.id)}/></div>
          <div className="portfolio-meta"><span className="portfolio-type" style={{background:TYPE_COLOURS[pf.type]+"22",color:TYPE_COLOURS[pf.type]}}>{pf.type}</span><span className="portfolio-subject" style={{color:subColour(pf.subjectId)}}>{subName(pf.subjectId)}</span></div>
          {pf.desc&&<div className="portfolio-desc">{pf.desc}</div>}
          {pf.tags.length>0&&<div className="portfolio-tags">{pf.tags.map((tag,i)=><span key={i} className="tag-chip">{tag}</span>)}</div>}
        </div>
      ))}
    </div>
  );

  const renderActivities = () => (
    <div className="page">
      <h2 className="page-title">Activities</h2>
      {activities.length===0?<EmptyState icon={icons.trophy} message="No activities yet. Tap + to add an extracurricular." action={()=>openModal("addActivity")} actionLabel="Add Activity"/>:
      activities.map(a => {
        const nextEvent=[...(a.events||[])].filter(e=>e.date&&daysUntil(e.date)>=0).sort((x,y)=>new Date(x.date)-new Date(y.date))[0];
        return (
          <div key={a.id} className="activity-card" style={{borderLeft:`4px solid ${a.colour}`}}>
            <div className="activity-header"><div style={{flex:1}}><div className="activity-name">{a.name}</div>{a.organisation&&<div className="activity-org">{a.organisation}</div>}{a.role&&<div className="activity-role" style={{color:a.colour}}>{a.role}</div>}</div><DeleteBtn onClick={()=>deleteActivity(a.id)}/></div>
            {a.desc&&<div className="activity-desc">{a.desc}</div>}
            <div className="activity-stats">
              {a.hoursPerWeek>0&&<div className="activity-stat"><span className="activity-stat-label">Hours / week</span><span className="activity-stat-val" style={{color:a.colour}}>{a.hoursPerWeek}h</span></div>}
              {nextEvent&&<div className="activity-stat"><span className="activity-stat-label">Next event</span><span className="activity-stat-val" style={{color:countdownColor(daysUntil(nextEvent.date))}}>{daysUntil(nextEvent.date)}d</span></div>}
              {a.achievements?.length>0&&<div className="activity-stat"><span className="activity-stat-label">Achievements</span><span className="activity-stat-val">{a.achievements.length}</span></div>}
            </div>
            {a.events?.length>0&&(<div className="activity-section"><div className="activity-section-label">Upcoming Events</div>{a.events.filter(e=>e.date&&daysUntil(e.date)>=0).sort((x,y)=>new Date(x.date)-new Date(y.date)).map((e,i)=>{ const d=daysUntil(e.date); return(<div key={i} className="activity-event"><div><div className="activity-event-title">{e.title}</div><div className="activity-event-date">{fmtDate(e.date)}</div></div><span className="badge" style={{background:countdownColor(d)+"22",color:countdownColor(d)}}>{d}d</span></div>); })}</div>)}
            {a.achievements?.length>0&&(<div className="activity-section"><div className="activity-section-label">Achievements</div>{a.achievements.map((ach,i)=>(<div key={i} className="activity-achievement"><span className="activity-bullet" style={{background:a.colour}}/><span>{ach}</span></div>))}</div>)}
            {a.tags?.length>0&&<div className="portfolio-tags">{a.tags.map((tag,i)=><span key={i} className="tag-chip">{tag}</span>)}</div>}
          </div>
        );
      })}
    </div>
  );

  // ═══════════════════════════════════
  // CONFIRM DIALOG
  // ═══════════════════════════════════
  const renderConfirmDialog = () => {
    if (!confirmDialog) return null;
    return (
      <div className="modal-overlay" style={{zIndex:400}} onClick={()=>setConfirmDialog(null)}>
        <div className="confirm-dialog" onClick={e=>e.stopPropagation()}>
          <div className="confirm-icon"><Icon d={icons.trash} size={22} color="var(--danger)"/></div>
          <div className="confirm-message">{confirmDialog.message}</div>
          <div className="confirm-note">This can be undone from Recently Deleted in Settings.</div>
          <div className="confirm-actions">
            <button className="confirm-cancel" onClick={()=>setConfirmDialog(null)}>Cancel</button>
            <button className="confirm-delete" onClick={()=>{ confirmDialog.onConfirm(); setConfirmDialog(null); }}>Delete</button>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════
  // AI PANEL
  // ═══════════════════════════════════
  const renderAiPanel = () => {
    if (!aiOpen) return null;
    return (
      <div className="modal-overlay" onClick={()=>setAiOpen(false)}>
        <div className="ai-sheet" onClick={e=>e.stopPropagation()}>
          <div className="modal-handle"/>
          <div className="ai-header"><div className="ai-header-left"><Icon d={icons.sparkle} size={18} color="var(--accent)"/><span className="ai-title">Study Assistant</span></div><button className="ai-close" onClick={()=>setAiOpen(false)}><Icon d={icons.x} size={18} color="var(--muted)"/></button></div>
          <div className="ai-messages">
            {aiMessages.length===0&&(<div className="ai-welcome"><div className="ai-welcome-icon"><Icon d={icons.sparkle} size={28} color="var(--accent)"/></div><div className="ai-welcome-text">Hey {currentUser.name.split(" ")[0]}! Ask me anything about your subjects, revision planning, or upcoming exams.</div></div>)}
            {aiMessages.map((m,i)=>(<div key={i} className={`ai-msg ${m.role}`}><div className={`ai-bubble ${m.role}`}>{m.content}</div></div>))}
            {aiLoading&&(<div className="ai-msg assistant"><div className="ai-bubble assistant ai-typing"><span className="dot"/><span className="dot"/><span className="dot"/></div></div>)}
          </div>
          <div className="ai-input-row">
            <input className="ai-input" placeholder="Ask me anything..." value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter") sendAiMessage(); }}/>
            <button className="ai-send" onClick={sendAiMessage} disabled={aiLoading||!aiInput.trim()}><Icon d={icons.send} size={18} color={aiInput.trim()?"white":"var(--muted)"}/></button>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════
  // SETTINGS PANEL
  // ═══════════════════════════════════
  const MicrosoftLogo = () => (<svg width="16" height="16" viewBox="0 0 21 21"><rect x="0" y="0" width="10" height="10" fill="#f25022"/><rect x="11" y="0" width="10" height="10" fill="#7fba00"/><rect x="0" y="11" width="10" height="10" fill="#00a4ef"/><rect x="11" y="11" width="10" height="10" fill="#ffb900"/></svg>);

  const renderSettingsPanel = () => {
    if (!settingsOpen) return null;
    const syncTimeAgo = teamsLastSync ? (()=>{ const mins=Math.floor((Date.now()-new Date(teamsLastSync))/60000); if(mins<1) return "just now"; if(mins<60) return `${mins}m ago`; return `${Math.floor(mins/60)}h ago`; })() : null;
    return (
      <div className="modal-overlay" onClick={()=>{ setSettingsOpen(false); setResetStep(0); }}>
        <div className="settings-sheet" onClick={e=>e.stopPropagation()}>
          <div className="modal-handle"/>
          <div className="settings-header"><Icon d={icons.settings} size={20} color="var(--accent)"/><span className="settings-title">Settings</span></div>
          <div className="tab-row" style={{marginBottom:16}}>
            <button className={`tab-btn ${settingsTab==="general"?"active":""}`} onClick={()=>setSettingsTab("general")}>General</button>
            <button className={`tab-btn ${settingsTab==="deleted"?"active":""}`} onClick={()=>setSettingsTab("deleted")}>Recently Deleted {recentlyDeleted.length>0&&<span className="deleted-badge">{recentlyDeleted.length}</span>}</button>
          </div>

          {settingsTab === "general" ? (<>
            <div className="settings-section">
              <div className="settings-profile">
                <div className="settings-avatar">{userInitial}</div>
                <div><div className="settings-name">{currentUser.name}</div><div className="settings-email">{currentUser.email}</div>{currentUser.school&&<div className="settings-school">{currentUser.school}</div>}</div>
              </div>
              {demoMode && <div className="demo-settings-note">Demo admin workspace. Changes made here never sync and reset every time you log back into the demo.</div>}
              <button className="logout-btn" onClick={handleLogout}><Icon d={icons.logout} size={14} color="var(--danger)"/><span>{demoMode ? "Exit demo" : "Sign out"}</span></button>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">Microsoft Teams</div>
              {!teamsConnected?(<button className="teams-connect-btn" onClick={loginTeams}><MicrosoftLogo/><span>Connect Microsoft Teams</span></button>):(
                <div className="teams-connected">
                  <div className="teams-status-row"><div className="teams-status-dot"/><span className="teams-status-text">Connected</span>{syncTimeAgo&&<span className="teams-sync-time">Synced {syncTimeAgo}</span>}</div>
                  <div className="teams-actions"><button className="teams-sync-btn" onClick={syncTeams} disabled={teamsSyncing}><Icon d={icons.sync} size={14} color="var(--accent)"/><span>{teamsSyncing?"Syncing...":"Sync Now"}</span></button><button className="teams-disconnect-btn" onClick={logoutTeams}>Disconnect</button></div>
                  <div className="teams-autosync-row"><span>Auto-sync on open</span><button className={`toggle ${autoSync?"on":""}`} onClick={()=>setAutoSync(!autoSync)}><div className="toggle-knob"/></button></div>
                </div>
              )}
            </div>

            {syncLog.length>0&&(<div className="settings-section"><div className="settings-section-title">Sync Log</div><div className="sync-log">{syncLog.map((entry,i)=>(<div key={i} className="sync-log-entry"><span className="sync-log-time">{entry.time}</span><span className="sync-log-msg">{entry.msg}</span></div>))}</div></div>)}

            <div className="settings-section">
              <div className="settings-section-title">Appearance</div>
              <div className="theme-toggle-row">
                <button className={`theme-option ${theme==="dark"?"active":""}`} onClick={()=>setTheme("dark")}><div className="theme-preview dark-preview"><div className="theme-preview-bar"/><div className="theme-preview-card"/></div><span>Dark</span></button>
                <button className={`theme-option ${theme==="light"?"active":""}`} onClick={()=>setTheme("light")}><div className="theme-preview light-preview"><div className="theme-preview-bar"/><div className="theme-preview-card"/></div><span>Light</span></button>
              </div>
              <div className="teams-autosync-row" style={{marginTop:12}}>
                <span>Revision mode</span>
                <button className={`toggle ${revisionMode?"on":""}`} onClick={()=>setRevisionMode(!revisionMode)}><div className="toggle-knob"/></button>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">Backup</div>
              <div className="teams-actions">
                <button className="teams-sync-btn" onClick={downloadBackup}><Icon d={icons.download} size={14} color="var(--accent)"/><span>Export JSON</span></button>
                <label className="teams-disconnect-btn" style={{display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                  <span>Import backup</span>
                  <input type="file" accept=".json,application/json" onChange={importBackup} style={{display:"none"}} />
                </label>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">About</div>
              <div className="settings-info">
                <div className="settings-info-row"><span>Mode</span><span>{demoMode ? "Demo admin" : "Cloud account"}</span></div>
                <div className="settings-info-row"><span>View</span><span>{revisionMode ? "Revision mode" : "Full mode"}</span></div>
                {currentUser.school&&<div className="settings-info-row"><span>School</span><span>{currentUser.school}</span></div>}
                <div className="settings-info-row"><span>Subjects</span><span>{subjects.length}</span></div>
                <div className="settings-info-row"><span>Tasks</span><span>{tasks.length}</span></div>
                <div className="settings-info-row"><span>Deadlines</span><span>{deadlines.length}</span></div>
                <div className="settings-info-row"><span>Exams</span><span>{exams.length}</span></div>
                <div className="settings-info-row"><span>Past Papers</span><span>{papers.length}</span></div>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">Danger Zone</div>
              {resetStep===0&&<button className="reset-btn" onClick={()=>setResetStep(1)}>Clear All My Data</button>}
              {resetStep===1&&(<div className="reset-confirm-box"><div className="reset-confirm-text">This will permanently delete all your subjects, tasks, deadlines, exams, papers, goals, portfolio, and activities. Are you sure?</div><div className="confirm-actions" style={{marginTop:10}}><button className="confirm-cancel" onClick={()=>setResetStep(0)}>Cancel</button><button className="confirm-delete" onClick={()=>setResetStep(2)}>Yes, continue</button></div></div>)}
              {resetStep===2&&(<div className="reset-confirm-box"><div className="reset-confirm-text" style={{color:"var(--danger)"}}>Last chance — this cannot be undone.</div><div className="confirm-actions" style={{marginTop:10}}><button className="confirm-cancel" onClick={()=>setResetStep(0)}>Cancel</button><button className="confirm-delete" onClick={resetAllData}>Clear Now</button></div></div>)}
            </div>
          </>) : (
            <div>
              {recentlyDeleted.length===0?(<div className="empty-state" style={{paddingTop:40}}>Nothing recently deleted.</div>):(<>
                <div style={{fontSize:11,color:"var(--muted)",marginBottom:12}}>Last {recentlyDeleted.length} deleted item{recentlyDeleted.length!==1?"s":""}. Tap restore to bring them back.</div>
                {recentlyDeleted.map(entry=>(<div key={entry.id} className="deleted-item"><div style={{flex:1}}><div className="deleted-item-type">{TYPE_LABELS[entry.type]||entry.type}</div><div className="deleted-item-label">{entry.label}</div><div className="deleted-item-time">{entry.deletedAt}</div></div><button className="restore-btn" onClick={()=>restoreDeleted(entry)}><Icon d={icons.undo} size={14} color="var(--accent)"/><span>Restore</span></button></div>))}
                <button className="reset-btn" style={{marginTop:16}} onClick={()=>setRecentlyDeleted([])}>Clear All</button>
              </>)}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════
  // MODALS
  // ═══════════════════════════════════
  const renderModal = () => {
    if (!modal) return null;
    const SubjectSelect = () => (<select className="modal-input" value={form.subjectId||""} onChange={e=>updateForm("subjectId",e.target.value)}><option value="">Select subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>);
    const calendarSyncLabel = calendarLastSync ? new Date(calendarLastSync).toLocaleString("en-GB",{ day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" }) : null;
    let title="", content=null, onSave=null, saveLabel="Save", showSave=true;

    if (modal==="addSubject") {
      title="Add Subjects";
      const curr=CURRICULA[browseCurriculum];
      const existingNames=new Set(subjects.map(s=>s.name.toLowerCase()));
      const searchLower=browseSearch.toLowerCase();
      if (subjectTab==="browse") {
        const filtered=curr.subjects.filter(s=>s.name.toLowerCase().includes(searchLower)&&!existingNames.has(s.name.toLowerCase()));
        const grouped={}; filtered.forEach(s=>{ const g=s.group||"Subjects"; if(!grouped[g]) grouped[g]=[]; grouped[g].push(s); });
        onSave=addBrowsedSubjects; saveLabel=browseSelected.size>0?`Add ${browseSelected.size} Subject${browseSelected.size>1?"s":""}` :"Select subjects";
        content=(<>
          <div className="curriculum-tabs">{Object.keys(CURRICULA).map(k=>(<button key={k} className={`curriculum-tab ${browseCurriculum===k?"active":""}`} onClick={()=>{setBrowseCurriculum(k);setBrowseSelected(new Set());setBrowseSearch("");}}>{CURRICULA[k].label}</button>))}</div>
          <input className="modal-input" placeholder={`Search ${curr.label} subjects...`} value={browseSearch} onChange={e=>setBrowseSearch(e.target.value)}/>
          <div className="browse-list">
            {Object.entries(grouped).map(([group,items])=>(<div key={group}>{Object.keys(grouped).length>1&&<div className="browse-group-label">{group}</div>}{items.map(s=>{ const checked=browseSelected.has(s.name); return(<div key={s.name} className={`browse-item ${checked?"selected":""}`} onClick={()=>toggleBrowseSubject(s.name)}><div className={`browse-check ${checked?"checked":""}`}>{checked&&"✓"}</div><div className="browse-item-info"><div className="browse-item-name">{s.name}</div><div className="browse-item-board">{s.board}</div></div></div>); })}</div>))}
            {filtered.length===0&&<div className="empty-state">{browseSearch?"No matching subjects":"All subjects already added"}</div>}
          </div>
          <button className="browse-switch" onClick={()=>setSubjectTab("custom")}>Or add a custom subject</button>
        </>);
      } else {
        onSave=addSubject; saveLabel="Save";
        content=(<>
          <Field label="Subject name"><input className="modal-input" placeholder="e.g. Further Mathematics" value={form.name||""} onChange={e=>updateForm("name",e.target.value)}/></Field>
          <Field label="Exam board"><select className="modal-input" value={form.board||"AQA"} onChange={e=>updateForm("board",e.target.value)}>{EXAM_BOARDS.map(b=><option key={b} value={b}>{b}</option>)}</select></Field>
          <Field label="Target grade"><select className="modal-input" value={form.target||"5"} onChange={e=>updateForm("target",e.target.value)}>{GRADES.map(g=><option key={g} value={g}>Grade {g}</option>)}</select></Field>
          <Field label="Colour"><div className="colour-swatches">{PALETTE.map(c=>(<button key={c} className={`swatch ${(form.colour||PALETTE[0])===c?"active":""}`} style={{background:c}} onClick={()=>updateForm("colour",c)}/>))}</div></Field>
          <button className="browse-switch" onClick={()=>setSubjectTab("browse")}>Or browse GCSE / IGCSE / IB subjects</button>
        </>);
      }
    } else if (modal==="addTask") {
      title="Add Task";
      onSave=addTask;
      const previewPriority = getPriorityMeta(
        getEffectivePriority({
          text: form.text || "",
          priority: form.priority || inferPriorityFromText(form.text || ""),
          subjectId: form.subjectId || null,
          createdAt: new Date().toISOString(),
        })
      );
      content=(<>
        <Field label="Description"><input className="modal-input" placeholder="e.g. Annotate chapter 3" value={form.text||""} onChange={e=>updateForm("text",e.target.value)}/></Field>
        <Field label="Subject"><SubjectSelect/></Field>
        <Field label="Topic (optional)"><input className="modal-input" placeholder="e.g. Macbeth themes" value={form.topic||""} onChange={e=>updateForm("topic",e.target.value)}/></Field>
        <div style={{display:"flex",gap:8}}>
          <div style={{flex:1}}>
            <Field label="Priority"><select className="modal-input" value={form.priority||inferPriorityFromText(form.text||"")} onChange={e=>updateForm("priority",e.target.value)}>
              {PRIORITY_ORDER.map(priority => <option key={priority} value={priority}>{getPriorityMeta(priority).label}</option>)}
            </select></Field>
          </div>
          <div style={{flex:1}}>
            <Field label="Minutes"><input className="modal-input" type="number" min="10" step="5" placeholder="30" value={form.estimateMinutes||estimateFromText(form.text||"")} onChange={e=>updateForm("estimateMinutes",e.target.value)}/></Field>
          </div>
        </div>
        <div className="quick-add-preview" style={{marginTop:-2}}>
          <span>Suggested:</span>
          <span className="badge" style={{background:previewPriority.color+"22",color:previewPriority.color}}>{previewPriority.label}</span>
          <span className="task-time-pill">{formatMinutes(Number(form.estimateMinutes)||estimateFromText(form.text||""))}</span>
        </div>
      </>);
    }
    else if (modal==="addDeadline") { title="Add Deadline"; onSave=addDeadline; content=(<><Field label="Title"><input className="modal-input" placeholder="e.g. Essay draft" value={form.title||""} onChange={e=>updateForm("title",e.target.value)}/></Field><Field label="Subject"><SubjectSelect/></Field><Field label="Due date"><input className="modal-input" type="date" value={form.date||""} onChange={e=>updateForm("date",e.target.value)}/></Field></>); }
    else if (modal==="addExam") { title="Add Exam"; onSave=addExam; content=(<><Field label="Exam name"><input className="modal-input" placeholder="e.g. Paper 1" value={form.name||""} onChange={e=>updateForm("name",e.target.value)}/></Field><Field label="Subject"><SubjectSelect/></Field><Field label="Exam board"><select className="modal-input" value={form.board||""} onChange={e=>updateForm("board",e.target.value)}><option value="">Select board</option>{EXAM_BOARDS.map(b=><option key={b} value={b}>{b}</option>)}</select></Field><Field label="Date"><input className="modal-input" type="date" value={form.date||""} onChange={e=>updateForm("date",e.target.value)}/></Field></>); }
    else if (modal==="examActions") {
      title="Add to Exams";
      showSave=false;
      content=(<div className="exam-action-grid">
        <button className="exam-action-card" onClick={()=>setModal("addExam")}>
          <div className="exam-action-icon"><Icon d={icons.clock} size={20} color="var(--accent)"/></div>
          <div className="exam-action-title">Add exam manually</div>
          <div className="exam-action-copy">Create a single exam with subject, board, and date.</div>
        </button>
        <button className="exam-action-card" onClick={()=>setModal("importExamFeed")}>
          <div className="exam-action-icon"><Icon d={icons.sync} size={20} color="var(--accent2)"/></div>
          <div className="exam-action-title">Import assessment calendar</div>
          <div className="exam-action-copy">Paste your published school calendar feed and pull upcoming assessments into Exams.</div>
        </button>
      </div>);
    }
    else if (modal==="importExamFeed") {
      title="Assessment Calendar Feed";
      showSave=false;
      content=(<>
        <div className="calendar-sync-sub">Please open the school calendar link (in the format calendar.online). In the top right corner, click the options menu and select “Export as Calendar Feed.” Copy the first link provided and paste it here.</div>
        <input className="modal-input" placeholder="webcal://... or https://...ics" value={calendarInput} onChange={e=>setCalendarInput(e.target.value)} />
        <div className="calendar-sync-actions">
          <button className="calendar-sync-btn" onClick={()=>syncOutlookCalendar(calendarInput, true)} disabled={calendarSyncing}>{calendarSyncing ? "Syncing..." : outlookCalendarUrl ? "Save & Re-sync" : "Save & Sync"}</button>
          {outlookCalendarUrl && <button className="calendar-secondary-btn" onClick={()=>syncOutlookCalendar(outlookCalendarUrl, false)} disabled={calendarSyncing}>Sync Now</button>}
          {outlookCalendarUrl && <button className="calendar-secondary-btn danger" onClick={disconnectOutlookCalendar} disabled={calendarSyncing}>Disconnect</button>}
        </div>
        {calendarSyncLabel && <div className="calendar-sync-meta">Last synced {calendarSyncLabel}</div>}
        {calendarSyncError && <div className="calendar-sync-error">{calendarSyncError}</div>}
      </>);
    }
    else if (modal==="addPaper") { title="Add Past Paper"; onSave=addPaper; content=(<><Field label="Subject"><SubjectSelect/></Field><Field label="Paper title"><input className="modal-input" placeholder="e.g. November Mock" value={form.title||""} onChange={e=>updateForm("title",e.target.value)}/></Field><div style={{display:"flex",gap:8}}><Field label="Year" style={{flex:1}}><input className="modal-input" placeholder="e.g. 2024" value={form.year||""} onChange={e=>updateForm("year",e.target.value)}/></Field><Field label="Paper no." style={{flex:1}}><input className="modal-input" placeholder="e.g. 1" value={form.paper||""} onChange={e=>updateForm("paper",e.target.value)}/></Field></div><Field label="Score"><div style={{display:"flex",gap:8}}><input className="modal-input" placeholder="Marks scored" type="number" value={form.scored||""} onChange={e=>updateForm("scored",e.target.value)} style={{flex:1}}/><input className="modal-input" placeholder="Total marks" type="number" value={form.total||""} onChange={e=>updateForm("total",e.target.value)} style={{flex:1}}/></div></Field></>); }
    else if (modal==="addGoal") { title="Add Goal"; onSave=addGoal; content=(<><Field label="Goal"><input className="modal-input" placeholder="e.g. Push average above 80%" value={form.text||""} onChange={e=>updateForm("text",e.target.value)}/></Field><Field label="Timeframe"><select className="modal-input" value={form.horizon||"3 months"} onChange={e=>updateForm("horizon",e.target.value)}>{HORIZONS.map(h=><option key={h} value={h}>{h}</option>)}</select></Field><Field label="Subject (optional)"><select className="modal-input" value={form.subjectId||""} onChange={e=>updateForm("subjectId",e.target.value)}><option value="">No subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></Field></>); }
    else if (modal==="addPortfolio") { title="Add Portfolio Entry"; onSave=addPortfolio; content=(<><Field label="Title"><input className="modal-input" placeholder="e.g. Science fair project" value={form.title||""} onChange={e=>updateForm("title",e.target.value)}/></Field><Field label="Description"><textarea className="modal-input modal-textarea" placeholder="What did you do and what did you learn?" value={form.desc||""} onChange={e=>updateForm("desc",e.target.value)}/></Field><Field label="Type"><select className="modal-input" value={form.type||"Project"} onChange={e=>updateForm("type",e.target.value)}>{PORTFOLIO_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select></Field><Field label="Subject"><SubjectSelect/></Field><Field label="Tags (comma-separated)"><input className="modal-input" placeholder="e.g. Research, Teamwork" value={form.tags||""} onChange={e=>updateForm("tags",e.target.value)}/></Field></>); }
    else if (modal==="addActivity") { title="Add Activity"; onSave=addActivity; content=(<><Field label="Activity name"><input className="modal-input" placeholder="e.g. Debate Club" value={form.name||""} onChange={e=>updateForm("name",e.target.value)}/></Field><Field label="Organisation"><input className="modal-input" placeholder="e.g. School / External team" value={form.organisation||""} onChange={e=>updateForm("organisation",e.target.value)}/></Field><Field label="Your role"><input className="modal-input" placeholder="e.g. Team Captain" value={form.role||""} onChange={e=>updateForm("role",e.target.value)}/></Field><Field label="Description"><textarea className="modal-input modal-textarea" placeholder="What do you do in this activity?" value={form.desc||""} onChange={e=>updateForm("desc",e.target.value)}/></Field><Field label="Hours per week"><input className="modal-input" type="number" placeholder="e.g. 2" value={form.hoursPerWeek||""} onChange={e=>updateForm("hoursPerWeek",e.target.value)}/></Field><Field label="Achievements (one per line)"><textarea className="modal-input modal-textarea" placeholder="e.g. Won regional championship" value={form.achievements||""} onChange={e=>updateForm("achievements",e.target.value)}/></Field><Field label="Tags (comma-separated)"><input className="modal-input" placeholder="e.g. Leadership, Sport" value={form.tags||""} onChange={e=>updateForm("tags",e.target.value)}/></Field><Field label="Colour"><div className="colour-swatches">{PALETTE.map(c=>(<button key={c} className={`swatch ${(form.colour||PALETTE[0])===c?"active":""}`} style={{background:c}} onClick={()=>updateForm("colour",c)}/>))}</div></Field></>); }

    return (
      <div className="modal-overlay" onClick={()=>setModal(null)}>
        <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
          <div className="modal-handle"/>
          <div className="modal-title">{title}</div>
          <div className="modal-body">{content}</div>
          {showSave && <button className="modal-save" onClick={onSave}>{saveLabel}</button>}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════
  const pages = { home:renderHome, subjects:renderSubjects, tasks:renderTasks, deadlines:renderDeadlines, exams:renderExams, papers:renderPapers, goals:renderGoals, activities:renderActivities, portfolio:renderPortfolio };
  const visibleNavItems = revisionMode ? NAV_ITEMS.filter(item => !["activities", "portfolio"].includes(item.key)) : NAV_ITEMS;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        :root {
          --bg: #0a0a0f; --surface: #111118; --surface2: #1a1a24; --border: #2a2a38;
          --accent: #7c6af7; --accent2: #f7a26a; --accent3: #6af7c4; --danger: #f76a6a;
          --text: #e8e8f0; --muted: #6b6b80;
        }
        @keyframes ambientFloat { 0%,100% { transform:translate3d(-2%,0,0) scale(1); opacity:0.18; } 50% { transform:translate3d(2%,4%,0) scale(1.08); opacity:0.28; } }
        @keyframes titleReveal { from { opacity:0; transform:translateY(10px); letter-spacing:0.6px; } to { opacity:1; transform:translateY(0); letter-spacing:0; } }
        @keyframes sectionReveal { from { opacity:0; transform:translateY(18px) scale(0.985); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes fabFloat { 0%,100% { transform:translateY(0); box-shadow:0 10px 24px rgba(124,106,247,0.28); } 50% { transform:translateY(-6px); box-shadow:0 18px 32px rgba(124,106,247,0.42); } }
        @keyframes dotOrbit { 0%,100% { transform:scale(1); box-shadow:0 0 10px var(--accent); } 50% { transform:scale(1.18); box-shadow:0 0 18px var(--accent); } }
        @keyframes sheenSweep { 0% { transform:translateX(-170%) rotate(14deg); opacity:0; } 18% { opacity:0.45; } 55% { opacity:0.12; } 100% { transform:translateX(300%) rotate(14deg); opacity:0; } }
        @keyframes softPulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.045); } }
        .markd-app.light-theme {
          --bg: #fafafe; --surface: #ffffff; --surface2: #f3f3fa; --border: #e2e2ec;
          --accent: #6b54f5; --accent2: #e8801f; --accent3: #2bbd8a; --danger: #e53e3e;
          --text: #1a1a24; --muted: #6b6b80;
        }
        .markd-app.light-theme { background:var(--bg); color:var(--text); }
        .markd-app.light-theme .top-bar { background:var(--bg); }
        .markd-app.light-theme .next-exam-card { background:linear-gradient(135deg,#ffffff 0%,#f3f3fa 100%); }
        .markd-app.light-theme .modal-overlay { background:rgba(0,0,0,0.4); }
        .markd-app.light-theme .ai-bubble.assistant { background:var(--surface2); color:var(--text); }
        .markd-app.light-theme .task-check { color:white; }
        .markd-app.light-theme .ai-trigger { background:rgba(107,84,245,0.1); border-color:rgba(107,84,245,0.3); }
        .markd-app.light-theme .next-exam-card::after, .markd-app.light-theme .calendar-sync-card::after { background:linear-gradient(90deg, transparent, rgba(107,84,245,0.12), transparent); }
        * { margin:0; padding:0; box-sizing:border-box; }
        html, body { height:100%; background:var(--bg); }
        .markd-app { width:100%; min-height:100vh; min-height:100dvh; background:var(--bg); color:var(--text); font-family:'DM Mono',monospace; font-size:13px; position:relative; display:flex; flex-direction:column; overflow:hidden; }
        .markd-app::before { content:""; position:fixed; top:-14%; left:-8%; width:48vw; height:48vw; min-width:280px; min-height:280px; max-width:520px; max-height:520px; border-radius:50%; background:radial-gradient(circle, rgba(124,106,247,0.24) 0%, rgba(106,247,196,0.12) 35%, rgba(10,10,15,0) 72%); filter:blur(18px); pointer-events:none; z-index:0; animation:ambientFloat 18s ease-in-out infinite; }
        .top-bar, .app-body, .fab, .bottom-nav { position:relative; z-index:1; }
        .top-bar { position:sticky; top:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:14px 24px; padding-top:calc(env(safe-area-inset-top,0px) + 14px); background:rgba(10,10,15,0.86); border-bottom:1px solid var(--border); backdrop-filter:blur(18px); animation:sectionReveal 0.55s ease both; }
        .logo { font-family:'Syne',sans-serif; font-weight:800; font-size:22px; color:var(--text); letter-spacing:-0.5px; }
        .logo-dot { display:inline-block; width:8px; height:8px; background:var(--accent); border-radius:50%; margin-left:2px; box-shadow:0 0 10px var(--accent); vertical-align:middle; position:relative; top:-1px; animation:dotOrbit 3.6s ease-in-out infinite; }
        .avatar { width:32px; height:32px; border-radius:50%; background:var(--surface2); border:2px solid var(--accent); display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-weight:700; font-size:13px; color:var(--accent); position:relative; transition:transform 0.22s ease, box-shadow 0.22s ease; }
        .avatar:hover { transform:scale(1.06); box-shadow:0 0 0 8px rgba(124,106,247,0.08); }
        .app-body { display:flex; flex:1; overflow:hidden; }
        .sidebar { display:none; }
        @media (min-width:768px) {
          .sidebar { display:flex; flex-direction:column; width:200px; flex-shrink:0; background:var(--surface); border-right:1px solid var(--border); padding:16px 0; gap:2px; overflow-y:auto; }
          .sidebar-item { display:flex; align-items:center; gap:10px; padding:10px 20px; background:none; border:none; color:var(--muted); font-family:'DM Mono',monospace; font-size:12px; cursor:pointer; transition:color 0.2s,background 0.2s,transform 0.2s; text-align:left; }
          .sidebar-item:hover { color:var(--text); background:var(--surface2); transform:translateX(4px); }
          .sidebar-item.active { color:var(--accent); background:rgba(124,106,247,0.08); transform:translateX(4px); }
        }
        .page-scroll { flex:1; overflow-y:auto; overflow-x:hidden; -webkit-overflow-scrolling:touch; }
        .bottom-nav { position:fixed; bottom:0; left:0; right:0; z-index:100; background:var(--surface); border-top:1px solid var(--border); display:flex; overflow-x:auto; scrollbar-width:none; padding:6px 4px calc(env(safe-area-inset-bottom,0px) + 10px); }
        .bottom-nav::-webkit-scrollbar { display:none; }
        @media (min-width:768px) { .bottom-nav { display:none; } }
        .nav-item { flex:1 0 auto; display:flex; flex-direction:column; align-items:center; gap:3px; padding:6px 8px; background:none; border:none; color:var(--muted); font-family:'DM Mono',monospace; font-size:10px; cursor:pointer; border-radius:8px; transition:color 0.2s, transform 0.2s, background 0.2s; }
        .nav-item:hover { transform:translateY(-2px); }
        .nav-item.active { color:var(--accent); background:rgba(124,106,247,0.08); }
        .fab { position:fixed; bottom:calc(env(safe-area-inset-bottom,0px) + 72px); right:24px; width:50px; height:50px; border-radius:50%; background:var(--accent); border:none; color:white; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:99; box-shadow:0 4px 20px rgba(124,106,247,0.4); transition:transform 0.2s; animation:fabFloat 3.2s ease-in-out infinite; }
        .fab:hover { transform:scale(1.08); animation-play-state:paused; }
        @media (min-width:768px) { .fab { bottom:32px; right:32px; } }
        .page { padding:16px 18px calc(env(safe-area-inset-bottom,0px) + 100px); max-width:960px; margin:0 auto; width:100%; }
        @media (min-width:768px) { .page { padding:28px 36px 60px; } }
        .page > * { opacity:0; animation:sectionReveal 0.58s cubic-bezier(.21,1,.29,1) both; }
        .page > *:nth-child(1) { animation-delay:0.04s; }
        .page > *:nth-child(2) { animation-delay:0.08s; }
        .page > *:nth-child(3) { animation-delay:0.12s; }
        .page > *:nth-child(4) { animation-delay:0.16s; }
        .page > *:nth-child(5) { animation-delay:0.2s; }
        .page > *:nth-child(6) { animation-delay:0.24s; }
        .page > *:nth-child(7) { animation-delay:0.28s; }
        .page > *:nth-child(8) { animation-delay:0.32s; }
        .page-title { font-family:'Syne',sans-serif; font-weight:700; font-size:24px; margin-bottom:18px; color:var(--text); animation:titleReveal 0.56s cubic-bezier(.21,1,.29,1) both; }
        .onboarding-card { background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:28px 24px; text-align:center; margin-bottom:20px; }
        .onboarding-title { font-family:'Syne',sans-serif; font-weight:700; font-size:20px; margin-bottom:10px; }
        .onboarding-sub { font-size:12px; color:var(--muted); line-height:1.6; margin-bottom:20px; }
        .onboarding-btn { padding:12px 24px; border-radius:10px; border:none; background:var(--accent); color:white; font-family:'Syne',sans-serif; font-weight:700; font-size:14px; cursor:pointer; }
        .stat-row { display:flex; gap:10px; margin-bottom:16px; }
        .stat-card { flex:1; background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:16px; text-align:center; transition:transform 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease; }
        .stat-card:hover { transform:translateY(-4px); border-color:rgba(124,106,247,0.35); box-shadow:0 16px 28px rgba(0,0,0,0.18); }
        .stat-num { font-family:'Syne',sans-serif; font-weight:700; font-size:26px; color:var(--accent); }
        .stat-label { color:var(--muted); font-size:11px; margin-top:4px; }
        .next-exam-card { position:relative; overflow:hidden; background:linear-gradient(135deg,var(--surface) 0%,var(--surface2) 100%); border:1px solid var(--border); border-radius:14px; padding:20px; margin-bottom:20px; cursor:pointer; transition:border-color 0.28s ease, transform 0.28s ease, box-shadow 0.28s ease; }
        .next-exam-card:hover { border-color:var(--accent); transform:translateY(-4px); box-shadow:0 18px 34px rgba(0,0,0,0.24); }
        .next-exam-card::after, .calendar-sync-card::after { content:""; position:absolute; top:-70%; left:-20%; width:34%; height:240%; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent); transform:translateX(-170%) rotate(14deg); animation:sheenSweep 6.8s ease-in-out infinite; pointer-events:none; }
        .next-exam-label { font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:1.5px; margin-bottom:6px; }
        .next-exam-name { font-family:'Syne',sans-serif; font-weight:700; font-size:20px; }
        .next-exam-date { color:var(--muted); margin-top:4px; font-size:12px; }
        .next-exam-days { font-family:'Syne',sans-serif; font-weight:800; font-size:32px; margin-top:8px; }
        .section-header { display:flex; justify-content:space-between; align-items:center; margin:20px 0 10px; font-family:'Syne',sans-serif; font-weight:600; font-size:15px; }
        .link-btn { background:none; border:none; color:var(--accent); font-family:'DM Mono',monospace; font-size:11px; cursor:pointer; display:flex; align-items:center; gap:4px; }
        .list-item { background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:12px 14px; margin-bottom:8px; display:flex; align-items:center; justify-content:space-between; gap:10px; transition:transform 0.24s ease, border-color 0.24s ease, box-shadow 0.24s ease; }
        .list-item:hover { transform:translateX(4px); border-color:rgba(124,106,247,0.28); box-shadow:0 12px 24px rgba(0,0,0,0.14); }
        .list-item-title { font-size:13px; color:var(--text); }
        .list-item-sub { font-size:11px; color:var(--muted); margin-top:2px; }
        .badge { font-size:10px; padding:3px 8px; border-radius:6px; font-weight:500; white-space:nowrap; transition:transform 0.2s ease; }
        .list-item:hover .badge, .activity-event:hover .badge { transform:scale(1.05); }
        .task-check { width:20px; height:20px; border-radius:5px; border:2px solid var(--muted); display:flex; align-items:center; justify-content:center; font-size:12px; cursor:pointer; flex-shrink:0; color:var(--bg); font-weight:700; transition:background 0.18s ease, transform 0.18s ease, border-color 0.18s ease; }
        .task-check:hover { transform:scale(1.08); }
        .goal-check { width:20px; height:20px; border-radius:50%; border:2px solid var(--accent); display:inline-block; cursor:pointer; flex-shrink:0; transition:background 0.15s, transform 0.15s; margin-top:2px; }
        .goal-check:hover { transform:scale(1.08); }
        .goal-check.checked { background:var(--accent); }
        .goal-subject-tag { font-size:10px; padding:2px 6px; border-radius:4px; margin-top:4px; display:inline-block; }
        .subjects-mini-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px; }
        @media (min-width:768px) { .subjects-mini-grid { grid-template-columns:repeat(3,1fr); } }
        .subject-mini { background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:12px; transition:transform 0.24s ease, border-color 0.24s ease, box-shadow 0.24s ease; }
        .subject-mini:hover { transform:translateY(-4px); border-color:rgba(124,106,247,0.28); box-shadow:0 14px 26px rgba(0,0,0,0.14); }
        .subject-mini-name { font-family:'Syne',sans-serif; font-weight:600; font-size:13px; margin-bottom:6px; }
        .subject-mini-stats { display:flex; gap:10px; font-size:10px; color:var(--muted); }
        .subject-card { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:16px; margin-bottom:10px; transition:transform 0.26s ease, border-color 0.26s ease, box-shadow 0.26s ease; }
        .subject-card:hover { transform:translateY(-5px); border-color:rgba(124,106,247,0.32); box-shadow:0 18px 30px rgba(0,0,0,0.16); }
        .subject-card-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; }
        .subject-card-name { font-family:'Syne',sans-serif; font-weight:700; font-size:16px; }
        .subject-card-board { font-size:11px; color:var(--muted); margin-top:2px; }
        .subject-card-stats { display:flex; gap:16px; margin-bottom:10px; }
        .subject-stat { display:flex; flex-direction:column; gap:2px; }
        .subject-stat-label { font-size:10px; color:var(--muted); }
        .subject-stat-val { font-family:'Syne',sans-serif; font-weight:700; font-size:18px; }
        .progress-wrap { display:flex; align-items:center; gap:8px; }
        .progress-bar { height:6px; background:var(--surface2); border-radius:3px; overflow:hidden; flex:1; }
        .progress-fill { height:100%; border-radius:3px; transition:width 0.4s ease, filter 0.3s ease; }
        .progress-label { font-size:10px; color:var(--muted); white-space:nowrap; }
        .group-section { margin-bottom:18px; }
        .group-label { font-family:'Syne',sans-serif; font-weight:600; font-size:14px; margin-bottom:8px; padding-left:2px; }
        .exam-card { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:16px; margin-bottom:10px; display:flex; align-items:center; gap:12px; transition:transform 0.26s ease, border-color 0.26s ease, box-shadow 0.26s ease; }
        .exam-card:hover { transform:translateY(-4px); border-color:rgba(124,106,247,0.28); box-shadow:0 16px 28px rgba(0,0,0,0.15); }
        .exam-name { font-family:'Syne',sans-serif; font-weight:700; font-size:15px; }
        .exam-board { font-size:11px; color:var(--muted); margin-top:2px; }
        .exam-date { font-size:11px; color:var(--muted); margin-top:4px; }
        .exam-days { font-family:'Syne',sans-serif; font-weight:800; font-size:34px; text-align:center; line-height:1; }
        .exam-days-label { display:block; font-size:10px; font-weight:400; color:var(--muted); margin-top:2px; }
        .calendar-sync-card { position:relative; overflow:hidden; background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:16px; margin-bottom:16px; transition:transform 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease; }
        .calendar-sync-card:hover { transform:translateY(-4px); border-color:rgba(124,106,247,0.35); box-shadow:0 18px 34px rgba(0,0,0,0.2); }
        .calendar-sync-title { font-family:'Syne',sans-serif; font-weight:700; font-size:15px; margin-bottom:6px; }
        .calendar-sync-sub { font-size:11px; color:var(--muted); line-height:1.5; margin-bottom:12px; }
        .calendar-sync-actions { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
        .exam-action-grid { display:grid; gap:10px; }
        .exam-action-card { width:100%; text-align:left; background:var(--surface2); border:1px solid var(--border); border-radius:12px; padding:16px; color:var(--text); cursor:pointer; transition:transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease; }
        .exam-action-card:hover { transform:translateY(-3px); border-color:rgba(124,106,247,0.3); box-shadow:0 14px 24px rgba(0,0,0,0.16); }
        .exam-action-icon { width:38px; height:38px; border-radius:10px; background:rgba(124,106,247,0.08); display:flex; align-items:center; justify-content:center; margin-bottom:10px; }
        .exam-action-title { font-family:'Syne',sans-serif; font-weight:700; font-size:15px; margin-bottom:6px; }
        .exam-action-copy { font-size:11px; color:var(--muted); line-height:1.6; }
        .calendar-sync-btn { padding:10px 14px; border-radius:8px; border:none; background:var(--accent); color:white; font-family:'Syne',sans-serif; font-weight:700; font-size:12px; cursor:pointer; transition:transform 0.2s ease, filter 0.2s ease; }
        .calendar-sync-btn:disabled { opacity:0.5; cursor:default; }
        .calendar-sync-btn:hover:not(:disabled), .calendar-secondary-btn:hover:not(:disabled), .logout-btn:hover, .teams-connect-btn:hover, .teams-sync-btn:hover:not(:disabled), .teams-disconnect-btn:hover, .restore-btn:hover, .empty-state-btn:hover, .export-btn:hover, .modal-save:hover, .ai-trigger:hover { transform:translateY(-2px); }
        .calendar-secondary-btn { padding:10px 14px; border-radius:8px; border:1px solid var(--border); background:var(--surface2); color:var(--text); font-family:'DM Mono',monospace; font-size:11px; cursor:pointer; transition:transform 0.2s ease, border-color 0.2s ease, background 0.2s ease; }
        .calendar-secondary-btn:disabled { opacity:0.5; cursor:default; }
        .calendar-secondary-btn.danger { color:var(--danger); border-color:rgba(247,106,106,0.25); background:rgba(247,106,106,0.07); }
        .calendar-sync-meta { font-size:10px; color:var(--muted); margin-top:10px; }
        .calendar-sync-error { font-size:11px; color:var(--danger); margin-top:8px; }
        .paper-card { background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:14px; margin-bottom:8px; transition:transform 0.26s ease, border-color 0.26s ease, box-shadow 0.26s ease; }
        .paper-card:hover { transform:translateY(-4px); border-color:rgba(124,106,247,0.28); box-shadow:0 16px 28px rgba(0,0,0,0.15); }
        .paper-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; }
        .paper-score { font-family:'Syne',sans-serif; font-weight:700; font-size:15px; white-space:nowrap; }
        .paper-pct { font-size:12px; color:var(--muted); font-weight:400; }
        .tab-row { display:flex; gap:6px; margin-bottom:14px; }
        .tab-btn { flex:1; padding:8px; border-radius:8px; border:1px solid var(--border); background:var(--surface); color:var(--muted); font-family:'DM Mono',monospace; font-size:12px; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:6px; }
        .tab-btn.active { background:var(--accent); color:white; border-color:var(--accent); }
        .horizon-row { display:flex; gap:6px; margin-bottom:14px; overflow-x:auto; scrollbar-width:none; }
        .horizon-row::-webkit-scrollbar { display:none; }
        .horizon-btn { flex:0 0 auto; padding:6px 12px; border-radius:20px; border:1px solid var(--border); background:var(--surface); color:var(--muted); font-family:'DM Mono',monospace; font-size:11px; cursor:pointer; transition:all 0.2s; }
        .horizon-btn.active { background:var(--accent); color:white; border-color:var(--accent); }
        .goals-overview { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:16px; margin-top:16px; transition:transform 0.24s ease, border-color 0.24s ease, box-shadow 0.24s ease; }
        .goals-overview:hover { transform:translateY(-3px); border-color:rgba(124,106,247,0.24); box-shadow:0 14px 24px rgba(0,0,0,0.14); }
        .goals-overview-title { font-family:'Syne',sans-serif; font-weight:600; font-size:14px; margin-bottom:12px; }
        .goals-overview-row { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
        .goals-overview-label { font-size:11px; color:var(--muted); width:72px; flex-shrink:0; }
        .goals-overview-pct { font-size:11px; color:var(--text); width:32px; text-align:right; }
        .mvt-card { background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:14px; margin-bottom:10px; transition:transform 0.24s ease, border-color 0.24s ease, box-shadow 0.24s ease; }
        .mvt-card:hover { transform:translateY(-3px); border-color:rgba(124,106,247,0.24); box-shadow:0 14px 24px rgba(0,0,0,0.14); }
        .mvt-name { font-family:'Syne',sans-serif; font-weight:600; font-size:14px; margin-bottom:10px; }
        .mvt-bars { display:flex; flex-direction:column; gap:6px; }
        .mvt-bar-row { display:flex; align-items:center; gap:8px; }
        .mvt-bar-label { font-size:10px; color:var(--muted); width:42px; }
        .mvt-bar-val { font-size:11px; width:36px; text-align:right; }
        .mvt-gap { font-family:'Syne',sans-serif; font-weight:700; font-size:16px; margin-top:8px; text-align:right; }
        .link-list { display:flex; flex-direction:column; gap:8px; }
        .link-card { display:flex; align-items:center; justify-content:space-between; gap:12px; background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:14px; text-decoration:none; color:var(--text); transition:border-color 0.24s ease, transform 0.24s ease, box-shadow 0.24s ease; }
        .link-card:hover { border-color:var(--accent); transform:translateY(-4px); box-shadow:0 16px 28px rgba(0,0,0,0.15); }
        .link-card-name { font-family:'Syne',sans-serif; font-weight:600; font-size:14px; }
        .link-card-desc { font-size:11px; color:var(--muted); margin-top:3px; }
        .portfolio-card { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:16px; margin-bottom:10px; transition:transform 0.26s ease, border-color 0.26s ease, box-shadow 0.26s ease; }
        .portfolio-card:hover { transform:translateY(-4px); border-color:rgba(124,106,247,0.28); box-shadow:0 16px 28px rgba(0,0,0,0.15); }
        .portfolio-header { display:flex; justify-content:space-between; align-items:flex-start; }
        .portfolio-title { font-family:'Syne',sans-serif; font-weight:700; font-size:15px; }
        .portfolio-meta { display:flex; align-items:center; gap:10px; margin-top:8px; }
        .portfolio-type { font-size:10px; padding:3px 8px; border-radius:5px; }
        .portfolio-subject { font-size:11px; }
        .portfolio-desc { font-size:12px; color:var(--muted); margin-top:8px; line-height:1.5; }
        .portfolio-tags { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
        .tag-chip { font-size:10px; padding:3px 8px; border-radius:4px; background:var(--surface2); color:var(--muted); border:1px solid var(--border); }
        .portfolio-page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; }
        .export-btn { display:flex; align-items:center; gap:6px; padding:8px 14px; border-radius:8px; border:1px solid rgba(124,106,247,0.3); background:rgba(124,106,247,0.08); color:var(--accent); font-family:'DM Mono',monospace; font-size:11px; cursor:pointer; transition:transform 0.2s ease, background 0.2s ease; }
        .curriculum-tabs { display:flex; gap:4px; }
        .curriculum-tab { flex:1; padding:8px 4px; border-radius:8px; border:1px solid var(--border); background:var(--surface); color:var(--muted); font-family:'DM Mono',monospace; font-size:11px; cursor:pointer; text-align:center; transition:all 0.15s; }
        .curriculum-tab.active { background:var(--accent); color:white; border-color:var(--accent); }
        .browse-list { max-height:280px; overflow-y:auto; display:flex; flex-direction:column; gap:4px; scrollbar-width:thin; }
        .browse-group-label { font-family:'Syne',sans-serif; font-weight:600; font-size:11px; color:var(--accent); text-transform:uppercase; letter-spacing:1px; padding:10px 0 4px; position:sticky; top:0; background:var(--surface); z-index:1; }
        .browse-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:8px; border:1px solid var(--border); background:var(--surface2); cursor:pointer; transition:border-color 0.15s, transform 0.15s; }
        .browse-item:hover { transform:translateX(4px); }
        .browse-item.selected { border-color:var(--accent); background:rgba(124,106,247,0.08); }
        .browse-check { width:20px; height:20px; border-radius:5px; border:2px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:12px; color:white; font-weight:700; flex-shrink:0; transition:all 0.15s; }
        .browse-check.checked { background:var(--accent); border-color:var(--accent); }
        .browse-item-info { flex:1; min-width:0; }
        .browse-item-name { font-size:13px; color:var(--text); }
        .browse-item-board { font-size:10px; color:var(--muted); margin-top:1px; }
        .browse-switch { background:none; border:none; color:var(--accent); font-family:'DM Mono',monospace; font-size:11px; cursor:pointer; text-align:center; padding:8px 0; width:100%; opacity:0.8; }
        .activity-card { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:18px; margin-bottom:12px; transition:transform 0.26s ease, border-color 0.26s ease, box-shadow 0.26s ease; }
        .activity-card:hover { transform:translateY(-5px); border-color:rgba(124,106,247,0.28); box-shadow:0 18px 30px rgba(0,0,0,0.16); }
        .activity-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; }
        .activity-name { font-family:'Syne',sans-serif; font-weight:700; font-size:17px; }
        .activity-org { font-size:11px; color:var(--muted); margin-top:2px; }
        .activity-role { font-size:12px; font-weight:500; margin-top:4px; }
        .activity-desc { font-size:12px; color:var(--muted); line-height:1.5; margin-bottom:14px; }
        .activity-stats { display:flex; gap:18px; padding:12px 0; border-top:1px solid var(--border); border-bottom:1px solid var(--border); margin-bottom:14px; }
        .activity-stat { display:flex; flex-direction:column; gap:2px; }
        .activity-stat-label { font-size:10px; color:var(--muted); }
        .activity-stat-val { font-family:'Syne',sans-serif; font-weight:700; font-size:16px; }
        .activity-section { margin-bottom:14px; }
        .activity-section-label { font-family:'Syne',sans-serif; font-weight:600; font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; }
        .activity-event { display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:var(--surface2); border-radius:8px; margin-bottom:6px; }
        .activity-event-title { font-size:13px; }
        .activity-event-date { font-size:11px; color:var(--muted); margin-top:2px; }
        .activity-achievement { display:flex; align-items:flex-start; gap:8px; font-size:12px; color:var(--text); padding:4px 0; line-height:1.5; }
        .activity-bullet { width:6px; height:6px; border-radius:50%; margin-top:6px; flex-shrink:0; }
        .delete-btn { background:none; border:none; cursor:pointer; padding:4px; opacity:0.5; transition:opacity 0.2s, transform 0.2s; flex-shrink:0; }
        .delete-btn:hover { opacity:1; transform:scale(1.08); }
        .empty-state { text-align:center; color:var(--muted); padding:32px 0; font-size:13px; }
        .empty-state-full { display:flex; flex-direction:column; align-items:center; gap:12px; padding:48px 20px; text-align:center; }
        .empty-state-icon { width:56px; height:56px; border-radius:50%; background:var(--surface); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; }
        .empty-state-msg { font-size:13px; color:var(--muted); max-width:220px; line-height:1.5; }
        .empty-state-btn { padding:9px 20px; border-radius:8px; border:1px solid rgba(124,106,247,0.3); background:rgba(124,106,247,0.08); color:var(--accent); font-family:'DM Mono',monospace; font-size:12px; cursor:pointer; transition:transform 0.2s ease, background 0.2s ease; }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:200; display:flex; align-items:flex-end; justify-content:center; animation:fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        .modal-sheet { width:100%; max-width:600px; background:var(--surface); border-radius:20px 20px 0 0; padding:12px 20px 28px; animation:slideUp 0.25s ease; }
        @keyframes slideUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
        .modal-handle { width:36px; height:4px; background:var(--border); border-radius:2px; margin:0 auto 16px; }
        .modal-title { font-family:'Syne',sans-serif; font-weight:700; font-size:18px; margin-bottom:16px; }
        .modal-body { display:flex; flex-direction:column; gap:10px; }
        .modal-input { width:100%; padding:10px 12px; border-radius:8px; border:1px solid var(--border); background:var(--surface2); color:var(--text); font-family:'DM Mono',monospace; font-size:13px; outline:none; transition:border-color 0.2s, box-shadow 0.2s ease, transform 0.2s ease; }
        .modal-input:focus { border-color:var(--accent); box-shadow:0 0 0 4px rgba(124,106,247,0.12); transform:translateY(-1px); }
        .modal-textarea { min-height:72px; resize:vertical; }
        .modal-save { margin-top:14px; width:100%; padding:12px; border-radius:10px; border:none; background:var(--accent); color:white; font-family:'Syne',sans-serif; font-weight:700; font-size:15px; cursor:pointer; transition:opacity 0.2s, transform 0.2s ease, filter 0.2s ease; }
        .modal-save:hover { opacity:0.9; filter:brightness(1.04); }
        .colour-swatches { display:flex; gap:8px; flex-wrap:wrap; padding:4px 0; }
        .swatch { width:30px; height:30px; border-radius:50%; border:3px solid transparent; cursor:pointer; transition:border-color 0.15s,transform 0.15s; }
        .swatch.active { border-color:var(--text); transform:scale(1.15); }
        .top-bar-right { display:flex; align-items:center; gap:10px; }
        .revision-trigger { padding:8px 12px; border-radius:999px; border:1px solid rgba(124,106,247,0.24); background:rgba(124,106,247,0.08); color:var(--accent); font-family:'DM Mono',monospace; font-size:11px; cursor:pointer; transition:transform 0.2s ease, background 0.2s ease, border-color 0.2s ease; }
        .revision-trigger.active { background:var(--accent); color:white; border-color:var(--accent); }
        .revision-trigger:hover { transform:translateY(-2px); }
        .planner-card, .quick-add-card, .summary-card, .insight-card, .achievement-card, .health-card { background:var(--surface); border:1px solid var(--border); border-radius:14px; transition:transform 0.24s ease, border-color 0.24s ease, box-shadow 0.24s ease; }
        .planner-card:hover, .quick-add-card:hover, .summary-card:hover, .insight-card:hover, .achievement-card:hover, .health-card:hover { transform:translateY(-4px); border-color:rgba(124,106,247,0.26); box-shadow:0 16px 28px rgba(0,0,0,0.16); }
        .planner-card { padding:18px; margin-bottom:16px; }
        .planner-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:6px; }
        .planner-eyebrow { font-size:10px; letter-spacing:1.2px; text-transform:uppercase; color:var(--muted); margin-bottom:4px; }
        .planner-title { font-family:'Syne',sans-serif; font-size:20px; font-weight:700; }
        .planner-sub { color:var(--muted); font-size:11px; line-height:1.5; margin-bottom:14px; }
        .revision-toggle { padding:8px 12px; border-radius:999px; border:1px solid var(--border); background:var(--surface2); color:var(--muted); font-family:'DM Mono',monospace; font-size:11px; cursor:pointer; white-space:nowrap; transition:transform 0.2s ease, border-color 0.2s ease, background 0.2s ease; }
        .revision-toggle.active { background:rgba(124,106,247,0.12); color:var(--accent); border-color:rgba(124,106,247,0.24); }
        .planner-summary-grid, .summary-grid, .achievement-grid, .health-grid { display:grid; gap:10px; }
        .planner-summary-grid { grid-template-columns:repeat(3,1fr); margin-bottom:14px; }
        .planner-summary-card { background:var(--surface2); border:1px solid var(--border); border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:4px; }
        .planner-summary-label { color:var(--muted); font-size:10px; text-transform:uppercase; letter-spacing:0.8px; }
        .planner-summary-value { font-family:'Syne',sans-serif; font-size:18px; font-weight:700; }
        .next-task-card { background:linear-gradient(135deg, rgba(124,106,247,0.12), rgba(106,247,196,0.08)); border:1px solid rgba(124,106,247,0.18); border-radius:14px; padding:16px; display:flex; align-items:center; gap:12px; margin-bottom:14px; }
        .next-task-label { color:var(--muted); font-size:10px; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px; }
        .next-task-name { font-family:'Syne',sans-serif; font-size:17px; font-weight:700; }
        .next-task-sub { color:var(--muted); font-size:11px; margin-top:2px; margin-bottom:8px; }
        .next-task-btn, .quick-add-btn, .focus-chip { border:none; cursor:pointer; transition:transform 0.2s ease, filter 0.2s ease; }
        .next-task-btn:hover, .quick-add-btn:hover, .focus-chip:hover { transform:translateY(-2px); filter:brightness(1.03); }
        .next-task-btn { padding:10px 14px; border-radius:10px; background:var(--accent); color:white; font-family:'Syne',sans-serif; font-weight:700; font-size:13px; white-space:nowrap; }
        .planner-task-list { display:flex; flex-direction:column; gap:8px; }
        .planner-task-item { display:flex; align-items:center; gap:10px; background:var(--surface2); border:1px solid var(--border); border-radius:12px; padding:12px 14px; transition:transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease; }
        .planner-task-item:hover, .task-list-item:hover { border-color:rgba(124,106,247,0.24); box-shadow:0 12px 24px rgba(0,0,0,0.12); }
        .planner-task-item.highlighted, .task-list-item.highlighted { border-color:var(--accent); box-shadow:0 0 0 2px rgba(124,106,247,0.14); }
        .planner-task-name { font-size:13px; color:var(--text); }
        .planner-task-sub { color:var(--muted); font-size:10px; margin-top:2px; margin-bottom:6px; }
        .task-meta-row { display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-top:6px; }
        .task-time-pill, .task-topic-pill, .paper-summary-pill { font-size:10px; padding:3px 8px; border-radius:999px; background:var(--surface2); border:1px solid var(--border); color:var(--muted); }
        .task-topic-pill { color:var(--text); }
        .focus-chip { padding:8px 12px; border-radius:999px; background:rgba(124,106,247,0.08); color:var(--accent); font-family:'DM Mono',monospace; font-size:11px; white-space:nowrap; }
        .quick-add-card { padding:16px; margin-bottom:16px; }
        .quick-add-header { display:flex; justify-content:space-between; gap:10px; margin-bottom:10px; }
        .quick-add-title { font-family:'Syne',sans-serif; font-size:16px; font-weight:700; }
        .quick-add-sub { color:var(--muted); font-size:11px; line-height:1.5; margin-top:4px; }
        .quick-add-grid { display:grid; grid-template-columns:1.6fr 1fr 1fr auto; gap:8px; align-items:center; }
        .quick-add-btn { padding:11px 14px; border-radius:10px; background:var(--accent); color:white; font-family:'Syne',sans-serif; font-weight:700; font-size:13px; }
        .quick-add-btn:disabled { opacity:0.45; cursor:default; }
        .quick-add-preview { display:flex; align-items:center; flex-wrap:wrap; gap:6px; color:var(--muted); font-size:11px; margin-top:10px; }
        .summary-grid { grid-template-columns:repeat(3,1fr); margin-bottom:14px; }
        .summary-card { padding:16px; }
        .summary-card-title { color:var(--muted); font-size:10px; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; }
        .summary-card-main { font-family:'Syne',sans-serif; font-size:22px; font-weight:700; margin-bottom:6px; }
        .summary-card-sub { color:var(--muted); font-size:11px; line-height:1.5; }
        .insight-card { padding:16px; margin-bottom:16px; background:linear-gradient(135deg, rgba(247,162,106,0.12), rgba(124,106,247,0.08)); }
        .insight-title { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; margin-bottom:8px; }
        .insight-copy { color:var(--text); font-size:12px; line-height:1.6; }
        .achievement-grid { grid-template-columns:repeat(2,1fr); margin-bottom:12px; }
        .achievement-card { padding:14px; }
        .achievement-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; margin-bottom:6px; }
        .achievement-desc { color:var(--muted); font-size:11px; line-height:1.5; }
        .health-grid { grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); margin-bottom:6px; }
        .health-card { padding:14px; }
        .health-card-name { font-family:'Syne',sans-serif; font-size:13px; font-weight:700; margin-bottom:10px; }
        .health-card-score { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; line-height:1; }
        .health-card-label { color:var(--muted); font-size:10px; text-transform:uppercase; letter-spacing:1px; margin-top:4px; }
        .health-card-sub { color:var(--muted); font-size:11px; line-height:1.5; margin-top:8px; }
        .subject-card-meta { display:flex; flex-wrap:wrap; gap:8px; color:var(--muted); font-size:11px; margin-top:10px; }
        .topic-row { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
        .topic-chip { font-size:10px; padding:4px 8px; border-radius:999px; background:var(--surface2); border:1px solid var(--border); color:var(--text); }
        .paper-summary-strip { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px; }
        .trend-bars { height:74px; display:flex; align-items:flex-end; gap:6px; padding:8px 0 12px; }
        .trend-bar { flex:1; min-height:18px; border-radius:8px 8px 2px 2px; opacity:0.95; transition:transform 0.2s ease, opacity 0.2s ease; }
        .trend-bar:hover { transform:translateY(-3px); opacity:1; }
        .task-list-item.completed-burst, .planner-task-item.completed-burst { animation:taskCelebrate 0.7s ease; }
        .task-check.burst { animation:checkBounce 0.55s cubic-bezier(.2,1.35,.4,1); }
        @keyframes taskCelebrate { 0% { transform:scale(1); box-shadow:0 0 0 rgba(106,247,196,0); } 45% { transform:scale(1.01); box-shadow:0 0 0 8px rgba(106,247,196,0.08); } 100% { transform:scale(1); box-shadow:0 0 0 rgba(106,247,196,0); } }
        @keyframes checkBounce { 0% { transform:scale(1); } 35% { transform:scale(1.25); } 100% { transform:scale(1); } }
        .beta-banner { display:flex; align-items:center; justify-content:center; gap:8px; padding:9px 18px; background:rgba(124,106,247,0.12); border-bottom:1px solid rgba(124,106,247,0.25); color:var(--accent); font-size:11px; text-align:center; }
        .demo-banner { display:flex; align-items:center; justify-content:center; gap:8px; padding:10px 18px; background:rgba(247,162,106,0.12); border-bottom:1px solid rgba(247,162,106,0.25); color:var(--accent2); font-size:11px; text-align:center; }
        .demo-note-card { background:rgba(247,162,106,0.1); border:1px solid rgba(247,162,106,0.24); color:var(--text); border-radius:12px; padding:14px 16px; margin-bottom:16px; line-height:1.6; }
        .ai-trigger { width:34px; height:34px; border-radius:50%; background:rgba(124,106,247,0.07); border:1px solid rgba(124,106,247,0.27); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background 0.2s, transform 0.2s ease, border-color 0.2s ease; }
        .ai-trigger:hover { background:rgba(124,106,247,0.14); border-color:var(--accent); }
        .ai-sheet { width:100%; max-width:600px; height:85vh; background:var(--surface); border-radius:20px 20px 0 0; display:flex; flex-direction:column; animation:slideUp 0.25s ease; overflow:hidden; }
        .ai-header { display:flex; align-items:center; justify-content:space-between; padding:0 18px 14px; border-bottom:1px solid var(--border); }
        .ai-header-left { display:flex; align-items:center; gap:8px; }
        .ai-title { font-family:'Syne',sans-serif; font-weight:700; font-size:16px; }
        .ai-close { background:none; border:none; cursor:pointer; padding:4px; opacity:0.6; }
        .ai-messages { flex:1; overflow-y:auto; padding:16px 18px; display:flex; flex-direction:column; gap:12px; }
        .ai-welcome { display:flex; flex-direction:column; align-items:center; text-align:center; padding:40px 20px; gap:12px; }
        .ai-welcome-icon { width:52px; height:52px; border-radius:50%; background:rgba(124,106,247,0.1); display:flex; align-items:center; justify-content:center; }
        .ai-welcome-text { color:var(--muted); font-size:13px; line-height:1.5; max-width:260px; }
        .ai-msg { display:flex; }
        .ai-msg.user { justify-content:flex-end; }
        .ai-msg.assistant { justify-content:flex-start; }
        .ai-bubble { max-width:82%; padding:10px 14px; border-radius:14px; font-size:13px; line-height:1.5; white-space:pre-wrap; word-break:break-word; }
        .ai-bubble.user { background:var(--accent); color:white; border-bottom-right-radius:4px; }
        .ai-bubble.assistant { background:var(--surface2); color:var(--text); border:1px solid var(--border); border-bottom-left-radius:4px; }
        .ai-typing { display:flex; align-items:center; gap:4px; padding:12px 18px; }
        .ai-typing .dot { width:6px; height:6px; border-radius:50%; background:var(--muted); animation:typingBounce 1.2s infinite ease-in-out; }
        .ai-typing .dot:nth-child(2) { animation-delay:0.15s; }
        .ai-typing .dot:nth-child(3) { animation-delay:0.3s; }
        @keyframes typingBounce { 0%,60%,100% { transform:translateY(0); opacity:0.4; } 30% { transform:translateY(-4px); opacity:1; } }
        .ai-input-row { display:flex; align-items:center; gap:8px; padding:12px 18px 16px; border-top:1px solid var(--border); background:var(--surface); }
        .ai-input { flex:1; padding:10px 14px; border-radius:20px; border:1px solid var(--border); background:var(--surface2); color:var(--text); font-family:'DM Mono',monospace; font-size:13px; outline:none; }
        .ai-input:focus { border-color:var(--accent); }
        .ai-input::placeholder { color:var(--muted); }
        .ai-send { width:38px; height:38px; border-radius:50%; background:var(--accent); border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; }
        .ai-send:disabled { opacity:0.4; cursor:default; }
        .avatar-btn { background:none; border:none; cursor:pointer; padding:0; position:relative; }
        .teams-badge { position:absolute; top:-2px; right:-2px; width:10px; height:10px; border-radius:50%; background:#7fba00; border:2px solid var(--bg); z-index:1; animation:softPulse 1.8s ease-in-out infinite; }
        .sync-spinner { width:18px; height:18px; border-radius:50%; border:2px solid var(--border); border-top-color:var(--accent); animation:spin 0.8s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .settings-sheet { width:100%; max-width:600px; max-height:85vh; overflow-y:auto; background:var(--surface); border-radius:20px 20px 0 0; padding:12px 20px 28px; animation:slideUp 0.25s ease; box-shadow:0 -16px 48px rgba(0,0,0,0.28); }
        .settings-header { display:flex; align-items:center; gap:8px; margin-bottom:16px; }
        .settings-title { font-family:'Syne',sans-serif; font-weight:700; font-size:18px; }
        .settings-section { margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid var(--border); }
        .settings-section:last-child { border-bottom:none; margin-bottom:0; }
        .settings-section-title { font-family:'Syne',sans-serif; font-weight:600; font-size:12px; color:var(--muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:12px; }
        .demo-settings-note { font-size:11px; color:var(--accent2); line-height:1.6; margin-bottom:12px; }
        .settings-profile { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
        .settings-avatar { width:44px; height:44px; border-radius:50%; background:var(--surface2); border:2px solid var(--accent); display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-weight:700; font-size:17px; color:var(--accent); flex-shrink:0; }
        .settings-name { font-family:'Syne',sans-serif; font-weight:700; font-size:15px; }
        .settings-email { font-size:11px; color:var(--muted); margin-top:2px; }
        .settings-school { font-size:11px; color:var(--accent); margin-top:4px; }
        .logout-btn { display:flex; align-items:center; gap:6px; padding:9px 14px; border-radius:8px; border:1px solid rgba(247,106,106,0.25); background:rgba(247,106,106,0.07); color:var(--danger); font-family:'DM Mono',monospace; font-size:12px; cursor:pointer; transition:background 0.2s, transform 0.2s ease; }
        .logout-btn:hover { background:rgba(247,106,106,0.14); }
        .teams-connect-btn { width:100%; display:flex; align-items:center; justify-content:center; gap:10px; padding:14px; border-radius:10px; background:rgba(127,186,0,0.08); border:1px solid rgba(127,186,0,0.25); color:var(--text); font-family:'DM Mono',monospace; font-size:13px; cursor:pointer; transition:transform 0.2s ease, background 0.2s ease; }
        .teams-connected { display:flex; flex-direction:column; gap:12px; }
        .teams-status-row { display:flex; align-items:center; gap:8px; }
        .teams-status-dot { width:8px; height:8px; border-radius:50%; background:#7fba00; }
        .teams-status-text { font-size:13px; color:var(--text); font-weight:500; }
        .teams-sync-time { font-size:11px; color:var(--muted); margin-left:auto; }
        .teams-actions { display:flex; gap:8px; }
        .teams-sync-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:10px; border-radius:8px; background:rgba(124,106,247,0.08); border:1px solid rgba(124,106,247,0.25); color:var(--accent); font-family:'DM Mono',monospace; font-size:12px; cursor:pointer; transition:transform 0.2s ease, background 0.2s ease; }
        .teams-sync-btn:disabled { opacity:0.5; cursor:default; }
        .teams-disconnect-btn { padding:10px 14px; border-radius:8px; background:rgba(247,106,106,0.08); border:1px solid rgba(247,106,106,0.2); color:var(--danger); font-family:'DM Mono',monospace; font-size:12px; cursor:pointer; transition:transform 0.2s ease, background 0.2s ease; }
        .teams-autosync-row { display:flex; align-items:center; justify-content:space-between; padding:8px 0; font-size:12px; color:var(--muted); }
        .toggle { width:40px; height:22px; border-radius:11px; background:var(--surface2); border:1px solid var(--border); cursor:pointer; position:relative; transition:background 0.2s; padding:0; }
        .toggle.on { background:var(--accent); border-color:var(--accent); }
        .toggle-knob { width:16px; height:16px; border-radius:50%; background:white; position:absolute; top:2px; left:2px; transition:transform 0.2s; }
        .toggle.on .toggle-knob { transform:translateX(18px); }
        .sync-log { max-height:140px; overflow-y:auto; display:flex; flex-direction:column; gap:4px; }
        .sync-log-entry { display:flex; gap:8px; font-size:11px; padding:4px 0; }
        .sync-log-time { color:var(--muted); flex-shrink:0; width:40px; }
        .sync-log-msg { color:var(--text); }
        .settings-info { display:flex; flex-direction:column; gap:6px; }
        .settings-info-row { display:flex; justify-content:space-between; font-size:12px; color:var(--muted); padding:2px 0; }
        .settings-info-row span:last-child { color:var(--text); font-weight:500; }
        .theme-toggle-row { display:flex; gap:10px; }
        .theme-option { flex:1; display:flex; flex-direction:column; align-items:center; gap:8px; padding:12px; border-radius:10px; background:var(--surface2); border:2px solid var(--border); color:var(--muted); font-family:'DM Mono',monospace; font-size:12px; cursor:pointer; transition:border-color 0.2s, transform 0.2s ease; }
        .theme-option:hover { transform:translateY(-3px); }
        .theme-option.active { border-color:var(--accent); color:var(--text); }
        .theme-preview { width:100%; height:56px; border-radius:6px; padding:6px; display:flex; flex-direction:column; gap:4px; }
        .dark-preview { background:#0a0a0f; border:1px solid #2a2a38; }
        .light-preview { background:#fafafe; border:1px solid #e2e2ec; }
        .theme-preview-bar { height:8px; border-radius:2px; }
        .dark-preview .theme-preview-bar { background:#7c6af7; }
        .light-preview .theme-preview-bar { background:#6b54f5; }
        .theme-preview-card { flex:1; border-radius:4px; }
        .dark-preview .theme-preview-card { background:#1a1a24; }
        .light-preview .theme-preview-card { background:#ffffff; border:1px solid #e2e2ec; }
        .confirm-dialog { width:calc(100% - 48px); max-width:360px; background:var(--surface); border-radius:18px; padding:24px 20px 20px; display:flex; flex-direction:column; align-items:center; gap:10px; animation:scaleIn 0.2s ease; margin-bottom:30vh; }
        @keyframes scaleIn { from { transform:scale(0.92); opacity:0; } to { transform:scale(1); opacity:1; } }
        .confirm-icon { width:48px; height:48px; border-radius:50%; background:rgba(247,106,106,0.12); display:flex; align-items:center; justify-content:center; margin-bottom:4px; }
        .confirm-message { font-family:'Syne',sans-serif; font-weight:600; font-size:15px; text-align:center; color:var(--text); }
        .confirm-note { font-size:11px; color:var(--muted); text-align:center; line-height:1.4; }
        .confirm-actions { display:flex; gap:8px; width:100%; margin-top:6px; }
        .confirm-cancel { flex:1; padding:11px; border-radius:10px; border:1px solid var(--border); background:var(--surface2); color:var(--text); font-family:'DM Mono',monospace; font-size:13px; cursor:pointer; }
        .confirm-delete { flex:1; padding:11px; border-radius:10px; border:none; background:var(--danger); color:white; font-family:'Syne',sans-serif; font-weight:700; font-size:13px; cursor:pointer; }
        .deleted-badge { background:var(--danger); color:white; font-size:10px; padding:1px 6px; border-radius:10px; font-weight:700; }
        .deleted-item { display:flex; align-items:center; gap:12px; background:var(--surface2); border:1px solid var(--border); border-radius:10px; padding:12px 14px; margin-bottom:8px; }
        .deleted-item-type { font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:0.8px; margin-bottom:2px; }
        .deleted-item-label { font-size:13px; color:var(--text); font-weight:500; }
        .deleted-item-time { font-size:10px; color:var(--muted); margin-top:2px; }
        .restore-btn { display:flex; align-items:center; gap:5px; padding:7px 12px; border-radius:8px; border:1px solid rgba(124,106,247,0.3); background:rgba(124,106,247,0.08); color:var(--accent); font-family:'DM Mono',monospace; font-size:11px; cursor:pointer; white-space:nowrap; flex-shrink:0; transition:transform 0.2s ease, background 0.2s ease; }
        .reset-btn { width:100%; padding:11px; border-radius:10px; border:1px solid rgba(247,106,106,0.3); background:rgba(247,106,106,0.07); color:var(--danger); font-family:'DM Mono',monospace; font-size:12px; cursor:pointer; }
        .reset-confirm-box { background:var(--surface2); border:1px solid rgba(247,106,106,0.25); border-radius:12px; padding:14px; }
        .reset-confirm-text { font-size:12px; color:var(--text); line-height:1.5; }
        @media (max-width: 767px) {
          .planner-summary-grid, .summary-grid, .achievement-grid { grid-template-columns:1fr; }
          .quick-add-grid { grid-template-columns:1fr; }
          .next-task-card { align-items:flex-start; flex-direction:column; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration:0.01ms !important; animation-iteration-count:1 !important; transition-duration:0.01ms !important; scroll-behavior:auto !important; }
          .page > * { opacity:1 !important; transform:none !important; }
        }

        /* ── UI/UX Pro Max improvements ── */

        /* §2 Touch: 44px minimum touch target for delete buttons */
        .delete-btn { background:none; border:none; cursor:pointer; padding:0; opacity:0.45; transition:opacity 0.18s, background 0.18s; flex-shrink:0; width:36px; height:36px; min-width:36px; min-height:36px; display:flex; align-items:center; justify-content:center; border-radius:8px; margin:-2px; }
        .delete-btn:hover { opacity:1; background:rgba(247,106,106,0.1); transform:none; }

        /* §6 Typography: base 14px for readability */
        .markd-app { font-size:14px; }
        .list-item-title, .subject-card-name, .activity-event-title { font-size:14px; }
        .list-item-sub, .subject-card-board, .exam-board, .exam-date, .activity-org, .activity-event-date, .activity-desc { font-size:12px; }
        .page-title { font-size:26px; font-weight:800; letter-spacing:-0.5px; }

        /* §7 Animation: reduce FAB bounce amplitude — motion should convey meaning */
        @keyframes fabFloat { 0%,100% { transform:translateY(0); box-shadow:0 8px 20px rgba(124,106,247,0.32); } 50% { transform:translateY(-3px); box-shadow:0 14px 28px rgba(124,106,247,0.44); } }

        /* §6 Typography: modal field labels */
        .modal-field { display:flex; flex-direction:column; gap:5px; }
        .field-label { font-size:10px; font-weight:600; color:var(--muted); letter-spacing:0.8px; text-transform:uppercase; padding-left:1px; }
        .modal-body { gap:12px; }
        .modal-input { font-size:14px; }
        .modal-save { letter-spacing:0.2px; }

        /* §3 Performance: custom scrollbars */
        ::-webkit-scrollbar { width:3px; height:3px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(124,106,247,0.25); border-radius:2px; }
        ::-webkit-scrollbar-thumb:hover { background:rgba(124,106,247,0.45); }

        /* Card depth improvements */
        .subject-card:hover { box-shadow:0 20px 40px rgba(0,0,0,0.22), 0 0 0 1px rgba(124,106,247,0.12); }
        .list-item:hover { box-shadow:0 8px 20px rgba(0,0,0,0.16), 0 0 0 1px rgba(124,106,247,0.12); }
        .exam-card:hover { box-shadow:0 18px 36px rgba(0,0,0,0.2), 0 0 0 1px rgba(124,106,247,0.12); }
        .portfolio-card:hover { box-shadow:0 18px 36px rgba(0,0,0,0.2); }
        .activity-card:hover { box-shadow:0 20px 40px rgba(0,0,0,0.22); }
        .paper-card:hover { box-shadow:0 16px 32px rgba(0,0,0,0.18); }

        /* Progress bar: smooth gradient fill */
        .progress-fill { transition:width 0.55s cubic-bezier(.21,1,.29,1); }

        /* Better focus states (§1 Accessibility) */
        .modal-input:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(124,106,247,0.15); transform:none; }
        .auth-input:focus { box-shadow:0 0 0 3px rgba(124,106,247,0.15); }

        /* Stat card: slightly larger number */
        .stat-num { font-size:30px; letter-spacing:-1px; }

        /* Bottom nav: slightly taller for touch (§2) */
        .nav-item { padding:8px 6px; min-width:56px; }

        /* Better badge */
        .badge { font-size:10px; letter-spacing:0.3px; font-weight:600; }

        /* Sidebar active indicator */
        .sidebar-item.active { border-right:2px solid var(--accent); }

        /* Settings sheet scrollbar */
        .settings-sheet { scrollbar-width:thin; }

        /* Goal check transition */
        .goal-check { transition:background 0.2s cubic-bezier(.21,1,.29,1), transform 0.2s cubic-bezier(.21,1,.29,1), border-color 0.2s; }
        .goal-check.checked { box-shadow:0 0 0 3px rgba(124,106,247,0.15); }

        /* Task check transition */
        .task-check { transition:background 0.2s cubic-bezier(.21,1,.29,1), transform 0.2s cubic-bezier(.21,1,.29,1), border-color 0.2s; }
        .task-check.checked { box-shadow:0 0 0 3px rgba(124,106,247,0.12); }

        /* Light theme modal overlay */
        .markd-app.light-theme .field-label { color:var(--muted); }

        /* ── Glassmorphism Design ── */
        :root {
          --surface: rgba(255,255,255,0.055);
          --surface2: rgba(255,255,255,0.038);
          --border: rgba(255,255,255,0.11);
        }
        /* Second ambient background blob */
        .markd-app::after { content:""; position:fixed; bottom:-12%; right:-6%; width:44vw; height:44vw; min-width:240px; min-height:240px; max-width:480px; max-height:480px; border-radius:50%; background:radial-gradient(circle, rgba(106,247,196,0.2) 0%, rgba(247,162,106,0.1) 38%, transparent 68%); filter:blur(22px); pointer-events:none; z-index:0; animation:ambientFloat 22s ease-in-out infinite reverse; }
        /* Glass surface base — applied to all card-like elements */
        .subject-card, .list-item, .exam-card, .paper-card, .portfolio-card,
        .activity-card, .stat-card, .next-exam-card, .mvt-card, .goals-overview,
        .onboarding-card, .link-card, .exam-action-card, .calendar-sync-card,
        .browse-item, .deleted-item {
          backdrop-filter: blur(14px) saturate(1.5);
          -webkit-backdrop-filter: blur(14px) saturate(1.5);
        }
        /* Glass nav bars */
        .top-bar { background:rgba(8,8,16,0.58); backdrop-filter:blur(28px) saturate(1.7); -webkit-backdrop-filter:blur(28px) saturate(1.7); border-bottom:1px solid rgba(255,255,255,0.08); }
        .bottom-nav { background:rgba(10,10,18,0.7); backdrop-filter:blur(28px) saturate(1.7); -webkit-backdrop-filter:blur(28px) saturate(1.7); border-top:1px solid rgba(255,255,255,0.08); }
        .sidebar { background:rgba(10,10,18,0.55); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border-right:1px solid rgba(255,255,255,0.07); }
        /* Glass modals and panels */
        .modal-sheet { background:rgba(10,10,20,0.8); backdrop-filter:blur(36px) saturate(1.6); -webkit-backdrop-filter:blur(36px) saturate(1.6); border:1px solid rgba(255,255,255,0.1); border-bottom:none; }
        .ai-sheet { background:rgba(10,10,20,0.85); backdrop-filter:blur(36px) saturate(1.6); -webkit-backdrop-filter:blur(36px) saturate(1.6); border:1px solid rgba(255,255,255,0.1); border-bottom:none; }
        .settings-sheet { background:rgba(10,10,20,0.85); backdrop-filter:blur(36px) saturate(1.6); -webkit-backdrop-filter:blur(36px) saturate(1.6); border:1px solid rgba(255,255,255,0.1); border-bottom:none; }
        .confirm-dialog { background:rgba(10,10,20,0.88); backdrop-filter:blur(36px); -webkit-backdrop-filter:blur(36px); border:1px solid rgba(255,255,255,0.1); }
        /* Glass inputs */
        .modal-input { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); }
        .modal-input:focus { background:rgba(255,255,255,0.09); border-color:rgba(124,106,247,0.55); box-shadow:0 0 0 3px rgba(124,106,247,0.12); transform:none; }
        /* Glass AI bubble */
        .ai-bubble.assistant { background:rgba(255,255,255,0.06); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.1); }
        /* Light theme glass overrides */
        .markd-app.light-theme { --surface:rgba(255,255,255,0.65); --surface2:rgba(255,255,255,0.45); --border:rgba(100,100,160,0.12); }
        .markd-app.light-theme .subject-card,
        .markd-app.light-theme .list-item,
        .markd-app.light-theme .exam-card,
        .markd-app.light-theme .paper-card,
        .markd-app.light-theme .portfolio-card,
        .markd-app.light-theme .activity-card,
        .markd-app.light-theme .stat-card,
        .markd-app.light-theme .next-exam-card,
        .markd-app.light-theme .mvt-card,
        .markd-app.light-theme .goals-overview,
        .markd-app.light-theme .onboarding-card,
        .markd-app.light-theme .link-card,
        .markd-app.light-theme .exam-action-card { background:rgba(255,255,255,0.6); border:1px solid rgba(255,255,255,0.8); }
        .markd-app.light-theme .top-bar { background:rgba(250,250,254,0.7); backdrop-filter:blur(28px) saturate(1.7); -webkit-backdrop-filter:blur(28px) saturate(1.7); border-bottom:1px solid rgba(0,0,0,0.06); }
        .markd-app.light-theme .bottom-nav { background:rgba(255,255,255,0.78); backdrop-filter:blur(28px) saturate(1.7); -webkit-backdrop-filter:blur(28px) saturate(1.7); border-top:1px solid rgba(0,0,0,0.06); }
        .markd-app.light-theme .modal-sheet,
        .markd-app.light-theme .ai-sheet,
        .markd-app.light-theme .settings-sheet { background:rgba(250,250,254,0.86); backdrop-filter:blur(36px) saturate(1.5); -webkit-backdrop-filter:blur(36px) saturate(1.5); border:1px solid rgba(255,255,255,0.9); border-bottom:none; }
        .markd-app.light-theme .modal-input { background:rgba(255,255,255,0.65); border:1px solid rgba(0,0,0,0.1); }
        .markd-app.light-theme .confirm-dialog { background:rgba(250,250,254,0.9); backdrop-filter:blur(36px); -webkit-backdrop-filter:blur(36px); border:1px solid rgba(255,255,255,0.9); }
        .markd-app.light-theme .ai-bubble.assistant { background:rgba(255,255,255,0.7); backdrop-filter:blur(10px); border:1px solid rgba(0,0,0,0.07); }

        /* ── Animated background blobs via CSS @property ── */
        @property --bpx { syntax: '<percentage>'; initial-value: 12%; inherits: false; }
        @property --bpy { syntax: '<percentage>'; initial-value: 18%; inherits: false; }
        @property --btx { syntax: '<percentage>'; initial-value: 88%; inherits: false; }
        @property --bty { syntax: '<percentage>'; initial-value: 82%; inherits: false; }
        @property --bax { syntax: '<percentage>'; initial-value: 52%; inherits: false; }
        @property --bay { syntax: '<percentage>'; initial-value: 90%; inherits: false; }
        @keyframes blobDrift {
          0%,100% { --bpx:12%; --bpy:18%; --btx:88%; --bty:82%; --bax:52%; --bay:90%; }
          25%     { --bpx:20%; --bpy:28%; --btx:80%; --bty:72%; --bax:44%; --bay:82%; }
          50%     { --bpx:24%; --bpy:10%; --btx:74%; --bty:88%; --bax:58%; --bay:94%; }
          75%     { --bpx:6%;  --bpy:22%; --btx:86%; --bty:76%; --bax:48%; --bay:85%; }
        }
        .markd-app {
          background-image:
            radial-gradient(ellipse at var(--bpx) var(--bpy), rgba(124,106,247,0.38) 0%, transparent 50%),
            radial-gradient(ellipse at var(--btx) var(--bty), rgba(106,247,196,0.26) 0%, transparent 50%),
            radial-gradient(ellipse at var(--bax) var(--bay), rgba(247,162,106,0.22) 0%, transparent 42%);
          animation: blobDrift 18s ease-in-out infinite;
        }
        /* Explicit glass backgrounds on all card-like surfaces */
        .subject-card, .list-item, .exam-card, .paper-card, .portfolio-card,
        .activity-card, .stat-card, .next-exam-card, .mvt-card, .goals-overview,
        .onboarding-card, .link-card, .exam-action-card, .calendar-sync-card,
        .browse-item, .deleted-item, .subject-mini, .reset-confirm-box {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(18px) saturate(1.6);
          -webkit-backdrop-filter: blur(18px) saturate(1.6);
        }
        /* Surface2 elements */
        .browse-item, .deleted-item, .ai-bubble.assistant { background: rgba(255,255,255,0.06); }
        .modal-input, .tab-btn, .horizon-btn { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); }
        /* Light theme: gradient + glass */
        .markd-app.light-theme {
          background-image:
            radial-gradient(ellipse at var(--bpx) var(--bpy), rgba(107,84,245,0.16) 0%, transparent 52%),
            radial-gradient(ellipse at var(--btx) var(--bty), rgba(43,189,138,0.12) 0%, transparent 52%),
            radial-gradient(ellipse at var(--bax) var(--bay), rgba(247,162,106,0.11) 0%, transparent 42%);
        }
        .markd-app.light-theme .subject-card,
        .markd-app.light-theme .list-item,
        .markd-app.light-theme .exam-card,
        .markd-app.light-theme .paper-card,
        .markd-app.light-theme .portfolio-card,
        .markd-app.light-theme .activity-card,
        .markd-app.light-theme .stat-card,
        .markd-app.light-theme .next-exam-card,
        .markd-app.light-theme .mvt-card,
        .markd-app.light-theme .goals-overview,
        .markd-app.light-theme .onboarding-card,
        .markd-app.light-theme .link-card,
        .markd-app.light-theme .exam-action-card,
        .markd-app.light-theme .subject-mini { background: rgba(255,255,255,0.62); border: 1px solid rgba(255,255,255,0.82); }
        .markd-app.light-theme .modal-input,
        .markd-app.light-theme .tab-btn,
        .markd-app.light-theme .horizon-btn { background: rgba(255,255,255,0.65); border: 1px solid rgba(0,0,0,0.09); }

        /* ── Micro-animations ── */

        /* Checkbox spring pop on check */
        @keyframes checkPop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.32); }
          65%  { transform: scale(0.88); }
          82%  { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .task-check.checked { animation: checkPop 0.38s cubic-bezier(0.34,1.56,0.64,1); }
        .goal-check.checked { animation: checkPop 0.38s cubic-bezier(0.34,1.56,0.64,1); }

        /* Empty-state icon gentle levitation */
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-7px); }
        }
        .empty-state-icon { animation: iconFloat 3.4s ease-in-out infinite; }

        /* Stat numbers pop-in entrance with stagger */
        @keyframes statPop {
          from { opacity: 0; transform: scale(0.6) translateY(8px); }
          to   { opacity: 1; transform: scale(1)   translateY(0); }
        }
        .stat-num {
          animation: statPop 0.42s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .stat-card:nth-child(1) .stat-num { animation-delay: 0ms; }
        .stat-card:nth-child(2) .stat-num { animation-delay: 60ms; }
        .stat-card:nth-child(3) .stat-num { animation-delay: 120ms; }
        .stat-card:nth-child(4) .stat-num { animation-delay: 180ms; }

        /* Active nav-item spring pop */
        .nav-item.active { animation: checkPop 0.32s cubic-bezier(0.34,1.56,0.64,1); }
        .sidebar-item.active { animation: checkPop 0.32s cubic-bezier(0.34,1.56,0.64,1); }

        /* FAB press scale */
        .fab:active { transform: scale(0.9); transition: transform 0.12s ease-in; }

        /* Next-exam-card breathing glow */
        @keyframes examGlow {
          0%, 100% { box-shadow: 0 4px 20px rgba(124,106,247,0.18); }
          50%       { box-shadow: 0 8px 32px rgba(124,106,247,0.38); }
        }
        .next-exam-card { animation: examGlow 3s ease-in-out infinite; }

        /* Card shimmer sweep */
        @keyframes glassSheen {
          0%   { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateX(220%) skewX(-18deg); opacity: 0; }
        }
        .subject-card, .activity-card, .portfolio-card {
          position: relative; overflow: hidden;
        }
        .subject-card::after, .activity-card::after, .portfolio-card::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.13) 50%, transparent 60%);
          transform: translateX(-120%) skewX(-18deg);
          pointer-events: none;
          animation: glassSheen 6s ease-in-out infinite;
        }
        .subject-card:nth-child(2n)::after   { animation-delay: 1.2s; }
        .subject-card:nth-child(3n)::after   { animation-delay: 2.6s; }
        .subject-card:nth-child(4n)::after   { animation-delay: 3.9s; }
        .activity-card:nth-child(2n)::after  { animation-delay: 0.8s; }
        .portfolio-card:nth-child(2n)::after { animation-delay: 1.8s; }

        /* Modal save button ripple */
        .modal-save-btn { position: relative; overflow: hidden; }
        .modal-save-btn::after {
          content: '';
          position: absolute;
          inset: 50% 50%;
          width: 0; height: 0;
          background: rgba(255,255,255,0.3);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          opacity: 0;
          pointer-events: none;
        }
        .modal-save-btn:active::after {
          animation: rippleOut 0.45s ease-out forwards;
        }
        @keyframes rippleOut {
          to { width: 280px; height: 280px; opacity: 0; }
        }

        /* Auth button ripple */
        .auth-btn { position: relative; overflow: hidden; }
        .auth-btn::after {
          content: '';
          position: absolute;
          inset: 50% 50%;
          width: 0; height: 0;
          background: rgba(255,255,255,0.28);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          opacity: 0;
          pointer-events: none;
        }
        .auth-btn:active::after { animation: rippleOut 0.45s ease-out forwards; }

        /* Badge entrance pop */
        @keyframes badgeIn {
          from { opacity: 0; transform: scale(0); }
          to   { opacity: 1; transform: scale(1); }
        }
        .badge { animation: badgeIn 0.28s cubic-bezier(0.34,1.56,0.64,1) both; }

        /* List-item entrance stagger */
        @keyframes listIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .list-item, .exam-card, .paper-card {
          animation: listIn 0.3s ease-out both;
        }
        .list-item:nth-child(1), .exam-card:nth-child(1), .paper-card:nth-child(1) { animation-delay: 0ms; }
        .list-item:nth-child(2), .exam-card:nth-child(2), .paper-card:nth-child(2) { animation-delay: 40ms; }
        .list-item:nth-child(3), .exam-card:nth-child(3), .paper-card:nth-child(3) { animation-delay: 80ms; }
        .list-item:nth-child(4), .exam-card:nth-child(4), .paper-card:nth-child(4) { animation-delay: 120ms; }
        .list-item:nth-child(5), .exam-card:nth-child(5), .paper-card:nth-child(5) { animation-delay: 160ms; }
        .list-item:nth-child(n+6), .exam-card:nth-child(n+6), .paper-card:nth-child(n+6) { animation-delay: 200ms; }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          *, ::before, ::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <div className={`markd-app ${theme==="light"?"light-theme":""}`}>
        <div className="top-bar">
          <div className="logo">Markd<span className="logo-dot"/></div>
          <div className="top-bar-right">
            <button className={`revision-trigger ${revisionMode ? "active" : ""}`} onClick={() => setRevisionMode(mode => !mode)}>
              {revisionMode ? "Revision" : "Focus"}
            </button>
            <button className="ai-trigger" onClick={()=>setAiOpen(true)}><Icon d={icons.sparkle} size={18} color="var(--accent)"/></button>
            {teamsSyncing && <div className="sync-spinner"/>}
            <button className="avatar-btn" onClick={()=>{ setSettingsOpen(true); setSettingsTab("general"); }}>
              <div className="avatar">{teamsConnected&&<div className="teams-badge"/>}{userInitial}</div>
            </button>
          </div>
        </div>

        <div className="beta-banner">Markd is still in Beta!</div>
        {demoMode && <div className="demo-banner">Demo admin mode is active. Changes are temporary and reset every time you open the demo workspace.</div>}

        <div className="app-body">
          <nav className="sidebar">
            {visibleNavItems.map(n=>(<button key={n.key} className={`sidebar-item ${page===n.key?"active":""}`} onClick={()=>setPage(n.key)}><Icon d={n.icon} size={18}/><span>{n.label}</span></button>))}
          </nav>
          <div className="page-scroll">{pages[page]()}</div>
        </div>

        <button className="fab" onClick={fabAction}><Icon d={icons.plus} size={26} color="white"/></button>

        <nav className="bottom-nav">
          {visibleNavItems.map(n=>(<button key={n.key} className={`nav-item ${page===n.key?"active":""}`} onClick={()=>setPage(n.key)}><Icon d={n.icon} size={20}/><span>{n.label}</span></button>))}
        </nav>

        {renderModal()}
        {renderAiPanel()}
        {renderSettingsPanel()}
        {renderConfirmDialog()}
      </div>
    </>
  );
}
