import React from 'react';
import './../styles/Header.css'; // Ensure you have a CSS file for styling the header

const Header = () => {
  return (
    <header className="header shadow">
      <div className="logo">📊 Risk Management</div>
      <nav className="nav-links">
        <a href="/home#home">Home</a>
        <a href="/home#about">About</a>
        <a href="/home#contact">Contact Us</a>
      </nav>
    </header>
  );
};

export default Header;
