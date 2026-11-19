import { useMemo, useState } from "react";
import { Download, FileText, FileUp, Plus, Trash2, X } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { downloadPdf } from "../utils/pdf.js";
import { deleteStoredFile, downloadStoredFile, saveStoredFile } from "../utils/fileStorage.js";
import { validateUpload } from "../utils/fileUploads.js";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage({ role }) {
  const { data, user, schoolId, updateCollection } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [relatedId, setRelatedId] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const teacher = data.teachers.find((item) => item.id === user?.teacherId);
  const teacherClasses = data.classes.filter((item) => item.teacher === teacher?.name);
  const visibleRows = data.documents.filter((item) => {
    if (role === "student") return item.studentId === user?.studentId;
    if (role === "teacher") return item.uploadedBy === user?.name || teacherClasses.some((schoolClass) => schoolClass.id === item.classId);
    return true;
  }).sort((left, right) => right.uploadedAt.localeCompare(left.uploadedAt));
  const relatedOptions = useMemo(() => {
    if (role === "student") {
      const student = data.students.find((item) => item.id === user?.studentId);
      return student ? [{ id: `students:${student.id}`, label: `${student.name} · Student profile` }] : [];
    }
    if (role === "teacher") {
      const students = data.students.filter((item) => teacherClasses.some((schoolClass) => schoolClass.id === item.classId));
      return [
        ...students.map((item) => ({ id: `students:${item.id}`, label: `${item.name} · Student` })),
        ...data.assignments.filter((item) => teacherClasses.some((schoolClass) => schoolClass.id === item.classId)).map((item) => ({ id: `assignments:${item.id}`, label: `${item.title} · Assignment` })),
      ];
    }
    return [
      ...data.students.map((item) => ({ id: `students:${item.id}`, label: `${item.name} · Student` })),
      ...data.teachers.map((item) => ({ id: `teachers:${item.id}`, label: `${item.name} · Teacher` })),
      ...data.assignments.map((item) => ({ id: `assignments:${item.id}`, label: `${item.title} · Assignment` })),
      ...data.results.map((item) => ({ id: `results:${item.id}`, label: `${item.assessment} · Result` })),
      ...data.research.map((item) => ({ id: `research:${item.id}`, label: `${item.title} · Research` })),
    ];
  }, [data, role, teacherClasses, user]);

  const openDialog = () => {
    setFile(null);
    setRelatedId(relatedOptions[0]?.id || "");
    setMessage("");
    setDialogOpen(true);
  };

  const upload = async (event) => {
    event.preventDefault();
    const error = validateUpload(file);
    if (error) { setMessage(error); return; }
    const selected = relatedOptions.find((option) => option.id === relatedId);
    const [relatedType, entityId] = (selected?.id || "").split(":");
    const student = data.students.find((item) => item.id === entityId);
    const schoolClass = student ? data.classes.find((item) => item.id === student.classId) : null;
    const document = {
      id: `DOC-${Date.now()}`,
      fileName: file.name,
      fileType: file.name.split(".").pop().toLowerCase(),
      fileSize: file.size,
      relatedType: relatedType || "general",
      relatedId: entityId || "",
      relatedName: selected?.label || "General school document",
      studentId: student?.id || (role === "student" ? user.studentId : ""),
      classId: schoolClass?.id || "",
      uploadedBy: user.name,
      uploadedAt: new Date().toISOString(),
      schoolId,
    };
    setBusy(true);
    try {
      await saveStoredFile(document.id, file);
      updateCollection("documents", (documents) => [document, ...documents]);
      setDialogOpen(false);
      setFile(null);
      setMessage("Document uploaded.");
    } catch (error) {
      setMessage(error.message || "The document could not be uploaded.");
    } finally {
      setBusy(false);
    }
  };

  const download = async (document) => {
    try {
      await downloadStoredFile(document.id, document.fileName);
    } catch (error) {
      setMessage(error.message || "The document could not be downloaded.");
    }
  };

  const remove = async (document) => {
    if (!window.confirm(`Delete "${document.fileName}"?`)) return;
    try {
      await deleteStoredFile(document.id);
      updateCollection("documents", (documents) => documents.filter((item) => item.id !== document.id));
      setMessage("Document deleted.");
    } catch (error) {
      setMessage(error.message || "The document could not be deleted.");
    }
  };
  const exportDocuments = async () => {
    try {
      await downloadPdf({
        title: "Document register",
        subtitle: `${data.school?.name || "School"} · ${new Date().toLocaleDateString()}`,
        headers: ["File name", "Related record", "Uploaded by", "Date", "Size"],
        rows: visibleRows.map((item) => [item.fileName, item.relatedName, item.uploadedBy, new Date(item.uploadedAt).toLocaleDateString(), formatBytes(item.fileSize)]),
        filename: `documents-${schoolId}.pdf`,
      });
    } catch (error) {
      setMessage(error.message || "PDF export failed.");
    }
  };

  return <>
    <div className="page-heading">
      <div><div className="eyebrow">FILE MANAGEMENT</div><h1>Documents</h1><p>Upload and organize PDF and Word files for this school.</p></div>
      <button className="button button-primary" onClick={openDialog}><Plus size={16} />Upload document</button>
    </div>
    <div className="document-guidance"><FileText size={19} /><div><strong>Private to this browser demo</strong><span>PDF, DOC, or DOCX files up to 10 MB. Files are stored locally in this browser.</span></div></div>
    {message && <div className="inline-notice" role="status">{message}<button aria-label="Dismiss" onClick={() => setMessage("")}><X size={15} /></button></div>}
    <section className="panel data-panel">
      <div className="data-toolbar">
        <div className="table-count"><strong>{visibleRows.length}</strong> documents <span>·</span> {data.school?.name}</div>
        <div className="table-tools"><button className="button button-light export-button" onClick={exportDocuments}><Download size={14} />Export PDF</button></div>
      </div>
      <div className="table-scroll"><table><thead><tr><th>Document</th><th>Related record</th><th>Uploaded by</th><th>Date uploaded</th><th>Size</th><th>Actions</th></tr></thead>
        <tbody>{visibleRows.map((document) => <tr key={document.id}><td><strong className="primary-cell">{document.fileName}</strong></td><td>{document.relatedName}</td><td>{document.uploadedBy}</td><td>{new Date(document.uploadedAt).toLocaleDateString()}</td><td>{formatBytes(document.fileSize)}</td><td className="row-actions"><button className="table-action" onClick={() => download(document)}><Download size={13} />Download</button>{(role !== "student" || document.uploadedBy === user?.name) && <button className="table-action danger" onClick={() => remove(document)} aria-label={`Delete ${document.fileName}`}><Trash2 size={13} /></button>}</td></tr>)}
          {!visibleRows.length && <tr><td colSpan={6}><div className="empty-documents"><FileText size={23} /><strong>No documents yet</strong><span>Upload a PDF or Word file to get started.</span></div></td></tr>}
        </tbody>
      </table></div>
    </section>
    {dialogOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setDialogOpen(false); }}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="document-dialog-title">
        <div className="modal-heading"><div><div className="eyebrow">DOCUMENT LIBRARY</div><h2 id="document-dialog-title">Upload a document</h2></div><button className="icon-button" aria-label="Close dialog" disabled={busy} onClick={() => setDialogOpen(false)}><X size={18} /></button></div>
        <form className="record-form" onSubmit={upload}>
          <label className="full-field">Link to a record<select value={relatedId} onChange={(event) => setRelatedId(event.target.value)}><option value="">General school document</option>{relatedOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
          <label className="full-field">PDF or Word file<input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => { setFile(event.target.files?.[0] || null); setMessage(""); }} required /></label>
          {file && <div className="upload-preview full-field"><FileText size={18} /><span><strong>{file.name}</strong><small>{formatBytes(file.size)}</small></span></div>}
          {message && <p className="form-error full-field" role="alert">{message}</p>}
          {message && <p className="form-error full-field" role="alert">{message}</p>}
          <div className="form-actions"><button type="button" className="button button-light" disabled={busy} onClick={() => setDialogOpen(false)}>Cancel</button><button type="submit" className="button button-primary" disabled={busy}><FileUp size={15} />{busy ? "Uploading…" : "Upload file"}</button></div>
        </form>
      </section>
    </div>}
  </>;
}
