import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import {PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from "recharts";
import "./../styles/PMDashboard.css";
import AppNavbar from "../components/Navbar";
const pieData = [
    { name: "Technical", value: 35 },
    { name: "Financial", value: 25 },
    { name: "Schedule", value: 20 },
    { name: "Other", value: 20 },
];

const COLORS = ["#1f77b4", "#ff7f0e", "#d62728", "#2ca02c"];

const lineData = [
  { month: "Jun", Technical: 25, Financial: 15, Schedule: 10 },
  { month: "Jul", Technical: 30, Financial: 20, Schedule: 15 },
  { month: "Aug", Technical: 35, Financial: 22, Schedule: 18 },
  { month: "Sep", Technical: 32, Financial: 25, Schedule: 16 },
  { month: "Oct", Technical: 40, Financial: 28, Schedule: 20 },
];

const PMDashboard = () => {
  return (
    <>
      <AppNavbar />
      <div className="dashboard-header text-white p-4">
        <h3>Project Manager Dashboard</h3>
        <select className="project-select mt-2">
          <option>CRM System Overhaul</option>
          <option>Inventory Revamp</option>
          <option>Website Migration</option>
        </select>
      </div>

      <Container className="mt-4">
        {/* Summary Cards */}
        <Row className="mb-4">
          {[
            { label: "Total Risks", value: 112 },
            { label: "High Risks", value: 30 },
            { label: "Medium Risks", value: 58 },
            { label: "Total Projects", value: 24 },
          ].map((item, index) => (
            <Col key={index} md={3}>
              <Card className="summary-card text-center p-3">
                <h4>{item.value}</h4>
                <p>{item.label}</p>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Charts */}
        <Row className="mb-4">
          <Col md={6}>
            <Card className="p-3">
              <h6>Risks by Category</h6>
              <PieChart width={300} height={250}>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="p-3">
              <h6>Risk Trend</h6>
              <LineChart width={400} height={250} data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Technical" stroke="#1f77b4" />
                <Line type="monotone" dataKey="Financial" stroke="#ff7f0e" />
                <Line type="monotone" dataKey="Schedule" stroke="#2ca02c" />
              </LineChart>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default PMDashboard;