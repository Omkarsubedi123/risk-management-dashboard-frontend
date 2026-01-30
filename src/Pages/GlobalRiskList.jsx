import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/GlobalRiskList.css";
import PendingRiskApprovals from "../components/PendingRiskApprovals";

const GlobalRiskList = () => {
  const navigate = useNavigate();
  const [risks, setRisks] = useState([]);
  const [filters, setFilters] = useState({
    risk_level: "",
    status: "",
    mitigation_status: "",
  });

  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  useEffect(() => {
    fetchRisks();
    // eslint-disable-next-line
  }, [filters]);

  const fetchRisks = async () => {
    const token = getToken();

    // ✅ send only non-empty filters
    const params = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v)
    );

    const res = await axios.get("http://127.0.0.1:8000/api/risks/global/", {
      headers: { Authorization: `Bearer ${token}` },
      params, // ✅ FIXED (was params: filters)
    });

    setRisks(res.data || []);
  };

  return (
    <>
      <Navbar />

      <div className="gr-container">
        {/* Header */}
        <div className="gr-header">
          <h2>Global Risk Register</h2>
          <p>Centralized view of risks across all projects</p>
        </div>

        {/* ✅ Pending approvals should be here (between header and filters) */}
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

          {/* Optional: quick reset */}
          <button
            className="view-btn"
            onClick={() =>
              setFilters({ risk_level: "", status: "", mitigation_status: "" })
            }
          >
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
