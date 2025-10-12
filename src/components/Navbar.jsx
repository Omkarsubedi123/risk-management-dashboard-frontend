import React from "react";
import { Navbar, Nav, Container, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./../styles/Navbar.css";

const AppNavbar = () =>{
    const navigate = useNavigate();

    const handleLogout = () =>{
        localStorage.clear();
        navigate("/login");
    }
    return(
        <Navbar bg="dark" variant="dark" expand="lg" className="py-3 shadow-sm">
      <Container fluid>
        <Navbar.Brand className="fw-bold ms-3">Risk Management</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav" className="justify-content-between">
          <Nav className="me-auto">
            <Nav.Link onClick={() => navigate("/pm/dashboard")}>Dashboard</Nav.Link>
            <Nav.Link onClick={() => navigate("/pm/projects")}>Projects</Nav.Link>
            <Nav.Link onClick={() => navigate("/pm/risks")}>Risks</Nav.Link>
            <Nav.Link onClick={() => navigate("/pm/heatmap")}>Heat Map</Nav.Link>
            <Nav.Link onClick={() => navigate("/pm/reports")}>Reports</Nav.Link>
          </Nav>
          <Dropdown align="end" className="me-3">
            <Dropdown.Toggle variant="outline-light" id="dropdown-user">
              James Smith
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;