import React, { useState } from "react";
import axios from "axios";

const InviteMemberModal = ({ open, projectId, onClose, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("TM");

  const token =
    localStorage.getItem("access") || sessionStorage.getItem("access");

  if (!open) return null;

  const invite = async () => {
    await axios.post(
      `http://127.0.0.1:8000/api/projects/${projectId}/invite/`,
      { email, role },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    onSuccess();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Invite Team Member</h3>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="TM">Team Member</option>
          <option value="PM">Project Manager</option>
        </select>

        <div className="modal-actions">
          <button className="btn btn-muted" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={invite}>
            Invite
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteMemberModal;
