import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ConfirmModal from "../components/ConfirmModal";
import "../styles/RiskDetails.css";

const RiskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  const getRiskMeta = (score) => {
    if (score <= 6) return { level: "Low", percent: 10, cls: "low" };
    if (score <= 14) return { level: "Medium", percent: 30, cls: "medium" };
    return { level: "High", percent: 60, cls: "high" };
  };

  useEffect(() => {
    fetchRisk();
    // eslint-disable-next-line
  }, [id]);

  const fetchRisk = async () => {
    try {
      const token = getToken();
      const res = await axios.get(
        `http://127.0.0.1:8000/api/risks/${id}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRisk(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const token = getToken();
    await axios.delete(`http://127.0.0.1:8000/api/risks/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    navigate(-1);
  };

  if (loading) return <div className="rd-loading">Loading risk…</div>;
  if (!risk) return <div className="rd-loading">Risk not found.</div>;

  const score = risk.risk_score || risk.probability * risk.impact;
  const meta = getRiskMeta(score);
  const lossAmount =
    (Number(risk.estimated_cost) * meta.percent) / 100;

  return (
    <div className="rd-page">
      <button className="rd-back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className={`rd-card unified ${meta.cls}`}>
        {/* ===== HEADER ===== */}
        <div className="rd-header">
          <div>
            <h2>{risk.title}</h2>
            <p className="rd-sub">Project: {risk.project_name}</p>
            <p className="rd-sub">Status: {risk.status}</p>
          </div>

          <div className="rd-header-right">
            <span className={`rd-badge ${meta.cls}`}>
              {meta.level} Risk
            </span>
            <p><strong>Risk Score:</strong> {score}</p>
            <p>
              <strong>Est. Cost:</strong> ₹
              {Number(risk.estimated_cost).toLocaleString()}
            </p>
          </div>
        </div>

        {/* ===== BODY TABLE ===== */}
        <div className="rd-table">
          <div className="rd-row">
            <span>Category</span>
            <span>{risk.category}</span>
          </div>
          <div className="rd-row">
            <span>Probability</span>
            <span>{risk.probability}</span>
          </div>
          <div className="rd-row">
            <span>Impact</span>
            <span>{risk.impact}</span>
          </div>
          <div className="rd-row">
            <span>Assigned To</span>
            <span>{risk.assigned_to_name || "Not Assigned"}</span>
          </div>
          <div className="rd-row">
            <span>Created At</span>
            <span>{new Date(risk.created_at).toLocaleString()}</span>
          </div>
          <div className="rd-row">
            <span>Last Updated</span>
            <span>{new Date(risk.updated_at).toLocaleString()}</span>
          </div>
        </div>

        {/* ===== LOSS ===== */}
        <div className="rd-loss-row">
          <div>
            <label>Loss Percentage</label>
            <p>{meta.percent}%</p>
          </div>
          <div>
            <label>Estimated Loss Amount</label>
            <p className="rd-loss-amount">
              ₹{lossAmount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* ===== DESCRIPTION ===== */}
        <div className="rd-desc-block">
          <h4>Description</h4>
          <p>{risk.description || "No description provided."}</p>
        </div>

        {/* ===== ACTIONS ===== */}
        <div className="rd-actions">
          <button
            className="btn btn-outline"
            onClick={() =>
              navigate(`/risks/${id}/edit`, { state: { risk } })
            }
          >
            ✏️ Edit
          </button>
          <button
            className="btn btn-danger"
            onClick={() => setConfirmOpen(true)}
          >
            🗑 Delete
          </button>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Delete Risk"
        message="Are you sure you want to delete this risk?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default RiskDetails;
