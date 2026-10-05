import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { setBudget } from "../api";
import { EXPENSE_CATEGORIES } from "../utils";

export default function BudgetModal({ budget, taken, onClose, onSaved }) {
  const options = budget ? [budget.category] : EXPENSE_CATEGORIES.filter((c) => !taken.includes(c));
  const [category, setCategory] = useState(options[0] ?? "");
  const [limit, setLimit] = useState(budget?.monthly_limit ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    const monthly_limit = Number(limit);
    if (!category) return setError("Every category already has a budget");
    if (!(monthly_limit > 0)) return setError("Limit must be greater than 0");

    setSaving(true);
    try {
      await setBudget({ category, monthly_limit });
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return createPortal(
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit}>
        <h2>{budget ? "Edit budget" : "Set a budget"}</h2>

        {!options.length && <p className="lbl">Every category already has a budget. Edit an existing one instead.</p>}

        <label className="field">
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={!!budget}>
            {options.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="field">
          Monthly limit
          <input type="number" min="0" step="0.01" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="300" autoFocus />
        </label>

        {error && <p className="error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn" disabled={saving || !options.length}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}