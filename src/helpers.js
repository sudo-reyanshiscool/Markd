import { HORIZONS, PRIORITY_ORDER, TOPIC_CONFIDENCE_OPTIONS } from "./constants";

// ─── Legacy localStorage helpers kept for migration ───
export const getLegacyUsers = () => {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("markd_users") || "{}"); } catch { return {}; }
};
export const getLegacyUserByEmail = (email) => {
  const users = getLegacyUsers();
  return users[email.toLowerCase().trim()] || null;
};
export const readLegacyUserStorage = (userId, key, defaultValue) => {
  if (typeof window === "undefined" || !userId) return defaultValue;
  try {
    const stored = localStorage.getItem(`markd_${userId}_${key}`);
    return stored !== null ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const normaliseCalendarUrl = (value) => value.trim().replace(/^webcal:\/\//i, "https://");

export const uid = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `markd_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};
export const today = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
export const toDateKey = (input = new Date()) => {
  const date = input instanceof Date ? new Date(input) : new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0,0,0,0);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
export const shiftDateKey = (dateKey, amount) => {
  const base = dateKey ? new Date(`${dateKey}T00:00:00`) : today();
  base.setDate(base.getDate() + amount);
  return toDateKey(base);
};
export const daysUntil = (dateStr) => {
  const t = today();
  const d = new Date(dateStr); d.setHours(0,0,0,0);
  return Math.ceil((d - t) / 86400000);
};
export const fmtDate = (d) => new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export const formatMinutes = (minutes) => {
  if (!minutes) return "0m";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
};
export const gradeToPercent = (g) => {
  const map = {"9":90,"8":80,"7":70,"6":60,"5":50,"4":40,"3":30,"2":20,"1":10,"A*":90,"A":80,"B":70,"C":60,"D":50,"E":40,"F":30,"G":20};
  return map[g] || 50;
};
export const inferPriorityFromText = (text = "") => {
  const value = text.toLowerCase();
  if (/(asap|urgent|today|tonight|tomorrow|immediately)/.test(value)) return "urgent";
  if (/(exam|mock|essay|deadline|coursework|revision|study|practice)/.test(value)) return "soon";
  return "later";
};
export const estimateFromText = (text = "") => {
  const value = text.toLowerCase();
  if (!value) return 30;
  if (/(essay|coursework|project|investigation|presentation|write[- ]?up|mock|practice paper|past paper|extended)/.test(value)) return 60;
  if (/(debug|coding|program|worksheet|problem set|questions|revision)/.test(value)) return 45;
  if (/(flashcard|quiz|recap|review|read|label|plan|outline|notes|speaking|vocab)/.test(value)) return 25;
  return 35;
};
export const sanitiseEstimate = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
};
export const normaliseTopicConfidence = (entry = {}) => ({
  id: entry.id || uid(),
  subjectId: entry.subjectId || null,
  topic: typeof entry.topic === "string" ? entry.topic.trim() : "",
  confidence: TOPIC_CONFIDENCE_OPTIONS.some(option => option.value === entry.confidence) ? entry.confidence : "okay",
  updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : new Date().toISOString(),
});
export const normaliseStudySession = (session = {}) => ({
  id: session.id || uid(),
  subjectId: session.subjectId || null,
  taskId: session.taskId || null,
  minutes: clamp(Number(session.minutes) || 0, 0, 240),
  completedAt: typeof session.completedAt === "string" ? session.completedAt : new Date().toISOString(),
});
export const normaliseExam = (exam = {}) => ({
  ...exam,
  id: exam.id || uid(),
  subjectId: exam.subjectId || null,
  name: typeof exam.name === "string" ? exam.name : "",
  board: typeof exam.board === "string" ? exam.board : "Other",
  date: typeof exam.date === "string" ? exam.date : "",
  description: typeof exam.description === "string" ? exam.description : "",
  location: typeof exam.location === "string" ? exam.location : "",
  outlookEventId: typeof exam.outlookEventId === "string" ? exam.outlookEventId : "",
  syllabus: typeof exam.syllabus === "string" ? exam.syllabus : "",
  syllabusSavedAt: typeof exam.syllabusSavedAt === "string" ? exam.syllabusSavedAt : null,
  syllabusDataUrl: typeof exam.syllabusDataUrl === "string" ? exam.syllabusDataUrl : null,
  syllabusFileName: typeof exam.syllabusFileName === "string" ? exam.syllabusFileName : null,
  aiBreakdown: typeof exam.aiBreakdown === "string" ? exam.aiBreakdown : "",
});
export const normaliseTask = (task = {}) => {
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
export const normaliseGoal = (goal = {}) => {
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
export const buildTask = (task = {}) =>
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
export const buildGoal = (goal = {}) =>
  normaliseGoal({
    id: uid(),
    done: false,
    completedAt: null,
    ...goal,
  });
export const buildExam = (exam = {}) =>
  normaliseExam({
    id: uid(),
    syllabus: "",
    syllabusSavedAt: null,
    aiBreakdown: "",
    ...exam,
  });
export const encodeSharePayload = (payload) => {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  } catch {
    return "";
  }
};
export const decodeSharePayload = (value) => {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(value))));
  } catch {
    return null;
  }
};
