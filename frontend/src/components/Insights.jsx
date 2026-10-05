import { useEffect, useMemo, useState } from "react";
import { getTransactions } from "../api";
import { currentMonth, money, shortDate } from "../utils";

const ICONS = {
  category: "M21 12A9 9 0 1 1 12 3v9z",
  biggest: "M7 17L17 7M17 7H9M17 7v8",
  daily: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  projection: "M3 17l6-6 4 4 8-8M15 7h6v6",
};

function Tile({ icon, label, value, sub, bad }) {
  return (
    <div className="insight">
      <div className="insight-top">
        {label}
        <span className="insight-icon">
          <svg viewBox="0 0 24 24"><path d={ICONS[icon]} /></svg>
        </span>
      </div>
      <div className={`insight-value ${bad ? "bad" : ""}`}>{value}</div>
      <small>{sub}</small>
    </div>
  );
}

export default function Insights({ month, refreshKey, income }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    getTransactions().then(setItems).catch((e) => setError(e.message));
  }, [refreshKey]);

  const stats = useMemo(() => {
    if (!items) return null;
    const expenses = items.filter((t) => t.type === "expense" && t.date.startsWith(month));
    if (!expenses.length) return { empty: true };

    const total = expenses.reduce((sum, t) => sum + t.amount, 0);
    const byCategory = {};
    expenses.forEach((t) => (byCategory[t.category] = (byCategory[t.category] || 0) + t.amount));
    const [topName, topAmount] = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
    const biggest = expenses.reduce((a, b) => (b.amount > a.amount ? b : a));

    const [y, m] = month.split("-").map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const isCurrent = month === currentMonth();
    const elapsed = isCurrent ? new Date().getDate() : daysInMonth;
    const daily = total / elapsed;

    return {
      total,
      count: expenses.length,
      topName,
      topAmount,
      biggest,
      daily,
      elapsed,
      isCurrent,
      early: isCurrent && elapsed < 3,
      projected: daily * daysInMonth,
    };
  }, [items, month]);

  return (
    <div className="card">
      <h3>
        Insights <span>Based on this month's expenses</span>
      </h3>

      {error && <p className="error">{error}</p>}
      {!stats && !error && <div className="skeleton" />}
      {stats?.empty && <p className="lbl">Add some expenses this month to see insights.</p>}

      {stats && !stats.empty && (
        <div className="insights">
          <Tile
            icon="category"
            label="Top category"
            value={stats.topName}
            sub={`${money(stats.topAmount)} · ${Math.round((stats.topAmount / stats.total) * 100)}% of spending`}
          />
          <Tile
            icon="biggest"
            label="Biggest expense"
            value={money(stats.biggest.amount)}
            sub={`${stats.biggest.title} · ${shortDate(stats.biggest.date)}`}
          />
          <Tile
            icon="daily"
            label="Daily average"
            value={money(stats.daily)}
            sub={`over ${stats.elapsed} ${stats.elapsed === 1 ? "day" : "days"}`}
          />
          {stats.isCurrent ? (
            <Tile
              icon="projection"
              label="Projected month-end"
              value={stats.early ? "-" : money(stats.projected)}
              sub={
                stats.early
                  ? "Needs a few days of data"
                  : income > 0
                  ? `${Math.round((stats.projected / income) * 100)}% of this month's income`
                  : "At your current pace"
              }
              bad={!stats.early && income > 0 && stats.projected > income}
            />
          ) : (
            <Tile icon="projection" label="Month total" value={money(stats.total)} sub={`${stats.count} expenses`} />
          )}
        </div>
      )}
    </div>
  );
}