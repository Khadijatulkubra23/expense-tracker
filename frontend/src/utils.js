export const money = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export const today = () => new Date().toLocaleDateString("en-CA");

export const currentMonth = () => today().slice(0, 7);

export const shortDate = (d) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
export const tooltipStyle = {
  background: "var(--bg)",
  border: "1px solid var(--line)",
  borderRadius: 12,
  color: "var(--tx)",
};
export const prevMonth = (month) => {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const pctChange = (cur, prev) => (prev ? Math.round(((cur - prev) / prev) * 1000) / 10 : null);
export const EXPENSE_CATEGORIES = ["Food", "Rent", "Transport", "Shopping", "Bills", "Health", "Entertainment", "Other"];