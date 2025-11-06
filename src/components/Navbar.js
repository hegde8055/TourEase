// /client/src/components/Navbar.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { isAuthenticated, getUsername } from "../utils/auth";
import { FaHome, FaCompass, FaFireAlt, FaRoute, FaUserCircle } from "react-icons/fa";
import ConfirmModal from "./ConfirmModal";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout: contextLogout } = useAuth(); // ✅ use logout from AuthContext
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

  // ✅ Corrected logout handler
  const handleConfirmLogout = async () => {
    try {
      console.log("[Navbar] Logging out...");
      // Close modal first (wait for animation)
      setIsModalOpen(false);
      setMenuActive(false);
      await new Promise((res) => setTimeout(res, 150));

      // Use context logout (clears both localStorage + React state)
      await Promise.resolve(contextLogout?.());

      setAuthenticated(false);
      setUsername("");

      // Navigate to demo (landing) page
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleCancelLogout = () => setIsModalOpen(false);
  const toggleMenu = () => setMenuActive(!menuActive);
  const closeMenu = () => setMenuActive(false);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

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
