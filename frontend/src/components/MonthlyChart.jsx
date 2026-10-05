import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { money, tooltipStyle } from "../utils";

const label = (m) => new Date(`${m}-01T00:00:00`).toLocaleDateString("en-US", { month: "short" });

export default function MonthlyChart({ data }) {
  const rows = data ? data.map((r) => ({ ...r, name: label(r.month) })) : [];
  const empty = data && data.every((d) => !d.income && !d.expenses);

  return (
    <div className="card">
      <h3>
        Income vs expenses <span>Last 6 months</span>
      </h3>
      {!data && <div className="chart-box skeleton" />}
      {empty && <p className="lbl">Add some transactions to see your trend.</p>}
      {data && !empty && (
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--teal)" />
                  <stop offset="1" stopColor="var(--teal)" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--rose)" />
                  <stop offset="1" stopColor="var(--rose)" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--line)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--mu)", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--mu)", fontSize: 12 }} />
              <Tooltip cursor={{ fill: "var(--glow1)" }} contentStyle={tooltipStyle} formatter={(v) => money(v)} />
              <Bar dataKey="income" name="Income" fill="url(#gIncome)" radius={[8, 8, 0, 0]} barSize={14} />
              <Bar dataKey="expenses" name="Expenses" fill="url(#gExpense)" radius={[8, 8, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="legend">
        <span><i style={{ background: "var(--teal)" }} />Income</span>
        <span><i style={{ background: "var(--rose)" }} />Expenses</span>
      </div>
    </div>
  );
}