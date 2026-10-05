import { useEffect, useState } from "react";
import { createTransaction, updateTransaction } from "../api";
import { today } from "../utils";

const CATEGORIES = {
  expense: ["Food", "Rent", "Transport", "Shopping", "Bills", "Health", "Entertainment", "Other"],
  income: ["Salary", "Freelance", "Gift", "Other"],
};

export default function TransactionModal({ tx, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: tx?.title ?? "",
    amount: tx?.amount ?? "",
    type: tx?.type ?? "expense",
    category: tx?.category ?? "Food",
    date: tx?.date ?? today(),
    note: tx?.note ?? "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const setType = (type) => setForm({ ...form, type, category: CATEGORIES[type][0] });

  const options = CATEGORIES[form.type].includes(form.category)
    ? CATEGORIES[form.type]
    : [form.category, ...CATEGORIES[form.type]];

  const submit = async (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!form.title.trim()) return setError("Enter a title");
    if (!(amount > 0)) return setError("Amount must be greater than 0");

    setSaving(true);
    const payload = { ...form, title: form.title.trim(), amount, note: form.note.trim() || null };
    try {
      if (tx) await updateTransaction(tx.id, payload);
      else await createTransaction(payload);
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit}>
        <h2>{tx ? "Edit transaction" : "Add transaction"}</h2>

        <div className="seg">
          <button type="button" className={form.type === "expense" ? "active expense" : ""} onClick={() => setType("expense")}>
            Expense
          </button>
          <button type="button" className={form.type === "income" ? "active income" : ""} onClick={() => setType("income")}>
            Income
          </button>
        </div>

        <label className="field">
          Title
          <input value={form.title} onChange={set("title")} placeholder="Groceries" autoFocus />
        </label>

        <div className="two">
          <label className="field">
            Amount
            <input type="number" min="0" step="0.01" value={form.amount} onChange={set("amount")} placeholder="0.00" />
          </label>
          <label className="field">
            Date
            <input type="date" value={form.date} onChange={set("date")} />
          </label>
        </div>

        <label className="field">
          Category
          <select value={form.category} onChange={set("category")}>
            {options.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="field">
          Note (optional)
          <textarea rows="2" value={form.note} onChange={set("note")} />
        </label>

        {error && <p className="error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}