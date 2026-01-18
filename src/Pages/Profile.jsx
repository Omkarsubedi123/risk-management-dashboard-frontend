import React, { useEffect, useState } from "react";
import axios from "axios";
import AppNavbar from "../components/Navbar";
import MessageModal from "../components/MessageModal";
import "../styles/Profile.css";

const Profile = () => {
  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  const token = getToken();

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    role: "",
  });

  const [pw, setPw] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const [msgOpen, setMsgOpen] = useState(false);
  const [msgCfg, setMsgCfg] = useState({
    title: "",
    message: "",
    variant: "success",
  });

  const showMsg = (title, message, variant = "success") => {
    setMsgCfg({ title, message, variant });
    setMsgOpen(true);
  };

  const headers = { Authorization: `Bearer ${token}` };

  const fetchMe = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/users/me/", {
        headers,
      });
      setForm({
        email: res.data.email || "",
        username: res.data.username || "",
        first_name: res.data.first_name || "",
        last_name: res.data.last_name || "",
        role: res.data.role || "",
      });
    } catch (err) {
      showMsg("Error", "Failed to load profile. Please login again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await axios.patch(
        "http://127.0.0.1:8000/api/users/me/",
        {
          username: form.username,
          first_name: form.first_name,
          last_name: form.last_name,
        },
        { headers }
      );
      showMsg("Success", "Profile updated successfully.");
      fetchMe();
    } catch (err) {
      showMsg("Failed", err.response?.data?.detail || "Update failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    setChangingPw(true);
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/users/change-password/",
        pw,
        { headers }
      );
      showMsg("Success", "Password changed successfully.");
      setPw({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      showMsg("Failed", err.response?.data?.detail || "Password change failed.", "error");
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <>
      <AppNavbar />

      <div className="profile-page">
        <div className="profile-hero">
          <div className="profile-hero-inner">
            <h2>My Profile</h2>
            <p>Update your personal information and manage your password.</p>
          </div>
        </div>

        <div className="profile-container">
          <div className="profile-card">
            <div className="profile-card-head">
              <div>
                <h4>Account Information</h4>
                <p className="muted">These details are used across the system.</p>
              </div>
            </div>

            {loading ? (
              <div className="muted">Loading…</div>
            ) : (
              <>
                <div className="profile-grid">
                  <div className="field">
                    <label>Email (read-only)</label>
                    <input value={form.email} disabled />
                  </div>

                  <div className="field">
                    <label>Role</label>
                    <input value={form.role} disabled />
                  </div>

                  <div className="field">
                    <label>Username</label>
                    <input
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      placeholder="Enter username"
                    />
                  </div>

                  <div className="field">
                    <label>First Name</label>
                    <input
                      value={form.first_name}
                      onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                      placeholder="Enter first name"
                    />
                  </div>

                  <div className="field">
                    <label>Last Name</label>
                    <input
                      value={form.last_name}
                      onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="profile-actions">
                  <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="profile-card">
            <div className="profile-card-head">
              <div>
                <h4>Change Password</h4>
                <p className="muted">
                  Use a strong password (minimum length + not too common).
                </p>
              </div>
            </div>

            <div className="profile-grid">
              <div className="field">
                <label>Current Password</label>
                <input
                  type="password"
                  value={pw.current_password}
                  onChange={(e) => setPw({ ...pw, current_password: e.target.value })}
                  placeholder="Enter current password"
                />
              </div>

              <div className="field">
                <label>New Password</label>
                <input
                  type="password"
                  value={pw.new_password}
                  onChange={(e) => setPw({ ...pw, new_password: e.target.value })}
                  placeholder="Enter new password"
                />
              </div>

              <div className="field">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={pw.confirm_password}
                  onChange={(e) => setPw({ ...pw, confirm_password: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="profile-actions">
              <button className="btn btn-outline" onClick={changePassword} disabled={changingPw}>
                {changingPw ? "Updating…" : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <MessageModal {...msgCfg} open={msgOpen} onClose={() => setMsgOpen(false)} />
    </>
  );
};

export default Profile;
