// src/pages/ProjectDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./../styles/projects.css";

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem("access");
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(
        `http://127.0.0.1:8000/api/projects/${id}/`,
        { headers }
      );
      setProject(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!project) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="container mt-4">
      <div className="card shadow-sm p-4">
        <h3>{project.name}</h3>
        <p className="text-muted">{project.sector}</p>
        <hr />
        <p>{project.description}</p>
        <div className="mt-3">
          <strong>Created At:</strong> {new Date(project.created_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
