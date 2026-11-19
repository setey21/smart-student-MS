function escapeCsvValue(value) {
  const text = value == null ? "" : Array.isArray(value) ? value.join(", ") : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function createCsv(rows, fields) {
  const header = fields.map(([, label]) => escapeCsvValue(label)).join(",");
  const records = rows.map((row) => fields.map(([key]) => escapeCsvValue(row[key])).join(","));
  return [header, ...records].join("\r\n");
}

export function downloadCsv(rows, fields, fileName) {
  const csv = `\uFEFF${createCsv(rows, fields)}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
