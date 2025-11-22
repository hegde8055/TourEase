// /client/src/pages/ResetPassword.js
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authAPI } from "../utils/api";
import "../auth.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pinForm, setPinForm] = useState({ email: "", pin: "" });
  const navigate = useNavigate();
  const { token } = useParams();
  const isTokenMode = Boolean(token);

  const passwordRequirements = useMemo(
    () => [
      {
        label: "At least 8 characters",
        test: (value) => value.length >= 8,
      },
      {
        label: "One uppercase letter",
        test: (value) => /[A-Z]/.test(value),
      },
      {
        label: "One lowercase letter",
        test: (value) => /[a-z]/.test(value),
      },
      {
        label: "One number",
        test: (value) => /\d/.test(value),
      },
      {
        label: "One special character",
        test: (value) => /[^A-Za-z0-9]/.test(value),
      },
    ],
    []
  );

  const requirementStatus = useMemo(
    () => passwordRequirements.map((rule) => ({ ...rule, passed: rule.test(password) })),
    [password, passwordRequirements]
  );

  const handlePinFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "pin") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 6);
      setPinForm((prev) => ({ ...prev, pin: digitsOnly }));
      return;
    }
    setPinForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    setError("");
    setMessage("");
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const unmet = requirementStatus.filter((rule) => !rule.passed).map((rule) => rule.label);
    if (unmet.length > 0) {
      setError(`Password must include: ${unmet.join(", ")}`);
      return;
    }
    if (!isTokenMode) {
      const trimmedEmail = pinForm.email.trim();
      const trimmedPin = pinForm.pin.trim();
      if (!trimmedEmail || !trimmedPin) {
        setError("Email and reset PIN are required.");
        return;
      }
      if (!/^[0-9]{6}$/.test(trimmedPin)) {
        setError("Reset PIN must be exactly 6 digits.");
        return;
      }
    }
    setLoading(true);
    setError("");
    setMessage("");

    try {
      let response;
      if (isTokenMode) {
        response = await authAPI.resetPassword(token, password);
      } else {
        response = await authAPI.resetPasswordWithPin({
          email: pinForm.email.trim(),
          pin: pinForm.pin.trim(),
          newPassword: password,
        });
      }
      const data = response?.data || response;
      setMessage(
        data?.message ||
          (isTokenMode
            ? "Password has been reset successfully!"
            : "Password updated. Sign in and open Profile -> Security to view your refreshed PIN.")
      );
      setTimeout(() => {
        navigate("/signin", { state: { resetSuccess: true } });
      }, 2200);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          (isTokenMode
            ? "Failed to reset password. The link may have expired."
            : "Unable to verify that email and PIN combination. Please try again.")
      );
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
          <p style={{ color: "#94a3b8", textAlign: "center", marginBottom: "1rem" }}>
            {isTokenMode
              ? "You are using an email link to finish resetting your password."
              : "Enter your account email and the 6-digit reset PIN from Profile -> Security."}
          </p>
          {error && <div className="error-banner">{error}</div>}
          {message && (
            <div style={{ color: "#22c55e", textAlign: "center", marginBottom: "1rem" }}>
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {!isTokenMode && (
              <>
                <label htmlFor="email">Account Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your account email"
                  value={pinForm.email}
                  onChange={handlePinFormChange}
                  autoComplete="email"
                  required
                />
                <label htmlFor="pin">Reset PIN</label>
                <input
                  id="pin"
                  type="text"
                  name="pin"
                  placeholder="6-digit PIN"
                  value={pinForm.pin}
                  onChange={handlePinFormChange}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoComplete="one-time-code"
                  required
                />
                <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "1rem" }}>
                  You can regenerate this PIN from Profile -> Security after you sign in.
                </p>
              </>
            )}
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
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.75rem",
                background: "rgba(15,23,42,0.55)",
                borderRadius: "10px",
              }}
            >
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                Your password must include:
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "6px" }}>
                {requirementStatus.map((rule) => (
                  <li
                    key={rule.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: rule.passed ? "#86efac" : "#fca5a5",
                      fontSize: "0.85rem",
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>{rule.passed ? "✓" : "•"}</span>
                    {rule.label}
                  </li>
                ))}
              </ul>
            </div>
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
          <div style={{ marginTop: "1.2rem", textAlign: "center" }}>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              style={{
                background: "transparent",
                border: "none",
                color: "#60a5fa",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Need your PIN again?
            </button>
          </div>
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
