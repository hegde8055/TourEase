// /client/src/pages/SignUp.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../utils/api";
import { setToken, setUsername, setSessionKey } from "../utils/auth";
import { useAuth } from "../App";
import "../auth.css";
import { motion, AnimatePresence } from "framer-motion";

const SignUp = () => {
  const { login } = useAuth();

  // Form data state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // UI states
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Policy checkboxes states
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [acknowledgePrivacy, setAcknowledgePrivacy] = useState(false);
  const [acceptCookies, setAcceptCookies] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    color: "#666",
  });

  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Effect hook for initial setup
  useEffect(() => {
    if (location.state?.email) {
      setFormData((prev) => ({ ...prev, email: location.state.email }));
    }
    setError("");
  }, [location.state]);

  // Password strength checker function
  const checkPasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    setPasswordChecks(checks);

    const score = Object.values(checks).filter(Boolean).length;

    const strengthLevels = [
      { color: "#ef4444" }, // Red
      { color: "#ef4444" }, // Red
      { color: "#f97316" }, // Orange
      { color: "#f59e0b" }, // Amber
      { color: "#eab308" }, // Yellow
      { color: "#22c55e" }, // Green
    ];

    setPasswordStrength({
      score,
      color: strengthLevels[score].color,
    });
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "password") {
      if (value.length > 0) {
        checkPasswordStrength(value);
      } else {
        setPasswordStrength({ score: 0, color: "#666" });
        setPasswordChecks({
          length: false,
          lowercase: false,
          uppercase: false,
          number: false,
          special: false,
        });
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation: Check required policies
    if (!agreeToTerms) {
      setError("❌ You must agree to the Terms of Service to sign up.");
      setLoading(false);
      return;
    }

    if (!acknowledgePrivacy) {
      setError("❌ You must acknowledge the Privacy Policy to sign up.");
      setLoading(false);
      return;
    }

    if (!acceptCookies) {
      setError("❌ You must accept the Cookie Policy to sign up.");
      setLoading(false);
      return;
    }

    // Validation: Check password strength
    if (passwordStrength.score < 5) {
      setError("❌ Your password does not meet all the strength requirements.");
      setLoading(false);
      return;
    }

    // Validation: Check password match
    if (formData.password !== formData.confirmPassword) {
      setError("❌ Passwords do not match! Please make sure both passwords are identical.");
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        marketingOptIn: marketingOptIn,
      });

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

      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper component for password requirements
  const Requirement = ({ met, text }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "12px",
        color: met ? "#22c55e" : "#9ca3af",
      }}
    >
      <span>{met ? "✓" : "✗"}</span>
      <span>{text}</span>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", marginTop: "-90px" }}>
      <div className="left">
        <div className="form-container">
          <div className="logo">
            <span>Tour</span>
            <span>Ease</span>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <form id="signupForm" onSubmit={handleSubmit}>
            {/* Username Field */}
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />

            {/* Email Field */}
            <label>Email address</label>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
            />

            {/* Password Field */}
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            {/* Password Strength Indicator */}
            <AnimatePresence>
              {formData.password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    marginTop: "12px",
                    padding: "12px",
                    borderRadius: "8px",
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      marginBottom: "12px",
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    Password Strength
                  </div>
                  <div
                    style={{
                      height: "6px",
                      backgroundColor: "#e5e7eb",
                      borderRadius: "3px",
                      overflow: "hidden",
                      marginBottom: "12px",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor: passwordStrength.color,
                      }}
                      transition={{ duration: 0.3 }}
                      style={{ height: "100%" }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <Requirement met={passwordChecks.length} text="At least 8 characters" />
                    <Requirement met={passwordChecks.lowercase} text="One lowercase letter" />
                    <Requirement met={passwordChecks.uppercase} text="One uppercase letter" />
                    <Requirement met={passwordChecks.number} text="One number" />
                    <Requirement met={passwordChecks.special} text="One special character" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Confirm Password Field */}
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            {/* POLICY CHECKBOXES SECTION */}
            <div style={{ marginTop: "20px", marginBottom: "10px" }}>
              {/* Terms of Service - REQUIRED */}
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
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
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
                <label
                  htmlFor="agreeToTerms"
                  style={{
                    fontSize: "13px",
                    lineHeight: "1.5",
                    color: "#cbd5e1",
                    cursor: "pointer",
                    margin: 0,
                    userSelect: "none",
                  }}
                >
                  I agree to the{" "}
                  <a
                    href="/terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#3b82f6",
                      textDecoration: "none",
                      fontWeight: "600",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = "#60a5fa";
                      e.target.style.textDecoration = "underline";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = "#3b82f6";
                      e.target.style.textDecoration = "none";
                    }}
                  >
                    TourEase Terms of Service
                  </a>
                  <span style={{ color: "#ef4444", marginLeft: "2px", fontWeight: "700" }}>*</span>
                </label>
              </div>

              {/* Privacy Policy - REQUIRED */}
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
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <input
                  type="checkbox"
                  id="acknowledgePrivacy"
                  checked={acknowledgePrivacy}
                  onChange={(e) => setAcknowledgePrivacy(e.target.checked)}
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
                <label
                  htmlFor="acknowledgePrivacy"
                  style={{
                    fontSize: "13px",
                    lineHeight: "1.5",
                    color: "#cbd5e1",
                    cursor: "pointer",
                    margin: 0,
                    userSelect: "none",
                  }}
                >
                  I acknowledge the{" "}
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#3b82f6",
                      textDecoration: "none",
                      fontWeight: "600",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = "#60a5fa";
                      e.target.style.textDecoration = "underline";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = "#3b82f6";
                      e.target.style.textDecoration = "none";
                    }}
                  >
                    Privacy Policy
                  </a>
                  <span style={{ color: "#ef4444", marginLeft: "2px", fontWeight: "700" }}>*</span>
                </label>
              </div>

              {/* Cookie Policy - REQUIRED */}
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
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <input
                  type="checkbox"
                  id="acceptCookies"
                  checked={acceptCookies}
                  onChange={(e) => setAcceptCookies(e.target.checked)}
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
                <label
                  htmlFor="acceptCookies"
                  style={{
                    fontSize: "13px",
                    lineHeight: "1.5",
                    color: "#cbd5e1",
                    cursor: "pointer",
                    margin: 0,
                    userSelect: "none",
                  }}
                >
                  I accept the use of cookies as described in the{" "}
                  <a
                    href="/cookie-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#3b82f6",
                      textDecoration: "none",
                      fontWeight: "600",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = "#60a5fa";
                      e.target.style.textDecoration = "underline";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = "#3b82f6";
                      e.target.style.textDecoration = "none";
                    }}
                  >
                    Cookie Policy
                  </a>
                  <span style={{ color: "#ef4444", marginLeft: "2px", fontWeight: "700" }}>*</span>
                </label>
              </div>

              {/* Marketing Opt-in - OPTIONAL */}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                  const label = e.currentTarget.querySelector("label");
                  if (label) label.style.color = "#cbd5e1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  const label = e.currentTarget.querySelector("label");
                  if (label) label.style.color = "#9ca3af";
                }}
              >
                <input
                  type="checkbox"
                  id="marketingOptIn"
                  checked={marketingOptIn}
                  onChange={(e) => setMarketingOptIn(e.target.checked)}
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
                <label
                  htmlFor="marketingOptIn"
                  style={{
                    fontSize: "13px",
                    lineHeight: "1.5",
                    color: "#9ca3af",
                    cursor: "pointer",
                    margin: 0,
                    userSelect: "none",
                    transition: "color 0.2s ease",
                  }}
                >
                  I would like to receive occasional emails about new features, promotions, and tips
                  (optional)
                </label>
              </div>

              {/* Remember Me Checkbox */}
              <div className="checkbox">
                <div className="checkbox-left">
                  <input
                    type="checkbox"
                    id="rememberMeSignup"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="rememberMeSignup">Remember me</label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">or</div>

          {/* Social Login Buttons */}
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

          {/* Sign In Link */}
          <div className="signin">
            Already have an account? <Link to="/signin">Sign In</Link>
          </div>
        </div>
      </div>

      {/* Right Video Section */}
      <div className="right">
        <video
          className="hero-video"
          autoPlay
          loop
          playsInline
          muted
          onLoadedMetadata={(e) => {
            e.target.volume = 0.5;
          }}
        >
          <source src="/assets/Welcome to Karnataka _ One State Many Worlds.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="video-overlay"></div>
      </div>
    </div>
  );
};

export default SignUp;
