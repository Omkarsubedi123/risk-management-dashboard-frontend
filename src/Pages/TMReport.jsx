import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import AppNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/TMReport.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

function safeJwtPayload(token) {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const TMReport = () => {
  const pdfRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [projects, setProjects] = useState([]);
  const [risks, setRisks] = useState([]);

  // Minimal filters (screen)
  const [projectFilter, setProjectFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  const headers = useMemo(() => {
    const token = getToken();
    return { Authorization: `Bearer ${token}` };
  }, []);

  // Created-by info (from JWT if available)
  const createdBy = useMemo(() => {
    const token = getToken();
    const payload = safeJwtPayload(token);
    const name =
      payload?.full_name ||
      payload?.name ||
      payload?.username ||
      payload?.email ||
      "Team Member";
    return { name, role: "Team Member" };
    // eslint-disable-next-line
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setErr("");
    try {
      const [projRes, riskRes] = await Promise.all([
        axios.get(`${backendUrl}/api/projects/`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${backendUrl}/api/risks/`, { headers }).catch(() => ({ data: [] })),
      ]);

      setProjects(Array.isArray(projRes.data) ? projRes.data : []);
      setRisks(Array.isArray(riskRes.data) ? riskRes.data : []);
    } catch (e) {
      console.error(e);
      setErr("Could not load report data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, []);

  // ---------- Helpers ----------
  const projectNameById = useMemo(() => {
    const map = {};
    projects.forEach((p) => (map[String(p.id)] = p.name));
    return map;
  }, [projects]);

  const safeProjectName = (r) => {
    const pid = String(r.project_id || r.project || "");
    return r.project_name || projectNameById[pid] || r.project?.name || "—";
  };

  const lvlKey = (r) => (r.risk_level || r.level || "").toString().toLowerCase();
  const stKey = (r) => (r.approval_status || r.status || "").toString().toLowerCase();

  const levelText = (r) => {
    const lvl = lvlKey(r);
    if (lvl === "high") return "High";
    if (lvl === "medium") return "Medium";
    return "Low";
  };

  const statusText = (r) => {
    const st = stKey(r);
    if (st === "approved") return "Approved";
    if (st === "rejected") return "Rejected";
    if (st === "pending") return "Pending";
    return "—";
  };

  const isoDate = (r) => r.created_at || r.updated_at || "";
  const shortDate = (iso) => {
    const d = new Date(iso);
    if (!iso || Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString();
  };

  const inDateRange = (iso) => {
    if (!iso) return false;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return false;

    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      if (d < from) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      if (d > to) return false;
    }
    return true;
  };

  const normalize15 = (val) => {
    if (val === null || val === undefined || val === "") return null;
    const n = Number(val);
    if (!Number.isNaN(n) && n >= 1 && n <= 5) return n;
    const s = String(val).toLowerCase();
    const map = {
      "very low": 1,
      low: 2,
      medium: 3,
      high: 4,
      "very high": 5,
      critical: 5,
    };
    return map[s] ?? null;
  };

  const getCreatedByName = (r) =>
    r.created_by_name ||
    r.created_by?.full_name ||
    r.created_by?.username ||
    r.created_by?.email ||
    r.created_by ||
    "—";

  // ---------- Filtered + Sorted ----------
  const filteredRisks = useMemo(() => {
    const s = search.trim().toLowerCase();

    return risks.filter((r) => {
      if (projectFilter !== "all") {
        const pid = String(r.project_id || r.project || "");
        if (pid !== String(projectFilter)) return false;
      }
      if (levelFilter !== "all") {
        if (lvlKey(r) !== levelFilter) return false;
      }
      if (statusFilter !== "all") {
        if (stKey(r) !== statusFilter) return false;
      }
      if (dateFrom || dateTo) {
        const iso = isoDate(r);
        if (!inDateRange(iso)) return false;
      }
      if (s) {
        const title = (r.title || "").toString().toLowerCase();
        const desc = (r.description || "").toString().toLowerCase();
        const proj = safeProjectName(r).toLowerCase();
        if (!title.includes(s) && !desc.includes(s) && !proj.includes(s)) return false;
      }
      return true;
    });
    // eslint-disable-next-line
  }, [risks, projectFilter, levelFilter, statusFilter, search, dateFrom, dateTo, projectNameById]);

  const sortedRisks = useMemo(() => {
    return [...filteredRisks].sort((a, b) => {
      const da = new Date(a.created_at || a.updated_at || 0).getTime();
      const db = new Date(b.created_at || b.updated_at || 0).getTime();
      return db - da;
    });
  }, [filteredRisks]);

  // ---------- Meta ----------
  const reportMeta = useMemo(() => {
    const scope =
      projectFilter === "all"
        ? "All Projects"
        : (projects.find((p) => String(p.id) === String(projectFilter))?.name ||
            "Selected Project");

    const dateRange =
      dateFrom || dateTo ? `${dateFrom || "…"} → ${dateTo || "…"}`
      : "All time";

    return {
      scope,
      dateRange,
      generatedOn: new Date().toLocaleString(),
    };
  }, [projectFilter, projects, dateFrom, dateTo]);

  // ---------- KPI / counts ----------
  const counts = useMemo(() => {
    const c = {
      total: filteredRisks.length,
      Low: 0, Medium: 0, High: 0,
      Pending: 0, Approved: 0, Rejected: 0,
      scoreAvg: "0.0",
    };

    let sum = 0;
    for (const r of filteredRisks) {
      c[levelText(r)] += 1;
      const st = statusText(r);
      if (c[st] !== undefined) c[st] += 1;
      sum += Number(r.risk_score || 0);
    }
    c.scoreAvg = c.total ? (sum / c.total).toFixed(1) : "0.0";
    return c;
  }, [filteredRisks]);

  const attentionCount = useMemo(() => {
    return filteredRisks.filter(
      (r) => levelText(r) === "High" || statusText(r) === "Pending"
    ).length;
  }, [filteredRisks]);

  // ---------- Executive summary (readable text) ----------
  const executiveSummary = useMemo(() => {
    const total = counts.total || 0;
    const highPct = total ? Math.round((counts.High / total) * 100) : 0;
    const pendingPct = total ? Math.round((counts.Pending / total) * 100) : 0;

    // top project by count
    const map = new Map();
    for (const r of filteredRisks) {
      const p = safeProjectName(r);
      map.set(p, (map.get(p) || 0) + 1);
    }
    const topProject = [...map.entries()].sort((a, b) => b[1] - a[1])[0];

    return [
      `This report summarizes risks for "${reportMeta.scope}" within "${reportMeta.dateRange}".`,
      `Total risks: ${total}. High risks: ${counts.High} (${highPct}%). Pending approvals: ${counts.Pending} (${pendingPct}%).`,
      topProject ? `Most risks belong to: ${topProject[0]} (${topProject[1]} risks).` : `No project concentration found.`,
      `Recommended focus: finalize approvals, assign owners for high risks, and document mitigation/contingency plans.`,
    ];
  }, [counts, filteredRisks, reportMeta.scope, reportMeta.dateRange]);

  // ---------- Top risks (more informative, readable) ----------
  const topRisks = useMemo(() => {
    return [...sortedRisks]
      .sort((a, b) => Number(b.risk_score || 0) - Number(a.risk_score || 0))
      .slice(0, 6)
      .map((r) => {
        const score = Number(r.risk_score || 0);
        const lvl = levelText(r);
        const st = statusText(r);
        const owner = r.owner_name || r.assigned_to_name || r.assignee_name || "—";
        const mitigation = r.mitigation_strategy || r.mitigation || "—";

        let action = "Monitor & review regularly";
        if (st === "Pending") action = "Get PM approval to proceed";
        if (lvl === "High") action = "Assign owner + implement mitigation immediately";
        if (mitigation !== "—") action = "Follow mitigation plan (document progress)";

        return {
          id: r.id,
          title: r.title || "Untitled Risk",
          project: safeProjectName(r),
          lvl,
          st,
          score,
          owner,
          action,
        };
      });
  }, [sortedRisks]);

  // ---------- Project summary (for PDF) ----------
  const projectSummary = useMemo(() => {
    const map = new Map();
    for (const r of sortedRisks) {
      const p = safeProjectName(r);
      if (!map.has(p)) map.set(p, []);
      map.get(p).push(r);
    }

    return [...map.entries()]
      .map(([project, list]) => {
        const total = list.length;
        const high = list.filter((x) => levelText(x) === "High").length;
        const pending = list.filter((x) => statusText(x) === "Pending").length;
        const avg = total
          ? (list.reduce((s, x) => s + Number(x.risk_score || 0), 0) / total).toFixed(1)
          : "0.0";
        return { project, total, high, pending, avg };
      })
      .sort((a, b) => b.total - a.total);
  }, [sortedRisks]);

  // ---------- Risk matrix table (easy to understand) ----------
  const riskMatrix = useMemo(() => {
    // 5x5 counts impact(y) x likelihood(x)
    const grid = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => 0));
    let used = 0;

    for (const r of filteredRisks) {
      const L = normalize15(r.likelihood ?? r.probability);
      const I = normalize15(r.impact);
      if (!L || !I) continue;
      used += 1;
      grid[I - 1][L - 1] += 1;
    }
    return { grid, used };
  }, [filteredRisks]);

  // ---------- PDF charts (READABLE in PDF) ----------
  const barOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
      x: { ticks: { font: { size: 10 } } },
    },
  }), []);

  const levelBarData = useMemo(() => ({
    labels: ["Low", "Medium", "High"],
    datasets: [
      {
        label: "Count",
        data: [counts.Low, counts.Medium, counts.High],
        backgroundColor: ["rgba(34,197,94,0.65)", "rgba(245,158,11,0.65)", "rgba(239,68,68,0.65)"],
      },
    ],
  }), [counts]);

  const statusBarData = useMemo(() => ({
    labels: ["Pending", "Approved", "Rejected"],
    datasets: [
      {
        label: "Count",
        data: [counts.Pending, counts.Approved, counts.Rejected],
        backgroundColor: ["rgba(245,158,11,0.65)", "rgba(34,197,94,0.65)", "rgba(239,68,68,0.65)"],
      },
    ],
  }), [counts]);

  const monthKey = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  };

  const monthLabel = (ym) => {
    const [y, m] = ym.split("-").map((x) => Number(x));
    const d = new Date(y, (m || 1) - 1, 1);
    return d.toLocaleString("en-US", { month: "short" });
  };

  const trend = useMemo(() => {
    const bucket = {};
    for (const r of filteredRisks) {
      const mk = monthKey(r.created_at || r.updated_at);
      if (!mk) continue;
      if (!bucket[mk]) bucket[mk] = { High: 0, Medium: 0, Low: 0 };
      bucket[mk][levelText(r)] += 1;
    }

    let keys = Object.keys(bucket).sort();
    if (!keys.length) {
      // show last 4 months for readability (PDF)
      const now = new Date();
      keys = [];
      for (let i = 3; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        keys.push(k);
        bucket[k] = { High: 0, Medium: 0, Low: 0 };
      }
    }

    return {
      labels: keys.map(monthLabel),
      high: keys.map((k) => bucket[k]?.High ?? 0),
      med: keys.map((k) => bucket[k]?.Medium ?? 0),
      low: keys.map((k) => bucket[k]?.Low ?? 0),
    };
  }, [filteredRisks]);

  const trendLineData = useMemo(() => ({
    labels: trend.labels,
    datasets: [
      { label: "High", data: trend.high, borderColor: "rgba(37,99,235,0.95)", backgroundColor: "rgba(37,99,235,0.95)", tension: 0.25, pointRadius: 3, fill: false },
      { label: "Medium", data: trend.med, borderColor: "rgba(245,158,11,0.95)", backgroundColor: "rgba(245,158,11,0.95)", tension: 0.25, pointRadius: 3, fill: false },
      { label: "Low", data: trend.low, borderColor: "rgba(239,68,68,0.95)", backgroundColor: "rgba(239,68,68,0.95)", tension: 0.25, pointRadius: 3, fill: false },
    ],
  }), [trend]);

  const trendOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8 } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  }), []);

  // condensed register rows to keep PDF 1–2 pages
  const registerRows = useMemo(() => sortedRisks.slice(0, 10), [sortedRisks]);

  // ---------- PDF download ----------
  const downloadPDF = async () => {
    const element = pdfRef.current;
    if (!element) return;

    const safeScope = reportMeta.scope.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
    const filename = `TM_Risk_Report_${safeScope || "All"}_${new Date().toISOString().slice(0, 10)}.pdf`;

    const opt = {
      margin: [10, 10, 10, 10],
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] },
    };

    await html2pdf().set(opt).from(element).save();
  };

  // ---------- Screen preview ----------
  const preview = useMemo(() => sortedRisks.slice(0, 10), [sortedRisks]);

  if (loading) {
    return (
      <>
        <AppNavbar />
        <div className="rpt-wrap">
          <div className="rpt-loading">
            <div className="spinner-border" role="status" />
            <div className="text-muted mt-2">Loading report…</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <AppNavbar />

      {/* Screen header (minimal) */}
      <div className="rpt-hero">
        <div className="container rpt-container rpt-hero-row">
          <div className="rpt-hero-left">
            <div className="rpt-chip">TM • Report</div>
            <h1 className="rpt-title">Risk Report</h1>
            <div className="rpt-sub">Minimal on screen • Readable professional PDF</div>
            <div className="rpt-meta">
              <span><b>Scope:</b> {reportMeta.scope}</span>
              <span><b>Range:</b> {reportMeta.dateRange}</span>
            </div>
          </div>

          <div className="rpt-hero-actions">
            <button className="btn btn-outline-light rpt-btn" onClick={fetchAll}>Refresh</button>
            <button className="btn btn-light rpt-btn rpt-btn-primary" onClick={downloadPDF}>Download PDF</button>
          </div>
        </div>
      </div>

      <div className="rpt-wrap">
        <div className="container rpt-container">
          {err ? <div className="alert alert-warning">{err}</div> : null}

          {/* Minimal filters */}
          <div className="rpt-card rpt-filters">
            <div className="f">
              <label>Project</label>
              <select className="form-select" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
                <option value="all">All Projects</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="f">
              <label>Level</label>
              <select className="form-select" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="f">
              <label>Status</label>
              <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="f">
              <label>From</label>
              <input className="form-control" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>

            <div className="f">
              <label>To</label>
              <input className="form-control" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>

            <div className="f wide">
              <label>Search</label>
              <input className="form-control" placeholder="Search title / description / project…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          {/* Minimal KPIs */}
          <div className="rpt-kpis">
            <div className="k k1"><div className="t">Total Risks</div><div className="v">{counts.total}</div><div className="s">In scope</div></div>
            <div className="k k2"><div className="t">Attention Needed</div><div className="v">{attentionCount}</div><div className="s">High or Pending</div></div>
            <div className="k k3"><div className="t">High Risks</div><div className="v">{counts.High}</div><div className="s">Critical</div></div>
            <div className="k k4"><div className="t">Avg Score</div><div className="v">{counts.scoreAvg}</div><div className="s">Exposure</div></div>
          </div>

          {/* Preview table */}
          <div className="rpt-card">
            <div className="rpt-cardhead">
              <div>
                <div className="h">Top Risks Preview</div>
                <div className="sub">PDF includes created-by, executive summary, readable charts, and formatted tables.</div>
              </div>
              <div className="stamp">Generated: {reportMeta.generatedOn}</div>
            </div>

            <div className="rpt-tablewrap">
              <table className="rpt-table">
                <thead>
                  <tr>
                    <th>Risk</th><th>Project</th><th>Level</th><th>Status</th><th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.length === 0 ? (
                    <tr><td colSpan="5" className="empty">No risks found.</td></tr>
                  ) : preview.map((r) => {
                    const lvl = levelText(r);
                    const st = statusText(r);
                    const score = Number(r.risk_score || 0);
                    return (
                      <tr key={r.id}>
                        <td className="riskcell">
                          <div className="rt">{r.title || "Untitled Risk"}</div>
                          {r.description ? <div className="rd">{r.description}</div> : null}
                        </td>
                        <td>{safeProjectName(r)}</td>
                        <td><span className={`pill lvl ${lvl.toLowerCase()}`}>{lvl}</span></td>
                        <td><span className={`pill st ${st.toLowerCase()}`}>{st}</span></td>
                        <td><span className="score">{score}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ====================== PDF (Readable + Proper formatting) ====================== */}
          <div className="pdf-host">
            <div ref={pdfRef} className="pdf">
              {/* PAGE 1 */}
              <div className="pdf-page">
                <div className="pdf-head">
                  <div>
                    <div className="pdf-brand">Risk Management Dashboard</div>
                    <div className="pdf-title">Team Member Risk Report</div>
                    <div className="pdf-meta">
                      <div><b>Scope:</b> {reportMeta.scope}</div>
                      <div><b>Date range:</b> {reportMeta.dateRange}</div>
                      <div><b>Generated on:</b> {reportMeta.generatedOn}</div>
                      <div><b>Created by:</b> {createdBy.name} ({createdBy.role})</div>
                    </div>
                  </div>
                  <div className="pdf-badges">
                    <span className="pdf-badge">TM</span>
                    <span className="pdf-badge outline">PDF</span>
                  </div>
                </div>

                <div className="pdf-kpis">
                  <div className="pdf-kpi"><div className="k">Total</div><div className="v">{counts.total}</div></div>
                  <div className="pdf-kpi"><div className="k">Attention</div><div className="v">{attentionCount}</div></div>
                  <div className="pdf-kpi"><div className="k">High</div><div className="v">{counts.High}</div></div>
                  <div className="pdf-kpi"><div className="k">Avg Score</div><div className="v">{counts.scoreAvg}</div></div>
                </div>

                <div className="pdf-grid">
                  <div className="pdf-card">
                    <div className="pdf-card-title">Executive Summary</div>
                    <ul className="pdf-bullets">
                      {executiveSummary.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>

                    <div className="pdf-card-title mt10">Top Risks (by score)</div>
                    <table className="pdf-table-mini">
                      <thead>
                        <tr>
                          <th style={{ width: "36%" }}>Risk</th>
                          <th style={{ width: "18%" }}>Project</th>
                          <th style={{ width: "10%" }}>Score</th>
                          <th style={{ width: "16%" }}>Owner</th>
                          <th style={{ width: "20%" }}>Recommended Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topRisks.length === 0 ? (
                          <tr><td colSpan="5" className="pdf-empty">No risks in scope.</td></tr>
                        ) : topRisks.map((r) => (
                          <tr key={r.id} className="row-avoid">
                            <td>
                              <b>{r.title}</b>
                              <div className="mini-sub">{r.lvl} • {r.st}</div>
                            </td>
                            <td>{r.project}</td>
                            <td><b>{r.score}</b></td>
                            <td>{r.owner}</td>
                            <td>{r.action}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pdf-card">
                    <div className="pdf-card-title">Charts (Readable)</div>

                    <div className="pdf-charts">
                      <div className="pdf-chartbox">
                        <div className="pdf-chart-title">Risk Levels</div>
                        <div className="pdf-chart">
                          <Bar data={levelBarData} options={barOptions} />
                        </div>
                      </div>

                      <div className="pdf-chartbox">
                        <div className="pdf-chart-title">Approval Status</div>
                        <div className="pdf-chart">
                          <Bar data={statusBarData} options={barOptions} />
                        </div>
                      </div>

                      <div className="pdf-chartbox wide">
                        <div className="pdf-chart-title">Risk Trend (Monthly)</div>
                        <div className="pdf-chart trend">
                          <Line data={trendLineData} options={trendOptions} />
                        </div>
                      </div>
                    </div>

                    <div className="pdf-card-title mt10">Risk Matrix (Likelihood × Impact)</div>
                    <div className="pdf-matrix-note">
                      Shows counts in each cell. Data used: {riskMatrix.used} risks (only where likelihood & impact are filled).
                    </div>
                    <div className="pdf-matrix">
                      <table>
                        <thead>
                          <tr>
                            <th>Impact \ Likelihood</th>
                            <th>1</th><th>2</th><th>3</th><th>4</th><th>5</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[5,4,3,2,1].map((impact) => (
                            <tr key={impact}>
                              <th>{impact}</th>
                              {[1,2,3,4,5].map((lik) => {
                                const val = riskMatrix.grid[impact-1][lik-1];
                                // simple severity shading by position (readable)
                                const sev = impact * lik;
                                const cls = sev >= 16 ? "sev3" : sev >= 9 ? "sev2" : "sev1";
                                return (
                                  <td key={lik} className={cls}>{val || ""}</td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* PAGE 2 */}
              <div className="pagebreak" />

              <div className="pdf-page">
                <div className="pdf-section-title">Project Summary</div>
                <div className="pdf-section-sub">
                  Distribution per project (top projects shown for readability).
                </div>

                <table className="pdf-table-mini">
                  <thead>
                    <tr>
                      <th style={{ width: "46%" }}>Project</th>
                      <th style={{ width: "12%" }}>Total</th>
                      <th style={{ width: "12%" }}>High</th>
                      <th style={{ width: "14%" }}>Pending</th>
                      <th style={{ width: "16%" }}>Avg Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectSummary.length === 0 ? (
                      <tr><td colSpan="5" className="pdf-empty">No projects found.</td></tr>
                    ) : projectSummary.slice(0, 10).map((p) => (
                      <tr key={p.project} className="row-avoid">
                        <td><b>{p.project}</b></td>
                        <td>{p.total}</td>
                        <td>{p.high}</td>
                        <td>{p.pending}</td>
                        <td>{p.avg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="pdf-section-title mt12">Risk Register (Readable condensed)</div>
                <div className="pdf-section-sub">
                  Showing 10 rows to keep the report within 1–2 pages. (Full list remains in the system.)
                </div>

                <table className="pdf-register">
                  <thead>
                    <tr>
                      <th style={{ width: "22%" }}>Risk</th>
                      <th style={{ width: "12%" }}>Project</th>
                      <th style={{ width: "8%" }}>Level</th>
                      <th style={{ width: "10%" }}>Status</th>
                      <th style={{ width: "8%" }}>Score</th>
                      <th style={{ width: "12%" }}>Created By</th>
                      <th style={{ width: "14%" }}>Dates</th>
                      <th style={{ width: "14%" }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registerRows.length === 0 ? (
                      <tr><td colSpan="8" className="pdf-empty">No risks found.</td></tr>
                    ) : registerRows.map((r) => {
                      const lvl = levelText(r);
                      const st = statusText(r);
                      const score = Number(r.risk_score || 0);
                      const createdByName = getCreatedByName(r);
                      const mitigation = r.mitigation_strategy || r.mitigation || "";
                      const owner = r.owner_name || r.assigned_to_name || r.assignee_name || "";

                      return (
                        <tr key={r.id} className="row-avoid">
                          <td>
                            <div className="rg-title">{r.title || "Untitled Risk"}</div>
                            {r.description ? <div className="rg-desc">{String(r.description)}</div> : null}
                          </td>
                          <td>{safeProjectName(r)}</td>
                          <td><span className={`pill lvl ${lvl.toLowerCase()}`}>{lvl}</span></td>
                          <td><span className={`pill st ${st.toLowerCase()}`}>{st}</span></td>
                          <td><b>{score}</b></td>
                          <td>{createdByName}</td>
                          <td className="rg-dates">
                            <div><b>C:</b> {shortDate(r.created_at)}</div>
                            <div><b>U:</b> {shortDate(r.updated_at)}</div>
                          </td>
                          <td className="rg-notes">
                            {owner ? <div><b>Owner:</b> {owner}</div> : null}
                            {mitigation ? <div><b>Mitigation:</b> {String(mitigation)}</div> : <div className="muted">—</div>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="pdf-footer">
                  <div>Generated from Risk Management Dashboard</div>
                  <div className="muted">Readable professional report for evaluation & tracking.</div>
                </div>
              </div>
            </div>
          </div>
          {/* ====================== /PDF ====================== */}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default TMReport;
