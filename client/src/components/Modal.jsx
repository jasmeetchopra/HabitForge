import { useEffect } from "react";

// A reusable modal. The parent controls whether it's open and what happens
// on confirm/cancel, so we can use it for delete confirmations or anything.
export const Modal = ({
  open,
  title,
  children,
  onClose,
  onConfirm,
  confirmLabel = "Confirm",
  confirmDanger = false,
}) => {
  // Close on Escape key for keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      {/* stop clicks inside the modal from closing it */}
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {title && <h3>{title}</h3>}
        <div>{children}</div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          {onConfirm && (
            <button
              className={`btn ${confirmDanger ? "btn-danger" : "btn-primary"}`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
