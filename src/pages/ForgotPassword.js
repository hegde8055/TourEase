import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { authAPI } from "../utils/api";
import "../auth.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [fallbackStatus, setFallbackStatus] = useState({ type: "", message: "" });
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    hover: { y: -5, boxShadow: "0 20px 40px rgba(96, 165, 250, 0.2)" },
  };

  const iconVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } },
  };

  const successVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    setResetToken("");
    setLinkCopied(false);
    setFallbackStatus({ type: "", message: "" });

    try {
      const response = await authAPI.requestPasswordReset({ email, mode: "pin" });
      const data = response?.data || response;
      setSuccessMessage(
        data?.message ||
          "Sign in if possible and open Profile -> Security to view your 6-digit reset PIN."
      );
      setSubmittedEmail(email.trim());
      setIsSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "We could not process that request right now. Please try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!resetToken || typeof navigator === "undefined" || !navigator.clipboard) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const link = `${origin}/reset-password/${resetToken}`;
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2200);
    } catch (copyErr) {
      console.warn("Clipboard copy failed", copyErr);
    }
  };

  const handleSendFallbackEmail = async () => {
    if (!email) {
      setFallbackStatus({ type: "error", message: "Enter your account email first." });
      return;
    }
    setFallbackLoading(true);
    setFallbackStatus({ type: "", message: "" });
    try {
      const response = await authAPI.requestPasswordReset({ email, mode: "email" });
      const data = response?.data || response;
      if (data?._development_testing_token) {
        setResetToken(data._development_testing_token);
      }
      setFallbackStatus({
        type: "success",
        message:
          data?.message ||
          "If this email is registered, we just sent a backup link. Check your inbox or spam folder.",
      });
    } catch (err) {
      setFallbackStatus({
        type: "error",
        message:
          err.response?.data?.error ||
          "We could not send the backup email right now. Please try again shortly.",
      });
    } finally {
      setFallbackLoading(false);
    }
  };

  const features = [
    {
      icon: "🔐",
      title: "Bank-Level Security",
      description: "Encrypted password reset",
      color: "#3b82f6",
    },
    {
      icon: "⚡",
      title: "Instant Verification",
      description: "Quick OTP verification",
      color: "#10b981",
    },
    {
      icon: "🛡️",
      title: "Protected Data",
      description: "Data never stored or shared",
      color: "#f59e0b",
    },
  ];

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
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/assets/uploads/5.jpg)",
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
            padding: "70px 60px",
            maxWidth: "480px",
            width: "100%",
            boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.6)",
          }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {!isSubmitted ? (
            <>
              <motion.div
                style={{ display: "flex", justifyContent: "center", marginBottom: "35px" }}
                variants={iconVariants}
              >
                <div
                  style={{
                    width: "90px",
                    height: "90px",
                    background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "48px",
                  }}
                >
                  🔑
                </div>
              </motion.div>
              <motion.h1
                style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  background: "linear-gradient(135deg, #60a5fa 0%, #93c5fd 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textAlign: "center",
                }}
                variants={itemVariants}
              >
                Reset Password
              </motion.h1>
              <motion.p
                style={{ textAlign: "center", marginBottom: "40px", color: "#cbd5e1" }}
                variants={itemVariants}
              >
                Enter your email and we will remind you how to reset your password using your
                personal 6-digit PIN. You can still request an email link afterward.
              </motion.p>
              {error && (
                <motion.div
                  style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    color: "#fca5a5",
                    padding: "16px",
                    borderRadius: "14px",
                    marginBottom: "25px",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {error}
                </motion.div>
              )}
              <motion.form onSubmit={handleSubmit} variants={itemVariants}>
                <label
                  htmlFor="email"
                  style={{
                    display: "block",
                    marginBottom: "12px",
                    fontWeight: "700",
                    color: "#e2e8f0",
                  }}
                >
                  Email Address
                </label>
                <motion.input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "16px 18px",
                    background: "rgba(30, 41, 59, 0.6)",
                    border: "1.5px solid rgba(148, 163, 184, 0.3)",
                    borderRadius: "14px",
                    color: "#e2e8f0",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#60a5fa";
                    e.target.style.boxShadow = "0 0 25px rgba(96, 165, 250, 0.3)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(148, 163, 184, 0.3)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <motion.button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "16px",
                    marginTop: "25px",
                    fontSize: "1.05rem",
                    fontWeight: "800",
                    background: loading
                      ? "rgba(96, 165, 250, 0.6)"
                      : "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "14px",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                  whileHover={{ transform: "translateY(-3px)" }}
                >
                  {loading ? "Preparing..." : "Show PIN Instructions"}
                </motion.button>
              </motion.form>
              <motion.div
                style={{ textAlign: "center", marginTop: "25px" }}
                variants={itemVariants}
              >
                <a
                  href="/signin"
                  style={{ color: "#60a5fa", textDecoration: "none", fontWeight: "600" }}
                  onMouseEnter={(e) => (e.target.style.color = "#93c5fd")}
                  onMouseLeave={(e) => (e.target.style.color = "#60a5fa")}
                >
                  Back to Sign In
                </a>
              </motion.div>
            </>
          ) : (
            <motion.div style={{ textAlign: "center" }} variants={containerVariants}>
              <motion.div
                style={{
                  width: "110px",
                  height: "110px",
                  background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "56px",
                  margin: "0 auto 30px",
                }}
                variants={successVariants}
              >
                ✓
              </motion.div>
              <motion.h2
                style={{ fontSize: "28px", fontWeight: "800", color: "#22c55e" }}
                variants={itemVariants}
              >
                Use Your Reset PIN
              </motion.h2>
              <motion.p style={{ color: "#cbd5e1", marginBottom: "24px" }} variants={itemVariants}>
                {successMessage ||
                  "Visit the Profile -> Security section to view your 6-digit PIN, then reset your password below."}
              </motion.p>
              {submittedEmail && (
                <motion.div
                  style={{
                    margin: "0 auto 20px",
                    padding: "14px",
                    width: "100%",
                    maxWidth: "320px",
                    borderRadius: "12px",
                    background: "rgba(59, 130, 246, 0.12)",
                    border: "1px solid rgba(59, 130, 246, 0.32)",
                    color: "#bfdbfe",
                    fontWeight: 600,
                  }}
                  variants={itemVariants}
                >
                  {submittedEmail}
                </motion.div>
              )}
              <motion.div
                style={{
                  textAlign: "left",
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(148, 163, 184, 0.28)",
                  borderRadius: "14px",
                  padding: "18px 20px",
                  color: "#e2e8f0",
                  marginBottom: "24px",
                }}
                variants={itemVariants}
              >
                <div style={{ fontWeight: 700, marginBottom: "10px" }}>Quick steps</div>
                <div style={{ display: "grid", gap: "10px", fontSize: "0.95rem" }}>
                  <div>1. Open the reset page using the button below.</div>
                  <div>
                    2. Enter your account email and the 6-digit PIN from Profile -> Security.
                  </div>
                  <div>3. Choose a strong new password and sign back in.</div>
                </div>
              </motion.div>
              <motion.div
                style={{ display: "flex", gap: "12px", justifyContent: "center" }}
                variants={itemVariants}
              >
                <motion.button
                  type="button"
                  onClick={() => navigate("/reset-password")}
                  whileHover={{ scale: 1.03 }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                    color: "#f8fafc",
                  }}
                >
                  Open Reset Page
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => navigate("/signin")}
                  whileHover={{ scale: 1.03 }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid rgba(96, 165, 250, 0.4)",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: "rgba(30, 41, 59, 0.75)",
                    color: "#bfdbfe",
                  }}
                >
                  Go to Sign In
                </motion.button>
              </motion.div>
              <motion.div style={{ marginTop: "28px" }} variants={itemVariants}>
                <p style={{ color: "#94a3b8", marginBottom: "12px" }}>
                  Prefer an email link instead? We can still send you one.
                </p>
                {fallbackStatus.message && (
                  <div
                    style={{
                      marginBottom: "16px",
                      padding: "14px",
                      borderRadius: "12px",
                      border:
                        fallbackStatus.type === "success"
                          ? "1px solid rgba(34,197,94,0.4)"
                          : "1px solid rgba(239,68,68,0.35)",
                      background:
                        fallbackStatus.type === "success"
                          ? "rgba(34,197,94,0.12)"
                          : "rgba(239,68,68,0.12)",
                      color: fallbackStatus.type === "success" ? "#86efac" : "#fda4af",
                      fontWeight: 600,
                    }}
                  >
                    {fallbackStatus.message}
                  </div>
                )}
                <motion.button
                  type="button"
                  onClick={handleSendFallbackEmail}
                  whileHover={{ scale: fallbackLoading ? 1 : 1.02 }}
                  disabled={fallbackLoading}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "12px",
                    border: "none",
                    fontWeight: 700,
                    cursor: fallbackLoading ? "not-allowed" : "pointer",
                    background: fallbackLoading
                      ? "rgba(96, 165, 250, 0.45)"
                      : "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
                    color: "#f8fafc",
                  }}
                >
                  {fallbackLoading ? "Sending..." : "Send Fallback Email"}
                </motion.button>
              </motion.div>
              {resetToken && (
                <motion.div
                  style={{
                    marginTop: "24px",
                    padding: "18px",
                    background: "rgba(59, 130, 246, 0.12)",
                    border: "1px solid rgba(59, 130, 246, 0.32)",
                    borderRadius: "14px",
                    textAlign: "left",
                  }}
                  variants={itemVariants}
                >
                  <p style={{ color: "#93c5fd", fontWeight: 600, marginBottom: "8px" }}>
                    Developer testing token
                  </p>
                  <code
                    style={{
                      display: "block",
                      wordBreak: "break-all",
                      background: "rgba(15, 23, 42, 0.65)",
                      padding: "12px",
                      borderRadius: "10px",
                      color: "#e2e8f0",
                    }}
                  >
                    {resetToken}
                  </code>
                  <div style={{ display: "flex", gap: "12px", marginTop: "14px" }}>
                    <motion.button
                      type="button"
                      onClick={() => navigate(`/reset-password/${resetToken}`)}
                      whileHover={{ scale: 1.03 }}
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: "10px",
                        border: "none",
                        fontWeight: 600,
                        cursor: "pointer",
                        background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                        color: "#f8fafc",
                      }}
                    >
                      Open Email Reset Link
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={handleCopyLink}
                      whileHover={{ scale: 1.03 }}
                      style={{
                        padding: "12px 16px",
                        borderRadius: "10px",
                        border: "1px solid rgba(96, 165, 250, 0.45)",
                        background: "rgba(30, 41, 59, 0.75)",
                        color: "#bfdbfe",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {linkCopied ? "Copied!" : "Copy reset link"}
                    </motion.button>
                  </div>
                  <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "10px" }}>
                    Share this token only with the account owner. Tokens expire in roughly one hour.
                  </p>
                </motion.div>
              )}
              <motion.div
                style={{ textAlign: "center", marginTop: "25px" }}
                variants={itemVariants}
              >
                <a
                  href="/signin"
                  style={{ color: "#60a5fa", textDecoration: "none", fontWeight: "600" }}
                  onMouseEnter={(e) => (e.target.style.color = "#93c5fd")}
                  onMouseLeave={(e) => (e.target.style.color = "#60a5fa")}
                >
                  Back to Sign In
                </a>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      <motion.div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 10,
          padding: "60px 40px",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          style={{ maxWidth: "420px", width: "100%" }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            style={{
              fontSize: "28px",
              fontWeight: "800",
              background: "linear-gradient(135deg, #60a5fa 0%, #93c5fd 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "40px",
              textAlign: "center",
            }}
            variants={itemVariants}
          >
            Why Choose TourEase?
          </motion.h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={cardVariants}
                style={{
                  background: "rgba(30, 41, 59, 0.6)",
                  backdropFilter: "blur(15px)",
                  border: `1.5px solid ${f.color}30`,
                  borderRadius: "16px",
                  padding: "24px",
                }}
                whileHover="hover"
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                  <div style={{ fontSize: "40px", minWidth: "50px" }}>{f.icon}</div>
                  <div>
                    <h3
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "700",
                        color: f.color,
                        marginBottom: "6px",
                      }}
                    >
                      {f.title}
                    </h3>
                    <p style={{ fontSize: "0.9rem", color: "#cbd5e1" }}>{f.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div
            style={{
              marginTop: "50px",
              padding: "24px",
              background: "rgba(22, 163, 74, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              borderRadius: "16px",
              textAlign: "center",
            }}
            variants={itemVariants}
          >
            <p style={{ color: "#86efac" }}>✈️ Your security is our priority 🌍</p>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ position: "absolute", bottom: "80px", right: "60px", fontSize: "3rem", zIndex: 5 }}
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        ✈️
      </motion.div>
      <motion.div
        style={{
          position: "absolute",
          top: "100px",
          right: "100px",
          fontSize: "2.5rem",
          zIndex: 5,
        }}
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
      >
        🌍
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
