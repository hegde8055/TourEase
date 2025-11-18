// /client/src/components/Navbar.js
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { isAuthenticated, getUsername, logout as clearStoredAuth } from "../utils/auth";
import { FaHome, FaCompass, FaFireAlt, FaRoute, FaUserCircle } from "react-icons/fa";
import ConfirmModal from "./ConfirmModal";

// --- ENTIRE FROSTED GLASS THEME ---
const glassStyles = `
  /* 1. MAIN NAVBAR CONTAINER */
  nav {
    position: fixed !important;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000; /* High z-index to float over everything */
    
    /* THE GLASS EFFECT */
    background: rgba(15, 23, 42, 0.65) !important; /* Dark slate tint */
    backdrop-filter: blur(16px) !important;         /* Heavy blur */
    -webkit-backdrop-filter: blur(16px) !important; /* Safari support */
    border-bottom: 1px solid rgba(255, 255, 255, 0.08); /* Subtle icy border */
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);      /* Soft shadow */
    
    transition: all 0.3s ease-in-out;
  }

  /* 2. NAV LINKS & ICONS (HOVER EFFECT) */
  .nav-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 12px; /* Smooth rounded corners */
    transition: all 0.3s ease;
    color: rgba(255, 255, 255, 0.9); /* Bright text for contrast */
    border: 1px solid transparent; /* Prevent layout shift */
  }

  /* The "Glass Tile" effect on Hover */
  .nav-link:hover {
    background: rgba(255, 255, 255, 0.1) !important;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  /* Active Link State */
  .nav-active {
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff !important;
    font-weight: 600;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  /* 3. BUTTONS (Sign In / Sign Out) */
  .nav-link-button {
    padding: 8px 20px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
    color: white;
    backdrop-filter: blur(4px);
    transition: all 0.3s ease;
    cursor: pointer;
  }
  .nav-link-button:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
  }

  /* 4. MOBILE MENU GLASS EFFECT */
  @media (max-width: 960px) {
    .nav-menu {
      background: rgba(15, 23, 42, 0.95) !important; /* Darker glass for menu legibility */
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
`;

const Navbar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout: contextLogout } = useAuth();

  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [username, setUsername] = useState(getUsername());
  const [menuActive, setMenuActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("");

  // Track active page based on path and query
  useEffect(() => {
    if (pathname === "/profile") {
      setActiveLink("profile");
    } else if (pathname === "/explore") {
      setActiveLink("explore");
    } else if (pathname === "/trending") {
      setActiveLink("trending");
    } else if (pathname === "/ItineraryPlanner") {
      setActiveLink("Itinerary Planner");
    } else {
      setActiveLink("home");
    }
  }, [pathname]);

  // Update user info from context or local storage
  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setUsername(getUsername() || user?.username);
  }, [user]);

  const handleLogout = () => setIsModalOpen(true);

  const redirectToSignin = () => {
    try {
      navigate("/signin", { replace: true });
    } catch (navError) {
      console.warn("[Navbar] React navigation to /signin failed, using hard redirect.", navError);
    }

    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        if (window.location.pathname !== "/signin") {
          window.location.replace("/signin");
        }
      }, 150);
    }
  };

  const handleConfirmLogout = async () => {
    setMenuActive(false);
    setIsModalOpen(false);

    try {
      if (typeof contextLogout === "function") {
        await Promise.resolve(contextLogout());
      }
      clearStoredAuth();
      setAuthenticated(false);
      setUsername("");
    } catch (err) {
      console.error("[Navbar] Logout error:", err);
      clearStoredAuth();
    } finally {
      redirectToSignin();
    }
  };

  const handleForceLogout = () => {
    setMenuActive(false);
    setIsModalOpen(false);
    try {
      if (typeof contextLogout === "function") {
        contextLogout();
      }
    } catch (err) {
      console.error("[Navbar] Force logout fallback error:", err);
    } finally {
      clearStoredAuth();
      setAuthenticated(false);
      setUsername("");
      if (typeof window !== "undefined") {
        window.location.replace("/signin?forced=1");
        window.setTimeout(() => {
          window.location.reload();
        }, 200);
      }
    }
  };

  const handleCancelLogout = () => setIsModalOpen(false);
  const toggleMenu = () => setMenuActive(!menuActive);
  const closeMenu = () => setMenuActive(false);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // 🚀 Simplified Navbar Items
  const navItems = [
    { to: "/", label: "Home", icon: FaHome },
    { to: "/explore", label: "Explore", icon: FaCompass },
    { to: "/trending", label: "Trending", icon: FaFireAlt },
    { to: "/ItineraryPlanner", label: "Itinerary Planner", icon: FaRoute },
  ];

  return (
    <header>
      {/* INJECT THE FROSTED GLASS CSS */}
      <style>{glassStyles}</style>

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
        onForceConfirm={handleForceLogout}
      />
    </header>
  );
};

export default Navbar;
