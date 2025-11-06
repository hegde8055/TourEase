// /client/src/App.js
import React, { createContext, useContext, useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
// eslint-disable-next-line no-unused-vars
import { getUsername, getToken, logout as authLogout } from "./utils/auth";
import "./App.css";

const Home = lazy(() => import("./pages/Home"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Profile = lazy(() => import("./pages/Profile"));
const Destination = lazy(() => import("./pages/Destination"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const VerifyOTP = lazy(() => import("./pages/VerifyOTP"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Trending = lazy(() => import("./pages/Trending"));
const ItineraryPlanner = lazy(() => import("./pages/ItineraryPlanner.js"));
const Explore = lazy(() => import("./pages/Explore"));
const Admin = lazy(() => import("./pages/Admin"));
const Footer = lazy(() => import("./components/Footer"));
const AIChatbot = lazy(() => import("./components/AIChatbot"));

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
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
          setUser({ username, token });
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  if (loading) return <div>Loading...</div>;

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

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
        <ScrollToTop />
        <Suspense fallback={<Fallback />}>
          <div className="app-shell">
            <div className="page-outlet main-content">
              <Routes>
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
            </div>
            <Footer />
          </div>
          <AIChatbot />
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
