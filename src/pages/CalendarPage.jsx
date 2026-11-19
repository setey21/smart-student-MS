import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Download, FileUp, Plus, Trash2, X } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { downloadPdf } from "../utils/pdf.js";
import { saveStoredFile } from "../utils/fileStorage.js";
import { validateUpload } from "../utils/fileUploads.js";

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const eventTypes = ["Academic", "School event", "Examination", "Holiday", "Activity", "Meeting", "Deadline"];

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function buildMonthDays(month) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const firstCell = new Date(month.getFullYear(), month.getMonth(), 1 - offset);
  return Array.from({ length: 42 }, (_, index) => new Date(firstCell.getFullYear(), firstCell.getMonth(), firstCell.getDate() + index));
}

function eventVisible(event, role, student) {
  if (role !== "student") return true;
  const audience = String(event.audience || "").toLowerCase();
  return ["all", "all students", "students"].includes(audience) ||
    [student?.grade, student?.level, student?.educationStage].some((value) => value && audience.includes(String(value).toLowerCase()));
}

export default function CalendarPage({ role }) {
  const { data, user, schoolId, updateCollection } = useApp();
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(dateKey(today));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const canEdit = ["director", "super-admin", "teacher"].includes(role);
  const student = data.students.find((item) => item.id === user?.studentId);
  const events = data.calendarEvents
    .filter((event) => eventVisible(event, role, student))
    .sort((left, right) => left.date.localeCompare(right.date) || (left.startTime || "").localeCompare(right.startTime || ""));
  const selectedEvents = events.filter((event) => event.date === selectedDate);
  const monthDays = useMemo(() => buildMonthDays(month), [month]);

  const openForm = (event = null) => {
    setEditing(event);
    setForm(event ? { ...event } : {
      title: "",
      date: selectedDate,
      type: "Academic",
      audience: role === "student" ? "My class" : "All students",
      description: "",
      allDay: false,
      startTime: "09:00",
      endTime: "10:00",
    });
    setFile(null);
    setMessage("");
    setDialogOpen(true);
  };

  const saveEvent = async (submitEvent) => {
    submitEvent.preventDefault();
    if (!form.title?.trim() || !form.date) { setMessage("Enter an event title and date."); return; }
    if (!form.allDay && (!form.startTime || !form.endTime || form.endTime <= form.startTime)) {
      setMessage("The end time must be later than the start time."); return;
    }
    let document;
    if (file) {
      const uploadError = validateUpload(file);
      if (uploadError) { setMessage(uploadError); return; }
      document = {
        id: `DOC-${Date.now()}`,
        fileName: file.name,
        fileType: file.name.split(".").pop().toLowerCase(),
        fileSize: file.size,
        relatedType: "calendarEvents",
        relatedId: editing?.id || `EV-${Date.now()}`,
        relatedName: form.title.trim(),
        uploadedBy: user.name,
        uploadedAt: new Date().toISOString(),
        schoolId,
      };
    }
    const id = editing?.id || document?.relatedId || `EV-${Date.now()}`;
    const value = {
      ...form,
      title: form.title.trim(),
      description: form.description?.trim() || "",
      allDay: Boolean(form.allDay),
      ...(form.allDay ? { startTime: "", endTime: "" } : {}),
      ...(document ? { documentIds: [...(editing?.documentIds || []), document.id] } : {}),
      id,
      schoolId: editing?.schoolId || schoolId,
      createdBy: editing?.createdBy || user.name,
    };
    setBusy(true);
    try {
      if (file && document) await saveStoredFile(document.id, file);
      if (document) updateCollection("documents", (documents) => [document, ...documents]);
      updateCollection("calendarEvents", (current) => editing
        ? current.map((item) => item.id === editing.id ? { ...item, ...value } : item)
        : [value, ...current]);
      setSelectedDate(value.date);
      setMonth(new Date(`${value.date}T00:00:00`));
      setDialogOpen(false);
      setMessage(editing ? "Calendar event updated." : "Calendar event scheduled.");
    } catch (error) {
      setMessage(error.message || "The calendar event could not be saved.");
    } finally {
      setBusy(false);
    }
  };

  const removeEvent = (event) => {
    if (!window.confirm(`Delete "${event.title}" from the calendar?`)) return;
    updateCollection("calendarEvents", (current) => current.filter((item) => item.id !== event.id));
    setMessage("Calendar event deleted.");
  };

  const exportCalendar = async () => {
    try {
      await downloadPdf({
        title: "School calendar",
        subtitle: `${data.school?.name || "School"} · ${month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}`,
        headers: ["Date", "Time", "Event", "Type", "Audience"],
        rows: events.filter((event) => event.date.startsWith(`${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`))
          .map((event) => [event.date, event.allDay ? "All day" : `${event.startTime}–${event.endTime}`, event.title, event.type, event.audience]),
        filename: `calendar-${schoolId}-${dateKey(month)}.pdf`,
      });
    } catch (error) {
      setMessage(error.message || "PDF export failed.");
    }
  };

  return <>
    <div className="page-heading">
      <div><div className="eyebrow">SCHOOL PLANNING</div><h1>Calendar</h1><p>Schedule school events, activities, examinations, and important dates.</p></div>
      <div className="heading-actions"><button className="button button-light" onClick={exportCalendar}><Download size={15} />Export PDF</button>{canEdit && <button className="button button-primary" onClick={() => openForm()}><Plus size={16} />Schedule event</button>}</div>
    </div>
    {message && <div className="inline-notice" role="status">{message}<button aria-label="Dismiss" onClick={() => setMessage("")}><X size={15} /></button></div>}
    <div className="calendar-layout">
      <section className="panel calendar-panel">
        <div className="calendar-toolbar">
          <div className="calendar-month"><CalendarDays size={18} /><h2>{month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h2></div>
          <div className="calendar-controls"><button className="icon-button" aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={17} /></button><button className="button button-light" onClick={() => { setMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDate(dateKey(today)); }}>Today</button><button className="icon-button" aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={17} /></button></div>
        </div>
        <div className="calendar-grid" role="grid" aria-label="Month calendar">
          {weekDays.map((day) => <div className="calendar-weekday" role="columnheader" key={day}>{day.slice(0, 3)}</div>)}
          {monthDays.map((day) => {
            const key = dateKey(day);
            const dayEvents = events.filter((event) => event.date === key);
            const outsideMonth = day.getMonth() !== month.getMonth();
            return <button key={key} role="gridcell" aria-label={`${day.toLocaleDateString()}, ${dayEvents.length} events`} aria-pressed={selectedDate === key} className={`calendar-day ${outsideMonth ? "outside-month" : ""} ${selectedDate === key ? "selected-day" : ""} ${key === dateKey(today) ? "today-day" : ""}`} onClick={() => setSelectedDate(key)}>
              <span className="calendar-day-number">{day.getDate()}</span>
              <span className="calendar-event-dots">{dayEvents.slice(0, 2).map((event) => <i key={event.id} className={`event-dot ${event.type.toLowerCase().replace(/\s+/g, "-")}`} />)}{dayEvents.length > 2 && <small>+{dayEvents.length - 2}</small>}</span>
              <span className="calendar-day-events">{dayEvents.slice(0, 2).map((event) => <small key={event.id}>{event.title}</small>)}</span>
            </button>;
          })}
        </div>
      </section>
      <aside className="panel calendar-agenda">
        <div className="panel-heading"><div><h2>{new Date(`${selectedDate}T00:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</h2><p>{selectedEvents.length} scheduled {selectedEvents.length === 1 ? "event" : "events"}</p></div>{canEdit && <button className="icon-button" aria-label="Add event on selected date" onClick={() => openForm()}><Plus size={17} /></button>}</div>
        <div className="selected-events">{selectedEvents.map((event) => <article className="calendar-event-card" key={event.id}>
          <i className={`event-type-mark ${event.type.toLowerCase().replace(/\s+/g, "-")}`} />
          <div className="calendar-event-copy"><span>{event.allDay ? "All day" : `${event.startTime} – ${event.endTime}`} · {event.type}</span><strong>{event.title}</strong><p>{event.description || event.audience}</p><small>{event.audience}</small></div>
          {canEdit && <div className="event-actions"><button className="table-action" onClick={() => openForm(event)}>Edit</button><button className="table-action danger" aria-label={`Delete ${event.title}`} onClick={() => removeEvent(event)}><Trash2 size={13} /></button></div>}
        </article>)}{!selectedEvents.length && <div className="empty-documents"><CalendarDays size={23} /><strong>No events scheduled</strong><span>Select another date or add a new event.</span></div>}</div>
        {canEdit && <button className="button button-light calendar-add-button" onClick={() => openForm()}><Plus size={15} />Add an event</button>}
      </aside>
    </div>
    {dialogOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setDialogOpen(false); }}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="calendar-dialog-title">
        <div className="modal-heading"><div><div className="eyebrow">CALENDAR EVENT</div><h2 id="calendar-dialog-title">{editing ? "Edit event" : "Schedule an event"}</h2></div><button className="icon-button" aria-label="Close dialog" disabled={busy} onClick={() => setDialogOpen(false)}><X size={18} /></button></div>
        <form className="record-form" onSubmit={saveEvent}>
          <label className="full-field">Event title<input value={form.title || ""} onChange={(event) => setForm({ ...form, title: event.target.value })} required maxLength={100} /></label>
          <label>Date<input type="date" value={form.date || ""} onChange={(event) => setForm({ ...form, date: event.target.value })} required /></label>
          <label>Event type<select value={form.type || "Academic"} onChange={(event) => setForm({ ...form, type: event.target.value })}>{eventTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
          <label>Audience<input value={form.audience || ""} onChange={(event) => setForm({ ...form, audience: event.target.value })} placeholder="All students, Grade 7, Staff…" required /></label>
          <label className="all-day-control"><input type="checkbox" checked={Boolean(form.allDay)} onChange={(event) => setForm({ ...form, allDay: event.target.checked })} />All-day event</label>
          {!form.allDay && <><label>Start time<input type="time" value={form.startTime || ""} onChange={(event) => setForm({ ...form, startTime: event.target.value })} required /></label><label>End time<input type="time" value={form.endTime || ""} onChange={(event) => setForm({ ...form, endTime: event.target.value })} required /></label></>}
          <label className="full-field">Description<textarea value={form.description || ""} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} /></label>
          <label className="full-field">Attachment (optional)<input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => setFile(event.target.files?.[0] || null)} /></label>
          {file && <div className="upload-preview full-field"><FileUp size={17} /><span><strong>{file.name}</strong><small>Attached to this event</small></span></div>}
          {message && <p className="form-error full-field" role="alert">{message}</p>}
          <div className="form-actions"><button type="button" className="button button-light" disabled={busy} onClick={() => setDialogOpen(false)}>Cancel</button><button type="submit" className="button button-primary" disabled={busy}><CalendarDays size={15} />{busy ? "Saving…" : "Save event"}</button></div>
        </form>
      </section>
    </div>}
  </>;
}
