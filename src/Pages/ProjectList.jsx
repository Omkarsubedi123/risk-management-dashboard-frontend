// src/pages/ProjectList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import AppNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/projects.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ ALWAYS get token safely
  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  useEffect(() => {
    const token = getToken();

    // 🔐 HARD GUARD
    if (!token) {
      navigate("/login", { state: { forceLogin: true } });
      return;
    }

    fetchProjects(token);
  }, []);

  const fetchProjects = async (token) => {
    try {
      const response = await axios.get(`${backendUrl}/api/projects/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProjects(response.data);
    } catch (error) {
      console.error("Project fetch failed:", error);

      // 🚨 TOKEN EXPIRED / INVALID
      if (error.response?.status === 401) {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/login", { state: { forceLogin: true } });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppNavbar />

      <div className="project-page-wrapper">
        <div className="container mt-4">

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Projects</h3>
            <Link to="/create-project" className="btn btn-primary">
              + Create Project
            </Link>
          </div>

          {loading ? (
            <p className="text-center text-muted">Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="text-muted">No projects found.</p>
          ) : (
            <div className="row">
              {projects.map((project) => (
                <div key={project.id} className="col-md-4 mb-4">
                  <div className="card shadow-sm project-card h-100">
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{project.name}</h5>

                      <p className="text-muted small">{project.sector}</p>

                      <p className="card-text flex-grow-1">
                        {project.description
                          ? project.description.substring(0, 100) + "..."
                          : "No description provided."}
                      </p>

                      <Link
                        to={`/projects/${project.id}`}
                        className="btn btn-outline-primary btn-sm mt-auto"
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
