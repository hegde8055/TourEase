// /client/src/pages/SignIn.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../utils/api";
import { setToken, setUsername, setSessionKey } from "../utils/auth";
import { useAuth } from "../App";
import "../auth.css";

const SignIn = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Clear error on page load to avoid stale messages
  useEffect(() => {
    setError("");
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        const expiredMessage = window.sessionStorage.getItem("authExpiredMessage");
        if (expiredMessage) {
          setError(expiredMessage);
          window.sessionStorage.removeItem("authExpiredMessage");
        }
      }
    } catch (storageError) {
      console.warn("Unable to read auth expired message", storageError);
    }
  }, []);

  useEffect(() => {
    if (location.state?.resetSuccess) {
      setSuccess("Password updated. You can sign in with your new credentials.");
      const targetPath = `${location.pathname}${location.search}${location.hash}`;
      navigate(targetPath, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      setToken(response.data.token, rememberMe);
      if (response.data.username) {
        setUsername(response.data.username, rememberMe);
      }

      const sessionKey =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setSessionKey(sessionKey, rememberMe);

      login({ username: response.data.username, token: response.data.token, sessionKey });
      const from = location.state?.from;
      if (from?.pathname) {
        navigate(
          {
            pathname: from.pathname,
            search: from.search || "",
            hash: from.hash || "",
          },
          { replace: true }
        );
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      const errorData = err.response?.data;
      const errorMessage = errorData?.error || "Failed to sign in. Please try again.";

      // Check if user doesn't exist - redirect to signup
      if (errorData?.userNotFound || err.response?.status === 404) {
        setError("❌ No account found with this email. Redirecting to signup...");
        setTimeout(() => {
          navigate("/signup", {
            state: { email: formData.email },
          });
        }, 2000);
        setLoading(false);
        return;
      }

      // Specific error for wrong password
      if (
        errorMessage.toLowerCase().includes("wrong password") ||
        errorMessage.toLowerCase().includes("incorrect password")
      ) {
        setError("❌ Wrong password. Please try again or reset your password.");
      } else if (errorMessage.toLowerCase().includes("email")) {
        setError("❌ Email not found. Redirecting to signup...");
        setTimeout(() => {
          navigate("/signup", { state: { email: formData.email } });
        }, 2000);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <div className="left">
          <div className="form-container signin-form-container">
            <div className="logo">
              <span>Tour</span>
              <span>Ease</span>
            </div>

            {error && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#fca5a5",
                  padding: "12px",
                  borderRadius: "10px",
                  marginBottom: "15px",
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}
            {success && !error && (
              <div
                style={{
                  background: "rgba(34, 197, 94, 0.12)",
                  border: "1px solid rgba(34, 197, 94, 0.35)",
                  color: "#86efac",
                  padding: "12px",
                  borderRadius: "10px",
                  marginBottom: "15px",
                  textAlign: "center",
                }}
              >
                {success}
              </div>
            )}

            <form id="signinForm" onSubmit={handleSubmit}>
              <label>Email address</label>
              <input
                id="signinEmail"
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                required
                aria-label="Email"
              />
              <label>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="signinPassword"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  aria-label="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className="checkbox">
                <div className="checkbox-left">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="rememberMe">Remember me</label>
                </div>
                <Link
                  to="/forgot-password"
                  id="forgotLink"
                  style={{
                    color: "#60a5fa",
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    display: "inline-block",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = "#93c5fd";
                    e.target.style.backgroundColor = "rgba(96, 165, 250, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "#60a5fa";
                    e.target.style.backgroundColor = "transparent";
                  }}
                >
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div className="divider">or</div>

            <div className="social-buttons">
              <button className="social-btn google">
                <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" />
                Sign in with Google
              </button>
              <button className="social-btn facebook">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
                  alt="Facebook"
                  style={{ height: "18px" }}
                />
                Sign in with Facebook
              </button>
            </div>

            <div className="signin">
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </div>
          </div>
        </div>

        <div className="right">
          <video
            className="hero-video"
            autoPlay
            loop
            playsInline
            volume="0.5"
            poster="/assets/poster.jpg"
            onLoadedMetadata={(e) => (e.target.volume = 0.5)}
          >
            <source
              src="/assets/Welcome to Karnataka _ One State Many Worlds.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
          <div className="video-overlay"></div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
