import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../styles/PendingRiskApprovals.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const PendingRiskApprovals = () => {
  const [risks, setRisks] = useState([]);
  const [loadingRisks, setLoadingRisks] = useState(true);

  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);

  const [actionLoadingId, setActionLoadingId] = useState(null);

  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  const role = useMemo(() => {
    const r =
      me?.role ||
      me?.user_role ||
      me?.user_type ||
      me?.account_type ||
      me?.type ||
      "";
    return String(r).toUpperCase(); // PM / TM
  }, [me]);

  const isPM = role === "PM" || role === "PROJECT_MANAGER";

  const fetchMe = async () => {
    const token = getToken();
    if (!token) return;

    setLoadingMe(true);
    try {
      const res = await axios.get(`${backendUrl}/api/users/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMe(res.data);
    } catch (err) {
      console.error("Failed to load user info:", err.response?.data || err);
    } finally {
      setLoadingMe(false);
    }
  };

  const fetchPendingRisks = async () => {
    const token = getToken();
    if (!token) return;

    setLoadingRisks(true);
    try {
      const res = await axios.get(
        `${backendUrl}/api/risks/?approval_status=pending`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRisks(res.data || []);
    } catch (err) {
      console.error("Failed to load pending risks:", err.response?.data || err);
      setRisks([]);
    } finally {
      setLoadingRisks(false);
    }
  };

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // only load pending list after we know user is PM
    if (!loadingMe && isPM) fetchPendingRisks();
    // eslint-disable-next-line
  }, [loadingMe, isPM]);

  const handleAction = async (id, action) => {
    const token = getToken();
    if (!token) return;

    setActionLoadingId(id);
    try {
      await axios.patch(
        `${backendUrl}/api/risks/${id}/${action}/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchPendingRisks();
    } catch (err) {
      console.error("Approve/Reject failed:", err.response?.data || err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // ✅ Only PM should see this component
  if (loadingMe) return null;
  if (!isPM) return null;

  if (loadingRisks) {
    return (
      <div className="pra-card">
        <div className="pra-head">
          <div>
            <div className="pra-title">Pending Risk Approvals</div>
            <div className="pra-sub">Loading pending submissions…</div>
          </div>
          <div className="pra-pill">⏳ Loading</div>
        </div>
      </div>
    );
  }

  if (risks.length === 0) return null;

  return (
    <div className="pra-card">
      <div className="pra-head">
        <div>
          <div className="pra-title">Pending Risk Approvals</div>
          <div className="pra-sub">
            Review team-submitted risks and approve or reject.
          </div>
        </div>

        <div className="pra-count">
          {risks.length} pending
        </div>
      </div>

      <div className="pra-list">
        {risks.map((risk) => (
          <div key={risk.id} className="pra-row">
            <div className="pra-left">
              <div className="pra-risk-title">{risk.title}</div>
              <div className="pra-meta">
                <span className="pra-chip">Project: {risk.project_name}</span>
                <span className="pra-chip">Score: {risk.risk_score}</span>
                {risk.risk_level && (
                  <span className={`pra-badge level-${String(risk.risk_level).toLowerCase()}`}>
                    {risk.risk_level}
                  </span>
                )}
              </div>
            </div>

            <div className="pra-actions">
              <button
                className="pra-btn approve"
                disabled={actionLoadingId === risk.id}
                onClick={() => handleAction(risk.id, "approve")}
              >
                {actionLoadingId === risk.id ? "Working…" : "Approve"}
              </button>

              <button
                className="pra-btn reject"
                disabled={actionLoadingId === risk.id}
                onClick={() => handleAction(risk.id, "reject")}
              >
                {actionLoadingId === risk.id ? "Working…" : "Reject"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingRiskApprovals;
