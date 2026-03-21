import React, { useEffect, useMemo, useState } from "react";
import AppNavbar from "../components/Navbar";
import ConfirmModal from "../components/ConfirmModal";
import MessageModal from "../components/MessageModal";
import { adminApi } from "../services/adminApi";
import "../styles/Admin.css";

const AdminTransferOwnership = () => {
  const [loadingPMs, setLoadingPMs] = useState(true);
  const [pms, setPms] = useState([]);
  const [fromPM, setFromPM] = useState("");
  const [toPM, setToPM] = useState("");
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsInfo, setProjectsInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [transferDone, setTransferDone] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [messageOpen, setMessageOpen] = useState(false);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [messageVariant, setMessageVariant] = useState("success");

  useEffect(() => {
    fetchPMs();
  }, []);

  useEffect(() => {
    if (fromPM) {
      fetchProjectsByPM(fromPM);
      setTransferDone(false);
    } else {
      setProjectsInfo(null);
      setTransferDone(false);
    }
  }, [fromPM]);

  const openMessage = (title, body, variant = "success") => {
    setMessageTitle(title);
    setMessageBody(body);
    setMessageVariant(variant);
    setMessageOpen(true);
  };

  const fetchPMs = async () => {
    try {
      setLoadingPMs(true);
      const res = await adminApi.getPMList();
      setPms(res.data || []);
    } catch (err) {
      console.error(err);
      openMessage("Error", "Failed to load PM list.", "error");
    } finally {
      setLoadingPMs(false);
    }
  };

  const fetchProjectsByPM = async (pmId) => {
    try {
      setProjectsLoading(true);
      const res = await adminApi.getProjectsByPM(pmId);
      setProjectsInfo(res.data);
    } catch (err) {
      console.error(err);
      openMessage("Error", "Failed to load projects for selected PM.", "error");
    } finally {
      setProjectsLoading(false);
    }
  };

  const targetPMOptions = useMemo(() => {
    return pms.filter((pm) => String(pm.id) !== String(fromPM));
  }, [pms, fromPM]);

  const handleTransfer = async () => {
    if (!fromPM || !toPM) {
      openMessage(
        "Missing Selection",
        "Please select both source PM and target PM.",
        "error"
      );
      return;
    }

    try {
      setSubmitting(true);

      const res = await adminApi.transferOwnership(Number(fromPM), Number(toPM));

      openMessage(
        "Transfer Successful",
        res.data?.detail || "Project ownership transferred successfully.",
        "success"
      );

      setTransferDone(true);

      await fetchProjectsByPM(fromPM);
      await fetchPMs();
    } catch (err) {
      console.error(err);
      openMessage(
        "Transfer Failed",
        err?.response?.data?.detail ||
          err?.response?.data?.from_pm_id?.[0] ||
          err?.response?.data?.to_pm_id?.[0] ||
          "Transfer failed.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivateNow = async () => {
    if (!fromPM) return;

    try {
      setSubmitting(true);

      const res = await adminApi.deactivatePM(Number(fromPM));

      openMessage(
        "PM Deactivated",
        res.data?.detail || "Old PM account deactivated successfully.",
        "success"
      );

      setFromPM("");
      setToPM("");
      setProjectsInfo(null);
      setTransferDone(false);

      await fetchPMs();
    } catch (err) {
      console.error(err);
      openMessage(
        "Deactivate Failed",
        err?.response?.data?.pm_id?.[0] ||
          err?.response?.data?.detail ||
          "Failed to deactivate old PM.",
        "error"
      );
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="admin-page-wrap">
      <AppNavbar />

      <main className="admin-page">
        <section className="admin-hero">
          <div>
            <h2>Transfer Project Ownership</h2>
            <p>
              Transfer all projects from one PM to another. You may deactivate
              the old PM now or later from the Users page.
            </p>
          </div>
        </section>

        <section className="admin-grid admin-grid-2">
          <div className="admin-panel-card">
            <h3>Transfer Setup</h3>

            {loadingPMs ? (
              <div className="admin-loading-card">Loading PMs...</div>
            ) : (
              <>
                <div className="admin-form-group">
                  <label>Source PM</label>
                  <select
                    value={fromPM}
                    onChange={(e) => setFromPM(e.target.value)}
                  >
                    <option value="">Select old PM</option>
                    {pms.map((pm) => (
                      <option key={pm.id} value={pm.id}>
                        {pm.full_name || pm.username} ({pm.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Target PM</label>
                  <select
                    value={toPM}
                    onChange={(e) => setToPM(e.target.value)}
                    disabled={!fromPM}
                  >
                    <option value="">Select new PM</option>
                    {targetPMOptions.map((pm) => (
                      <option key={pm.id} value={pm.id}>
                        {pm.full_name || pm.username} ({pm.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-action-row">
                  <button
                    className="admin-primary-btn"
                    onClick={handleTransfer}
                    disabled={submitting || !fromPM || !toPM}
                  >
                    {submitting ? "Processing..." : "Transfer Ownership"}
                  </button>

                  <button
                    className="admin-secondary-btn"
                    onClick={() => setConfirmOpen(true)}
                    disabled={submitting || !transferDone}
                  >
                    {submitting ? "Processing..." : "Deactivate Now"}
                  </button>
                </div>

                <div className="admin-note-box">
                  After transfer, you can deactivate the old PM immediately or
                  later from the User Management page.
                </div>
              </>
            )}
          </div>

          <div className="admin-panel-card">
            <h3>Selected PM Projects</h3>

            {projectsLoading ? (
              <div className="admin-loading-card">Loading projects...</div>
            ) : !fromPM ? (
              <div className="admin-empty-block">
                Select a source PM to view their owned projects.
              </div>
            ) : !projectsInfo ? (
              <div className="admin-empty-block">No project info found.</div>
            ) : (
              <>
                <div className="admin-mini-summary">
                  <div>
                    <strong>PM:</strong> {projectsInfo.pm?.username} (
                    {projectsInfo.pm?.email})
                  </div>
                  <div>
                    <strong>Total Projects:</strong> {projectsInfo.project_count}
                  </div>
                </div>

                <div className="project-list-block">
                  {projectsInfo.projects?.length ? (
                    projectsInfo.projects.map((project) => (
                      <div key={project.id} className="project-preview-card">
                        <div className="project-preview-top">
                          <h4>{project.name}</h4>
                          <span className={`project-status ${project.status}`}>
                            {project.status}
                          </span>
                        </div>
                        <p>{project.description || "No description provided."}</p>
                        <div className="project-preview-meta">
                          <span>Sector: {project.sector}</span>
                          <span>Team: {project.team_count}</span>
                          <span>PM: {project.pm_email}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="admin-empty-block">
                      This PM currently owns no projects.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <ConfirmModal
        open={confirmOpen}
        title="Deactivate Old PM"
        message="Are you sure you want to deactivate this old PM account now? This user will no longer be able to log in."
        onConfirm={handleDeactivateNow}
        onCancel={() => setConfirmOpen(false)}
      />

      <MessageModal
        open={messageOpen}
        title={messageTitle}
        message={messageBody}
        variant={messageVariant}
        onClose={() => setMessageOpen(false)}
      />
    </div>
  );
};

export default AdminTransferOwnership;