import React from 'react';
import './../styles/Footer.css'; // Ensure you have a CSS file for styling the footer

const Footer = () => {
  return (
    <footer className="footer text-center">
      <p>&copy; 2025 RiskManagePro. All Rights Reserved.</p>
      <div className="social-links">
        <a href="mailto:riskmanagepro@email.com">✉ Email</a>
        <a href="#">📞 +977-9812345678</a>
        <a href="#">🌐 Facebook</a>
        <a href="#">🐦 Twitter</a>
      </div>
    </footer>
  );
};

export default Footer;
