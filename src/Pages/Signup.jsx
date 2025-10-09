import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Header from "../components/Header";
import Footer from "../components/Footer";
import "./../styles/Signup.css";
import LandingLogo from "../assets/LandingLogo.png";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "TM", // Default role
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage(null);
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const payload = {
      username: form.name,
      email: form.email,
      password: form.password,
      conf_password: form.confirmPassword,
      role: form.role,
    };

    try {
      setLoading(true);
      const response = await axios.post(`${backendUrl}/api/users/signup/`, payload);

      if (response.status === 201 || response.status === 200) {
        setMessage("Signup successful! Please check your email for the OTP to verify your account.");
        setTimeout(() => {
          navigate("/verify-otp", { state: { email: form.email } });
        }, 3000);
      }
    } catch (err) {
      if (err.response?.data) {
        const errors = err.response.data;
        if (typeof errors === "string") {
          setError(errors);
        } else if (errors.detail) {
          setError(errors.detail);
        } else {
          setError(
            Object.values(errors)
              .flat()
              .join(" ") || "An error occurred during signup."
          );
        }
      } else {
        setError("An error occurred during signup.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="signup-page d-flex align-items-center justify-content-center">
        <div className="signup-card shadow-lg">
          <div className="signup-left">
            <h2 className="signup-title">Create Your Account</h2>
            <p className="signup-subtext">Join the Risk Management Dashboard</p>

            {error && <div className="alert alert-danger">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group mb-3">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  placeholder="Enter your name"
                  required
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group mb-3">
                <label>Email address</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  placeholder="Enter email"
                  required
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group mb-3">
                <label>Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  name="password"
                  placeholder="Password"
                  required
                  value={form.password}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group mb-3">
                <label>Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3 d-flex align-items-center">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                />
                <label htmlFor="showPassword" className="ms-2" style={{ userSelect: "none" }}>
                  Show Passwords
                </label>
              </div>

              <div className="form-group mb-3">
                <label>Select Role</label>
                <div className="d-flex gap-3 mt-1">
                  <div className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="role"
                      value="PM"
                      checked={form.role === "PM"}
                      onChange={handleChange}
                    />
                    <label className="form-check-label ms-2">Project Manager</label>
                  </div>
                  <div className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="role"
                      value="TM"
                      checked={form.role === "TM"}
                      onChange={handleChange}
                    />
                    <label className="form-check-label ms-2">Team Member</label>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100 login-btn" disabled={loading}>
                {loading ? "Signing up..." : "Sign Up"}
              </button>
            </form>

            <p className="text-center mt-3 signup-link">
              Already have an account?{" "}
              <a
                href="/login"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login", { state: { forceLogin: true, email: form.email } });
                }}
              >
                Login
              </a>
            </p>
          </div>

          <div className="signup-right d-none d-md-flex flex-column justify-content-center align-items-center text-center">
            <div className="text-section animated-bg">
              <h1 className="text-section animated-text">Create. Connect. Collaborate.</h1>
              <p className="text-section animated-caption">Be part of smarter risk management</p>
            </div>
            <div className="chart-image-container">
              <img
                src={LandingLogo}
                alt="Chart"
                className="chart-image mt-4"
                style={{ width: "80%", maxWidth: "250px" }}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Signup;
