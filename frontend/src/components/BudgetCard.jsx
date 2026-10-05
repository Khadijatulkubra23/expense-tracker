import { useEffect, useState } from "react";
import { deleteBudget, getBudgets } from "../api";
import { money } from "../utils";
import BudgetModal from "./BudgetModal";
import ConfirmModal from "./ConfirmModal";

const tone = (pct) => (pct >= 100 ? "bad" : pct >= 80 ? "warn" : "good");

export default function BudgetCard({ month, refreshKey }) {
  const [budgets, setBudgets] = useState(null);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    setError("");
    getBudgets(month).then(setBudgets).catch((e) => setError(e.message));
  }, [month, refreshKey, version]);

  const reload = () => setVersion((v) => v + 1);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteBudget(toDelete.id);
      setToDelete(null);
      reload();
    } catch (e) {
      setDeleteError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="card">
      <div className="card-head">
        <h3>
          Budgets <span>Monthly limits</span>
        </h3>
        <button className="btn btn-small" onClick={() => setModal({ budget: null })}>+ Set budget</button>
      </div>

      {error && <p className="error">{error}</p>}
      {!budgets && !error && <div className="skeleton" />}
      {budgets && budgets.length === 0 && (
        <p className="lbl">No budgets yet. Set a limit for a category and track it all month.</p>
      )}

      <div className="budget-grid">
        {budgets?.map((b) => (
          <div className="budget" key={b.id}>
            <div className="budget-top">
              <div>
                <p>{b.category}</p>
                <small>{money(b.spent)} of {money(b.monthly_limit)}</small>
              </div>
              <div className="row-actions">
                <button className="icon-btn" aria-label="Edit budget" onClick={() => setModal({ budget: b })}>
                  <svg viewBox="0 0 24 24"><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16v4z" /></svg>
                </button>
                <button
                  className="icon-btn danger"
                  aria-label="Delete budget"
                  onClick={() => {
                    setDeleteError("");
                    setToDelete(b);
                  }}
                >
                  <svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></svg>
                </button>
              </div>
            </div>
            <div className="bar">
              <div className={`fill ${tone(b.percent)}`} style={{ width: `${Math.min(b.percent, 100)}%` }} />
            </div>
            <div className="budget-foot">
              <span className={tone(b.percent)}>{b.percent}% used</span>
              <span>{b.remaining >= 0 ? `${money(b.remaining)} left` : `Over by ${money(-b.remaining)}`}</span>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <BudgetModal
          budget={modal.budget}
          taken={(budgets || []).map((b) => b.category)}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            reload();
          }}
        />
      )}

      {toDelete && (
        <ConfirmModal
          title="Delete budget?"
          message={`The ${toDelete.category} budget (${money(toDelete.monthly_limit)} per month) will be removed. Your transactions stay untouched.`}
          busy={deleting}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}