import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/VerifyOTP.css";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialEmail = location.state?.email || "";
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email || !otp) {
      setError("Please enter both email and OTP.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${backendUrl}/api/users/verify-otp/`, {
        email,
        otp_code: otp,
      });

      if (response.status === 200) {
        setMessage("Email verified successfully! Redirecting to login...");
        setTimeout(() => navigate("/login", { state: { email } }), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-otp-page">
      <div className="verify-otp-card shadow-lg">
        <h2 className="verify-otp-title">Email Verification</h2>

        {error && <div className="verify-otp-alert verify-otp-error">{error}</div>}
        {message && <div className="verify-otp-alert verify-otp-success">{message}</div>}

        <form onSubmit={handleVerify} className="verify-otp-form">
          <div className="verify-otp-group mb-3">
            <label>Email Address</label>
            <input
              type="email"
              className="verify-otp-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              readOnly={!!initialEmail}
            />
          </div>

          <div className="verify-otp-group mb-3">
            <label>Enter OTP</label>
            <input
              type="text"
              className="verify-otp-input"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
          </div>

          <button type="submit" className="verify-otp-btn-primary" disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </button>

          <button
            type="button"
            className="verify-otp-btn-secondary mt-2"
            onClick={() => navigate("/login")}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
