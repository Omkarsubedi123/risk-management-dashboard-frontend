import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/ResetPassword.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = location.state?.email || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!otp || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${backendUrl}/api/users/password/reset/confirm/`, {
        email,
        otp: otp,
        new_password: newPassword,
        con_password: confirmPassword,
      });

      if (response.status === 200) {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-card shadow-lg">
        <h2 className="reset-password-title">Reset Password</h2>

        {error && <div className="reset-password-alert reset-password-error">{error}</div>}
        {message && <div className="reset-password-alert reset-password-success">{message}</div>}

        <form onSubmit={handleReset} className="reset-password-form">
          <div className="reset-password-group mb-3">
            <label>Email Address</label>
            <input
              type="email"
              className="reset-password-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              readOnly={!!initialEmail}
            />
          </div>

          <div className="reset-password-group mb-3">
            <label>OTP</label>
            <input
              type="text"
              className="reset-password-input"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
          </div>

          <div className="reset-password-group mb-3">
            <label>New Password</label>
            <input
              type="password"
              className="reset-password-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="reset-password-group mb-3">
            <label>Confirm Password</label>
            <input
              type="password"
              className="reset-password-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="reset-password-btn-primary" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <button type="button" className="reset-password-btn-secondary mt-2" onClick={() => navigate("/login", { state: { email } })}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
