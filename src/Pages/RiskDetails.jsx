import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import ConfirmModal from "../components/ConfirmModal";
import AppNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/RiskDetails.css";

import RiskChat from "../components/RiskChat"; // ✅ NEW

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const RiskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const projectId = location.state?.projectId;

  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [mitigationPlan, setMitigationPlan] = useState("");
  const [mitigationStatus, setMitigationStatus] = useState("NotStarted");
  const [saving, setSaving] = useState(false);

  const [processingSuggestion, setProcessingSuggestion] = useState(false);

  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  const fetchRisk = async () => {
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
      setMitigationPlan(res.data.mitigation_plan || "");
      setMitigationStatus(res.data.mitigation_status || "NotStarted");
    } catch (e) {
      console.error("Failed to load PM risk details:", e?.response?.data || e);
      if (e?.response?.status === 401) {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/login", { state: { forceLogin: true } });
      } else {
        toast.error(e?.response?.data?.detail || "Failed to load risk details.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisk();
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

  const getRiskMeta = (score) => {
    if (score <= 6) return { level: "Low", cls: "low", percent: 10 };
    if (score <= 14) return { level: "Medium", cls: "medium", percent: 30 };
    return { level: "High", cls: "high", percent: 60 };
  };

  const score = useMemo(() => {
    if (!risk) return 0;
    return risk.risk_score || risk.probability * risk.impact;
  }, [risk]);

  const meta = useMemo(() => getRiskMeta(score), [score]);

  const estimatedLoss = useMemo(() => {
    const cost = Number(risk?.estimated_cost || 0);
    return (cost * meta.percent) / 100;
  }, [risk, meta]);

  const suggestionStatus = useMemo(
    () => (risk?.tm_suggestion_status || "").toLowerCase(),
    [risk]
  );

  const hasSuggestion = useMemo(() => {
    return !!(risk?.tm_mitigation_suggestion && risk.tm_mitigation_suggestion.trim());
  }, [risk]);

  const canActOnSuggestion = useMemo(() => {
    return hasSuggestion && suggestionStatus === "pending";
  }, [hasSuggestion, suggestionStatus]);

  const mitigationPatchUrl = `${backendUrl}/api/risks/${id}/mitigation/`;
  const approveSuggestionUrl = `${backendUrl}/api/risks/${id}/approve-suggestion/`;
  const rejectSuggestionUrl = `${backendUrl}/api/risks/${id}/reject-suggestion/`;

  const handleMitigationSave = async () => {
    try {
      setSaving(true);
      const token = getToken();

      await axios.patch(
        mitigationPatchUrl,
        {
          mitigation_plan: mitigationPlan,
          mitigation_status: mitigationStatus,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchRisk();
      setEditMode(false);
      toast.success("Mitigation saved successfully.");
    } catch (e) {
      console.error("Failed to save mitigation:", e?.response?.data || e);
      toast.error(e?.response?.data?.detail || "Failed to save mitigation.");
    } finally {
      setSaving(false);
    }
  };

  const handleApproveSuggestion = async () => {
    try {
      setProcessingSuggestion(true);
      const token = getToken();

      await axios.patch(approveSuggestionUrl, {}, { headers: { Authorization: `Bearer ${token}` } });

      await fetchRisk();
      toast.success("Suggestion approved and applied.");
    } catch (e) {
      console.error("Approve suggestion failed:", e?.response?.data || e);
      toast.error(e?.response?.data?.detail || "Failed to approve suggestion.");
    } finally {
      setProcessingSuggestion(false);
    }
  };

  const handleRejectSuggestion = async () => {
    try {
      setProcessingSuggestion(true);
      const token = getToken();

      await axios.patch(rejectSuggestionUrl, {}, { headers: { Authorization: `Bearer ${token}` } });

      await fetchRisk();
      toast.info("Suggestion rejected.");
    } catch (e) {
      console.error("Reject suggestion failed:", e?.response?.data || e);
      toast.error(e?.response?.data?.detail || "Failed to reject suggestion.");
    } finally {
      setProcessingSuggestion(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = getToken();
      await axios.delete(`${backendUrl}/api/risks/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Risk deleted.");
      navigate(projectId ? `/projects/${projectId}` : "/projects", { replace: true });
    } catch (e) {
      console.error("Delete failed:", e?.response?.data || e);
      toast.error(e?.response?.data?.detail || "Failed to delete risk.");
    }
  };

  const goBack = () => {
    navigate(projectId ? `/projects/${projectId}` : "/projects", { replace: true });
  };

  return (
    <>
      <AppNavbar />
      <ToastContainer position="top-right" autoClose={2500} pauseOnHover />

      <div className="pmrd-wrap">
        {loading ? (
          <div className="pmrd-loading">
            <div className="spinner-border" role="status" />
            <div className="text-muted mt-2">Loading risk details…</div>
          </div>
        ) : !risk ? (
          <div className="pmrd-empty">
            <h4>Risk not found</h4>
            <p className="text-muted">It may have been deleted or you don’t have access.</p>
            <button className="btn btn-primary" onClick={goBack}>
              Go Back
            </button>
          </div>
        ) : (
          <div className="container pmrd-container">
            <div className="pmrd-hero">
              <div>
                <h1 className="pmrd-title">{risk.title}</h1>
                <div className="pmrd-sub">
                  <span>
                    Project: <strong>{risk.project_name || "—"}</strong>
                  </span>
                  <span className="pmrd-dot">•</span>
                  <span>
                    Risk Status: <strong>{risk.status}</strong>
                  </span>
                </div>
              </div>

              <div className="pmrd-hero-right">
                <span className={`pmrd-pill level-${(meta.level || "").toLowerCase()}`}>
                  {meta.level} Risk
                </span>

                <div className="pmrd-kpis">
                  <div className="pmrd-kpi">
                    <div className="pmrd-kpi-label">Risk Score</div>
                    <div className="pmrd-kpi-value">{score}</div>
                  </div>
                  <div className="pmrd-kpi">
                    <div className="pmrd-kpi-label">Est. Cost</div>
                    <div className="pmrd-kpi-value">
                      {risk.estimated_cost ? `₹${Number(risk.estimated_cost).toLocaleString()}` : "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-success pmrd-alert">
              ✅ You are viewing this risk as <strong>Project Manager</strong>. You can update mitigation and review TM
              suggestions below.
            </div>

            <div className="pmrd-grid">
              <div className="pmrd-card">
                <div className="pmrd-card-title">Details</div>

                <div className="pmrd-info-grid">
                  <div className="pmrd-info">
                    <div className="pmrd-info-label">Probability</div>
                    <div className="pmrd-info-value">{risk.probability ?? "—"}</div>
                  </div>

                  <div className="pmrd-info">
                    <div className="pmrd-info-label">Impact</div>
                    <div className="pmrd-info-value">{risk.impact ?? "—"}</div>
                  </div>

                  <div className="pmrd-info">
                    <div className="pmrd-info-label">Assigned To</div>
                    <div className="pmrd-info-value">{risk.assigned_to_name || "Not Assigned"}</div>
                  </div>

                  <div className="pmrd-info">
                    <div className="pmrd-info-label">Approval</div>
                    <div className="pmrd-info-value">
                      <span className={`pmrd-approval approval-${(risk.approval_status || "approved").toLowerCase()}`}>
                        {risk.approval_status || "approved"}
                      </span>
                    </div>
                  </div>

                  <div className="pmrd-info">
                    <div className="pmrd-info-label">Created</div>
                    <div className="pmrd-info-value">{fmtDate(risk.created_at)}</div>
                  </div>

                  <div className="pmrd-info">
                    <div className="pmrd-info-label">Updated</div>
                    <div className="pmrd-info-value">{fmtDate(risk.updated_at)}</div>
                  </div>
                </div>

                <div className="pmrd-loss">
                  <div className="pmrd-loss-box">
                    <div className="pmrd-loss-label">Loss %</div>
                    <div className="pmrd-loss-value">{meta.percent}%</div>
                  </div>
                  <div className="pmrd-loss-box">
                    <div className="pmrd-loss-label">Estimated Loss</div>
                    <div className="pmrd-loss-value loss-red">₹{estimatedLoss.toLocaleString()}</div>
                  </div>
                </div>

                <div className="pmrd-section">
                  <div className="pmrd-section-title">Description</div>
                  <div className="pmrd-desc">{risk.description || "No description provided."}</div>
                </div>
              </div>

              <div className="pmrd-card">
                <div className="pmrd-card-top">
                  <div className="pmrd-card-title">Mitigation</div>

                  <button
                    className="btn btn-outline-primary btn-sm pmrd-editbtn"
                    onClick={() => setEditMode((p) => !p)}
                    title="Edit PM mitigation plan/status"
                  >
                    ✏️ {editMode ? "Close" : "Edit"}
                  </button>
                </div>

                <div className="pmrd-field">
                  <label className="pmrd-label">PM Mitigation Plan</label>
                  {editMode ? (
                    <textarea
                      className="form-control pmrd-textarea"
                      rows={6}
                      value={mitigationPlan}
                      onChange={(e) => setMitigationPlan(e.target.value)}
                      disabled={saving}
                      placeholder="Write official mitigation steps here…"
                    />
                  ) : (
                    <div className="pmrd-readonly">{risk.mitigation_plan || "No mitigation defined yet."}</div>
                  )}
                </div>

                <div className="pmrd-field">
                  <label className="pmrd-label">PM Mitigation Status</label>
                  {editMode ? (
                    <select
                      className="form-select pmrd-select"
                      value={mitigationStatus}
                      onChange={(e) => setMitigationStatus(e.target.value)}
                      disabled={saving}
                    >
                      <option value="NotStarted">Not Started</option>
                      <option value="InProgress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  ) : (
                    <div className="pmrd-readonly">
                      <span className={`pmrd-status ${risk.mitigation_status || "NotStarted"}`}>
                        {risk.mitigation_status || "NotStarted"}
                      </span>
                    </div>
                  )}
                </div>

                {editMode && (
                  <div className="pmrd-actions-row">
                    <button className="btn btn-light" onClick={() => setEditMode(false)} disabled={saving}>
                      Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleMitigationSave} disabled={saving}>
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}

                <div className="pmrd-suggest">
                  <div className="pmrd-suggest-top">
                    <div>
                      <div className="pmrd-suggest-title">TM Mitigation Suggestion</div>
                      <div className="pmrd-suggest-sub">Approve & apply, or reject.</div>
                    </div>

                    <span className={`pmrd-suggest-status ${risk.tm_suggestion_status || "none"}`}>
                      {risk.tm_suggestion_status || "none"}
                    </span>
                  </div>

                  <div className="pmrd-suggest-box">
                    {hasSuggestion ? (
                      <div className="pmrd-suggest-text">{risk.tm_mitigation_suggestion}</div>
                    ) : (
                      <div className="pmrd-suggest-empty">No suggestion submitted yet.</div>
                    )}
                  </div>

                  {canActOnSuggestion && (
                    <div className="pmrd-suggest-actions">
                      <button
                        className="btn btn-primary"
                        onClick={handleApproveSuggestion}
                        disabled={processingSuggestion}
                        title="Approve and apply suggestion to PM mitigation"
                      >
                        ✅ Approve & Apply
                      </button>

                      <button className="btn btn-light" onClick={handleRejectSuggestion} disabled={processingSuggestion}>
                        ❌ Reject
                      </button>
                    </div>
                  )}

                  {!canActOnSuggestion && hasSuggestion && (
                    <div className="pmrd-suggest-hint">
                      ℹ️ Suggestion is <strong>{risk.tm_suggestion_status}</strong>.
                    </div>
                  )}
                </div>

                <div className="pmrd-bottom-actions">
                  <button className="btn btn-outline-secondary" onClick={goBack}>
                    ← Back
                  </button>

                  <button
                    className="btn btn-outline-primary"
                    onClick={() => navigate(`/risks/${id}/edit`, { state: { projectId } })}
                  >
                    ✏️ Edit Risk
                  </button>

                  <button className="btn btn-danger" onClick={() => setConfirmOpen(true)}>
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>

            {/* ✅ NEW: Full-width chat section */}
            <div className="pmrd-chat">
              <RiskChat riskId={id} title="Risk Discussion (PM ↔ TM)" />
            </div>

            <div className="pmrd-bottom">
              <button className="btn btn-outline-secondary" onClick={goBack}>
                ← Back to Project
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />

      <ConfirmModal
        open={confirmOpen}
        title="Delete Risk"
        message="Are you sure you want to delete this risk?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
};

export default RiskDetails;