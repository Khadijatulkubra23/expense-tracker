import { today } from "./utils";

const escapeCell = (value) => {
  let s = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const unescapeCell = (s) => s.replace(/^'(?=[=+\-@])/, "");

const validDate = (s) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};

export const toCsv = (items) =>
  [
    "date,title,type,category,amount,note",
    ...items.map((t) => [t.date, t.title, t.type, t.category, t.amount, t.note].map(escapeCell).join(",")),
  ].join("\r\n");

export const downloadCsv = (csv, filename) => {
  const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export function parseCsv(text) {
  const src = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

export function rowsToTransactions(rows) {
  if (rows.length < 2) return { error: "No data rows found. The file needs a header row and at least one transaction." };

  const cols = rows[0].map((h) => h.trim().toLowerCase());
  const missing = ["title", "amount", "type", "category"].filter((c) => !cols.includes(c));
  if (missing.length) return { error: `Missing column(s): ${missing.join(", ")}` };
  if (rows.length - 1 > 1000) return { error: "Too many rows. The limit is 1000 per import." };

  const items = [];
  const errors = [];

  rows.slice(1).forEach((r, i) => {
    const get = (name) => (r[cols.indexOf(name)] ?? "").trim();
    const title = unescapeCell(get("title"));
    const type = get("type").toLowerCase();
    const category = unescapeCell(get("category"));
    const amount = Number(get("amount").replace(/[$\s]/g, ""));
    const date = get("date") || today();
    const note = unescapeCell(get("note"));

    const problem = !title
      ? "title is empty"
      : !["income", "expense"].includes(type)
      ? `type must be income or expense (got "${get("type")}")`
      : !category
      ? "category is empty"
      : !(amount > 0)
      ? "amount must be a plain number above 0"
      : !validDate(date)
      ? "date must look like 2026-09-30"
      : null;

    if (problem) errors.push(`Row ${i + 2}: ${problem}`);
    else items.push({ title, type, category, amount, date, note: note || null });
  });

  return { items, errors };
}