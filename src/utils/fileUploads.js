export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const allowedExtensions = new Set([".pdf", ".doc", ".docx"]);

export function validateUpload(file) {
  if (!file || typeof file.name !== "string" || !Number.isFinite(file.size)) return "Choose a PDF or Word document.";
  if (!allowedExtensions.has(file.name.slice(file.name.lastIndexOf(".")).toLowerCase())) {
    return "Only PDF and Word documents (.pdf, .doc, .docx) are supported.";
  }
  if (file.size <= 0) return "The selected file is empty.";
  if (file.size > MAX_UPLOAD_BYTES) return "The file must be 10 MB or smaller.";
  return "";
}
