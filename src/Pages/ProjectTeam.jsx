import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import InviteMemberModal from "../components/InviteMemberModal";
import MessageModal from "../components/MessageModal";
import ConfirmModal from "../components/ConfirmModal";
import "../styles/Team.css";

const ProjectTeam = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [inviteOpen, setInviteOpen] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const [msgOpen, setMsgOpen] = useState(false);
  const [msgCfg, setMsgCfg] = useState({
    title: "",
    message: "",
    variant: "success",
  });

  const token =
    localStorage.getItem("access") || sessionStorage.getItem("access");

  const showMsg = (title, message, variant = "success") => {
    setMsgCfg({ title, message, variant });
    setMsgOpen(true);
  };

  const fetchMembers = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/projects/${id}/members/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMembers(res.data);
    } catch {
      showMsg("Error", "Failed to load team members.", "error");
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line
  }, [id]);

  /* ================= REMOVE MEMBER ================= */

  const confirmRemove = (member) => {
    setSelectedMember(member);
    setConfirmOpen(true);
  };

  const removeMember = async () => {
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/projects/${id}/members/${selectedMember.id}/remove/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showMsg("Removed", "Team member removed successfully.");
      fetchMembers();
    } catch (err) {
      showMsg(
        "Failed",
        err.response?.data?.detail || "Unable to remove member.",
        "error"
      );
    } finally {
      setConfirmOpen(false);
      setSelectedMember(null);
    }
  };

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
              <th />
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td>{m.username}</td>
                <td>{m.email}</td>
                <td>{m.role}</td>
                <td>
                  {m.role !== "PM" && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => confirmRemove(m)}
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InviteMemberModal
  open={inviteOpen}
  projectId={id}
  onClose={() => setInviteOpen(false)}
  onSuccess={(message, variant) => {
    setInviteOpen(false);
    fetchMembers();
    showMsg(
      variant === "error" ? "Failed" : "Info",
      message,
      variant
    );
  }}
/>

      {/* CONFIRM REMOVE */}
      <ConfirmModal
        open={confirmOpen}
        title="Remove Team Member"
        message={`Are you sure you want to remove ${
          selectedMember?.email || "this member"
        } from the project?`}
        onConfirm={removeMember}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* TOAST MESSAGE */}
      <MessageModal
        {...msgCfg}
        open={msgOpen}
        onClose={() => setMsgOpen(false)}
      />
    </div>
  );
};

export default ProjectTeam;
