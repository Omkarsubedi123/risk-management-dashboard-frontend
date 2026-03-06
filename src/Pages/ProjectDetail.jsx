import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AppNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import MessageModal from "../components/MessageModal";
import ConfirmModal from "../components/ConfirmModal";
import TeamPreviewCard from "../components/TeamPreviewCard";
import "../styles/ProjectDetails.css";

const backendUrl =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const SECTOR_OPTIONS = [
  "IT/Software",
  "Finance",
  "Healthcare",
  "Education",
  "E-commerce",
  "Manufacturing",
  "Construction",
  "Government",
  "Other",
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
];

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);

  // keep a dedicated status state for the UI + chips + display
  const [status, setStatus] = useState("active");

  const [loading, setLoading] = useState(true);

  const [risks, setRisks] = useState([]);
  const [riskLoading, setRiskLoading] = useState(true);

  const [msgOpen, setMsgOpen] = useState(false);
  const [msgCfg, setMsgCfg] = useState({
    title: "",
    message: "",
    variant: "success",
  });

  const [confirmOpen, setConfirmOpen] = useState(false);

  // Inline edit
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    sector: "", // dropdown value (or "Other")
    sector_other: "", // free text if Other
    description: "",
    status: "active", // ✅ move status to edit form
  });
  const [saving, setSaving] = useState(false);

  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    setRiskLoading(true);
    await Promise.all([fetchProject(), fetchRisks()]);
    setLoading(false);
  };

  const normalizeSectorForEdit = (rawSector) => {
    const s = (rawSector || "").trim();
    if (!s) return { sector: "", sector_other: "" };

    const match = SECTOR_OPTIONS.find(
      (opt) => opt.toLowerCase() === s.toLowerCase()
    );
    if (match && match !== "Other") return { sector: match, sector_other: "" };

    if (match === "Other") return { sector: "Other", sector_other: "" };

    return { sector: "Other", sector_other: s };
  };

  const normalizeStatus = (raw) => {
    const s = String(raw || "").toLowerCase().trim();
    if (s === "active") return "active";
    if (s === "on_hold" || s === "on hold") return "on_hold";
    if (s === "completed") return "completed";
    return "active";
  };

  const fetchProject = async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${backendUrl}/api/projects/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const proj = res.data;
      setProject(proj);

      const normalizedSector = normalizeSectorForEdit(proj.sector);
      const normalizedStatus = normalizeStatus(proj.status);

      // ✅ keep status in both places
      setStatus(normalizedStatus);

      setEditForm({
        name: proj.name || "",
        sector: normalizedSector.sector || "",
        sector_other: normalizedSector.sector_other || "",
        description: proj.description || "",
        status: normalizedStatus,
      });
    } catch {
      showMsg("Error", "Failed to load project.", "error");
    }
  };

  const fetchRisks = async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${backendUrl}/api/risks/?project=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRisks(res.data || []);
    } catch {
      showMsg("Error", "Failed to load risks.", "error");
    } finally {
      setRiskLoading(false);
    }
  };

  const showMsg = (title, message, variant) => {
    setMsgCfg({ title, message, variant });
    setMsgOpen(true);
  };

  const stats = useMemo(() => {
    const total = risks.length;
    const assigned = risks.filter((r) => r.assigned_to != null).length;
    const pending = risks.filter(
      (r) => String(r.approval_status || "").toLowerCase() === "pending"
    ).length;
    const high = risks.filter(
      (r) => String(r.risk_level || "").toLowerCase() === "high"
    ).length;
    return { total, assigned, pending, high };
  }, [risks]);

  const projectStatusLabel = useMemo(() => {
    const s = String(status || project?.status || "active").toLowerCase();
    if (s === "active") return "Active";
    if (s === "on_hold") return "On Hold";
    if (s === "completed") return "Completed";
    return s;
  }, [project, status]);

  // ✅ (Used if your backend needs separate /status/ endpoint – safe fallback)
  const patchStatusIfNeeded = async (newStatus) => {
    const token = getToken();
    try {
      await axios.patch(
        `${backendUrl}/api/projects/${id}/status/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return true;
    } catch {
      return false;
    }
  };

  const handleDelete = async () => {
    setConfirmOpen(false);
    try {
      const token = getToken();
      await axios.delete(`${backendUrl}/api/projects/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/projects");
    } catch {
      showMsg("Delete Failed", "Unable to delete project.", "error");
    }
  };

  const startEdit = () => {
    if (!project) return;

    const normalized = normalizeSectorForEdit(project.sector);
    const s = normalizeStatus(project.status);

    setEditForm({
      name: project.name || "",
      sector: normalized.sector || "",
      sector_other: normalized.sector_other || "",
      description: project.description || "",
      status: s,
    });

    setStatus(s);
    setEditMode(true);
  };

  const cancelEdit = () => {
    if (!project) return;

    const normalized = normalizeSectorForEdit(project.sector);
    const s = normalizeStatus(project.status);

    setEditForm({
      name: project.name || "",
      sector: normalized.sector || "",
      sector_other: normalized.sector_other || "",
      description: project.description || "",
      status: s,
    });

    setStatus(s);
    setEditMode(false);
  };

  const saveEdit = async () => {
    if (!project) return;

    const name = (editForm.name || "").trim();
    const sector =
      editForm.sector === "Other"
        ? (editForm.sector_other || "").trim()
        : (editForm.sector || "").trim();
    const description = (editForm.description || "").trim();
    const newStatus = normalizeStatus(editForm.status);

    if (!name) {
      showMsg("Validation", "Project name is required.", "error");
      return;
    }
    if (!sector) {
      showMsg("Validation", "Sector is required.", "error");
      return;
    }
    if (editForm.sector === "Other" && !editForm.sector_other.trim()) {
      showMsg("Validation", "Please enter your sector in 'Other'.", "error");
      return;
    }

    setSaving(true);
    try {
      const token = getToken();

      // ✅ try to update status inside the same PATCH (best)
      let res;
      try {
        res = await axios.patch(
          `${backendUrl}/api/projects/${id}/`,
          { name, sector, description, status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (e) {
        // if backend serializer doesn't accept status in this endpoint
        res = await axios.patch(
          `${backendUrl}/api/projects/${id}/`,
          { name, sector, description },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // fallback: update status using dedicated endpoint
        await patchStatusIfNeeded(newStatus);
      }

      const updated = res.data;
      setProject((p) => (p ? { ...p, ...updated, status: newStatus } : updated));
      setStatus(newStatus);
      setEditMode(false);
      showMsg("Saved", "Project updated successfully.", "success");
    } catch {
      showMsg("Failed", "Project update failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !project) {
    return (
      <>
        <AppNavbar />
        <div className="pd-loading">Loading project…</div>
      </>
    );
  }

  return (
    <>
      <AppNavbar />

      <div className="pdX-page">
        {/* HERO */}
        <div className="pdX-hero">
          <div className="pdX-hero-inner">
            <button className="pdX-back" onClick={() => navigate("/projects")}>
              ← My Projects
            </button>

            <div className="pdX-hero-main">
              <div className="pdX-hero-left">
                {!editMode ? (
                  <>
                    <h1 className="pdX-title">{project.name}</h1>
                    <p className="pdX-desc">
                      {project.description || "No description"}
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="pdX-title">Edit Project</h1>

                    <div className="pdX-edit">
                      <div className="pdX-field">
                        <label>Project Name</label>
                        <input
                          className="pdX-input"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          placeholder="Enter project name"
                        />
                      </div>

                      {/* ✅ Sector dropdown + Other text field */}
                      <div className="pdX-field">
                        <label>Sector</label>

                        <select
                          className="pdX-select pdX-select-dark"
                          value={editForm.sector}
                          onChange={(e) => {
                            const v = e.target.value;
                            setEditForm((prev) => ({
                              ...prev,
                              sector: v,
                              sector_other: v === "Other" ? prev.sector_other : "",
                            }));
                          }}
                        >
                          <option value="">Select sector</option>
                          {SECTOR_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>

                        {editForm.sector === "Other" && (
                          <input
                            className="pdX-input pdX-input-spaced"
                            value={editForm.sector_other}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                sector_other: e.target.value,
                              })
                            }
                            placeholder="Enter your sector"
                          />
                        )}
                      </div>

                      {/* ✅ STATUS EDIT (this was missing) */}
                      <div className="pdX-field">
                        <label>Project Status</label>
                        <select
                          className="pdX-select pdX-select-dark"
                          value={editForm.status}
                          onChange={(e) => {
                            const v = normalizeStatus(e.target.value);
                            setEditForm((prev) => ({ ...prev, status: v }));
                            setStatus(v); // ✅ keeps chip + below synced instantly
                          }}
                        >
                          {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="pdX-field">
                        <label>Description</label>
                        <textarea
                          className="pdX-textarea"
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              description: e.target.value,
                            })
                          }
                          placeholder="Write project description..."
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="pdX-chips">
                  <span className="pdX-chip">
                    Sector: <strong>{project.sector || "N/A"}</strong>
                  </span>
                  <span className="pdX-chip pdX-chip-status">
                    {projectStatusLabel}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pdX-actions">
                <div className="pdX-actions-title">Actions</div>

                <div className="pdX-actions-grid">
                  <button
                    className="pdX-btn pdX-btn-primary"
                    onClick={() =>
                      navigate("/risks", {
                        state: { projectId: Number(id), fromProject: true },
                      })
                    }
                  >
                    My Risks (This Project)
                  </button>

                  <button
                    className="pdX-btn pdX-btn-outline"
                    onClick={() => navigate(`/projects/${id}/risks/create`)}
                  >
                    Add Risk
                  </button>

                  <button
                    className="pdX-btn pdX-btn-muted"
                    onClick={() => navigate("/projects")}
                  >
                    Back
                  </button>
                </div>

                <div className="pdX-actions-hint">
                  PM-only: edit project, approvals & status control.
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="pdX-stats">
              <div className="pdX-stat">
                <div className="pdX-stat-k">TOTAL RISKS</div>
                <div className="pdX-stat-v">{stats.total}</div>
              </div>
              <div className="pdX-stat">
                <div className="pdX-stat-k">MY ASSIGNED</div>
                <div className="pdX-stat-v">{stats.assigned}</div>
              </div>
              <div className="pdX-stat">
                <div className="pdX-stat-k">PENDING APPROVAL</div>
                <div className="pdX-stat-v">{stats.pending}</div>
              </div>
              <div className="pdX-stat">
                <div className="pdX-stat-k">HIGH SEVERITY</div>
                <div className="pdX-stat-v">{stats.high}</div>
              </div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="pdX-container">
          {/* DETAILS + MANAGEMENT */}
          <div className="pdX-card">
            <div className="pdX-card-head">
              <div>
                <h3 className="pdX-card-title">Project Details</h3>
                <p className="pdX-card-sub">
                  Edit/Delete and status settings are managed here.
                </p>
              </div>

              <div className="pdX-head-actions">
                {!editMode ? (
                  <button className="pdX-btn pdX-btn-outline" onClick={startEdit}>
                    Edit Project
                  </button>
                ) : (
                  <>
                    <button
                      className="pdX-btn pdX-btn-primary"
                      onClick={saveEdit}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      className="pdX-btn pdX-btn-muted"
                      onClick={cancelEdit}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </>
                )}

                <button
                  className="pdX-btn pdX-btn-danger"
                  onClick={() => setConfirmOpen(true)}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="pdX-details-grid">
              {/* ✅ Status display (NOT editable unless editMode) */}
              <div className="pdX-detail">
                <div className="pdX-detail-label">Project Status</div>

                {!editMode ? (
                  <div className="pdX-detail-value">{projectStatusLabel}</div>
                ) : (
                  <select className="pdX-select" value={status} disabled>
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="pdX-detail">
                <div className="pdX-detail-label">Created</div>
                <div className="pdX-detail-value">
                  {new Date(project.created_at).toLocaleString()}
                </div>
              </div>

              <div className="pdX-detail">
                <div className="pdX-detail-label">Updated</div>
                <div className="pdX-detail-value">
                  {new Date(project.updated_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* TEAM */}
          <div className="pdX-card">
            <div className="pdX-card-head">
              <div>
                <h3 className="pdX-card-title">Project Team</h3>
                <p className="pdX-card-sub">
                  Organized list of team members with roles and status.
                </p>
              </div>
            </div>
            <div className="pdX-section">
              <TeamPreviewCard projectId={id} />
            </div>
          </div>

          {/* RISKS */}
          <div className="pdX-card">
            <div className="pdX-card-head">
              <div>
                <h3 className="pdX-card-title">Project Risks</h3>
                <p className="pdX-card-sub">Risks created under this project.</p>
              </div>

              <button
                className="pdX-btn pdX-btn-primary"
                onClick={() => navigate(`/projects/${id}/risks/create`)}
              >
                + Add Risk
              </button>
            </div>

            <div className="pdX-section">
              {riskLoading ? (
                <p className="pdX-muted">Loading risks…</p>
              ) : risks.length === 0 ? (
                <p className="pdX-muted">No risks added yet.</p>
              ) : (
                <div className="pdX-table-wrap">
                  <table className="pdX-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Score</th>
                        <th>Level</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {risks.map((risk) => (
                        <tr key={risk.id}>
                          <td className="pdX-td-title">{risk.title}</td>
                          <td>{risk.risk_score}</td>
                          <td>
                            <span
                              className={`pdX-badge pdX-badge-${String(
                                risk.risk_level || ""
                              ).toLowerCase()}`}
                            >
                              {risk.risk_level}
                            </span>
                          </td>
                          <td>{risk.status}</td>
                          <td className="pdX-td-action">
                            <button
                              className="pdX-link"
                              onClick={() =>
                                navigate(`/risks/${risk.id}`, {
                                  state: { projectId: id },
                                })
                              }
                            >
                              View →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />

        {/* Modals */}
        <MessageModal
          {...msgCfg}
          open={msgOpen}
          onClose={() => setMsgOpen(false)}
        />
        <ConfirmModal
          open={confirmOpen}
          title="Confirm Delete"
          message="Are you sure you want to delete this project?"
          onConfirm={handleDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      </div>
    </>
  );
};

export default ProjectDetail;