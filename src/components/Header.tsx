import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    document.documentElement.setAttribute('data-theme', isDarkTheme ? 'light' : 'dark');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header>
        <div className="container">
          <div className="header-inner">
            <Link to="/" className="logo">
              <img src="/assets/images/logo_inesic.png" alt="INESIC Logo" className="logo-image" />
            </Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link" onClick={closeMobileMenu}>Accueil</Link>
              </li>
              <li className="nav-item">
                <Link to="/about" className="nav-link" onClick={closeMobileMenu}>Qui sommes-nous</Link>
              </li>
              <li className="nav-item">
                <Link to="/expertise" className="nav-link" onClick={closeMobileMenu}>Nos expertises</Link>
              </li>
              <li className="nav-item">
                <Link to="/sakkanal" className="nav-link" onClick={closeMobileMenu}>Sakkanal</Link>
              </li>
              <li className="nav-item">
                <Link to="/why-us" className="nav-link" onClick={closeMobileMenu}>Pourquoi nous</Link>
              </li>
              <li className="nav-item">
                <Link to="/contact" className="nav-link" onClick={closeMobileMenu}>Contact</Link>
              </li>
            </ul>
            <div className="flex items-center">
              <button className="theme-toggle" onClick={toggleTheme}>
                <i className={`fas fa-${isDarkTheme ? 'sun' : 'moon'}`}></i>
              </button>
              <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
                <i className="fas fa-bars"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`overlay ${isMobileMenuOpen ? 'active' : ''}`} onClick={closeMobileMenu}></div>
      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <button className="mobile-menu-close" onClick={closeMobileMenu}>
          <i className="fas fa-times"></i>
        </button>
        <ul className="mobile-menu-list">
          <li className="mobile-menu-item">
            <Link to="/" className="mobile-menu-link" onClick={closeMobileMenu}>Accueil</Link>
          </li>
          <li className="mobile-menu-item">
            <Link to="/about" className="mobile-menu-link" onClick={closeMobileMenu}>Qui sommes-nous</Link>
          </li>
          <li className="mobile-menu-item">
            <Link to="/expertise" className="mobile-menu-link" onClick={closeMobileMenu}>Nos expertises</Link>
          </li>
          <li className="mobile-menu-item">
            <Link to="/sakkanal" className="mobile-menu-link" onClick={closeMobileMenu}>Sakkanal</Link>
          </li>
          <li className="mobile-menu-item">
            <Link to="/why-us" className="mobile-menu-link" onClick={closeMobileMenu}>Pourquoi nous</Link>
          </li>
          <li className="mobile-menu-item">
            <Link to="/contact" className="mobile-menu-link" onClick={closeMobileMenu}>Contact</Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Header;
