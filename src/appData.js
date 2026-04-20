import {
  getLegacyUserByEmail,
  normaliseExam,
  normaliseGoal,
  normaliseStudySession,
  normaliseTask,
  normaliseTopicConfidence,
  readLegacyUserStorage,
} from "./helpers";

export const EMPTY_SUBJECTS = [];
export const EMPTY_TASKS = [];
export const EMPTY_DEADLINES = [];
export const EMPTY_EXAMS = [];
export const EMPTY_PAPERS = [];
export const EMPTY_GOALS = [];
export const EMPTY_PORTFOLIO = [];
export const EMPTY_ACTIVITIES = [];

export const createEmptyAppData = () => ({
  subjects: [],
  tasks: [],
  deadlines: [],
  exams: [],
  papers: [],
  goals: [],
  portfolio: [],
  activities: [],
  deleted: [],
  topicConfidence: [],
  studySessions: [],
  theme: "dark",
  revisionMode: false,
  mockMode: false,
  notificationsEnabled: false,
  healthIntroSeen: false,
  outlookCalendarUrl: "",
  calendarLastSync: null,
});

export const normaliseAppData = (appData = {}) => {
  const fallback = createEmptyAppData();
  return {
    subjects: Array.isArray(appData.subjects) ? appData.subjects : fallback.subjects,
    tasks: Array.isArray(appData.tasks) ? appData.tasks.map(normaliseTask) : fallback.tasks,
    deadlines: Array.isArray(appData.deadlines) ? appData.deadlines : fallback.deadlines,
    exams: Array.isArray(appData.exams) ? appData.exams.map(normaliseExam) : fallback.exams,
    papers: Array.isArray(appData.papers) ? appData.papers : fallback.papers,
    goals: Array.isArray(appData.goals) ? appData.goals.map(normaliseGoal) : fallback.goals,
    portfolio: Array.isArray(appData.portfolio) ? appData.portfolio : fallback.portfolio,
    activities: Array.isArray(appData.activities) ? appData.activities : fallback.activities,
    deleted: Array.isArray(appData.deleted) ? appData.deleted : fallback.deleted,
    topicConfidence: Array.isArray(appData.topicConfidence) ? appData.topicConfidence.map(normaliseTopicConfidence).filter(entry => entry.topic) : fallback.topicConfidence,
    studySessions: Array.isArray(appData.studySessions) ? appData.studySessions.map(normaliseStudySession).filter(session => session.minutes > 0) : fallback.studySessions,
    theme: appData.theme === "light" ? "light" : "dark",
    revisionMode: Boolean(appData.revisionMode),
    mockMode: Boolean(appData.mockMode),
    notificationsEnabled: Boolean(appData.notificationsEnabled),
    healthIntroSeen: Boolean(appData.healthIntroSeen),
    outlookCalendarUrl: typeof appData.outlookCalendarUrl === "string" ? appData.outlookCalendarUrl : "",
    calendarLastSync:
      typeof appData.calendarLastSync === "string" || appData.calendarLastSync === null
        ? appData.calendarLastSync
        : null,
  };
};

export const isEmptyAppData = (appData = {}) => {
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
    data.topicConfidence.length === 0 &&
    data.studySessions.length === 0 &&
    data.theme === "dark" &&
    data.revisionMode === false &&
    data.mockMode === false &&
    data.notificationsEnabled === false &&
    data.outlookCalendarUrl === "" &&
    data.calendarLastSync === null
  );
};

export const readLegacyAppData = (legacyUserId) => ({
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

export const getLegacyBundleForEmail = (email) => {
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
