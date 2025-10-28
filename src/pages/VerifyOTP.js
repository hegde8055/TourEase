// /client/src/pages/VerifyOTP.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../utils/api";
import "../auth.css";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // Redirect if email is not available in state (e.g., direct navigation)
  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authAPI.verifyOTP({ email, otp });
      // On success, navigate to the reset password page
      navigate("/reset-password", { state: { email, otp } });
    } catch (err) {
      setError(err.response?.data?.error || "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="left">
        <div className="form-container">
          <div className="logo">
            <span>Verify</span>
            <span>Code</span>
          </div>
          <p style={{ textAlign: "center", marginBottom: "1.5rem", color: "#cbd5e1" }}>
            An OTP has been sent to {email}. Please enter it below.
          </p>
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="otp">One-Time Password (OTP)</label>
            <input
              id="otp"
              type="text"
              name="otp"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength="6"
            />
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
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

export default VerifyOTP;
