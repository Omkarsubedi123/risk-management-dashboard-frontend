import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import MessageModal from "../components/MessageModal";
import "./../styles/ProjectDetails.CSS";

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Initial project passed from Project Details page
  const initialProject = location.state?.project || null;

  const [form, setForm] = useState({
    name: "",
    sector: "",
    otherSector: "",
    description: "",
    status: "active",
  });

  const [loading, setLoading] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [msgCfg, setMsgCfg] = useState({
    title: "",
    message: "",
    variant: "success",
  });

  useEffect(() => {
    if (initialProject) {
      setForm({
        name: initialProject.name || "",
        sector: initialProject.sector || "",
        otherSector: initialProject.otherSector || "",
        description: initialProject.description || "",
        status: initialProject.status || "active",
      });
    } else {
      fetchProject();
    }
  }, [initialProject, id]);

  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  const fetchProject = async () => {
    try {
      const token = getToken();
      const res = await axios.get(
        `http://127.0.0.1:8000/api/projects/${id}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const p = res.data;

      setForm({
        name: p.name || "",
        sector: p.sector || "",
        otherSector: p.otherSector || "",
        description: p.description || "",
        status: p.status || "active",
      });
    } catch (err) {
      setMsgCfg({
        title: "Error",
        message: "Unable to load project.",
        variant: "error",
      });
      setMsgOpen(true);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCancel = () => navigate(-1);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = getToken();

      await axios.patch(
        `http://127.0.0.1:8000/api/projects/${id}/`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMsgCfg({
        title: "Saved",
        message: "Project updated successfully.",
        variant: "success",
      });
      setMsgOpen(true);

      setTimeout(() => navigate(`/project/${id}`), 2000);
    } catch (err) {
      setMsgCfg({
        title: "Error",
        message: "Failed to save changes.",
        variant: "error",
      });
      setMsgOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pd-page">
      <div className="pd-card">

        {/* Back Button */}
        <div className="pd-top">
          <button
            onClick={() => navigate(-1)}
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

        <h2  style={{ padding: "8z``px 0" }} className="pd-title pt-5px">Edit Project</h2>

        <div className="pd-form">

          {/* Project Name */}
          <label style={{ padding: "5px 0" }} className="pd-label pt-5px">Project Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="pd-input"
          />

          {/* Sector */}
          <label className="pd-labels">Sector</label>
          <select
            name="sector"
            className="pd-select"
            value={form.sector}
            onChange={handleChange}
          >
            <option value="">Select sector</option>
            <option value="Health">Health</option>
            <option value="Education">Education</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Technology">Technology</option>
            <option value="Other">Other</option>
          </select>

          {form.sector === "Other" && (
            <div className="mb-3">
              <label className="pd-label">Specify Sector</label>
              <input
                type="text"
                name="otherSector"
                className="pd-input"
                placeholder="Enter custom sector"
                value={form.otherSector}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Description */}
          <div className="mt-3">
            <label className="pd-label">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="pd-textarea"
            />
          </div>

          {/* Status */}
          <label className="pd-label">Status</label>
          <select
            name="status"
            className="pd-select"
            value={form.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="pd-actions">
          {/* Cancel Button */}
          <button
            onClick={handleCancel}
            disabled={loading}
            style={{
              background: "#d3d3d3",
              padding: "10px 20px",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: 600,
              color: "#333",
              border: "none",
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#a9a9a9";
              e.target.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#d3d3d3";
              e.target.style.color = "#333";
            }}
          >
            Cancel
          </button>

          {/* Save Button */}
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      <MessageModal
        open={msgOpen}
        title={msgCfg.title}
        message={msgCfg.message}
        variant={msgCfg.variant}
        onClose={() => setMsgOpen(false)}
      />
    </div>
  );
};

export default EditProject;
