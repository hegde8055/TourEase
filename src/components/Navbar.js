// /client/src/components/Navbar.js
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { isAuthenticated, getUsername } from "../utils/auth";
import {
  FaHome,
  FaCompass,
  FaFireAlt,
  FaRoute,
  FaUserCircle,
  FaInfoCircle,
  FaEnvelope,
} from "react-icons/fa";
import ConfirmModal from "./ConfirmModal";

const Navbar = () => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { user, logout: contextLogout } = useAuth();

  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [username, setUsername] = useState(getUsername());
  const [menuActive, setMenuActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("");

  // Track route + query param
  useEffect(() => {
    const tab = new URLSearchParams(search).get("tab");
    if (pathname === "/profile") {
      setActiveLink(tab || "profile");
    } else if (pathname === "/explore") {
      setActiveLink("explore");
    } else if (pathname === "/trending") {
      setActiveLink("trending");
    } else if (pathname === "/ItineraryPlanner") {
      setActiveLink("Itinerary Planner");
    } else {
      setActiveLink("home");
    }
  }, [pathname, search]);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setUsername(getUsername() || user?.username);
  }, [user]);

  const handleLogout = () => setIsModalOpen(true);

  const handleConfirmLogout = async () => {
    try {
      setIsModalOpen(false);
      setMenuActive(false);
      await new Promise((res) => setTimeout(res, 150));
      await Promise.resolve(contextLogout?.());
      setAuthenticated(false);
      setUsername("");
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
    { to: "/profile?tab=about", label: "About Us", icon: FaInfoCircle },
    { to: "/profile?tab=contact", label: "Contact Us", icon: FaEnvelope },
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
                className={`nav-link nav-icon-link ${
                  activeLink.toLowerCase().includes(label.toLowerCase().split(" ")[0])
                    ? "nav-active"
                    : ""
                }`}
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
