export const demoAccounts = [
  {
    id: "user-director",
    name: "Martha Bekele",
    email: "admin@school.com",
    password: "Admin123",
    role: "director",
    schoolId: "SCH-001",
    subtitle: "School Director",
  },
  {
    id: "user-super-admin",
    name: "Samira Hassan",
    email: "superadmin@sr-ems.com",
    password: "SuperAdmin123",
    role: "super-admin",
    subtitle: "Platform Super Administrator",
  },
  {
    id: "user-teacher",
    name: "Daniel Tadesse",
    email: "teacher@school.com",
    password: "Teacher123",
    role: "teacher",
    teacherId: "T-1001",
    schoolId: "SCH-001",
    subtitle: "Mathematics Teacher",
  },
  {
    id: "user-student-young",
    name: "Hana Bekele",
    email: "student@school.com",
    password: "Student123",
    role: "student",
    studentId: "S-1001",
    schoolId: "SCH-001",
    subtitle: "Grade 2 · Blue Class",
  },
  {
    id: "user-student-middle",
    name: "Mikael Alemu",
    email: "mikael@school.com",
    password: "Student123",
    role: "student",
    studentId: "S-1002",
    schoolId: "SCH-001",
    subtitle: "Grade 7 · Green Class",
  },
  {
    id: "user-student-senior",
    name: "Selam Tesfaye",
    email: "selam@school.com",
    password: "Student123",
    role: "student",
    studentId: "S-1003",
    schoolId: "SCH-001",
    subtitle: "Grade 11 · Science",
  },
  {
    id: "user-student-school-two",
    name: "Dawit Fikru",
    email: "student@greenvalley.edu",
    password: "Student123",
    role: "student",
    studentId: "S-2001",
    schoolId: "SCH-002",
    subtitle: "Grade 5 · Maple Class",
  },
  {
    id: "user-student-class-zero",
    name: "Mimi Dawit",
    email: "student0@school.com",
    password: "Student123",
    role: "student",
    studentId: "S-1006",
    schoolId: "SCH-001",
    subtitle: "Class 0 · Little Stars",
  },
  {
    id: "user-student-university",
    name: "Natnael Girma",
    email: "student@unity.edu",
    password: "Student123",
    role: "student",
    studentId: "S-3001",
    schoolId: "SCH-003",
    subtitle: "Undergraduate · Year 2",
  },
  {
    id: "user-student-postgraduate",
    name: "Rahel Abebe",
    email: "postgrad@unity.edu",
    password: "Student123",
    role: "student",
    studentId: "S-3002",
    schoolId: "SCH-003",
    subtitle: "Postgraduate · Master's Year 1",
  },
  {
    id: "user-teacher-university",
    name: "Fikru Solomon",
    email: "teacher@unity.edu",
    password: "Teacher123",
    role: "teacher",
    teacherId: "T-3001",
    schoolId: "SCH-003",
    subtitle: "Computer Science Lecturer",
  },
  {
    id: "user-student-tvet",
    name: "Kalkidan Mulu",
    email: "tvet@merit.edu",
    password: "Student123",
    role: "student",
    studentId: "S-4001",
    schoolId: "SCH-004",
    subtitle: "TVET Level II · Electrical Installation",
  },
];

export const seedData = {
  schemaVersion: 7,
  schools: [
    { id: "SCH-001", name: "Horizon International School", type: "K–12 School", academicYear: "2025 / 2026", term: "Term 2" },
    { id: "SCH-002", name: "Green Valley Academy", type: "K–12 School", academicYear: "2025 / 2026", term: "Term 2" },
    { id: "SCH-003", name: "Unity University", type: "University", academicYear: "2025 / 2026", term: "Semester 1" },
    { id: "SCH-004", name: "Merit TVET College", type: "TVET institution", academicYear: "2025 / 2026", term: "Training Block 2" },
  ],
  educationLevels: [
    { id: "early-years", name: "Early childhood education", levels: ["Nursery", "KG 0", "KG 1", "KG 2", "KG 3", "Pre-primary", "Class 0"], institutionTypes: "Early years center, K–12 school", active: true },
    { id: "primary", name: "Primary education", levels: Array.from({ length: 8 }, (_, index) => `Grade ${index + 1}`), institutionTypes: "K–12 school", active: true },
    { id: "secondary", name: "Secondary education", levels: [...Array.from({ length: 4 }, (_, index) => `Grade ${index + 9}`), "Natural Science", "Social Science", "Other stream"], institutionTypes: "K–12 school, Preparatory school", active: true },
    { id: "tvet", name: "TVET and vocational education", levels: ["TVET Level I", "TVET Level II", "TVET Level III", "TVET Level IV", "TVET Level V", "Certificate", "Diploma", "Professional training"], institutionTypes: "TVET institution, Training center", active: true },
    { id: "undergraduate", name: "Higher education", levels: ["Undergraduate", "Bachelor's degree", "College program", "University program", ...Array.from({ length: 6 }, (_, index) => `Year ${index + 1}`)], institutionTypes: "College, University", active: true },
    { id: "postgraduate", name: "Postgraduate education", levels: ["Postgraduate Diploma", "Master's degree", "Master's Year 1", "Master's Year 2", "PhD", "Doctoral Research", "Postdoctoral Research"], institutionTypes: "University, Research institution", active: true },
    { id: "continuing", name: "Continuing education", levels: ["Certificate", "Professional course", "Short course"], institutionTypes: "Training center, College, University", active: true },
  ],
  students: [
    { id: "S-1001", name: "Hana Bekele", email: "hana@school.com", gender: "Female", grade: "2", className: "2 Blue", classId: "C-2B", parentName: "Martha Bekele", parentPhone: "+251 911 000 101", enrollmentDate: "2025-09-01" },
    { id: "S-1002", name: "Mikael Alemu", email: "mikael.student@school.com", gender: "Male", grade: "7", className: "7 Green", classId: "C-7G", parentName: "Alemu Girma", parentPhone: "+251 911 000 102", enrollmentDate: "2025-09-01" },
    { id: "S-1003", name: "Selam Tesfaye", email: "selam.student@school.com", gender: "Female", grade: "11", className: "11 Science", classId: "C-11S", parentName: "Tesfaye Kebede", parentPhone: "+251 911 000 103", enrollmentDate: "2025-09-01" },
    { id: "S-1004", name: "Abel Worku", email: "abel@school.com", gender: "Male", grade: "10", className: "10 Blue", classId: "C-10B", parentName: "Worku Abebe", parentPhone: "+251 911 000 104", enrollmentDate: "2025-09-01" },
    { id: "S-1005", name: "Liya Samuel", email: "liya@school.com", gender: "Female", grade: "4", className: "4 Green", classId: "C-4G", parentName: "Samuel Yohannes", parentPhone: "+251 911 000 105", enrollmentDate: "2025-09-01" },
  ],
  teachers: [
    { id: "T-1001", name: "Daniel Tadesse", email: "daniel@school.com", subject: "Mathematics", classes: "7 Green, 10 Blue", phone: "+251 911 100 101" },
    { id: "T-1002", name: "Rahel Mekonnen", email: "rahel@school.com", subject: "English", classes: "2 Blue, 4 Green", phone: "+251 911 100 102" },
    { id: "T-1003", name: "Samuel Girma", email: "samuel@school.com", subject: "Biology", classes: "11 Science", phone: "+251 911 100 103" },
  ],
  classes: [
    { id: "C-2B", name: "2 Blue", grade: "2", teacher: "Rahel Mekonnen", students: 24 },
    { id: "C-4G", name: "4 Green", grade: "4", teacher: "Rahel Mekonnen", students: 26 },
    { id: "C-7G", name: "7 Green", grade: "7", teacher: "Daniel Tadesse", students: 28 },
    { id: "C-10B", name: "10 Blue", grade: "10", teacher: "Daniel Tadesse", students: 22 },
    { id: "C-11S", name: "11 Science", grade: "11", teacher: "Samuel Girma", students: 19 },
  ],
  subjects: [
    { id: "SUB-01", name: "Mathematics", grade: "7, 10, 11", teacher: "Daniel Tadesse" },
    { id: "SUB-02", name: "English", grade: "2, 4, 7, 10", teacher: "Rahel Mekonnen" },
    { id: "SUB-03", name: "Biology", grade: "11", teacher: "Samuel Girma" },
    { id: "SUB-04", name: "Amharic", grade: "1–12", teacher: "Rahel Mekonnen" },
  ],
  attendance: [
    { id: "A-01", studentId: "S-1001", student: "Hana Bekele", classId: "C-2B", className: "2 Blue", date: "2026-11-19", status: "Present" },
    { id: "A-02", studentId: "S-1002", student: "Mikael Alemu", classId: "C-7G", className: "7 Green", date: "2026-11-19", status: "Present" },
    { id: "A-03", studentId: "S-1003", student: "Selam Tesfaye", classId: "C-11S", className: "11 Science", date: "2026-11-19", status: "Late" },
    { id: "A-04", studentId: "S-1004", student: "Abel Worku", classId: "C-10B", className: "10 Blue", date: "2026-11-19", status: "Absent" },
    { id: "A-05", studentId: "S-1005", student: "Liya Samuel", classId: "C-4G", className: "4 Green", date: "2026-11-19", status: "Present" },
  ],
  assignments: [
    { id: "AS-01", title: "Fractions practice", subject: "Mathematics", classId: "C-2B", className: "2 Blue", teacherId: "T-1002", dueDate: "2026-11-22", description: "Complete the fractions practice worksheet and show how you worked out each answer.", furtherExplanation: "Use pictures or number lines to help explain your answers. Ask your teacher if you need help.", status: "In progress" },
    { id: "AS-02", title: "My reading journal", subject: "English", classId: "C-7G", className: "7 Green", teacherId: "T-1001", dueDate: "2026-11-24", description: "Write a short journal entry about a book you are reading. Include a summary and your favorite character.", furtherExplanation: "Write at least two paragraphs and check spelling before submitting.", status: "Not started" },
    { id: "AS-03", title: "Cell structure report", subject: "Biology", classId: "C-11S", className: "11 Science", teacherId: "T-1003", dueDate: "2026-11-26", description: "Prepare a report comparing the structure and function of plant and animal cells.", furtherExplanation: "Label a clear diagram and cite any sources you use.", status: "Submitted" },
    { id: "AS-04", title: "Algebra review", subject: "Mathematics", classId: "C-10B", className: "10 Blue", teacherId: "T-1001", dueDate: "2026-11-27", description: "Solve the algebra review problems and include the steps used to reach each answer.", furtherExplanation: "Show your working clearly. You may check your answers by substituting them back into the equations.", status: "Not started" },
  ],
  results: [
    { id: "R-01", studentId: "S-1001", student: "Hana Bekele", classId: "C-2B", subject: "English", assessment: "Reading check", score: 86, outOf: 100, term: "Term 2" },
    { id: "R-02", studentId: "S-1002", student: "Mikael Alemu", classId: "C-7G", subject: "Mathematics", assessment: "Unit 3 quiz", score: 78, outOf: 100, term: "Term 2" },
    { id: "R-03", studentId: "S-1003", student: "Selam Tesfaye", classId: "C-11S", subject: "Biology", assessment: "Cell biology", score: 91, outOf: 100, term: "Term 2" },
    { id: "R-04", studentId: "S-1004", student: "Abel Worku", classId: "C-10B", subject: "Mathematics", assessment: "Algebra test", score: 72, outOf: 100, term: "Term 2" },
  ],
  research: [],
  announcements: [
    { id: "N-01", title: "Welcome to Term 2", audience: "All students", date: "2026-11-17", body: "We are looking forward to a focused and positive term." },
    { id: "N-02", title: "Science club meeting", audience: "Grade 11", date: "2026-11-20", body: "Meet in the science laboratory after classes." },
    { id: "N-03", title: "Library reading week", audience: "Grades 1–8", date: "2026-11-23", body: "Bring your reading journal to the library this week." },
  ],
  timetable: [
    { id: "TT-01", day: "Monday", time: "08:00", subject: "Mathematics", className: "7 Green", teacher: "Daniel Tadesse" },
    { id: "TT-02", day: "Monday", time: "09:00", subject: "English", className: "7 Green", teacher: "Rahel Mekonnen" },
    { id: "TT-03", day: "Tuesday", time: "08:00", subject: "Biology", className: "11 Science", teacher: "Samuel Girma" },
    { id: "TT-04", day: "Wednesday", time: "10:00", subject: "Mathematics", className: "10 Blue", teacher: "Daniel Tadesse" },
    { id: "TT-05", day: "Thursday", time: "09:00", subject: "English", className: "2 Blue", teacher: "Rahel Mekonnen" },
  ],
  calendarEvents: [
    { id: "EV-001", title: "Parent consultation day", date: "2026-11-24", type: "School event", allDay: true, audience: "All students", description: "Families can meet with teachers by appointment.", schoolId: "SCH-001" },
    { id: "EV-002", title: "Science club meeting", date: "2026-11-20", type: "Activity", allDay: false, startTime: "15:00", endTime: "16:00", audience: "Grade 11", description: "Meet in the science laboratory.", schoolId: "SCH-001" },
    { id: "EV-003", title: "Research seminar", date: "2026-11-26", type: "Academic", allDay: false, startTime: "13:00", endTime: "14:30", audience: "Postgraduate", description: "Research methods seminar in the graduate center.", schoolId: "SCH-003" },
    { id: "EV-004", title: "Workshop safety induction", date: "2026-11-23", type: "Training", allDay: false, startTime: "09:00", endTime: "10:00", audience: "TVET", description: "Safety induction in the electrical workshop.", schoolId: "SCH-004" },
  ],
  documents: [],
  assignmentSubmissions: [],
};

const schoolCollections = ["students", "teachers", "classes", "subjects", "attendance", "assignments", "assignmentSubmissions", "results", "research", "announcements", "timetable", "calendarEvents", "documents"];
for (const collection of schoolCollections) {
  seedData[collection] = seedData[collection].map((record) => ({
    ...record,
    schoolId: record.schoolId || "SCH-001",
    ...(collection === "students" ? {
      educationStage: Number(record.grade) <= 8 ? "primary" : "secondary",
      level: `Grade ${record.grade}`,
      program: "General education",
    } : {}),
  }));
}

seedData.students.push(
  { id: "S-2001", name: "Dawit Fikru", email: "dawit@greenvalley.edu", gender: "Male", grade: "5", className: "5 Maple", classId: "C-5M", parentName: "Fikru Dawit", parentPhone: "+251 911 200 101", enrollmentDate: "2025-09-01", schoolId: "SCH-002" },
  { id: "S-2002", name: "Sara Bekele", email: "sara@greenvalley.edu", gender: "Female", grade: "9", className: "9 Cedar", classId: "C-9C", parentName: "Bekele Sara", parentPhone: "+251 911 200 102", enrollmentDate: "2025-09-01", schoolId: "SCH-002" },
  { id: "S-1006", name: "Mimi Dawit", email: "mimi@school.com", gender: "Female", educationStage: "early-years", grade: "Class 0", level: "Class 0", program: "Early Years", className: "0 Little Stars", classId: "C-0LS", parentName: "Dawit Mimi", parentPhone: "+251 911 000 106", enrollmentDate: "2025-09-01", schoolId: "SCH-001" },
  { id: "S-3001", name: "Natnael Girma", email: "natnael@unity.edu", gender: "Male", educationStage: "undergraduate", grade: "Year 2", level: "Year 2", program: "BSc Computer Science", className: "Computer Science · Year 2", classId: "C-UG2", enrolledCourseIds: ["CS-201"], creditsCompleted: 42, creditsRequired: 120, enrollmentDate: "2024-09-01", schoolId: "SCH-003" },
  { id: "S-3002", name: "Rahel Abebe", email: "rahel.student@unity.edu", gender: "Female", educationStage: "postgraduate", grade: "Master's Year 1", level: "Master's Year 1", program: "Master of Public Health", className: "MPH · Year 1", classId: "C-PG1", enrolledCourseIds: ["PH-501"], creditsCompleted: 9, creditsRequired: 36, enrollmentDate: "2025-09-01", schoolId: "SCH-003" },
  { id: "S-4001", name: "Kalkidan Mulu", email: "kalkidan@merit.edu", gender: "Female", educationStage: "tvet", grade: "TVET Level II", level: "TVET Level II", program: "Electrical Installation", className: "Electrical Installation · Level II", classId: "C-TV2", enrolledCourseIds: ["TV-203"], enrollmentDate: "2025-09-01", schoolId: "SCH-004" },
);
seedData.teachers.push(
  { id: "T-2001", name: "Abeba Kebede", email: "abeba@greenvalley.edu", subject: "Science", classes: "5 Maple, 9 Cedar", phone: "+251 911 200 201", schoolId: "SCH-002" },
  { id: "T-3001", name: "Fikru Solomon", email: "fikru@unity.edu", subject: "Computer Science", classes: "Computer Science · Year 2, MPH · Year 1", phone: "+251 911 300 201", schoolId: "SCH-003" },
  { id: "T-4001", name: "Mekdes Abate", email: "mekdes@merit.edu", subject: "Electrical Installation", classes: "Electrical Installation · Level II", phone: "+251 911 400 201", schoolId: "SCH-004" },
);
seedData.classes.push(
  { id: "C-5M", name: "5 Maple", grade: "5", teacher: "Abeba Kebede", students: 21, schoolId: "SCH-002" },
  { id: "C-9C", name: "9 Cedar", grade: "9", teacher: "Abeba Kebede", students: 24, schoolId: "SCH-002" },
  { id: "C-0LS", name: "0 Little Stars", grade: "Class 0", teacher: "Rahel Mekonnen", students: 18, schoolId: "SCH-001" },
  { id: "C-UG2", name: "Computer Science · Year 2", grade: "Undergraduate", teacher: "Fikru Solomon", students: 31, schoolId: "SCH-003" },
  { id: "C-PG1", name: "MPH · Year 1", grade: "Postgraduate", teacher: "Fikru Solomon", students: 14, schoolId: "SCH-003" },
  { id: "C-TV2", name: "Electrical Installation · Level II", grade: "TVET Level II", educationStage: "tvet", teacher: "Mekdes Abate", students: 20, schoolId: "SCH-004" },
);
seedData.subjects.push(
  { id: "SUB-201", name: "Science", grade: "5, 9", teacher: "Abeba Kebede", schoolId: "SCH-002" },
  { id: "SUB-202", name: "English", grade: "5, 9", teacher: "Abeba Kebede", schoolId: "SCH-002" },
  { id: "SUB-001", name: "Early Literacy & Numeracy", grade: "Class 0", teacher: "Rahel Mekonnen", schoolId: "SCH-001" },
  { id: "CS-201", code: "CS201", name: "Data Structures", grade: "Undergraduate Year 2", program: "BSc Computer Science", teacher: "Fikru Solomon", credits: 4, schoolId: "SCH-003" },
  { id: "PH-501", code: "PH501", name: "Research Methods", grade: "Master's Year 1", program: "Master of Public Health", teacher: "Fikru Solomon", credits: 3, schoolId: "SCH-003" },
  { id: "TV-203", code: "EII203", name: "Electrical Installation Module 3", grade: "TVET Level II", program: "Electrical Installation", teacher: "Mekdes Abate", credits: 5, schoolId: "SCH-004" },
);
seedData.attendance.push(
  { id: "A-201", studentId: "S-2001", student: "Dawit Fikru", classId: "C-5M", className: "5 Maple", date: "2026-11-19", status: "Present", schoolId: "SCH-002" },
  { id: "A-202", studentId: "S-2002", student: "Sara Bekele", classId: "C-9C", className: "9 Cedar", date: "2026-11-19", status: "Present", schoolId: "SCH-002" },
  { id: "A-006", studentId: "S-1006", student: "Mimi Dawit", classId: "C-0LS", className: "0 Little Stars", date: "2026-11-19", status: "Present", schoolId: "SCH-001" },
  { id: "A-301", studentId: "S-3001", student: "Natnael Girma", classId: "C-UG2", className: "Computer Science · Year 2", date: "2026-11-19", status: "Present", schoolId: "SCH-003" },
  { id: "A-302", studentId: "S-3002", student: "Rahel Abebe", classId: "C-PG1", className: "MPH · Year 1", date: "2026-11-19", status: "Present", schoolId: "SCH-003" },
  { id: "A-401", studentId: "S-4001", student: "Kalkidan Mulu", classId: "C-TV2", className: "Electrical Installation · Level II", date: "2026-11-19", status: "Present", schoolId: "SCH-004" },
);
seedData.assignments.push(
  { id: "AS-201", title: "My local environment", subject: "Science", classId: "C-5M", className: "5 Maple", teacherId: "T-2001", dueDate: "2026-11-25", description: "Create a short report describing one part of your local environment.", furtherExplanation: "Include one drawing or photo and explain why it is important to your community.", status: "In progress", schoolId: "SCH-002" },
  { id: "AS-006", title: "My classroom discovery", subject: "Early Literacy & Numeracy", classId: "C-0LS", className: "0 Little Stars", teacherId: "T-1002", dueDate: "2026-11-25", description: "Draw something you discovered in your classroom and tell your teacher about it.", furtherExplanation: "A family member may help you write your words.", status: "In progress", schoolId: "SCH-001" },
  { id: "AS-301", title: "Data structures project", subject: "Data Structures", classId: "C-UG2", className: "Computer Science · Year 2", teacherId: "T-3001", dueDate: "2026-11-28", description: "Build a small program that demonstrates a data structure studied in class.", furtherExplanation: "Submit your source code and a short explanation of your design choices.", status: "In progress", schoolId: "SCH-003" },
  { id: "AS-302", title: "Research proposal", subject: "Research Methods", classId: "C-PG1", className: "MPH · Year 1", teacherId: "T-3001", dueDate: "2026-12-02", description: "Prepare a research proposal that defines a public health question and a suitable study approach.", furtherExplanation: "Include the research question, objectives, proposed methods, and ethical considerations.", status: "Not started", schoolId: "SCH-003" },
  { id: "AS-401", title: "Workshop safety checklist", subject: "Electrical Installation Module 3", classId: "C-TV2", className: "Electrical Installation · Level II", teacherId: "T-4001", dueDate: "2026-11-25", description: "Complete the safety checklist for the electrical installation workshop.", furtherExplanation: "Identify the correct protective equipment and explain how to safely isolate equipment before work.", status: "In progress", schoolId: "SCH-004" },
);
seedData.results.push(
  { id: "R-201", studentId: "S-2001", student: "Dawit Fikru", classId: "C-5M", subject: "Science", assessment: "Term project", score: 88, outOf: 100, term: "Term 2", schoolId: "SCH-002" },
  { id: "R-202", studentId: "S-2002", student: "Sara Bekele", classId: "C-9C", subject: "Science", assessment: "Lab report", score: 82, outOf: 100, term: "Term 2", schoolId: "SCH-002" },
  { id: "R-006", studentId: "S-1006", student: "Mimi Dawit", classId: "C-0LS", subject: "Early Literacy & Numeracy", assessment: "Learning observation", score: 92, outOf: 100, term: "Term 2", schoolId: "SCH-001" },
  { id: "R-301", studentId: "S-3001", student: "Natnael Girma", classId: "C-UG2", subject: "Data Structures", assessment: "Programming project", score: 87, outOf: 100, term: "Semester 1", schoolId: "SCH-003" },
  { id: "R-302", studentId: "S-3002", student: "Rahel Abebe", classId: "C-PG1", subject: "Research Methods", assessment: "Research proposal", score: 90, outOf: 100, term: "Semester 1", schoolId: "SCH-003" },
  { id: "R-401", studentId: "S-4001", student: "Kalkidan Mulu", classId: "C-TV2", subject: "Electrical Installation Module 3", assessment: "Practical skills check", score: 89, outOf: 100, term: "Training Block 2", schoolId: "SCH-004" },
);
seedData.research.push(
  { id: "RP-301", studentId: "S-3001", student: "Natnael Girma", classId: "C-UG2", program: "BSc Computer Science", title: "Data structures capstone", stage: "Planning", supervisor: "Fikru Solomon", dueDate: "2026-12-10", schoolId: "SCH-003" },
  { id: "RP-302", studentId: "S-3002", student: "Rahel Abebe", classId: "C-PG1", program: "Master of Public Health", title: "Community health access study", stage: "Proposal review", supervisor: "Fikru Solomon", dueDate: "2026-12-15", schoolId: "SCH-003" },
);
seedData.announcements.push(
  { id: "N-201", title: "Green Valley science fair", audience: "All students", date: "2026-11-24", body: "Bring your project ideas to the library.", schoolId: "SCH-002" },
  { id: "N-301", title: "Research seminar", audience: "Postgraduate", date: "2026-11-26", body: "Join the research methods seminar in the graduate center.", schoolId: "SCH-003" },
  { id: "N-401", title: "Workshop induction", audience: "TVET", date: "2026-11-23", body: "Safety induction is scheduled in the electrical workshop.", schoolId: "SCH-004" },
);
seedData.timetable.push(
  { id: "TT-201", day: "Monday", time: "09:00", subject: "Science", className: "5 Maple", teacher: "Abeba Kebede", schoolId: "SCH-002" },
  { id: "TT-202", day: "Tuesday", time: "10:00", subject: "English", className: "9 Cedar", teacher: "Abeba Kebede", schoolId: "SCH-002" },
  { id: "TT-006", day: "Monday", time: "09:00", subject: "Early Literacy & Numeracy", className: "0 Little Stars", teacher: "Rahel Mekonnen", schoolId: "SCH-001" },
  { id: "TT-301", day: "Monday", time: "13:00", subject: "Data Structures", className: "Computer Science · Year 2", teacher: "Fikru Solomon", schoolId: "SCH-003" },
  { id: "TT-302", day: "Wednesday", time: "15:00", subject: "Research Methods", className: "MPH · Year 1", teacher: "Fikru Solomon", schoolId: "SCH-003" },
  { id: "TT-401", day: "Tuesday", time: "09:00", subject: "Electrical Installation Module 3", className: "Electrical Installation · Level II", teacher: "Mekdes Abate", schoolId: "SCH-004" },
);

seedData.students = seedData.students.map((student) => {
  const gradeNumber = Number(student.grade);
  const educationStage = student.educationStage || (
    student.grade === "Class 0" ? "early-years" :
    gradeNumber <= 8 ? "primary" :
    gradeNumber <= 12 ? "secondary" :
    String(student.grade).startsWith("Master") ? "postgraduate" :
    String(student.grade).startsWith("Year") ? "undergraduate" : "continuing"
  );
  return {
    ...student,
    educationStage,
    level: student.level || (gradeNumber ? `Grade ${student.grade}` : student.grade),
    program: student.program || (educationStage === "undergraduate" || educationStage === "postgraduate" ? "General program" : "General education"),
    enrolledCourseIds: student.enrolledCourseIds || ({
      "S-1001": ["SUB-02"],
      "S-1002": ["SUB-01"],
      "S-1003": ["SUB-03"],
      "S-1004": ["SUB-01"],
      "S-1005": ["SUB-02"],
      "S-1006": ["SUB-001"],
      "S-2001": ["SUB-201", "SUB-202"],
      "S-2002": ["SUB-201", "SUB-202"],
    }[student.id] || []),
  };
});

seedData.classes = seedData.classes.map((schoolClass) => ({
  ...schoolClass,
  educationStage: schoolClass.educationStage || (
    schoolClass.grade === "Class 0" ? "early-years" :
    ["Undergraduate", "Postgraduate"].includes(schoolClass.grade) ? schoolClass.grade.toLowerCase() :
    Number(schoolClass.grade) <= 8 ? "primary" : "secondary"
  ),
}));

seedData.timetable = seedData.timetable.map((session) => {
  const startTime = session.startTime || session.time || "08:00";
  const [hours, minutes] = startTime.split(":").map(Number);
  const endMinute = hours * 60 + minutes + 60;
  const { time, ...record } = session;
  return {
    ...record,
    startTime,
    endTime: session.endTime || `${String(Math.floor(endMinute / 60)).padStart(2, "0")}:${String(endMinute % 60).padStart(2, "0")}`,
  };
});
