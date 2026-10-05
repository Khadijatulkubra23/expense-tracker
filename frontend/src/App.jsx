import { useEffect, useState } from "react";
import { getMonthly, getSummary } from "./api";
import { currentMonth, prevMonth } from "./utils";
import { useToast } from "./toastContext";
import ToastProvider from "./ToastProvider";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import SummaryCards from "./components/SummaryCards";
import Insights from "./components/Insights";
import MonthlyChart from "./components/MonthlyChart";
import CategoryChart from "./components/CategoryChart";
import Heatmap from "./components/Heatmap";
import BudgetCard from "./components/BudgetCard";
import CsvTools from "./components/CsvTools";
import TransactionList from "./components/TransactionList";
import TransactionModal from "./components/TransactionModal";
import "./App.css";

function Dashboard() {
  const notify = useToast();
  const [month, setMonth] = useState(currentMonth());
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [failed, setFailed] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [modal, setModal] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    setFailed(false);
    Promise.all([getSummary(month), getSummary(prevMonth(month)), getMonthly(6)])
      .then(([cur, prev, trend]) => {
        setSummary({ cur, prev });
        setMonthly(trend);
      })
      .catch(() => setFailed(true));
  }, [month, refreshKey]);

  return (
    <div className="layout">
      <Sidebar theme={theme} onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} />
      <main className="main">
        <Header month={month} onMonthChange={setMonth} onAdd={() => setModal({ tx: null })} />

        {failed && (
          <div className="banner">
            <span>Couldn't load your data. Make sure the backend is running.</span>
            <button className="btn-ghost" onClick={refresh}>Retry</button>
          </div>
        )}

        <section id="dashboard">
          {summary ? (
            <SummaryCards summary={summary.cur} prev={summary.prev} trend={monthly} />
          ) : (
            <div className="grid top">
              <div className="card skeleton" />
              <div className="card skeleton" />
              <div className="card skeleton" />
            </div>
          )}
        </section>

        <section className="section-gap">
          <Insights month={month} refreshKey={refreshKey} income={summary?.cur.income} />
        </section>

        <section id="analytics" className="grid mid section-gap">
          <MonthlyChart data={monthly} />
          <CategoryChart month={month} refreshKey={refreshKey} />
        </section>

        <section id="heatmap" className="section-gap">
          <Heatmap month={month} refreshKey={refreshKey} />
        </section>

        <section id="budgets" className="section-gap">
          <BudgetCard month={month} refreshKey={refreshKey} />
        </section>

        <section id="transactions" className="section-gap">
          <CsvTools onImported={refresh} />
          <TransactionList month={month} refreshKey={refreshKey} onEdit={(tx) => setModal({ tx })} onChange={refresh} />
        </section>
      </main>

      {modal && (
        <TransactionModal
          tx={modal.tx}
          onClose={() => setModal(null)}
          onSaved={() => {
            notify(modal.tx ? "Transaction updated" : "Transaction added", { tone: "success" });
            setModal(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Dashboard />
    </ToastProvider>
  );
}