import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import AppNavbar from "../components/Navbar";
import "./../styles/PMReports.css";

const PMReports = () => {
  const token =
    localStorage.getItem("access") || sessionStorage.getItem("access");

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const [projects, setProjects] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [mitigationOptions, setMitigationOptions] = useState([]);

  const [project, setProject] = useState("all");
  const [riskLevel, setRiskLevel] = useState("");
  const [status, setStatus] = useState("");
  const [mitigationStatus, setMitigationStatus] = useState("");

  const [loadingOptions, setLoadingOptions] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fetchOptions = async () => {
    setLoadingOptions(true);
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/reports/pm/risk-report/options/",
        { headers }
      );
      setProjects(res.data.projects || []);
      setStatusOptions(res.data.statuses || []);
      setMitigationOptions(res.data.mitigation_statuses || []);
    } catch (err) {
      console.error("Failed to load report options", err);
      setProjects([]);
      setStatusOptions([]);
      setMitigationOptions([]);
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    fetchOptions();
    // eslint-disable-next-line
  }, []);

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const params = new URLSearchParams();
      params.set("project", project);

      if (riskLevel) params.set("risk_level", riskLevel);
      if (status) params.set("status", status);
      if (mitigationStatus) params.set("mitigation_status", mitigationStatus);

      const url = `http://127.0.0.1:8000/api/reports/pm/risk-report/pdf/?${params.toString()}`;

      const res = await axios.get(url, {
        headers,
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download =
        project === "all"
          ? "risk_overview_report.pdf"
          : `risk_overview_project_${project}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Failed to download PDF", err);
      alert("Failed to download report. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const resetFilters = () => {
    setProject("all");
    setRiskLevel("");
    setStatus("");
    setMitigationStatus("");
  };

  const scopeLabel =
    project === "all"
      ? "All Projects"
      : projects.find((p) => String(p.id) === String(project))?.name || "Selected Project";

  return (
    <>
      <AppNavbar />

      <div className="pmr-header">
        <Container>
          <div className="pmr-header-content">
            <div>
              <h2 className="pmr-title">Reports</h2>
              <p className="pmr-subtitle">
                Generate a professional PDF Risk Overview Report for <b>{scopeLabel}</b>.
              </p>
            </div>

            <div className="pmr-actions">
              <button className="pmr-btn pmr-btn-ghost" onClick={resetFilters} disabled={downloading}>
                Reset Filters
              </button>
              <button className="pmr-btn pmr-btn-primary" onClick={downloadPDF} disabled={downloading}>
                {downloading ? "Generating PDF..." : "Download PDF"}
              </button>
            </div>
          </div>
        </Container>
      </div>

      <Container className="mt-4">
        <div className="pmr-card">
          <div className="pmr-card-head">
            <div>
              <h4 className="pmr-card-title">Report Filters</h4>
              <p className="pmr-card-sub">
                Use dropdowns to avoid mismatch. “Open” means everything except Closed.
              </p>
            </div>

            {(loadingOptions || downloading) && (
              <div className="pmr-inline-loading">
                <Spinner animation="border" size="sm" />
                <span>{loadingOptions ? "Loading options…" : "Preparing report…"}</span>
              </div>
            )}
          </div>

          <Row className="g-3">
            <Col md={6}>
              <div className="pmr-field">
                <label className="pmr-label">Project Scope</label>
                <select className="pmr-input" value={project} onChange={(e) => setProject(e.target.value)}>
                  <option value="all">All Projects</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <div className="pmr-help">Tip: Select a project for a project-specific PDF.</div>
              </div>
            </Col>

            <Col md={6}>
              <div className="pmr-field">
                <label className="pmr-label">Risk Severity</label>
                <select className="pmr-input" value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)}>
                  <option value="">Any</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <div className="pmr-help">Example: choose High to generate a high-risk report only.</div>
              </div>
            </Col>

            <Col md={6}>
              <div className="pmr-field">
                <label className="pmr-label">Risk Status</label>
                <select className="pmr-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">Any</option>
                  <option value="Open">Open (not Closed)</option>
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <div className="pmr-help">These values come from your database.</div>
              </div>
            </Col>

            <Col md={6}>
              <div className="pmr-field">
                <label className="pmr-label">Mitigation Status</label>
                <select className="pmr-input" value={mitigationStatus} onChange={(e) => setMitigationStatus(e.target.value)}>
                  <option value="">Any</option>
                  {mitigationOptions.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <div className="pmr-help">These values come from your database.</div>
              </div>
            </Col>
          </Row>

          <div className="pmr-footer">
            <div className="pmr-footer-note">
              The PDF includes: summary, charts (status/severity/trend), insights, and key risks.
            </div>
            <div className="pmr-footer-buttons">
              <button className="pmr-btn pmr-btn-ghost" onClick={resetFilters} disabled={downloading}>
                Reset
              </button>
              <button className="pmr-btn pmr-btn-primary" onClick={downloadPDF} disabled={downloading}>
                {downloading ? "Generating..." : "Download PDF Report"}
              </button>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
};

export default PMReports;
