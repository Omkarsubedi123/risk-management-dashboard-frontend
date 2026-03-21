import React, { useEffect, useState } from "react";
import AppNavbar from "../components/Navbar";
import AdminRoleBadge from "../components/AdminRoleBadge";
import AdminStatusBadge from "../components/AdminStatusBadge";
import ConfirmModal from "../components/ConfirmModal";
import MessageModal from "../components/MessageModal";
import { adminApi } from "../services/adminApi";
import "../styles/Admin.css";

const AdminUsers = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteMode, setDeleteMode] = useState(false);

  const [messageOpen, setMessageOpen] = useState(false);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [messageVariant, setMessageVariant] = useState("success");

  useEffect(() => {
    fetchUsers();
  }, [role]);

  const fetchUsers = async (searchValue = search) => {
    try {
      setLoading(true);

      const params = {};
      if (role) params.role = role;
      if ((searchValue || "").trim()) params.search = searchValue.trim();

      const res = await adminApi.getUsers(params);
      setUsers(res.data || []);
    } catch (err) {
      console.error("Failed to load users:", err);
      openMessage("Error", "Failed to load users.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const openMessage = (title, body, variant = "success") => {
    setMessageTitle(title);
    setMessageBody(body);
    setMessageVariant(variant);
    setMessageOpen(true);
  };

  const handleOpenAction = (user, isDelete = false) => {
    setSelectedUser(user);
    setDeleteMode(isDelete);
    setConfirmOpen(true);
  };

  const handleActionConfirm = async () => {
    if (!selectedUser) return;

    try {
      setActionLoadingId(selectedUser.id);
      setConfirmOpen(false);

      if (deleteMode) {
        const res = await adminApi.deletePM(selectedUser.id);
        openMessage(
          "PM Deleted",
          res.data?.detail || "Project Manager deleted successfully.",
          "success"
        );
      } else {
        const res = await adminApi.deactivatePM(selectedUser.id);
        openMessage(
          "PM Deactivated",
          res.data?.detail || "Project Manager deactivated successfully.",
          "success"
        );
      }

      await fetchUsers();
    } catch (err) {
      console.error(err);

      const body =
        err?.response?.data?.pm_id?.[0] ||
        err?.response?.data?.detail ||
        "Action failed.";

      openMessage("Action Failed", body, "error");
    } finally {
      setActionLoadingId(null);
      setSelectedUser(null);
      setDeleteMode(false);
    }
  };

  const isPM = (user) => user.role === "PM";
  const canDeactivate = (user) => isPM(user) && user.is_active;
  const canDelete = (user) => isPM(user) && !user.is_active;

  return (
    <div className="admin-page-wrap">
      <AppNavbar />

      <main className="admin-page">
        <section className="admin-hero">
          <div>
            <h2>User Management</h2>
            <p>View all users, roles, account status, and PM actions.</p>
          </div>
        </section>

        <section className="admin-panel-card">
          <form className="admin-toolbar" onSubmit={handleSearch}>
            <div className="admin-filter-group">
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="">All</option>
                <option value="PM">Project Manager</option>
                <option value="TM">Team Member</option>
                <option value="AD">Admin</option>
              </select>
            </div>

            <div className="admin-filter-group flex-grow">
              <label>Search</label>
              <input
                type="text"
                placeholder="Search by username, email, first name, last name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="admin-primary-btn" type="submit">
              Search
            </button>
          </form>
        </section>

        <section className="admin-panel-card">
          {loading ? (
            <div className="admin-loading-card">Loading users...</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Full Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Verified</th>
                    <th>Date Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="admin-empty">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.full_name || "-"}</td>
                        <td>{u.username || "-"}</td>
                        <td>{u.email}</td>
                        <td>
                          <AdminRoleBadge role={u.role} />
                        </td>
                        <td>
                          <AdminStatusBadge active={u.is_active} />
                        </td>
                        <td>{u.is_verified ? "Yes" : "No"}</td>
                        <td>
                          {u.date_joined
                            ? new Date(u.date_joined).toLocaleDateString()
                            : "-"}
                        </td>
                        <td>
                          {canDeactivate(u) ? (
                            <button
                              className="admin-table-danger-btn"
                              onClick={() => handleOpenAction(u, false)}
                              disabled={actionLoadingId === u.id}
                            >
                              {actionLoadingId === u.id
                                ? "Processing..."
                                : "Deactivate"}
                            </button>
                          ) : canDelete(u) ? (
                            <button
                              className="admin-table-delete-btn"
                              onClick={() => handleOpenAction(u, true)}
                              disabled={actionLoadingId === u.id}
                            >
                              {actionLoadingId === u.id
                                ? "Processing..."
                                : "Delete"}
                            </button>
                          ) : (
                            <span className="admin-muted-text">No action</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <ConfirmModal
        open={confirmOpen}
        title={deleteMode ? "Delete Project Manager" : "Deactivate Project Manager"}
        message={
          selectedUser
            ? deleteMode
              ? `Are you sure you want to permanently delete ${selectedUser.email}? This action cannot be undone.`
              : `Are you sure you want to deactivate ${selectedUser.email}? This user will no longer be able to log in. Make sure their projects have already been transferred.`
            : ""
        }
        confirmText={deleteMode ? "Delete" : "Deactivate"}
        confirmVariant={deleteMode ? "danger" : "warning"}
        onConfirm={handleActionConfirm}
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedUser(null);
          setDeleteMode(false);
        }}
      />

      <MessageModal
        open={messageOpen}
        title={messageTitle}
        message={messageBody}
        variant={messageVariant}
        onClose={() => setMessageOpen(false)}
      />
    </div>
  );
};

export default AdminUsers;