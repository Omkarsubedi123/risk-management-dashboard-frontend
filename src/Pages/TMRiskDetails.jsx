import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import AppNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/TMRiskDetails.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const TMRiskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false); // now controls TM suggestion edit (not PM mitigation)

  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  const approvalStatus = (risk?.approval_status || "").toLowerCase();
  const tmSuggestionStatus = (risk?.tm_suggestion_status || "").toLowerCase();

  const canSuggest = useMemo(() => {
    // TM can suggest only when risk is approved
    if (!risk) return false;
    return approvalStatus === "approved";
  }, [risk, approvalStatus]);

  const fetchRiskDetails = async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate("/login", { state: { forceLogin: true } });
        return;
      }

      const res = await axios.get(`${backendUrl}/api/risks/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRisk(res.data);
    } catch (err) {
      console.error("Failed to load TM risk details:", err.response?.data || err);
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
    fetchRiskDetails();
    // eslint-disable-next-line
  }, [id]);

  const fmtDate = (val) => {
    if (!val) return "—";
    try {
      return new Date(val).toLocaleString();
    } catch {
      return val;
    }
  };

  const submitSuggestion = async () => {
    if (!canSuggest) return;
    const suggestionText = (risk?.tm_mitigation_suggestion || "").trim();

    if (!suggestionText) {
      alert("Suggestion cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      const token = getToken();

      await axios.patch(
        `${backendUrl}/api/risks/${id}/suggest-mitigation/`,
        { tm_mitigation_suggestion: suggestionText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // re-fetch to get updated status (pending) from backend
      await fetchRiskDetails();
      setEditMode(false);
    } catch (err) {
      console.error("Failed to submit suggestion:", err.response?.data || err);
      alert(err.response?.data?.detail || "Failed to submit suggestion.");
    } finally {
      setSaving(false);
    }
  };

  const badgeClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "pending") return "approval-pending";
    if (s === "approved") return "approval-approved";
    if (s === "rejected") return "approval-rejected";
    return "approval-approved";
  };

  return (
    <>
      <AppNavbar />

      <div className="tmrd-wrap">
        {loading ? (
          <div className="tmrd-loading">
            <div className="spinner-border" role="status" />
            <div className="text-muted mt-2">Loading risk details…</div>
          </div>
        ) : !risk ? (
          <div className="tmrd-empty">
            <h4>Risk not found</h4>
            <p className="text-muted">
              It may have been deleted or you don’t have access.
            </p>
            <button className="btn btn-primary" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        ) : (
          <div className="container tmrd-container">
            {/* Header */}
            <div className="tmrd-hero">
              <div>
                <h1 className="tmrd-title">{risk.title}</h1>
                <div className="tmrd-sub">
                  <span>
                    Project: <strong>{risk.project_name || "—"}</strong>
                  </span>
                  <span className="tmrd-dot">•</span>
                  <span>
                    Risk Status: <strong>{risk.status}</strong>
                  </span>
                </div>
              </div>

              <div className="tmrd-hero-right">
                <span
                  className={`tmrd-pill level-${(risk.risk_level || "").toLowerCase()}`}
                >
                  {risk.risk_level || "N/A"} Risk
                </span>

                <div className="tmrd-kpis">
                  <div className="tmrd-kpi">
                    <div className="tmrd-kpi-label">Risk Score</div>
                    <div className="tmrd-kpi-value">{risk.risk_score ?? "—"}</div>
                  </div>
                  <div className="tmrd-kpi">
                    <div className="tmrd-kpi-label">Est. Cost</div>
                    <div className="tmrd-kpi-value">
                      {risk.estimated_cost ? `₹${risk.estimated_cost}` : "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Approval banner */}
            {approvalStatus === "pending" && (
              <div className="alert alert-warning tmrd-alert">
                ⏳ This risk is <strong>pending PM approval</strong>. Mitigation
                suggestions are disabled until approval.
              </div>
            )}

            {approvalStatus === "rejected" && (
              <div className="alert alert-danger tmrd-alert">
                🗑️ This risk was <strong>rejected</strong> and is in Trash. It will
                be auto-deleted.
              </div>
            )}

            {approvalStatus === "approved" && (
              <div className="alert alert-success tmrd-alert">
                ✅ This risk is <strong>approved</strong>. You can suggest a mitigation
                plan to the PM below.
              </div>
            )}

            {/* Main grid */}
            <div className="tmrd-grid">
              {/* Details card */}
              <div className="tmrd-card">
                <div className="tmrd-card-title">Details</div>

                <div className="tmrd-info-grid">
                  <div className="tmrd-info">
                    <div className="tmrd-info-label">Probability</div>
                    <div className="tmrd-info-value">{risk.probability ?? "—"}</div>
                  </div>
                  <div className="tmrd-info">
                    <div className="tmrd-info-label">Impact</div>
                    <div className="tmrd-info-value">{risk.impact ?? "—"}</div>
                  </div>
                  <div className="tmrd-info">
                    <div className="tmrd-info-label">Assigned To</div>
                    <div className="tmrd-info-value">
                      {risk.assigned_to_name || risk.assigned_to || "—"}
                    </div>
                  </div>
                  <div className="tmrd-info">
                    <div className="tmrd-info-label">Approval</div>
                    <div className="tmrd-info-value">
                      <span
                        className={`tmrd-approval approval-${approvalStatus || "approved"}`}
                      >
                        {approvalStatus || "approved"}
                      </span>
                    </div>
                  </div>
                  <div className="tmrd-info">
                    <div className="tmrd-info-label">Created</div>
                    <div className="tmrd-info-value">{fmtDate(risk.created_at)}</div>
                  </div>
                  <div className="tmrd-info">
                    <div className="tmrd-info-label">Updated</div>
                    <div className="tmrd-info-value">{fmtDate(risk.updated_at)}</div>
                  </div>
                </div>

                <div className="tmrd-section">
                  <div className="tmrd-section-title">Description</div>
                  <div className="tmrd-desc">
                    {risk.description || "No description provided."}
                  </div>
                </div>
              </div>

              {/* Mitigation card (UPDATED WORKFLOW) */}
              <div className="tmrd-card">
                <div className="tmrd-card-top">
                  <div className="tmrd-card-title">Mitigation</div>

                  <button
                    className="btn btn-outline-primary btn-sm tmrd-editbtn"
                    onClick={() => setEditMode((p) => !p)}
                    disabled={!canSuggest}
                    title={
                      canSuggest
                        ? "Write / edit your suggestion"
                        : "Suggestions are disabled until approved"
                    }
                  >
                    ✏️ {editMode ? "Close" : "Suggest"}
                  </button>
                </div>

                <div className="tmrd-mitigation">
                  {/* PM mitigation (read-only) */}
                  <div className="tmrd-field">
                    <label className="tmrd-label">PM Mitigation Plan</label>
                    <div className="tmrd-readonly">
                      {risk.mitigation_plan || "PM has not defined mitigation yet."}
                    </div>
                  </div>

                  <div className="tmrd-field">
                    <label className="tmrd-label">PM Mitigation Status</label>
                    <div className="tmrd-readonly">
                      {risk.mitigation_status || "NotStarted"}
                    </div>
                  </div>

                  <div className="tmrd-divider" />

                  {/* TM suggestion + status */}
                  <div className="tmrd-field">
                    <div className="tmrd-label-row">
                      <label className="tmrd-label">Your Mitigation Suggestion</label>

                      {risk.tm_suggestion_status ? (
                        <span className={`tmrd-suggest-pill ${badgeClass(tmSuggestionStatus)}`}>
                          {tmSuggestionStatus}
                        </span>
                      ) : null}
                    </div>

                    <textarea
                      className="form-control tmrd-textarea"
                      rows={7}
                      value={risk.tm_mitigation_suggestion || ""}
                      onChange={(e) =>
                        setRisk((prev) => ({
                          ...prev,
                          tm_mitigation_suggestion: e.target.value,
                        }))
                      }
                      disabled={!editMode || !canSuggest || saving}
                      placeholder="Suggest mitigation steps for PM review..."
                    />

                    {tmSuggestionStatus === "approved" && (
                      <div className="tmrd-hint">
                        ✅ Your suggestion was approved and applied by PM.
                      </div>
                    )}

                    {tmSuggestionStatus === "rejected" && (
                      <div className="tmrd-hint">
                        ❌ Your suggestion was rejected. You can edit and submit again.
                      </div>
                    )}

                    {tmSuggestionStatus === "pending" && (
                      <div className="tmrd-hint">
                        ⏳ Your suggestion is pending PM review.
                      </div>
                    )}
                  </div>

                  <div className="tmrd-actions">
                    <button className="btn btn-light" onClick={() => navigate(-1)}>
                      ← Back
                    </button>

                    <button
                      className="btn btn-primary"
                      onClick={submitSuggestion}
                      disabled={!editMode || !canSuggest || saving}
                      title={!canSuggest ? "Wait for PM approval first" : "Submit to PM"}
                    >
                      {saving ? "Submitting..." : "Submit Suggestion"}
                    </button>
                  </div>

                  {!canSuggest && (
                    <div className="tmrd-hint">
                      Mitigation suggestions are allowed only after PM approves the risk.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer row */}
            <div className="tmrd-bottom">
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate(-1)}
              >
                ← Back to Risks
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default TMRiskDetails;
