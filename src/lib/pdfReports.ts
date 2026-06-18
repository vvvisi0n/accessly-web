// src/lib/pdfReports.ts
"use server";

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { writeFileSync } from "fs";
import path from "path";

export async function generatePDFReport({
  title,
  summary,
  sections,
}: {
  title: string;
  summary: string;
  sections: { heading: string; items: string[] }[];
}) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = 800;
  const drawText = (text: string, size = 12, offset = 50) => {
    page.drawText(text, { x: offset, y, size, font, color: rgb(0.1, 0.1, 0.1) });
    y -= size + 6;
  };

  // Header
  drawText("Accessana Report", 22);
  drawText(title, 16);
  y -= 10;
  drawText(summary, 11);

  // Sections
  y -= 25;
  sections.forEach((section) => {
    drawText(`• ${section.heading}`, 14, 50);
    section.items.forEach((i) => drawText(`- ${i}`, 11, 70));
    y -= 10;
  });

  const pdfBytes = await pdfDoc.save();
  const output = path.join(process.cwd(), "public", `report-${Date.now()}.pdf`);
  writeFileSync(output, pdfBytes);
  return { path: `/report-${Date.now()}.pdf` };
}
