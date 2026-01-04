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
      .then((res) => setMembers(res.data));
  }, [projectId]);

  return (
    <div className="pd-card">
      <div className="pd-top">
        <h3>Team Members</h3>
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
        <table className="pd-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td>{m.username}</td>
                <td>
                  <span className={`badge badge-${m.role.toLowerCase()}`}>
                    {m.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TeamPreviewCard;
