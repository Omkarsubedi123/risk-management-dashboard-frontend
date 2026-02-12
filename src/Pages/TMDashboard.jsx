import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AppNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/TMDashboard.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const TMDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [projects, setProjects] = useState([]);
  const [risks, setRisks] = useState([]);

  const [selectedProject, setSelectedProject] = useState("all");

  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  const headers = useMemo(() => {
    const token = getToken();
    return { Authorization: `Bearer ${token}` };
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
      setErr("Could not load Team Member dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, []);

  // ---------------------------
  // Filtered Data
  // ---------------------------
  const filteredRisks = useMemo(() => {
    if (selectedProject === "all") return risks;
    return risks.filter(
      (r) => String(r.project_id || r.project) === String(selectedProject)
    );
  }, [risks, selectedProject]);

  const filteredProjectsCount = useMemo(() => {
    // For "All Projects" show total projects.
    // If a project is selected, count becomes 1 (because we are focusing that project).
    if (selectedProject === "all") return projects.length;
    return 1;
  }, [projects, selectedProject]);

  // ---------------------------
  // Cards
  // ---------------------------
  const totalRisks = filteredRisks.length;

  const pendingApproval = filteredRisks.filter((r) => {
    const st = (r.approval_status || "").toString().toLowerCase();
    return st === "pending";
  }).length;

  const highRisks = filteredRisks.filter((r) => {
    const level = (r.risk_level || "").toString().toLowerCase();
    const score = Number(r.risk_score || 0);
    return level === "high" || score >= 15;
  }).length;

  // ---------------------------
  // Pie chart (Risk level distribution)
  // ---------------------------
  const levelCounts = useMemo(() => {
    const counts = { Low: 0, Medium: 0, High: 0 };
    filteredRisks.forEach((r) => {
      const lvl = (r.risk_level || "").toString().toLowerCase();
      if (lvl === "high") counts.High += 1;
      else if (lvl === "medium") counts.Medium += 1;
      else counts.Low += 1;
    });
    return counts;
  }, [filteredRisks]);

  const doughnutData = {
    labels: ["Low", "Medium", "High"],
    datasets: [
      {
        data: [levelCounts.Low, levelCounts.Medium, levelCounts.High],
        backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"],
        borderColor: ["#16a34a", "#d97706", "#dc2626"],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 14,
          boxHeight: 14,
          usePointStyle: false,
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    cutout: "62%",
  };

  // ---------------------------
  // Trend chart (PM-like Monthly: High/Medium/Low + hover)
  // ---------------------------
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

  const buildMonthlyTrend = (list = []) => {
    const bucket = {}; // { "2026-02": { High, Medium, Low } }

    for (const r of list) {
      const mk = monthKey(r.created_at || r.updated_at);
      if (!mk) continue;

      const lvl = (r.risk_level || "").toString().toLowerCase();
      const key = lvl === "high" ? "High" : lvl === "medium" ? "Medium" : "Low";

      if (!bucket[mk]) bucket[mk] = { High: 0, Medium: 0, Low: 0 };
      bucket[mk][key] += 1;
    }

    const keys = Object.keys(bucket).sort();
    const months = [];

    if (keys.length > 0) {
      const [sy, sm] = keys[0].split("-").map(Number);
      const [ey, em] = keys[keys.length - 1].split("-").map(Number);

      let y = sy;
      let m = sm;
      while (y < ey || (y === ey && m <= em)) {
        months.push(`${y}-${String(m).padStart(2, "0")}`);
        m += 1;
        if (m === 13) {
          m = 1;
          y += 1;
        }
      }
    } else {
      // if no data -> show last 6 months zero lines (so chart looks stable)
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const key = `${y}-${m}`;
        months.push(key);
        bucket[key] = { High: 0, Medium: 0, Low: 0 };
      }
    }

    return {
      labels: months.map(monthLabel),
      high: months.map((k) => bucket[k]?.High ?? 0),
      med: months.map((k) => bucket[k]?.Medium ?? 0),
      low: months.map((k) => bucket[k]?.Low ?? 0),
    };
  };

  const trend = useMemo(() => buildMonthlyTrend(filteredRisks), [filteredRisks]);

  const trendData = {
    labels: trend.labels,
    datasets: [
      {
        label: "High",
        data: trend.high,
        borderColor: "#2563eb",
        backgroundColor: "#2563eb",
        pointBackgroundColor: "#2563eb",
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: false,
      },
      {
        label: "Low",
        data: trend.low,
        borderColor: "#ef4444",
        backgroundColor: "#ef4444",
        pointBackgroundColor: "#ef4444",
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: false,
      },
      {
        label: "Medium",
        data: trend.med,
        borderColor: "#f59e0b",
        backgroundColor: "#f59e0b",
        pointBackgroundColor: "#f59e0b",
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: false,
      },
    ],
  };

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 8,
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label} : ${ctx.parsed.y}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
        grid: { drawBorder: false },
      },
      x: {
        grid: { drawBorder: false },
      },
    },
  };

  // ---------------------------
  // UI
  // ---------------------------
  if (loading) {
    return (
      <>
        <AppNavbar />
        <div className="tmd-wrap">
          <div className="tmd-loading">
            <div className="spinner-border" role="status" />
            <div className="text-muted mt-2">Loading dashboard…</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <AppNavbar />

      {/* Header */}
      <div className="tmd-header">
        <div className="container tmd-container">
          <div className="tmd-head-row">
            <div>
              <h1 className="tmd-title">Team Member Dashboard</h1>
              <p className="tmd-subtitle">
                Overview of your projects, risks, levels, and trends
              </p>
            </div>

            <div className="tmd-filter">
              <div className="tmd-filter-label">Project</div>
              <select
                className="form-select tmd-filter-select"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <option value="all">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="tmd-wrap">
        <div className="container tmd-container">
          {err ? <div className="alert alert-warning">{err}</div> : null}

          {/* Cards (PM-style spacing & sizing) */}
          <div className="tmd-cards">
            <div className="tmd-card tmd-left-green">
              <div className="tmd-card-top">
                <div className="tmd-icon">📁</div>
                <div className="tmd-pill tmd-pill-green">Projects</div>
              </div>
              <div className="tmd-card-value">{filteredProjectsCount}</div>
              <div className="tmd-card-label">My Projects</div>
            </div>

            <div className="tmd-card tmd-left-blue">
              <div className="tmd-card-top">
                <div className="tmd-icon">🧾</div>
                <div className="tmd-pill tmd-pill-blue">Risks</div>
              </div>
              <div className="tmd-card-value">{totalRisks}</div>
              <div className="tmd-card-label">My Risks</div>
            </div>

            <div className="tmd-card tmd-left-orange">
              <div className="tmd-card-top">
                <div className="tmd-icon">⏳</div>
                <div className="tmd-pill tmd-pill-orange">Pending</div>
              </div>
              <div className="tmd-card-value">{pendingApproval}</div>
              <div className="tmd-card-label">Pending Approval</div>
            </div>

            <div className="tmd-card tmd-left-red">
              <div className="tmd-card-top">
                <div className="tmd-icon">⚠️</div>
                <div className="tmd-pill tmd-pill-red">Critical</div>
              </div>
              <div className="tmd-card-value">{highRisks}</div>
              <div className="tmd-card-label">High Risks</div>
            </div>
          </div>

          {/* Charts grid */}
          <div className="tmd-grid2">
            {/* Pie */}
            <div className="tmd-panel">
              <div className="tmd-panel-head">
                <div className="tmd-panel-title">Risks by Level</div>
                <div className="tmd-panel-tag">Distribution</div>
              </div>

              <div className="tmd-chart-wrap">
                <div className="tmd-chart doughnut">
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                </div>
              </div>
            </div>

            {/* Trend */}
            <div className="tmd-panel">
              <div className="tmd-panel-head">
                <div className="tmd-panel-title">Risk Trend Over Time</div>
                <div className="tmd-panel-tag">Monthly</div>
              </div>

              <div className="tmd-chart line">
                <Line data={trendData} options={trendOptions} />
              </div>
            </div>
          </div>

          <div style={{ height: 16 }} />
        </div>
      </div>

      <Footer />
    </>
  );
};

export default TMDashboard;
