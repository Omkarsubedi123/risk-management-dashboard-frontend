import React from "react";
import "./../styles/ProjectDetails.CSS";

const MessageModal = ({ open, title, message, onClose, variant = "success" }) => {
  if (!open) return null;
  return (
    <div className="pd-modal-overlay" onClick={onClose}>
      <div className="pd-modal" onClick={(e) => e.stopPropagation()}>
        <div className={`pd-modal-header pd-modal-${variant}`}>
          <h3>{title}</h3>
        </div>
        <div className="pd-modal-body">
          <p>{message}</p>
        </div>
        <div className="pd-modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
