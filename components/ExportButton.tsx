// components/ExportButton.tsx
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import { exportToCSV, exportToExcel, exportToPDF } from "@/lib/export-utils";

export interface ExportButtonProps {
  /** Base filename WITHOUT extension, e.g. "users_export" */
  filename: string;
  /** Title shown at the top of the PDF, e.g. "Users Report" */
  title: string;
  /** Excel sheet name (max 31 chars, auto-truncated) */
  sheetName?: string;
  headers: string[];
  rows: any[][];
  /** Which formats to offer. Defaults to Excel + PDF. */
  formats?: Array<"excel" | "pdf" | "csv">;
  disabled?: boolean;
  className?: string;
}

export default function ExportButton({
  filename,
  title,
  sheetName,
  headers,
  rows,
  formats = ["excel", "pdf"],
  disabled = false,
  className = "",
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState<null | "excel" | "pdf" | "csv">(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const noData = !rows || rows.length === 0;

  async function handleExport(format: "excel" | "pdf" | "csv") {
    if (noData) return;
    setExporting(format);
    try {
      if (format === "excel") {
        exportToExcel(`${filename}.xlsx`, sheetName ?? title, headers, rows);
      } else if (format === "pdf") {
        await exportToPDF(`${filename}.pdf`, title, headers, rows);
      } else {
        exportToCSV(`${filename}.csv`, headers, rows);
      }
    } finally {
      setExporting(null);
      setOpen(false);
    }
  }

  const optionMeta: Record<
    "excel" | "pdf" | "csv",
    { label: string; icon: ReactNode }
  > = {
    excel: { label: "Export as Excel (.xlsx)", icon: <FileSpreadsheet size={16} /> },
    pdf: { label: "Export as PDF (.pdf)", icon: <FileText size={16} /> },
    csv: { label: "Export as CSV (.csv)", icon: <FileText size={16} /> },
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        disabled={disabled || noData}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-md border border-brand bg-brand px-3 py-2 text-sm font-medium text-white transition hover:bg-[#00696c] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        title={noData ? "No data to export" : "Export"}
      >
        <Download size={16} />
        Export
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-md border border-[#E8EDEF] bg-white shadow-lg">
          {formats.map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => handleExport(fmt)}
              disabled={exporting !== null}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[#1C2D35] hover:bg-[#E8EDEF] disabled:opacity-50"
            >
              {optionMeta[fmt].icon}
              {exporting === fmt ? "Exporting..." : optionMeta[fmt].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}