export async function downloadPdf({ title, subtitle, headers, rows, filename }) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const doc = new jsPDF({ orientation: headers.length > 6 ? "landscape" : "portrait", unit: "pt" });
  const width = doc.internal.pageSize.getWidth();
  doc.setFillColor(31, 48, 76);
  doc.rect(0, 0, width, 78, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("SR-EMS", 38, 31);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(title, 38, 52);
  doc.setTextColor(75, 88, 108);
  doc.setFontSize(9);
  doc.text(subtitle || `Generated ${new Date().toLocaleDateString()}`, 38, 98);
  autoTable(doc, {
    startY: 116,
    head: [headers],
    body: rows,
    theme: "grid",
    styles: { font: "helvetica", fontSize: 8, cellPadding: 5, textColor: [56, 68, 87], lineColor: [229, 234, 241] },
    headStyles: { fillColor: [83, 120, 232], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [247, 249, 252] },
    margin: { left: 38, right: 38 },
  });
  doc.save(filename.replace(/[<>:"/\\|?*]+/g, "-"));
}

export async function downloadAssignmentPdf({ title, subtitle, description, furtherExplanation, filename }) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt" });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 42;
  const lineWidth = width - margin * 2;
  let y = 44;
  const addText = (text, { size = 11, bold = false, color = [56, 68, 87], gap = 7 } = {}) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(String(text || ""), lineWidth);
    for (const line of lines) {
      if (y > height - 48) {
        doc.addPage();
        y = 48;
      }
      doc.text(line, margin, y);
      y += size + 5;
    }
    y += gap;
  };

  doc.setFillColor(31, 48, 76);
  doc.rect(0, 0, width, 105, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(203, 216, 255);
  doc.text("SR-EMS · ASSIGNMENT", margin, 30);
  doc.setFontSize(19);
  doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(title, lineWidth);
  doc.text(titleLines, margin, 57);
  y = 125;
  addText(subtitle, { size: 9, color: [113, 126, 148], gap: 18 });
  addText("Assignment details", { size: 13, bold: true, color: [31, 48, 76], gap: 6 });
  addText(description || "No assignment description provided.", { gap: 14 });
  if (furtherExplanation) {
    addText("Further explanation from your teacher", { size: 13, bold: true, color: [31, 48, 76], gap: 6 });
    addText(furtherExplanation, { gap: 14 });
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(130, 142, 160);
  doc.text("Please submit your completed work through your student portal.", margin, Math.min(y + 8, height - 24));
  doc.save(filename.replace(/[<>:"/\\|?*]+/g, "-"));
}
