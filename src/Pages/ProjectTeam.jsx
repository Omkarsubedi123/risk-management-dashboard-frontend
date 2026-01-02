import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import InviteMemberModal from "../components/InviteMemberModal";
import "../styles/Team.css";

const ProjectTeam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [inviteOpen, setInviteOpen] = useState(false);

  const token =
    localStorage.getItem("access") || sessionStorage.getItem("access");

  const fetchMembers = () => {
    axios
      .get(`http://127.0.0.1:8000/api/projects/${id}/members/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMembers(res.data));
  };

  useEffect(fetchMembers, [id]);

  return (
    <div className="team-page">
      <div className="team-card">
        <div className="team-header">
          <h2>Project Team</h2>
          <button className="btn btn-light" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>

        <button className="btn btn-primary" onClick={() => setInviteOpen(true)}>
          ➕ Invite Member
        </button>

        <table className="team-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td>{m.user?.full_name}</td>
                <td>{m.user?.email}</td>
                <td>{m.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InviteMemberModal
        open={inviteOpen}
        projectId={id}
        onClose={() => setInviteOpen(false)}
        onSuccess={() => {
          setInviteOpen(false);
          fetchMembers();
        }}
      />
    </div>
  );
};

export default ProjectTeam;
