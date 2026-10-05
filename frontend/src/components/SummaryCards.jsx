import { money, pctChange } from "../utils";

const W = 300;
const H = 70;

function buildPaths(values) {
  const v = values.length < 2 ? [0, 0] : values;
  const min = Math.min(...v);
  const range = Math.max(...v) - min || 1;
  const pts = v.map((n, i) => [(i / (v.length - 1)) * W, H - 14 - ((n - min) / range) * (H - 28)]);
  let line = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const mx = (x0 + x1) / 2;
    line += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`;
  }
  return { line, area: `${line} L${W},${H} L0,${H} Z` };
}

function Delta({ cur, prev, goodWhenUp }) {
  const pct = pctChange(cur, prev);
  if (pct === null) return <span className="delta flat">No data last month</span>;
  const tone = pct === 0 ? "flat" : pct > 0 === goodWhenUp ? "good" : "bad";
  return <span className={`delta ${tone}`}>{pct > 0 ? "+" : ""}{pct}% vs last month</span>;
}

export default function SummaryCards({ summary, prev, trend }) {
  const { income, expenses, balance, savings_rate } = summary;
  const { line, area } = buildPaths((trend || []).map((m) => m.income - m.expenses));

  return (
    <div className="grid top">
      <div className="card hero">
        <small>Balance this month</small>
        <div className="big">{money(balance)}</div>
        <small>Savings rate: {savings_rate}%</small>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity=".4" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#fade)" />
          <path d={line} fill="none" stroke="#fff" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <div className="card">
        <div className="stat-top">
          <div className="lbl">Income</div>
          <span className="badge income">
            <svg viewBox="0 0 24 24"><path d="M17 7L7 17M7 17h8M7 17V9" /></svg>
          </span>
        </div>
        <div className="num income">{money(income)}</div>
        <Delta cur={income} prev={prev.income} goodWhenUp />
      </div>
      <div className="card">
        <div className="stat-top">
          <div className="lbl">Expenses</div>
          <span className="badge expense">
            <svg viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H9M17 7v8" /></svg>
          </span>
        </div>
        <div className="num expense">{money(expenses)}</div>
        <Delta cur={expenses} prev={prev.expenses} goodWhenUp={false} />
      </div>
    </div>
  );
}