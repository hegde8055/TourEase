// /client/src/pages/SignUp.js
import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { authAPI } from "../utils/api";
import { setToken, setUsername, setSessionKey } from "../utils/auth";
import { useAuth } from "../App";
import "../auth.css";

const INITIAL_FORM = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const evaluatePassword = (password) => {
  if (!password) {
    return {
      strength: { label: "", variant: "pw-veryweak", width: 0 },
      feedback: [],
    };
  }

  const feedback = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("Use at least 8 characters");
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add an uppercase letter");
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Include a number");
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Include a symbol");
  }

  const strength = (() => {
    if (score >= 4) {
      return { label: "Strong password", variant: "pw-strong", width: 100 };
    }
    if (score === 3) {
      return { label: "Good password", variant: "pw-good", width: 75 };
    }
    if (score === 2) {
      return { label: "Fair password", variant: "pw-weak", width: 50 };
    }
    return { label: "Weak password", variant: "pw-veryweak", width: 25 };
  })();

  return { strength, feedback };
};

const SignUp = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [acknowledgePrivacy, setAcknowledgePrivacy] = useState(false);
  const [acceptCookies, setAcceptCookies] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setFormData((prev) => ({ ...prev, email: location.state.email }));
    }
    setError("");
  }, [location.state?.email]);

  const { strength: passwordStrength, feedback: passwordFeedback } = useMemo(
    () => evaluatePassword(formData.password),
    [formData.password]
  );

  const passwordsMismatch =
    formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!agreeToTerms || !acknowledgePrivacy || !acceptCookies) {
      setError("Please accept the required policies before continuing.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please check and try again.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        marketingOptIn,
      };

      const response = await authAPI.register(payload);

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
      const errorMessage = err.response?.data?.error || "Failed to sign up. Please try again.";

      if (
        errorMessage.toLowerCase().includes("email") &&
        errorMessage.toLowerCase().includes("registered")
      ) {
        setError("That email is already registered. Try signing in or use another email.");
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
          <div className="form-container">
            <div className="logo">
              <span>Tour</span>
              <span>Ease</span>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  key="signup-error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  style={{
                    background: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.35)",
                    color: "#fca5a5",
                    padding: "12px",
                    borderRadius: "10px",
                    marginBottom: "16px",
                    textAlign: "center",
                    fontWeight: 600,
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form id="signupForm" onSubmit={handleSubmit}>
              <label htmlFor="signupUsername">Username</label>
              <input
                id="signupUsername"
                name="username"
                type="text"
                placeholder="Choose a unique username"
                value={formData.username}
                onChange={handleChange}
                required
                autoComplete="username"
              />

              <label htmlFor="signupEmail">Email address</label>
              <input
                id="signupEmail"
                name="email"
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />

              <label htmlFor="signupPassword">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="signupPassword"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  aria-describedby="passwordStrengthLabel"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
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

              <div className="pw-wrap">
                <div className="pw-meter-bg">
                  <div
                    className={`pw-meter ${passwordStrength.variant}`}
                    style={{ width: `${passwordStrength.width}%` }}
                  ></div>
                </div>
                <div id="passwordStrengthLabel" className="pw-label">
                  {passwordStrength.label}
                </div>
              </div>

              <AnimatePresence>
                {passwordFeedback.map((item) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}
                  >
                    - {item}
                  </motion.div>
                ))}
              </AnimatePresence>

              <label htmlFor="signupConfirmPassword">Confirm password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="signupConfirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
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
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              <AnimatePresence>
                {passwordsMismatch && (
                  <motion.div
                    key="password-mismatch"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    style={{ fontSize: "12px", color: "#f87171", marginTop: "6px", fontWeight: 600 }}
                  >
                    Passwords do not match.
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ marginTop: "18px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    marginBottom: "14px",
                    padding: "10px",
                    borderRadius: "8px",
                    transition: "background 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(event) => (event.currentTarget.style.background = "rgba(255, 255, 255, 0.03)")}
                  onMouseLeave={(event) => (event.currentTarget.style.background = "transparent")}
                >
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    checked={agreeToTerms}
                    onChange={(event) => setAgreeToTerms(event.target.checked)}
                    required
                    style={{
                      width: "18px",
                      height: "18px",
                      minWidth: "18px",
                      marginRight: "10px",
                      marginTop: "2px",
                      cursor: "pointer",
                      accentColor: "#d4af37",
                    }}
                  />
                  <label htmlFor="agreeToTerms" style={{ cursor: "pointer" }}>
                    I agree to the{" "}
                    <a
                      href="/terms-of-service"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}
                    >
                      TourEase Terms of Service
                    </a>
                    <span style={{ color: "#ef4444", marginLeft: "4px", fontWeight: 700 }}>*</span>
                  </label>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    marginBottom: "14px",
                    padding: "10px",
                    borderRadius: "8px",
                    transition: "background 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(event) => (event.currentTarget.style.background = "rgba(255, 255, 255, 0.03)")}
                  onMouseLeave={(event) => (event.currentTarget.style.background = "transparent")}
                >
                  <input
                    type="checkbox"
                    id="acknowledgePrivacy"
                    checked={acknowledgePrivacy}
                    onChange={(event) => setAcknowledgePrivacy(event.target.checked)}
                    required
                    style={{
                      width: "18px",
                      height: "18px",
                      minWidth: "18px",
                      marginRight: "10px",
                      marginTop: "2px",
                      cursor: "pointer",
                      accentColor: "#d4af37",
                    }}
                  />
                  <label htmlFor="acknowledgePrivacy" style={{ cursor: "pointer" }}>
                    I acknowledge the{" "}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}
                    >
                      Privacy Policy
                    </a>
                    <span style={{ color: "#ef4444", marginLeft: "4px", fontWeight: 700 }}>*</span>
                  </label>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    marginBottom: "14px",
                    padding: "10px",
                    borderRadius: "8px",
                    transition: "background 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(event) => (event.currentTarget.style.background = "rgba(255, 255, 255, 0.03)")}
                  onMouseLeave={(event) => (event.currentTarget.style.background = "transparent")}
                >
                  <input
                    type="checkbox"
                    id="acceptCookies"
                    checked={acceptCookies}
                    onChange={(event) => setAcceptCookies(event.target.checked)}
                    required
                    style={{
                      width: "18px",
                      height: "18px",
                      minWidth: "18px",
                      marginRight: "10px",
                      marginTop: "2px",
                      cursor: "pointer",
                      accentColor: "#d4af37",
                    }}
                  />
                  <label htmlFor="acceptCookies" style={{ cursor: "pointer" }}>
                    I accept the use of cookies as described in the{" "}
                    <a
                      href="/cookie-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}
                    >
                      Cookie Policy
                    </a>
                    <span style={{ color: "#ef4444", marginLeft: "4px", fontWeight: 700 }}>*</span>
                  </label>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                    padding: "10px",
                    borderRadius: "8px",
                    transition: "background 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(event) => (event.currentTarget.style.background = "rgba(255, 255, 255, 0.03)")}
                  onMouseLeave={(event) => (event.currentTarget.style.background = "transparent")}
                >
                  <input
                    type="checkbox"
                    id="marketingOptIn"
                    checked={marketingOptIn}
                    onChange={(event) => setMarketingOptIn(event.target.checked)}
                    style={{
                      width: "18px",
                      height: "18px",
                      minWidth: "18px",
                      marginRight: "10px",
                      marginTop: "2px",
                      cursor: "pointer",
                      accentColor: "#d4af37",
                    }}
                  />
                  <label htmlFor="marketingOptIn" style={{ cursor: "pointer", color: "#9ca3af" }}>
                    Keep me posted on new features, travel inspiration, and exclusive offers.
                  </label>
                </div>

                <div className="checkbox" style={{ marginTop: "16px" }}>
                  <div className="checkbox-left">
                    <input
                      type="checkbox"
                      id="signupRemember"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                    />
                    <label htmlFor="signupRemember">Remember me</label>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Creating Account..." : "Sign Up"}
              </button>
            </form>

            <div className="divider">or</div>

            <div className="social-buttons">
              <button type="button">
                <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" />
                Sign up with Google
              </button>
              <button type="button">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
                  alt="Facebook"
                  style={{ height: "18px" }}
                />
                Sign up with Facebook
              </button>
            </div>

            <div className="signin">
              Already have an account? <Link to="/signin">Sign In</Link>
            </div>
          </div>
        </div>

        <div className="right">
          <video
            className="hero-video"
            autoPlay
            loop
            playsInline
            muted
            onLoadedMetadata={(event) => {
              event.target.volume = 0.5;
            }}
          >
            <source src="/assets/Welcome to Karnataka _ One State Many Worlds.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="video-overlay"></div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
