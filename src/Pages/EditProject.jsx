import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import MessageModal from "../components/MessageModal";
import "./../styles/ProjectDetails.CSS";

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

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

  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

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
    // eslint-disable-next-line
  }, [id]);

  const fetchProject = async () => {
    try {
      const token = getToken();
      const res = await axios.get(
        `http://127.0.0.1:8000/api/projects/${id}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const p = res.data;
      setForm({
        name: p.name || "",
        sector: p.sector || "",
        otherSector: p.otherSector || "",
        description: p.description || "",
        status: p.status || "active",
      });
    } catch {
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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsgCfg({
        title: "Saved",
        message: "Project updated successfully. Redirecting…",
        variant: "success",
      });
      setMsgOpen(true);

      // ✅ CORRECT ROUTE + SAFE DELAY
      setTimeout(() => {
        setMsgOpen(false);
        navigate(`/projects/${id}`, { replace: true });
      }, 1500);

    } catch {
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
          <button className="btn btn-light" onClick={handleCancel}>
            ← Back
          </button>
        </div>

        <h2 className="pd-title">Edit Project</h2>

        <div className="pd-form">
          <label className="pd-label">Project Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="pd-input"
          />

          <label className="pd-label">Sector</label>
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
            <>
              <label className="pd-label">Specify Sector</label>
              <input
                name="otherSector"
                value={form.otherSector}
                onChange={handleChange}
                className="pd-input"
              />
            </>
          )}

          <label className="pd-label">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="pd-textarea"
          />

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

        <div className="pd-actions">
          <button className="btn btn-outline" onClick={handleCancel}>
            Cancel
          </button>

          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* ✅ Auto-close modal (no OK button needed) */}
      <MessageModal
        open={msgOpen}
        title={msgCfg.title}
        message={msgCfg.message}
        variant={msgCfg.variant}
        autoClose
      />
    </div>
  );
};

export default EditProject;
