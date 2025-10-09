import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ForgetPassword.css";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${backendUrl}/api/users/password/reset/`, { email });

      if (response.status === 200) {
        setMessage("OTP sent to your email! Redirecting...");
        setTimeout(() => navigate("/reset-password", { state: { email } }), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forget-password-page">
      <div className="forget-password-card shadow-lg">
        <h2 className="forget-password-title">Forgot Password</h2>

        {error && <div className="forget-password-alert forget-password-error">{error}</div>}
        {message && <div className="forget-password-alert forget-password-success">{message}</div>}

        <form onSubmit={handleSubmit} className="forget-password-form">
          <div className="forget-password-group mb-3">
            <label>Email Address</label>
            <input
              type="email"
              className="forget-password-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="forget-password-btn-primary" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>

          <button type="button" className="forget-password-btn-secondary mt-2" onClick={() => navigate("/login")}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgetPassword;
