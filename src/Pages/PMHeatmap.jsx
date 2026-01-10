import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Container, Card, Row, Col, Spinner, Badge } from "react-bootstrap";
import AppNavbar from "../components/Navbar";
import "./../styles/PMHeatmap.css";

const PMHeatmap = () => {
  const token =
    localStorage.getItem("access") || sessionStorage.getItem("access");

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("all");

  const [heatmap, setHeatmap] = useState(null);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/projects/", {
        headers,
      });
      setProjects(res.data || []);
    } catch {
      setProjects([]);
    }
  };

  const fetchData = async (projectIdOrAll) => {
    setLoading(true);

    const q =
      projectIdOrAll && projectIdOrAll !== "all"
        ? `?project=${projectIdOrAll}`
        : "";

    try {
      const [heatRes, sumRes] = await Promise.all([
        axios.get(`http://127.0.0.1:8000/api/dashboard/pm/heatmap/${q}`, {
          headers,
        }),
        axios.get(`http://127.0.0.1:8000/api/dashboard/pm/summary/${q}`, {
          headers,
        }),
      ]);

      setHeatmap(heatRes.data);
      setSummary(sumRes.data);
    } catch (err) {
      console.error(err);
      setHeatmap(null);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchData("all");
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchData(selectedProject);
    // eslint-disable-next-line
  }, [selectedProject]);

  // ---- Risk Matrix logic ----
  // Score = Impact * Probability
  // 1–6 Low (Green), 7–14 Medium (Yellow), 15–25 High (Red)
  const getZone = (score) => {
    if (score >= 15) return "high";
    if (score >= 7) return "medium";
    return "low";
  };

  const maxCount = useMemo(() => {
    if (!heatmap?.matrix) return 0;
    return Math.max(...heatmap.matrix.flat());
  }, [heatmap]);

  const getCellStyle = (impact, probability, count) => {
    // neutral style when no risks exist in the cell
    if (!count) {
      return {
        background: "#f3f6ff",
        color: "#94a3b8",
        border: "1px solid #e7eefc",
      };
    }

    const score = impact * probability;
    const zone = getZone(score);

    // intensity based on count
    const ratio = maxCount ? count / maxCount : 1; // 0..1
    const intensity = Math.max(0.45, ratio); // keep visible

    // RAG colors
    const base = {
      low: { r: 34, g: 197, b: 94 },      // green
      medium: { r: 245, g: 158, b: 11 },  // amber/yellow
      high: { r: 239, g: 68, b: 68 },     // red
    }[zone];

    const bg = `rgba(${base.r}, ${base.g}, ${base.b}, ${intensity})`;
    const text = intensity > 0.6 ? "#ffffff" : "#0f172a";

    return {
      background: bg,
      color: text,
      border: "1px solid rgba(0,0,0,0.06)",
    };
  };

  const selectedProjectName = useMemo(() => {
    if (selectedProject === "all") return "All Projects";
    const p = projects.find((x) => String(x.id) === String(selectedProject));
    return p?.name || "Selected Project";
  }, [selectedProject, projects]);

  return (
    <>
      <AppNavbar />

      <Container className="mt-4">
        <Card className="pm-heat-card p-4">
          <Row className="align-items-center mb-3">
            <Col>
              <h3 className="mb-1">Risk Heatmap</h3>
              <p className="text-muted mb-0">
                Impact × Probability matrix for <b>{selectedProjectName}</b>.
              </p>
            </Col>

            <Col md="4">
              <select
                className="form-select pm-heat-select"
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
            </Col>
          </Row>

          {/* Quick Stats */}
          {!loading && summary && (
            <Row className="g-3 mb-4">
              <Col md={3} sm={6}>
                <div className="pm-mini-stat">
                  <div className="pm-mini-stat-value">{summary.total_risks}</div>
                  <div className="pm-mini-stat-label">Total Risks</div>
                </div>
              </Col>
              <Col md={3} sm={6}>
                <div className="pm-mini-stat">
                  <div className="pm-mini-stat-value">{summary.high_risks}</div>
                  <div className="pm-mini-stat-label">High Risks</div>
                </div>
              </Col>
              <Col md={3} sm={6}>
                <div className="pm-mini-stat">
                  <div className="pm-mini-stat-value">{summary.open_risks}</div>
                  <div className="pm-mini-stat-label">Open Risks</div>
                </div>
              </Col>
              <Col md={3} sm={6}>
                <div className="pm-mini-stat">
                  <div className="pm-mini-stat-value">{summary.total_projects}</div>
                  <div className="pm-mini-stat-label">Projects</div>
                </div>
              </Col>
            </Row>
          )}

          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          )}

          {!loading && !heatmap && (
            <div className="text-center text-muted py-5">
              Failed to load heatmap data.
            </div>
          )}

          {!loading && heatmap && (
            <>
              {/* Legend */}
              <div className="pm-heat-legend">
                <Badge bg="success" className="pm-legend-pill">
                  Low (1–6)
                </Badge>
                <Badge bg="warning" text="dark" className="pm-legend-pill">
                  Medium (7–14)
                </Badge>
                <Badge bg="danger" className="pm-legend-pill">
                  High (15–25)
                </Badge>
                <span className="pm-legend-note text-muted">
                  Cell number = how many risks exist in that Impact–Probability cell.
                </span>
              </div>

              {/* Matrix */}
              <div className="pm-matrix-wrap">
                <div className="pm-axis-label pm-axis-impact">Impact</div>

                <div className="pm-matrix">
                  {/* top axis (Probability) */}
                  <div className="pm-matrix-top">
                    <div className="pm-corner" />
                    {heatmap.x_labels.map((x) => (
                      <div key={x} className="pm-axis-cell">
                        {x}
                      </div>
                    ))}
                  </div>

                  {/* rows */}
                  {heatmap.y_labels.map((impactVal, rIndex) => (
                    <div key={impactVal} className="pm-matrix-row">
                      <div className="pm-axis-cell">{impactVal}</div>

                      {heatmap.matrix[rIndex].map((count, cIndex) => {
                        const probVal = heatmap.x_labels[cIndex];
                        const score = impactVal * probVal;
                        const zone = getZone(score);

                        return (
                          <div
                            key={`${rIndex}-${cIndex}`}
                            className={`pm-cell pm-cell-${zone}`}
                            style={getCellStyle(impactVal, probVal, count)}
                            title={`Impact ${impactVal}, Probability ${probVal} → Score ${score} (${zone.toUpperCase()}), Risks: ${count}`}
                          >
                            <div className="pm-cell-count">{count}</div>

                            {/* Only show score when there is at least 1 risk */}
                            {count > 0 && (
                              <div className="pm-cell-score">S:{score}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  <div className="pm-axis-label pm-axis-likelihood">
                    Probability
                  </div>
                </div>
              </div>
            </>
          )}
        </Card>
      </Container>
    </>
  );
};

export default PMHeatmap;
