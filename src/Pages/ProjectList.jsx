// src/pages/ProjectList.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import AppNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/projects.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI states
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("all");

  const navigate = useNavigate();

  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login", { state: { forceLogin: true } });
      return;
    }
    fetchProjects(token);
    // eslint-disable-next-line
  }, []);

  const fetchProjects = async (token) => {
    try {
      const response = await axios.get(`${backendUrl}/api/projects/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data || []);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/login", { state: { forceLogin: true } });
      }
    } finally {
      setLoading(false);
    }
  };

  const sectors = useMemo(() => {
    const set = new Set();
    projects.forEach((p) => p.sector && set.add(p.sector));
    return ["all", ...Array.from(set)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const q = search.toLowerCase();
    return projects.filter((p) => {
      const matchSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q);

      const matchSector = sector === "all" || p.sector === sector;
      return matchSearch && matchSector;
    });
  }, [projects, search, sector]);

  return (
    <>
      <AppNavbar />

      <div className="project-page-wrapper">
        {/* ===== HEADER ===== */}
        <div className="projects-header">
          <div className="container">
            <div className="projects-header-row">
              <div>
                <h1 className="projects-title">Projects</h1>
                <p className="projects-subtitle">
                  Browse and manage your projects
                </p>
              </div>

              <Link to="/create-project" className="btn btn-primary projects-cta">
                + Create Project
              </Link>
            </div>

            {/* ===== FILTER ROW ===== */}
            <div className="projects-toolbar">
              <div className="projects-search">
                <span className="projects-search-icon"></span>
                <input
                  className="form-control projects-search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search projects..."
                />
              </div>

              <select
                className="form-select projects-sector-select"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
              >
                {sectors.map((s) => (
                  <option key={s} value={s}>
                    {s === "all" ? "All Sectors" : s}
                  </option>
                ))}
              </select>
            </div>

            <div className="projects-meta">
              <strong>
                {loading ? "Loading..." : `${filteredProjects.length} project(s)`}
              </strong>
            </div>
          </div>
        </div>

        {/* ===== CONTENT ===== */}
        <div className="container mt-4">
          {loading ? (
            <div className="projects-loading">
              <div className="spinner-border" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="projects-empty">
              <h5>No projects found</h5>
            </div>
          ) : (
            <div className="row">
              {filteredProjects.map((project) => (
                <div key={project.id} className="col-md-4 mb-4">
                  <div className="card project-card h-100">
                    <div className="card-body d-flex flex-column">
                      <div className="project-card-top">
                        <h5 className="project-card-title">{project.name}</h5>
                        <span className="project-sector-badge">
                          {project.sector || "N/A"}
                        </span>
                      </div>

                      <p className="project-card-desc flex-grow-1">
                        {project.description
                          ? project.description.slice(0, 120)
                          : "No description"}
                      </p>

                      <Link
                        to={`/projects/${project.id}`}
                        className="btn btn-outline-primary btn-sm"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
};

export default ProjectList;
