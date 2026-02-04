import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import AppNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/TMProjectDetails.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const TMProjectDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [team, setTeam] = useState([]);
  const [summary, setSummary] = useState({ total: 0, mine: 0, pending: 0, high: 0 });
  const [error, setError] = useState("");

  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  const headers = useMemo(() => {
    const token = getToken();
    return { Authorization: `Bearer ${token}` };
  }, []);

  const safeBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/tm/projects");
  };

  const fetchAll = async () => {
    setLoading(true);
    setError("");

    const token = getToken();
    if (!token) {
      navigate("/login", { state: { forceLogin: true } });
      return;
    }

    try {
      // ✅ fetch logged-in user too (so we don't depend on localStorage user_id)
      const [meRes, pRes, teamRes, risksRes] = await Promise.all([
        axios.get(`${backendUrl}/api/users/me/`, { headers }),
        axios.get(`${backendUrl}/api/projects/${id}/`, { headers }),
        axios
          .get(`${backendUrl}/api/projects/${id}/team/`, { headers })
          .catch(() => ({ data: [] })),
        axios.get(`${backendUrl}/api/risks/?project=${id}`, { headers }).catch(() => ({ data: [] })),
      ]);

      const me = meRes.data || {};
      const myId = Number(me.id || null);
      const myEmail = (me.email || "").toString().toLowerCase();

      setProject(pRes.data);
      setTeam(Array.isArray(teamRes.data) ? teamRes.data : []);

      const risks = Array.isArray(risksRes.data) ? risksRes.data : [];

      const total = risks.length;

      // ✅ Robust assignment matching: by ID or email, supports many field shapes
      const mine = risks.filter((rk) => {
        const assignedId =
          rk.assigned_to?.id ??
          rk.assigned_to_id ??
          rk.assignee?.id ??
          rk.assignee_id ??
          rk.assigned_to_user?.id ??
          rk.assigned_user_id ??
          rk.assigned_to?.user_id ?? // just in case
          null;

        const assignedEmail = (
          rk.assigned_to?.email ||
          rk.assignee?.email ||
          rk.assigned_to_email ||
          rk.assigned_email ||
          rk.assigned_to ||
          ""
        )
          .toString()
          .toLowerCase();

        return (myId && Number(assignedId) === myId) || (myEmail && assignedEmail === myEmail);
      }).length;

      const pending = risks.filter((rk) => {
        const st = (rk.approval_status || rk.status || "").toString().toLowerCase();
        return st === "pending";
      }).length;

      const high = risks.filter((rk) => {
        const sev = (rk.severity || rk.risk_level || rk.level || "").toString().toLowerCase();
        const score = Number(rk.risk_score || rk.score || 0);
        return sev === "high" || score >= 15;
      }).length;

      setSummary({ total, mine, pending, high });
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/login", { state: { forceLogin: true } });
        return;
      }
      setError("Could not load project workspace.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      safeBack();
      return;
    }
    fetchAll();
    // eslint-disable-next-line
  }, [id]);

  const statusKey = (project?.status || "active").toString().toLowerCase().replace(/\s+/g, "-");

  // ✅ supports both pm_email and created_by_email from your backend
  const pmEmail =
    project?.pm_email ||
    project?.created_by_email ||
    project?.created_by?.email ||
    project?.pm?.email ||
    project?.pm_contact ||
    project?.pm ||
    "N/A";

  const goMyRisks = () => navigate(`/tm/risks?project=${id}`);

  // ✅ Your real route (from App.jsx)
  const goAddRisk = () => navigate(`/tm/risks/create?project=${id}`);

  if (loading) {
    return (
      <>
        <AppNavbar />
        <div className="tmpr-wrap">
          <div className="tmpr-loading">
            <div className="spinner-border" role="status" />
            <div className="text-muted mt-2">Loading project…</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!project) {
    return (
      <>
        <AppNavbar />
        <div className="tmpr-wrap">
          <div className="container tmpr-container">
            <div className="alert alert-danger">{error || "Project not found."}</div>
            <button className="btn btn-outline-secondary" onClick={safeBack}>
              Back
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <AppNavbar />

      <div className="tmpr-header">
        <div className="container tmpr-container">
          <button className="tmpr-back" onClick={safeBack}>
            ← My Projects
          </button>

          <div className="tmpr-head-row">
            <div>
              <h1 className="tmpr-title">{project.name}</h1>
              <p className="tmpr-desc">{project.description || "No description provided."}</p>

              <div className="tmpr-badges">
                <span className="tmpr-badge">Sector: {project.sector || "N/A"}</span>
                <span className={`tmpr-badge tmpr-status ${statusKey}`}>{project.status || "Active"}</span>
                <span className="tmpr-badge">Team: {team.length || project.team_count || 0}</span>
                <span className="tmpr-badge">PM: {pmEmail}</span>
              </div>
            </div>

            <div className="tmpr-actions">
              <div className="tmpr-actions-title">Actions</div>

              <button className="btn btn-primary w-100 mb-2" onClick={goMyRisks}>
                My Risks (This Project)
              </button>

              <button className="btn btn-outline-primary w-100 mb-2" onClick={goAddRisk}>
                Add Risk
              </button>

              <button className="btn btn-outline-secondary w-100" onClick={safeBack}>
                Back
              </button>

              <div className="tmpr-note">
                PM-only: edit project, invite/remove members, approvals & status control.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tmpr-wrap">
        <div className="container tmpr-container">
          {error ? <div className="alert alert-warning">{error}</div> : null}

          <div className="tmpr-grid4">
            <div className="tmpr-card">
              <div className="tmpr-card-label">Total Risks</div>
              <div className="tmpr-card-value">{summary.total}</div>
            </div>
            <div className="tmpr-card">
              <div className="tmpr-card-label">My Assigned</div>
              <div className="tmpr-card-value">{summary.mine}</div>
            </div>
            <div className="tmpr-card">
              <div className="tmpr-card-label">Pending Approval</div>
              <div className="tmpr-card-value">{summary.pending}</div>
            </div>
            <div className="tmpr-card">
              <div className="tmpr-card-label">High Severity</div>
              <div className="tmpr-card-value">{summary.high}</div>
            </div>
          </div>

          <div className="tmpr-section">
            <div className="tmpr-section-title">Project Team</div>
            <div className="tmpr-section-sub">Visible to team members. Management is PM-only.</div>

            {team.length === 0 ? (
              <div className="tmpr-empty">No team members found.</div>
            ) : (
              <div className="tmpr-tablewrap">
                <table className="tmpr-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.map((m) => {
                      const role = (m.role || "TM").toString().toUpperCase();
                      const invited = m.is_invited === true || (!m.user_id && m.email);
                      return (
                        <tr key={m.id}>
                          <td className="tmpr-strong">{m.full_name || m.username || "—"}</td>
                          <td>{m.email || "—"}</td>
                          <td>
                            <span className={role === "PM" ? "tmpr-role pm" : "tmpr-role tm"}>
                              {role}
                            </span>
                          </td>
                          <td>
                            <span className={invited ? "tmpr-pill warn" : "tmpr-pill ok"}>
                              {invited ? "Invited" : "Joined"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="tmpr-section">
            <div className="tmpr-section-title">Project Management (PM Only)</div>
            <div className="tmpr-section-sub">These actions are disabled for Team Members.</div>

            <div className="tmpr-btnrow">
              <button className="btn btn-outline-danger" disabled>
                Delete Project
              </button>
              <button className="btn btn-outline-secondary" disabled>
                Edit Project
              </button>
              <button className="btn btn-outline-secondary" disabled>
                Change Status
              </button>
              <button className="btn btn-outline-secondary" disabled>
                Invite Member
              </button>
            </div>
          </div>

          <div style={{ height: 16 }} />
        </div>
      </div>

      <Footer />
    </>
  );
};

export default TMProjectDetails;
