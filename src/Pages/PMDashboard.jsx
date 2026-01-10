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

// We know our trend keys are risk levels (based on backend): High/Medium/Low
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

  // ✅ fetch projects for dropdown
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

  // ✅ when dropdown changes -> refetch dashboard
  useEffect(() => {
    fetchDashboardData(selectedProject);
    // eslint-disable-next-line
  }, [selectedProject]);

  return (
    <>
      <AppNavbar />

      {/* Header */}
      <div className="pm-header">
        <Container>
          <div className="pm-header-content">
            <div>
              <h2>Project Manager Dashboard</h2>
              <p className="text-muted">
                Overview of projects and risk analytics
              </p>
            </div>

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
        </Container>
      </div>

      <Container className="mt-4">
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        )}

        {!loading && summary && (
          <>
            {/* Summary Cards */}
            <Row className="mb-4">
              {[
                {
                  label: "Total Projects",
                  value: summary.total_projects,
                  color: "success",
                },
                {
                  label: "Total Risks",
                  value: summary.total_risks,
                  color: "primary",
                },
                { label: "High Risks", value: summary.high_risks, color: "danger" },
                { label: "Open Risks", value: summary.open_risks, color: "warning" },
              ].map((item, index) => (
                <Col key={index} md={3} sm={6} className="mb-3">
                  <Card className="pm-stat-card">
                    <div className="pm-stat-content">
                      <h3>{item.value}</h3>
                      <p>{item.label}</p>
                    </div>
                    <Badge bg={item.color} className="pm-stat-badge">
                      {item.label}
                    </Badge>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Charts */}
            <Row>
              <Col md={6} className="mb-4">
                <Card className="pm-chart-card">
                  <h6 className="mb-3">Risks by Level</h6>
                  {pieData.length === 0 ? (
                    <p className="text-muted">No data available</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={50}
                          outerRadius={90}
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
                  <h6 className="mb-3">Risk Trend Over Time</h6>

                  {lineData.length === 0 ? (
                    <p className="text-muted">No data available</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />

                        {/* ✅ Draw lines for risk levels your backend provides */}
                        {RISK_LEVEL_KEYS.map((k, idx) => (
                          <Line
                            key={k}
                            type="monotone"
                            dataKey={k}
                            stroke={COLORS[idx % COLORS.length]}
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
