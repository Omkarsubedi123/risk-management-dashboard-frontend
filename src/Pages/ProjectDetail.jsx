import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import MessageModal from "../components/MessageModal";
import ConfirmModal from "../components/ConfirmModal";
import "../styles/ProjectDetails.css";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const [risks, setRisks] = useState([]);
  const [riskLoading, setRiskLoading] = useState(true);

  const [msgOpen, setMsgOpen] = useState(false);
  const [msgCfg, setMsgCfg] = useState({
    title: "",
    message: "",
    variant: "success",
  });

  const [confirmOpen, setConfirmOpen] = useState(false);

  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [id]);

  const loadData = async () => {
    await Promise.all([fetchProject(), fetchRisks()]);
    setLoading(false);
  };

  /* ================= PROJECT ================= */

  const fetchProject = async () => {
    try {
      const token = getToken();
      const res = await axios.get(
        `http://127.0.0.1:8000/api/projects/${id}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProject(res.data);
      setStatus(res.data.status || "active");
    } catch {
      showMsg("Error", "Failed to load project.", "error");
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    try {
      const token = getToken();
      await axios.patch(
        `http://127.0.0.1:8000/api/projects/${id}/status/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showMsg("Updated", "Project status updated.", "success");
    } catch {
      showMsg("Failed", "Status update failed.", "error");
    }
  };

  const handleDelete = async () => {
    setConfirmOpen(false);
    try {
      const token = getToken();
      await axios.delete(`http://127.0.0.1:8000/api/projects/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/projects");
    } catch {
      showMsg("Delete Failed", "Unable to delete project.", "error");
    }
  };

  /* ================= RISKS ================= */

  const fetchRisks = async () => {
    try {
      const token = getToken();
      const res = await axios.get(
        `http://127.0.0.1:8000/api/risks/?project=${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRisks(res.data);
    } catch {
      showMsg("Error", "Failed to load risks.", "error");
    } finally {
      setRiskLoading(false);
    }
  };

  const showMsg = (title, message, variant) => {
    setMsgCfg({ title, message, variant });
    setMsgOpen(true);
  };

  if (loading || !project)
    return <div className="pd-loading">Loading project…</div>;

  return (
    <div className="pd-page">
    <div className="pd-container">
      {/* ================= PROJECT CARD ================= */}
      <div className="pd-card">
        <button className="btn btn-light" onClick={() => navigate("/projects")}>
          ← Back to Projects
        </button>

        <h2 className="pd-title">{project.name}</h2>
        <p className="pd-sub">{project.sector}</p>
        <p className="pd-desc">
          {project.description || "No description provided."}
        </p>

        <div className="pd-grid">
          <div className="pd-row">
            <div className="pd-label">Status</div>
            <select value={status} onChange={handleStatusChange}>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="pd-row">
            <div className="pd-label">Created</div>
            <div>{new Date(project.created_at).toLocaleString()}</div>
          </div>

          <div className="pd-row">
            <div className="pd-label">Updated</div>
            <div>{new Date(project.updated_at).toLocaleString()}</div>
          </div>
        </div>

        <div className="pd-actions">
          <button
            className="btn btn-outline"
            onClick={() =>
              navigate(`/projects/${id}/edit`, { state: { project } })
            }
          >
            ✏️ Edit Project
          </button>

          <button
            className="btn btn-danger"
            onClick={() => setConfirmOpen(true)}
          >
            🗑 Delete Project
          </button>
        </div>
      </div>

      {/* ================= RISK LIST ================= */}
      <div className="pd-card risk-card">
        <div className="pd-top">
          <h3>Project Risks</h3>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/projects/${id}/risks/create`)}
          >
            ➕ Add Risk
          </button>
        </div>

        {riskLoading ? (
          <p>Loading risks…</p>
        ) : risks.length === 0 ? (
          <p className="pd-muted">No risks added yet.</p>
        ) : (
          <table className="pd-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Score</th>
                <th>Level</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((risk) => (
                <tr key={risk.id}>
                  <td>{risk.title}</td>
                  <td>{risk.risk_score}</td>
                  <td>
                    <span
                      className={`badge badge-${risk.risk_level?.toLowerCase()}`}
                    >
                      {risk.risk_level}
                    </span>
                  </td>
                  <td>{risk.status}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-link"
                      onClick={() => navigate(`/risks/${risk.id}`,{state:{projectId:id}})}
                    >
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      </div>

      <MessageModal {...msgCfg} open={msgOpen} onClose={() => setMsgOpen(false)} />
      <ConfirmModal
        open={confirmOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this project?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default ProjectDetail;
