import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { bulkCreate, getTransactions } from "../api";
import { downloadCsv, parseCsv, rowsToTransactions, toCsv } from "../csv";
import { money, shortDate, today } from "../utils";

export default function CsvTools({ onImported }) {
  const fileRef = useRef(null);
  const [msg, setMsg] = useState("");
  const [review, setReview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [importError, setImportError] = useState("");

  useEffect(() => {
    if (!review) return;
    const onKey = (e) => e.key === "Escape" && !busy && setReview(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [review, busy]);

  const exportCsv = async () => {
    setMsg("");
    try {
      const items = await getTransactions();
      if (!items.length) return setMsg("Nothing to export yet.");
      downloadCsv(toCsv(items), `spendly-transactions-${today()}.csv`);
    } catch (e) {
      setMsg(e.message);
    }
  };

  const pickFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setMsg("");
    setImportError("");
    if (file.size > 1_000_000) return setMsg("That file is too large (max 1 MB).");
    setReview(rowsToTransactions(parseCsv(await file.text())));
  };

  const confirm = async () => {
    setBusy(true);
    setImportError("");
    try {
      await bulkCreate(review.items);
      setMsg(`Imported ${review.items.length} transactions.`);
      setReview(null);
      onImported();
    } catch (e) {
      setImportError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const close = () => !busy && setReview(null);
  const hasProblems = review && (review.error || review.errors.length > 0);

  return (
    <div className="section-bar">
      {msg && <span className="msg">{msg}</span>}
      <button className="btn-ghost sm" onClick={exportCsv}>Export CSV</button>
      <button className="btn-ghost sm" onClick={() => fileRef.current.click()}>Import CSV</button>
      <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={pickFile} />

      {review &&
        createPortal(
          <div className="overlay" onClick={(e) => e.target === e.currentTarget && close()}>
            <div className="modal">
              <h2>{hasProblems ? "Can't import this file" : `Import ${review.items.length} transactions?`}</h2>

              {review.error && <p className="review-sub">{review.error}</p>}

              {review.errors?.length > 0 && (
                <>
                  <p className="review-sub">Nothing was imported. Fix these rows and try again:</p>
                  <ul className="review-list errs">
                    {review.errors.slice(0, 5).map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                    {review.errors.length > 5 && <li>...and {review.errors.length - 5} more</li>}
                  </ul>
                </>
              )}

              {!hasProblems && (
                <>
                  <p className="review-sub">Preview of the first few rows:</p>
                  <ul className="review-list">
                    {review.items.slice(0, 5).map((t, i) => (
                      <li key={i}>
                        <span>{t.title} · {shortDate(t.date)}</span>
                        <b className={t.type === "income" ? "income" : "expense"}>
                          {t.type === "income" ? "+" : "-"}{money(t.amount)}
                        </b>
                      </li>
                    ))}
                    {review.items.length > 5 && <li>...and {review.items.length - 5} more</li>}
                  </ul>
                  <p className="review-sub">Imports don't check for duplicates, so importing a file twice adds everything twice.</p>
                </>
              )}

              {importError && <p className="error">{importError}</p>}

              <div className="modal-actions">
                <button className="btn-ghost" onClick={close} disabled={busy}>
                  {hasProblems ? "Close" : "Cancel"}
                </button>
                {!hasProblems && (
                  <button className="btn" onClick={confirm} disabled={busy}>
                    {busy ? "Importing..." : "Import"}
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}