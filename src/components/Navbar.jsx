import React, { useEffect, useMemo, useState } from "react";
import { Navbar, Nav, Container, Dropdown, Spinner } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import "./../styles/Navbar.css";
import Notifications from "./Notifications";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

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
    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");
    localStorage.removeItem("me_cache");
    sessionStorage.removeItem("me_cache");
    navigate("/login");
  };

  // ✅ role resolver (supports different backend naming)
  const role = useMemo(() => {
    const r =
      me?.role ||
      me?.user_role ||
      me?.user_type ||
      me?.account_type ||
      me?.type ||
      "";
    return String(r).toLowerCase(); // "pm" or "tm"
  }, [me]);

  const isPM = role === "pm" || role === "project_manager";
  const isTM = role === "tm" || role === "team_member";

  const displayName =
    me?.first_name || me?.username || me?.email || "Account";

  const homeRoute = isTM ? "/tm/dashboard" : "/pmdashboard";

  const fetchMe = async () => {
    const token = getToken();
    if (!token) return;

    // ✅ try cache first (avoid extra API calls)
    const cached =
      localStorage.getItem("me_cache") || sessionStorage.getItem("me_cache");
    if (cached) {
      try {
        setMe(JSON.parse(cached));
        return;
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

      // store cache in whichever storage token exists
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

  // ✅ Nav items (PM/TM)
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
    { label: "Reports", to: "/tm/reports" }, // you can hide later if not ready
  ];

  // fallback: before role loads, show PM links (safe)
  const activeLinks = isTM ? tmLinks : pmLinks;

  const isActive = (to) => {
    // simple active detection; works for nested routes
    return location.pathname === to || location.pathname.startsWith(to + "/");
  };

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
            {/* Notifications should work for both PM and TM */}
            <Notifications />

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

                {/* Optional: show role label */}
                <Dropdown.Item disabled style={{ fontSize: 12, opacity: 0.75 }}>
                  Role: {isTM ? "Team Member" : isPM ? "Project Manager" : "User"}
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
