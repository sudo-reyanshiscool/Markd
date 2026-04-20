import { PALETTE } from "./constants";
import { buildExam, buildGoal, buildTask, uid } from "./helpers";

export const createDemoAppData = () => {
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
      buildExam({ subjectId: mathsId, name: "Maths Paper 1", board: "Edexcel", date: addDays(9), syllabus: "Number\n- Bounds and standard form\nAlgebra\n- Quadratics and algebraic fractions\nGeometry\n- Circle theorems and trigonometric graphs", syllabusSavedAt: new Date().toISOString() }),
      buildExam({ subjectId: bioId, name: "Biology Mock", board: "AQA", date: addDays(15), syllabus: "Cell biology\n- Microscopy and transport\nOrganisation\n- Enzymes, digestion, circulation\nInfection and response\n- Vaccination and plant disease", syllabusSavedAt: new Date().toISOString() }),
      buildExam({ subjectId: englishId, name: "Poetry Comparison Test", board: "AQA", date: addDays(20) }),
      buildExam({ subjectId: chemistryId, name: "Chemistry Paper 2", board: "AQA", date: addDays(22) }),
      buildExam({ subjectId: computerScienceId, name: "OCR Algorithms Assessment", board: "OCR", date: addDays(27) }),
      buildExam({ subjectId: historyId, name: "Elizabethan England Mock", board: "Edexcel", date: addDays(31) }),
      buildExam({ subjectId: spanishId, name: "Spanish Listening Test", board: "AQA", date: addDays(35) }),
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
    topicConfidence: [
      { id: uid(), subjectId: mathsId, topic: "Quadratics", confidence: "strong", updatedAt: new Date().toISOString() },
      { id: uid(), subjectId: bioId, topic: "Respiration", confidence: "okay", updatedAt: new Date().toISOString() },
      { id: uid(), subjectId: chemistryId, topic: "Organic chemistry", confidence: "weak", updatedAt: new Date().toISOString() },
      { id: uid(), subjectId: computerScienceId, topic: "Algorithms", confidence: "strong", updatedAt: new Date().toISOString() },
    ],
    studySessions: [
      { id: uid(), subjectId: mathsId, taskId: null, minutes: 45, completedAt: new Date(Date.now() - 86400000).toISOString() },
      { id: uid(), subjectId: chemistryId, taskId: null, minutes: 25, completedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
      { id: uid(), subjectId: bioId, taskId: null, minutes: 60, completedAt: new Date(Date.now() - 3 * 86400000).toISOString() },
    ],
    theme: "dark",
    revisionMode: false,
    mockMode: false,
    notificationsEnabled: false,
    healthIntroSeen: true,
    outlookCalendarUrl: "",
    calendarLastSync: null,
  };
};
