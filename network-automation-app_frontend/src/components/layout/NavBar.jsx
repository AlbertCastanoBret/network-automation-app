import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Dashboard
        </Link>
        <div className="nav-menu">
          <NavLink
            className={`nav-item ${location.pathname === '/devices' ? 'active-nav-item' : ''}`}
            to="/devices"
          >
            <span>Devices</span>
          </NavLink>
          <NavLink
            className={`nav-item ${location.pathname === '/task-scheduler' ? 'active-nav-item' : ''}`}
            to="/task-scheduler"
          >
            <span>Task Scheduler</span>
          </NavLink>
          <NavLink
            className={`nav-item ${location.pathname === '/hosts' ? 'active-nav-item' : ''}`}
            to="/hosts"
          >
            <span>Hosts</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;