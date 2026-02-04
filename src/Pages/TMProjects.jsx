import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AppNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/TMProjects.css";
import { useNavigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const TMProjects = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  const fetchMyProjects = async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate("/login", { state: { forceLogin: true } });
        return;
      }

      const res = await axios.get(`${backendUrl}/api/projects/my/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProjects(res.data || []);
    } catch (err) {
      console.error("Failed to load my projects", err);
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
    fetchMyProjects();
    // eslint-disable-next-line
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;

    return projects.filter((p) => {
      return (
        (p.name || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.sector || "").toLowerCase().includes(q)
      );
    });
  }, [projects, search]);

  return (
    <>
      <AppNavbar />

      <div className="tmprojects-header">
        <div className="container tmprojects-container">
          <div className="tmprojects-header-row">
            <div>
              <h1 className="tmprojects-title">My Projects</h1>
              <p className="tmprojects-subtitle">
                Projects you are assigned to, with team size and PM contact.
              </p>
            </div>
          </div>

          <div className="tmprojects-toolbar">
            <div className="tmprojects-search">
              <span className="tmprojects-search-icon" aria-hidden="true">
                🔎
              </span>
              <input
                className="form-control tmprojects-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, sector, description..."
              />
            </div>
          </div>

          <div className="tmprojects-meta">
            <span className="tmprojects-count">
              {loading ? "Loading..." : `${filtered.length} project(s)`}
            </span>

            {!loading && search.trim() && (
              <button
                className="btn btn-outline-light tmprojects-clear"
                onClick={() => setSearch("")}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container tmprojects-container tmprojects-body">
        {loading ? (
          <div className="tmprojects-loading">
            <div className="spinner-border" role="status" />
            <div className="text-muted mt-2">Loading projects…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="tmprojects-empty">
            <div className="tmprojects-empty-icon" aria-hidden="true">
              📁
            </div>
            <h5>No projects found</h5>
            <p className="text-muted">You are not assigned to any projects yet.</p>
          </div>
        ) : (
          <div className="row">
            {filtered.map((p) => {
              const statusKey = (p.status || "active")
                .toString()
                .toLowerCase()
                .replace(/\s+/g, "-");

              return (
                <div key={p.id} className="col-md-4 mb-4">
                  <div className="tmprojects-card h-100">
                    <div className="tmprojects-card-top">
                      <h5 className="tmprojects-card-title">{p.name}</h5>
                      <span className="tmprojects-sector">{p.sector}</span>
                    </div>

                    <p className="tmprojects-desc">
                      {p.description
                        ? p.description.length > 120
                          ? p.description.slice(0, 120) + "..."
                          : p.description
                        : "No description provided."}
                    </p>

                    <div className="tmprojects-info">
                      <div className="tmprojects-chip">
                        👥 Team: <strong>{p.team_count ?? 0}</strong>
                      </div>
                      <div className="tmprojects-chip">
                        🧑‍💼 PM: <strong>{p.pm_email || "N/A"}</strong>
                      </div>
                      <div className={`tmprojects-status status-${statusKey}`}>
                        {p.status || "Active"}
                      </div>
                    </div>

                    <div className="tmprojects-actions">
                      {/* ✅ FIXED: use p.id (not projects.id) */}
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => navigate(`/tm/projects/${p.id}`)}
                        title="Open Project"
                      >
                        Open →
                      </button>

                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/tm/risks?project=${p.id}`)}
                        title="View your risks in this project"
                      >
                        My Risks →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default TMProjects;
