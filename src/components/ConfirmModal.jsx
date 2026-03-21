import React from "react";
import "./../styles/ProjectDetails.CSS";

const ConfirmModal = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Delete",
  cancelText = "Cancel",
  confirmVariant = "danger",
}) => {
  if (!open) return null;

  const getConfirmClass = () => {
    if (confirmVariant === "warning") return "btn btn-warning";
    if (confirmVariant === "primary") return "btn btn-primary";
    return "btn btn-danger";
  };

  return (
    <div className="pd-modal-overlay" onClick={onCancel}>
      <div className="pd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pd-modal-header pd-modal-warn">
          <h3>{title}</h3>
        </div>

        <div className="pd-modal-body">
          <p>{message}</p>
        </div>

        <div className="pd-modal-footer">
          <button className="btn btn-muted" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={getConfirmClass()} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;