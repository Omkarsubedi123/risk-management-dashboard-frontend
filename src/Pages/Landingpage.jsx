import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './../styles/Landingpage.css';
import { FaChartLine, FaProjectDiagram, FaUsers } from 'react-icons/fa';
import LandingLogo from '../assets/LandingLogo.png';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login", { state: { forceLogin: true } });
  };

  return (
    <div>
      <Header />

      <section id="home" className="hero-section">
        <div className="hero-text animate__animated animate__fadeInDown">
          <h1>Welcome to Risk Management Dashboard</h1>
          <p>Your All-in-One Risk Management Dashboard for Project Teams</p>
          <button onClick={handleGetStarted} className="get-started-btn">
            Get Started
          </button>
        </div>
        <img
          className="hero-image animate__animated animate__fadeInUp"
          src={LandingLogo}
          alt="Dashboard Monitor"
        />
      </section>

      <section id="about" className="about-section">
        <h2>About the System</h2>
        <p>
          RiskManagePro is a powerful web-based platform designed for project teams to identify,
          assess, and mitigate risks with precision. Tailored for project managers and team members,
          our system features intuitive dashboards, detailed risk entry forms, automated scoring, and
          visual heatmaps.
        </p>

        <div className="features">
          <div className="feature-card">
            <FaProjectDiagram size={40} />
            <h4>Project Risk Overview</h4>
            <p>Track risks across all your projects in one place.</p>
          </div>
          <div className="feature-card">
            <FaUsers size={40} />
            <h4>Role-based Access</h4>
            <p>Separate dashboards for managers and team members.</p>
          </div>
          <div className="feature-card">
            <FaChartLine size={40} />
            <h4>Heatmap & Analytics</h4>
            <p>Visualize severity, likelihood, and risk scores dynamically.</p>
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <h2>Contact Us</h2>
        <p>Email: <a href="mailto:riskmanagepro@email.com">riskmanagepro@email.com</a></p>
        <p>Phone: <a href="#">+977-9812345678</a></p>
        <div className="socials">
          <a href="#">🌐 Facebook</a>
          <a href="#">🐦 Twitter</a>
          <a href="#">📷 Instagram</a>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default LandingPage;
