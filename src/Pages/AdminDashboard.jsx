import React, { useEffect, useState } from "react";
import AppNavbar from "../components/Navbar";
import AdminStatCard from "../components/AdminStatCard";
import { adminApi } from "../services/adminApi";
import "../styles/Admin.css";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_users: 0,
    total_pms: 0,
    total_tms: 0,
    total_admins: 0,
    verified_users: 0,
    unverified_users: 0,
    active_users: 0,
    inactive_users: 0,
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getDashboard();
      setStats(res.data || {});
    } catch (err) {
      console.error("Admin dashboard load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-wrap">
      <AppNavbar />

      <main className="admin-page">
        <section className="admin-hero">
          <div>
            <h2>Admin Dashboard</h2>
            <p>Overview of users and system activity in one place.</p>
          </div>
        </section>

        {loading ? (
          <div className="admin-loading-card">Loading dashboard...</div>
        ) : (
          <>
            <section className="admin-grid stats-grid">
              <AdminStatCard title="Total Users" value={stats.total_users} />
              <AdminStatCard title="Project Managers" value={stats.total_pms} />
              <AdminStatCard title="Team Members" value={stats.total_tms} />
              <AdminStatCard title="Admins" value={stats.total_admins} />
              <AdminStatCard title="Active Users" value={stats.active_users} />
              <AdminStatCard title="Inactive Users" value={stats.inactive_users} />
              <AdminStatCard title="Verified Users" value={stats.verified_users} />
              <AdminStatCard title="Unverified Users" value={stats.unverified_users} />
            </section>

            <section className="admin-grid admin-grid-2">
              <div className="admin-panel-card">
                <h3>User Summary</h3>
                <div className="simple-bar-wrap">
                  <div className="simple-bar-row">
                    <span>PM</span>
                    <div className="simple-bar-track">
                      <div
                        className="simple-bar-fill"
                        style={{
                          width: `${
                            stats.total_users
                              ? (stats.total_pms / stats.total_users) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <strong>{stats.total_pms}</strong>
                  </div>

                  <div className="simple-bar-row">
                    <span>TM</span>
                    <div className="simple-bar-track">
                      <div
                        className="simple-bar-fill"
                        style={{
                          width: `${
                            stats.total_users
                              ? (stats.total_tms / stats.total_users) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <strong>{stats.total_tms}</strong>
                  </div>

                  <div className="simple-bar-row">
                    <span>Admin</span>
                    <div className="simple-bar-track">
                      <div
                        className="simple-bar-fill"
                        style={{
                          width: `${
                            stats.total_users
                              ? (stats.total_admins / stats.total_users) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <strong>{stats.total_admins}</strong>
                  </div>
                </div>
              </div>

              <div className="admin-panel-card">
                <h3>Account Health</h3>
                <div className="simple-bar-wrap">
                  <div className="simple-bar-row">
                    <span>Active</span>
                    <div className="simple-bar-track">
                      <div
                        className="simple-bar-fill"
                        style={{
                          width: `${
                            stats.total_users
                              ? (stats.active_users / stats.total_users) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <strong>{stats.active_users}</strong>
                  </div>

                  <div className="simple-bar-row">
                    <span>Inactive</span>
                    <div className="simple-bar-track">
                      <div
                        className="simple-bar-fill"
                        style={{
                          width: `${
                            stats.total_users
                              ? (stats.inactive_users / stats.total_users) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <strong>{stats.inactive_users}</strong>
                  </div>

                  <div className="simple-bar-row">
                    <span>Verified</span>
                    <div className="simple-bar-track">
                      <div
                        className="simple-bar-fill"
                        style={{
                          width: `${
                            stats.total_users
                              ? (stats.verified_users / stats.total_users) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <strong>{stats.verified_users}</strong>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;