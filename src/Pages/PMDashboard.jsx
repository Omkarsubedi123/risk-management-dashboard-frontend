import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Badge, Spinner } from "react-bootstrap";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import AppNavbar from "../components/Navbar";
import "./../styles/PMDashboard.css";
import Footer from "../components/Footer";

const COLORS = ["#4e73df", "#f6c23e", "#e74a3b", "#1cc88a"];
const RISK_LEVEL_KEYS = ["High", "Medium", "Low"];

const PMDashboard = () => {
  const token =
    localStorage.getItem("access") || sessionStorage.getItem("access");

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("all");

  const [summary, setSummary] = useState(null);
  const [pieData, setPieData] = useState([]);
  const [lineData, setLineData] = useState([]);

  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/projects/", {
        headers,
      });
      setProjects(res.data || []);
    } catch (err) {
      console.error("Failed to load projects", err);
      setProjects([]);
    }
  };

  const fetchDashboardData = async (projectIdOrAll) => {
    setLoading(true);
    try {
      const q =
        projectIdOrAll && projectIdOrAll !== "all"
          ? `?project=${projectIdOrAll}`
          : "";

      const [summaryRes, pieRes, lineRes] = await Promise.all([
        axios.get(`http://127.0.0.1:8000/api/dashboard/pm/summary/${q}`, {
          headers,
        }),
        axios.get(`http://127.0.0.1:8000/api/dashboard/pm/risk-category/${q}`, {
          headers,
        }),
        axios.get(`http://127.0.0.1:8000/api/dashboard/pm/risk-trend/${q}`, {
          headers,
        }),
      ]);

      setSummary(summaryRes.data);
      setPieData(pieRes.data || []);
      setLineData(lineRes.data || []);
    } catch (err) {
      console.error("Dashboard load failed", err);
      setSummary(null);
      setPieData([]);
      setLineData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchDashboardData("all");
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchDashboardData(selectedProject);
    // eslint-disable-next-line
  }, [selectedProject]);

  const STAT_CARDS = summary
    ? [
        {
          label: "Total Projects",
          value: summary.total_projects,
          badge: "Projects",
          theme: "success",
          accentClass: "accent-success",
          icon: "📁",
        },
        {
          label: "Total Risks",
          value: summary.total_risks,
          badge: "Risks",
          theme: "primary",
          accentClass: "accent-primary",
          icon: "🧾",
        },
        {
          label: "High Risks",
          value: summary.high_risks,
          badge: "Critical",
          theme: "danger",
          accentClass: "accent-danger",
          icon: "⚠️",
        },
        {
          label: "Open Risks",
          value: summary.open_risks,
          badge: "Open",
          theme: "warning",
          accentClass: "accent-warning",
          icon: "⏳",
        },
      ]
    : [];

  return (
    <>
      <AppNavbar />

      {/* Header */}
      <div className="pm-header">
        <Container>
          <div className="pm-header-content">
            <div className="pm-title-wrap">
              <h2 className="pm-title">Project Manager Dashboard</h2>
              <p className="pm-subtitle">
                Overview of projects, risk levels, and trends
              </p>
            </div>

            <div className="pm-select-wrap">
              <span className="pm-select-label">Project</span>
              <select
                className="form-select pm-project-select"
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
        </Container>
      </div>

      <Container className="mt-4">
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <div className="mt-2 text-muted">Loading dashboard...</div>
          </div>
        )}

        {!loading && summary && (
          <>
            {/* Summary Cards */}
            <Row className="mb-4">
              {STAT_CARDS.map((item, index) => (
                <Col key={index} md={3} sm={6} className="mb-3">
                  <Card className={`pm-stat-card ${item.accentClass}`}>
                    <div className="pm-stat-top">
                      <div className="pm-stat-icon" aria-hidden="true">
                        {item.icon}
                      </div>
                      <Badge bg={item.theme} className="pm-stat-badge">
                        {item.badge}
                      </Badge>
                    </div>

                    <div className="pm-stat-content">
                      <h3 className="pm-stat-value">{item.value}</h3>
                      <p className="pm-stat-label">{item.label}</p>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Charts */}
            <Row>
              <Col md={6} className="mb-4">
                <Card className="pm-chart-card">
                  <div className="pm-card-head">
                    <h6 className="pm-card-title">Risks by Level</h6>
                    <span className="pm-card-hint">Distribution</span>
                  </div>

                  {pieData.length === 0 ? (
                    <div className="pm-empty">No data available</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={55}
                          outerRadius={95}
                          paddingAngle={4}
                        >
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </Card>
              </Col>

              <Col md={6} className="mb-4">
                <Card className="pm-chart-card">
                  <div className="pm-card-head">
                    <h6 className="pm-card-title">Risk Trend Over Time</h6>
                    <span className="pm-card-hint">Monthly</span>
                  </div>

                  {lineData.length === 0 ? (
                    <div className="pm-empty">No data available</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        {RISK_LEVEL_KEYS.map((k, idx) => (
                          <Line
                            key={k}
                            type="monotone"
                            dataKey={k}
                            stroke={COLORS[idx % COLORS.length]}
                            strokeWidth={2}
                            dot={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </Card>
              </Col>
            </Row>
          </>
        )}

        {!loading && !summary && (
          <div className="text-center py-5 text-muted">
            Failed to load dashboard data.
          </div>
        )}
      </Container>

      <Footer />
    </>
  );
};

export default PMDashboard;
