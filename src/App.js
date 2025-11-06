// /client/src/App.js
import React, { createContext, useContext, useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ScrollProgressBar from "./components/ScrollProgressBar";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import {
  getUsername,
  getToken,
  getSessionKey,
  setSessionKey,
  isRememberMe,
  logout as authLogout,
} from "./utils/auth";
import { enhancedPlacesAPI } from "./utils/api";
import Footer from "./components/Footer";
import AIChatbot from "./components/AIChatbot";
import Navbar from "./components/Navbar";
import "./App.css";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Profile = lazy(() => import("./pages/Profile"));
const Destination = lazy(() => import("./pages/Destination"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const VerifyOTP = lazy(() => import("./pages/VerifyOTP"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Trending = lazy(() => import("./pages/Trending"));
const ItineraryPlanner = lazy(() => import("./pages/ItineraryPlanner"));
const Explore = lazy(() => import("./pages/Explore"));
const Admin = lazy(() => import("./pages/Admin"));

// ------------------------------
// 🧠 Auth Context
// ------------------------------
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = getToken();
        if (token) {
          const username = getUsername();
          let sessionKey = getSessionKey();
          if (!sessionKey) {
            sessionKey =
              typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
                ? crypto.randomUUID()
                : `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
            setSessionKey(sessionKey, isRememberMe());
          }
          setUser({ username, token, sessionKey });
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = (userData) => setUser(userData);

  const logout = async () => {
    try {
      await enhancedPlacesAPI.clearSessionCache();
    } catch (error) {
      console.warn("Failed to clear destination cache on logout:", error.message);
    } finally {
      authLogout();
      setUser(null);
    }
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          minHeight: "50vh",
          alignItems: "center",
          justifyContent: "center",
          color: "#d4af37",
          fontWeight: 600,
          letterSpacing: "0.05em",
        }}
      >
        Loading TourEase…
      </div>
    );

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

// ------------------------------
// 🌈 Page Animation Variants
// ------------------------------
const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  in: { opacity: 1, y: 0, scale: 1 },
  out: { opacity: 0, y: -20, scale: 0.98 },
};
const pageTransition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  duration: 0.45,
};

// ------------------------------
// 🧭 Animated Routes
// ------------------------------
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname + location.search}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="page-outlet main-content"
      >
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/destination/:id"
            element={
              <ProtectedRoute>
                <Destination />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trending"
            element={
              <ProtectedRoute>
                <Trending />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ItineraryPlanner"
            element={
              <ProtectedRoute>
                <ItineraryPlanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <Explore />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

// ------------------------------
// 🧩 Dynamic Page Title & Favicon
// ------------------------------
const setFavicon = (iconPath) => {
  const link = document.querySelector("link[rel~='icon']") || document.createElement("link");
  link.rel = "icon";
  link.href = iconPath;
  document.head.appendChild(link);
};

const PageMetaUpdater = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const tab = new URLSearchParams(search).get("tab");
    let title = "TourEase";
    let favicon = "/favicon.ico";

    if (pathname === "/") title = "TourEase – Home";
    else if (pathname === "/explore") {
      title = "TourEase – Explore";
      favicon = "/favicons/blue.ico";
    } else if (pathname === "/trending") {
      title = "TourEase – Trending Destinations";
      favicon = "/favicons/gold.ico";
    } else if (pathname.toLowerCase().includes("itineraryplanner")) {
      title = "TourEase – Itinerary Planner";
      favicon = "/favicons/green.ico";
    } else if (pathname === "/profile") {
      if (tab === "about") {
        title = "TourEase – About Us";
        favicon = "/favicons/gold.ico";
      } else if (tab === "contact") {
        title = "TourEase – Contact Us";
        favicon = "/favicons/blue.ico";
      } else {
        title = "TourEase – Profile";
        favicon = "/favicons/default.ico";
      }
    } else title = "TourEase – Discover India";

    document.title = title;
    setFavicon(favicon);
  }, [pathname, search]);

  return null;
};

// ------------------------------
// 🚀 Main App Component
// ------------------------------
function App() {
  const Fallback = () => (
    <div
      style={{
        display: "flex",
        minHeight: "50vh",
        alignItems: "center",
        justifyContent: "center",
        color: "#d4af37",
        fontWeight: 600,
        letterSpacing: "0.05em",
      }}
    >
      Loading TourEase…
    </div>
  );

  return (
    <AuthProvider>
      <Router>
        <ScrollProgressBar />
        <ScrollToTop />
        <Navbar />
        <PageMetaUpdater />
        <Suspense fallback={<Fallback />}>
          <div className="app-shell">
            <AnimatedRoutes />
            <Footer />
          </div>
          <AIChatbot />
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
