import React from 'react'
import { Link, NavLink } from 'react-router-dom';

export const NavBar = () => {
    return (
        <nav className="navbar">
          <div className="navbar-container">
            <Link to="/" className="navbar-logo">
              Dashboard
            </Link>
            {}
            <div className="nav-menu">
              <NavLink 
                className="nav-item"
                to="/devices">
                  Devices
              </NavLink>
              <NavLink 
                className="nav-item"
                to="/hosts">
                  Hosts
              </NavLink>
              <NavLink 
                className="nav-item"
                to="/services">
                  Services
              </NavLink>
            </div>
          </div>
        </nav>
    );
};
