import React, { useState } from "react";
import axios from "axios";

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
      const token = localStorage.getItem("access") || sessionStorage.getItem("access");

      if (!token) {
        alert("❌ No token found! Please login first.");
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

      console.log("SUCCESS:", response.data);

      alert("✅ Project created successfully!");
      setFormData({ name: "", description: "", sector: "", otherSector: "" });

    } catch (err) {
      console.error("ERROR:", err.response ? err.response.data : err);
      alert("❌ Failed to create project. Check console.");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm p-4">
        <h3 className="mb-4 text-center">Create New Project</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Project Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-control"
              rows="3"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label">Sector</label>
            <select
              name="sector"
              className="form-select"
              value={formData.sector}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Sector --</option>
              <option value="Finance">Finance</option>
              <option value="IT">IT</option>
              <option value="Construction">Construction</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {formData.sector === "Other" && (
            <div className="mb-3">
              <label className="form-label">Other Sector</label>
              <input
                type="text"
                name="otherSector"
                className="form-control"
                value={formData.otherSector}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100">
            Create Project
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProjects;
