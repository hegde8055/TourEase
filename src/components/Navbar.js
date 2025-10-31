// /client/src/components/Navbar.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { isAuthenticated, logout, getUsername } from "../utils/auth";
import { FaHome, FaCompass, FaFireAlt, FaRoute, FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [username, setUsername] = useState(getUsername());
  const [menuActive, setMenuActive] = useState(false);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setUsername(getUsername() || user?.username);
  }, [user]);

  const handleLogout = () => {
    // --- THIS IS THE CHANGE ---
    // Show a confirmation dialog.
    // If the user clicks "OK", the code inside the 'if' block will run.
    // If they click "Cancel", nothing will happen.
    if (window.confirm("Are you sure you want to sign out?")) {
      logout();
      navigate("/");
      window.location.reload();
    }
    // --- END OF CHANGE ---
  };

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  const closeMenu = () => {
    setMenuActive(false);
  };

  // Scroll to top helper
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navItems = [
    { to: "/", label: "Home", icon: FaHome },
    { to: "/explore", label: "Explore", icon: FaCompass },
    { to: "/trending", label: "Trending", icon: FaFireAlt },
    { to: "/ItineraryPlanner", label: "Itinerary Planner", icon: FaRoute },
  ];

  return (
    <header>
      <nav>
        <Link to="/" className="nav-logo" onClick={scrollToTop}>
          Tourease
        </Link>
        <ul className={`nav-menu ${menuActive ? "active" : ""}`}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <li className="nav-item" key={label}>
              <Link
                to={to}
                className="nav-link nav-icon-link"
                onClick={(e) => {
                  closeMenu();
                  scrollToTop();
                }}
                aria-label={label}
                title={label}
              >
                <Icon size={20} />
                <span className="nav-label">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="nav-auth">
          {authenticated ? (
            <>
              <Link
                to="/profile"
                className="nav-link nav-icon-link nav-user-link"
                onClick={(e) => {
                  closeMenu();
                  scrollToTop();
                }}
                aria-label="Profile"
                title={`Hi, ${username}`}
              >
                <FaUserCircle size={22} />
                <span className="nav-label">Hi, {username}</span>
              </Link>
              <button onClick={handleLogout} className="nav-link-button signout">
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/signin" className="nav-link-button" onClick={scrollToTop}>
              Sign In
            </Link>
          )}
        </div>
        <div className={`hamburger ${menuActive ? "active" : ""}`} onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
