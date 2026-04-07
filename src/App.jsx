import { useState } from "react";

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
let _id = 100;
const uid = () => String(++_id);
const today = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
const daysUntil = (dateStr) => {
  const t = today();
  const d = new Date(dateStr); d.setHours(0,0,0,0);
  return Math.ceil((d - t) / 86400000);
};
const fmtDate = (d) => new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
const gradeToPercent = (g) => {
  const map = {"9":90,"8":80,"7":70,"6":60,"5":50,"4":40,"3":30,"2":20,"1":10,"A*":90,"A":80,"B":70,"C":60,"D":50,"E":40,"F":30,"G":20};
  return map[g] || 50;
};

// ─── Default data ───
const DEFAULT_SUBJECTS = [
  { id:"s1", name:"English Lit", board:"AQA", target:"7", colour:"#f7a26a" },
  { id:"s2", name:"History", board:"Edexcel", target:"8", colour:"#7c6af7" },
  { id:"s3", name:"Science", board:"AQA", target:"8", colour:"#6af7c4" },
  { id:"s4", name:"Art & Design", board:"AQA", target:"9", colour:"#f76a6a" },
  { id:"s5", name:"Mathematics", board:"Edexcel", target:"7", colour:"#f7e96a" },
  { id:"s6", name:"STEM Racing", board:"Other", target:"9", colour:"#6ab4f7" },
];

const DEFAULT_TASKS = [
  { id:"t1", subjectId:"s3", text:"Write Schlieren intro paragraph", done:false },
  { id:"t2", subjectId:"s1", text:"Outline Sheila Birling analysis", done:false },
  { id:"t3", subjectId:"s2", text:"Timeline of key WWII dates", done:true },
  { id:"t4", subjectId:"s4", text:"Finalise artist research board", done:false },
  { id:"t5", subjectId:"s5", text:"Complete quadratics worksheet", done:true },
  { id:"t6", subjectId:"s6", text:"Update Dasher CAD model", done:false },
];

const DEFAULT_DEADLINES = [
  { id:"d1", subjectId:"s3", title:"Science Explora poster", date:"2026-04-18" },
  { id:"d2", subjectId:"s1", title:"Inspector Calls essay", date:"2026-04-25" },
  { id:"d3", subjectId:"s2", title:"History WWII notes", date:"2026-05-02" },
  { id:"d4", subjectId:"s4", title:"Art portfolio review", date:"2026-05-10" },
];

const DEFAULT_EXAMS = [
  { id:"e1", subjectId:"s1", name:"English Literature", board:"AQA", date:"2026-05-21" },
  { id:"e2", subjectId:"s2", name:"History", board:"Edexcel", date:"2026-05-27" },
  { id:"e3", subjectId:"s3", name:"Combined Science", board:"AQA", date:"2026-06-03" },
];

const DEFAULT_PAPERS = [
  { id:"p1", subjectId:"s1", title:"English Lit Paper 1", year:"2024", paper:"1", scored:52, total:64, file:null },
  { id:"p2", subjectId:"s2", title:"History Paper 2", year:"2024", paper:"2", scored:48, total:60, file:null },
  { id:"p3", subjectId:"s3", title:"Combined Science Paper 1", year:"2023", paper:"1", scored:58, total:80, file:null },
];

const DEFAULT_GOALS = [
  { id:"g1", text:"Complete Science Explora project", horizon:"3 months", subjectId:"s3", done:false },
  { id:"g2", text:"Finish all GCSE exams", horizon:"6 months", subjectId:null, done:false },
  { id:"g3", text:"Launch STEM Racing mentorship program", horizon:"6 months", subjectId:"s6", done:false },
  { id:"g4", text:"Compete in national F1 in Schools finals with Team SuperCharged", horizon:"9 months", subjectId:"s6", done:false },
  { id:"g5", text:"Apply to sixth form", horizon:"12 months", subjectId:null, done:false },
];

const DEFAULT_PORTFOLIO = [
  { id:"pf1", subjectId:"s3", title:"Schlieren Imaging Project", type:"Project", desc:"Visualising airflow using Schlieren optics for the Science Explora competition.", tags:["physics","optics","research"] },
  { id:"pf2", subjectId:"s6", title:"Team SuperCharged - Dasher", type:"Competition", desc:"Designed and built the F1 in Schools car 'Dasher' for national competition.", tags:["F1 in Schools","CAD","engineering"] },
  { id:"pf3", subjectId:"s6", title:"STEM Racing Mentorship", type:"Leadership", desc:"Mentoring younger students in STEM racing principles and team management.", tags:["mentoring","leadership","STEM"] },
];

const DEFAULT_ACTIVITIES = [
  {
    id:"a1",
    name:"STEM Racing / F1 in Schools",
    role:"Team Principal & Design Engineer",
    organisation:"Team SuperCharged",
    desc:"Leading Team SuperCharged in the F1 in Schools competition. Designed and built our car 'Dasher' using CAD modelling, aerodynamic analysis, and CNC manufacturing. Also run a mentorship program for younger STEM racing teams.",
    colour:"#6ab4f7",
    hoursPerWeek:6,
    events:[
      { title:"Regional Qualifiers", date:"2026-05-15" },
      { title:"National Finals", date:"2026-09-20" },
    ],
    achievements:[
      "Designed 'Dasher' car from scratch using Fusion 360",
      "Built mentorship program for STEM Racing teams",
      "Led team of 6 across design, marketing, and engineering",
    ],
    tags:["F1 in Schools","CAD","engineering","leadership"],
  },
];

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

// ─── Type labels for recently deleted ───
const TYPE_LABELS = {
  subject: "Subject",
  task: "Task",
  deadline: "Deadline",
  exam: "Exam",
  paper: "Past Paper",
  goal: "Goal",
  portfolio: "Portfolio",
  activity: "Activity",
};

// ═══════════════════════════════════════════
// Main App
// ═══════════════════════════════════════════
export default function Markd() {
  const [page, setPage] = useState("home");
  const [modal, setModal] = useState(null);
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [deadlines, setDeadlines] = useState(DEFAULT_DEADLINES);
  const [exams, setExams] = useState(DEFAULT_EXAMS);
  const [papers, setPapers] = useState(DEFAULT_PAPERS);
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [portfolio, setPortfolio] = useState(DEFAULT_PORTFOLIO);
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);

  // ─── Recently deleted (max 10) ───
  const [recentlyDeleted, setRecentlyDeleted] = useState([]);

  // ─── Confirm dialog state ───
  const [confirmDialog, setConfirmDialog] = useState(null);
  // confirmDialog = { message, onConfirm }

  // ─── Reset confirmation state ───
  const [resetStep, setResetStep] = useState(0); // 0=idle, 1=first confirm, 2=second confirm

  const pushDeleted = (type, item, label) => {
    const entry = {
      id: uid(),
      type,
      item,
      label,
      deletedAt: new Date().toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" }),
    };
    setRecentlyDeleted(prev => [entry, ...prev].slice(0, 10));
  };

  const restoreDeleted = (entry) => {
    const { type, item } = entry;
    if (type === "subject") setSubjects(s => [...s, item]);
    else if (type === "task") setTasks(s => [...s, item]);
    else if (type === "deadline") setDeadlines(s => [...s, item]);
    else if (type === "exam") setExams(s => [...s, item]);
    else if (type === "paper") setPapers(s => [...s, item]);
    else if (type === "goal") setGoals(s => [...s, item]);
    else if (type === "portfolio") setPortfolio(s => [...s, item]);
    else if (type === "activity") setActivities(s => [...s, item]);
    setRecentlyDeleted(prev => prev.filter(e => e.id !== entry.id));
  };

  // ─── Generic confirm-then-delete ───
  const confirmDelete = (message, onConfirm) => {
    setConfirmDialog({ message, onConfirm });
  };

  const deleteSubject = (id) => {
    const s = subjects.find(x => x.id === id);
    confirmDelete(`Delete "${s?.name}"?`, () => {
      pushDeleted("subject", s, s?.name);
      setSubjects(ss => ss.filter(x => x.id !== id));
    });
  };
  const deleteTask = (id) => {
    const t = tasks.find(x => x.id === id);
    confirmDelete(`Delete task "${t?.text}"?`, () => {
      pushDeleted("task", t, t?.text);
      setTasks(ts => ts.filter(x => x.id !== id));
    });
  };
  const deleteDeadline = (id) => {
    const d = deadlines.find(x => x.id === id);
    confirmDelete(`Delete deadline "${d?.title}"?`, () => {
      pushDeleted("deadline", d, d?.title);
      setDeadlines(ds => ds.filter(x => x.id !== id));
    });
  };
  const deleteExam = (id) => {
    const e = exams.find(x => x.id === id);
    confirmDelete(`Delete exam "${e?.name}"?`, () => {
      pushDeleted("exam", e, e?.name);
      setExams(es => es.filter(x => x.id !== id));
    });
  };
  const deletePaper = (id) => {
    const p = papers.find(x => x.id === id);
    confirmDelete(`Delete paper "${p?.title}"?`, () => {
      pushDeleted("paper", p, p?.title);
      setPapers(ps => ps.filter(x => x.id !== id));
    });
  };
  const deleteGoal = (id) => {
    const g = goals.find(x => x.id === id);
    confirmDelete(`Delete goal "${g?.text}"?`, () => {
      pushDeleted("goal", g, g?.text);
      setGoals(gs => gs.filter(x => x.id !== id));
    });
  };
  const deletePortfolio = (id) => {
    const p = portfolio.find(x => x.id === id);
    confirmDelete(`Delete portfolio entry "${p?.title}"?`, () => {
      pushDeleted("portfolio", p, p?.title);
      setPortfolio(ps => ps.filter(x => x.id !== id));
    });
  };
  const deleteActivity = (id) => {
    const a = activities.find(x => x.id === id);
    confirmDelete(`Delete activity "${a?.name}"?`, () => {
      pushDeleted("activity", a, a?.name);
      setActivities(as => as.filter(x => x.id !== id));
    });
  };

  // ─── Reset all data ───
  const resetAllData = () => {
    setSubjects(DEFAULT_SUBJECTS);
    setTasks(DEFAULT_TASKS);
    setDeadlines(DEFAULT_DEADLINES);
    setExams(DEFAULT_EXAMS);
    setPapers(DEFAULT_PAPERS);
    setGoals(DEFAULT_GOALS);
    setPortfolio(DEFAULT_PORTFOLIO);
    setActivities(DEFAULT_ACTIVITIES);
    setRecentlyDeleted([]);
    setResetStep(0);
  };

  // Paper sub-tab
  const [paperTab, setPaperTab] = useState("my");
  // Goals sub-tab
  const [goalTab, setGoalTab] = useState("goals");
  const [goalHorizon, setGoalHorizon] = useState("3 months");

  // AI assistant state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Browse subjects state
  const [browseCurriculum, setBrowseCurriculum] = useState("GCSE");
  const [browseSelected, setBrowseSelected] = useState(new Set());
  const [browseSearch, setBrowseSearch] = useState("");
  const [subjectTab, setSubjectTab] = useState("browse");

  // Settings state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("general"); // "general" | "deleted"
  const [teamsConnected, setTeamsConnected] = useState(false);
  const [teamsSyncing, setTeamsSyncing] = useState(false);
  const [teamsLastSync, setTeamsLastSync] = useState(null);
  const [teamsUser, setTeamsUser] = useState(null);
  const [syncLog, setSyncLog] = useState([]);
  const [autoSync, setAutoSync] = useState(true);
  const [theme, setTheme] = useState("dark");
  const API_URL = "http://localhost:3001";

  // ─── Subject helpers ───
  const sub = (id) => subjects.find(s => s.id === id);
  const subColour = (id) => sub(id)?.colour || "var(--muted)";
  const subName = (id) => sub(id)?.name || "Unknown";

  const avgMark = (sId) => {
    const sp = papers.filter(p => p.subjectId === sId);
    if (!sp.length) return null;
    return Math.round(sp.reduce((a,p) => a + (p.scored/p.total)*100, 0) / sp.length);
  };

  const subjectDeadlineCount = (sId) => deadlines.filter(d => d.subjectId === sId).length;
  const subjectTaskProgress = (sId) => {
    const st = tasks.filter(t => t.subjectId === sId);
    if (!st.length) return null;
    return { done: st.filter(t=>t.done).length, total: st.length };
  };

  // ─── Modal form state ───
  const [form, setForm] = useState({});
  const updateForm = (k,v) => setForm(f => ({...f, [k]:v}));

  const openModal = (type) => {
    setForm({});
    if (type === "addSubject") {
      setBrowseSelected(new Set());
      setBrowseSearch("");
    }
    setModal(type);
  };

  const fabAction = () => {
    const map = {
      home:null, subjects:"addSubject", tasks:"addTask", deadlines:"addDeadline",
      exams:"addExam", papers:"addPaper", goals:"addGoal", portfolio:"addPortfolio",
      activities:"addActivity"
    };
    const m = map[page];
    if (m) openModal(m);
  };

  const toggleBrowseSubject = (name) => {
    setBrowseSelected(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const addBrowsedSubjects = () => {
    if (browseSelected.size === 0) return;
    const curr = CURRICULA[browseCurriculum];
    const existingNames = new Set(subjects.map(s => s.name.toLowerCase()));
    const newSubjects = [];
    let colourIdx = subjects.length;
    browseSelected.forEach(name => {
      if (existingNames.has(name.toLowerCase())) return;
      const catalogEntry = curr.subjects.find(s => s.name === name);
      newSubjects.push({
        id: uid(),
        name,
        board: catalogEntry?.board || curr.defaultBoard,
        target: curr.defaultTarget,
        colour: PALETTE[colourIdx % PALETTE.length],
      });
      colourIdx++;
    });
    if (newSubjects.length > 0) setSubjects(s => [...s, ...newSubjects]);
    setModal(null);
  };

  // ─── Teams Integration ───
  const checkTeamsAuth = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/status`, { credentials: "include" });
      const data = await res.json();
      if (data.authenticated) {
        setTeamsConnected(true);
        setTeamsUser(data.user);
        if (autoSync) syncTeams();
      }
    } catch (err) {}
  };

  const loginTeams = () => {
    window.open(`${API_URL}/auth/login`, "_blank", "width=500,height=700");
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/auth/status`, { credentials: "include" });
        const data = await res.json();
        if (data.authenticated) {
          clearInterval(poll);
          setTeamsConnected(true);
          setTeamsUser(data.user);
          addSyncLog("Connected to Microsoft Teams");
          syncTeams();
        }
      } catch (err) {}
    }, 2000);
    setTimeout(() => clearInterval(poll), 120000);
  };

  const logoutTeams = async () => {
    try { await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" }); } catch (err) {}
    setTeamsConnected(false);
    setTeamsUser(null);
    setTeamsLastSync(null);
    addSyncLog("Disconnected from Teams");
  };

  const addSyncLog = (msg) => {
    const entry = { time: new Date().toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" }), msg };
    setSyncLog(prev => [entry, ...prev].slice(0, 20));
  };

  const syncTeams = async () => {
    if (teamsSyncing) return;
    setTeamsSyncing(true);
    addSyncLog("Syncing with Teams...");
    try {
      const res = await fetch(`${API_URL}/api/teams/sync`, { credentials: "include" });
      if (!res.ok) throw new Error("Sync failed");
      const data = await res.json();
      let subjectMap = {};
      const currentSubjects = [...subjects];
      let colourIdx = currentSubjects.length;
      (data.subjects || []).forEach(cls => {
        const existing = currentSubjects.find(s => s.name.toLowerCase() === cls.name.toLowerCase());
        if (existing) { subjectMap[cls.name] = existing.id; }
        else {
          const newId = uid();
          currentSubjects.push({ id: newId, name: cls.name, board: cls.board || "Other", target: cls.target || "5", colour: cls.colour || PALETTE[colourIdx % PALETTE.length], teamsClassId: cls.teamsClassId });
          subjectMap[cls.name] = newId;
          colourIdx++;
        }
      });
      setSubjects(currentSubjects);
      const existingTeamsDeadlines = new Set(deadlines.filter(d => d.teamsId).map(d => d.teamsId));
      const newDeadlines = (data.deadlines || []).filter(d => d.date && !existingTeamsDeadlines.has(d.teamsId)).map(d => ({ id: uid(), subjectId: subjectMap[d.className] || null, title: d.title, date: d.date, teamsId: d.teamsId })).filter(d => d.subjectId);
      if (newDeadlines.length > 0) { setDeadlines(prev => [...prev, ...newDeadlines]); addSyncLog(`Added ${newDeadlines.length} deadline${newDeadlines.length > 1 ? "s" : ""}`); }
      const existingTeamsTasks = new Set(tasks.filter(t => t.teamsId).map(t => t.teamsId));
      const newTasks = (data.tasks || []).filter(t => !existingTeamsTasks.has(t.teamsId)).map(t => ({ id: uid(), subjectId: subjectMap[t.className] || null, text: t.text, done: t.done || false, teamsId: t.teamsId })).filter(t => t.subjectId);
      if (newTasks.length > 0) { setTasks(prev => [...prev, ...newTasks]); addSyncLog(`Added ${newTasks.length} task${newTasks.length > 1 ? "s" : ""}`); }
      const existingTeamsExams = new Set(exams.filter(e => e.teamsId).map(e => e.teamsId));
      const newExams = (data.exams || []).filter(e => e.date && !existingTeamsExams.has(e.teamsId)).map(e => ({ id: uid(), subjectId: subjectMap[e.className] || subjects[0]?.id, name: e.name, board: "Other", date: e.date, teamsId: e.teamsId }));
      if (newExams.length > 0) { setExams(prev => [...prev, ...newExams]); addSyncLog(`Added ${newExams.length} exam${newExams.length > 1 ? "s" : ""}`); }
      const totalNew = newDeadlines.length + newTasks.length + newExams.length;
      if (totalNew === 0) addSyncLog("Everything up to date");
      setTeamsLastSync(new Date().toISOString());
      addSyncLog("Sync complete");
    } catch (err) {
      addSyncLog("Sync failed. Check connection.");
    } finally {
      setTeamsSyncing(false);
    }
  };

  // ─── AI Assistant ───
  const buildSystemPrompt = () => {
    const now = new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
    const subSummaries = subjects.map(s => {
      const avg = avgMark(s.id);
      const tp = subjectTaskProgress(s.id);
      const dlCount = subjectDeadlineCount(s.id);
      return `- ${s.name} (${s.board}, target grade ${s.target}, avg mark ${avg !== null ? avg+"%" : "no papers yet"}, ${dlCount} deadlines, tasks ${tp ? tp.done+"/"+tp.total+" done" : "none"})`;
    }).join("\n");
    const dlSummaries = [...deadlines].sort((a,b)=>new Date(a.date)-new Date(b.date)).map(d => `- ${d.title} [${subName(d.subjectId)}] due ${fmtDate(d.date)} (${daysUntil(d.date)} days away)`).join("\n");
    const examSummaries = [...exams].sort((a,b)=>new Date(a.date)-new Date(b.date)).map(e => `- ${e.name} (${e.board}) on ${fmtDate(e.date)} (${daysUntil(e.date)} days away)`).join("\n");
    const taskSummaries = tasks.map(t => `- [${t.done?"DONE":"TODO"}] ${t.text} [${subName(t.subjectId)}]`).join("\n");
    const goalSummaries = goals.map(g => `- [${g.done?"DONE":"TODO"}] ${g.text} (${g.horizon}${g.subjectId ? ", "+subName(g.subjectId) : ""})`).join("\n");
    return `You are the AI study assistant built into Markd, a GCSE student organiser app. You are talking to Reyansh, a GCSE student at The British School New Delhi. Today is ${now}.\n\nYour role: help Reyansh stay on top of his schoolwork, plan revision, suggest priorities, answer subject questions, and motivate him. Be concise, supportive, and practical. Use his actual data below to give personalised advice. Keep answers short (2-4 sentences usually) since this is a mobile chat. Use a warm, encouraging tone appropriate for a secondary school student.\n\nSUBJECTS:\n${subSummaries}\n\nUPCOMING DEADLINES:\n${dlSummaries || "None"}\n\nUPCOMING EXAMS:\n${examSummaries || "None"}\n\nCURRENT TASKS:\n${taskSummaries || "None"}\n\nGOALS:\n${goalSummaries || "None"}\n\nKey context: Reyansh is part of Team SuperCharged in F1 in Schools, their car is called Dasher. He is working on a Schlieren Imaging project for Science Explora. He is studying An Inspector Calls for English Literature.`;
  };

  const sendAiMessage = async () => {
    const text = aiInput.trim();
    if (!text || aiLoading) return;
    const userMsg = { role: "user", content: text };
    const updatedMessages = [...aiMessages, userMsg];
    setAiMessages(updatedMessages);
    setAiInput("");
    setAiLoading(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: buildSystemPrompt(), messages: updatedMessages.map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await response.json();
      const assistantText = data.content?.map(block => block.type === "text" ? block.text : "").filter(Boolean).join("\n") || "Sorry, I couldn't process that. Try again?";
      setAiMessages(prev => [...prev, { role: "assistant", content: assistantText }]);
    } catch (err) {
      setAiMessages(prev => [...prev, { role: "assistant", content: "Connection issue. Check your network and try again." }]);
    } finally {
      setAiLoading(false);
    }
  };

  // ─── Add handlers ───
  const addSubject = () => {
    if (!form.name) return;
    setSubjects(s => [...s, { id:uid(), name:form.name, board:form.board||"AQA", target:form.target||"5", colour:form.colour||PALETTE[0] }]);
    setModal(null);
  };
  const addTask = () => {
    if (!form.text || !form.subjectId) return;
    setTasks(t => [...t, { id:uid(), subjectId:form.subjectId, text:form.text, done:false }]);
    setModal(null);
  };
  const addDeadline = () => {
    if (!form.title || !form.subjectId || !form.date) return;
    setDeadlines(d => [...d, { id:uid(), subjectId:form.subjectId, title:form.title, date:form.date }]);
    setModal(null);
  };
  const addExam = () => {
    if (!form.name || !form.subjectId || !form.date) return;
    setExams(e => [...e, { id:uid(), subjectId:form.subjectId, name:form.name, board:form.board||sub(form.subjectId)?.board||"AQA", date:form.date }]);
    setModal(null);
  };
  const addPaper = () => {
    if (!form.subjectId || !form.title || !form.scored || !form.total) return;
    setPapers(p => [...p, { id:uid(), subjectId:form.subjectId, title:form.title, year:form.year||"", paper:form.paper||"", scored:Number(form.scored), total:Number(form.total), file:form.file||null }]);
    setModal(null);
  };
  const addGoal = () => {
    if (!form.text) return;
    setGoals(g => [...g, { id:uid(), text:form.text, horizon:form.horizon||"3 months", subjectId:form.subjectId||null, done:false }]);
    setModal(null);
  };
  const addPortfolio = () => {
    if (!form.title || !form.subjectId) return;
    setPortfolio(p => [...p, { id:uid(), subjectId:form.subjectId, title:form.title, type:form.type||"Project", desc:form.desc||"", tags:(form.tags||"").split(",").map(t=>t.trim()).filter(Boolean) }]);
    setModal(null);
  };
  const addActivity = () => {
    if (!form.name) return;
    setActivities(a => [...a, { id: uid(), name: form.name, role: form.role || "", organisation: form.organisation || "", desc: form.desc || "", colour: form.colour || PALETTE[activities.length % PALETTE.length], hoursPerWeek: Number(form.hoursPerWeek) || 0, events: [], achievements: (form.achievements || "").split("\n").map(s=>s.trim()).filter(Boolean), tags: (form.tags || "").split(",").map(t=>t.trim()).filter(Boolean) }]);
    setModal(null);
  };

  const urgency = (dateStr) => {
    const d = daysUntil(dateStr);
    if (d < 7) return { label:"Urgent", color:"var(--danger)" };
    if (d < 21) return { label:"Soon", color:"var(--accent2)" };
    return { label:"Later", color:"var(--accent3)" };
  };
  const countdownColor = (d) => d < 7 ? "var(--danger)" : d < 21 ? "var(--accent2)" : "var(--accent3)";

  const groupBySubject = (items) => {
    const groups = {};
    items.forEach(item => {
      const sId = item.subjectId;
      if (!groups[sId]) groups[sId] = [];
      groups[sId].push(item);
    });
    return groups;
  };

  // ─── DeleteBtn using confirmDelete ───
  const DeleteBtn = ({ onClick }) => (
    <button className="delete-btn" onClick={(e)=>{e.stopPropagation();onClick();}} aria-label="Delete">
      <Icon d={icons.trash} size={16} color="var(--muted)"/>
    </button>
  );

  // ═══════════════════════════════════
  // PAGES
  // ═══════════════════════════════════

  const renderHome = () => {
    const totalDeadlines = deadlines.length;
    const tasksDone = tasks.filter(t=>t.done).length;
    const totalTasks = tasks.length;
    const sortedExams = [...exams].sort((a,b) => new Date(a.date)-new Date(b.date));
    const nextExam = sortedExams[0];
    const sortedDeadlines = [...deadlines].sort((a,b) => new Date(a.date)-new Date(b.date)).slice(0,3);
    const recentTasks = tasks.slice(-4);
    return (
      <div className="page">
        <h2 className="page-title">Dashboard</h2>
        <div className="stat-row">
          <div className="stat-card"><div className="stat-num">{totalDeadlines}</div><div className="stat-label">Deadlines</div></div>
          <div className="stat-card"><div className="stat-num">{tasksDone}/{totalTasks}</div><div className="stat-label">Tasks Done</div></div>
        </div>
        {nextExam && (
          <div className="next-exam-card" onClick={()=>setPage("exams")}>
            <div className="next-exam-label">Next Exam</div>
            <div className="next-exam-name">{nextExam.name}</div>
            <div className="next-exam-date">{fmtDate(nextExam.date)}</div>
            <div className="next-exam-days" style={{color:countdownColor(daysUntil(nextExam.date))}}>{daysUntil(nextExam.date)} days</div>
          </div>
        )}
        <div className="section-header">
          <span>Upcoming Deadlines</span>
          <button className="link-btn" onClick={()=>setPage("deadlines")}>View all <Icon d={icons.chevron} size={14}/></button>
        </div>
        {sortedDeadlines.map(dl => {
          const u = urgency(dl.date);
          return (
            <div key={dl.id} className="list-item" style={{borderLeft:`3px solid ${subColour(dl.subjectId)}`}}>
              <div><div className="list-item-title">{dl.title}</div><div className="list-item-sub">{fmtDate(dl.date)}</div></div>
              <span className="badge" style={{background:u.color+"22",color:u.color}}>{u.label}</span>
            </div>
          );
        })}
        <div className="section-header">
          <span>Subjects</span>
          <button className="link-btn" onClick={()=>setPage("subjects")}>View all <Icon d={icons.chevron} size={14}/></button>
        </div>
        <div className="subjects-mini-grid">
          {subjects.map(s => (
            <div key={s.id} className="subject-mini" style={{borderTop:`3px solid ${s.colour}`}}>
              <div className="subject-mini-name">{s.name}</div>
              <div className="subject-mini-stats"><span>Target: {s.target}</span>{avgMark(s.id) !== null && <span>Avg: {avgMark(s.id)}%</span>}</div>
            </div>
          ))}
        </div>
        <div className="section-header">
          <span>Recent Tasks</span>
          <button className="link-btn" onClick={()=>setPage("tasks")}>View all <Icon d={icons.chevron} size={14}/></button>
        </div>
        {recentTasks.map(t => (
          <div key={t.id} className="list-item" style={{borderLeft:`3px solid ${subColour(t.subjectId)}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span className={`task-check ${t.done?"checked":""}`} style={{borderColor:subColour(t.subjectId), background:t.done?subColour(t.subjectId):"transparent"}}>{t.done?"✓":""}</span>
              <span style={{textDecoration:t.done?"line-through":"none",color:t.done?"var(--muted)":"var(--text)"}}>{t.text}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSubjects = () => (
    <div className="page">
      <h2 className="page-title">Subjects</h2>
      {subjects.map(s => {
        const avg = avgMark(s.id);
        const dlCount = subjectDeadlineCount(s.id);
        const tp = subjectTaskProgress(s.id);
        return (
          <div key={s.id} className="subject-card" style={{borderLeft:`4px solid ${s.colour}`}}>
            <div className="subject-card-header">
              <div><div className="subject-card-name">{s.name}</div><div className="subject-card-board">{s.board}</div></div>
              <DeleteBtn onClick={() => deleteSubject(s.id)}/>
            </div>
            <div className="subject-card-stats">
              <div className="subject-stat"><span className="subject-stat-label">Target</span><span className="subject-stat-val" style={{color:s.colour}}>{s.target}</span></div>
              <div className="subject-stat"><span className="subject-stat-label">Avg Mark</span><span className="subject-stat-val">{avg !== null ? avg+"%" : "---"}</span></div>
              <div className="subject-stat"><span className="subject-stat-label">Deadlines</span><span className="subject-stat-val">{dlCount}</span></div>
            </div>
            {tp && (
              <div className="progress-wrap">
                <div className="progress-bar"><div className="progress-fill" style={{width:`${(tp.done/tp.total)*100}%`,background:s.colour}}/></div>
                <span className="progress-label">{tp.done}/{tp.total} tasks</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderTasks = () => {
    const grouped = groupBySubject(tasks);
    return (
      <div className="page">
        <h2 className="page-title">Tasks</h2>
        {Object.entries(grouped).map(([sId, items]) => (
          <div key={sId} className="group-section">
            <div className="group-label" style={{color:subColour(sId)}}>{subName(sId)}</div>
            {items.map(t => (
              <div key={t.id} className="list-item" style={{borderLeft:`3px solid ${subColour(t.subjectId)}`}}>
                <div style={{display:"flex",alignItems:"center",gap:10,flex:1}}>
                  <span className={`task-check ${t.done?"checked":""}`} style={{borderColor:subColour(t.subjectId), background:t.done?subColour(t.subjectId):"transparent"}} onClick={()=>setTasks(ts=>ts.map(x=>x.id===t.id?{...x,done:!x.done}:x))}>{t.done?"✓":""}</span>
                  <span style={{textDecoration:t.done?"line-through":"none",color:t.done?"var(--muted)":"var(--text)"}}>{t.text}</span>
                </div>
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
        {Object.entries(grouped).map(([sId, items]) => (
          <div key={sId} className="group-section">
            <div className="group-label" style={{color:subColour(sId)}}>{subName(sId)}</div>
            {items.map(dl => {
              const u = urgency(dl.date);
              const d = daysUntil(dl.date);
              return (
                <div key={dl.id} className="list-item" style={{borderLeft:`3px solid ${subColour(dl.subjectId)}`}}>
                  <div style={{flex:1}}><div className="list-item-title">{dl.title}</div><div className="list-item-sub">{fmtDate(dl.date)} · {d} days</div></div>
                  <span className="badge" style={{background:u.color+"22",color:u.color}}>{u.label}</span>
                  <DeleteBtn onClick={()=>deleteDeadline(dl.id)}/>
                </div>
              );
            })}
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
        {sorted.map(ex => {
          const d = daysUntil(ex.date);
          return (
            <div key={ex.id} className="exam-card" style={{borderLeft:`4px solid ${subColour(ex.subjectId)}`}}>
              <div style={{flex:1}}><div className="exam-name">{ex.name}</div><div className="exam-board">{ex.board}</div><div className="exam-date">{fmtDate(ex.date)}</div></div>
              <div className="exam-days" style={{color:countdownColor(d)}}>{d}<span className="exam-days-label">days</span></div>
              <DeleteBtn onClick={()=>deleteExam(ex.id)}/>
            </div>
          );
        })}
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
          Object.entries(grouped).map(([sId, items]) => {
            const sAvg = Math.round(items.reduce((a,p)=>a+(p.scored/p.total)*100,0)/items.length);
            return (
              <div key={sId} className="group-section">
                <div className="group-label" style={{color:subColour(sId)}}>{subName(sId)} <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,marginLeft:8,color:"var(--text)"}}>Avg: {sAvg}%</span></div>
                {items.map(p => {
                  const pct = Math.round((p.scored/p.total)*100);
                  return (
                    <div key={p.id} className="paper-card" style={{borderLeft:`3px solid ${subColour(p.subjectId)}`}}>
                      <div className="paper-header">
                        <div><div className="list-item-title">{p.title}</div><div className="list-item-sub">{p.year}{p.paper ? ` - Paper ${p.paper}` : ""}</div></div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div className="paper-score">{p.scored}/{p.total} <span className="paper-pct">({pct}%)</span></div>
                          <DeleteBtn onClick={()=>deletePaper(p.id)}/>
                        </div>
                      </div>
                      <div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`,background:pct>=70?"var(--accent3)":pct>=50?"var(--accent2)":"var(--danger)"}}/></div>
                      {p.file && <div className="paper-file">📎 {p.file}</div>}
                    </div>
                  );
                })}
              </div>
            );
          })
        ) : (
          <div className="link-list">
            {PAPER_LINKS.map(l => (
              <a key={l.name} className="link-card" href={l.url} target="_blank" rel="noopener noreferrer">
                <div><div className="link-card-name">{l.name}</div><div className="link-card-desc">{l.desc}</div></div>
                <Icon d={icons.link} size={18} color="var(--accent)"/>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderGoals = () => {
    const filtered = goals.filter(g => g.horizon === goalHorizon);
    const horizonProgress = (h) => {
      const hg = goals.filter(g=>g.horizon===h);
      if (!hg.length) return 0;
      return Math.round((hg.filter(g=>g.done).length / hg.length)*100);
    };
    const marksVsTarget = subjects.map(s => {
      const avg = avgMark(s.id);
      const tPct = gradeToPercent(s.target);
      return { ...s, avg, targetPct:tPct, gap: avg !== null ? avg - tPct : null };
    }).filter(s => s.avg !== null);
    return (
      <div className="page">
        <h2 className="page-title">Goals</h2>
        <div className="tab-row">
          <button className={`tab-btn ${goalTab==="goals"?"active":""}`} onClick={()=>setGoalTab("goals")}>Goals</button>
          <button className={`tab-btn ${goalTab==="marks"?"active":""}`} onClick={()=>setGoalTab("marks")}>Marks vs Target</button>
        </div>
        {goalTab === "goals" ? (<>
          <div className="horizon-row">
            {HORIZONS.map(h => (
              <button key={h} className={`horizon-btn ${goalHorizon===h?"active":""}`} onClick={()=>setGoalHorizon(h)}>{h}</button>
            ))}
          </div>
          {filtered.map(g => (
            <div key={g.id} className="list-item">
              <div style={{display:"flex",alignItems:"flex-start",gap:10,flex:1}}>
                <span className={`goal-check ${g.done?"checked":""}`} onClick={()=>setGoals(gs=>gs.map(x=>x.id===g.id?{...x,done:!x.done}:x))}/>
                <div>
                  <span style={{color:g.done?"var(--muted)":"var(--text)",textDecoration:g.done?"line-through":"none"}}>{g.text}</span>
                  {g.subjectId && <div className="goal-subject-tag" style={{background:subColour(g.subjectId)+"22",color:subColour(g.subjectId)}}>{subName(g.subjectId)}</div>}
                </div>
              </div>
              <DeleteBtn onClick={()=>deleteGoal(g.id)}/>
            </div>
          ))}
          <div className="goals-overview">
            <div className="goals-overview-title">Progress Overview</div>
            {HORIZONS.map(h => (
              <div key={h} className="goals-overview-row">
                <span className="goals-overview-label">{h}</span>
                <div className="progress-bar" style={{flex:1}}><div className="progress-fill" style={{width:`${horizonProgress(h)}%`,background:"var(--accent)"}}/></div>
                <span className="goals-overview-pct">{horizonProgress(h)}%</span>
              </div>
            ))}
          </div>
        </>) : (<>
          {marksVsTarget.map(s => (
            <div key={s.id} className="mvt-card">
              <div className="mvt-name">{s.name}</div>
              <div className="mvt-bars">
                <div className="mvt-bar-row"><span className="mvt-bar-label">Actual</span><div className="progress-bar" style={{flex:1}}><div className="progress-fill" style={{width:`${s.avg}%`,background:s.avg>=s.targetPct?"var(--accent3)":"var(--danger)"}}/></div><span className="mvt-bar-val">{s.avg}%</span></div>
                <div className="mvt-bar-row"><span className="mvt-bar-label">Target</span><div className="progress-bar" style={{flex:1}}><div className="progress-fill" style={{width:`${s.targetPct}%`,background:s.colour}}/></div><span className="mvt-bar-val">{s.targetPct}%</span></div>
              </div>
              <div className="mvt-gap" style={{color:s.gap>=0?"var(--accent3)":"var(--danger)"}}>{s.gap>=0?"+":""}{s.gap}%</div>
            </div>
          ))}
          {marksVsTarget.length === 0 && <div className="empty-state">Log some past papers to see your marks vs targets.</div>}
        </>)}
      </div>
    );
  };

  const exportPortfolioPDF = () => {
    const today_str = new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
    const entries = portfolio.map(pf => {
      const sCol = subColour(pf.subjectId);
      const sNm = subName(pf.subjectId);
      const typeCol = TYPE_COLOURS[pf.type] || "#7c6af7";
      const tagsHtml = pf.tags.length > 0 ? `<div class="tags">${pf.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</div>` : "";
      return `<div class="entry" style="border-left:4px solid ${sCol}"><div class="entry-header"><h3>${pf.title}</h3><div class="meta"><span class="type-badge" style="background:${typeCol}22;color:${typeCol}">${pf.type}</span><span class="subject" style="color:${sCol}">${sNm}</span></div></div>${pf.desc ? `<p class="desc">${pf.desc}</p>` : ""}${tagsHtml}</div>`;
    }).join("");
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Markd Portfolio</title><link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'DM Mono',monospace;font-size:12px;color:#1a1a24;padding:40px;max-width:700px;margin:0 auto}.header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:8px;padding-bottom:16px;border-bottom:2px solid #7c6af7}.logo{font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:#0a0a0f}.entry{background:#fafafe;border:1px solid #e8e8f0;border-radius:10px;padding:18px;margin-bottom:14px}.entry-header h3{font-family:'Syne',sans-serif;font-weight:700;font-size:15px;margin-bottom:8px}.meta{display:flex;align-items:center;gap:10px;margin-bottom:6px}.type-badge{font-size:10px;padding:3px 8px;border-radius:5px}.desc{font-size:12px;color:#3a3a4a;line-height:1.6;margin-top:8px}.tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.tag{font-size:10px;padding:3px 8px;border-radius:4px;background:#f0f0f8;color:#6b6b80}</style></head><body><div class="header"><div><div class="logo">Markd</div></div><div>${today_str}</div></div>${entries}</body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 400); }
  };

  const renderPortfolio = () => (
    <div className="page">
      <div className="portfolio-page-header">
        <h2 className="page-title" style={{marginBottom:0}}>Portfolio</h2>
        {portfolio.length > 0 && (
          <button className="export-btn" onClick={exportPortfolioPDF}>
            <Icon d={icons.download} size={16} color="var(--accent)"/><span>Export PDF</span>
          </button>
        )}
      </div>
      {portfolio.map(pf => (
        <div key={pf.id} className="portfolio-card" style={{borderLeft:`4px solid ${subColour(pf.subjectId)}`}}>
          <div className="portfolio-header">
            <div className="portfolio-title">{pf.title}</div>
            <DeleteBtn onClick={()=>deletePortfolio(pf.id)}/>
          </div>
          <div className="portfolio-meta">
            <span className="portfolio-type" style={{background:TYPE_COLOURS[pf.type]+"22",color:TYPE_COLOURS[pf.type]}}>{pf.type}</span>
            <span className="portfolio-subject" style={{color:subColour(pf.subjectId)}}>{subName(pf.subjectId)}</span>
          </div>
          {pf.desc && <div className="portfolio-desc">{pf.desc}</div>}
          {pf.tags.length > 0 && <div className="portfolio-tags">{pf.tags.map((tag,i) => <span key={i} className="tag-chip">{tag}</span>)}</div>}
        </div>
      ))}
    </div>
  );

  const renderActivities = () => (
    <div className="page">
      <h2 className="page-title">Activities</h2>
      {activities.length === 0 && <div className="empty-state">Tap the + button to add an extracurricular activity.</div>}
      {activities.map(a => {
        const nextEvent = [...(a.events || [])].filter(e => e.date && daysUntil(e.date) >= 0).sort((x,y) => new Date(x.date) - new Date(y.date))[0];
        return (
          <div key={a.id} className="activity-card" style={{borderLeft:`4px solid ${a.colour}`}}>
            <div className="activity-header">
              <div style={{flex:1}}>
                <div className="activity-name">{a.name}</div>
                {a.organisation && <div className="activity-org">{a.organisation}</div>}
                {a.role && <div className="activity-role" style={{color:a.colour}}>{a.role}</div>}
              </div>
              <DeleteBtn onClick={()=>deleteActivity(a.id)}/>
            </div>
            {a.desc && <div className="activity-desc">{a.desc}</div>}
            <div className="activity-stats">
              {a.hoursPerWeek > 0 && <div className="activity-stat"><span className="activity-stat-label">Hours / week</span><span className="activity-stat-val" style={{color:a.colour}}>{a.hoursPerWeek}h</span></div>}
              {nextEvent && <div className="activity-stat"><span className="activity-stat-label">Next event</span><span className="activity-stat-val" style={{color:countdownColor(daysUntil(nextEvent.date))}}>{daysUntil(nextEvent.date)}d</span></div>}
              {a.achievements?.length > 0 && <div className="activity-stat"><span className="activity-stat-label">Achievements</span><span className="activity-stat-val">{a.achievements.length}</span></div>}
            </div>
            {a.events?.length > 0 && (
              <div className="activity-section">
                <div className="activity-section-label">Upcoming Events</div>
                {a.events.filter(e => e.date && daysUntil(e.date) >= 0).sort((x,y) => new Date(x.date) - new Date(y.date)).map((e,i) => {
                  const d = daysUntil(e.date);
                  return (<div key={i} className="activity-event"><div><div className="activity-event-title">{e.title}</div><div className="activity-event-date">{fmtDate(e.date)}</div></div><span className="badge" style={{background:countdownColor(d)+"22",color:countdownColor(d)}}>{d}d</span></div>);
                })}
              </div>
            )}
            {a.achievements?.length > 0 && (
              <div className="activity-section">
                <div className="activity-section-label">Achievements</div>
                {a.achievements.map((ach,i) => (<div key={i} className="activity-achievement"><span className="activity-bullet" style={{background:a.colour}}/><span>{ach}</span></div>))}
              </div>
            )}
            {a.tags?.length > 0 && <div className="portfolio-tags">{a.tags.map((tag,i) => <span key={i} className="tag-chip">{tag}</span>)}</div>}
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
      <div className="modal-overlay" style={{zIndex:400}} onClick={() => setConfirmDialog(null)}>
        <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
          <div className="confirm-icon">
            <Icon d={icons.trash} size={22} color="var(--danger)"/>
          </div>
          <div className="confirm-message">{confirmDialog.message}</div>
          <div className="confirm-note">This can be undone from Recently Deleted in Settings.</div>
          <div className="confirm-actions">
            <button className="confirm-cancel" onClick={() => setConfirmDialog(null)}>Cancel</button>
            <button className="confirm-delete" onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }}>Delete</button>
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
          <div className="ai-header">
            <div className="ai-header-left"><Icon d={icons.sparkle} size={18} color="var(--accent)"/><span className="ai-title">Study Assistant</span></div>
            <button className="ai-close" onClick={()=>setAiOpen(false)}><Icon d={icons.x} size={18} color="var(--muted)"/></button>
          </div>
          <div className="ai-messages">
            {aiMessages.length === 0 && (
              <div className="ai-welcome">
                <div className="ai-welcome-icon"><Icon d={icons.sparkle} size={28} color="var(--accent)"/></div>
                <div className="ai-welcome-text">Hey Reyansh! Ask me anything about your subjects, revision planning, or upcoming exams.</div>
              </div>
            )}
            {aiMessages.map((m,i) => (
              <div key={i} className={`ai-msg ${m.role}`}><div className={`ai-bubble ${m.role}`}>{m.content}</div></div>
            ))}
            {aiLoading && (
              <div className="ai-msg assistant"><div className="ai-bubble assistant ai-typing"><span className="dot"/><span className="dot"/><span className="dot"/></div></div>
            )}
          </div>
          <div className="ai-input-row">
            <input className="ai-input" placeholder="Ask me anything..." value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter") sendAiMessage(); }}/>
            <button className="ai-send" onClick={sendAiMessage} disabled={aiLoading || !aiInput.trim()}><Icon d={icons.send} size={18} color={aiInput.trim() ? "white" : "var(--muted)"}/></button>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════
  // SETTINGS PANEL
  // ═══════════════════════════════════
  const MicrosoftLogo = () => (
    <svg width="16" height="16" viewBox="0 0 21 21"><rect x="0" y="0" width="10" height="10" fill="#f25022"/><rect x="11" y="0" width="10" height="10" fill="#7fba00"/><rect x="0" y="11" width="10" height="10" fill="#00a4ef"/><rect x="11" y="11" width="10" height="10" fill="#ffb900"/></svg>
  );

  const renderSettingsPanel = () => {
    if (!settingsOpen) return null;
    const syncTimeAgo = teamsLastSync ? (() => {
      const mins = Math.floor((Date.now() - new Date(teamsLastSync)) / 60000);
      if (mins < 1) return "just now";
      if (mins < 60) return `${mins}m ago`;
      return `${Math.floor(mins/60)}h ago`;
    })() : null;

    return (
      <div className="modal-overlay" onClick={()=>{ setSettingsOpen(false); setResetStep(0); }}>
        <div className="settings-sheet" onClick={e=>e.stopPropagation()}>
          <div className="modal-handle"/>
          <div className="settings-header">
            <Icon d={icons.settings} size={20} color="var(--accent)"/>
            <span className="settings-title">Settings</span>
          </div>

          {/* Settings tabs */}
          <div className="tab-row" style={{marginBottom:16}}>
            <button className={`tab-btn ${settingsTab==="general"?"active":""}`} onClick={()=>setSettingsTab("general")}>General</button>
            <button className={`tab-btn ${settingsTab==="deleted"?"active":""}`} onClick={()=>setSettingsTab("deleted")}>
              Recently Deleted {recentlyDeleted.length > 0 && <span className="deleted-badge">{recentlyDeleted.length}</span>}
            </button>
          </div>

          {settingsTab === "general" ? (<>
            {/* Profile */}
            <div className="settings-section">
              <div className="settings-profile">
                <div className="settings-avatar">R</div>
                <div>
                  <div className="settings-name">{teamsUser?.name || "Reyansh"}</div>
                  <div className="settings-email">{teamsUser?.email || "The British School New Delhi"}</div>
                </div>
              </div>
            </div>

            {/* Teams */}
            <div className="settings-section">
              <div className="settings-section-title">Microsoft Teams</div>
              {!teamsConnected ? (
                <button className="teams-connect-btn" onClick={loginTeams}><MicrosoftLogo/><span>Connect Microsoft Teams</span></button>
              ) : (
                <div className="teams-connected">
                  <div className="teams-status-row"><div className="teams-status-dot"/><span className="teams-status-text">Connected</span>{syncTimeAgo && <span className="teams-sync-time">Synced {syncTimeAgo}</span>}</div>
                  <div className="teams-actions">
                    <button className="teams-sync-btn" onClick={syncTeams} disabled={teamsSyncing}><Icon d={icons.sync} size={14} color="var(--accent)"/><span>{teamsSyncing ? "Syncing..." : "Sync Now"}</span></button>
                    <button className="teams-disconnect-btn" onClick={logoutTeams}>Disconnect</button>
                  </div>
                  <div className="teams-autosync-row"><span>Auto-sync on open</span><button className={`toggle ${autoSync?"on":""}`} onClick={()=>setAutoSync(!autoSync)}><div className="toggle-knob"/></button></div>
                </div>
              )}
            </div>

            {/* Sync log */}
            {syncLog.length > 0 && (
              <div className="settings-section">
                <div className="settings-section-title">Sync Log</div>
                <div className="sync-log">{syncLog.map((entry, i) => (<div key={i} className="sync-log-entry"><span className="sync-log-time">{entry.time}</span><span className="sync-log-msg">{entry.msg}</span></div>))}</div>
              </div>
            )}

            {/* Appearance */}
            <div className="settings-section">
              <div className="settings-section-title">Appearance</div>
              <div className="theme-toggle-row">
                <button className={`theme-option ${theme === "dark" ? "active" : ""}`} onClick={() => setTheme("dark")}>
                  <div className="theme-preview dark-preview"><div className="theme-preview-bar"/><div className="theme-preview-card"/></div>
                  <span>Dark</span>
                </button>
                <button className={`theme-option ${theme === "light" ? "active" : ""}`} onClick={() => setTheme("light")}>
                  <div className="theme-preview light-preview"><div className="theme-preview-bar"/><div className="theme-preview-card"/></div>
                  <span>Light</span>
                </button>
              </div>
            </div>

            {/* Data stats */}
            <div className="settings-section">
              <div className="settings-section-title">About</div>
              <div className="settings-info">
                <div className="settings-info-row"><span>Subjects</span><span>{subjects.length}</span></div>
                <div className="settings-info-row"><span>Tasks</span><span>{tasks.length}</span></div>
                <div className="settings-info-row"><span>Deadlines</span><span>{deadlines.length}</span></div>
                <div className="settings-info-row"><span>Exams</span><span>{exams.length}</span></div>
                <div className="settings-info-row"><span>Past Papers</span><span>{papers.length}</span></div>
              </div>
            </div>

            {/* Reset */}
            <div className="settings-section">
              <div className="settings-section-title">Danger Zone</div>
              {resetStep === 0 && (
                <button className="reset-btn" onClick={() => setResetStep(1)}>Reset All Data</button>
              )}
              {resetStep === 1 && (
                <div className="reset-confirm-box">
                  <div className="reset-confirm-text">This will delete all your subjects, tasks, deadlines, exams, papers, goals, portfolio, and activities, and restore the demo data. Are you sure?</div>
                  <div className="confirm-actions" style={{marginTop:10}}>
                    <button className="confirm-cancel" onClick={() => setResetStep(0)}>Cancel</button>
                    <button className="confirm-delete" onClick={() => setResetStep(2)}>Yes, continue</button>
                  </div>
                </div>
              )}
              {resetStep === 2 && (
                <div className="reset-confirm-box">
                  <div className="reset-confirm-text" style={{color:"var(--danger)"}}>Last chance — this cannot be undone. Reset everything?</div>
                  <div className="confirm-actions" style={{marginTop:10}}>
                    <button className="confirm-cancel" onClick={() => setResetStep(0)}>Cancel</button>
                    <button className="confirm-delete" onClick={resetAllData}>Reset Now</button>
                  </div>
                </div>
              )}
            </div>
          </>) : (
            /* Recently Deleted tab */
            <div>
              {recentlyDeleted.length === 0 ? (
                <div className="empty-state" style={{paddingTop:40}}>Nothing recently deleted.</div>
              ) : (
                <>
                  <div style={{fontSize:11,color:"var(--muted)",marginBottom:12}}>Last {recentlyDeleted.length} deleted item{recentlyDeleted.length !== 1 ? "s" : ""}. Tap restore to bring them back.</div>
                  {recentlyDeleted.map(entry => (
                    <div key={entry.id} className="deleted-item">
                      <div style={{flex:1}}>
                        <div className="deleted-item-type">{TYPE_LABELS[entry.type] || entry.type}</div>
                        <div className="deleted-item-label">{entry.label}</div>
                        <div className="deleted-item-time">{entry.deletedAt}</div>
                      </div>
                      <button className="restore-btn" onClick={() => restoreDeleted(entry)}>
                        <Icon d={icons.undo} size={14} color="var(--accent)"/>
                        <span>Restore</span>
                      </button>
                    </div>
                  ))}
                  <button className="reset-btn" style={{marginTop:16}} onClick={() => setRecentlyDeleted([])}>Clear All</button>
                </>
              )}
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
    const SubjectSelect = () => (
      <select className="modal-input" value={form.subjectId||""} onChange={e=>updateForm("subjectId",e.target.value)}>
        <option value="">Select subject</option>
        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
    );
    let title = "", content = null, onSave = null, saveLabel = "Save";

    if (modal === "addSubject") {
      title = "Add Subjects";
      const curr = CURRICULA[browseCurriculum];
      const existingNames = new Set(subjects.map(s => s.name.toLowerCase()));
      const searchLower = browseSearch.toLowerCase();
      if (subjectTab === "browse") {
        const filtered = curr.subjects.filter(s => s.name.toLowerCase().includes(searchLower) && !existingNames.has(s.name.toLowerCase()));
        const grouped = {};
        filtered.forEach(s => { const g = s.group || "Subjects"; if (!grouped[g]) grouped[g] = []; grouped[g].push(s); });
        onSave = addBrowsedSubjects;
        saveLabel = browseSelected.size > 0 ? `Add ${browseSelected.size} Subject${browseSelected.size > 1 ? "s" : ""}` : "Select subjects";
        content = (<>
          <div className="curriculum-tabs">{Object.keys(CURRICULA).map(k => (<button key={k} className={`curriculum-tab ${browseCurriculum===k?"active":""}`} onClick={()=>{setBrowseCurriculum(k);setBrowseSelected(new Set());setBrowseSearch("");}}>{CURRICULA[k].label}</button>))}</div>
          <input className="modal-input" placeholder={`Search ${curr.label} subjects...`} value={browseSearch} onChange={e=>setBrowseSearch(e.target.value)}/>
          <div className="browse-list">
            {Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                {Object.keys(grouped).length > 1 && <div className="browse-group-label">{group}</div>}
                {items.map(s => { const checked = browseSelected.has(s.name); return (<div key={s.name} className={`browse-item ${checked?"selected":""}`} onClick={()=>toggleBrowseSubject(s.name)}><div className={`browse-check ${checked?"checked":""}`}>{checked && "✓"}</div><div className="browse-item-info"><div className="browse-item-name">{s.name}</div><div className="browse-item-board">{s.board}</div></div></div>); })}
              </div>
            ))}
            {filtered.length === 0 && <div className="empty-state">{browseSearch ? "No matching subjects" : "All subjects already added"}</div>}
          </div>
          <button className="browse-switch" onClick={()=>setSubjectTab("custom")}>Or add a custom subject</button>
        </>);
      } else {
        onSave = addSubject; saveLabel = "Save";
        content = (<>
          <input className="modal-input" placeholder="Subject name" value={form.name||""} onChange={e=>updateForm("name",e.target.value)}/>
          <select className="modal-input" value={form.board||"AQA"} onChange={e=>updateForm("board",e.target.value)}>{EXAM_BOARDS.map(b => <option key={b} value={b}>{b}</option>)}</select>
          <select className="modal-input" value={form.target||"5"} onChange={e=>updateForm("target",e.target.value)}>{GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}</select>
          <div className="colour-swatches">{PALETTE.map(c => (<button key={c} className={`swatch ${(form.colour||PALETTE[0])===c?"active":""}`} style={{background:c}} onClick={()=>updateForm("colour",c)}/>))}</div>
          <button className="browse-switch" onClick={()=>setSubjectTab("browse")}>Or browse GCSE / IGCSE / IB subjects</button>
        </>);
      }
    } else if (modal === "addTask") {
      title = "Add Task"; onSave = addTask;
      content = (<><input className="modal-input" placeholder="Task description" value={form.text||""} onChange={e=>updateForm("text",e.target.value)}/><SubjectSelect/></>);
    } else if (modal === "addDeadline") {
      title = "Add Deadline"; onSave = addDeadline;
      content = (<><input className="modal-input" placeholder="Deadline title" value={form.title||""} onChange={e=>updateForm("title",e.target.value)}/><SubjectSelect/><input className="modal-input" type="date" value={form.date||""} onChange={e=>updateForm("date",e.target.value)}/></>);
    } else if (modal === "addExam") {
      title = "Add Exam"; onSave = addExam;
      content = (<><input className="modal-input" placeholder="Exam name" value={form.name||""} onChange={e=>updateForm("name",e.target.value)}/><SubjectSelect/><select className="modal-input" value={form.board||""} onChange={e=>updateForm("board",e.target.value)}><option value="">Exam board</option>{EXAM_BOARDS.map(b => <option key={b} value={b}>{b}</option>)}</select><input className="modal-input" type="date" value={form.date||""} onChange={e=>updateForm("date",e.target.value)}/></>);
    } else if (modal === "addPaper") {
      title = "Add Past Paper"; onSave = addPaper;
      content = (<><SubjectSelect/><input className="modal-input" placeholder="Paper title" value={form.title||""} onChange={e=>updateForm("title",e.target.value)}/><input className="modal-input" placeholder="Year (e.g. 2024)" value={form.year||""} onChange={e=>updateForm("year",e.target.value)}/><input className="modal-input" placeholder="Paper number" value={form.paper||""} onChange={e=>updateForm("paper",e.target.value)}/><div style={{display:"flex",gap:8}}><input className="modal-input" placeholder="Marks scored" type="number" value={form.scored||""} onChange={e=>updateForm("scored",e.target.value)} style={{flex:1}}/><input className="modal-input" placeholder="Total marks" type="number" value={form.total||""} onChange={e=>updateForm("total",e.target.value)} style={{flex:1}}/></div></>);
    } else if (modal === "addGoal") {
      title = "Add Goal"; onSave = addGoal;
      content = (<><input className="modal-input" placeholder="Goal description" value={form.text||""} onChange={e=>updateForm("text",e.target.value)}/><select className="modal-input" value={form.horizon||"3 months"} onChange={e=>updateForm("horizon",e.target.value)}>{HORIZONS.map(h => <option key={h} value={h}>{h}</option>)}</select><select className="modal-input" value={form.subjectId||""} onChange={e=>updateForm("subjectId",e.target.value)}><option value="">No subject (optional)</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></>);
    } else if (modal === "addPortfolio") {
      title = "Add Portfolio Entry"; onSave = addPortfolio;
      content = (<><input className="modal-input" placeholder="Title" value={form.title||""} onChange={e=>updateForm("title",e.target.value)}/><textarea className="modal-input modal-textarea" placeholder="Description" value={form.desc||""} onChange={e=>updateForm("desc",e.target.value)}/><select className="modal-input" value={form.type||"Project"} onChange={e=>updateForm("type",e.target.value)}>{PORTFOLIO_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select><SubjectSelect/><input className="modal-input" placeholder="Tags (comma-separated)" value={form.tags||""} onChange={e=>updateForm("tags",e.target.value)}/></>);
    } else if (modal === "addActivity") {
      title = "Add Activity"; onSave = addActivity;
      content = (<><input className="modal-input" placeholder="Activity name (e.g. Debate Club)" value={form.name||""} onChange={e=>updateForm("name",e.target.value)}/><input className="modal-input" placeholder="Organisation / Team name" value={form.organisation||""} onChange={e=>updateForm("organisation",e.target.value)}/><input className="modal-input" placeholder="Your role" value={form.role||""} onChange={e=>updateForm("role",e.target.value)}/><textarea className="modal-input modal-textarea" placeholder="Description" value={form.desc||""} onChange={e=>updateForm("desc",e.target.value)}/><input className="modal-input" type="number" placeholder="Hours per week" value={form.hoursPerWeek||""} onChange={e=>updateForm("hoursPerWeek",e.target.value)}/><textarea className="modal-input modal-textarea" placeholder="Achievements (one per line)" value={form.achievements||""} onChange={e=>updateForm("achievements",e.target.value)}/><input className="modal-input" placeholder="Tags (comma-separated)" value={form.tags||""} onChange={e=>updateForm("tags",e.target.value)}/><div className="colour-swatches">{PALETTE.map(c => (<button key={c} className={`swatch ${(form.colour||PALETTE[0])===c?"active":""}`} style={{background:c}} onClick={()=>updateForm("colour",c)}/>))}</div></>);
    }

    return (
      <div className="modal-overlay" onClick={()=>setModal(null)}>
        <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
          <div className="modal-handle"/>
          <div className="modal-title">{title}</div>
          <div className="modal-body">{content}</div>
          <button className="modal-save" onClick={onSave}>{saveLabel}</button>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════
  const pages = { home:renderHome, subjects:renderSubjects, tasks:renderTasks, deadlines:renderDeadlines, exams:renderExams, papers:renderPapers, goals:renderGoals, activities:renderActivities, portfolio:renderPortfolio };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        :root {
          --bg: #0a0a0f; --surface: #111118; --surface2: #1a1a24; --border: #2a2a38;
          --accent: #7c6af7; --accent2: #f7a26a; --accent3: #6af7c4; --danger: #f76a6a;
          --text: #e8e8f0; --muted: #6b6b80;
        }
        .markd-app.light-theme {
          --bg: #fafafe; --surface: #ffffff; --surface2: #f3f3fa; --border: #e2e2ec;
          --accent: #6b54f5; --accent2: #e8801f; --accent3: #2bbd8a; --danger: #e53e3e;
          --text: #1a1a24; --muted: #6b6b80;
        }
        .markd-app.light-theme { background: var(--bg); color: var(--text); }
        .markd-app.light-theme .top-bar { background: var(--bg); }
        .markd-app.light-theme .logo { color: var(--text); }
        .markd-app.light-theme .next-exam-card { background: linear-gradient(135deg,#ffffff 0%,#f3f3fa 100%); }
        .markd-app.light-theme .modal-overlay { background: rgba(0,0,0,0.4); }
        .markd-app.light-theme .ai-bubble.assistant { background: var(--surface2); color: var(--text); }
        .markd-app.light-theme .task-check { color: white; }
        .markd-app.light-theme .ai-trigger { background: rgba(107,84,245,0.1); border-color: rgba(107,84,245,0.3); }
        .markd-app.light-theme .fab { box-shadow: 0 4px 20px rgba(107,84,245,0.35); }
        * { margin:0; padding:0; box-sizing:border-box; }
        html, body { height: 100%; background: var(--bg); }
        .markd-app { width:100%; min-height:100vh; min-height:100dvh; background:var(--bg); color:var(--text); font-family:'DM Mono',monospace; font-size:13px; position:relative; display:flex; flex-direction:column; }
        .top-bar { position:sticky; top:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:14px 24px; padding-top:calc(env(safe-area-inset-top,0px) + 14px); background:var(--bg); border-bottom:1px solid var(--border); }
        .logo { font-family:'Syne',sans-serif; font-weight:800; font-size:22px; color:var(--text); letter-spacing:-0.5px; }
        .logo-dot { display:inline-block; width:8px; height:8px; background:var(--accent); border-radius:50%; margin-left:2px; box-shadow:0 0 10px var(--accent),0 0 20px var(--accent); vertical-align:middle; position:relative; top:-1px; }
        .avatar { width:32px; height:32px; border-radius:50%; background:var(--surface2); border:2px solid var(--accent); display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-weight:700; font-size:13px; color:var(--accent); position:relative; }
        .app-body { display:flex; flex:1; overflow:hidden; }
        .sidebar { display:none; }
        @media (min-width:768px) {
          .sidebar { display:flex; flex-direction:column; width:200px; flex-shrink:0; background:var(--surface); border-right:1px solid var(--border); padding:16px 0; gap:2px; overflow-y:auto; }
          .sidebar-item { display:flex; align-items:center; gap:10px; padding:10px 20px; background:none; border:none; color:var(--muted); font-family:'DM Mono',monospace; font-size:12px; cursor:pointer; transition:color 0.15s,background 0.15s; text-align:left; }
          .sidebar-item:hover { color:var(--text); background:var(--surface2); }
          .sidebar-item.active { color:var(--accent); background:rgba(124,106,247,0.08); }
        }
        .page-scroll { flex:1; overflow-y:auto; overflow-x:hidden; -webkit-overflow-scrolling:touch; }
        .bottom-nav { position:fixed; bottom:0; left:0; right:0; z-index:100; background:var(--surface); border-top:1px solid var(--border); display:flex; overflow-x:auto; scrollbar-width:none; -ms-overflow-style:none; padding:6px 4px calc(env(safe-area-inset-bottom,0px) + 10px); }
        .bottom-nav::-webkit-scrollbar { display:none; }
        @media (min-width:768px) { .bottom-nav { display:none; } }
        .nav-item { flex:1 0 auto; display:flex; flex-direction:column; align-items:center; gap:3px; padding:6px 8px; background:none; border:none; color:var(--muted); font-family:'DM Mono',monospace; font-size:10px; cursor:pointer; border-radius:8px; transition:color 0.2s; }
        .nav-item.active { color:var(--accent); }
        .fab { position:fixed; bottom:calc(env(safe-area-inset-bottom,0px) + 72px); right:24px; width:50px; height:50px; border-radius:50%; background:var(--accent); border:none; color:white; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:99; box-shadow:0 4px 20px rgba(124,106,247,0.4); transition:transform 0.2s,box-shadow 0.2s; }
        .fab:hover { transform:scale(1.08); box-shadow:0 6px 28px rgba(124,106,247,0.6); }
        @media (min-width:768px) { .fab { bottom:32px; right:32px; } }
        .page { padding:16px 18px calc(env(safe-area-inset-bottom,0px) + 100px); max-width:960px; margin:0 auto; width:100%; }
        @media (min-width:768px) { .page { padding:28px 36px 60px; } }
        .page-title { font-family:'Syne',sans-serif; font-weight:700; font-size:24px; margin-bottom:18px; color:var(--text); }
        @media (min-width:768px) { .page-title { font-size:28px; margin-bottom:24px; } }
        .stat-row { display:flex; gap:10px; margin-bottom:16px; }
        .stat-card { flex:1; background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:16px; text-align:center; }
        .stat-num { font-family:'Syne',sans-serif; font-weight:700; font-size:26px; color:var(--accent); }
        .stat-label { color:var(--muted); font-size:11px; margin-top:4px; }
        .next-exam-card { background:linear-gradient(135deg,var(--surface) 0%,var(--surface2) 100%); border:1px solid var(--border); border-radius:14px; padding:20px; margin-bottom:20px; cursor:pointer; transition:border-color 0.2s; }
        .next-exam-card:hover { border-color:var(--accent); }
        .next-exam-label { font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:1.5px; margin-bottom:6px; }
        .next-exam-name { font-family:'Syne',sans-serif; font-weight:700; font-size:20px; }
        .next-exam-date { color:var(--muted); margin-top:4px; font-size:12px; }
        .next-exam-days { font-family:'Syne',sans-serif; font-weight:800; font-size:32px; margin-top:8px; }
        .section-header { display:flex; justify-content:space-between; align-items:center; margin:20px 0 10px; font-family:'Syne',sans-serif; font-weight:600; font-size:15px; }
        .link-btn { background:none; border:none; color:var(--accent); font-family:'DM Mono',monospace; font-size:11px; cursor:pointer; display:flex; align-items:center; gap:4px; }
        .list-item { background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:12px 14px; margin-bottom:8px; display:flex; align-items:center; justify-content:space-between; gap:10px; }
        .list-item-title { font-size:13px; color:var(--text); }
        .list-item-sub { font-size:11px; color:var(--muted); margin-top:2px; }
        .badge { font-size:10px; padding:3px 8px; border-radius:6px; font-weight:500; white-space:nowrap; }
        .task-check { width:20px; height:20px; border-radius:5px; border:2px solid var(--muted); display:flex; align-items:center; justify-content:center; font-size:12px; cursor:pointer; flex-shrink:0; color:var(--bg); font-weight:700; transition:background 0.15s,border-color 0.15s; }
        .goal-check { width:20px; height:20px; border-radius:50%; border:2px solid var(--accent); display:inline-block; cursor:pointer; flex-shrink:0; transition:background 0.15s; margin-top:2px; }
        .goal-check.checked { background:var(--accent); }
        .goal-subject-tag { font-size:10px; padding:2px 6px; border-radius:4px; margin-top:4px; display:inline-block; }
        .subjects-mini-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px; }
        @media (min-width:768px) { .subjects-mini-grid { grid-template-columns:repeat(3,1fr); gap:12px; } }
        @media (min-width:1024px) { .subjects-mini-grid { grid-template-columns:repeat(4,1fr); } }
        .subject-mini { background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:12px; }
        .subject-mini-name { font-family:'Syne',sans-serif; font-weight:600; font-size:13px; margin-bottom:6px; }
        .subject-mini-stats { display:flex; gap:10px; font-size:10px; color:var(--muted); }
        .subject-card { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:16px; margin-bottom:10px; }
        .subject-card-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; }
        .subject-card-name { font-family:'Syne',sans-serif; font-weight:700; font-size:16px; }
        .subject-card-board { font-size:11px; color:var(--muted); margin-top:2px; }
        .subject-card-stats { display:flex; gap:16px; margin-bottom:10px; }
        .subject-stat { display:flex; flex-direction:column; gap:2px; }
        .subject-stat-label { font-size:10px; color:var(--muted); }
        .subject-stat-val { font-family:'Syne',sans-serif; font-weight:700; font-size:18px; }
        .progress-wrap { display:flex; align-items:center; gap:8px; }
        .progress-bar { height:6px; background:var(--surface2); border-radius:3px; overflow:hidden; flex:1; }
        .progress-fill { height:100%; border-radius:3px; transition:width 0.4s ease; }
        .progress-label { font-size:10px; color:var(--muted); white-space:nowrap; }
        .group-section { margin-bottom:18px; }
        .group-label { font-family:'Syne',sans-serif; font-weight:600; font-size:14px; margin-bottom:8px; padding-left:2px; }
        .exam-card { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:16px; margin-bottom:10px; display:flex; align-items:center; gap:12px; }
        .exam-name { font-family:'Syne',sans-serif; font-weight:700; font-size:15px; }
        .exam-board { font-size:11px; color:var(--muted); margin-top:2px; }
        .exam-date { font-size:11px; color:var(--muted); margin-top:4px; }
        .exam-days { font-family:'Syne',sans-serif; font-weight:800; font-size:34px; text-align:center; line-height:1; }
        .exam-days-label { display:block; font-size:10px; font-weight:400; color:var(--muted); margin-top:2px; }
        .paper-card { background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:14px; margin-bottom:8px; }
        .paper-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; }
        .paper-score { font-family:'Syne',sans-serif; font-weight:700; font-size:15px; white-space:nowrap; }
        .paper-pct { font-size:12px; color:var(--muted); font-weight:400; }
        .paper-file { font-size:11px; color:var(--muted); margin-top:6px; }
        .tab-row { display:flex; gap:6px; margin-bottom:14px; }
        .tab-btn { flex:1; padding:8px; border-radius:8px; border:1px solid var(--border); background:var(--surface); color:var(--muted); font-family:'DM Mono',monospace; font-size:12px; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:6px; }
        .tab-btn.active { background:var(--accent); color:white; border-color:var(--accent); }
        .horizon-row { display:flex; gap:6px; margin-bottom:14px; overflow-x:auto; scrollbar-width:none; }
        .horizon-row::-webkit-scrollbar { display:none; }
        .horizon-btn { flex:0 0 auto; padding:6px 12px; border-radius:20px; border:1px solid var(--border); background:var(--surface); color:var(--muted); font-family:'DM Mono',monospace; font-size:11px; cursor:pointer; transition:all 0.2s; }
        .horizon-btn.active { background:var(--accent); color:white; border-color:var(--accent); }
        .goals-overview { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:16px; margin-top:16px; }
        .goals-overview-title { font-family:'Syne',sans-serif; font-weight:600; font-size:14px; margin-bottom:12px; }
        .goals-overview-row { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
        .goals-overview-label { font-size:11px; color:var(--muted); width:72px; flex-shrink:0; }
        .goals-overview-pct { font-size:11px; color:var(--text); width:32px; text-align:right; }
        .mvt-card { background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:14px; margin-bottom:10px; }
        .mvt-name { font-family:'Syne',sans-serif; font-weight:600; font-size:14px; margin-bottom:10px; }
        .mvt-bars { display:flex; flex-direction:column; gap:6px; }
        .mvt-bar-row { display:flex; align-items:center; gap:8px; }
        .mvt-bar-label { font-size:10px; color:var(--muted); width:42px; }
        .mvt-bar-val { font-size:11px; width:36px; text-align:right; }
        .mvt-gap { font-family:'Syne',sans-serif; font-weight:700; font-size:16px; margin-top:8px; text-align:right; }
        .link-list { display:flex; flex-direction:column; gap:8px; }
        .link-card { display:flex; align-items:center; justify-content:space-between; gap:12px; background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:14px; text-decoration:none; color:var(--text); transition:border-color 0.2s; }
        .link-card:hover { border-color:var(--accent); }
        .link-card-name { font-family:'Syne',sans-serif; font-weight:600; font-size:14px; }
        .link-card-desc { font-size:11px; color:var(--muted); margin-top:3px; }
        .portfolio-card { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:16px; margin-bottom:10px; }
        .portfolio-header { display:flex; justify-content:space-between; align-items:flex-start; }
        .portfolio-title { font-family:'Syne',sans-serif; font-weight:700; font-size:15px; }
        .portfolio-meta { display:flex; align-items:center; gap:10px; margin-top:8px; }
        .portfolio-type { font-size:10px; padding:3px 8px; border-radius:5px; }
        .portfolio-subject { font-size:11px; }
        .portfolio-desc { font-size:12px; color:var(--muted); margin-top:8px; line-height:1.5; }
        .portfolio-tags { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
        .tag-chip { font-size:10px; padding:3px 8px; border-radius:4px; background:var(--surface2); color:var(--muted); border:1px solid var(--border); }
        .portfolio-page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; }
        .export-btn { display:flex; align-items:center; gap:6px; padding:8px 14px; border-radius:8px; border:1px solid rgba(124,106,247,0.3); background:rgba(124,106,247,0.08); color:var(--accent); font-family:'DM Mono',monospace; font-size:11px; cursor:pointer; transition:background 0.2s,border-color 0.2s; }
        .export-btn:hover { background:rgba(124,106,247,0.16); border-color:var(--accent); }
        .curriculum-tabs { display:flex; gap:4px; }
        .curriculum-tab { flex:1; padding:8px 4px; border-radius:8px; border:1px solid var(--border); background:var(--surface); color:var(--muted); font-family:'DM Mono',monospace; font-size:11px; cursor:pointer; text-align:center; transition:all 0.15s; }
        .curriculum-tab.active { background:var(--accent); color:white; border-color:var(--accent); }
        .browse-list { max-height:280px; overflow-y:auto; display:flex; flex-direction:column; gap:4px; scrollbar-width:thin; scrollbar-color:var(--border) transparent; }
        .browse-list::-webkit-scrollbar { width:4px; }
        .browse-list::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }
        .browse-group-label { font-family:'Syne',sans-serif; font-weight:600; font-size:11px; color:var(--accent); text-transform:uppercase; letter-spacing:1px; padding:10px 0 4px; position:sticky; top:0; background:var(--surface); z-index:1; }
        .browse-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:8px; border:1px solid var(--border); background:var(--surface2); cursor:pointer; transition:border-color 0.15s,background 0.15s; }
        .browse-item:hover { border-color:var(--muted); }
        .browse-item.selected { border-color:var(--accent); background:rgba(124,106,247,0.08); }
        .browse-check { width:20px; height:20px; border-radius:5px; border:2px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:12px; color:white; font-weight:700; flex-shrink:0; transition:all 0.15s; }
        .browse-check.checked { background:var(--accent); border-color:var(--accent); }
        .browse-item-info { flex:1; min-width:0; }
        .browse-item-name { font-size:13px; color:var(--text); }
        .browse-item-board { font-size:10px; color:var(--muted); margin-top:1px; }
        .browse-switch { background:none; border:none; color:var(--accent); font-family:'DM Mono',monospace; font-size:11px; cursor:pointer; text-align:center; padding:8px 0; width:100%; opacity:0.8; transition:opacity 0.2s; }
        .browse-switch:hover { opacity:1; }
        .activity-card { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:18px; margin-bottom:12px; }
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
        .delete-btn { background:none; border:none; cursor:pointer; padding:4px; opacity:0.5; transition:opacity 0.2s; flex-shrink:0; }
        .delete-btn:hover { opacity:1; }
        .empty-state { text-align:center; color:var(--muted); padding:32px 0; font-size:13px; }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:200; display:flex; align-items:flex-end; justify-content:center; animation:fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        .modal-sheet { width:100%; max-width:600px; background:var(--surface); border-radius:20px 20px 0 0; padding:12px 20px 28px; animation:slideUp 0.25s ease; }
        @keyframes slideUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
        .modal-handle { width:36px; height:4px; background:var(--border); border-radius:2px; margin:0 auto 16px; }
        .modal-title { font-family:'Syne',sans-serif; font-weight:700; font-size:18px; margin-bottom:16px; }
        .modal-body { display:flex; flex-direction:column; gap:10px; }
        .modal-input { width:100%; padding:10px 12px; border-radius:8px; border:1px solid var(--border); background:var(--surface2); color:var(--text); font-family:'DM Mono',monospace; font-size:13px; outline:none; transition:border-color 0.2s; }
        .modal-input:focus { border-color:var(--accent); }
        .modal-textarea { min-height:72px; resize:vertical; }
        .modal-save { margin-top:14px; width:100%; padding:12px; border-radius:10px; border:none; background:var(--accent); color:white; font-family:'Syne',sans-serif; font-weight:700; font-size:15px; cursor:pointer; transition:opacity 0.2s; }
        .modal-save:hover { opacity:0.9; }
        .colour-swatches { display:flex; gap:8px; flex-wrap:wrap; padding:4px 0; }
        .swatch { width:30px; height:30px; border-radius:50%; border:3px solid transparent; cursor:pointer; transition:border-color 0.15s,transform 0.15s; }
        .swatch.active { border-color:var(--text); transform:scale(1.15); }
        .swatch:hover { transform:scale(1.1); }
        .top-bar-right { display:flex; align-items:center; gap:10px; }
        .ai-trigger { width:34px; height:34px; border-radius:50%; background:rgba(124,106,247,0.07); border:1px solid rgba(124,106,247,0.27); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background 0.2s,border-color 0.2s; }
        .ai-trigger:hover { background:rgba(124,106,247,0.14); border-color:var(--accent); }
        .ai-sheet { width:100%; max-width:600px; height:85vh; background:var(--surface); border-radius:20px 20px 0 0; display:flex; flex-direction:column; animation:slideUp 0.25s ease; overflow:hidden; }
        .ai-header { display:flex; align-items:center; justify-content:space-between; padding:0 18px 14px; border-bottom:1px solid var(--border); }
        .ai-header-left { display:flex; align-items:center; gap:8px; }
        .ai-title { font-family:'Syne',sans-serif; font-weight:700; font-size:16px; }
        .ai-close { background:none; border:none; cursor:pointer; padding:4px; opacity:0.6; transition:opacity 0.2s; }
        .ai-close:hover { opacity:1; }
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
        .ai-input { flex:1; padding:10px 14px; border-radius:20px; border:1px solid var(--border); background:var(--surface2); color:var(--text); font-family:'DM Mono',monospace; font-size:13px; outline:none; transition:border-color 0.2s; }
        .ai-input:focus { border-color:var(--accent); }
        .ai-input::placeholder { color:var(--muted); }
        .ai-send { width:38px; height:38px; border-radius:50%; background:var(--accent); border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:opacity 0.2s; flex-shrink:0; }
        .ai-send:disabled { opacity:0.4; cursor:default; }
        .ai-send:not(:disabled):hover { opacity:0.85; }
        .avatar-btn { background:none; border:none; cursor:pointer; padding:0; position:relative; }
        .teams-badge { position:absolute; top:-2px; right:-2px; width:10px; height:10px; border-radius:50%; background:#7fba00; border:2px solid var(--bg); z-index:1; }
        .sync-spinner { width:18px; height:18px; border-radius:50%; border:2px solid var(--border); border-top-color:var(--accent); animation:spin 0.8s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .settings-sheet { width:100%; max-width:600px; max-height:85vh; overflow-y:auto; background:var(--surface); border-radius:20px 20px 0 0; padding:12px 20px 28px; animation:slideUp 0.25s ease; }
        .settings-header { display:flex; align-items:center; gap:8px; margin-bottom:16px; }
        .settings-title { font-family:'Syne',sans-serif; font-weight:700; font-size:18px; }
        .settings-section { margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid var(--border); }
        .settings-section:last-child { border-bottom:none; margin-bottom:0; }
        .settings-section-title { font-family:'Syne',sans-serif; font-weight:600; font-size:12px; color:var(--muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:12px; }
        .settings-profile { display:flex; align-items:center; gap:12px; }
        .settings-avatar { width:44px; height:44px; border-radius:50%; background:var(--surface2); border:2px solid var(--accent); display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-weight:700; font-size:17px; color:var(--accent); flex-shrink:0; }
        .settings-name { font-family:'Syne',sans-serif; font-weight:700; font-size:15px; }
        .settings-email { font-size:11px; color:var(--muted); margin-top:2px; }
        .teams-connect-btn { width:100%; display:flex; align-items:center; justify-content:center; gap:10px; padding:14px; border-radius:10px; background:linear-gradient(135deg,rgba(127,186,0,0.08) 0%,rgba(0,164,239,0.08) 100%); border:1px solid rgba(127,186,0,0.25); color:var(--text); font-family:'DM Mono',monospace; font-size:13px; cursor:pointer; transition:border-color 0.2s,background 0.2s; }
        .teams-connect-btn:hover { border-color:rgba(127,186,0,0.5); }
        .teams-connected { display:flex; flex-direction:column; gap:12px; }
        .teams-status-row { display:flex; align-items:center; gap:8px; }
        .teams-status-dot { width:8px; height:8px; border-radius:50%; background:#7fba00; }
        .teams-status-text { font-size:13px; color:var(--text); font-weight:500; }
        .teams-sync-time { font-size:11px; color:var(--muted); margin-left:auto; }
        .teams-actions { display:flex; gap:8px; }
        .teams-sync-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:10px; border-radius:8px; background:rgba(124,106,247,0.08); border:1px solid rgba(124,106,247,0.25); color:var(--accent); font-family:'DM Mono',monospace; font-size:12px; cursor:pointer; transition:background 0.2s; }
        .teams-sync-btn:hover { background:rgba(124,106,247,0.16); }
        .teams-sync-btn:disabled { opacity:0.5; cursor:default; }
        .teams-disconnect-btn { padding:10px 14px; border-radius:8px; background:rgba(247,106,106,0.08); border:1px solid rgba(247,106,106,0.2); color:var(--danger); font-family:'DM Mono',monospace; font-size:12px; cursor:pointer; transition:background 0.2s; }
        .teams-disconnect-btn:hover { background:rgba(247,106,106,0.16); }
        .teams-autosync-row { display:flex; align-items:center; justify-content:space-between; padding:8px 0; font-size:12px; color:var(--muted); }
        .toggle { width:40px; height:22px; border-radius:11px; background:var(--surface2); border:1px solid var(--border); cursor:pointer; position:relative; transition:background 0.2s,border-color 0.2s; padding:0; }
        .toggle.on { background:var(--accent); border-color:var(--accent); }
        .toggle-knob { width:16px; height:16px; border-radius:50%; background:white; position:absolute; top:2px; left:2px; transition:transform 0.2s; }
        .toggle.on .toggle-knob { transform:translateX(18px); }
        .sync-log { max-height:140px; overflow-y:auto; display:flex; flex-direction:column; gap:4px; scrollbar-width:thin; scrollbar-color:var(--border) transparent; }
        .sync-log::-webkit-scrollbar { width:3px; }
        .sync-log::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }
        .sync-log-entry { display:flex; gap:8px; font-size:11px; padding:4px 0; }
        .sync-log-time { color:var(--muted); flex-shrink:0; width:40px; }
        .sync-log-msg { color:var(--text); }
        .settings-info { display:flex; flex-direction:column; gap:6px; }
        .settings-info-row { display:flex; justify-content:space-between; font-size:12px; color:var(--muted); padding:2px 0; }
        .settings-info-row span:last-child { color:var(--text); font-weight:500; }
        .theme-toggle-row { display:flex; gap:10px; }
        .theme-option { flex:1; display:flex; flex-direction:column; align-items:center; gap:8px; padding:12px; border-radius:10px; background:var(--surface2); border:2px solid var(--border); color:var(--muted); font-family:'DM Mono',monospace; font-size:12px; cursor:pointer; transition:border-color 0.2s,color 0.2s; }
        .theme-option:hover { border-color:var(--muted); }
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

        /* ── Confirm dialog ── */
        .confirm-dialog {
          width: calc(100% - 48px);
          max-width: 360px;
          background: var(--surface);
          border-radius: 18px;
          padding: 24px 20px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          animation: scaleIn 0.2s ease;
          margin-bottom: 30vh;
        }
        @keyframes scaleIn { from { transform:scale(0.92); opacity:0; } to { transform:scale(1); opacity:1; } }
        .confirm-icon { width:48px; height:48px; border-radius:50%; background:rgba(247,106,106,0.12); display:flex; align-items:center; justify-content:center; margin-bottom:4px; }
        .confirm-message { font-family:'Syne',sans-serif; font-weight:600; font-size:15px; text-align:center; color:var(--text); }
        .confirm-note { font-size:11px; color:var(--muted); text-align:center; line-height:1.4; }
        .confirm-actions { display:flex; gap:8px; width:100%; margin-top:6px; }
        .confirm-cancel { flex:1; padding:11px; border-radius:10px; border:1px solid var(--border); background:var(--surface2); color:var(--text); font-family:'DM Mono',monospace; font-size:13px; cursor:pointer; transition:background 0.2s; }
        .confirm-cancel:hover { background:var(--border); }
        .confirm-delete { flex:1; padding:11px; border-radius:10px; border:none; background:var(--danger); color:white; font-family:'Syne',sans-serif; font-weight:700; font-size:13px; cursor:pointer; transition:opacity 0.2s; }
        .confirm-delete:hover { opacity:0.85; }

        /* ── Recently deleted ── */
        .deleted-badge { background:var(--danger); color:white; font-size:10px; padding:1px 6px; border-radius:10px; font-weight:700; }
        .deleted-item { display:flex; align-items:center; gap:12px; background:var(--surface2); border:1px solid var(--border); border-radius:10px; padding:12px 14px; margin-bottom:8px; }
        .deleted-item-type { font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:0.8px; margin-bottom:2px; }
        .deleted-item-label { font-size:13px; color:var(--text); font-weight:500; }
        .deleted-item-time { font-size:10px; color:var(--muted); margin-top:2px; }
        .restore-btn { display:flex; align-items:center; gap:5px; padding:7px 12px; border-radius:8px; border:1px solid rgba(124,106,247,0.3); background:rgba(124,106,247,0.08); color:var(--accent); font-family:'DM Mono',monospace; font-size:11px; cursor:pointer; white-space:nowrap; transition:background 0.2s; flex-shrink:0; }
        .restore-btn:hover { background:rgba(124,106,247,0.16); }

        /* ── Reset button ── */
        .reset-btn { width:100%; padding:11px; border-radius:10px; border:1px solid rgba(247,106,106,0.3); background:rgba(247,106,106,0.07); color:var(--danger); font-family:'DM Mono',monospace; font-size:12px; cursor:pointer; transition:background 0.2s; }
        .reset-btn:hover { background:rgba(247,106,106,0.14); }
        .reset-confirm-box { background:var(--surface2); border:1px solid rgba(247,106,106,0.25); border-radius:12px; padding:14px; }
        .reset-confirm-text { font-size:12px; color:var(--text); line-height:1.5; }
      `}</style>

      <div className={`markd-app ${theme === "light" ? "light-theme" : ""}`}>
        <div className="top-bar">
          <div className="logo">Markd<span className="logo-dot"/></div>
          <div className="top-bar-right">
            <button className="ai-trigger" onClick={()=>setAiOpen(true)}><Icon d={icons.sparkle} size={18} color="var(--accent)"/></button>
            {teamsSyncing && <div className="sync-spinner"/>}
            <button className="avatar-btn" onClick={()=>{ setSettingsOpen(true); setSettingsTab("general"); }}>
              <div className="avatar">{teamsConnected && <div className="teams-badge"/>}R</div>
            </button>
          </div>
        </div>

        <div className="app-body">
          <nav className="sidebar">
            {NAV_ITEMS.map(n => (
              <button key={n.key} className={`sidebar-item ${page===n.key?"active":""}`} onClick={()=>setPage(n.key)}>
                <Icon d={n.icon} size={18}/><span>{n.label}</span>
              </button>
            ))}
          </nav>
          <div className="page-scroll">{pages[page]()}</div>
        </div>

        <button className="fab" onClick={fabAction}><Icon d={icons.plus} size={26} color="white"/></button>

        <nav className="bottom-nav">
          {NAV_ITEMS.map(n => (
            <button key={n.key} className={`nav-item ${page===n.key?"active":""}`} onClick={()=>setPage(n.key)}>
              <Icon d={n.icon} size={20}/><span>{n.label}</span>
            </button>
          ))}
        </nav>

        {renderModal()}
        {renderAiPanel()}
        {renderSettingsPanel()}
        {renderConfirmDialog()}
      </div>
    </>
  );
}