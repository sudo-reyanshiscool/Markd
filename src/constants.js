export const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) || "";
export const CLOUD_CONFIG_ERROR =
  "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable cloud accounts and syncing.";

export const PALETTE = [
  "#f7a26a", "#7c6af7", "#6af7c4", "#f76a6a", "#f7e96a",
  "#6ab4f7", "#f76ab8", "#a26af7", "#6af7a2", "#f7cf6a",
];

export const EXAM_BOARDS = ["AQA", "Edexcel", "OCR", "WJEC", "Cambridge (CIE)", "IB", "Other"];
export const GRADES_GCSE = ["9","8","7","6","5","4","3","2","1"];
export const GRADES_IB = ["7","6","5","4","3","2","1"];
export const GRADES_IGCSE = ["A*","A","B","C","D","E","F","G"];
export const GRADES = ["9","8","7","6","5","4","3","2","1","A*","A","B","C","D","E","F","G"];
export const HORIZONS = ["3 months","6 months","9 months","12 months"];
export const PORTFOLIO_TYPES = ["Project","Achievement","Competition","Leadership"];
export const TYPE_COLOURS = { Project:"#7c6af7", Achievement:"#6af7c4", Competition:"#f7a26a", Leadership:"#f76ab8" };
export const PRIORITY_ORDER = ["urgent", "soon", "later"];
export const PRIORITY_META = {
  urgent: { label: "Urgent", color: "var(--danger)" },
  soon: { label: "Soon", color: "var(--accent2)" },
  later: { label: "Later", color: "var(--accent3)" },
};
export const TOPIC_CONFIDENCE_OPTIONS = [
  { value: "weak", label: "Weak", color: "var(--danger)" },
  { value: "okay", label: "Okay", color: "var(--accent2)" },
  { value: "strong", label: "Strong", color: "var(--accent3)" },
];
export const SESSION_PRESETS = [25, 45, 60];
export const DAILY_PLANNER_LIMIT = 6;
export const XP_PER_LEVEL = 120;
export const CLOUD_CACHE_PREFIX = "markd_cloud_cache_";

export const CURRICULA = {
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

export const PAPER_LINKS = [
  { name:"AQA", url:"https://www.aqa.org.uk/find-past-papers-and-mark-schemes", desc:"Official AQA past papers and mark schemes" },
  { name:"Edexcel", url:"https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html", desc:"Pearson Edexcel past papers" },
  { name:"OCR", url:"https://www.ocr.org.uk/students/past-papers/", desc:"OCR past papers by subject" },
  { name:"Save My Exams", url:"https://www.savemyexams.com/", desc:"Revision notes, topic questions and past papers" },
  { name:"Physics & Maths Tutor", url:"https://www.physicsandmathstutor.com/", desc:"Past papers and worked solutions" },
  { name:"Revision World", url:"https://revisionworld.com/gcse-revision/gcse-past-papers", desc:"Free GCSE past papers collection" },
];

export const TYPE_LABELS = {
  subject: "Subject", task: "Task", deadline: "Deadline", exam: "Exam",
  paper: "Past Paper", goal: "Goal", portfolio: "Portfolio", activity: "Activity",
};

export const PRESENTATION_STEPS = [
  {
    id: "planner",
    page: "home",
    selector: '[data-present="planner-panel"]',
    title: "Smart daily planner",
    body: "Markd builds a focus list from deadlines, exams, priorities, and time estimates so the student always knows what to work on first.",
  },
  {
    id: "do-next",
    page: "home",
    selector: '[data-present="do-next"]',
    title: "Do Next",
    body: "This is the single best next action. It surfaces the highest-leverage task and lets you jump straight into it.",
  },
  {
    id: "exam-countdown",
    page: "home",
    selector: '[data-present="exam-countdown"]',
    title: "Exam countdowns",
    body: "Upcoming exams are always visible with a live countdown so urgency is obvious at a glance.",
  },
  {
    id: "subject-health",
    page: "home",
    selector: '[data-present="subject-health"]',
    title: "Subject health",
    body: "Each subject gets a health score based on marks, task completion, and how much deadline pressure is coming up soon.",
  },
  {
    id: "quick-add",
    page: "tasks",
    selector: '[data-present="quick-add"]',
    title: "Quick add",
    body: "Tasks can be added instantly. Markd suggests the subject, urgency, and time estimate automatically.",
  },
  {
    id: "priorities",
    page: "tasks",
    selector: '[data-present="priority-tasks"]',
    title: "Priority engine",
    body: "Tasks are ranked by urgency, exam pressure, age, and time required, so the list naturally surfaces what matters most.",
  },
  {
    id: "subjects",
    page: "subjects",
    selector: '[data-present="subject-overview"]',
    title: "Subject overview",
    body: "Each subject card combines target grade, average mark, health, task progress, exam timing, and topic tracking in one place.",
  },
  {
    id: "marks-trend",
    page: "papers",
    selector: '[data-present="marks-trend"]',
    title: "Marks tracker",
    body: "Past papers build a performance trend over time, including average percentages and projected grades.",
  },
  {
    id: "goals",
    page: "goals",
    selector: '[data-present="goals-progress"]',
    title: "Goal progress",
    body: "Goals are grouped by horizon so students can balance short-term wins with longer-term academic targets.",
  },
  {
    id: "ai-assistant",
    page: "home",
    selector: '[data-present="ai-assistant"]',
    title: "AI study assistant",
    body: "The built-in assistant can use the student’s actual workload, exams, and goals to suggest priorities and revision plans.",
  },
];

export const DEMO_ADMIN_EMAIL = "admin@demo.markd";
export const DEMO_ADMIN_PASSWORD = "markddemo";
export const DEMO_ADMIN_USER_ID = "demo-admin";
export const DEMO_ADMIN_PROFILE = {
  userId: DEMO_ADMIN_USER_ID,
  email: DEMO_ADMIN_EMAIL,
  name: "Markd Admin",
  school: "Markd Demo Academy",
};
