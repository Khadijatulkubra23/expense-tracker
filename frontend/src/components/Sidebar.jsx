import { useState } from "react";

const items = [
  { id: "dashboard", label: "Dashboard", icon: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></> },
  { id: "transactions", label: "Transactions", icon: <path d="M7 4v16M7 4L3 8M7 4l4 4M17 20V4M17 20l-4-4M17 20l4-4" /> },
  { id: "analytics", label: "Analytics", icon: <path d="M5 20v-8M12 20V4M19 20v-6" /> },
    { id: "budgets", label: "Budgets", icon: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /></> },
];

export default function Sidebar({ theme, onToggleTheme }) {
  const [active, setActive] = useState("dashboard");

  return (
    <aside className="sidebar">
      <div className="logo">
        <span className="logo-icon">
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7h15a3 3 0 0 1 3 3v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <path d="M3 7l12-3v3" />
            <circle cx="16.5" cy="14" r="1" />
          </svg>
        </span>
        Spendly
      </div>

      <nav className="nav">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={active === item.id ? "active" : ""}
            onClick={() => setActive(item.id)}
          >
            <svg viewBox="0 0 24 24">{item.icon}</svg>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="side-bottom">
        <button className="theme-btn" onClick={onToggleTheme}>
          <svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
          <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>
      </div>
    </aside>
  );
}