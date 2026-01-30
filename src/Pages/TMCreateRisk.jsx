import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import AppNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/TMCreateRisk.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const TMCreateRisk = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  // project from query ?project=ID
  const projectFromQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const p = params.get("project");
    return p ? String(p) : "";
  }, [location.search]);

  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(projectFromQuery);

  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    probability: "",
    impact: "",
    estimated_cost: "",
    risk_decision: "Mitigate",
    assigned_to: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [error, setError] = useState("");

  const fetchMyProjects = async () => {
    const token = getToken();
    if (!token) return;

    setLoadingProjects(true);
    try {
      const res = await axios.get(`${backendUrl}/api/projects/my/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data || []);
    } catch (err) {
      console.error("Failed to load my projects", err.response?.data || err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchMembers = async (pid) => {
    if (!pid) {
      setMembers([]);
      return;
    }

    const token = getToken();
    if (!token) return;

    setLoadingMembers(true);
    try {
      const res = await axios.get(`${backendUrl}/api/projects/${pid}/members/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const all = res.data || [];
      const tms = all.filter((m) => String(m.role).toUpperCase() === "TM");
      setMembers(tms);
    } catch (err) {
      console.error("Failed to load members", err.response?.data || err);
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    // load project dropdown if not provided in query
    if (!projectFromQuery) fetchMyProjects();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // whenever projectId changes, refresh members and clear assignment
    setFormData((prev) => ({ ...prev, assigned_to: "" }));
    fetchMembers(projectId);
    // eslint-disable-next-line
  }, [projectId]);

  const memberOptions = useMemo(() => {
    return members.map((m) => ({
      id: m.user_id,
      label: m.full_name || m.username || m.email || `User ${m.user_id}`,
    }));
  }, [members]);

  const projectOptions = useMemo(() => {
    return projects.map((p) => ({
      id: String(p.id),
      label: p.name,
    }));
  }, [projects]);

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
      if (!token) {
        navigate("/login", { state: { forceLogin: true } });
        return;
      }

      if (!projectId) {
        setError("Please select a project.");
        return;
      }

      const payload = {
        project: Number(projectId),
        title: formData.title.trim(),
        description: formData.description.trim(),
        probability: Number(formData.probability),
        impact: Number(formData.impact),
        risk_decision: formData.risk_decision,
      };

      if (formData.estimated_cost !== "") {
        payload.estimated_cost = Number(formData.estimated_cost);
      }

      if (formData.assigned_to) {
        payload.assigned_to = Number(formData.assigned_to);
      }

      await axios.post(`${backendUrl}/api/risks/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      navigate(`/tm/risks?project=${projectId}`, { replace: true });
    } catch (err) {
      console.error("Create risk error:", err.response?.data || err);
      setError("Failed to create risk. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppNavbar />

      <div className="tmcr-page">
        <div className="tmcr-card">
          <div className="tmcr-head">
            <div>
              <h2>Create Risk (TM)</h2>
              <p className="tmcr-sub">
                Risk score and level are calculated automatically.
              </p>
            </div>

            <button
              className="btn btn-outline-secondary tmcr-back"
              onClick={() => navigate(-1)}
              type="button"
            >
              ← Back
            </button>
          </div>

          {error && <div className="tmcr-error">{error}</div>}

          <form className="tmcr-form" onSubmit={handleSubmit}>
            {/* Project select if not given in query */}
            {!projectFromQuery && (
              <div className="tmcr-group">
                <label>Project</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  disabled={loadingProjects}
                  required
                >
                  <option value="">
                    {loadingProjects ? "Loading projects..." : "-- Select Project --"}
                  </option>
                  {projectOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="tmcr-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Short risk title"
              />
            </div>

            <div className="tmcr-group">
              <label>Description</label>
              <textarea
                name="description"
                rows="4"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the risk..."
              />
            </div>

            <div className="tmcr-row">
              <div className="tmcr-group">
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

              <div className="tmcr-group">
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

            <div className="tmcr-group">
              <label>Estimated Cost (optional)</label>
              <input
                type="number"
                name="estimated_cost"
                min="0"
                value={formData.estimated_cost}
                onChange={handleChange}
              />
            </div>

            <div className="tmcr-group">
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

            <div className="tmcr-group">
              <label>Assign To (Team Member)</label>
              <select
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
                disabled={!projectId || loadingMembers}
              >
                <option value="">
                  {!projectId
                    ? "Select a project first"
                    : loadingMembers
                    ? "Loading members..."
                    : "-- Optional: Assign to a team member --"}
                </option>
                {memberOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
              <small className="text-muted">
                Only members in this project are shown.
              </small>
            </div>

            <div className="tmcr-actions">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => navigate(-1)}
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

      <Footer />
    </>
  );
};

export default TMCreateRisk;
