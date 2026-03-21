import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Admin.css";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [openMenu, setOpenMenu] = useState(false);

  const username =
    localStorage.getItem("username") ||
    sessionStorage.getItem("username") ||
    "Admin";

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("user_id");
    localStorage.removeItem("email");

    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("user_id");
    sessionStorage.removeItem("email");

    window.location.href = "/login";
  };

  const handleProfile = () => {
    setOpenMenu(false);
    navigate("/profile");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

        <div className="admin-user-menu" ref={dropdownRef}>
          <button
            className="admin-user-btn"
            onClick={() => setOpenMenu((prev) => !prev)}
          >
            <span>{username}</span>
            <span className={`admin-user-caret ${openMenu ? "open" : ""}`}>▼</span>
          </button>

          {openMenu && (
            <div className="admin-user-dropdown">
              <button
                className="admin-user-dropdown-item"
                onClick={handleProfile}
              >
                My Profile
              </button>

              <div className="admin-user-role-text">Role: Admin</div>

              <button
                className="admin-user-dropdown-item logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;