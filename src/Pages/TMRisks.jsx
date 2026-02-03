import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AppNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/TMRisks.css";
import { useNavigate, useLocation } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const TMRisks = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");
  const [mitigation, setMitigation] = useState("all");

  // ✅ NEW: Tab state (Option B)
  const [tab, setTab] = useState("active"); // active | pending | trash

  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  // optional project filter from query string: ?project=16
  const projectFilter = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const p = params.get("project");
    return p ? String(p) : "";
  }, [location.search]);

  const fetchMyRisks = async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate("/login", { state: { forceLogin: true } });
        return;
      }

      let url = "";

      // ✅ Trash uses special endpoint
      if (tab === "trash") {
        url = projectFilter
          ? `${backendUrl}/api/risks/trash/?project=${encodeURIComponent(
              projectFilter
            )}`
          : `${backendUrl}/api/risks/trash/`;
      } else {
        // ✅ My risks endpoint
        url = projectFilter
          ? `${backendUrl}/api/risks/my/?project=${encodeURIComponent(projectFilter)}`
          : `${backendUrl}/api/risks/my/`;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let data = res.data || [];

      // ✅ Split Active vs Pending client-side (safe even if backend changes later)
      if (tab === "active") {
        data = data.filter((r) => r.approval_status === "approved");
      } else if (tab === "pending") {
        data = data.filter((r) => r.approval_status === "pending");
      } // trash already contains only rejected from backend

      setRisks(data);
    } catch (err) {
      console.error("Failed to load TM risks:", err.response?.data || err);
      if (err.response?.status === 401) {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/login", { state: { forceLogin: true } });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchMyRisks();
    // eslint-disable-next-line
  }, [projectFilter, tab]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return risks.filter((r) => {
      const matchesSearch =
        !q ||
        (r.title || "").toLowerCase().includes(q) ||
        (r.project_name || "").toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q);

      const matchesLevel =
        level === "all" || (r.risk_level || "").toLowerCase() === level;

      const matchesMitigation =
        mitigation === "all" ||
        (r.mitigation_status || "").toLowerCase() === mitigation;

      return matchesSearch && matchesLevel && matchesMitigation;
    });
  }, [risks, search, level, mitigation]);

  const getTabTitle = () => {
    if (tab === "active") return "Active Risks";
    if (tab === "pending") return "Pending Approval";
    return "Trash";
  };

  const getEmptyText = () => {
    if (tab === "active")
      return "No active risks found (approved risks will appear here).";
    if (tab === "pending")
      return "No pending risks found (TM submitted risks waiting for PM approval).";
    return "Trash is empty (rejected risks will appear here and auto delete after 15 days).";
  };

  const calcAutoDeleteDate = (rejectedAt) => {
    if (!rejectedAt) return null;
    const d = new Date(rejectedAt);
    const auto = new Date(d.getTime() + 15 * 24 * 60 * 60 * 1000);
    return auto.toLocaleDateString();
  };

  return (
    <>
      <AppNavbar />

      {/* Header */}
      <div className="tmrisks-header">
        <div className="container tmrisks-container">
          <div className="tmrisks-header-row">
            <div>
              <h1 className="tmrisks-title">My Risks</h1>
              <p className="tmrisks-subtitle">
                Track your assigned risks and mitigation progress.
              </p>

              {/* ✅ Tabs (Option B) */}
              <div className="tmrisks-tabs">
                <button
                  className={`tmrisks-tab ${tab === "active" ? "active" : ""}`}
                  onClick={() => setTab("active")}
                >
                  Active
                </button>
                <button
                  className={`tmrisks-tab ${tab === "pending" ? "active" : ""}`}
                  onClick={() => setTab("pending")}
                >
                  Pending
                </button>
                <button
                  className={`tmrisks-tab ${tab === "trash" ? "active" : ""}`}
                  onClick={() => setTab("trash")}
                >
                  Trash
                </button>
              </div>
            </div>

            <button
              className="btn btn-outline-light tmrisks-refresh"
              onClick={() => {
                setLoading(true);
                fetchMyRisks();
              }}
            >
              ⟳ Refresh
            </button>
          </div>

          {/* Toolbar */}
          <div className="tmrisks-toolbar">
            <div className="tmrisks-search">
              <span className="tmrisks-search-icon">🔎</span>
              <input
                className="form-control tmrisks-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search in ${getTabTitle()}...`}
              />
            </div>

            <select
              className="form-select tmrisks-select"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              title="Filter by risk level"
            >
              <option value="all">All Levels</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              className="form-select tmrisks-select"
              value={mitigation}
              onChange={(e) => setMitigation(e.target.value)}
              title="Filter by mitigation status"
            >
              <option value="all">All Mitigation</option>
              <option value="notstarted">Not Started</option>
              <option value="inprogress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="tmrisks-meta">
            <span className="tmrisks-count">
              {loading ? "Loading..." : `${filtered.length} risk(s) • ${getTabTitle()}`}
            </span>

            {(search.trim() || level !== "all" || mitigation !== "all") &&
              !loading && (
                <button
                  className="btn btn-outline-light btn-sm tmrisks-clear"
                  onClick={() => {
                    setSearch("");
                    setLevel("all");
                    setMitigation("all");
                  }}
                >
                  Clear filters
                </button>
              )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container tmrisks-container tmrisks-body">
        {loading ? (
          <div className="tmrisks-loading">
            <div className="spinner-border" role="status" />
            <div className="text-muted mt-2">Loading risks…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="tmrisks-empty">
            <div className="tmrisks-empty-icon">🧾</div>
            <h5>No risks found</h5>
            <p className="text-muted">{getEmptyText()}</p>
          </div>
        ) : (
          <div className="tmrisks-grid">
            {filtered.map((r) => (
              <div key={r.id} className="tmrisks-card">
                <div className="tmrisks-card-top">
                  <div className="tmrisks-card-title">{r.title}</div>

                  {/* Risk Level */}
                  <span
                    className={`tmrisks-badge level-${(r.risk_level || "").toLowerCase()}`}
                  >
                    {r.risk_level || "N/A"}
                  </span>
                </div>

                <div className="tmrisks-project">
                  Project: <strong>{r.project_name}</strong>
                </div>

                {/* Approval badge */}
                <div className="tmrisks-approval-row">
                  <span
                    className={`tmrisks-approval-badge approval-${(r.approval_status || "").toLowerCase()}`}
                  >
                    {r.approval_status === "pending"
                      ? "Pending Approval"
                      : r.approval_status === "approved"
                      ? "Approved"
                      : "Rejected"}
                  </span>
                </div>

                <div className="tmrisks-desc">
                  {r.description
                    ? r.description.length > 110
                      ? r.description.slice(0, 110) + "..."
                      : r.description
                    : "No description"}
                </div>

                {/* Trash info */}
                {tab === "trash" && (
                  <div className="tmrisks-trash-info">
                    🗑️ Auto deletes on{" "}
                    <strong>{calcAutoDeleteDate(r.rejected_at) || "—"}</strong>
                  </div>
                )}

                <div className="tmrisks-chips">
                  <span className="tmrisks-chip">
                    Score: <strong>{r.risk_score}</strong>
                  </span>

                  <span
                    className={`tmrisks-chip status-${(r.mitigation_status || "").toLowerCase()}`}
                  >
                    {r.mitigation_status}
                  </span>

                  <span className="tmrisks-chip subtle">
                    Risk Status: <strong>{r.status}</strong>
                  </span>
                </div>

                {/* Actions hidden in Trash */}
                {tab !== "trash" && (
                  <div className="tmrisks-actions">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() =>
                        navigate(`/tm/risks/${r.id}`)
                      }
                    >
                      Open Risk Board →
                    </button>

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() =>
                        navigate(`/tm/risks/create?project=${r.project_id}`)
                      }
                      title="Report another risk for this project"
                    >
                      + Add Risk
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default TMRisks;
