import { useMemo, useState } from "react";
import { BookOpen, Check, Clock3, Download, FileText, FileUp, Pencil, Send, ShieldCheck, Upload, X } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { downloadAssignmentPdf } from "../utils/pdf.js";
import { downloadStoredFile, saveStoredFile } from "../utils/fileStorage.js";
import { validateUpload } from "../utils/fileUploads.js";

function prettyDate(value) {
  if (!value) return "No due date";
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function isLate(dueDate) {
  return Boolean(dueDate && new Date(`${dueDate}T23:59:59`).getTime() < Date.now());
}

export default function AssignmentsPage({ role }) {
  const { data, user, schoolId, updateCollection } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [attachment, setAttachment] = useState(null);
  const [submissionFiles, setSubmissionFiles] = useState({});
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const teacher = data.teachers.find((item) => item.id === user?.teacherId) || (user?.role === "director" ? data.teachers[0] : null);
  const activeStudent = data.students.find((item) => item.id === user?.studentId) || (user?.role === "director" && role === "student" ? data.students[0] : null);
  const teacherClasses = data.classes.filter((item) => role !== "teacher" || item.teacher === teacher?.name);
  const availableClasses = teacherClasses;
  const assignments = data.assignments
    .filter((item) => role === "student"
      ? item.classId === activeStudent?.classId
      : role === "teacher"
        ? teacherClasses.some((schoolClass) => schoolClass.id === item.classId) && (!item.teacherId || item.teacherId === teacher?.id)
        : true)
    .sort((left, right) => (left.dueDate || "").localeCompare(right.dueDate || ""));
  const visibleAssignmentIds = useMemo(() => new Set(assignments.map((item) => item.id)), [assignments]);
  const submissions = data.assignmentSubmissions.filter((item) => visibleAssignmentIds.has(item.assignmentId));
  const mySubmissions = new Map(submissions.filter((item) => item.studentId === activeStudent?.id).map((item) => [item.assignmentId, item]));
  const attachmentsById = new Map(data.documents.map((item) => [item.id, item]));
  const canManage = role === "director" || role === "super-admin" || role === "teacher";

  const openForm = (assignment = null) => {
    setEditing(assignment);
    setForm(assignment ? { ...assignment } : {
      title: "",
      subject: "",
      classId: availableClasses[0]?.id || "",
      dueDate: "",
      description: "",
      furtherExplanation: "",
    });
    setAttachment(null);
    setError("");
    setMessage("");
    setDialogOpen(true);
  };

  const saveAssignment = async (event) => {
    event.preventDefault();
    const schoolClass = availableClasses.find((item) => item.id === form.classId);
    if (!form.title.trim() || !form.subject.trim() || !schoolClass || !form.dueDate) {
      setError("Enter an assignment title, subject, class, and due date.");
      return;
    }
    if (role === "teacher" && !teacherClasses.some((item) => item.id === schoolClass.id)) {
      setError("You can only create assignments for your assigned classes.");
      return;
    }
    if (attachment) {
      const uploadError = validateUpload(attachment);
      if (uploadError) {
        setError(uploadError);
        return;
      }
    }
    const id = editing?.id || `AS-${Date.now()}`;
    const assignment = {
      ...editing,
      ...form,
      title: form.title.trim(),
      subject: form.subject.trim(),
      description: form.description.trim(),
      furtherExplanation: form.furtherExplanation.trim(),
      className: schoolClass.name,
      status: editing?.status || "Not started",
      id,
      schoolId: editing?.schoolId || schoolId,
      teacherId: role === "teacher" ? teacher?.id : editing?.teacherId || "",
    };
    let document;
    if (attachment) {
      document = {
        id: `DOC-${Date.now()}`,
        fileName: attachment.name,
        fileType: attachment.name.split(".").pop().toLowerCase(),
        fileSize: attachment.size,
        relatedType: "assignments",
        relatedId: id,
        relatedName: assignment.title,
        classId: schoolClass.id,
        uploadedBy: user.name,
        uploadedAt: new Date().toISOString(),
        schoolId,
      };
      setBusyId(id);
      try {
        await saveStoredFile(document.id, attachment);
      } catch (uploadError) {
        setError(uploadError.message || "The assignment file could not be uploaded.");
        setBusyId("");
        return;
      }
      assignment.documentIds = [...(editing?.documentIds || []), document.id];
    }
    updateCollection("assignments", (current) => editing
      ? current.map((item) => item.id === editing.id ? assignment : item)
      : [assignment, ...current]);
    if (document) updateCollection("documents", (current) => [document, ...current]);
    setBusyId("");
    setDialogOpen(false);
    setMessage(editing ? "Assignment instructions updated." : "Assignment shared with the class.");
  };

  const submitWork = async (assignment) => {
    const file = submissionFiles[assignment.id];
    const uploadError = validateUpload(file);
    if (uploadError) {
      setError(uploadError);
      setMessage("");
      return;
    }
    const student = activeStudent;
    if (!student) {
      setError("Your student profile could not be found. Please contact the school administrator.");
      return;
    }
    const submissionId = `SUB-${assignment.id}-${student.id}`;
    const submittedAt = new Date().toISOString();
    const submission = {
      id: submissionId,
      assignmentId: assignment.id,
      studentId: student.id,
      studentName: student.name,
      classId: student.classId,
      fileName: file.name,
      fileType: file.name.split(".").pop().toLowerCase(),
      fileSize: file.size,
      submittedAt,
      status: isLate(assignment.dueDate) ? "Late" : "Submitted",
      schoolId,
    };
    setBusyId(assignment.id);
    setError("");
    setMessage("");
    try {
      await saveStoredFile(submissionId, file);
      updateCollection("assignmentSubmissions", (current) => {
        const existing = current.some((item) => item.id === submissionId);
        return existing
          ? current.map((item) => item.id === submissionId ? submission : item)
          : [submission, ...current];
      });
      setSubmissionFiles((current) => ({ ...current, [assignment.id]: null }));
      setMessage(`Your work for “${assignment.title}” was submitted.`);
    } catch (submitError) {
      setError(submitError.message || "Your work could not be submitted.");
    } finally {
      setBusyId("");
    }
  };

  const downloadFile = async (id, fileName) => {
    setError("");
    try {
      await downloadStoredFile(id, fileName);
    } catch (downloadError) {
      setError(downloadError.message || "The file could not be downloaded.");
    }
  };

  const downloadInstructions = async (assignment) => {
    setError("");
    try {
      await downloadAssignmentPdf({
        title: assignment.title,
        subtitle: `${data.school?.name || "School"} · ${assignment.subject} · ${assignment.className} · Due ${prettyDate(assignment.dueDate)}`,
        description: assignment.description,
        furtherExplanation: assignment.furtherExplanation,
        filename: `assignment-${assignment.id}.pdf`,
      });
    } catch (downloadError) {
      setError(downloadError.message || "The assignment PDF could not be created.");
    }
  };

  const submissionCounts = new Map();
  for (const submission of submissions) {
    submissionCounts.set(submission.assignmentId, (submissionCounts.get(submission.assignmentId) || 0) + 1);
  }

  return <>
    <div className="page-heading">
      <div><div className="eyebrow">{role === "student" ? "YOUR LEARNING SPACE" : role === "teacher" ? "TEACHER WORKSPACE" : "SCHOOL MANAGEMENT"}</div><h1>{role === "student" ? "My assignments" : "Assignments"}</h1><p>{role === "student" ? "Read your teacher’s instructions, download the assignment, then submit your finished work here." : "Share clear assignment instructions, download student work, and track submissions by class."}</p></div>
      {canManage && <button className="button button-primary" onClick={() => openForm()}><Upload size={15} />Create assignment</button>}
    </div>
    <div className="assignment-guidance"><BookOpen size={19} /><div><strong>{role === "student" ? "Your assignment portal" : "Instructions and submissions in one place"}</strong><span>{role === "student" ? "Download a ready-to-print PDF or your teacher’s attached file. Submit your finished work as PDF or Word." : "Students can download the assignment PDF and submit their completed PDF or Word file. Submissions are visible here to school administrators and the assigned teacher."}</span></div></div>
    {message && <div className="inline-notice" role="status"><Check size={16} />{message}<button aria-label="Dismiss" onClick={() => setMessage("")}><X size={15} /></button></div>}
    {error && <div className="assignment-error" role="alert">{error}<button aria-label="Dismiss" onClick={() => setError("")}><X size={15} /></button></div>}
    <section className="assignment-list" aria-label="Assignments">
      {assignments.map((assignment) => {
        const submission = mySubmissions.get(assignment.id);
        const linkedFiles = (assignment.documentIds || []).map((id) => attachmentsById.get(id)).filter(Boolean);
        const assignmentSubmissions = submissions.filter((item) => item.assignmentId === assignment.id);
        const overdue = isLate(assignment.dueDate);
        return <article className="assignment-card" key={assignment.id}>
          <div className="assignment-card-top"><span className="assignment-subject">{assignment.subject}</span><span className={`assignment-status ${submission ? (submission.status === "Late" ? "late" : "submitted") : overdue ? "overdue" : "pending"}`}>{submission ? submission.status : overdue && role === "student" ? "Past due" : role === "student" ? "Not submitted" : `${submissionCounts.get(assignment.id) || 0} submitted`}</span></div>
          <div className="assignment-title-row"><div><h2>{assignment.title}</h2><p>{assignment.className} · Due {prettyDate(assignment.dueDate)}</p></div>{canManage && <button className="button button-light assignment-edit" onClick={() => openForm(assignment)}><Pencil size={14} />Edit</button>}</div>
          <div className="assignment-details">
            <div><strong>Assignment</strong><p>{assignment.description || "Your teacher has not added assignment details yet."}</p></div>
            {assignment.furtherExplanation && <div className="assignment-explanation"><strong>Further explanation from your teacher</strong><p>{assignment.furtherExplanation}</p></div>}
          </div>
          <div className="assignment-card-footer">
            <div className="assignment-file-actions"><button className="button button-light" onClick={() => downloadInstructions(assignment)}><Download size={14} />Download assignment PDF</button>
              {linkedFiles.map((file) => <button key={file.id} className="button button-light" onClick={() => downloadFile(file.id, file.fileName)}><FileText size={14} />{file.fileName}</button>)}
            </div>
            {role === "student" && <div className="submission-controls">
              {submission && <div className="submission-receipt"><Check size={15} /><span><strong>Submitted {new Date(submission.submittedAt).toLocaleString()}</strong><small>{submission.fileName} · You can upload a replacement any time.</small></span><button className="table-action" onClick={() => downloadFile(submission.id, submission.fileName)}>Download</button></div>}
              <div className="submission-form"><label className="submission-picker"><FileUp size={16} /><span>{submissionFiles[assignment.id]?.name || "Choose completed work (PDF or Word)"}</span><input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => { setSubmissionFiles((current) => ({ ...current, [assignment.id]: event.target.files?.[0] || null })); setError(""); }} /></label><button className="button button-primary" disabled={busyId === assignment.id} onClick={() => submitWork(assignment)}><Send size={14} />{busyId === assignment.id ? "Submitting…" : submission ? "Resubmit work" : "Submit work"}</button></div>
            </div>}
          </div>
          {canManage && <div className="submission-list">
            <div className="submission-list-heading"><strong><ShieldCheck size={15} />Student submissions</strong><span>{assignmentSubmissions.length} received</span></div>
            {assignmentSubmissions.length > 0 ? <div className="table-scroll"><table><thead><tr><th>Student</th><th>File</th><th>Submitted</th><th>Status</th><th>Action</th></tr></thead><tbody>{assignmentSubmissions.map((item) => <tr key={item.id}><td><strong className="primary-cell">{item.studentName}</strong></td><td>{item.fileName}</td><td>{new Date(item.submittedAt).toLocaleString()}</td><td><span className={`assignment-status ${item.status === "Late" ? "late" : "submitted"}`}>{item.status}</span></td><td><button className="table-action" onClick={() => downloadFile(item.id, item.fileName)}><Download size={13} />Download work</button></td></tr>)}</tbody></table></div> : <p className="submission-empty"><Clock3 size={14} />No student work has been submitted yet.</p>}
          </div>}
        </article>;
      })}
      {!assignments.length && <div className="empty-documents"><BookOpen size={23} /><strong>No assignments yet</strong><span>{role === "student" ? "New assignments from your teacher will appear here." : "Create an assignment to share instructions and accept student work."}</span></div>}
    </section>
    {dialogOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busyId) setDialogOpen(false); }}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="assignment-dialog-title">
        <div className="modal-heading"><div><div className="eyebrow">ASSIGNMENT DETAILS</div><h2 id="assignment-dialog-title">{editing ? "Edit assignment" : "Create assignment"}</h2></div><button className="icon-button" aria-label="Close dialog" disabled={Boolean(busyId)} onClick={() => setDialogOpen(false)}><X size={18} /></button></div>
        <form className="record-form" onSubmit={saveAssignment}>
          <label className="full-field">Assignment title<input value={form.title || ""} maxLength={120} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></label>
          <label>Subject<input value={form.subject || ""} maxLength={100} onChange={(event) => setForm({ ...form, subject: event.target.value })} required /></label>
          <label>Class / cohort<select value={form.classId || ""} onChange={(event) => setForm({ ...form, classId: event.target.value })} required><option value="">Choose a class</option>{availableClasses.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.grade}</option>)}</select></label>
          <label className="full-field">Due date<input type="date" value={form.dueDate || ""} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} required /></label>
          <label className="full-field">Assignment details<textarea rows={4} maxLength={3000} placeholder="What should students complete?" value={form.description || ""} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          <label className="full-field">Further explanation for students<textarea rows={3} maxLength={2000} placeholder="Add steps, expectations, or a helpful example." value={form.furtherExplanation || ""} onChange={(event) => setForm({ ...form, furtherExplanation: event.target.value })} /></label>
          <label className="full-field">Attach a PDF or Word worksheet (optional)<input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => { setAttachment(event.target.files?.[0] || null); setError(""); }} /></label>
          {attachment && <div className="upload-preview full-field"><FileText size={17} /><span><strong>{attachment.name}</strong><small>Students can download this worksheet.</small></span></div>}
          {editing?.documentIds?.length > 0 && !attachment && <p className="assignment-existing-file full-field">{editing.documentIds.length} worksheet attachment(s) already available to students.</p>}
          {error && <p className="form-error full-field" role="alert">{error}</p>}
          <div className="form-actions"><button type="button" className="button button-light" disabled={Boolean(busyId)} onClick={() => setDialogOpen(false)}>Cancel</button><button type="submit" className="button button-primary" disabled={Boolean(busyId)}><Check size={15} />{busyId ? "Saving…" : "Share assignment"}</button></div>
        </form>
      </section>
    </div>}
  </>;
}
