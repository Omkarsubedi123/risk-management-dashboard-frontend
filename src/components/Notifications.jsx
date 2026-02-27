import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Dropdown, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./../styles/Notifications.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const Notifications = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // control dropdown open/close so we can close after click
  const [open, setOpen] = useState(false);

  const unreadCount = items.filter((n) => !n.is_read).length;

  const fetchNotifications = async () => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/notifications/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("access");
        sessionStorage.removeItem("access");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Mark all read
  const markAllRead = async () => {
    const token = getToken();
    if (!token) return;

    try {
      await axios.post(
        `${BACKEND_URL}/api/notifications/mark-all-read/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch {}
  };

  // ✅ Clear all
  const clearAllNotifications = async () => {
    const token = getToken();
    if (!token) return;

    try {
      await axios.delete(`${BACKEND_URL}/api/notifications/clear/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch {}
  };

  // ✅ Mark single as read
  const markRead = async (notifId) => {
    const token = getToken();
    if (!token) return;

    // Optimistic update
    setItems((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    );

    try {
      await axios.patch(
        `${BACKEND_URL}/api/notifications/${notifId}/read/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      // revert
      setItems((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: false } : n))
      );
    }
  };

  const handleNotificationClick = async (n) => {
    // 1) mark read
    await markRead(n.id);

    // 2) close dropdown
    setOpen(false);

    // 3) redirect if backend provided redirect_url
    const url = (n.redirect_url || "").trim();
    if (url) {
      navigate(url);
    }
  };

  const timeAgo = (iso) => {
    try {
      const t = new Date(iso).getTime();
      const diff = Date.now() - t;
      const s = Math.floor(diff / 1000);
      if (s < 60) return `${s}s ago`;
      const m = Math.floor(s / 60);
      if (m < 60) return `${m}m ago`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h}h ago`;
      const d = Math.floor(h / 24);
      return `${d}d ago`;
    } catch {
      return "";
    }
  };

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 2000); // polling
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, []);

  return (
    <Dropdown
      align="end"
      className="notif-wrap"
      show={open}
      onToggle={(isOpen) => setOpen(isOpen)}
      ref={dropdownRef}
    >
      <Dropdown.Toggle
        variant="link"
        className="notif-toggle"
        id="dropdown-notifications"
      >
        <span className="notif-bell">🔔</span>
        {unreadCount > 0 && (
          <Badge pill className="notif-badge">
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu className="notif-menu">
        <div className="notif-head">
          <div className="notif-title">Notifications</div>
          <div className="notif-sub">
            {loading
              ? "Loading…"
              : unreadCount > 0
              ? `${unreadCount} unread`
              : "All caught up"}
          </div>

          <div className="notif-actions" style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button
              type="button"
              className="btn btn-light btn-sm"
              onClick={markAllRead}
              disabled={items.length === 0 || unreadCount === 0}
            >
              Mark All Read
            </button>

            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={clearAllNotifications}
              disabled={items.length === 0}
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="notif-list">
          {items.length === 0 ? (
            <div className="notif-empty">No notifications yet.</div>
          ) : (
            items.slice(0, 10).map((n) => (
              <button
                key={n.id}
                type="button"
                className={`notif-item ${n.is_read ? "read" : "unread"}`}
                onClick={() => handleNotificationClick(n)}
                title={n.redirect_url ? "Click to open" : "Click to mark as read"}
              >
                <div className="notif-item-top">
                  <div className="notif-item-title">{n.title}</div>
                  <div className="notif-item-time">{timeAgo(n.created_at)}</div>
                </div>
                <div className="notif-item-msg">{n.message}</div>

                {/* small hint if it can redirect */}
                {!!(n.redirect_url || "").trim() && (
                  <div style={{ marginTop: 6, fontSize: 12, fontWeight: 800, color: "#2563eb" }}>
                    Open →
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        <div className="notif-foot">
          <button type="button" className="notif-refresh" onClick={fetchNotifications}>
            Refresh
          </button>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default Notifications;