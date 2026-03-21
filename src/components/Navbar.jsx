import React, { useEffect, useMemo, useState } from "react";
import { Navbar, Nav, Container, Dropdown, Spinner } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import "./../styles/Navbar.css";
import Notifications from "./Notifications";
import axios from "axios";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const AppNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(false);

  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("user_id");
    localStorage.removeItem("email");
    localStorage.removeItem("me_cache");

    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("user_id");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("me_cache");

    navigate("/login");
  };

  const role = useMemo(() => {
    const r =
      me?.role ||
      me?.user_role ||
      me?.user_type ||
      me?.account_type ||
      me?.type ||
      localStorage.getItem("role") ||
      sessionStorage.getItem("role") ||
      "";
    return String(r).toLowerCase();
  }, [me]);

  const isPM = role === "pm" || role === "project_manager";
  const isTM = role === "tm" || role === "team_member";
  const isAD = role === "ad" || role === "admin";

  const displayName =
    me?.first_name ||
    me?.username ||
    localStorage.getItem("username") ||
    sessionStorage.getItem("username") ||
    me?.email ||
    "Account";

  const homeRoute = isAD
    ? "/admin/dashboard"
    : isTM
    ? "/tm/dashboard"
    : "/pmdashboard";

  const fetchMe = async () => {
    const token = getToken();
    if (!token) return;

    const cached =
      localStorage.getItem("me_cache") || sessionStorage.getItem("me_cache");

    if (cached) {
      try {
        setMe(JSON.parse(cached));
      } catch {
        // ignore bad cache
      }
    }

    setLoadingMe(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/users/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMe(res.data);

      if (localStorage.getItem("access")) {
        localStorage.setItem("me_cache", JSON.stringify(res.data));
      } else {
        sessionStorage.setItem("me_cache", JSON.stringify(res.data));
      }
    } catch (err) {
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

  const pmLinks = [
    { label: "Dashboard", to: "/pmdashboard" },
    { label: "Projects", to: "/projects" },
    { label: "Risks", to: "/risks" },
    { label: "Heat Map", to: "/pm/heatmap" },
    { label: "Reports", to: "/pm/reports" },
  ];

  const tmLinks = [
    { label: "Dashboard", to: "/tm/dashboard" },
    { label: "My Projects", to: "/tm/projects" },
    { label: "My Risks", to: "/tm/risks" },
    { label: "Add Risk", to: "/tm/risks/create" },
    { label: "Reports", to: "/tm/report" },
  ];

  const adminLinks = [
    { label: "Dashboard", to: "/admin/dashboard" },
    { label: "Users", to: "/admin/users" },
    { label: "Transfer Ownership", to: "/admin/transfer" },
  ];

  const activeLinks = isAD ? adminLinks : isTM ? tmLinks : pmLinks;

  const isActive = (to) => {
    return location.pathname === to || location.pathname.startsWith(to + "/");
  };

  const roleLabel = isAD
    ? "Admin"
    : isTM
    ? "Team Member"
    : isPM
    ? "Project Manager"
    : "User";

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="py-3 shadow-sm">
      <Container fluid>
        <Navbar.Brand
          className="fw-bold ms-3"
          style={{ cursor: "pointer" }}
          onClick={() => navigate(homeRoute)}
        >
          Risk Management
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav" className="justify-content-between">
          <Nav className="me-auto">
            {activeLinks.map((item) => (
              <Nav.Link
                key={item.to}
                onClick={() => navigate(item.to)}
                className={isActive(item.to) ? "nav-active" : ""}
              >
                {item.label}
              </Nav.Link>
            ))}
          </Nav>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {!isAD && <Notifications />}

            <Dropdown align="end" className="me-3">
              <Dropdown.Toggle variant="outline-light" id="dropdown-user">
                {loadingMe ? (
                  <span
                    style={{
                      display: "inline-flex",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
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

                <Dropdown.Item disabled style={{ fontSize: 12, opacity: 0.75 }}>
                  Role: {roleLabel}
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