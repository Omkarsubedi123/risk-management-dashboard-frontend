import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TeamPreviewCard = ({ projectId }) => {
  const [members, setMembers] = useState([]);
  const navigate = useNavigate();

  const token =
    localStorage.getItem("access") || sessionStorage.getItem("access");

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/projects/${projectId}/members/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMembers(res.data.slice(0, 3)));
  }, [projectId]);

  return (
    <div className="pd-card">
      <div className="pd-top">
        <h3>Project Team</h3>
        <button
          className="btn btn-outline"
          onClick={() => navigate(`/projects/${projectId}/team`)}
        >
          Manage Team →
        </button>
      </div>

      {members.length === 0 ? (
        <p className="pd-muted">No team members added yet.</p>
      ) : (
        <ul className="team-preview-list">
          {members.map((m) => (
            <li key={m.id}>
              <strong>{m.user?.full_name || "Member"}</strong>
              <span>{m.user?.email}</span>
              <span className="badge badge-medium">{m.role}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TeamPreviewCard;
