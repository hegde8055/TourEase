// /client/src/pages/SignUp.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../utils/api";
import { setToken, setUsername } from "../utils/auth";
import { useAuth } from "../App";
import "../auth.css";
import { motion, AnimatePresence } from "framer-motion"; // Added for animations

const SignUp = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // --- ENHANCED PASSWORD STRENGTH STATE ---
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

  useEffect(() => {
    if (location.state?.email) {
      setFormData((prev) => ({ ...prev, email: location.state.email }));
    }
    setError("");
  }, [location.state]);

  const checkPasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    setPasswordChecks(checks); // Update detailed checks for the UI

    const score = Object.values(checks).filter(Boolean).length;

    const strengthLevels = [
      { color: "#ef4444" }, // Very Weak (Red)
      { color: "#ef4444" }, // Very Weak (Red)
      { color: "#f97316" }, // Weak (Orange)
      { color: "#f59e0b" }, // Medium (Amber)
      { color: "#eab308" }, // Strong (Yellow)
      { color: "#22c55e" }, // Very Strong (Green)
    ];

    setPasswordStrength({ score, color: strengthLevels[score].color });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "password") {
      if (value.length > 0) {
        checkPasswordStrength(value);
      } else {
        // Reset if password is empty
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (passwordStrength.score < 5) {
      setError("❌ Your password does not meet all the strength requirements.");
      setLoading(false);
      return;
    }

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
      });

      setToken(response.data.token, rememberMe);
      if (response.data.username) {
        setUsername(response.data.username, rememberMe);
      }

      login({ username: response.data.username });
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper component for rendering individual requirements
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
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <div className="left">
        <div className="form-container">
          <div className="logo">
            <span>Tour</span>
            <span>Ease</span>
          </div>
          {error && <div className="error-banner">{error}</div>}
          <form id="signupForm" onSubmit={handleSubmit}>
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <label>Email address</label>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            {/* --- ENHANCED PASSWORD STRENGTH VISUAL FEEDBACK --- */}
            <AnimatePresence>
              {formData.password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ marginTop: "8px", marginBottom: "12px", overflow: "hidden" }}
                >
                  <div style={{ display: "flex", gap: "4px", height: "5px", marginBottom: "10px" }}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        style={{
                          flex: 1,
                          height: "100%",
                          borderRadius: "2px",
                          backgroundColor:
                            level <= passwordStrength.score ? passwordStrength.color : "#e0e0e0",
                          transition: "background-color 0.3s ease",
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <Requirement met={passwordChecks.length} text="8+ characters" />
                    <Requirement met={passwordChecks.lowercase} text="Lowercase" />
                    <Requirement met={passwordChecks.uppercase} text="Uppercase" />
                    <Requirement met={passwordChecks.number} text="Number" />
                    <Requirement met={passwordChecks.special} text="Special char" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
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
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>
          <div className="divider">or</div>
          <div className="social-buttons">
            <button>
              <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" />
              Sign up with Google
            </button>
            <button>
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
          volume="0.5"
          onLoadedMetadata={(e) => (e.target.volume = 0.5)}
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
