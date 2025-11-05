// /client/src/components/Navbar.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { isAuthenticated, logout, getUsername } from "../utils/auth";
import { FaHome, FaCompass, FaFireAlt, FaRoute, FaUserCircle } from "react-icons/fa";
import ConfirmModal from "./ConfirmModal";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth(); // make sure your App provides setUser
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [username, setUsername] = useState(getUsername());
  const [menuActive, setMenuActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setUsername(getUsername() || user?.username);
  }, [user]);

  const handleLogout = () => {
    setIsModalOpen(true);
  };

  // ✅ fixed logout logic
  const handleConfirmLogout = async () => {
    try {
      console.log("[Navbar] handleConfirmLogout: start");

      // Clear stored tokens
      logout();

      // Reset auth context if available
      if (setUser) {
        try {
          setUser(null);
        } catch (err) {
          console.warn("[Navbar] setUser not available:", err);
        }
      }

      // Close modal for smooth UX
      setIsModalOpen(false);

      // Navigate to sign-in or demo page
      navigate("/signin"); // change to "/demo" if that's your preferred redirect

      // Optional: give React Router time to navigate before reload
      setTimeout(() => {
        try {
          console.log("[Navbar] Reloading after logout");
          window.location.reload();
        } catch (err) {
          console.warn("Reload failed:", err);
        }
      }, 120);
    } catch (err) {
      console.error("[Navbar] handleConfirmLogout error:", err);
      try {
        navigate("/signin");
      } catch (e) {
        console.warn("Fallback navigation failed", e);
      }
    }
  };

  const handleCancelLogout = () => {
    setIsModalOpen(false);
  };

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  const closeMenu = () => {
    setMenuActive(false);
  };

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
                onClick={() => {
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
                onClick={() => {
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

      <ConfirmModal
        isOpen={isModalOpen}
        message="Are you sure you want to sign out?"
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </header>
  );
};

export default Navbar;
