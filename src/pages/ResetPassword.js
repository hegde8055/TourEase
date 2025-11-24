import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
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
      { label: "At least 8 characters", test: (value) => value.length >= 8 },
      { label: "One uppercase letter", test: (value) => /[A-Z]/.test(value) },
      { label: "One lowercase letter", test: (value) => /[a-z]/.test(value) },
      { label: "One number", test: (value) => /\d/.test(value) },
      { label: "One special character", test: (value) => /[^A-Za-z0-9]/.test(value) },
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Image */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/assets/uploads/5.jpg)", // Consistent with ForgotPassword
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
        }}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 41, 59, 0.88) 100%)",
          zIndex: 1,
        }}
      />

      <motion.div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 10,
          padding: "40px",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          style={{
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            border: "1px solid rgba(148, 163, 184, 0.3)",
            padding: "50px 40px",
            maxWidth: "500px",
            width: "100%",
            boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.6)",
          }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            style={{ display: "flex", justifyContent: "center", marginBottom: "25px" }}
            variants={itemVariants}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "40px",
              }}
            >
              🔒
            </div>
          </motion.div>

          <motion.h1
            style={{
              fontSize: "28px",
              fontWeight: "800",
              background: "linear-gradient(135deg, #60a5fa 0%, #93c5fd 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textAlign: "center",
              marginBottom: "10px",
            }}
            variants={itemVariants}
          >
            Set New Password
          </motion.h1>

          <motion.p
            style={{
              textAlign: "center",
              marginBottom: "30px",
              color: "#cbd5e1",
              fontSize: "0.95rem",
            }}
            variants={itemVariants}
          >
            {isTokenMode
              ? "You are using a secure link to reset your password."
              : "Enter your account email and the 6-digit reset PIN from Profile -> Security."}
          </motion.p>

          {error && (
            <motion.div
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                color: "#fca5a5",
                padding: "14px",
                borderRadius: "12px",
                marginBottom: "20px",
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          {message && (
            <motion.div
              style={{
                background: "rgba(34, 197, 94, 0.15)",
                color: "#86efac",
                padding: "14px",
                borderRadius: "12px",
                marginBottom: "20px",
                fontSize: "0.9rem",
                fontWeight: 600,
                textAlign: "center",
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {message}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            {!isTokenMode && (
              <>
                <motion.div variants={itemVariants} style={{ marginBottom: "16px" }}>
                  <label
                    htmlFor="email"
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "700",
                      color: "#e2e8f0",
                      fontSize: "0.9rem",
                    }}
                  >
                    Account Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your account email"
                    value={pinForm.email}
                    onChange={handlePinFormChange}
                    autoComplete="email"
                    required
                    className="auth-input"
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      background: "rgba(30, 41, 59, 0.6)",
                      border: "1.5px solid rgba(148, 163, 184, 0.3)",
                      borderRadius: "12px",
                      color: "#e2e8f0",
                      outline: "none",
                      transition: "all 0.2s",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#60a5fa";
                      e.target.style.boxShadow = "0 0 0 4px rgba(96, 165, 250, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(148, 163, 184, 0.3)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </motion.div>

                <motion.div variants={itemVariants} style={{ marginBottom: "16px" }}>
                  <label
                    htmlFor="pin"
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "700",
                      color: "#e2e8f0",
                      fontSize: "0.9rem",
                    }}
                  >
                    Reset PIN
                  </label>
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
                    className="auth-input"
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      background: "rgba(30, 41, 59, 0.6)",
                      border: "1.5px solid rgba(148, 163, 184, 0.3)",
                      borderRadius: "12px",
                      color: "#e2e8f0",
                      outline: "none",
                      transition: "all 0.2s",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#60a5fa";
                      e.target.style.boxShadow = "0 0 0 4px rgba(96, 165, 250, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(148, 163, 184, 0.3)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </motion.div>
              </>
            )}

            <motion.div variants={itemVariants} style={{ marginBottom: "16px" }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "700",
                  color: "#e2e8f0",
                  fontSize: "0.9rem",
                }}
              >
                New Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "rgba(30, 41, 59, 0.6)",
                  border: "1.5px solid rgba(148, 163, 184, 0.3)",
                  borderRadius: "12px",
                  color: "#e2e8f0",
                  outline: "none",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#60a5fa";
                  e.target.style.boxShadow = "0 0 0 4px rgba(96, 165, 250, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(148, 163, 184, 0.3)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </motion.div>

            <motion.div
              variants={itemVariants}
              style={{
                marginBottom: "20px",
                padding: "16px",
                background: "rgba(15,23,42,0.6)",
                borderRadius: "12px",
                border: "1px solid rgba(148, 163, 184, 0.2)",
              }}
            >
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "0.8rem",
                  marginBottom: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Password Requirements
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "8px" }}>
                {requirementStatus.map((rule) => (
                  <li
                    key={rule.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      color: rule.passed ? "#86efac" : "#94a3b8",
                      fontSize: "0.85rem",
                      transition: "color 0.2s",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: rule.passed
                          ? "rgba(34, 197, 94, 0.2)"
                          : "rgba(148, 163, 184, 0.2)",
                        color: rule.passed ? "#22c55e" : "#64748b",
                        fontSize: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      {rule.passed ? "✓" : "•"}
                    </span>
                    {rule.label}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={itemVariants} style={{ marginBottom: "24px" }}>
              <label
                htmlFor="confirmPassword"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "700",
                  color: "#e2e8f0",
                  fontSize: "0.9rem",
                }}
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="auth-input"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "rgba(30, 41, 59, 0.6)",
                  border: "1.5px solid rgba(148, 163, 184, 0.3)",
                  borderRadius: "12px",
                  color: "#e2e8f0",
                  outline: "none",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#60a5fa";
                  e.target.style.boxShadow = "0 0 0 4px rgba(96, 165, 250, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(148, 163, 184, 0.3)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </motion.div>

            <motion.button
              type="submit"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              style={{
                width: "100%",
                padding: "16px",
                fontSize: "1rem",
                fontWeight: "700",
                background: loading
                  ? "rgba(96, 165, 250, 0.6)"
                  : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "14px",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)",
              }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </motion.button>
          </form>

          <motion.div style={{ marginTop: "25px", textAlign: "center" }} variants={itemVariants}>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              style={{
                background: "transparent",
                border: "none",
                color: "#60a5fa",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "0.9rem",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#93c5fd")}
              onMouseLeave={(e) => (e.target.style.color = "#60a5fa")}
            >
              Need your PIN again?
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
