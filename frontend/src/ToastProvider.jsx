import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ToastContext } from "./toastContext";

let nextId = 1;

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message, options = {}) => {
      const id = nextId++;
      setToasts((list) => [...list.slice(-2), { id, message, tone: options.tone || "info", action: options.action }]);
      timers.current[id] = setTimeout(() => dismiss(id), options.duration ?? 4500);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={notify}>
      {children}
      {createPortal(
        <div className="toasts" aria-live="polite">
          {toasts.map((t) => (
            <div className={`toast ${t.tone}`} key={t.id} role="status">
              <span>{t.message}</span>
              {t.action && (
                <button
                  onClick={() => {
                    t.action.run();
                    dismiss(t.id);
                  }}
                >
                  {t.action.label}
                </button>
              )}
              <button className="toast-x" aria-label="Dismiss" onClick={() => dismiss(t.id)}>×</button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}