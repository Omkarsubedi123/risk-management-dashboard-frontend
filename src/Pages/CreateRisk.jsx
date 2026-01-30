import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CreateRisk.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const CreateRisk = () => {
  const { id } = useParams(); // project id
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    probability: "",
    impact: "",
    estimated_cost: "",
    risk_decision: "Mitigate",
    assigned_to: "", // ✅ NEW
  });

  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Load project team members for Assign dropdown
  const fetchMembers = async () => {
    const token = getToken();
    if (!token) return;

    setLoadingMembers(true);
    try {
      const res = await axios.get(`${backendUrl}/api/projects/${id}/members/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // API returns ProjectTeamSerializer objects: { user_id, email, full_name, role, ... }
      const all = res.data || [];

      // show only TMs in dropdown (PM can be excluded)
      const tms = all.filter((m) => String(m.role).toUpperCase() === "TM");
      setMembers(tms);
    } catch (err) {
      console.error("Failed to load project members:", err.response?.data || err);
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line
  }, [id]);

  const memberOptions = useMemo(() => {
    return members.map((m) => ({
      id: m.user_id,
      label: m.full_name || m.username || m.email || `User ${m.user_id}`,
    }));
  }, [members]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = getToken();
      if (!token) {
        setError("Please login again.");
        navigate("/login", { state: { forceLogin: true } });
        return;
      }

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

      // ✅ add assigned_to if selected
      if (formData.assigned_to) {
        payload.assigned_to = Number(formData.assigned_to);
      }

      await axios.post(`${backendUrl}/api/risks/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

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

          {/* ✅ NEW: Assign To dropdown */}
          <div className="cr-group">
            <label>Assign To (Team Member)</label>
            <select
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              disabled={loadingMembers}
            >
              <option value="">
                {loadingMembers ? "Loading members..." : "-- Select Team Member (optional) --"}
              </option>
              {memberOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            <small className="text-muted">
              Only team members in this project are shown.
            </small>
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
