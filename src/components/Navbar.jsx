import React, { useEffect, useState } from "react";
import { Navbar, Nav, Container, Dropdown, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./../styles/Navbar.css";
import Notifications from "./Notifications";
import axios from "axios";

const AppNavbar = () => {
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(false);

  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");
    navigate("/login");
  };

  const fetchMe = async () => {
    const token = getToken();
    if (!token) return;

    setLoadingMe(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/users/me/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMe(res.data);
    } catch (err) {
      // if token invalid -> logout
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoadingMe(false);
    }
  };

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line
  }, []);

  const displayName = me?.first_name || me?.username || me?.email || "Account";

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="py-3 shadow-sm">
      <Container fluid>
        <Navbar.Brand className="fw-bold ms-3" style={{ cursor: "pointer" }} onClick={() => navigate("/pmdashboard")}>
          Risk Management
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav" className="justify-content-between">
          <Nav className="me-auto">
            <Nav.Link onClick={() => navigate("/pmdashboard")}>Dashboard</Nav.Link>
            <Nav.Link onClick={() => navigate("/projects")}>Projects</Nav.Link>
            <Nav.Link onClick={() => navigate("/risks")}>Risks</Nav.Link>
            <Nav.Link onClick={() => navigate("/pm/heatmap")}>Heat Map</Nav.Link>
            <Nav.Link onClick={() => navigate("/pm/reports")}>Reports</Nav.Link>
          </Nav>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <Notifications />

            <Dropdown align="end" className="me-3">
              <Dropdown.Toggle variant="outline-light" id="dropdown-user">
                {loadingMe ? (
                  <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                    <Spinner animation="border" size="sm" />
                    Loading
                  </span>
                ) : (
                  displayName
                )}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={() => navigate("/profile")}>
                  My Profile
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
