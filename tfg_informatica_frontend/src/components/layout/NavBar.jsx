import React from 'react'

export const NavBar = () => {
    return (
        <nav className="navbar">
          <div className="navbar-container">
            <a href="/" className="navbar-logo">
              Dashboard
            </a>
            {}
            <div className="menu-icon">
              {}
            </div>
            <ul className="nav-menu">
              <li className="nav-item">
                <a href="/devices" className="nav-links">
                  Devices
                </a>
              </li>
              <li className="nav-item">
                <a href="/services" className="nav-links">
                  Services
                </a>
              </li>
              <li className="nav-item">
                <a href="/events" className="nav-links">
                  Events
                </a>
              </li>
              {}
            </ul>
          </div>
        </nav>
    );
};
