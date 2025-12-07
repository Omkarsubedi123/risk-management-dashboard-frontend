import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import MessageModal from "../components/MessageModal";
import ConfirmModal from "../components/ConfirmModal";
import "./../styles/ProjectDetails.CSS";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [msgOpen, setMsgOpen] = useState(false);
  const [msgCfg, setMsgCfg] = useState({ title: "", message: "", variant: "success" });

  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line
  }, [id]);

  const getToken = () => localStorage.getItem("access") || sessionStorage.getItem("access");

  const fetchProject = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      const res = await axios.get(`http://127.0.0.1:8000/api/projects/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(res.data);
      setStatus(res.data.status || "active");
    } catch (err) {
      console.error("Error loading project:", err);
      setMsgCfg({ title: "Error", message: "Could not load project. Try again.", variant: "error" });
      setMsgOpen(true);
    } finally {
      setLoading(false);
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
      setMsgCfg({ title: "Status Updated", message: "Project status updated successfully.", variant: "success" });
      setMsgOpen(true);
      // refresh after short delay so user sees updated timestamps
      setTimeout(fetchProject, 700);
    } catch (err) {
      console.error("Error updating status:", err);
      setMsgCfg({ title: "Update Failed", message: "Unable to update project status.", variant: "error" });
      setMsgOpen(true);
    }
  };

  const handleDelete = async () => {
    setConfirmOpen(false);
    try {
      const token = getToken();
      await axios.delete(`http://127.0.0.1:8000/api/projects/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsgCfg({ title: "Deleted", message: "Project deleted successfully.", variant: "success" });
      setMsgOpen(true);
      setTimeout(() => navigate("/projects"), 900);
    } catch (err) {
      console.error("Error deleting project:", err);
      setMsgCfg({ title: "Delete Failed", message: "Unable to delete project.", variant: "error" });
      setMsgOpen(true);
    }
  };

  const openEdit = () => navigate(`/projects/${id}/edit`, { state: { project } });

  if (loading || !project) return <div className="pd-loading">Loading project details…</div>;

  return (
    <div className="pd-page">
      <div className="pd-card">
        <div className="pd-top">
          {/* <button className="btn btn-link" onClick={() => navigate("/projects")}>
            ← Back to Projects
          </button> */}
          <div className="pd-top">
          <button
            onClick={() => navigate("/projects")}
            style={{
              background: "#e8eef4",
              padding: "10px 18px",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: 600,
              color: "#2a3f54",
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#cfd9e3";
              e.target.style.color = "#1a2733";
              e.target.style.transform = "translateX(-3px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#e8eef4";
              e.target.style.color = "#2a3f54";
              e.target.style.transform = "translateX(0)";
            }}
          >
            ← Back
          </button>
        </div>
          <div />
        </div>

        <h2 className="pd-title">{project.name}</h2>
        <p className="pd-sub">{project.sector}</p>

        <p className="pd-desc">{project.description || "No description provided."}</p>

        <div className="pd-grid">
          <div className="pd-row">
            <div className="pd-label">Status</div>
            <div className="pd-value">
              <select value={status} onChange={handleStatusChange} className="pd-select">
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="pd-row">
            <div className="pd-label">Created</div>
            <div className="pd-value">{new Date(project.created_at).toLocaleString()}</div>
          </div>

          <div className="pd-row">
            <div className="pd-label">Updated</div>
            <div className="pd-value">{new Date(project.updated_at).toLocaleString()}</div>
          </div>

          <div className="pd-row">
            <div className="pd-label">Created By</div>
            <div className="pd-value">{project.created_by_email || "—"}</div>
          </div>
        </div>

        <div className="pd-actions">
          <button className="btn btn-secondary" onClick={() => fetchProject()}>
            ⟳ Refresh
          </button>

          <div className="pd-actions-right">
            <button className="btn btn-outline" onClick={openEdit}>
              ✏️ Edit
            </button>
            <button className="btn btn-danger" onClick={() => setConfirmOpen(true)}>
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>

      <MessageModal
        open={msgOpen}
        title={msgCfg.title}
        message={msgCfg.message}
        variant={msgCfg.variant === "error" ? "error" : "success"}
        onClose={() => setMsgOpen(false)}
      />

      <ConfirmModal
        open={confirmOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this project? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default ProjectDetail;
