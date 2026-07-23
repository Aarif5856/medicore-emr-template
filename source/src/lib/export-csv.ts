/**
 * exportToCsv — generate a client-side CSV file and trigger a browser download.
 *
 * Escapes each cell per RFC 4180: doubles quotes, wraps any cell containing a
 * comma, quote, or newline. Adds a UTF-8 BOM so Excel opens the file with the
 * right encoding.
 */

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

function escapeCell(input: string | number | null | undefined): string {
  const s = input == null ? "" : String(input);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => escapeCell(c.header)).join(",");
  const body = rows
    .map((row) => columns.map((c) => escapeCell(c.value(row))).join(","))
    .join("\r\n");
  return `\uFEFF${header}\r\n${body}`;
}

export function downloadCsv(filename: string, csv: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Delay revoke so the browser has time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportToCsv<T>(filename: string, rows: T[], columns: CsvColumn<T>[]): void {
  downloadCsv(filename, toCsv(rows, columns));
}
