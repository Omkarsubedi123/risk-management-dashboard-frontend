import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/GlobalRiskList.css";
import PendingRiskApprovals from "../components/PendingRiskApprovals";

const GlobalRiskList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [risks, setRisks] = useState([]);
  const [filters, setFilters] = useState({
    risk_level: "",
    status: "",
    mitigation_status: "",
  });

  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  // ✅ projectId passed from ProjectList via Link state
  const projectId = useMemo(() => {
    const v = location.state?.projectId;
    if (v === undefined || v === null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }, [location.state]);

  useEffect(() => {
    fetchRisks();
    // eslint-disable-next-line
  }, [filters, projectId]);

  const fetchRisks = async () => {
    const token = getToken();
    if (!token) {
      navigate("/login", { state: { forceLogin: true } });
      return;
    }

    // ✅ send only non-empty filters
    const params = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v)
    );

    // ✅ if came from project -> filter global list by project
    if (projectId) params.project = projectId;

    const res = await axios.get("http://127.0.0.1:8000/api/risks/global/", {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });

    setRisks(res.data || []);
  };

  const clearProjectFilter = () => {
    // remove state so this page becomes global again
    navigate("/risks", { replace: true, state: null });
  };

  const resetAll = () => {
    setFilters({ risk_level: "", status: "", mitigation_status: "" });
    navigate("/risks", { replace: true, state: null });
  };

  return (
    <>
      <Navbar />

      <div className="gr-container">
        {/* Header */}
        <div className="gr-header">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div>
              <h2>{projectId ? "Project Risk Register" : "Global Risk Register"}</h2>
              <p>
                {projectId
                  ? `Showing risks for Project ID: ${projectId}`
                  : "Centralized view of risks across all projects"}
              </p>
            </div>

            {projectId && (
              <button className="view-btn" onClick={clearProjectFilter}>
                Clear Project Filter
              </button>
            )}
          </div>
        </div>

        {/* Pending approvals */}
        <PendingRiskApprovals />

        {/* Filters */}
        <div className="gr-filters">
          <select
            value={filters.risk_level}
            onChange={(e) =>
              setFilters({ ...filters, risk_level: e.target.value })
            }
          >
            <option value="">Risk Level</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Status</option>
            <option value="Open">Open</option>
            <option value="InProgress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={filters.mitigation_status}
            onChange={(e) =>
              setFilters({ ...filters, mitigation_status: e.target.value })
            }
          >
            <option value="">Mitigation</option>
            <option value="NotStarted">Not Started</option>
            <option value="InProgress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <button className="view-btn" onClick={resetAll}>
            Reset
          </button>
        </div>

        {/* Table */}
        <div className="gr-card">
          <table className="gr-table">
            <thead>
              <tr>
                <th>Risk</th>
                <th>Project</th>
                <th>Level</th>
                <th>Score</th>
                <th>Status</th>
                <th>Mitigation</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {risks.map((r) => (
                <tr key={r.id}>
                  <td>{r.title}</td>
                  <td>{r.project_name}</td>
                  <td>
                    <span className={`badge ${r.risk_level}`}>{r.risk_level}</span>
                  </td>
                  <td>{r.risk_score}</td>
                  <td>{r.status}</td>
                  <td>{r.mitigation_status}</td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => navigate(`/risks/${r.id}`)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {risks.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "18px" }}>
                    No risks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default GlobalRiskList;