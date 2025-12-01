import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./../styles/ProjectDetails.CSS";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);

  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = async () => {
    try {
      const token =
        localStorage.getItem("access") || sessionStorage.getItem("access");

      if (!token) {
        console.error("User not logged in.");
        return;
      }

      const response = await axios.get(
        `http://127.0.0.1:8000/api/projects/${id}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProject(response.data);
    } catch (err) {
      console.error("Error loading project:", err);
    }
  };

  if (!project)
    return <p className="loading-text">Loading project details...</p>;

  return (
    <div className="detail-container fade-in">
      <div className="detail-card slide-up">
        <button className="back-btn" onClick={() => navigate("/projects")}>
          ← Back to Projects
        </button>

        <h1 className="project-title">{project.name}</h1>

        <p className="sector-tag">{project.sector}</p>

        <p className="project-description">{project.description}</p>

        <div className="detail-info">
          <p>
            <strong>Category:</strong> {project.category || "N/A"}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className="status-badge">
              {project.status || "Active"}
            </span>
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {new Date(project.created_at).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
