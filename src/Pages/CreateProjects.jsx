import React, { useState } from "react";
import axios from "axios";
import AppNavbar from "../components/Navbar"; 
import Footer from "../components/Footer";

const CreateProjects = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sector: "",
    otherSector: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token =
        localStorage.getItem("access") ||
        sessionStorage.getItem("access");

      if (!token) {
        alert("❌ Please login first.");
        window.location.href = "/login";
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        sector:
          formData.sector === "Other"
            ? formData.otherSector
            : formData.sector,
      };

      const response = await axios.post(
        "http://127.0.0.1:8000/api/projects/",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("✅ Project created successfully!");
      setFormData({
        name: "",
        description: "",
        sector: "",
        otherSector: "",
      });

    } catch (err) {
      console.error("ERROR:", err.response ? err.response.data : err);
      alert("❌ Failed to create project.");
    }
  };

  return (
    <>
      <AppNavbar />

      <div className="d-flex justify-content-center align-items-center mt-4 mb-5">
        <div
          className="card shadow-lg p-4"
          style={{
            width: "600px",
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: "15px",
            backdropFilter: "blur(6px)",
          }}
        >
          <h3 className="text-center fw-bold mb-3">
            📝 Create New Project
          </h3>

          <p className="text-center text-muted mb-4">
            Fill in the details below to add a new project.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Project Name */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Project Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
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
                className="form-control"
                rows="3"
                placeholder="Brief project summary"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Sector */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Sector</label>
              <select
                name="sector"
                className="form-select"
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

            {/* Other Sector Field */}
            {formData.sector === "Other" && (
              <div className="mb-3">
                <label className="form-label fw-semibold">Specify Sector</label>
                <input
                  type="text"
                  name="otherSector"
                  className="form-control"
                  placeholder="Enter custom sector"
                  value={formData.otherSector}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {/* Buttons */}
            <div className="mt-4 d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary w-100 fw-semibold"
              >
                Create Project
              </button>

              <a href="/projects" className="btn btn-outline-secondary w-100">
                Cancel
              </a>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CreateProjects;
