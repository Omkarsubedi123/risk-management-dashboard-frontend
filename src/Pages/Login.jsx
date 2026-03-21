import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import Header from "../components/Header";
import Footer from "../components/Footer";
import "./../styles/Login.css";
import LandingLogo from "../assets/LandingLogo.png";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const redirectByRole = (role) => {
    if (role === "AD") {
      navigate("/admin/dashboard");
    } else if (role === "PM") {
      navigate("/pmdashboard");
    } else {
      navigate("/tm/dashboard");
    }
  };

  useEffect(() => {
    const access =
      localStorage.getItem("access") || sessionStorage.getItem("access");
    const role =
      localStorage.getItem("role") || sessionStorage.getItem("role");

    if (access && role && !location.state?.forceLogin) {
      redirectByRole(role);
    }
  }, [location.state, navigate]);

  const clearAllSessions = () => {
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
  };

  const saveSession = (data) => {
    clearAllSessions();

    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem("access", data.access);
    storage.setItem("refresh", data.refresh);
    storage.setItem("role", data.role || "");
    storage.setItem("username", data.username || "");
    storage.setItem("user_id", data.user_id || "");
    storage.setItem("email", data.email || "");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/users/login/`, {
        email,
        password,
      });

      saveSession(response.data);

      const { role } = response.data;
      redirectByRole(role);
    } catch (error) {
      console.error("Login error:", error);

      const data = error.response?.data;

      let message = "Invalid email or password. Please try again.";

      if (typeof data === "string") {
        message = data;
      } else if (data?.detail) {
        message = data.detail;
      } else if (Array.isArray(data?.non_field_errors) && data.non_field_errors.length) {
        message = data.non_field_errors[0];
      } else if (typeof data === "object") {
        const firstValue = Object.values(data)[0];
        if (Array.isArray(firstValue) && firstValue.length) {
          message = firstValue[0];
        } else if (typeof firstValue === "string") {
          message = firstValue;
        }
      }

      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="login-page d-flex align-items-center justify-content-center">
        <div className="login-card shadow-lg">
          <div className="login-left">
            <h2 className="login-title">Welcome Back!</h2>
            <p className="login-subtext">Risk Management Dashboard</p>

            {errorMsg && <div className="alert alert-danger py-2">{errorMsg}</div>}

            <form onSubmit={handleLogin}>
              <div className="form-group mb-3">
                <label>Email address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group mb-3">
                <label>Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="form-check mb-3 d-flex justify-content-between">
                <div>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <label className="form-check-label ms-2" htmlFor="rememberMe">
                    Remember me
                  </label>
                </div>
                <a
                  href="/forget-password"
                  className="forgot-link"
                  style={{ textDecoration: "none" }}
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 login-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      aria-hidden="true"
                    ></span>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <p className="text-center mt-3 signup-link">
              Don't have an account? <a href="/signup">Sign up</a>
            </p>
          </div>

          <div className="login-right d-none d-md-flex flex-column justify-content-center align-items-center text-center">
            <h1 className="animated-text">Secure • Smart • Efficient</h1>
            <p className="animated-caption">Manage risks like a pro</p>
            <img src={LandingLogo} alt="Risk Chart" className="chart-image mt-4" />
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Login;