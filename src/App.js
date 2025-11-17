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
  // 'isRememberMe' was removed because it was unused
  logout as authLogout,
} from "./utils/auth";
import {
  AUTH_EXPIRED_EVENT, // <-- Correct: This is imported
  // --- BOSS FIX: Removed 'enhancedPlacesAPI' (it was unused) ---
} from "./utils/api";
import Footer from "./components/Footer";
import AIChatbot from "./components/AIChatbot";
import Navbar from "./components/Navbar";
import "./App.css";
import About from "./pages/About";

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
const Contact = lazy(() => import("./pages/Contact"));

// ------------------------------
// 🌍 Auth Context
// ------------------------------
export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());
  const [username, setUsername] = useState(getUsername());
  const [sessionKey, setSessionKeyState] = useState(getSessionKey());

  useEffect(() => {
    if (!sessionKey) {
      const newKey =
        Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setSessionKey(newKey, false);
      setSessionKeyState(newKey);
    }

    const handleAuthChange = () => {
      setIsAuthenticated(!!getToken());
      setUsername(getUsername());
      setSessionKeyState(getSessionKey());
    };

    const handleAuthExpired = (event) => {
      console.warn("Auth token expired, logging out.", event.detail?.message);
      authLogout();
      // Optionally, navigate to /signin with a message
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    };
  }, [sessionKey]);

  const login = (token, name, rememberMe) => {
    authLogout(rememberMe, token, name); // This function is from auth.js, it sets the new tokens
    setIsAuthenticated(true);
    setUsername(name);
  };

  const logout = () => {
    authLogout();
    setIsAuthenticated(false);
    setUsername(null);
  };

  const value = {
    isAuthenticated,
    username,
    sessionKey,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ------------------------------
// 🗺️ Page Metadata Updater
// ------------------------------
const setFavicon = (href) => {
  const link = document.querySelector("link[rel*='icon']") || document.createElement("link");
  link.type = "image/x-icon";
  link.rel = "shortcut icon";
  link.href = href;
  document.getElementsByTagName("head")[0].appendChild(link);
};

const PageMetaUpdater = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const tab = params.get("tab");
    let title = "TourEase";
    let favicon = "/favicons/default.ico";

    if (pathname === "/") {
      title = "TourEase – Your AI Travel Planner for India";
      favicon = "/favicons/default.ico";
    } else if (pathname === "/explore") {
      title = "TourEase – Explore Destinations";
      favicon = "/favicons/gold.ico";
    } else if (pathname === "/trending") {
      title = "TourEase – Trending Now";
      favicon = "/favicons/red.ico";
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
            <AIChatbot />
          </div>
        </Suspense>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

// ------------------------------
// ✨ Animated Routes
// ------------------------------
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5,
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageWrapper>
              <Home />
            </PageWrapper>
          }
        />
        <Route
          path="/signin"
          element={
            <PageWrapper>
              {isAuthenticated ? <Navigate to="/profile" replace /> : <SignIn />}
            </PageWrapper>
          }
        />
        <Route
          path="/signup"
          element={
            <PageWrapper>
              {isAuthenticated ? <Navigate to="/profile" replace /> : <SignUp />}
            </PageWrapper>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PageWrapper>
              <ForgotPassword />
            </PageWrapper>
          }
        />
        <Route
          path="/verify-otp"
          element={
            <PageWrapper>
              <VerifyOTP />
            </PageWrapper>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <PageWrapper>
              <ResetPassword />
            </PageWrapper>
          }
        />
        <Route
          path="/explore"
          element={
            <PageWrapper>
              <Explore />
            </PageWrapper>
          }
        />
        <Route
          path="/trending"
          element={
            <PageWrapper>
              <Trending />
            </PageWrapper>
          }
        />
        <Route
          path="/destination/:id"
          element={
            <PageWrapper>
              <Destination />
            </PageWrapper>
          }
        />
        <Route
          path="/about"
          element={
            <PageWrapper>
              <About />
            </PageWrapper>
          }
        />
        <Route
          path="/contact"
          element={
            <PageWrapper>
              <Contact />
            </PageWrapper>
          }
        />
        {/* Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <Profile />
              </PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/itineraryplanner"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <ItineraryPlanner />
              </PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <PageWrapper>
                <Admin />
              </PageWrapper>
            </ProtectedRoute>
          }
        />
        {/* 404 Fallback */}
        <Route
          path="*"
          element={
            <PageWrapper>
              <Navigate to="/" replace />
            </PageWrapper>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
  >
    {children}
  </motion.div>
);

export default App;
