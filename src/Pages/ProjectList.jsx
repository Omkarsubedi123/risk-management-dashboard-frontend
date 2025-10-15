// src/pages/ProjectList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./../styles/projects.css";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("access");
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get("http://127.0.0.1:8000/api/projects/", {
        headers,
      });
      setProjects(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Project List</h3>
        <Link to="/create-project" className="btn btn-primary">
          + Create New
        </Link>
      </div>
      <div className="row">
        {projects.map((project) => (
          <div key={project.id} className="col-md-4 mb-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">{project.name}</h5>
                <p className="card-text text-muted small">
                  {project.sector}
                </p>
                <p className="card-text">
                  {project.description.substring(0, 80)}...
                </p>
                <Link
                  to={`/project/${project.id}`}
                  className="btn btn-outline-primary btn-sm"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
