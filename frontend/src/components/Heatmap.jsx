import { useEffect, useMemo, useState } from "react";
import { getTransactions } from "../api";
import { currentMonth, money } from "../utils";

const pad = (n) => String(n).padStart(2, "0");
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const level = (total, max) => {
  if (!total) return 0;
  const r = total / max;
  return r <= 0.25 ? 1 : r <= 0.5 ? 2 : r <= 0.75 ? 3 : 4;
};

export default function Heatmap({ month, refreshKey }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setError("");
    getTransactions().then(setItems).catch((e) => setError(e.message));
  }, [refreshKey]);

  useEffect(() => setSelected(null), [month]);

  const data = useMemo(() => {
    if (!items) return null;
    const [y, m] = month.split("-").map(Number);
    const days = new Date(y, m, 0).getDate();
    const offset = (new Date(y, m - 1, 1).getDay() + 6) % 7;
    const isCurrent = month === currentMonth();
    const elapsed = isCurrent ? new Date().getDate() : days;

    const byDay = {};
    items
      .filter((t) => t.type === "expense" && t.date.startsWith(month))
      .forEach((t) => (byDay[t.date] = [...(byDay[t.date] || []), t]));

    const totals = Array.from({ length: days }, (_, i) =>
      (byDay[`${month}-${pad(i + 1)}`] || []).reduce((sum, t) => sum + t.amount, 0)
    );
    const max = Math.max(...totals);
    const peakDay = max > 0 ? totals.indexOf(max) + 1 : null;

    return {
      offset,
      byDay,
      max,
      peakDay,
      isCurrent,
      elapsed,
      total: totals.reduce((a, b) => a + b, 0),
      noSpend: totals.slice(0, elapsed).filter((t) => t === 0).length,
      cells: totals.map((total, i) => ({
        day: i + 1,
        key: `${month}-${pad(i + 1)}`,
        total,
        level: level(total, max),
        future: isCurrent && i + 1 > elapsed,
      })),
    };
  }, [items, month]);

  const dayList = selected && data ? data.byDay[selected] || [] : [];
  const dayLabel = selected
    ? new Date(`${selected}T00:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
    : "";

  return (
    <div className="card">
      <h3>
        Spending heatmap <span>Daily expenses</span>
      </h3>

      {error && <p className="error">{error}</p>}
      {!data && !error && <div className="skeleton" />}

      {data && (
        <div className="hm-wrap">
          <div>
            <div className="hm-grid">
              {DAYS.map((d) => (
                <div className="hm-dow" key={d}>{d}</div>
              ))}
              {Array.from({ length: data.offset }, (_, i) => (
                <div key={`b${i}`} />
              ))}
              {data.cells.map((c) => (
                <button
                  key={c.key}
                  disabled={c.future}
                  className={`hm-cell l${c.level} ${selected === c.key ? "sel" : ""} ${
                    data.isCurrent && c.day === data.elapsed ? "today" : ""
                  }`}
                  title={`${c.key}: ${money(c.total)}`}
                  aria-label={`${c.key}, spent ${money(c.total)}`}
                  onClick={() => setSelected(selected === c.key ? null : c.key)}
                >
                  {c.day}
                </button>
              ))}
            </div>
            <div className="hm-legend">
              Less
              {[0, 1, 2, 3, 4].map((l) => (
                <i key={l} className={`hm-cell l${l}`} />
              ))}
              More
            </div>
          </div>

          <div className="hm-side">
            <div className="hm-stat">
              <span>Total spent</span>
              <b>{money(data.total)}</b>
            </div>
            <div className="hm-stat">
              <span>Highest day</span>
              <b>{data.peakDay ? `${money(data.max)} · day ${data.peakDay}` : "-"}</b>
            </div>
            <div className="hm-stat">
              <span>No-spend days</span>
              <b>{data.noSpend} of {data.elapsed}</b>
            </div>

            <div className="hm-detail">
              {!selected && <p className="lbl">Click a day to see what you spent.</p>}
              {selected && (
                <>
                  <p className="hm-day">{dayLabel}</p>
                  {dayList.length === 0 && <p className="lbl">No spending this day.</p>}
                  {dayList.map((t) => (
                    <div className="hm-item" key={t.id}>
                      <span>{t.title} <small>{t.category}</small></span>
                      <b className="expense">-{money(t.amount)}</b>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}