import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { getByCategory } from "../api";
import { money, tooltipStyle } from "../utils";

const COLORS = ["var(--violet)", "var(--teal)", "var(--amber)", "var(--rose)", "#7d9bb0", "#b07d9b", "#c9a27e", "#8c7466"];

export default function CategoryChart({ month, refreshKey }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    getByCategory(month).then(setData).catch((e) => setError(e.message));
  }, [month, refreshKey]);

  const total = data ? data.reduce((sum, d) => sum + d.total, 0) : 0;

  return (
    <div className="card">
      <h3>Spending by category</h3>
      {error && <p className="error">{error}</p>}
      {data && data.length === 0 && <p className="lbl">No expenses this month.</p>}
      {data && data.length > 0 && (
        <>
          <div className="donut">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="total" nameKey="category" innerRadius="62%" outerRadius="92%" paddingAngle={3} stroke="none">
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => money(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center">
              <strong>{money(total)}</strong>
              <span className="lbl">spent</span>
            </div>
          </div>
          <div className="cats">
            {data.map((d, i) => (
              <div key={d.category}>
                <span><i style={{ background: COLORS[i % COLORS.length] }} />{d.category}</span>
                <b>{d.percent}%</b>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}