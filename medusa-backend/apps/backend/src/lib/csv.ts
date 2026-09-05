// Safe CSV cell encoding for exports. Beyond RFC quoting, it neutralizes CSV
// formula injection: a cell that starts with = + - @ (or a control char) is
// prefixed with a single quote so Excel/Sheets treat it as text, never a
// formula — important because some cells hold customer-controlled data
// (names, emails, notes).
export function csvCell(v: any): string {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
