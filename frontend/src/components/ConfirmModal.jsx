import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function ConfirmModal({ title, message, confirmLabel = "Delete", busy, error, onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !busy && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  return createPortal(
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && !busy && onCancel()}>
      <div className="modal confirm" role="alertdialog" aria-labelledby="confirm-title">
        <div className="confirm-icon">
          <svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></svg>
        </div>
        <h2 id="confirm-title">{title}</h2>
        <p className="confirm-text">{message}</p>
        {error && <p className="error">{error}</p>}
        <div className="modal-actions">
          <button className="btn-ghost" onClick={onCancel} disabled={busy} autoFocus>Cancel</button>
          <button className="btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}