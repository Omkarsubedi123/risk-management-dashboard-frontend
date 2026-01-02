import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CreateRisk.css";

const CreateRisk = () => {
  const { id } = useParams(); // MUST match :id in route
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    probability: "",
    impact: "",
    estimated_cost: "",
    risk_decision: "Mitigate",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      const payload = {
        project: Number(id),
        title: formData.title.trim(),
        description: formData.description.trim(),
        probability: Number(formData.probability),
        impact: Number(formData.impact),
        risk_decision: formData.risk_decision,
      };

      if (formData.estimated_cost !== "") {
        payload.estimated_cost = Number(formData.estimated_cost);
      }

      await axios.post("http://127.0.0.1:8000/api/risks/", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // ✅ SAFE REDIRECT
      navigate(`/projects/${id}`, { replace: true });

    } catch (err) {
      console.error("Create risk error:", err.response?.data || err);
      setError("Failed to create risk. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cr-page">
      <div className="cr-card">
        <h2>Create New Risk</h2>
        <p className="cr-sub">
          Risk score, likelihood, and severity are calculated automatically.
        </p>

        {error && <div className="cr-error">{error}</div>}

        <form className="cr-form" onSubmit={handleSubmit}>
          <div className="cr-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="cr-group">
            <label>Description</label>
            <textarea
              name="description"
              rows="4"
              required
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="cr-row">
            <div className="cr-group">
              <label>Probability (1–5)</label>
              <input
                type="number"
                name="probability"
                min="1"
                max="5"
                required
                value={formData.probability}
                onChange={handleChange}
              />
            </div>

            <div className="cr-group">
              <label>Impact (1–5)</label>
              <input
                type="number"
                name="impact"
                min="1"
                max="5"
                required
                value={formData.impact}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="cr-group">
            <label>Estimated Cost (optional)</label>
            <input
              type="number"
              name="estimated_cost"
              min="0"
              value={formData.estimated_cost}
              onChange={handleChange}
            />
          </div>

          <div className="cr-group">
            <label>Risk Decision</label>
            <select
              name="risk_decision"
              value={formData.risk_decision}
              onChange={handleChange}
            >
              <option value="Avoid">Avoid</option>
              <option value="Mitigate">Mitigate</option>
              <option value="Transfer">Transfer</option>
              <option value="Accept">Accept</option>
            </select>
          </div>

          <div className="cr-actions">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => navigate(`/projects/${id}`, { replace: true })}
            >
              Cancel
            </button>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving…" : "Create Risk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRisk;
