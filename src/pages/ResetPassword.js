// /client/src/pages/ResetPassword.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../utils/api";
import "../auth.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract email and OTP from location state
  const email = location.state?.email;
  const otp = location.state?.otp;

  useEffect(() => {
    // Redirect if email or OTP are missing
    if (!email || !otp) {
      navigate("/forgot-password");
    }
  }, [email, otp, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await authAPI.resetPassword({ email, otp, password });
      setMessage(response.data.message || "Password has been reset successfully!");
      setTimeout(() => {
        navigate("/signin");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="left">
        <div className="form-container">
          <div className="logo">
            <span>Set New</span>
            <span>Password</span>
          </div>
          {error && <div className="error-banner">{error}</div>}
          {message && (
            <div style={{ color: "#22c55e", textAlign: "center", marginBottom: "1rem" }}>
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
      <div className="right">
        <video className="hero-video" autoPlay loop muted playsInline>
          <source src="/assets/Welcome to Karnataka _ One State Many Worlds.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay"></div>
      </div>
    </div>
  );
};

export default ResetPassword;
