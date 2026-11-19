import { useMemo, useState } from "react";
import { CalendarDays, Download, FileUp, Plus, Trash2, X } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { downloadPdf } from "../utils/pdf.js";
import { saveStoredFile } from "../utils/fileStorage.js";
import { validateUpload } from "../utils/fileUploads.js";
import { hasScheduleConflict, validateSchoolSlot, WEEK_DAYS } from "../utils/schedule.js";

const days = WEEK_DAYS;
const startMinute = 8 * 60;
const endMinute = 17 * 60;
const slots = Array.from({ length: (endMinute - startMinute) / 30 }, (_, index) => {
  const minutes = startMinute + index * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});
const durations = [30, 60, 90, 120];

function minutes(time) {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

function timeFromMinutes(value) {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

export default function TimetablePage({ role }) {
  const { data, user, schoolId, updateCollection } = useApp();
  const [editing, setEditing] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setFormValues] = useState({});
  const teacher = data.teachers.find((item) => item.id === user?.teacherId);
  const canEdit = ["director", "super-admin", "teacher"].includes(role);
  const availableClasses = data.classes.filter((item) => role !== "teacher" || item.teacher === teacher?.name);
  const availableTeachers = role === "teacher" ? data.teachers.filter((item) => item.id === user?.teacherId) : data.teachers;
  const visibleSessions = data.timetable.filter((session) => {
    if (role === "student") return session.className === data.students.find((item) => item.id === user?.studentId)?.className;
    if (role === "teacher") return session.teacher === teacher?.name;
    return true;
  }).map((session) => {
    const startTime = session.startTime || session.time || "08:00";
    const schoolClass = data.classes.find((item) => item.name === session.className);
    return {
      ...session,
      classId: session.classId || schoolClass?.id || "",
      startTime,
      endTime: session.endTime || timeFromMinutes(minutes(startTime) + 60),
    };
  });
  const sortedSessions = useMemo(() => visibleSessions.sort((left, right) =>
    days.indexOf(left.day) - days.indexOf(right.day) || left.startTime.localeCompare(right.startTime)
  ), [visibleSessions]);

  const openForm = (day = "Monday", startTime = "08:00", session = null) => {
    setEditing(session);
    setFile(null);
    setMessage("");
    const defaultClass = session
      ? data.classes.find((item) => item.id === session.classId || item.name === session.className)
      : availableClasses[0];
    const defaultTeacher = role === "teacher"
      ? teacher
      : data.teachers.find((item) => item.name === (session?.teacher || defaultClass?.teacher)) || availableTeachers[0];
    const defaultSubject = data.subjects.find((item) => item.name === session?.subject && item.teacher === defaultTeacher?.name) ||
      data.subjects.find((item) => item.teacher === defaultTeacher?.name) || data.subjects[0];
    setFormValues(session ? {
      ...session,
      classId: defaultClass?.id || "",
      subjectId: data.subjects.find((item) => item.name === session.subject)?.id || defaultSubject?.id || "",
      teacherId: defaultTeacher?.id || "",
      duration: minutes(session.endTime) - minutes(session.startTime),
    } : {
      day,
      startTime,
      duration: 60,
      classId: defaultClass?.id || "",
      subjectId: defaultSubject?.id || "",
      teacherId: defaultTeacher?.id || "",
    });
    setDialogOpen(true);
  };
  const selectedClass = data.classes.find((item) => item.id === form.classId);
  const selectedTeacher = data.teachers.find((item) => item.id === form.teacherId);
  const subjectOptions = role === "teacher" && teacher
    ? data.subjects.filter((item) => item.teacher === teacher.name)
    : data.subjects;
  const subject = data.subjects.find((item) => item.id === form.subjectId);

  const save = async (event) => {
    event.preventDefault();
    const endTime = timeFromMinutes(minutes(form.startTime) + Number(form.duration));
    const slotError = validateSchoolSlot(form.day, form.startTime, endTime);
    if (slotError) { setMessage(slotError); return; }
    if (!selectedClass || !subject || !selectedTeacher) { setMessage("Choose a valid class, subject, and teacher."); return; }
    if (role === "teacher" && selectedClass.teacher !== teacher?.name) {
      setMessage("You can only schedule your assigned classes."); return;
    }
    const overlaps = hasScheduleConflict(visibleSessions, {
      id: editing?.id,
      day: form.day,
      startTime: form.startTime,
      endTime,
      classId: selectedClass.id,
      teacher: selectedTeacher.name,
    });
    if (overlaps) { setMessage("This class or teacher already has a session during that time."); return; }
    if (file) {
      const uploadError = validateUpload(file);
      if (uploadError) { setMessage(uploadError); return; }
    }
    const id = editing?.id || `TT-${Date.now()}`;
    const document = file ? {
      id: `DOC-${Date.now()}`,
      fileName: file.name,
      fileType: file.name.split(".").pop().toLowerCase(),
      fileSize: file.size,
      relatedType: "timetable",
      relatedId: id,
      relatedName: `${subject.name} · ${selectedClass.name}`,
      uploadedBy: user.name,
      uploadedAt: new Date().toISOString(),
      classId: selectedClass.id,
      schoolId,
    } : null;
    const session = {
      ...form,
      duration: Number(form.duration),
      endTime,
      subject: subject.name,
      className: selectedClass.name,
      teacher: selectedTeacher.name,
      ...(document ? { documentIds: [...(editing?.documentIds || []), document.id] } : {}),
      id,
      schoolId: editing?.schoolId || schoolId,
    };
    setBusy(true);
    try {
      if (document) await saveStoredFile(document.id, file);
      if (document) updateCollection("documents", (documents) => [document, ...documents]);
      updateCollection("timetable", (current) => editing
        ? current.map((item) => item.id === editing.id ? { ...item, ...session } : item)
        : [session, ...current]);
      setDialogOpen(false);
      setMessage(editing ? "Timetable session updated." : "Timetable session added.");
    } catch (error) {
      setMessage(error.message || "The timetable session could not be saved.");
    } finally {
      setBusy(false);
    }
  };

  const remove = (session) => {
    if (!window.confirm(`Delete "${session.subject}" from the timetable?`)) return;
    updateCollection("timetable", (current) => current.filter((item) => item.id !== session.id));
    setMessage("Timetable session deleted.");
  };

  const exportSchedule = async () => {
    try {
      await downloadPdf({
        title: "Weekly timetable",
        subtitle: `${data.school?.name || "School"} · Monday–Friday · 08:00–17:00`,
        headers: ["Day", "Time", "Class / cohort", "Subject", "Teacher"],
        rows: sortedSessions.map((session) => [session.day, `${session.startTime}–${session.endTime}`, session.className, session.subject, session.teacher]),
        filename: `timetable-${schoolId}.pdf`,
      });
    } catch (error) {
      setMessage(error.message || "PDF export failed.");
    }
  };

  const sessionCards = sortedSessions.map((session) => {
    const slotIndex = slots.indexOf(session.startTime);
    if (slotIndex < 0) return null;
    const duration = Math.max(1, Math.ceil((minutes(session.endTime) - minutes(session.startTime)) / 30));
    return <button key={session.id} className={`week-session ${role === "student" ? "session-readonly" : ""}`} style={{ gridColumn: days.indexOf(session.day) + 2, gridRow: `${slotIndex + 2} / span ${Math.min(duration, slots.length - slotIndex)}` }} title={`${session.subject}: ${session.className}, ${session.startTime}–${session.endTime}`} onClick={() => canEdit && openForm(session.day, session.startTime, session)}>
      <strong>{session.subject}</strong><span>{session.className}</span><small>{session.startTime}–{session.endTime}</small>{role !== "student" && <i>{session.teacher}</i>}
    </button>;
  });

  return <>
    <div className="page-heading">
      <div><div className="eyebrow">WEEKLY SCHEDULING</div><h1>{role === "student" ? "My timetable" : "Timetable"}</h1><p>Plan the complete school day, Monday to Friday, from 08:00 to 17:00.</p></div>
      <div className="heading-actions"><button className="button button-light" onClick={exportSchedule}><Download size={15} />Export PDF</button>{canEdit && <button className="button button-primary" onClick={() => openForm()}><Plus size={16} />Add session</button>}</div>
    </div>
    {message && <div className="inline-notice" role="status">{message}<button aria-label="Dismiss" onClick={() => setMessage("")}><X size={15} /></button></div>}
    <div className="schedule-summary"><div><CalendarDays size={18} /><span><strong>{sortedSessions.length}</strong> scheduled sessions</span></div><span className="schedule-weekdays">Monday – Friday</span><span className="schedule-hours">School day · 08:00 – 17:00</span></div>
    <section className="panel timetable-panel"><div className="week-grid-scroll"><div className="week-grid" style={{ gridTemplateColumns: "76px repeat(5, minmax(140px, 1fr))", gridTemplateRows: `48px repeat(${slots.length}, 44px)` }}>
      <div className="week-corner" style={{ gridColumn: 1, gridRow: 1 }}>TIME</div>
      {days.map((day, index) => <div className="week-day-heading" key={day} style={{ gridColumn: index + 2, gridRow: 1 }}>{day}</div>)}
      {slots.map((time, index) => <div className="week-time-label" key={time} style={{ gridColumn: 1, gridRow: index + 2 }}>{time.endsWith(":00") ? time : ""}</div>)}
      {days.flatMap((day, dayIndex) => slots.map((time, slotIndex) => <button key={`${day}-${time}`} className="week-open-slot" aria-label={`Add ${day} ${time} session`} style={{ gridColumn: dayIndex + 2, gridRow: slotIndex + 2 }} onClick={() => canEdit && openForm(day, time)} disabled={!canEdit} />))}
      {sessionCards}
    </div></div></section>
    <p className="schedule-note">Click an open time slot to schedule a lesson. Sessions require a class and teacher, and overlapping assignments are blocked.</p>
    {dialogOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setDialogOpen(false); }}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="timetable-dialog-title">
        <div className="modal-heading"><div><div className="eyebrow">WEEKLY SCHEDULE</div><h2 id="timetable-dialog-title">{editing ? "Edit session" : "Add timetable session"}</h2></div><button className="icon-button" aria-label="Close dialog" disabled={busy} onClick={() => setDialogOpen(false)}><X size={18} /></button></div>
        <form className="record-form" onSubmit={save}>
          <label>Weekday<select value={form.day || "Monday"} onChange={(event) => setFormValues({ ...form, day: event.target.value })}>{days.map((day) => <option key={day}>{day}</option>)}</select></label>
          <label>Class / cohort<select required value={form.classId || ""} onChange={(event) => {
            const nextClass = data.classes.find((item) => item.id === event.target.value);
            const nextTeacher = data.teachers.find((item) => item.name === nextClass?.teacher);
            const nextSubject = data.subjects.find((item) => item.teacher === nextClass?.teacher);
            setFormValues({ ...form, classId: event.target.value, teacherId: role === "teacher" ? teacher?.id || "" : nextTeacher?.id || form.teacherId, subjectId: nextSubject?.id || form.subjectId });
          }}><option value="">Choose a class</option>{availableClasses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label>Subject / course<select required value={form.subjectId || ""} onChange={(event) => setFormValues({ ...form, subjectId: event.target.value })}><option value="">Choose a subject</option>{subjectOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label>Teacher<select required disabled={role === "teacher"} value={form.teacherId || ""} onChange={(event) => setFormValues({ ...form, teacherId: event.target.value })}><option value="">Choose a teacher</option>{availableTeachers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label>Start time<input type="time" min="08:00" max="16:30" step="1800" value={form.startTime || "08:00"} onChange={(event) => setFormValues({ ...form, startTime: event.target.value })} required /></label>
          <label>Duration<select value={form.duration || 60} onChange={(event) => setFormValues({ ...form, duration: Number(event.target.value) })}>{durations.map((value) => <option key={value} value={value}>{value < 60 ? `${value} minutes` : `${value / 60} hour${value > 60 ? "s" : ""}`}</option>)}</select></label>
          {message && <p className="form-error full-field" role="alert">{message}</p>}
          <label className="full-field">Attachment (optional)<input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => setFile(event.target.files?.[0] || null)} /></label>
          {file && <div className="upload-preview full-field"><FileUp size={17} /><span><strong>{file.name}</strong><small>Attached to this session</small></span></div>}
          <div className="form-actions"><div>{editing && <button type="button" className="button button-danger" onClick={() => { setDialogOpen(false); remove(editing); }}>Delete</button>}</div><button type="button" className="button button-light" disabled={busy} onClick={() => setDialogOpen(false)}>Cancel</button><button type="submit" className="button button-primary" disabled={busy}><CalendarDays size={15} />{busy ? "Saving…" : "Save session"}</button></div>
        </form>
      </section>
    </div>}
  </>;
}
