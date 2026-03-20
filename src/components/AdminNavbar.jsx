import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Admin.css";

const AdminNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("user_id");
    navigate("/login");
  };

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-inner">
        <div className="admin-brand">
          <div className="admin-brand-badge">A</div>
          <div>
            <h1>Admin Panel</h1>
            <p>AI-Based Risk Management Dashboard</p>
          </div>
        </div>

        <nav className="admin-nav-links">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
          >
            Users
          </NavLink>

          <NavLink
            to="/admin/transfer"
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
          >
            Transfer Ownership
          </NavLink>
        </nav>

        <button className="admin-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default AdminNavbar;