import * as XLSX from "xlsx";

/* ----------------------------- CSV EXPORT ----------------------------- */
export function exportToCSV(filename: string, headers: string[], rows: any[][]) {
  const csvContent = [
    headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const val = cell === null || cell === undefined ? "" : String(cell);
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ---------------------------- EXCEL EXPORT ----------------------------- */
// True .xlsx export (not just CSV renamed). Auto-sizes columns and
// freezes the header row for readability.

export function exportToExcel(
  filename: string,
  sheetName: string,
  headers: string[],
  rows: any[][]
) {
  if (typeof window === "undefined") return;

  const normalizedRows = rows.map((row) =>
    row.map((cell) => (cell === null || cell === undefined ? "" : cell))
  );

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...normalizedRows]);

  // Auto-width columns based on content length
  worksheet["!cols"] = headers.map((h, colIndex) => {
    const maxLen = Math.max(
      String(h).length,
      ...normalizedRows.map((r) => String(r[colIndex] ?? "").length)
    );
    return { wch: Math.min(Math.max(maxLen + 2, 10), 50) };
  });

  // Freeze header row
  worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };

  // Bold header row styling (only applies with cellStyles-enabled builds;
  // safe no-op otherwise)
  const headerRange = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
    if (worksheet[cellRef]) {
      worksheet[cellRef].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "007A7D" } },
      };
    }
  }

  const workbook = XLSX.utils.book_new();
  // Sheet names are capped at 31 chars by the Excel spec
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));

  const safeFilename = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, safeFilename, { compression: true });
}

/* ----------------------------- PDF EXPORT ------------------------------ */
// (unchanged from your existing implementation)

export async function exportToPDF(
  filename: string,
  title: string,
  headers: string[],
  rows: any[][]
) {
  if (typeof window === "undefined") return;

  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  // Create document in landscape if there are many columns to avoid overflow
  const orientation = headers.length > 7 ? "l" : "p";
  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
  });

  // Title (Midnight Teal color)
  doc.setFontSize(16);
  doc.setTextColor(28, 45, 53);
  doc.text(title, 14, 15);

  // Subtitle/Date (Muted grey-teal)
  doc.setFontSize(9);
  doc.setTextColor(115, 125, 130);
  doc.text(`Exported on: ${new Date().toLocaleString()}`, 14, 21);

  // Generate table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 25,
    theme: "striped",
    headStyles: {
      fillColor: [0, 122, 125], // Brand teal (#007A7D)
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [28, 45, 53], // Midnight Teal
    },
    alternateRowStyles: {
      fillColor: [232, 237, 239], // App's background color (#E8EDEF)
    },
    styles: {
      cellPadding: 1.5,
      overflow: "linebreak",
      halign: "left",
    },
    margin: { top: 25, right: 14, bottom: 15, left: 14 },
    pageBreak: "auto",
    didDrawPage: (data: any) => {
      // Footer page numbering
      const str = `Page ${doc.getNumberOfPages()}`;
      doc.setFontSize(8);
      doc.setTextColor(115, 125, 130);
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
      doc.text(str, pageWidth - 14 - doc.getTextWidth(str), pageHeight - 10);
    },
  });

  const safeFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  doc.save(safeFilename);
}