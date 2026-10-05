import { useEffect, useMemo, useState } from "react";
import { createTransaction, deleteTransaction, getTransactions } from "../api";
import { money, shortDate } from "../utils";
import { useToast } from "../toastContext";
import ConfirmModal from "./ConfirmModal";

const PAGE = 8;

const SORTS = {
  "date-desc": { label: "Newest first", fn: (a, b) => b.date.localeCompare(a.date) || b.id - a.id },
  "date-asc": { label: "Oldest first", fn: (a, b) => a.date.localeCompare(b.date) || a.id - b.id },
  "amount-desc": { label: "Highest amount", fn: (a, b) => b.amount - a.amount || b.id - a.id },
  "amount-asc": { label: "Lowest amount", fn: (a, b) => a.amount - b.amount || a.id - b.id },
  "title-asc": { label: "Title A-Z", fn: (a, b) => a.title.localeCompare(b.title) || b.id - a.id },
};

export default function TransactionList({ month, refreshKey, onEdit, onChange }) {
  const notify = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");
  const [scope, setScope] = useState("month");
  const [sort, setSort] = useState("date-desc");
  const [visible, setVisible] = useState(PAGE);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    setError("");
    getTransactions()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  useEffect(() => setCategory("all"), [scope, month]);
  useEffect(() => setVisible(PAGE), [search, type, category, scope, month, sort]);

  const scoped = useMemo(
    () => (scope === "month" ? items.filter((t) => t.date.startsWith(month)) : items),
    [items, scope, month]
  );

  const categories = useMemo(() => [...new Set(scoped.map((t) => t.category))].sort(), [scoped]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scoped.filter(
      (t) =>
        (type === "all" || t.type === type) &&
        (category === "all" || t.category === category) &&
        (!q ||
          t.title.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.note || "").toLowerCase().includes(q))
    );
  }, [scoped, search, type, category]);

  const sorted = useMemo(() => [...filtered].sort(SORTS[sort].fn), [filtered, sort]);

  const clear = () => {
    setSearch("");
    setType("all");
    setCategory("all");
  };

  const askDelete = (tx) => {
    setDeleteError("");
    setToDelete(tx);
  };

  const confirmDelete = async () => {
    const tx = toDelete;
    setDeleting(true);
    try {
      await deleteTransaction(tx.id);
      setToDelete(null);
      onChange();
      notify(`Deleted "${tx.title}"`, {
        duration: 7000,
        action: {
          label: "Undo",
          run: async () => {
            try {
              await createTransaction({
                title: tx.title,
                amount: tx.amount,
                type: tx.type,
                category: tx.category,
                date: tx.date,
                note: tx.note,
              });
              onChange();
              notify(`Restored "${tx.title}"`, { tone: "success" });
            } catch {
              notify("Couldn't restore it. Is the backend running?", { tone: "error" });
            }
          },
        },
      });
    } catch (e) {
      setDeleteError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="card">
      <h3>
        Transactions <span>{filtered.length} of {scoped.length}</span>
      </h3>

      <div className="toolbar">
        <input
          className="filter-input search"
          placeholder="Search title, category, or note"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="chips">
          {["all", "income", "expense"].map((t) => (
            <button key={t} className={`chip ${type === t ? "active" : ""}`} onClick={() => setType(t)}>
              {t === "all" ? "All" : t === "income" ? "Income" : "Expenses"}
            </button>
          ))}
        </div>
        <select className="filter-input" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className="filter-input" value={scope} onChange={(e) => setScope(e.target.value)}>
          <option value="month">Selected month</option>
          <option value="all">All time</option>
        </select>
        <select className="filter-input" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by">
          {Object.entries(SORTS).map(([key, s]) => (
            <option key={key} value={key}>{s.label}</option>
          ))}
        </select>
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="lbl">Loading...</p>}
      {!loading && scoped.length === 0 && (
        <p className="lbl">No transactions {scope === "month" ? "this month" : "yet"}. Add one to get started.</p>
      )}
      {!loading && scoped.length > 0 && filtered.length === 0 && (
        <p className="lbl">
          No matches. <button className="link-btn" onClick={clear}>Clear filters</button>
        </p>
      )}

      {sorted.slice(0, visible).map((tx) => (
        <div className="row" key={tx.id}>
          <div className={`av ${tx.type === "income" ? "income" : "expense"}`}>{tx.title[0].toUpperCase()}</div>
          <div className="row-info">
            <p>{tx.title}</p>
            <small>{tx.category} · {shortDate(tx.date)}</small>
          </div>
          <div className={`amt ${tx.type === "income" ? "income" : "expense"}`}>
            {tx.type === "income" ? "+" : "-"}{money(tx.amount)}
          </div>
          <div className="row-actions">
            <button className="icon-btn" aria-label="Edit" onClick={() => onEdit(tx)}>
              <svg viewBox="0 0 24 24"><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16v4z" /></svg>
            </button>
            <button className="icon-btn danger" aria-label="Delete" onClick={() => askDelete(tx)}>
              <svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></svg>
            </button>
          </div>
        </div>
      ))}

      {sorted.length > visible && (
        <button className="btn-ghost more" onClick={() => setVisible(visible + PAGE)}>
          Show more ({sorted.length - visible} left)
        </button>
      )}

      {toDelete && (
        <ConfirmModal
          title="Delete transaction?"
          message={`"${toDelete.title}" (${money(toDelete.amount)}) will be removed. You'll get a few seconds to undo.`}
          busy={deleting}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}