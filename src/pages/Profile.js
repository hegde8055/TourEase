// client/src/pages/Profile.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { profileAPI, contactAPI } from "../utils/api";
import { isAuthenticated } from "../utils/auth";
import Navbar from "../components/Navbar";
import { aboutFeatures } from "../utils/aboutContent";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useAuth } from "../App";

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
  const [uploadMethod, setUploadMethod] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [crop, setCrop] = useState({ unit: "%", width: 50, aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const fileInputRef = useRef(null);
  const tabControlsRef = useRef(null);
  const aboutSectionRef = useRef(null);
  const contactSectionRef = useRef(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [contactStatus, setContactStatus] = useState({ type: "", message: "" });
  const [contactLoading, setContactLoading] = useState(false);
  const [stats, setStats] = useState({ visited: 0, reviews: 0, photos: 0 });

  const handleTabChange = useCallback(
    (tabId) => {
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
      const response = await profileAPI.get();
      const userProfile = response.data;
      setProfile(userProfile);
      setFormData({ username: userProfile.username || "", about: userProfile.about || "" });
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

  // Cleanup camera stream when component unmounts or stream changes
  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  // Demo stats loader
  useEffect(() => {
    const timer = setTimeout(() => setStats({ visited: 12, reviews: 8, photos: 24 }), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await profileAPI.update(formData);
      setEditing(false);
      loadProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error.response?.data?.error || "Failed to update profile.");
    }
  };

  const openUploadModal = () => {
    setShowUploadModal(true);
    setUploadMethod(null);
    setImageSrc(null);
    setShowCropper(false);
    setCameraLoading(false);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploadMethod(null);
    setImageSrc(null);
    setCrop({ unit: "%", width: 50, aspect: 1 });
    setCompletedCrop(null);
    setShowCropper(false);
    setCameraLoading(false);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result);
      setShowCropper(false);
      setCrop({ unit: "%", width: 50, aspect: 1 });
      setCompletedCrop(null);
      setUploadMethod("local");
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const startCamera = useCallback(async () => {
    if (cameraLoading) return;
    setCameraLoading(true);
    try {
      setImageSrc(null);
      setShowCropper(false);

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      setStream(mediaStream);
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraLoading(false);
      alert("Unable to access camera. Please check permissions.");
    }
  }, [cameraLoading, stream]);

  useEffect(() => {
    if (!stream || !videoRef.current) return;

    const videoElement = videoRef.current;
    videoElement.muted = true;
    videoElement.setAttribute("playsinline", "true");
    videoElement.srcObject = stream;

    const handleCanPlay = () => {
      setCameraLoading(false);
      videoElement.removeEventListener("canplay", handleCanPlay);
    };

    videoElement.addEventListener("canplay", handleCanPlay);

    const playPromise = videoElement.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise.catch((err) => {
        console.warn("Video play() failed:", err);
        setTimeout(() => setCameraLoading(false), 500);
      });
    }

    return () => {
      videoElement.removeEventListener("canplay", handleCanPlay);
      if (videoElement.srcObject === stream) {
        videoElement.srcObject = null;
      }
    };
  }, [stream]);

  // Auto-start the camera when user selects the Camera upload method
  useEffect(() => {
    if (showUploadModal && uploadMethod === "camera" && !stream && !cameraLoading && !imageSrc) {
      startCamera();
    }
  }, [showUploadModal, uploadMethod, stream, cameraLoading, imageSrc, startCamera]);

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0);
      const imageDataUrl = canvas.toDataURL("image/jpeg");
      setImageSrc(imageDataUrl);
      setShowCropper(false);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }
  };

  const getCroppedImg = () => {
    if (!completedCrop || !imgRef.current) return null;
    const canvas = document.createElement("canvas");
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );
    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9));
  };

  const convertBlobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const handlePhotoUpload = async (useCrop = false) => {
    try {
      let base64data = null;

      if (useCrop) {
        const croppedBlob = await getCroppedImg();
        if (!croppedBlob) {
          alert("Please crop the image first");
          return;
        }
        base64data = await convertBlobToBase64(croppedBlob);
      } else {
        if (!imageSrc) {
          alert("No image found to upload. Please try again.");
          return;
        }

        if (imageSrc.startsWith("data:")) {
          base64data = imageSrc;
        } else {
          try {
            const response = await fetch(imageSrc);
            const blob = await response.blob();
            base64data = await convertBlobToBase64(blob);
          } catch (error) {
            console.error("Unable to prepare image for upload:", error);
            alert("Couldn't prepare the image for upload. Please try cropping it first.");
            return;
          }
        }
      }

      if (!base64data) {
        alert("Could not prepare the image. Please try again.");
        return;
      }

      await profileAPI.uploadPhoto({ photo: base64data });
      closeUploadModal();
      loadProfile();
    } catch (error) {
      console.error("Error processing image:", error);
      alert(error.response?.data?.error || "Error processing image. Please try again.");
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    setContactStatus({ type: "", message: "" });
    try {
      const response = await contactAPI.send(contactForm);
      setContactStatus({ type: "success", message: response.data.message });
      setContactForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setContactStatus({
        type: "error",
        message: error.response?.data?.error || "Failed to send message.",
      });
    } finally {
      setContactLoading(false);
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
      <Navbar />
      <div
        style={{
          minHeight: "100vh",
          paddingTop: "100px",
          paddingBottom: "60px",
          marginTop: "-100px",
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
                    {profile.profile_photo_base64 ? (
                      <img
                        src={profile.profile_photo_base64}
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
                        {profile.username?.charAt(0).toUpperCase() || "U"}
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
                    </div>
                  </motion.div>
                )}
                {activeTab === "about" && (
                  <motion.div
                    ref={aboutSectionRef}
                    key="about"
                    variants={tabVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div style={{ textAlign: "center", marginBottom: "50px" }}>
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
                        About TourEase
                      </h2>
                      <p style={{ color: "#cbd5e1", fontSize: "1.2rem" }}>
                        Your Ultimate Travel Companion for Exploring Incredible India
                      </p>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "30px",
                      }}
                    >
                      {[
                        {
                          icon: "🎯",
                          title: "Our Mission",
                          desc: "To make travel planning effortless, personalized, and exciting by providing comprehensive information about India's diverse destinations.",
                          color: "#d4af37",
                        },
                        {
                          icon: "👁️",
                          title: "Our Vision",
                          desc: "To become India's most trusted travel platform, helping millions discover hidden gems and create lifelong memories.",
                          color: "#3b82f6",
                        },
                      ].map((item, idx) => (
                        <motion.div
                          key={idx}
                          variants={cardVariants}
                          whileHover={{ y: -8, scale: 1.02 }}
                          style={{
                            background: "var(--glass)",
                            backdropFilter: "blur(12px)",
                            padding: "35px",
                            borderRadius: "20px",
                            border: "1px solid rgba(255,255,255,0.1)",
                            textAlign: "center",
                          }}
                        >
                          <div style={{ fontSize: "3.5rem", marginBottom: "20px" }}>
                            {item.icon}
                          </div>
                          <h3
                            style={{ color: item.color, marginBottom: "15px", fontSize: "1.6rem" }}
                          >
                            {item.title}
                          </h3>
                          <p style={{ color: "#cbd5e1", lineHeight: "1.8" }}>{item.desc}</p>
                        </motion.div>
                      ))}
                    </div>
                    <div style={{ marginTop: "60px" }}>
                      <h3
                        style={{
                          textAlign: "center",
                          marginBottom: "26px",
                          fontSize: "2rem",
                          color: "#d4af37",
                          fontWeight: 700,
                        }}
                      >
                        What Sets Us Apart
                      </h3>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                          gap: "24px",
                        }}
                      >
                        {aboutFeatures.map((item) => (
                          <motion.article
                            key={item.title}
                            variants={cardVariants}
                            whileHover={{ y: -6, scale: 1.02 }}
                            style={{
                              padding: "28px",
                              borderRadius: "18px",
                              background: "var(--glass)",
                              border: "1px solid rgba(255, 255, 255, 0.08)",
                              backdropFilter: "blur(12px)",
                              minHeight: "210px",
                            }}
                          >
                            <div style={{ fontSize: "2.2rem", marginBottom: "16px" }}>
                              {item.icon}
                            </div>
                            <h4
                              style={{
                                color: "#3b82f6",
                                fontSize: "1.2rem",
                                marginBottom: "10px",
                                fontWeight: 600,
                              }}
                            >
                              {item.title}
                            </h4>
                            <p style={{ color: "rgba(226, 232, 240, 0.82)", lineHeight: 1.7 }}>
                              {item.description}
                            </p>
                          </motion.article>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                {activeTab === "contact" && (
                  <motion.div
                    ref={contactSectionRef}
                    key="contact"
                    variants={tabVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
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
                        <h3 style={{ color: "#d4af37", marginBottom: "25px", fontSize: "1.6rem" }}>
                          Send us a Message
                        </h3>
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
                                border: `1px solid ${contactStatus.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                                color: contactStatus.type === "success" ? "#10b981" : "#ef4444",
                              }}
                            >
                              {contactStatus.message}
                            </motion.div>
                          )}
                        </AnimatePresence>
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
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={contactLoading}
                            className="btn btn-primary"
                            style={{ width: "100%", opacity: contactLoading ? 0.7 : 1 }}
                          >
                            {contactLoading ? "Sending..." : "Send Message"}
                          </motion.button>
                        </form>
                      </motion.div>
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
                              style={{ color: info.color, marginBottom: "8px", fontSize: "1.1rem" }}
                            >
                              {info.title}
                            </h4>
                            <p style={{ color: "#cbd5e1", margin: 0 }}>{info.desc}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
      <AnimatePresence>
        {showPhotoPreview && profile?.profile_photo_base64 && (
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
                src={profile.profile_photo_base64}
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
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeUploadModal}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--surface)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "24px",
                padding: "35px",
                maxWidth: "600px",
                width: "100%",
                maxHeight: "90vh",
                overflow: "auto",
                boxShadow: "0 25px 80px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "30px",
                  paddingBottom: "20px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <h2 style={{ color: "#d4af37", fontSize: "1.8rem", margin: 0 }}>
                  Upload Profile Photo
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeUploadModal}
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "none",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    color: "#e5e7eb",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✕
                </motion.button>
              </div>
              {!uploadMethod ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {[
                    { id: "camera", icon: "📷", title: "Camera", desc: "Take a photo" },
                    { id: "local", icon: "📁", title: "File", desc: "From device" },
                  ].map((method) => (
                    <motion.button
                      key={method.id}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setUploadMethod(method.id);
                        if (method.id === "local") fileInputRef.current.click();
                      }}
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                        border: "2px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "16px",
                        padding: "30px 20px",
                        cursor: "pointer",
                        textAlign: "center",
                        color: "#e5e7eb",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <div style={{ fontSize: "3rem", marginBottom: "12px" }}>{method.icon}</div>
                      <h3 style={{ color: "#d4af37", marginBottom: "5px", fontSize: "1.1rem" }}>
                        {method.title}
                      </h3>
                      <p style={{ color: "#9ca3af", fontSize: "0.85rem", margin: 0 }}>
                        {method.desc}
                      </p>
                    </motion.button>
                  ))}
                </div>
              ) : uploadMethod === "camera" && !imageSrc ? (
                <div>
                  {!stream ? (
                    <div style={{ textAlign: "center", padding: "40px" }}>
                      {cameraLoading ? (
                        <div style={{ color: "#e5e7eb" }}>Starting camera...</div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={startCamera}
                          className="btn btn-primary"
                        >
                          Start Camera
                        </motion.button>
                      )}
                    </div>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        style={{ width: "100%", borderRadius: "12px", marginBottom: "20px" }}
                      />
                      <div style={{ display: "flex", gap: "10px" }}>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={capturePhoto}
                          className="btn btn-primary"
                          style={{ flex: 1 }}
                        >
                          Capture Photo
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            if (stream) {
                              stream.getTracks().forEach((track) => track.stop());
                              setStream(null);
                            }
                            setUploadMethod(null);
                          }}
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
                          Cancel
                        </motion.button>
                      </div>
                    </>
                  )}
                </div>
              ) : imageSrc ? (
                !showCropper ? (
                  <div style={{ textAlign: "center" }}>
                    <h3 style={{ color: "#d4af37", marginBottom: "15px" }}>Preview Photo</h3>
                    <div
                      style={{
                        width: "220px",
                        height: "220px",
                        borderRadius: "50%",
                        margin: "0 auto 20px",
                        overflow: "hidden",
                        border: "4px solid rgba(212, 175, 55, 0.35)",
                        boxShadow: "0 12px 35px rgba(15, 23, 42, 0.45)",
                        background: "rgba(15, 23, 42, 0.6)",
                      }}
                    >
                      <img
                        src={imageSrc}
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePhotoUpload(false)}
                        className="btn btn-primary"
                        style={{ padding: "12px 18px", minWidth: "150px" }}
                      >
                        Upload Photo
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={async () => {
                          setImageSrc(null);
                          setCrop({ unit: "%", width: 50, aspect: 1 });
                          setCompletedCrop(null);
                          setShowCropper(false);
                          if (uploadMethod === "camera") {
                            try {
                              await startCamera();
                            } catch (e) {
                              /* ignore */
                            }
                          } else {
                            if (fileInputRef.current) {
                              fileInputRef.current.click();
                            } else {
                              setUploadMethod(null);
                            }
                          }
                        }}
                        style={{
                          padding: "12px 18px",
                          background: "rgba(107, 114, 128, 0.3)",
                          border: "none",
                          borderRadius: "12px",
                          color: "#e5e7eb",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Retake / Choose Different
                      </motion.button>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        setShowCropper(true);
                        setCompletedCrop(null);
                      }}
                      style={{
                        marginTop: "15px",
                        background: "transparent",
                        border: "none",
                        color: "#93c5fd",
                        fontWeight: "600",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Need to adjust framing? Crop photo
                    </motion.button>
                  </div>
                ) : (
                  <div>
                    <h3 style={{ color: "#d4af37", marginBottom: "15px" }}>Crop Your Photo</h3>
                    <p style={{ color: "#9ca3af", fontSize: "0.9rem", marginBottom: "20px" }}>
                      Drag to adjust the crop area. Aspect ratio is locked to 1:1.
                    </p>
                    <ReactCrop
                      crop={crop}
                      onChange={(c) => setCrop(c)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={1}
                      circularCrop
                    >
                      <img
                        ref={imgRef}
                        src={imageSrc}
                        alt="Crop preview"
                        style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: "12px" }}
                      />
                    </ReactCrop>
                    <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePhotoUpload(true)}
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                      >
                        Upload Photo
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setImageSrc(null);
                          setCrop({ unit: "%", width: 50, aspect: 1 });
                          setCompletedCrop(null);
                          setShowCropper(false);
                          if (uploadMethod === "camera") {
                            startCamera();
                          } else if (fileInputRef.current) {
                            fileInputRef.current.click();
                          }
                        }}
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
                        Choose Different Photo
                      </motion.button>
                    </div>
                  </div>
                )
              ) : null}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Profile;
