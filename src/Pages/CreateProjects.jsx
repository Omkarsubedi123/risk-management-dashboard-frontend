// src/pages/CreateProjects.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AppNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/createProject.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const CreateProjects = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sector: "",
    otherSector: "",
  });

  const [loading, setLoading] = useState(false);

  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = getToken();

      if (!token) {
        toast.error("Please login first.");
        navigate("/login", { state: { forceLogin: true } });
        return;
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        sector: formData.sector === "Other" ? formData.otherSector : formData.sector,
      };

      await axios.post(`${backendUrl}/api/projects/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Project created successfully!");

      // small delay so user sees toast
      setTimeout(() => navigate("/projects", { replace: true }), 700);
    } catch (err) {
      console.error("ERROR:", err.response?.data || err);
      toast.error("Failed to create project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppNavbar />

      {/* Toast container */}
      <ToastContainer position="top-right" autoClose={2500} />

      {/* Header (Reports style) */}
      <div className="cp-header">
        <div className="container">
          <div className="cp-header-row">
            <div>
              <h1 className="cp-title">Create Project</h1>
              <p className="cp-subtitle">Add a new project to start managing risks.</p>
            </div>

            <button
              className="btn btn-outline-light cp-back-btn"
              onClick={() => navigate("/projects")}
              type="button"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container cp-container">
        <div className="cp-card">
          <div className="cp-card-head">
            <h4 className="cp-card-title">Project Details</h4>
            <p className="cp-card-hint">Fields marked * are required</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Project Name */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Project Name *</label>
              <input
                type="text"
                name="name"
                className="form-control cp-input"
                placeholder="Enter project title"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Description</label>
              <textarea
                name="description"
                className="form-control cp-input"
                rows="4"
                placeholder="Brief project summary"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Sector */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Sector *</label>
              <select
                name="sector"
                className="form-select cp-input"
                value={formData.sector}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Sector --</option>
                <option value="IT/Software">IT & Software</option>
                <option value="Construction">Construction</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Other Sector */}
            {formData.sector === "Other" && (
              <div className="mb-3">
                <label className="form-label fw-semibold">Specify Sector *</label>
                <input
                  type="text"
                  name="otherSector"
                  className="form-control cp-input"
                  placeholder="Enter custom sector"
                  value={formData.otherSector}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {/* Buttons */}
            <div className="cp-actions">
              <button
                type="submit"
                className="btn btn-primary cp-submit"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Project"}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary cp-cancel"
                onClick={() => navigate("/projects")}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CreateProjects;
