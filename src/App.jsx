import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Activity, ArrowRight, Bell, BookOpen, Building2, CalendarDays, Check, ChevronDown, ClipboardCheck,
  Download, FileUp, GraduationCap, LayoutDashboard, LogOut, Menu, Plus, Search, Settings, ShieldCheck, Users, X,
} from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useApp } from "./context/AppContext.jsx";
import { demoAccounts } from "./data/seed.js";
import { isValidEmail, normalizeEmail } from "./utils/validation.js";
import { downloadCsv } from "./utils/csv.js";
import { downloadPdf } from "./utils/pdf.js";
import { saveStoredFile } from "./utils/fileStorage.js";
import { validateUpload } from "./utils/fileUploads.js";
import CalendarPage from "./pages/CalendarPage.jsx";
import DocumentsPage from "./pages/DocumentsPage.jsx";
import TimetablePage from "./pages/TimetablePage.jsx";
import AssignmentsPage from "./pages/AssignmentsPage.jsx";

const roleHome = { "super-admin": "/super-admin/dashboard", director: "/director/dashboard", teacher: "/teacher/dashboard", student: "/student/dashboard" };

const navigation = {
  "super-admin": [
    ["dashboard", "Platform overview", LayoutDashboard], ["schools", "Institutions", Building2], ["calendar", "Calendar", CalendarDays],
    ["assignments", "Assignments", ClipboardCheck], ["documents", "Documents", Download], ["timetable", "Timetable", CalendarDays], ["settings", "Platform settings", Settings],
  ],
  director: [
    ["dashboard", "Overview", LayoutDashboard], ["education-structure", "Education structure", GraduationCap], ["students", "Students", Users], ["teachers", "Teachers", GraduationCap],
    ["classes", "Classes", BookOpen], ["subjects", "Subjects / courses", ClipboardCheck], ["attendance", "Attendance", Check],
    ["assignments", "Assignments", CalendarDays], ["results", "Results", Activity], ["research", "Research & capstone", BookOpen], ["announcements", "Announcements", Bell],
    ["calendar", "Calendar", CalendarDays], ["timetable", "Timetable", CalendarDays], ["documents", "Documents", Download], ["reports", "Reports", Activity], ["settings", "Settings", Settings],
  ],
  teacher: [
    ["dashboard", "My overview", LayoutDashboard],     ["classes", "My classes", Users], ["courses", "My courses", BookOpen], ["attendance", "Attendance", Check],
    ["assignments", "Assignments", ClipboardCheck], ["results", "Marks & results", Activity], ["research", "Research supervision", BookOpen], ["timetable", "Timetable", CalendarDays],
    ["calendar", "Calendar", CalendarDays], ["documents", "Documents", Download], ["announcements", "Announcements", Bell], ["profile", "My profile", Settings],
  ],
  student: [
    ["dashboard", "My home", LayoutDashboard], ["profile", "My profile", Users], ["courses", "My courses", BookOpen], ["results", "My results", Activity],
    ["attendance", "My attendance", Check], ["assignments", "My assignments", ClipboardCheck], ["research", "Research & capstone", BookOpen],
    ["calendar", "Calendar", CalendarDays], ["timetable", "My timetable", CalendarDays], ["documents", "Documents", Download], ["announcements", "Announcements", Bell],
  ],
};

const config = {
  schools: { title: "Schools", collection: "schools", fields: [["id", "School ID"], ["name", "School name"], ["type", "School type"], ["academicYear", "Academic year"], ["term", "Current term"]] },
  "education-structure": { title: "Education structure", collection: "educationLevels", fields: [["id", "Stage ID"], ["name", "Education stage"], ["levels", "Grades / levels"], ["institutionTypes", "Institution types"], ["active", "Active"]] },
  students: { title: "Students", collection: "students", fields: [["id", "Student ID"], ["name", "Full name"], ["email", "Email"], ["educationStage", "Education stage"], ["grade", "Grade / level"], ["program", "Program"], ["className", "Class / cohort"], ["classId", "Class ID"], ["parentName", "Parent / guardian"], ["parentPhone", "Parent phone"]] },
  teachers: { title: "Teachers", collection: "teachers", fields: [["id", "Teacher ID"], ["name", "Full name"], ["email", "Email"], ["subject", "Main subject"], ["classes", "Assigned classes"], ["phone", "Phone"]] },
  classes: { title: "Classes", collection: "classes", fields: [["id", "Class ID"], ["name", "Class / cohort"], ["educationStage", "Education stage"], ["grade", "Grade / level"], ["teacher", "Class teacher / advisor"], ["students", "Student count"]] },
  subjects: { title: "Subjects", collection: "subjects", fields: [["id", "Course ID"], ["code", "Course code"], ["name", "Subject / course"], ["credits", "Credit units"], ["program", "Program"], ["grade", "Grades / levels"], ["teacher", "Teacher / instructor"]] },
  courses: { title: "My courses", collection: "subjects", fields: [["code", "Course code"], ["name", "Subject / course"], ["credits", "Credit units"], ["grade", "Grade / level"], ["teacher", "Teacher / instructor"]] },
  assignments: { title: "Assignments", collection: "assignments", fields: [["title", "Assignment title"], ["subject", "Subject"], ["className", "Class"], ["classId", "Class ID"], ["dueDate", "Due date"], ["status", "Status"]] },
  announcements: { title: "Announcements", collection: "announcements", fields: [["title", "Title"], ["audience", "Audience"], ["date", "Date"], ["body", "Message"]] },
  results: { title: "Results", collection: "results", fields: [["student", "Student"], ["studentId", "Student ID"], ["classId", "Class ID"], ["subject", "Subject"], ["assessment", "Assessment"], ["score", "Mark"], ["outOf", "Out of"], ["term", "Term"]] },
  research: { title: "Research & capstone", collection: "research", fields: [["student", "Student"], ["studentId", "Student ID"], ["classId", "Class / cohort ID"], ["program", "Program"], ["title", "Project / thesis"], ["stage", "Milestone"], ["supervisor", "Supervisor"], ["dueDate", "Next review"]] },
  attendance: { title: "Attendance", collection: "attendance", fields: [["student", "Student"], ["className", "Class"], ["date", "Date"], ["status", "Status"]] },
  timetable: { title: "Timetable", collection: "timetable", fields: [["day", "Weekday"], ["startTime", "Start"], ["endTime", "End"], ["subject", "Subject"], ["className", "Class"], ["teacher", "Teacher"]] },
};

const iconColors = ["#e8efff", "#e7f7f1", "#fff3df", "#f4eaff"];

function ProtectedRoute({ children }) {
  const { user, viewRole } = useApp();
  const location = useLocation();
  const { role } = useParams();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (role !== viewRole) return <Navigate to={roleHome[viewRole] || roleHome[user.role]} replace />;
  return children;
}

function AppFrame({ children, page }) {
  const { user, viewRole, previewRole, setPreviewRole, logout, data, storageWarning, schoolOptions, schoolId, selectSchool } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const student = data.students.find((record) => record.id === user?.studentId) || (user?.role === "director" ? data.students[0] : null);
  const menu = (navigation[viewRole] || navigation.student).filter(([key]) =>
    key !== "research" || viewRole !== "student" || ["undergraduate", "postgraduate"].includes(student?.educationStage)
  );
  const name = user?.name || "School user";
  const pageName = menu.find(([key]) => key === page)?.[1] || "School";

  return (
    <div className="app-shell">
      {mobileOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><GraduationCap size={22} /></div>
          <div><strong>SR-EMS</strong><span>Education management</span></div>
          <button className="icon-button mobile-close" aria-label="Close menu" onClick={() => setMobileOpen(false)}><X size={18} /></button>
        </div>
        <div className="school-switch">        <div className="school-avatar">{(data.school?.name || "S").slice(0, 1)}</div><div className="school-switch-copy"><strong>{data.school?.name || "School"}</strong><span>{data.school?.academicYear || "Academic year"}</span></div>{user?.role === "super-admin" && schoolOptions.length > 1 ? <select aria-label="Select school" className="school-switch-select" value={schoolId} onChange={(event) => selectSchool(event.target.value)}>{schoolOptions.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}</select> : <ChevronDown size={15} />}</div>
        <div className="nav-caption">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {menu.map(([key, label, Icon]) => (
            <button key={key} className={`nav-item ${page === key ? "active" : ""}`} onClick={() => { navigate(`/${viewRole}/${key}`); setMobileOpen(false); }}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
              {key === "announcements" && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-badge"><ShieldCheck size={16} /><span>Demo environment</span></div>
          <div className="profile-mini">
            <div className="avatar">{name.split(" ").map((word) => word[0]).slice(0, 2).join("")}</div>
            <div className="profile-copy"><strong>{name}</strong><span>{viewRole === "super-admin" ? "Super Admin" : viewRole === "director" ? "Director" : viewRole === "teacher" ? "Teacher" : "Student"}</span></div>
            <button className="icon-button" title="Sign out" aria-label="Sign out" onClick={() => { logout(); navigate("/login"); }}><LogOut size={17} /></button>
          </div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left"><button className="icon-button mobile-menu" aria-label="Open menu" onClick={() => setMobileOpen(true)}><Menu size={21} /></button><div className="breadcrumbs">Workspace <span>/</span> <strong>{pageName}</strong></div></div>
          <div className="topbar-actions">
            <div className="term-pill"><span className="status-dot" /> {data.school?.term || "Term 2"} <span className="topbar-divider">·</span> {data.school?.academicYear || "2025 / 2026"}</div>
            <button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button>
            <div className="avatar avatar-small">{name.split(" ").map((word) => word[0]).slice(0, 2).join("")}</div>
          </div>
        </header>
        {previewRole && <div className="preview-banner"><span><ShieldCheck size={16} /> Director preview: viewing the {previewRole} experience</span><button onClick={() => { setPreviewRole(""); navigate(roleHome.director); }}>Return to Director <ArrowRight size={15} /></button></div>}
        {storageWarning && <div className="storage-warning" role="status">{storageWarning}</div>}
        <div className="page-content">{children}</div>
        <footer className="app-footer"><span>© 2026 SR-EMS · Education demo system</span><span>Built for learning and school community</span></footer>
      </main>
    </div>
  );
}

function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (event) => {
    event.preventDefault();
    if (!login(email, password)) { setError("That email and password do not match a demo account."); return; }
    const account = demoAccounts.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
    navigate(roleHome[account.role], { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-decoration decoration-one" /><div className="login-decoration decoration-two" />
      <div className="login-brand"><div className="brand-mark"><GraduationCap size={23} /></div><strong>SR-EMS</strong><span>Education management</span></div>
      <div className="login-card">
        <div className="login-eyebrow"><span className="status-dot" /> SCHOOL PORTAL</div>
        <h1>Welcome back</h1><p className="login-subtitle">Sign in to continue to your learning workspace.</p>
        <form onSubmit={submit} className="login-form">
          <label>Email address<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@school.com" required /></label>
          <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required /></label>
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="button button-primary login-submit" type="submit">Sign in <ArrowRight size={17} /></button>
        </form>
        <div className="demo-logins">
          <div className="demo-title"><span>DEMO ACCOUNTS</span><span>Pick a role to fill sign-in</span></div>
          <div className="demo-account-list">
            {demoAccounts.filter((account) => ["super-admin", "director", "teacher", "student"].includes(account.role)).filter((account, index, list) => list.findIndex((item) => item.role === account.role) === index).map((account) => (
              <button key={account.role} className="demo-account" onClick={() => { setEmail(account.email); setPassword(account.password); setError(""); }}>
                <span className={`demo-role-icon ${account.role}`}>{account.role === "director" ? <ShieldCheck size={17} /> : account.role === "teacher" ? <BookOpen size={17} /> : <GraduationCap size={17} />}</span>
                <span><strong>{account.role[0].toUpperCase() + account.role.slice(1)}</strong><small>{account.email}</small></span><ArrowRight size={15} />
              </button>
            ))}
          </div>
          <p className="login-footnote">More demo learners are listed in README, from Class 0 through undergraduate and postgraduate study.</p>
        </div>
      </div>
      <div className="login-bottom">A thoughtful space for every learner <span>·</span> Class 0 through postgraduate study</div>
    </div>
  );
}

function Dashboard({ role }) {
  const { data, user, setPreviewRole } = useApp();
  const navigate = useNavigate();
  const [notification, setNotification] = useState("");
  const activeStudent = data.students.find((student) => student.id === user?.studentId) || data.students[0];
  const studentResults = data.results.filter((item) => item.studentId === activeStudent?.id);
  const studentAttendance = data.attendance.filter((item) => item.studentId === activeStudent?.id);
  const activeTeacher = data.teachers.find((teacher) => teacher.id === user?.teacherId) || (user?.role === "director" ? data.teachers[0] : null);
  const assignedClasses = role === "teacher" ? data.classes.filter((schoolClass) => schoolClass.teacher === activeTeacher?.name) : [];
  const assignedClassIds = assignedClasses.map((schoolClass) => schoolClass.id);
  const attendanceRows = role === "teacher"
    ? data.attendance.filter((record) => assignedClassIds.includes(record.classId))
    : data.attendance;
  const attendanceCounts = {
    present: attendanceRows.filter((record) => record.status === "Present").length,
    late: attendanceRows.filter((record) => record.status === "Late").length,
    absent: attendanceRows.filter((record) => record.status === "Absent").length,
  };
  const schoolAttendanceRate = attendanceRows.length ? Math.round((attendanceCounts.present / attendanceRows.length) * 100) : 0;
  const visibleAssignments = role === "student"
    ? data.assignments.filter((item) => item.classId === activeStudent?.classId)
    : role === "teacher" ? data.assignments.filter((item) => assignedClassIds.includes(item.classId)) : data.assignments;
  const presentRate = studentAttendance.length ? Math.round((studentAttendance.filter((item) => item.status === "Present").length / studentAttendance.length) * 100) : 96;
  const average = studentResults.length ? Math.round(studentResults.reduce((sum, item) => sum + Number(item.score), 0) / studentResults.length) : 84;
  const educationStage = activeStudent?.educationStage || (Number(activeStudent?.grade) <= 8 ? "primary" : "secondary");
  const stageName = data.educationLevels?.find((stage) => stage.id === educationStage)?.name || educationStage;
  const studentLevel = activeStudent?.level || activeStudent?.grade || "Learner";
  const isYounger = educationStage === "early-years" || (educationStage === "primary" && Number(activeStudent?.grade) <= 4);
  const assignedStudentCount = data.students.filter((student) => assignedClassIds.includes(student.classId)).length;
  const stats = role === "director"
    ? [
      { label: "Total students", value: data.students.length, note: "+12 this term", icon: Users, tone: "blue" },
      { label: "Teaching staff", value: data.teachers.length, note: "Across all grades", icon: GraduationCap, tone: "green" },
      { label: "Active classes", value: data.classes.length, note: "Grades 1–12", icon: BookOpen, tone: "orange" },
      { label: "Attendance today", value: `${schoolAttendanceRate}%`, note: "Based on recorded attendance", icon: ClipboardCheck, tone: "purple" },
    ]
    : role === "teacher"
      ? [
      { label: "My classes", value: assignedClasses.length, note: "Assigned learning groups", icon: BookOpen, tone: "blue" },
      { label: "My students", value: assignedStudentCount, note: "Currently listed in assigned classes", icon: Users, tone: "green" },
        { label: "Assignments", value: visibleAssignments.filter((item) => item.status !== "Submitted").length, note: "Need your attention", icon: ClipboardCheck, tone: "orange" },
        { label: "Attendance today", value: `${schoolAttendanceRate}%`, note: "Based on recorded attendance", icon: Activity, tone: "purple" },
      ]
      : [
        { label: "My attendance", value: `${presentRate}%`, note: "Keep showing up!", icon: ClipboardCheck, tone: "blue" },
        { label: "My average", value: `${average}%`, note: "You are making progress", icon: Activity, tone: "green" },
        { label: "To do", value: visibleAssignments.filter((item) => item.status !== "Submitted").length, note: "Check due dates", icon: CalendarDays, tone: "orange" },
        { label: ["undergraduate", "postgraduate"].includes(educationStage) ? "Program credits" : "My class", value: ["undergraduate", "postgraduate"].includes(educationStage) ? `${activeStudent?.creditsCompleted || 0} / ${activeStudent?.creditsRequired || "—"}` : activeStudent?.className || "—", note: ["undergraduate", "postgraduate"].includes(educationStage) ? activeStudent?.program || "Credits recorded" : `${stageName} · ${activeStudent?.program || studentLevel}`, icon: BookOpen, tone: "purple" },
      ];

  const subjectData = (studentResults.length ? studentResults : [{ subject: "Learning", score: average }]).map((result) => ({ name: result.subject, score: Number(result.score) }));
  const chartData = role === "teacher"
    ? assignedClasses.map((schoolClass) => {
      const classRecords = data.attendance.filter((record) => record.classId === schoolClass.id);
      return { name: schoolClass.name, attendance: classRecords.length ? Math.round((classRecords.filter((record) => record.status === "Present").length / classRecords.length) * 100) : 0 };
    })
    : (data.educationLevels || []).filter((stage) => stage.active !== false).map((stage) => ({
      name: stage.name,
      students: data.students.filter((student) => student.educationStage === stage.id).length,
    }));
  const visibleAnnouncements = role === "student"
    ? data.announcements.filter((announcement) => isAnnouncementForStudent(announcement, activeStudent, data.educationLevels))
    : data.announcements;

  return (
    <>
      <div className="page-heading">
        <div><div className="eyebrow">{role === "student" ? `${stageName.toUpperCase()} · ${studentLevel.toUpperCase()}` : role === "teacher" ? "TEACHER WORKSPACE" : "SCHOOL AT A GLANCE"}</div>
          <h1>{role === "student" ? `${isYounger ? "Hello" : "Welcome back"}, ${activeStudent?.name.split(" ")[0] || user?.name}!` : role === "teacher" ? `Good morning, ${user?.name.split(" ")[0]}` : "Good morning, Martha"}</h1>
          <p>{role === "student" ? isYounger ? "Here is your school day. You are doing great!" : "Here is your learning progress and what is coming up." : role === "teacher" ? "Here’s what’s happening across your classes today." : "Here’s what’s happening across your school today."}</p>
        </div>
        {role === "director" && <button className="button button-primary" onClick={() => navigate("/director/students")}><Plus size={17} /> Add a student</button>}
      </div>
      {role === "director" && <div className="role-preview-card"><div className="preview-icon"><Users size={20} /></div><div><strong>See the school through their eyes</strong><span>Preview how the student and teacher dashboards look.</span></div><button className="button button-light" onClick={() => { setPreviewRole("student"); navigate("/student/dashboard"); }}>Student view <ArrowRight size={15} /></button><button className="button button-light" onClick={() => { setPreviewRole("teacher"); navigate("/teacher/dashboard"); }}>Teacher view <ArrowRight size={15} /></button></div>}
      {notification && <div className="inline-notice"><Check size={17} />{notification}<button aria-label="Dismiss" onClick={() => setNotification("")}><X size={16} /></button></div>}
      <section className="stats-grid" aria-label="Summary">
        {stats.map(({ label, value, note, icon: Icon, tone }) => <article className="stat-card" key={label}>
          <div className={`stat-icon ${tone}`}><Icon size={19} /></div><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><span className="stat-note">{note}</span>
          <span className={`stat-spark ${tone}`} aria-hidden="true">⌁</span>
        </article>)}
      </section>
      {role === "student" && ["undergraduate", "postgraduate"].includes(educationStage) && activeStudent?.creditsRequired > 0 && <section className="panel degree-progress"><div><div><h2>Program progress</h2><p>Credit progress recorded by your institution · {activeStudent.program}</p></div><strong>{Math.min(100, Math.round((activeStudent.creditsCompleted / activeStudent.creditsRequired) * 100))}%</strong></div><div className="progress-track"><span style={{ width: `${Math.min(100, Math.round((activeStudent.creditsCompleted / activeStudent.creditsRequired) * 100))}%` }} /></div><small>{activeStudent.creditsCompleted} of {activeStudent.creditsRequired} required credits recorded. Confirm official completion with your registrar.</small></section>}
      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel-heading"><div><h2>{role === "student" ? "My learning progress" : role === "teacher" ? "Class attendance" : "Enrollment by education stage"}</h2><p>{role === "student" ? "Your subject or course results this term" : role === "teacher" ? "Calculated from attendance records in your classes" : "Actual student records in the selected institution"}</p></div><button className="select-pill">{data.school?.term || "This term"} <ChevronDown size={14} /></button></div>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              {role === "student" ? <BarChart data={subjectData} margin={{ top: 8, right: 12, left: -22, bottom: 2 }}><CartesianGrid stroke="#edf0f5" vertical={false} /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#8290a4", fontSize: 11 }} /><YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: "#8290a4", fontSize: 11 }} /><Tooltip cursor={{ fill: "#f5f7fb" }} /><Bar dataKey="score" fill="#5378e8" radius={[6, 6, 0, 0]} maxBarSize={38} /></BarChart> : <BarChart data={chartData} margin={{ top: 8, right: 12, left: -22, bottom: 2 }}><CartesianGrid stroke="#edf0f5" vertical={false} /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#8290a4", fontSize: 11 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "#8290a4", fontSize: 11 }} /><Tooltip cursor={{ fill: "#f5f7fb" }} /><Bar dataKey={role === "teacher" ? "attendance" : "students"} fill="#5378e8" radius={[6, 6, 0, 0]} maxBarSize={38} /></BarChart>}
            </ResponsiveContainer>
          </div>
        </article>
        <article className="panel agenda-panel">
          <div className="panel-heading"><div><h2>{role === "student" ? "Coming up" : "Attendance today"}</h2><p>{role === "student" ? "A little planning goes a long way" : "Today's attendance snapshot"}</p></div><button className="text-button" onClick={() => navigate(`/${role}/${role === "student" ? "assignments" : "attendance"}`)}>View all <ArrowRight size={14} /></button></div>
          {role === "student" ? <div className="agenda-list">{visibleAssignments.slice(0, 3).map((item, index) => <div className="agenda-item" key={item.id}><div className={`agenda-date date-${index}`}><span>{new Date(`${item.dueDate}T00:00:00`).toLocaleDateString("en", { month: "short" })}</span><strong>{new Date(`${item.dueDate}T00:00:00`).getDate()}</strong></div><div className="agenda-copy"><strong>{item.title}</strong><span>{item.subject} · {item.status}</span></div><ArrowRight size={15} /></div>)}{visibleAssignments.length === 0 && <EmptyState message="Nothing due right now. Enjoy your day!" />}</div> :
            <div className="attendance-snapshot"><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[{ name: "Present", value: attendanceCounts.present }, { name: "Other", value: attendanceCounts.late + attendanceCounts.absent }]} dataKey="value" innerRadius={45} outerRadius={59} startAngle={90} endAngle={-270} paddingAngle={3}><Cell fill="#5579e7" /><Cell fill="#edf0f6" /></Pie></PieChart></ResponsiveContainer><div className="donut-label"><strong>{schoolAttendanceRate}%</strong><span>present</span></div></div><div className="attendance-legend"><span><i className="legend-dot present" />Present <strong>{attendanceCounts.present}</strong></span><span><i className="legend-dot late" />Late <strong>{attendanceCounts.late}</strong></span><span><i className="legend-dot absent" />Absent <strong>{attendanceCounts.absent}</strong></span><button className="text-button" onClick={() => navigate(`/${role}/attendance`)}>Open attendance <ArrowRight size={14} /></button></div></div>}
        </article>
      </section>
      <section className="dashboard-grid lower-grid">
        <article className="panel table-panel">
          <div className="panel-heading"><div><h2>{role === "student" ? "My recent results" : "Recent activity"}</h2><p>{role === "student" ? "Your latest marks and feedback" : "Latest updates from your school"}</p></div><button className="text-button" onClick={() => navigate(`/${role}/${role === "student" ? "results" : "announcements"}`)}>View all <ArrowRight size={14} /></button></div>
          {role === "student" ? <div className="result-list">{studentResults.length ? studentResults.map((item) => <div className="result-row" key={item.id}><div className="subject-avatar">{item.subject.slice(0, 1)}</div><div><strong>{item.subject}</strong><span>{item.assessment}</span></div><strong className="result-score">{item.score}<small>/{item.outOf}</small></strong></div>) : <EmptyState message="Your teacher has not shared results yet." />}</div> :
            <div className="activity-list">{[{ initials: "AK", text: "A new student was enrolled in", context: "Grade 7 Green", time: "12 min ago", tone: "blue" }, { initials: "DM", text: "Attendance submitted for", context: "Grade 10 Blue", time: "38 min ago", tone: "green" }, { initials: "RM", text: "Posted an announcement for", context: "All students", time: "1 hr ago", tone: "orange" }].map((item) => <div className="activity-row" key={item.initials + item.context}><div className={`activity-avatar ${item.tone}`}>{item.initials}</div><div><span>{item.text} <strong>{item.context}</strong></span><small>{item.time}</small></div></div>)}</div>}
        </article>
        <article className="panel announcements-panel">
          <div className="panel-heading"><div><h2>School notices</h2><p>Important things to know</p></div><button className="text-button" onClick={() => navigate(`/${role}/announcements`)}>All notices <ArrowRight size={14} /></button></div>
          <div className="notice-list">{visibleAnnouncements.slice(0, 3).map((item, index) => <div className="notice-item" key={item.id}><div className={`notice-mark notice-${index}`}><Bell size={15} /></div><div><strong>{item.title}</strong><span>{item.body}</span><small>{item.audience} · {item.date}</small></div></div>)}{visibleAnnouncements.length === 0 && <EmptyState message="There are no notices for your program right now." />}</div>
        </article>
      </section>
      {role === "student" && <div className="student-encouragement"><span>✦</span><div><strong>Every step counts, {activeStudent?.name.split(" ")[0]}.</strong><p>Learning is a journey. Keep asking questions and celebrate your progress.</p></div><span className="encouragement-grade">{studentLevel} · {stageName}</span></div>}
    </>
  );
}

function SuperAdminDashboard() {
  const { data, selectSchool } = useApp();
  const navigate = useNavigate();
  return <>
    <div className="page-heading"><div><div className="eyebrow">PLATFORM MANAGEMENT</div><h1>Super Admin overview</h1><p>Manage institution workspaces and review platform-wide school access.</p></div><button className="button button-primary" onClick={() => navigate("/super-admin/schools")}><Plus size={16} />Manage institutions</button></div>
    <section className="stats-grid" aria-label="Platform summary">
      <Stat label="Institution workspaces" value={data.schools.length} note="Across this demo platform" icon={Building2} tone="blue" />
      <Stat label="Institution types" value={new Set(data.schools.map((school) => school.type)).size} note="Configured education models" icon={GraduationCap} tone="green" />
      <Stat label="Selected institution" value={data.school?.name || "None"} note="Choose a school to manage" icon={ShieldCheck} tone="purple" />
      <Stat label="Data boundaries" value="School-scoped" note="Demo filters; not production security" icon={Settings} tone="orange" />
    </section>
    <section className="panel institution-panel"><div className="panel-heading"><div><h2>Institution workspaces</h2><p>Select a school to set the active management workspace.</p></div></div>
      <div className="institution-list">{data.schools.map((school) => <article className={`institution-card ${data.school?.id === school.id ? "institution-selected" : ""}`} key={school.id}>
        <div className="institution-icon"><Building2 size={19} /></div><div><strong>{school.name}</strong><span>{school.type} · {school.academicYear}</span><small>{school.term}</small></div>
        <button className="button button-light" onClick={() => { selectSchool(school.id); navigate("/super-admin/schools"); }}>{data.school?.id === school.id ? "Manage selected" : "Select school"}</button>
      </article>)}</div>
    </section>
    <div className="privacy-note"><ShieldCheck size={16} />Production platform administration requires backend identity, audit logs, and server-enforced tenant isolation.</div>
  </>;
}

function EmptyState({ message }) {
  return <div className="empty-state"><div><BookOpen size={19} /></div><span>{message}</span></div>;
}

function isAnnouncementForStudent(announcement, student, educationLevels = []) {
  if (!student) return false;
  const audience = announcement.audience || "";
  const audienceLower = audience.toLowerCase();
  if (
    audienceLower === "all students" ||
    [student.educationStage, student.grade, student.level].some((value) => value && audienceLower.includes(String(value).toLowerCase()))
  ) return true;
  const stageName = educationLevels.find((stage) => stage.id === student.educationStage)?.name || "";
  if (stageName && (audienceLower.includes(stageName.toLowerCase()) || stageName.toLowerCase().includes(audienceLower))) return true;
  const gradeRange = audience.match(/Grades?\s+(\d+)\s*[–-]\s*(\d+)/i);
  const grade = Number(student.grade);
  return Boolean(gradeRange && Number.isFinite(grade) && grade >= Number(gradeRange[1]) && grade <= Number(gradeRange[2]));
}

function getVisibleRows(page, role, user, data) {
  const collection = config[page]?.collection;
  if (!collection) return [];
  let rows = data[collection] || [];
  if (role === "student") {
    const student = data.students.find((item) => item.id === user?.studentId) || (user?.role === "director" ? data.students[0] : null);
    if (page === "results" || page === "attendance") rows = rows.filter((item) => item.studentId === student?.id);
    else if (page === "assignments") rows = rows.filter((item) => item.classId === student?.classId);
    else if (page === "courses") rows = rows.filter((item) => (student?.enrolledCourseIds || []).includes(item.id));
    else if (page === "research") rows = rows.filter((item) => item.studentId === student?.id);
    else if (page === "announcements") rows = rows.filter((item) => isAnnouncementForStudent(item, student, data.educationLevels));
    else if (page === "timetable") rows = rows.filter((item) => item.className === student?.className);
    else if (page === "profile") rows = student ? [student] : [];
    else rows = [];
  }
  if (role === "teacher") {
    const teacher = data.teachers.find((item) => item.id === user?.teacherId) || (user?.role === "director" ? data.teachers[0] : null);
    const classIds = data.classes.filter((item) => item.teacher === teacher?.name).map((item) => item.id);
    if (page === "attendance" || page === "results") rows = rows.filter((item) => classIds.includes(item.classId));
    else if (page === "assignments") rows = rows.filter((item) => classIds.includes(item.classId) && (!item.teacherId || item.teacherId === teacher?.id));
    else if (page === "courses") rows = rows.filter((item) => item.teacher === teacher?.name);
    else if (page === "research") rows = rows.filter((item) => classIds.includes(item.classId));
    else if (page === "classes") rows = rows.filter((item) => classIds.includes(item.id));
    else if (page === "students") rows = rows.filter((item) => classIds.includes(item.classId));
    else if (page === "timetable") rows = rows.filter((item) => item.teacher === teacher?.name);
    else if (page === "profile") rows = teacher ? [teacher] : [];
  }
  return rows;
}

function DataPage({ page, role }) {
  const { data, user, schoolId, updateCollection } = useApp();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [toast, setToast] = useState("");
  const item = page === "profile" && role === "teacher"
    ? { title: "My profile", collection: "teachers", fields: config.teachers.fields }
    : config[page] || config.students;
  const collection = item.collection;
  const rows = getVisibleRows(page, role, user, data);
  const filtered = rows.filter((row) => Object.values(row).join(" ").toLowerCase().includes(search.toLowerCase()));
  const isSchoolAdmin = ["director", "super-admin"].includes(role);
  const canEdit = page === "schools"
    ? role === "super-admin"
    : isSchoolAdmin || (role === "teacher" && ["attendance", "assignments", "results", "research"].includes(page));
  const canDelete = isSchoolAdmin && page !== "schools";
  const isStudent = role === "student";
  const singularTitle = {
    schools: "school",
    "education-structure": "education stage",
    students: "student",
    teachers: "teacher",
    classes: "class",
    subjects: "subject / course",
    assignments: "assignment",
    announcements: "announcement",
    research: "research project",
  }[page] || item.title.slice(0, -1).toLowerCase();
  const activeTeacher = data.teachers.find((teacher) => teacher.id === user?.teacherId) || (user?.role === "director" && role === "teacher" ? data.teachers[0] : null);
  const availableClasses = data.classes.filter((schoolClass) => role !== "teacher" || schoolClass.teacher === activeTeacher?.name);
  const availableStudents = data.students.filter((student) => role !== "teacher" || availableClasses.some((schoolClass) => schoolClass.id === student.classId));

  const openForm = (row = null) => {
    setEditing(row);
    setForm(row ? { ...row, ...(Array.isArray(row.levels) ? { levels: row.levels.join(", ") } : {}) } : Object.fromEntries(item.fields.map(([key]) => [key, key === "active" ? "true" : ""])));
    setSelectedFile(null);
    setModal(true);
  };
  const save = async (event) => {
    event.preventDefault();
    const email = form.email ? normalizeEmail(form.email) : "";
    if (form.email && !isValidEmail(form.email)) {
      setToast("Enter a valid email address, such as name@example.com."); return;
    }
    if (email && data[collection].some((record) =>
      normalizeEmail(record.email) === email && record.id !== editing?.id
    )) {
      setToast("A record with this email address already exists."); return;
    }
    const id = editing?.id || form.id || `${page.slice(0, 2).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    if (["schools", "education-structure", "students", "teachers", "classes"].includes(page) && data[collection].some((record) => record.id === id && record.id !== editing?.id)) {
      setToast(`This ${singularTitle} ID already exists.`); return;
    }
    const teacher = role === "teacher"
      ? data.teachers.find((record) => record.id === user.teacherId) || (user.role === "director" ? data.teachers[0] : null)
      : null;
    if (page === "assignments" && role === "teacher" && !data.classes.some((schoolClass) => schoolClass.id === form.classId && schoolClass.teacher === teacher?.name)) {
      setToast("Choose one of your assigned classes using its class ID."); return;
    }
    let normalizedForm = { ...form };
    if (page === "students") {
      const schoolClass = data.classes.find((record) => record.id === normalizedForm.classId);
      if (!schoolClass) {
        setToast("Choose a class or cohort from this school."); return;
      }
      normalizedForm = {
        ...normalizedForm,
        className: schoolClass.name,
        grade: schoolClass.grade,
        educationStage: schoolClass.educationStage || normalizedForm.educationStage,
      };
    }
    if (page === "results") {
      const score = Number(normalizedForm.score);
      const outOf = Number(normalizedForm.outOf || 100);
      const student = data.students.find((record) => record.id === normalizedForm.studentId);
      if (!Number.isFinite(score) || !Number.isFinite(outOf) || score < 0 || outOf <= 0 || score > outOf) {
        setToast("Enter a mark from 0 up to the assessment maximum."); return;
      }
      if (!student || (normalizedForm.classId && student.classId !== normalizedForm.classId)) {
        setToast("Choose a student ID and matching class ID from this school."); return;
      }
      if (role === "teacher" && !data.classes.some((schoolClass) => schoolClass.id === student.classId && schoolClass.teacher === teacher?.name)) {
        setToast("You can only enter marks for your assigned classes."); return;
      }
      normalizedForm.student = student.name;
      normalizedForm.classId = student.classId;
      normalizedForm.outOf = outOf;
      normalizedForm.score = score;
    }
    if (page === "research") {
      const student = availableStudents.find((record) => record.id === normalizedForm.studentId);
      if (!student) {
        setToast("Choose a student from this school and your assigned classes."); return;
      }
      normalizedForm = {
        ...normalizedForm,
        student: student.name,
        classId: student.classId,
        program: student.program,
      };
      if (role === "teacher" && !availableStudents.some((record) => record.id === student.id)) {
        setToast("You can only manage research for students in your assigned classes."); return;
      }
    }
    const schoolClass = page === "assignments" ? data.classes.find((record) => record.id === normalizedForm.classId) : null;
    let values = {
      ...normalizedForm,
      ...(email ? { email } : {}),
      ...(page === "assignments" ? { className: schoolClass?.name || normalizedForm.className, status: normalizedForm.status || "Not started" } : {}),
      ...(page === "education-structure" ? {
        levels: String(normalizedForm.levels || "").split(",").map((level) => level.trim()).filter(Boolean),
        institutionTypes: String(normalizedForm.institutionTypes || "").trim(),
        active: normalizedForm.active === true || normalizedForm.active === "true",
      } : {}),
    };
    let uploadedDocument;
    if (selectedFile) {
      const uploadError = validateUpload(selectedFile);
      if (uploadError) { setToast(uploadError); return; }
      const documentId = `DOC-${Date.now()}`;
      const displayName = values.name || values.title || values.student || values.assessment || values.id || id;
      uploadedDocument = {
        id: documentId,
        fileName: selectedFile.name,
        fileType: selectedFile.name.split(".").pop().toLowerCase(),
        fileSize: selectedFile.size,
        relatedType: page,
        relatedId: id,
        relatedName: String(displayName),
        studentId: values.studentId || (page === "students" ? id : ""),
        classId: values.classId || "",
        uploadedBy: user.name,
        uploadedAt: new Date().toISOString(),
        schoolId,
      };
      try {
        await saveStoredFile(documentId, selectedFile);
      } catch (error) {
        setToast(error.message || "The selected file could not be uploaded.");
        return;
      }
      values = { ...values, documentIds: [...(Array.isArray(values.documentIds) ? values.documentIds : []), documentId] };
      updateCollection("documents", (documents) => [uploadedDocument, ...documents]);
    }
    updateCollection(collection, (current) => editing
      ? current.map((row) => row.id === editing.id ? { ...row, ...values } : row)
      : [{ ...values, id, ...(!["schools", "education-structure"].includes(page) ? { schoolId } : {}), ...(page === "assignments" && role === "teacher" ? { teacherId: teacher?.id } : {}) }, ...current]);
    setModal(false);
    setSelectedFile(null);
    setToast(editing ? "Changes saved." : `${singularTitle} added.`);
    window.setTimeout(() => setToast(""), 3200);
  };
  const remove = (row) => {
    if (page === "education-structure") {
      updateCollection(collection, (current) => current.map((entry) => entry.id === row.id ? { ...entry, active: false } : entry));
      setToast("Education stage deactivated. Historical records are retained.");
      window.setTimeout(() => setToast(""), 3200);
      return;
    }
    if (!window.confirm(`Delete "${row.name || row.title || row.student || row.id}"? This cannot be undone.`)) return;
    updateCollection(collection, (current) => current.filter((entry) => entry.id !== row.id));
    setToast("Record deleted.");
    window.setTimeout(() => setToast(""), 3200);
  };
  const markAttendance = (row) => {
    const next = row.status === "Present" ? "Absent" : row.status === "Absent" ? "Late" : "Present";
    updateCollection(collection, (current) => current.map((entry) => entry.id === row.id ? { ...entry, status: next } : entry));
    setToast(`${row.student}'s attendance updated to ${next}.`);
    window.setTimeout(() => setToast(""), 3200);
  };

  const titleMap = { attendance: isStudent ? "My attendance" : "Attendance", results: isStudent ? "My results" : "Marks & results", assignments: isStudent ? "My assignments" : "Assignments", courses: "My courses", research: role === "student" ? "My research & capstone" : "Research & capstone", timetable: isStudent ? "My timetable" : "Timetable", announcements: "Announcements", classes: isStudent ? "My classes" : role === "teacher" ? "My classes" : "Classes", profile: "My profile", reports: "Reports", settings: "School settings" };
  const title = titleMap[page] || item.title;
  const descriptionMap = { schools: "Manage separate school workspaces and their academic years.", "education-structure": "Configure early-years, school, TVET, university, and postgraduate level catalogs.", students: "Manage student records across every grade.", teachers: "Your school’s teaching team and class assignments.", classes: "Organize students, cohorts, and academic levels.", subjects: "Subjects and courses taught across the institution.", courses: "Your enrolled subjects or university courses.", research: isStudent ? "Your research topic, supervisor, and project milestones." : "Track postgraduate research and capstone milestones.", attendance: isStudent ? "A personal view of your school attendance." : "Record and review daily attendance for your classes.", assignments: isStudent ? "Your classwork, projects, and upcoming due dates." : "Create assignments and keep track of due dates.", results: isStudent ? "Your marks and progress this term." : "Review marks and assessment records.", timetable: "Your weekly school schedule.", announcements: "Updates shared with your school community.", reports: "A summary of school activity and learning.", settings: "Manage the demo school workspace." };
  const description = descriptionMap[page] || "View and manage school information.";
  const exportPdf = async () => {
    try {
      await downloadPdf({
        title,
        subtitle: `${data.school?.name || "School"} · ${data.school?.term || ""} · ${new Date().toLocaleDateString()}`,
        headers: item.fields.map(([, label]) => label),
        rows: filtered.map((row) => item.fields.map(([key]) => key === "active" ? (row[key] ? "Active" : "Inactive") : Array.isArray(row[key]) ? row[key].join(", ") : row[key] ?? "—")),
        filename: `${page}-${schoolId}.pdf`,
      });
    } catch (error) {
      setToast(error.message || "PDF export failed.");
    }
  };

  if (page === "reports") return <Reports data={data} />;
  if (page === "settings") return <SettingsPage />;
  return (
    <>
      <div className="page-heading">
        <div><div className="eyebrow">{role === "student" ? "YOUR LEARNING SPACE" : role === "teacher" ? "TEACHER WORKSPACE" : role === "super-admin" ? "PLATFORM MANAGEMENT" : "SCHOOL MANAGEMENT"}</div><h1>{title}</h1><p>{description}</p></div>
        {canEdit && page !== "attendance" && <button className="button button-primary" onClick={() => openForm()}><Plus size={17} />{page === "assignments" ? "New assignment" : `Add ${singularTitle}`}</button>}
      </div>
      {toast && <div className="inline-notice"><Check size={17} />{toast}<button aria-label="Dismiss" onClick={() => setToast("")}><X size={16} /></button></div>}
      {page === "attendance" && role !== "student" && <div className="attendance-toolbar"><div><strong>Today’s attendance</strong><span>Update a student’s status by selecting the action.</span></div><div className="attendance-totals"><span><i className="legend-dot present" />{rows.filter((row) => row.status === "Present").length} present</span><span><i className="legend-dot absent" />{rows.filter((row) => row.status === "Absent").length} absent</span></div></div>}
      <section className="panel data-panel">
        <div className="data-toolbar"><div className="table-count"><strong>{filtered.length}</strong> records <span>·</span> {data.school?.term || "Term 2"}</div><div className="table-tools"><button className="button button-light export-button" onClick={() => downloadCsv(filtered, item.fields, `${page}-${schoolId}.csv`)}><Download size={14} />CSV</button><button className="button button-light export-button" onClick={exportPdf}><Download size={14} />PDF</button><label className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${title.toLowerCase()}...`} /></label></div></div>
        <div className="table-scroll"><table><thead><tr>{item.fields.map(([key, label]) => <th key={key}>{label}</th>)}{canEdit && <th className="actions-heading">Actions</th>}</tr></thead>
          <tbody>{filtered.map((row) => <tr key={row.id}>{item.fields.map(([key]) => <td key={key}>{key === "status" ? <span className={`status-badge ${String(row[key]).toLowerCase().replace(/\s+/g, "-")}`}>{row[key]}</span> : key === "active" ? <span className={`status-badge ${row.active ? "present" : "absent"}`}>{row.active ? "Active" : "Inactive"}</span> : key === "score" ? <strong className="score-cell">{row[key]}<small>/{row.outOf}</small></strong> : key === "name" || key === "student" || key === "title" ? <strong className="primary-cell">{row[key]}</strong> : Array.isArray(row[key]) ? row[key].join(", ") : row[key] ?? "—"}</td>)}{canEdit && <td className="row-actions">{page === "attendance" && role === "teacher" ? <button className="table-action" onClick={() => markAttendance(row)}>Change status</button> : <><button className="table-action" onClick={() => openForm(row)}>Edit</button>{canDelete && !(page === "education-structure" && row.active === false) && <button className="table-action danger" onClick={() => remove(row)}>{page === "education-structure" ? "Deactivate" : "Delete"}</button>}</>}</td>}</tr>)}
          {!filtered.length && <tr><td colSpan={item.fields.length + (canEdit ? 1 : 0)}><EmptyState message={search ? "No records match your search." : isStudent ? "Nothing to show here yet." : "No records yet. Add one to get started."} /></td></tr>}</tbody>
        </table></div>
      </section>
      {page === "students" && isSchoolAdmin && <p className="privacy-note"><ShieldCheck size={16} />Student records in this demo are fictional. Use synthetic data only.</p>}
      {modal && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(false); }}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><div className="eyebrow">SCHOOL RECORD</div><h2 id="modal-title">{editing ? `Edit ${singularTitle}` : `Add ${singularTitle}`}</h2></div><button className="icon-button" aria-label="Close dialog" onClick={() => setModal(false)}><X size={19} /></button></div>
          <form onSubmit={save} className="record-form">{item.fields.map(([key, label]) => {
            const required = ["id", "name", "title", "email", "grade", "educationStage", "type", "score", "subject", "dueDate", "classId", "studentId"].includes(key);
            const change = (event) => {
              const nextValue = event.target.value;
              if (key === "classId" && page === "students") {
                const schoolClass = availableClasses.find((record) => record.id === nextValue);
                setForm({ ...form, classId: nextValue, className: schoolClass?.name || "", grade: schoolClass?.grade || "", educationStage: schoolClass?.educationStage || "" });
              } else if (key === "classId" && page === "assignments") {
                const schoolClass = availableClasses.find((record) => record.id === nextValue);
                setForm({ ...form, classId: nextValue, className: schoolClass?.name || "" });
              } else if (key === "studentId" && ["results", "research"].includes(page)) {
                const student = availableStudents.find((record) => record.id === nextValue);
                setForm({ ...form, studentId: nextValue, student: student?.name || "", classId: student?.classId || "", program: student?.program || "" });
              } else setForm({ ...form, [key]: nextValue });
            };
            let control;
            if (key === "educationStage") {
              control = <select required value={form[key] || ""} onChange={change}><option value="">Choose a stage</option>{data.educationLevels.map((stage) => <option key={stage.id} value={stage.id} disabled={stage.active === false && stage.id !== form[key]}>{stage.name}{stage.active === false ? " (inactive)" : ""}</option>)}</select>;
            } else if (key === "type" && page === "schools") {
              control = <select required value={form[key] || ""} onChange={change}><option value="">Choose a school type</option>{["Early years center", "K–12 school", "TVET institution", "College", "University", "Research institution", "Training center", "Other"].map((type) => <option key={type}>{type}</option>)}</select>;
            } else if (key === "classId" && ["students", "assignments"].includes(page)) {
              control = <select required value={form[key] || ""} onChange={change}><option value="">Choose a class / cohort</option>{availableClasses.map((schoolClass) => <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name} · {schoolClass.grade}</option>)}</select>;
            } else if (key === "studentId" && ["results", "research"].includes(page)) {
              control = <select required value={form[key] || ""} onChange={change}><option value="">Choose a student</option>{availableStudents.map((student) => <option key={student.id} value={student.id}>{student.name} · {student.id}</option>)}</select>;
            } else if (key === "active" && page === "education-structure") {
              control = <select value={String(form[key] ?? true)} onChange={change}><option value="true">Active</option><option value="false">Inactive</option></select>;
            } else if (key === "levels" && page === "education-structure") {
              control = <textarea required value={form[key] || ""} placeholder="Separate each level with a comma" onChange={change} />;
            } else {
              control = <input required={required} readOnly={(key === "id" && Boolean(editing)) || (key === "classId" && ["results", "research"].includes(page))} type={key === "dueDate" || key === "date" || key === "enrollmentDate" ? "date" : "text"} inputMode={key === "email" ? "email" : undefined} autoComplete={key === "email" ? "email" : undefined} placeholder={key === "grade" ? "e.g. KG 0, Grade 6, TVET Level II, Year 2" : undefined} value={form[key] || ""} onChange={change} />;
            }
            return <label key={key}>{label}{control}</label>;
          })}
            <label className="full-field">Attach a PDF or Word file (optional)<input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} /></label>
            {(selectedFile || editing?.documentIds?.length > 0) && <div className="upload-preview full-field"><FileUp size={17} /><span><strong>{selectedFile?.name || `${editing.documentIds.length} attachment(s) already linked`}</strong><small>Manage and download attachments from Documents.</small></span></div>}
            <div className="form-actions"><button type="button" className="button button-light" onClick={() => { setModal(false); setSelectedFile(null); }}>Cancel</button><button type="submit" className="button button-primary"><Check size={16} />Save changes</button></div>
          </form></section></div>}
    </>
  );
}

function Reports({ data }) {
  const [message, setMessage] = useState("");
  const grades = (data.educationLevels || []).map((stage) => ({
    name: stage.name,
    students: data.students.filter((student) => student.educationStage === stage.id).length,
  }));
  const exportReport = async () => {
    try {
      await downloadPdf({ title: "School overview report", subtitle: `${data.school?.name || "School"} · ${new Date().toLocaleDateString()}`, headers: ["Education stage", "Student count"], rows: grades.map((stage) => [stage.name, stage.students]), filename: `school-report-${data.school?.id || "report"}.pdf` });
    } catch (error) {
      setMessage(error.message || "PDF export failed.");
    }
  };
  return <><div className="page-heading"><div><div className="eyebrow">SCHOOL INSIGHTS</div><h1>Reports</h1><p>A useful overview of school activity across grade levels.</p></div><button className="button button-light" onClick={exportReport}><Download size={15} />Export PDF</button></div>
    {message && <div className="inline-notice" role="status">{message}</div>}
    <section className="stats-grid"><Stat label="Enrolled students" value={data.students.length} note="Across all grade bands" icon={Users} tone="blue" /><Stat label="Teachers" value={data.teachers.length} note="Teaching team" icon={GraduationCap} tone="green" /><Stat label="Classes" value={data.classes.length} note="Active groups" icon={BookOpen} tone="orange" /><Stat label="Assessments" value={data.results.length} note="Demo records" icon={Activity} tone="purple" /></section>
    <section className="dashboard-grid"><article className="panel chart-panel"><div className="panel-heading"><div><h2>Enrollment by education stage</h2><p>Current school · based on active student records</p></div></div><div className="chart-area"><ResponsiveContainer width="100%" height="100%"><BarChart data={grades}><CartesianGrid stroke="#edf0f5" vertical={false} /><XAxis dataKey="name" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="students" fill="#5378e8" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></article><article className="panel"><div className="panel-heading"><div><h2>Education-stage catalog</h2><p>Configurable pathways supported</p></div></div><div className="band-list">{(data.educationLevels || []).map((stage, index) => <div className="band-row" key={stage.id}><i className={`stage-color-${index % 4}`} /><div><strong>{stage.name}</strong><span>{stage.levels.join(", ")}</span></div><ArrowRight size={16} /></div>)}</div></article></section>
  </>;
}

function Stat({ label, value, note, icon: Icon, tone }) {
  return <article className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19} /></div><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><span className="stat-note">{note}</span><span className={`stat-spark ${tone}`} aria-hidden="true">⌁</span></article>;
}

function SettingsPage() {
  const { data, schoolId, updateCollection, resetDemo } = useApp();
  const [message, setMessage] = useState("");
  const [schoolName, setSchoolName] = useState(data.school?.name || "");
  const [year, setYear] = useState(data.school?.academicYear || "");
  const save = (event) => {
    event.preventDefault();
    updateCollection("schools", (schools) => schools.map((school) =>
      school.id === schoolId ? { ...school, name: schoolName, academicYear: year } : school
    ));
    setMessage("School settings saved.");
    window.setTimeout(() => setMessage(""), 3000);
  };
  return <><div className="page-heading"><div><div className="eyebrow">CONFIGURATION</div><h1>School settings</h1><p>Personalize this local demonstration for your school.</p></div></div>{message && <div className="inline-notice"><Check size={17} />{message}</div>}
    <section className="panel settings-panel"><form onSubmit={save} className="settings-form"><label>School name<input value={schoolName} onChange={(event) => setSchoolName(event.target.value)} required /></label><label>Academic year<input value={year} onChange={(event) => setYear(event.target.value)} required /></label><label>Current term<input value={data.school?.term || ""} onChange={(event) => updateCollection("schools", (schools) => schools.map((school) => school.id === schoolId ? { ...school, term: event.target.value } : school))} /></label><button className="button button-primary" type="submit"><Check size={16} />Save settings</button></form></section>
    <section className="panel reset-panel"><div><h2>Reset demo data</h2><p>Restore the original fictional students, classes, and school records on this browser.</p></div><button className="button button-danger" onClick={() => { if (window.confirm("Reset all demo records to the original sample data?")) { resetDemo(); setSchoolName("Horizon International School"); setYear("2025 / 2026"); setMessage("Demo data restored."); } }}>Reset demo data</button></section>
    <div className="privacy-note"><ShieldCheck size={16} />This is a browser-only demo. Do not store real student records here.</div>
  </>;
}

function ModuleRoute() {
  const { role, page } = useParams();
  const { user, viewRole } = useApp();
  if (!navigation[role]?.some(([key]) => key === page)) return <Navigate to={roleHome[viewRole] || roleHome[user.role]} replace />;
  const content = page === "dashboard"
    ? role === "super-admin" ? <SuperAdminDashboard /> : <Dashboard role={role} />
    : page === "calendar" ? <CalendarPage role={role} />
    : page === "documents" ? <DocumentsPage role={role} />
    : page === "timetable" ? <TimetablePage role={role} />
    : page === "assignments" ? <AssignmentsPage role={role} />
    : <DataPage page={page} role={role} />;
  return <AppFrame page={page}>{content}</AppFrame>;
}

export default function App() {
  const { user, viewRole } = useApp();
  return <Routes><Route path="/login" element={user ? <Navigate to={roleHome[viewRole] || roleHome[user.role]} replace /> : <Login />} /><Route path="/:role/:page" element={<ProtectedRoute><ModuleRoute /></ProtectedRoute>} /><Route path="/" element={<Navigate to={user ? roleHome[viewRole] || roleHome[user.role] : "/login"} replace />} /><Route path="*" element={<Navigate to={user ? roleHome[viewRole] || roleHome[user.role] : "/login"} replace />} /></Routes>;
}
