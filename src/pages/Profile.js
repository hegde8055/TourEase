import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { profileAPI, getImageUrl } from "../utils/api";
import { isAuthenticated } from "../utils/auth";
//import { aboutFeatures } from "../utils/aboutContent";
import ImageUploadModal from "../components/ImageUploadModal";
import { useAuth } from "../App";
import { useInView } from "react-intersection-observer";

const PROFILE_TABS = ["profile", "about", "contact"];

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout: contextLogout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ username: "", about: "" });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);

  const tabControlsRef = useRef(null);
  const aboutSectionRef = useRef(null);
  const contactSectionRef = useRef(null);
  const [contactInViewRef, contactInView] = useInView({ triggerOnce: true, threshold: 0.15 });
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [contactStatus, setContactStatus] = useState({ type: "", message: "" });
  const [contactLoading, setContactLoading] = useState(false);
  const [stats, setStats] = useState({ visited: 0, reviews: 0, photos: 0 });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStatus, setPasswordStatus] = useState({ type: "", message: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showResetPin, setShowResetPin] = useState(false);
  const [pinStatus, setPinStatus] = useState({ type: "", message: "" });
  const [refreshingPin, setRefreshingPin] = useState(false);
  const passwordRules = useMemo(
    () => [
      { label: "At least 8 characters", test: (value) => value.length >= 8 },
      { label: "One uppercase letter", test: (value) => /[A-Z]/.test(value) },
      { label: "One lowercase letter", test: (value) => /[a-z]/.test(value) },
      { label: "One number", test: (value) => /\d/.test(value) },
      { label: "One special character", test: (value) => /[^A-Za-z0-9]/.test(value) },
    ],
    []
  );
  const passwordRuleStatus = useMemo(
    () => passwordRules.map((rule) => ({ ...rule, passed: rule.test(passwordForm.newPassword) })),
    [passwordRules, passwordForm.newPassword]
  );
  const formatDateTime = useCallback((value, fallback = "Not set") => {
    if (!value) return fallback;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;
    return date.toLocaleString();
  }, []);
  const profileImageSrc = profile?.profile_photo_url
    ? getImageUrl(profile.profile_photo_url)
    : profile?.profile_photo_base64 || null;

  const handleTabChange = useCallback(
    (tabId) => {
      if (tabId === "about") {
        navigate("/about");
        return;
      }

      if (!PROFILE_TABS.includes(tabId)) return;
      setActiveTab(tabId);
      const search = tabId === "profile" ? "" : `?tab=${tabId}`;
      navigate({ pathname: location.pathname || "/profile", search }, { replace: true });
    },
    [navigate, location.pathname]
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab")?.toLowerCase();
    const nextTab = tabParam && PROFILE_TABS.includes(tabParam) ? tabParam : "profile";
    if (nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
  }, [location.search, activeTab]);

  useEffect(() => {
    if (loading) return;

    if (!tabControlsRef.current || (activeTab !== "about" && activeTab !== "contact")) return;

    const targetRef =
      activeTab === "about"
        ? aboutSectionRef.current
        : activeTab === "contact"
          ? contactSectionRef.current
          : null;

    if (!targetRef) return;

    const scrollWithOffset = () => {
      const headerOffset = window.innerWidth < 768 ? 100 : 140;
      const controlsTop = tabControlsRef.current.getBoundingClientRect().top + window.scrollY;
      const targetTop = targetRef.getBoundingClientRect().top + window.scrollY;
      const desiredTop = Math.min(controlsTop, targetTop) - headerOffset;

      window.scrollTo({ top: desiredTop, behavior: "smooth" });
    };

    const timeoutId = window.setTimeout(scrollWithOffset, 120);
    return () => window.clearTimeout(timeoutId);
  }, [activeTab, loading]);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getProfile();
      const userProfile = response.data;
      setProfile(userProfile);
      setFormData({ username: userProfile.username || "", about: userProfile.about || "" });
      setShowResetPin(false);
      setPinStatus({ type: "", message: "" });
    } catch (error) {
      console.error("Error loading profile:", error);
      if (error.response?.status === 401) navigate("/signin");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Ensure user is authenticated and load profile on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/signin");
      return;
    }
    loadProfile();
  }, [navigate, loadProfile]);



  // Demo stats loader
  useEffect(() => {
    const timer = setTimeout(() => setStats({ visited: 12, reviews: 8, photos: 24 }), 500);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    const sectionOffset = window.innerWidth < 768 ? 80 : 130;
    window.scrollTo({
      top: sectionOffset,
      behavior: "smooth",
    });
  }, [activeTab]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await profileAPI.updateProfile(formData);
      setEditing(false);
      loadProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error.response?.data?.error || "Failed to update profile.");
    }
  };

  const toggleResetPinVisibility = () => {
    setShowResetPin((prev) => !prev);
  };

  const handleRegeneratePin = async () => {
    if (refreshingPin) return;
    setRefreshingPin(true);
    setPinStatus({ type: "", message: "" });
    try {
      const response = await profileAPI.refreshResetPin();
      const data = response.data || {};
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              resetPin: data.resetPin ?? prev.resetPin,
              resetPinIssuedAt: data.issuedAt ?? prev.resetPinIssuedAt,
              resetPinLastUsedAt: data.lastUsedAt ?? prev.resetPinLastUsedAt,
            }
          : prev
      );
      setPinStatus({
        type: "success",
        message: data.message || "Reset PIN refreshed successfully.",
      });
      setShowResetPin(true);
    } catch (error) {
      console.error("Error refreshing reset PIN:", error);
      setPinStatus({
        type: "error",
        message: error.response?.data?.error || "Failed to refresh reset PIN.",
      });
    } finally {
      setRefreshingPin(false);
    }
  };

  const openUploadModal = () => {
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
  };

  const handleUploadSuccess = () => {
    loadProfile();
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactLoading(true);
    setContactStatus({ type: "", message: "" });

    const { name, email, subject, message } = contactForm;
    const safeSubject = subject?.trim() ? subject.trim() : "TourEase Contact";
    const bodyLines = [
      name?.trim() ? `Name: ${name.trim()}` : "Name: (not provided)",
      email?.trim() ? `Email: ${email.trim()}` : "Email: (not provided)",
      "",
      message?.trim() ? message.trim() : "",
    ].join("\n");
    const encodedSubject = encodeURIComponent(safeSubject);
    const encodedBody = encodeURIComponent(bodyLines);
    const gmailUrl =
      "https://mail.google.com/mail/?view=cm&fs=1&to=shridharh303@gmail.com&su=" +
      `${encodedSubject}&body=${encodedBody}`;
    const mailtoUrl = `mailto:shridharh303@gmail.com?subject=${encodedSubject}&body=${encodedBody}`;

    const popup = window.open(gmailUrl, "_blank", "noopener,noreferrer");
    if (!popup) {
      window.location.href = mailtoUrl;
    }

    setContactStatus({
      type: "success",
      message:
        "Opening Gmail compose window. If it doesn't open, email us at shridharh303@gmail.com.",
    });
    setContactForm({ name: "", email: "", subject: "", message: "" });
    setContactLoading(false);
  };

  const handlePasswordInputChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (passwordStatus.type) {
      setPasswordStatus({ type: "", message: "" });
    }
  };

  const submitPasswordChange = async (event) => {
    event.preventDefault();
    if (passwordLoading) return;

    setPasswordStatus({ type: "", message: "" });
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus({ type: "error", message: "Please fill out all password fields." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", message: "New password and confirmation do not match." });
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordStatus({
        type: "error",
        message: "New password must be different from your current password.",
      });
      return;
    }
    if (passwordRuleStatus.some((rule) => !rule.passed)) {
      setPasswordStatus({
        type: "error",
        message: "New password must meet all listed requirements.",
      });
      return;
    }

    setPasswordLoading(true);
    try {
      await profileAPI.changePassword({
        currentPassword,
        newPassword,
      });
      setPasswordStatus({ type: "success", message: "Password updated successfully." });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordStatus({
        type: "error",
        message: err.response?.data?.error || "Failed to update password. Please try again.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await contextLogout?.();
    } finally {
      navigate("/");
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  };

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          paddingTop: "140px",
          paddingBottom: "60px",
          background:
            "radial-gradient(ellipse at top, rgba(59,130,246,0.15), transparent 50%), radial-gradient(ellipse at bottom, rgba(212,175,55,0.15), transparent 50%)",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 20px" }}>
          {loading && (
            <div style={{ textAlign: "center", color: "#d4af37", fontSize: "1.5rem" }}>
              Loading Profile...
            </div>
          )}
          {!loading && !profile && (
            <div style={{ textAlign: "center", color: "#ef4444", fontSize: "1.5rem" }}>
              Could not load profile. Please try refreshing.
            </div>
          )}
          {!loading && profile && (
            <>
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{
                  background: "var(--glass)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "24px",
                  padding: "40px",
                  marginBottom: "40px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <motion.div
                  animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
                  transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(45deg, rgba(212,175,55,0.05) 0%, transparent 50%, rgba(59,130,246,0.05) 100%)",
                    backgroundSize: "200% 200%",
                    zIndex: 0,
                  }}
                />
                <div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    gap: "30px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    style={{ position: "relative" }}
                  >
                    {profileImageSrc ? (
                      <img
                        src={profileImageSrc}
                        alt="Profile"
                        onClick={() => setShowPhotoPreview(true)}
                        style={{
                          width: "160px",
                          height: "160px",
                          borderRadius: "50%",
                          border: "5px solid #d4af37",
                          objectFit: "cover",
                          boxShadow: "0 10px 40px rgba(212, 175, 55, 0.4)",
                          cursor: "zoom-in",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "160px",
                          height: "160px",
                          borderRadius: "50%",
                          border: "5px solid #d4af37",
                          background: "linear-gradient(135deg, #d4af37, #f4d03f)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "4rem",
                          fontWeight: "700",
                          color: "#0b0e14",
                          boxShadow: "0 10px 40px rgba(212, 175, 55, 0.4)",
                        }}
                      >
                        {profile?.username?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={openUploadModal}
                      style={{
                        position: "absolute",
                        bottom: "5px",
                        right: "5px",
                        width: "45px",
                        height: "45px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #d4af37, #f7ef8a)",
                        border: "3px solid #0b0e14",
                        color: "#0b0e14",
                        fontSize: "1.3rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 6px 18px rgba(212, 175, 55, 0.45)",
                      }}
                    >
                      📷
                    </motion.button>
                  </motion.div>
                  <div style={{ flex: 1, minWidth: "300px" }}>
                    <motion.h1
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      style={{
                        fontSize: "2.5rem",
                        marginBottom: "8px",
                        background: "linear-gradient(135deg, #d4af37, #3b82f6)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontWeight: "800",
                      }}
                    >
                      {profile.username}
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      style={{ color: "#9ca3af", fontSize: "1.1rem", marginBottom: "20px" }}
                    >
                      {profile.email}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      style={{ display: "flex", gap: "25px", flexWrap: "wrap" }}
                    >
                      {[
                        { label: "Visited", value: stats.visited, icon: "🗺️" },
                        { label: "Reviews", value: stats.reviews, icon: "⭐" },
                        { label: "Photos", value: stats.photos, icon: "📸" },
                      ].map((stat, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 + idx * 0.1, type: "spring", stiffness: 200 }}
                        >
                          <div style={{ fontSize: "1.8rem", color: "#d4af37", fontWeight: "700" }}>
                            {stat.icon} {stat.value}
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>{stat.label}</div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                ref={tabControlsRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "15px",
                  marginBottom: "40px",
                  flexWrap: "wrap",
                }}
              >
                {[
                  { id: "profile", label: "Profile", icon: "👤" },
                  { id: "about", label: "About", icon: "ℹ️" },
                  { id: "contact", label: "Contact", icon: "📧" },
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTabChange(tab.id)}
                    style={{
                      padding: "14px 32px",
                      borderRadius: "16px",
                      border: "2px solid",
                      borderColor: activeTab === tab.id ? "#d4af37" : "rgba(255,255,255,0.1)",
                      background:
                        activeTab === tab.id
                          ? "linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.1))"
                          : "var(--glass)",
                      color: activeTab === tab.id ? "#d4af37" : "#e5e7eb",
                      backdropFilter: "blur(12px)",
                      cursor: "pointer",
                      fontSize: "1.05rem",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      boxShadow:
                        activeTab === tab.id ? "0 8px 25px rgba(212, 175, 55, 0.3)" : "none",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <span style={{ fontSize: "1.3rem" }}>{tab.icon}</span>
                    {tab.label}
                  </motion.button>
                ))}
              </motion.div>

              <AnimatePresence mode="wait">
                {activeTab === "profile" && (
                  <motion.div
                    key="profile"
                    variants={tabVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                        gap: "30px",
                      }}
                    >
                      <motion.div
                        variants={cardVariants}
                        whileHover={{ y: -5, boxShadow: "0 15px 40px rgba(212, 175, 55, 0.2)" }}
                        style={{
                          background: "var(--glass)",
                          backdropFilter: "blur(12px)",
                          padding: "30px",
                          borderRadius: "20px",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "20px",
                          }}
                        >
                          <h3 style={{ color: "#d4af37", fontSize: "1.5rem", margin: 0 }}>
                            About Me
                          </h3>
                          {!editing && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setEditing(true)}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "#3b82f6",
                                cursor: "pointer",
                                fontSize: "1.3rem",
                              }}
                            >
                              ✏️
                            </motion.button>
                          )}
                        </div>
                        {editing ? (
                          <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: "20px" }}>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: "8px",
                                  color: "#e5e7eb",
                                  fontWeight: "600",
                                }}
                              >
                                Username
                              </label>
                              <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                style={{
                                  width: "100%",
                                  padding: "12px 16px",
                                  borderRadius: "12px",
                                  border: "2px solid rgba(255, 255, 255, 0.1)",
                                  background: "rgba(17, 24, 39, 0.6)",
                                  color: "#e5e7eb",
                                  fontSize: "1rem",
                                  outline: "none",
                                }}
                              />
                            </div>
                            <div style={{ marginBottom: "20px" }}>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: "8px",
                                  color: "#e5e7eb",
                                  fontWeight: "600",
                                }}
                              >
                                About
                              </label>
                              <textarea
                                name="about"
                                value={formData.about}
                                onChange={handleChange}
                                rows="5"
                                placeholder="Tell us about yourself..."
                                style={{
                                  width: "100%",
                                  padding: "12px 16px",
                                  borderRadius: "12px",
                                  border: "2px solid rgba(255, 255, 255, 0.1)",
                                  background: "rgba(17, 24, 39, 0.6)",
                                  color: "#e5e7eb",
                                  fontSize: "1rem",
                                  resize: "vertical",
                                  outline: "none",
                                }}
                              />
                            </div>
                            <div style={{ display: "flex", gap: "10px" }}>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                              >
                                💾 Save
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={() => setEditing(false)}
                                style={{
                                  flex: 1,
                                  padding: "12px",
                                  background: "rgba(107, 114, 128, 0.3)",
                                  border: "none",
                                  borderRadius: "12px",
                                  color: "#e5e7eb",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                }}
                              >
                                ❌ Cancel
                              </motion.button>
                            </div>
                          </form>
                        ) : (
                          <div>
                            <p
                              style={{
                                color: "#cbd5e1",
                                lineHeight: "1.8",
                                fontSize: "1.05rem",
                                minHeight: "100px",
                              }}
                            >
                              {profile.about ||
                                "No bio added yet. Click the edit button to add one!"}
                            </p>
                          </div>
                        )}
                      </motion.div>
                      <motion.div
                        variants={cardVariants}
                        whileHover={{ y: -5, boxShadow: "0 15px 40px rgba(59, 130, 246, 0.2)" }}
                        style={{
                          background: "var(--glass)",
                          backdropFilter: "blur(12px)",
                          padding: "30px",
                          borderRadius: "20px",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <h3 style={{ color: "#3b82f6", fontSize: "1.5rem", marginBottom: "20px" }}>
                          Account Details
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                          <div
                            style={{
                              padding: "15px",
                              background: "rgba(59, 130, 246, 0.1)",
                              borderRadius: "12px",
                              borderLeft: "4px solid #3b82f6",
                            }}
                          >
                            <div
                              style={{ color: "#9ca3af", fontSize: "0.85rem", marginBottom: "5px" }}
                            >
                              Username
                            </div>
                            <div
                              style={{ color: "#e5e7eb", fontSize: "1.1rem", fontWeight: "600" }}
                            >
                              {profile.username}
                            </div>
                          </div>
                          <div
                            style={{
                              padding: "15px",
                              background: "rgba(212, 175, 55, 0.1)",
                              borderRadius: "12px",
                              borderLeft: "4px solid #d4af37",
                            }}
                          >
                            <div
                              style={{ color: "#9ca3af", fontSize: "0.85rem", marginBottom: "5px" }}
                            >
                              Email
                            </div>
                            <div
                              style={{ color: "#e5e7eb", fontSize: "1.1rem", fontWeight: "600" }}
                            >
                              {profile.email}
                            </div>
                          </div>
                          <div
                            style={{
                              padding: "15px",
                              background: "rgba(16, 185, 129, 0.1)",
                              borderRadius: "12px",
                              borderLeft: "4px solid #10b981",
                            }}
                          >
                            <div
                              style={{ color: "#9ca3af", fontSize: "0.85rem", marginBottom: "5px" }}
                            >
                              Member Since
                            </div>
                            <div
                              style={{ color: "#e5e7eb", fontSize: "1.1rem", fontWeight: "600" }}
                            >
                              {profile.createdAt
                                ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })
                                : "Recently"}
                            </div>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleLogout}
                          style={{
                            width: "100%",
                            marginTop: "25px",
                            padding: "14px",
                            background: "linear-gradient(135deg, #d4af37, #f7ef8a)",
                            border: "none",
                            borderRadius: "12px",
                            color: "#0b0e14",
                            fontWeight: "700",
                            fontSize: "1.05rem",
                            cursor: "pointer",
                            boxShadow: "0 6px 20px rgba(212, 175, 55, 0.35)",
                          }}
                        >
                          🚪 Logout
                        </motion.button>
                      </motion.div>
                      <motion.div
                        variants={cardVariants}
                        whileHover={{ y: -5, boxShadow: "0 15px 40px rgba(34, 197, 94, 0.18)" }}
                        style={{
                          background: "var(--glass)",
                          backdropFilter: "blur(12px)",
                          padding: "30px",
                          borderRadius: "20px",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <h3 style={{ color: "#34d399", fontSize: "1.5rem", marginBottom: "16px" }}>
                          Account Recovery PIN
                        </h3>
                        <p style={{ color: "#cbd5e1", lineHeight: 1.5, marginBottom: "18px" }}>
                          Use this 6-digit PIN on the Forgot Password page when you cannot access
                          your email inbox. Keep it private.
                        </p>
                        {pinStatus.message && (
                          <div
                            style={{
                              marginBottom: "18px",
                              padding: "14px",
                              borderRadius: "12px",
                              border:
                                pinStatus.type === "success"
                                  ? "1px solid rgba(34,197,94,0.4)"
                                  : "1px solid rgba(239,68,68,0.35)",
                              background:
                                pinStatus.type === "success"
                                  ? "rgba(34,197,94,0.12)"
                                  : "rgba(239,68,68,0.12)",
                              color: pinStatus.type === "success" ? "#86efac" : "#fda4af",
                              fontWeight: 600,
                              textAlign: "center",
                            }}
                          >
                            {pinStatus.message}
                          </div>
                        )}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "rgba(15, 23, 42, 0.65)",
                            borderRadius: "14px",
                            padding: "16px 20px",
                            border: "1px solid rgba(148, 163, 184, 0.25)",
                            marginBottom: "16px",
                          }}
                        >
                          <span
                            style={{
                              letterSpacing: "6px",
                              fontSize: "2rem",
                              color: "#f8fafc",
                              fontWeight: 700,
                            }}
                          >
                            {showResetPin ? profile?.resetPin || "------" : "******"}
                          </span>
                          <button
                            type="button"
                            onClick={toggleResetPinVisibility}
                            style={{
                              padding: "10px 16px",
                              borderRadius: "10px",
                              border: "1px solid rgba(148, 163, 184, 0.4)",
                              background: "rgba(30, 41, 59, 0.65)",
                              color: "#cbd5e1",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            {showResetPin ? "Hide" : "Show"} PIN
                          </button>
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gap: "6px",
                            color: "#94a3b8",
                            fontSize: "0.9rem",
                            marginBottom: "20px",
                          }}
                        >
                          <div>
                            Generated:
                            <span style={{ color: "#e2e8f0", fontWeight: 600, marginLeft: "6px" }}>
                              {formatDateTime(profile?.resetPinIssuedAt, "Just now")}
                            </span>
                          </div>
                          <div>
                            Last used:
                            <span style={{ color: "#e2e8f0", fontWeight: 600, marginLeft: "6px" }}>
                              {profile?.resetPinLastUsedAt
                                ? formatDateTime(profile.resetPinLastUsedAt)
                                : "Never"}
                            </span>
                          </div>
                        </div>
                        <motion.button
                          type="button"
                          onClick={handleRegeneratePin}
                          whileHover={{ scale: refreshingPin ? 1 : 1.02 }}
                          disabled={refreshingPin}
                          style={{
                            width: "100%",
                            padding: "14px",
                            fontSize: "1rem",
                            fontWeight: "700",
                            borderRadius: "12px",
                            border: "none",
                            cursor: refreshingPin ? "not-allowed" : "pointer",
                            background: refreshingPin
                              ? "rgba(16, 185, 129, 0.45)"
                              : "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                            color: "#0f172a",
                          }}
                        >
                          {refreshingPin ? "Generating..." : "Generate New PIN"}
                        </motion.button>
                        <p
                          style={{
                            color: "#94a3b8",
                            fontSize: "0.85rem",
                            marginTop: "12px",
                            textAlign: "center",
                          }}
                        >
                          After changing your password, sign back in to view your refreshed reset
                          PIN here.
                        </p>
                        <motion.button
                          type="button"
                          onClick={() => navigate("/forgot-password")}
                          whileHover={{ scale: 1.01 }}
                          style={{
                            marginTop: "16px",
                            width: "100%",
                            padding: "12px",
                            borderRadius: "12px",
                            border: "1px solid rgba(96, 165, 250, 0.4)",
                            background: "rgba(37, 99, 235, 0.12)",
                            color: "#bfdbfe",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Forgot how to use it?
                        </motion.button>
                      </motion.div>
                      <motion.div
                        variants={cardVariants}
                        whileHover={{ y: -5, boxShadow: "0 15px 40px rgba(99, 102, 241, 0.2)" }}
                        style={{
                          background: "var(--glass)",
                          backdropFilter: "blur(12px)",
                          padding: "30px",
                          borderRadius: "20px",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <h3 style={{ color: "#818cf8", fontSize: "1.5rem", marginBottom: "20px" }}>
                          Change Password
                        </h3>
                        {passwordStatus.message && (
                          <div
                            style={{
                              marginBottom: "20px",
                              padding: "14px",
                              borderRadius: "12px",
                              border:
                                passwordStatus.type === "success"
                                  ? "1px solid rgba(34,197,94,0.4)"
                                  : "1px solid rgba(239,68,68,0.35)",
                              background:
                                passwordStatus.type === "success"
                                  ? "rgba(34,197,94,0.12)"
                                  : "rgba(239,68,68,0.1)",
                              color: passwordStatus.type === "success" ? "#86efac" : "#fca5a5",
                              fontWeight: 600,
                              textAlign: "center",
                            }}
                          >
                            {passwordStatus.message}
                          </div>
                        )}
                        <form onSubmit={submitPasswordChange}>
                          <div style={{ marginBottom: "18px" }}>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "8px",
                                color: "#e5e7eb",
                                fontWeight: 600,
                              }}
                            >
                              Current Password
                            </label>
                            <input
                              type="password"
                              name="currentPassword"
                              value={passwordForm.currentPassword}
                              onChange={handlePasswordInputChange}
                              autoComplete="current-password"
                              style={{
                                width: "100%",
                                padding: "12px 16px",
                                borderRadius: "12px",
                                border: "2px solid rgba(255, 255, 255, 0.1)",
                                background: "rgba(17, 24, 39, 0.6)",
                                color: "#e5e7eb",
                                fontSize: "1rem",
                                outline: "none",
                              }}
                            />
                          </div>
                          <div style={{ marginBottom: "18px" }}>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "8px",
                                color: "#e5e7eb",
                                fontWeight: 600,
                              }}
                            >
                              New Password
                            </label>
                            <input
                              type="password"
                              name="newPassword"
                              value={passwordForm.newPassword}
                              onChange={handlePasswordInputChange}
                              autoComplete="new-password"
                              style={{
                                width: "100%",
                                padding: "12px 16px",
                                borderRadius: "12px",
                                border: "2px solid rgba(255, 255, 255, 0.1)",
                                background: "rgba(17, 24, 39, 0.6)",
                                color: "#e5e7eb",
                                fontSize: "1rem",
                                outline: "none",
                              }}
                            />
                            <div
                              style={{
                                marginTop: "12px",
                                padding: "12px",
                                borderRadius: "10px",
                                background: "rgba(30, 41, 59, 0.55)",
                              }}
                            >
                              <p
                                style={{
                                  color: "#94a3b8",
                                  fontSize: "0.85rem",
                                  marginBottom: "6px",
                                }}
                              >
                                Must include:
                              </p>
                              <ul
                                style={{
                                  listStyle: "none",
                                  margin: 0,
                                  padding: 0,
                                  display: "grid",
                                  gap: "6px",
                                }}
                              >
                                {passwordRuleStatus.map((rule) => (
                                  <li
                                    key={rule.label}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      fontSize: "0.85rem",
                                      color: rule.passed ? "#86efac" : "#fca5a5",
                                      fontWeight: rule.passed ? 600 : 500,
                                    }}
                                  >
                                    <span style={{ fontWeight: 700 }}>
                                      {rule.passed ? "✓" : "•"}
                                    </span>
                                    {rule.label}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div style={{ marginBottom: "24px" }}>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "8px",
                                color: "#e5e7eb",
                                fontWeight: 600,
                              }}
                            >
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              name="confirmPassword"
                              value={passwordForm.confirmPassword}
                              onChange={handlePasswordInputChange}
                              autoComplete="new-password"
                              style={{
                                width: "100%",
                                padding: "12px 16px",
                                borderRadius: "12px",
                                border: "2px solid rgba(255, 255, 255, 0.1)",
                                background: "rgba(17, 24, 39, 0.6)",
                                color: "#e5e7eb",
                                fontSize: "1rem",
                                outline: "none",
                              }}
                            />
                          </div>
                          <motion.button
                            whileHover={{ scale: passwordLoading ? 1 : 1.02 }}
                            whileTap={{ scale: passwordLoading ? 1 : 0.98 }}
                            type="submit"
                            disabled={passwordLoading}
                            style={{
                              width: "100%",
                              padding: "14px",
                              background: passwordLoading
                                ? "rgba(129, 140, 248, 0.5)"
                                : "linear-gradient(135deg, #6366f1, #4338ca)",
                              border: "none",
                              borderRadius: "12px",
                              color: "#f8fafc",
                              fontWeight: 700,
                              fontSize: "1.05rem",
                              cursor: passwordLoading ? "not-allowed" : "pointer",
                            }}
                          >
                            {passwordLoading ? "Updating..." : "Update Password"}
                          </motion.button>
                        </form>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
                {activeTab === "about" && (
                  <motion.div
                    key="about"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{
                      padding: "60px 20px",
                      textAlign: "center",
                      borderRadius: "24px",
                      background: "var(--glass)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <h2
                      style={{
                        fontSize: "2.5rem",
                        fontWeight: "700",
                        color: "#d4af37",
                        marginBottom: "16px",
                      }}
                    >
                      Redirecting to About Page...
                    </h2>
                    <p style={{ color: "#e5e7eb", fontSize: "1.1rem" }}>
                      Taking you to TourEase’s story.
                    </p>
                  </motion.div>
                )}

                {activeTab === "contact" && (
                  <motion.div
                    ref={(node) => {
                      contactSectionRef.current = node;
                      contactInViewRef(node); // ✅ connect in-view trigger
                    }}
                    key="contact"
                    initial={{ opacity: 0, y: 60 }}
                    animate={contactInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: "24px",
                      padding: "40px 20px",
                      backdropFilter: "blur(16px)",
                    }}
                  >
                    {/* ✨ Animated shimmer background */}
                    <motion.div
                      animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
                      transition={{ duration: 25, repeat: Infinity, repeatType: "reverse" }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(45deg, rgba(212,175,55,0.05) 0%, rgba(59,130,246,0.05) 100%)",
                        backgroundSize: "200% 200%",
                        pointerEvents: "none",
                        zIndex: 0,
                      }}
                    />

                    {/* 🪩 Inner fade container */}
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      style={{ position: "relative", zIndex: 1 }}
                    >
                      <div style={{ textAlign: "center", marginBottom: "40px" }}>
                        <h2
                          style={{
                            fontSize: "3rem",
                            fontWeight: "700",
                            marginBottom: "15px",
                            background: "linear-gradient(135deg, #d4af37, #3b82f6)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          Get In Touch
                        </h2>
                        <p style={{ color: "#cbd5e1", fontSize: "1.1rem" }}>
                          Have questions or feedback? We'd love to hear from you!
                        </p>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                          gap: "30px",
                        }}
                      >
                        {/* Left: Contact Form */}
                        <motion.div
                          variants={cardVariants}
                          style={{
                            background: "var(--glass)",
                            backdropFilter: "blur(12px)",
                            padding: "35px",
                            borderRadius: "20px",
                            border: "1px solid rgba(255,255,255,0.1)",
                            gridColumn: "span 2",
                          }}
                        >
                          <h3
                            style={{ color: "#d4af37", marginBottom: "25px", fontSize: "1.6rem" }}
                          >
                            Send us a Message
                          </h3>

                          {/* ✅ Status Toast */}
                          <AnimatePresence>
                            {contactStatus.message && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                style={{
                                  padding: "16px",
                                  borderRadius: "12px",
                                  marginBottom: "20px",
                                  background:
                                    contactStatus.type === "success"
                                      ? "rgba(16, 185, 129, 0.1)"
                                      : "rgba(239, 68, 68, 0.1)",
                                  border: `1px solid ${
                                    contactStatus.type === "success"
                                      ? "rgba(16, 185, 129, 0.3)"
                                      : "rgba(239, 68, 68, 0.3)"
                                  }`,
                                  color: contactStatus.type === "success" ? "#10b981" : "#ef4444",
                                }}
                              >
                                {contactStatus.message}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* ✉️ Contact Form */}
                          <form onSubmit={handleContactSubmit}>
                            {[
                              { name: "name", label: "Name *", type: "text", required: true },
                              { name: "email", label: "Email *", type: "email", required: true },
                              { name: "subject", label: "Subject", type: "text", required: false },
                            ].map((field) => (
                              <div key={field.name} style={{ marginBottom: "20px" }}>
                                <label
                                  style={{
                                    display: "block",
                                    marginBottom: "8px",
                                    color: "#e5e7eb",
                                    fontWeight: "600",
                                  }}
                                >
                                  {field.label}
                                </label>
                                <input
                                  type={field.type}
                                  value={contactForm[field.name]}
                                  onChange={(e) =>
                                    setContactForm({ ...contactForm, [field.name]: e.target.value })
                                  }
                                  required={field.required}
                                  style={{
                                    width: "100%",
                                    padding: "14px 18px",
                                    borderRadius: "12px",
                                    border: "2px solid rgba(255, 255, 255, 0.1)",
                                    background: "rgba(17, 24, 39, 0.6)",
                                    color: "#e5e7eb",
                                    fontSize: "1rem",
                                    outline: "none",
                                    transition: "all 0.3s ease",
                                  }}
                                />
                              </div>
                            ))}

                            <div style={{ marginBottom: "20px" }}>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: "8px",
                                  color: "#e5e7eb",
                                  fontWeight: "600",
                                }}
                              >
                                Message *
                              </label>
                              <textarea
                                value={contactForm.message}
                                onChange={(e) =>
                                  setContactForm({ ...contactForm, message: e.target.value })
                                }
                                required
                                rows="5"
                                style={{
                                  width: "100%",
                                  padding: "14px 18px",
                                  borderRadius: "12px",
                                  border: "2px solid rgba(255, 255, 255, 0.1)",
                                  background: "rgba(17, 24, 39, 0.6)",
                                  color: "#e5e7eb",
                                  fontSize: "1rem",
                                  resize: "vertical",
                                  outline: "none",
                                }}
                              />
                            </div>

                            {/* ✉️ Submit Button */}
                            <motion.button
                              whileHover={!contactLoading ? { scale: 1.05 } : {}}
                              whileTap={!contactLoading ? { scale: 0.95 } : {}}
                              type="submit"
                              disabled={contactLoading}
                              style={{
                                width: "100%",
                                background: contactLoading
                                  ? "linear-gradient(135deg, #6b7280, #4b5563)"
                                  : "linear-gradient(135deg, #d4af37, #f7ef8a)",
                                color: "#0b0e14",
                                fontWeight: 700,
                                fontSize: "1.05rem",
                                border: "none",
                                borderRadius: "12px",
                                padding: "14px",
                                cursor: contactLoading ? "not-allowed" : "pointer",
                                boxShadow: contactLoading
                                  ? "none"
                                  : "0 6px 20px rgba(212, 175, 55, 0.35)",
                                opacity: contactLoading ? 0.85 : 1,
                                transition: "all 0.25s ease",
                              }}
                            >
                              {contactLoading ? "Sending..." : "Send Message"}
                            </motion.button>
                          </form>
                        </motion.div>

                        {/* Right: Info Cards */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                          {[
                            {
                              icon: "📍",
                              title: "Location",
                              desc: "Bangalore, Karnataka, India",
                              color: "#d4af37",
                            },
                            {
                              icon: "📧",
                              title: "Email",
                              desc: "support@tourease.com",
                              color: "#3b82f6",
                            },
                            {
                              icon: "📞",
                              title: "Phone",
                              desc: "+91 1800 123 4567",
                              color: "#10b981",
                            },
                            {
                              icon: "🌐",
                              title: "Website",
                              desc: "www.tourease.com",
                              color: "#f59e0b",
                            },
                          ].map((info, idx) => (
                            <motion.div
                              key={idx}
                              variants={cardVariants}
                              whileHover={{ scale: 1.03, y: -3 }}
                              style={{
                                background: "var(--glass)",
                                backdropFilter: "blur(12px)",
                                padding: "25px",
                                borderRadius: "16px",
                                border: "1px solid rgba(255,255,255,0.1)",
                              }}
                            >
                              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>
                                {info.icon}
                              </div>
                              <h4
                                style={{
                                  color: info.color,
                                  marginBottom: "8px",
                                  fontSize: "1.1rem",
                                }}
                              >
                                {info.title}
                              </h4>
                              <p style={{ color: "#cbd5e1", margin: 0 }}>{info.desc}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
      <AnimatePresence>
        {showPhotoPreview && profileImageSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPhotoPreview(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.9)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9998,
              padding: "20px",
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "relative",
                maxWidth: "80vw",
                maxHeight: "80vh",
                borderRadius: "24px",
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 25px 80px rgba(0, 0, 0, 0.6)",
                background: "#0b0e14",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={profileImageSrc}
                alt="Profile preview"
                style={{
                  width: "100%",
                  height: "auto",
                  maxWidth: "min(80vw, 600px)",
                  maxHeight: "min(80vh, 600px)",
                  objectFit: "contain",
                  borderRadius: "12px",
                  transition: "transform 0.3s ease",
                }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPhotoPreview(false)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(0, 0, 0, 0.6)",
                  color: "#f8fafc",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ImageUploadModal
        isOpen={showUploadModal}
        onClose={closeUploadModal}
        onUploadSuccess={handleUploadSuccess}
      />
    </>
  );
};

export default Profile;
