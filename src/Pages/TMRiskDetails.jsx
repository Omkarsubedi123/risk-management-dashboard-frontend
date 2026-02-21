import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import AppNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/TMRiskDetails.css";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const TMRiskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);

  // Suggestion
  const [savingSuggestion, setSavingSuggestion] = useState(false);
  const [editSuggestionMode, setEditSuggestionMode] = useState(false);

  // ✅ NEW: Work progress
  const [editProgressMode, setEditProgressMode] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingMitigation, setSavingMitigation] = useState(false);

  const [tmRiskStatus, setTmRiskStatus] = useState("Open");
  const [tmMitigationStatus, setTmMitigationStatus] = useState("NotStarted");

  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  const approvalStatus = (risk?.approval_status || "").toLowerCase();
  const tmSuggestionStatus = (risk?.tm_suggestion_status || "").toLowerCase();

  const canSuggest = useMemo(() => {
    if (!risk) return false;
    return approvalStatus === "approved";
  }, [risk, approvalStatus]);

  const canUpdateProgress = useMemo(() => {
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

      // sync local progress values
      setTmRiskStatus(res.data.status || "Open");
      setTmMitigationStatus(res.data.mitigation_status || "NotStarted");
    } catch (err) {
      console.error("Failed to load TM risk details:", err.response?.data || err);
      if (err.response?.status === 401) {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/login", { state: { forceLogin: true } });
      } else {
        toast.error(err?.response?.data?.detail || "Failed to load risk details.");
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
      toast.warning("Suggestion cannot be empty.");
      return;
    }

    try {
      setSavingSuggestion(true);
      const token = getToken();

      await axios.patch(
        `${backendUrl}/api/risks/${id}/suggest-mitigation/`,
        { tm_mitigation_suggestion: suggestionText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchRiskDetails();
      setEditSuggestionMode(false);
      toast.success("Suggestion sent to PM.");
    } catch (err) {
      console.error("Failed to submit suggestion:", err.response?.data || err);
      toast.error(err?.response?.data?.detail || "Failed to submit suggestion.");
    } finally {
      setSavingSuggestion(false);
    }
  };

  // ✅ NEW: save risk.status (Open/InProgress/Closed)
  const saveRiskStatus = async () => {
    if (!canUpdateProgress) return;
    try {
      setSavingStatus(true);
      const token = getToken();

      await axios.patch(
        `${backendUrl}/api/risks/${id}/tm-status/`,
        { status: tmRiskStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchRiskDetails();
      toast.success("Risk status updated.");
    } catch (err) {
      console.error("Failed to update risk status:", err.response?.data || err);
      toast.error(err?.response?.data?.detail || "Failed to update risk status.");
    } finally {
      setSavingStatus(false);
    }
  };

  // ✅ NEW: save mitigation_status via your existing mitigation endpoint
  const saveMitigationStatus = async () => {
    if (!canUpdateProgress) return;
    try {
      setSavingMitigation(true);
      const token = getToken();

      await axios.patch(
        `${backendUrl}/api/risks/${id}/mitigation/`,
        { mitigation_status: tmMitigationStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchRiskDetails();
      toast.success("Mitigation progress updated.");
    } catch (err) {
      console.error("Failed to update mitigation status:", err.response?.data || err);
      toast.error(err?.response?.data?.detail || "Failed to update mitigation status.");
    } finally {
      setSavingMitigation(false);
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
      <ToastContainer position="top-right" autoClose={2500} pauseOnHover />

      <div className="tmrd-wrap">
        {loading ? (
          <div className="tmrd-loading">
            <div className="spinner-border" role="status" />
            <div className="text-muted mt-2">Loading risk details…</div>
          </div>
        ) : !risk ? (
          <div className="tmrd-empty">
            <h4>Risk not found</h4>
            <p className="text-muted">It may have been deleted or you don’t have access.</p>
            <button className="btn btn-primary" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        ) : (
          <div className="container tmrd-container">
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
                <span className={`tmrd-pill level-${(risk.risk_level || "").toLowerCase()}`}>
                  {risk.risk_level || "N/A"} Risk
                </span>

                <div className="tmrd-kpis">
                  <div className="tmrd-kpi">
                    <div className="tmrd-kpi-label">Risk Score</div>
                    <div className="tmrd-kpi-value">{risk.risk_score ?? "—"}</div>
                  </div>
                  <div className="tmrd-kpi">
                    <div className="tmrd-kpi-label">Est. Cost</div>
                    <div className="tmrd-kpi-value">{risk.estimated_cost ? `₹${risk.estimated_cost}` : "—"}</div>
                  </div>
                </div>
              </div>
            </div>

            {approvalStatus === "pending" && (
              <div className="alert alert-warning tmrd-alert">
                ⏳ This risk is <strong>pending PM approval</strong>. Updates are disabled until approval.
              </div>
            )}

            {approvalStatus === "rejected" && (
              <div className="alert alert-danger tmrd-alert">
                🗑️ This risk was <strong>rejected</strong> and is in Trash. It will be auto-deleted.
              </div>
            )}

            {approvalStatus === "approved" && (
              <div className="alert alert-success tmrd-alert">
                ✅ This risk is <strong>approved</strong>. You can update work progress and suggest mitigation.
              </div>
            )}

            <div className="tmrd-grid">
              {/* LEFT */}
              <div className="tmrd-card">
                <div className="tmrd-card-top">
                  <div className="tmrd-card-title">Details</div>

                  <button
                    className="btn btn-outline-primary btn-sm tmrd-editbtn"
                    onClick={() => setEditProgressMode((p) => !p)}
                    disabled={!canUpdateProgress}
                    title={canUpdateProgress ? "Update your progress" : "Disabled until approved"}
                  >
                    🧩 {editProgressMode ? "Close" : "Update Progress"}
                  </button>
                </div>

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
                    <div className="tmrd-info-value">{risk.assigned_to_name || risk.assigned_to || "—"}</div>
                  </div>

                  <div className="tmrd-info">
                    <div className="tmrd-info-label">Approval</div>
                    <div className="tmrd-info-value">
                      <span className={`tmrd-approval approval-${approvalStatus || "approved"}`}>
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

                {/* ✅ NEW: Work Progress */}
                <div className="tmrd-section">
                  <div className="tmrd-section-title">Work Progress</div>

                  <div className="tmrd-field">
                    <label className="tmrd-label">Risk Work Status</label>
                    {editProgressMode ? (
                      <select
                        className="form-select tmrd-select"
                        value={tmRiskStatus}
                        onChange={(e) => setTmRiskStatus(e.target.value)}
                        disabled={!canUpdateProgress || savingStatus}
                      >
                        <option value="Open">Open</option>
                        <option value="InProgress">In Progress</option>
                        <option value="Closed">Completed (Closed)</option>
                      </select>
                    ) : (
                      <div className="tmrd-readonly">{risk.status || "Open"}</div>
                    )}

                    {editProgressMode && (
                      <div style={{ marginTop: 10 }}>
                        <button
                          className="btn btn-primary w-100"
                          onClick={saveRiskStatus}
                          disabled={savingStatus || !canUpdateProgress}
                        >
                          {savingStatus ? "Saving..." : "Save Risk Status"}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="tmrd-field">
                    <label className="tmrd-label">Mitigation Progress</label>
                    {editProgressMode ? (
                      <select
                        className="form-select tmrd-select"
                        value={tmMitigationStatus}
                        onChange={(e) => setTmMitigationStatus(e.target.value)}
                        disabled={!canUpdateProgress || savingMitigation}
                      >
                        <option value="NotStarted">Not Started</option>
                        <option value="InProgress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    ) : (
                      <div className="tmrd-readonly">{risk.mitigation_status || "NotStarted"}</div>
                    )}

                    {editProgressMode && (
                      <div style={{ marginTop: 10 }}>
                        <button
                          className="btn btn-primary w-100"
                          onClick={saveMitigationStatus}
                          disabled={savingMitigation || !canUpdateProgress}
                        >
                          {savingMitigation ? "Saving..." : "Save Mitigation Progress"}
                        </button>
                      </div>
                    )}
                  </div>

                  {!canUpdateProgress && (
                    <div className="tmrd-hint">
                      Progress updates are allowed only after PM approves the risk.
                    </div>
                  )}
                </div>

                <div className="tmrd-section">
                  <div className="tmrd-section-title">Description</div>
                  <div className="tmrd-desc">{risk.description || "No description provided."}</div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="tmrd-card">
                <div className="tmrd-card-top">
                  <div className="tmrd-card-title">Mitigation</div>

                  <button
                    className="btn btn-outline-primary btn-sm tmrd-editbtn"
                    onClick={() => setEditSuggestionMode((p) => !p)}
                    disabled={!canSuggest}
                    title={canSuggest ? "Write / edit your suggestion" : "Suggestions are disabled until approved"}
                  >
                    ✏️ {editSuggestionMode ? "Close" : "Suggest"}
                  </button>
                </div>

                <div className="tmrd-mitigation">
                  <div className="tmrd-field">
                    <label className="tmrd-label">PM Mitigation Plan</label>
                    <div className="tmrd-readonly">
                      {risk.mitigation_plan || "PM has not defined mitigation yet."}
                    </div>
                  </div>

                  <div className="tmrd-field">
                    <label className="tmrd-label">PM Mitigation Status</label>
                    <div className="tmrd-readonly">{risk.mitigation_status || "NotStarted"}</div>
                  </div>

                  <div className="tmrd-divider" />

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
                      disabled={!editSuggestionMode || !canSuggest || savingSuggestion}
                      placeholder="Suggest mitigation steps for PM review..."
                    />

                    {tmSuggestionStatus === "approved" && (
                      <div className="tmrd-hint">✅ Your suggestion was approved and applied by PM.</div>
                    )}
                    {tmSuggestionStatus === "rejected" && (
                      <div className="tmrd-hint">❌ Your suggestion was rejected. You can edit and submit again.</div>
                    )}
                    {tmSuggestionStatus === "pending" && (
                      <div className="tmrd-hint">⏳ Your suggestion is pending PM review.</div>
                    )}
                  </div>

                  <div className="tmrd-actions">
                    <button className="btn btn-light" onClick={() => navigate(-1)}>
                      ← Back
                    </button>

                    <button
                      className="btn btn-primary"
                      onClick={submitSuggestion}
                      disabled={!editSuggestionMode || !canSuggest || savingSuggestion}
                    >
                      {savingSuggestion ? "Submitting..." : "Submit Suggestion"}
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

            <div className="tmrd-bottom">
              <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
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