import React from "react";
import "./../styles/ProjectDetails.CSS";

const ConfirmModal = ({ open, title, message, onConfirm, onCancel }) => {
  if (!open) return null;
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
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
