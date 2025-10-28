// /client/src/pages/SignUp.js
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../utils/api";
import { setToken, setUsername } from "../utils/auth";
import { useAuth } from "../App";
import "../auth.css"; // Keep your existing auth styles
import { motion, AnimatePresence } from "framer-motion";

// --- START: Template Policy Content (LEGAL REVIEW REQUIRED) ---
const termsContent = (
  /* ... [Same template content as before] ... */ <>
    <h2>Terms of Service for TourEase</h2>
    <p>
      <strong>Effective Date:</strong> October 28, 2025
    </p>
    <h3>1. Acceptance of Terms</h3>
    <p>
      Welcome to TourEase ("Service", "we", "us", "our"). By accessing or using our Service, you
      agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the
      terms, then you may not access the Service.{" "}
      <strong>This is a template and requires review by a legal professional.</strong>
    </p>
    <h3>2. Description of Service</h3>
    <p>
      TourEase provides users with tools for travel planning, including destination discovery,
      itinerary creation, and related information (the "Service"). The Service is provided "as is"
      without warranties of any kind regarding accuracy or availability.
    </p>
    <h3>3. User Accounts</h3>
    <p>
      To access certain features, you must register for an account. You agree to provide accurate,
      current, and complete information during registration and keep this information updated. You
      are responsible for safeguarding your password and for any activities or actions under your
      account. You must notify us immediately upon becoming aware of any breach of security or
      unauthorized use of your account.
    </p>
    <h3>4. User Conduct</h3>
    <p>You agree not to use the Service:</p>
    <ul>
      <li>For any unlawful purpose or inconsistent with these Terms.</li>
      <li>To solicit others to perform or participate in any unlawful acts.</li>
      <li>
        To infringe upon or violate our intellectual property rights or the intellectual property
        rights of others.
      </li>
      <li>
        To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate
        based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or
        disability.
      </li>
      <li>To submit false or misleading information.</li>
      <li>To upload or transmit viruses or any other type of malicious code.</li>
    </ul>
    <h3>5. Intellectual Property</h3>
    <p>
      The Service and its original content (excluding content provided by users), features, and
      functionality are and will remain the exclusive property of TourEase and its licensors. Our
      trademarks may not be used in connection with any product or service without our prior written
      consent.
    </p>
    <h3>6. Termination</h3>
    <p>
      We may terminate or suspend your account immediately, without prior notice or liability, for
      any reason whatsoever, including without limitation if you breach the Terms. Upon termination,
      your right to use the Service will immediately cease.
    </p>
    <h3>7. Limitation of Liability</h3>
    <p>
      In no event shall TourEase, nor its directors, employees, partners, agents, suppliers, or
      affiliates, be liable for any indirect, incidental, special, consequential or punitive
      damages, including without limitation, loss of profits, data, use, goodwill, or other
      intangible losses, resulting from your access to or use of or inability to access or use the
      Service.
    </p>
    <h3>8. Disclaimer</h3>
    <p>
      Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS
      AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or
      implied, including, but not limited to, implied warranties of merchantability, fitness for a
      particular purpose, non-infringement or course of performance.{" "}
      <strong>Consult a lawyer.</strong>
    </p>
    <h3>9. Governing Law</h3>
    <p>
      These Terms shall be governed and construed in accordance with the laws of India/Karnataka
      (adjust as appropriate), without regard to its conflict of law provisions.{" "}
      <strong>Specify jurisdiction accurately after legal advice.</strong>
    </p>
    <h3>10. Changes to Terms</h3>
    <p>
      We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We
      will provide notice of any changes by posting the new Terms on this site. Your continued use
      of the Service after any such changes constitutes your acceptance of the new Terms.
    </p>
    <h3>11. Contact Us</h3>
    <p>
      If you have any questions about these Terms, please contact us at [Your Contact Email/Method].
    </p>
    <p style={{ marginTop: "20px", fontSize: "0.8rem", color: "#9ca3af", fontStyle: "italic" }}>
      Disclaimer: This is template text and requires review by a legal professional before use.
    </p>
  </>
);
const privacyContent = (
  /* ... [Same template content as before] ... */ <>
    <h2>Privacy Policy for TourEase</h2>
    <p>
      <strong>Effective Date:</strong> October 28, 2025
    </p>
    <h3>1. Introduction</h3>
    <p>
      TourEase ("we", "us", "our") respects your privacy and is committed to protecting your
      personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your
      information when you use our Service.{" "}
      <strong>This is a template and requires review by a legal professional.</strong>
    </p>
    <h3>2. Information We Collect</h3>
    <p>
      We may collect personal identification information in various ways, including, but not limited
      to:
    </p>
    <ul>
      <li>
        <strong>Information You Provide:</strong> Such as your name, username, email address,
        password, and preferences when you register or update your profile.
      </li>
      <li>
        <strong>Usage Data:</strong> Information automatically collected when you use the Service,
        such as IP address, browser type, operating system, pages visited, and timestamps.
      </li>
      <li>
        <strong>Location Data:</strong> We may collect approximate location data if you permit us to
        do so, to provide location-based features.
      </li>
      <li>
        <strong>Cookies and Tracking Technologies:</strong> As detailed in our Cookie Policy.
      </li>
    </ul>
    <h3>3. How We Use Your Information</h3>
    <p>We use the information we collect for purposes including:</p>
    <ul>
      <li>To provide, operate, and maintain our Service.</li>
      <li>To improve, personalize, and expand our Service.</li>
      <li>To understand and analyze how you use our Service.</li>
      <li>To develop new products, services, features, and functionality.</li>
      <li>
        To communicate with you, including for customer service, updates, and marketing (if you
        opt-in).
      </li>
      <li>To process your transactions (if applicable).</li>
      <li>To find and prevent fraud.</li>
      <li>For compliance purposes, including enforcing our Terms of Service.</li>
    </ul>
    <h3>4. Sharing Your Information</h3>
    <p>
      We do not sell your personal information. We may share information in the following
      situations:
    </p>
    <ul>
      <li>
        <strong>With Service Providers:</strong> Third-party vendors who perform services for us
        (e.g., hosting, analytics).
      </li>
      <li>
        <strong>For Legal Reasons:</strong> If required by law or in response to valid requests by
        public authorities.
      </li>
      <li>
        <strong>Business Transfers:</strong> In connection with a merger, sale of assets, or
        acquisition.
      </li>
      <li>
        <strong>With Your Consent:</strong> For any other purpose disclosed to you at the time we
        collect your information or pursuant to your consent.
      </li>
    </ul>
    <h3>5. Data Security</h3>
    <p>
      We implement reasonable security measures to protect your information. However, no electronic
      transmission or storage is 100% secure, and we cannot guarantee absolute security.
    </p>
    <h3>6. Data Retention</h3>
    <p>
      We retain your personal data only for as long as necessary for the purposes set out in this
      Privacy Policy, unless a longer retention period is required or permitted by law.
    </p>
    <h3>7. Your Data Protection Rights (Example for GDPR/CCPA - Needs Legal Review)</h3>
    <p>Depending on your location, you may have rights such as:</p>
    <ul>
      <li>The right to access, update, or delete the information we have on you.</li>
      <li>The right of rectification.</li>
      <li>The right to object to processing.</li>
      <li>The right of restriction of processing.</li>
      <li>The right to data portability.</li>
      <li>The right to withdraw consent.</li>
    </ul>
    <p>
      To exercise these rights, please contact us.{" "}
      <strong>Verify applicable rights with a lawyer.</strong>
    </p>
    <h3>8. Children's Privacy</h3>
    <p>
      Our Service does not address anyone under the age of 13 (or 16 in some jurisdictions). We do
      not knowingly collect personal identifiable information from children under 13.{" "}
      <strong>Adjust age and compliance based on legal advice.</strong>
    </p>
    <h3>9. Changes to This Privacy Policy</h3>
    <p>
      We may update this Privacy Policy from time to time. We will notify you of any changes by
      posting the new policy on this page and updating the "Effective Date".
    </p>
    <h3>10. Contact Us</h3>
    <p>
      If you have any questions about this Privacy Policy, please contact us at [Your Contact
      Email/Method].
    </p>
    <p style={{ marginTop: "20px", fontSize: "0.8rem", color: "#9ca3af", fontStyle: "italic" }}>
      Disclaimer: This is template text and requires review by a legal professional before use.
    </p>
  </>
);
const cookieContent = (
  /* ... [Same template content as before] ... */ <>
    <h2>Cookie Policy for TourEase</h2>
    <p>
      <strong>Effective Date:</strong> October 28, 2025
    </p>
    <h3>1. What Are Cookies?</h3>
    <p>
      Cookies are small text files placed on your device (computer, phone, tablet) when you visit a
      website. They are widely used to make websites work, or work more efficiently, as well as to
      provide information to the site owners.{" "}
      <strong>This is a template and requires review by a legal professional.</strong>
    </p>
    <h3>2. How We Use Cookies</h3>
    <p>TourEase uses cookies and similar tracking technologies for several purposes:</p>
    <ul>
      <li>
        <strong>Essential Cookies:</strong> These are strictly necessary for the Service to function
        properly. They enable core functionality such as user login, account management, and
        security. The Service cannot function properly without these cookies.
      </li>
      <li>
        <strong>Performance and Analytics Cookies:</strong> These cookies help us understand how
        visitors interact with our Service by collecting information anonymously. This includes
        which pages are visited most often and if users get error messages. This helps us improve
        how the Service works. (e.g., Google Analytics).
      </li>
      <li>
        <strong>Functionality Cookies:</strong> These cookies allow the Service to remember choices
        you make (such as your username, language, or region) and provide enhanced, more personal
        features. For example, remembering your "Remember me" preference.
      </li>
      <li>
        <strong>Targeting/Advertising Cookies (If Applicable):</strong> These cookies may be set
        through our site by advertising partners to build a profile of your interests and show you
        relevant ads on other sites.{" "}
        <strong>(Include only if you use third-party advertising cookies).</strong>
      </li>
    </ul>
    <h3>3. Types of Cookies We Use</h3>
    <ul>
      <li>
        <strong>Session Cookies:</strong> Temporary cookies that expire when you close your browser.
      </li>
      <li>
        <strong>Persistent Cookies:</strong> Remain on your device for a set period or until you
        delete them.
      </li>
      <li>
        <strong>First-party Cookies:</strong> Set directly by TourEase.
      </li>
      <li>
        <strong>Third-party Cookies:</strong> Set by domains other than TourEase (e.g., Google
        Analytics). <strong>(List specific third parties if applicable).</strong>
      </li>
    </ul>
    <h3>4. Your Choices Regarding Cookies</h3>
    <p>
      Most web browsers allow some control of most cookies through the browser settings. You can
      usually configure your browser to block cookies or alert you when cookies are being sent.
      However, if you block essential cookies, some parts of the Service may not function correctly.
    </p>
    <p>
      You can often manage preferences for third-party analytics or advertising cookies through
      their respective opt-out tools or industry programs (e.g., NAI, DAA).{" "}
      <strong>Provide links if relevant.</strong>
    </p>
    <h3>5. Changes to This Cookie Policy</h3>
    <p>
      We may update this Cookie Policy from time to time. We will notify you of any changes by
      posting the new policy on this page and updating the "Effective Date".
    </p>
    <h3>6. Contact Us</h3>
    <p>
      If you have any questions about our use of cookies, please contact us at [Your Contact
      Email/Method].
    </p>
    <p style={{ marginTop: "20px", fontSize: "0.8rem", color: "#9ca3af", fontStyle: "italic" }}>
      Disclaimer: This is template text and requires review by a legal professional before use.
    </p>
  </>
);
// --- End Template Policy Content ---

// --- Inline Modal Component Definition (Enhanced Glassmorphism Styles) ---
const InlinePolicyModal = ({ isOpen, onRequestClose, title, children }) => {
  /* ... [Same modal component definition as before] ... */ const backdropStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(10, 10, 20, 0.5)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    zIndex: 1000,
  };
  const modalStyle = {
    position: "fixed",
    top: "50%",
    left: "50%",
    backgroundColor: "rgba(31, 41, 55, 0.8)",
    backdropFilter: "blur(15px)",
    WebkitBackdropFilter: "blur(15px)",
    color: "#e5e7eb",
    padding: "30px 35px",
    borderRadius: "20px",
    boxShadow: "0 15px 40px rgba(0, 0, 0, 0.5)",
    width: "90%",
    maxWidth: "750px",
    maxHeight: "85vh",
    display: "flex",
    flexDirection: "column",
    zIndex: 1001,
    border: "1px solid rgba(255, 255, 255, 0.15)",
  };
  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
    paddingBottom: "15px",
    marginBottom: "20px",
  };
  const titleStyle = { margin: 0, color: "#fcd34d", fontSize: "1.6rem", fontWeight: 600 };
  const closeButtonStyle = {
    background: "none",
    border: "none",
    fontSize: "2.2rem",
    lineHeight: 1,
    color: "#9ca3af",
    cursor: "pointer",
    padding: "0 5px",
    transition: "color 0.2s ease",
  };
  const bodyStyle = {
    overflowY: "auto",
    flexGrow: 1,
    lineHeight: 1.7,
    fontSize: "1rem",
    paddingRight: "15px",
  };
  const footerStyle = {
    borderTop: "1px solid rgba(255, 255, 255, 0.15)",
    paddingTop: "20px",
    marginTop: "25px",
    textAlign: "right",
  };
  const footerButtonStyle = {
    backgroundColor: "rgba(75, 85, 99, 0.8)",
    color: "#f3f4f6",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "12px 24px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 600,
    transition: "background-color 0.2s ease, transform 0.1s ease",
  };
  const footerButtonHoverStyle = {
    backgroundColor: "rgba(107, 114, 128, 0.9)",
    transform: "scale(1.03)",
  };
  const scrollbarStyle = ` .modal-body-content::-webkit-scrollbar { width: 10px; } .modal-body-content::-webkit-scrollbar-track { background: transparent; border-radius: 5px; } .modal-body-content::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.4); border-radius: 5px; border: 2px solid transparent; background-clip: content-box; } .modal-body-content::-webkit-scrollbar-thumb:hover { background: rgba(212, 175, 55, 0.6); } .modal-body-content { scrollbar-width: thin; scrollbar-color: rgba(212, 175, 55, 0.4) transparent; } `;
  return (
    <AnimatePresence>
      {" "}
      {isOpen && (
        <>
          {" "}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={backdropStyle}
            onClick={onRequestClose}
          />{" "}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 50, rotateX: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 50, rotateX: -10 }}
            transition={{ type: "spring", stiffness: 260, damping: 25, mass: 0.8 }}
            style={{ ...modalStyle, transform: "translate(-50%, -50%)" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {" "}
            <div style={headerStyle}>
              {" "}
              <h2 id="modal-title" style={titleStyle}>
                {title}
              </h2>{" "}
              <motion.button
                whileHover={{ color: "#f3f4f6", rotate: 90 }}
                onClick={onRequestClose}
                style={closeButtonStyle}
                aria-label="Close modal"
              >
                &times;
              </motion.button>{" "}
            </div>{" "}
            <div style={bodyStyle} className="modal-body-content">
              {" "}
              <style>
                {" "}
                {` .modal-body-content p { margin-bottom: 1.1em; color: #d1d5db; } .modal-body-content h2 { font-size: 1.4rem; color: #fcd34d; margin-top: 10px; margin-bottom: 18px;} .modal-body-content h3 { color: #93c5fd; margin-top: 28px; margin-bottom: 12px; font-size: 1.15rem; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 6px;} .modal-body-content ul { padding-left: 30px; margin-bottom: 18px; list-style: disc; } .modal-body-content li { margin-bottom: 10px; } .modal-body-content strong { color: #fde047; } ${scrollbarStyle} `}{" "}
              </style>{" "}
              {children}{" "}
            </div>{" "}
            <div style={footerStyle}>
              {" "}
              <motion.button
                onClick={onRequestClose}
                style={footerButtonStyle}
                whileHover={footerButtonHoverStyle}
                whileTap={{ scale: 0.97 }}
              >
                {" "}
                Close{" "}
              </motion.button>{" "}
            </div>{" "}
          </motion.div>{" "}
        </>
      )}{" "}
    </AnimatePresence>
  );
};
// --- End Inline Modal Definition ---

// --- SignUp Component ---
const SignUp = () => {
  // ... (State variables and useEffects remain the same) ...
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // REMOVED rememberMe state
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToMarketing, setAgreedToMarketing] = useState(false);
  const [agreedToCookies, setAgreedToCookies] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, color: "#666" });
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
  });

  const videoRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.email) setFormData((prev) => ({ ...prev, email: location.state.email }));
    setError("");
  }, [location.state]);

  // Keep useEffect for video volume
  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = 0.5;
  }, []);

  const checkPasswordStrength = (password) => {
    /* ... [same function] ... */ const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    setPasswordChecks(checks);
    const score = Object.values(checks).filter(Boolean).length;
    const strengthLevels = [
      { color: "#ef4444" },
      { color: "#ef4444" },
      { color: "#f9716" },
      { color: "#f59e0b" },
      { color: "#eab308" },
      { color: "#22c55e" },
    ];
    setPasswordStrength({ score, color: strengthLevels[score]?.color || "#ef4444" });
  };
  const handleChange = (e) => {
    /* ... [same function] ... */ const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "password") {
      if (value.length > 0) checkPasswordStrength(value);
      else {
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
    /* ... [same function, uses default token storage] ... */ e.preventDefault();
    setError("");
    if (!agreedToTerms) {
      setError("❌ Please agree to the Terms of Service.");
      return;
    }
    if (!agreedToPrivacy) {
      setError("❌ Please acknowledge the Privacy Policy.");
      return;
    }
    if (!agreedToCookies) {
      setError("❌ Please accept the Cookie Policy.");
      return;
    }
    if (passwordStrength.score < 5) {
      setError("❌ Password does not meet strength requirements.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("❌ Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      setToken(response.data.token);
      if (response.data.username) setUsername(response.data.username);
      login({ username: response.data.username });
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const openTermsModal = (e) => {
    e.preventDefault();
    setIsTermsModalOpen(true);
  };
  const closeTermsModal = () => setIsTermsModalOpen(false);
  const openPrivacyModal = (e) => {
    e.preventDefault();
    setIsPrivacyModalOpen(true);
  };
  const closePrivacyModal = () => setIsPrivacyModalOpen(false);
  const openCookieModal = (e) => {
    e.preventDefault();
    setIsCookieModalOpen(true);
  };
  const closeCookieModal = () => setIsCookieModalOpen(false);

  // --- Framer Motion Variants for Form Elements ---
  const formContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
  };
  const formItemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 15 } },
  };

  const Requirement = ({ met, text }) => (
    <motion.div
      variants={formItemVariants}
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
    </motion.div>
  );
  const consentStyle = {
    display: "flex",
    alignItems: "start",
    gap: "10px",
    marginBottom: "12px",
    fontSize: "13px",
    color: "#cbd5e1",
  };
  const consentLabelStyle = { lineHeight: 1.5 };
  const consentLinkStyle = {
    color: "#60a5fa",
    textDecoration: "underline",
    cursor: "pointer",
    transition: "color 0.2s ease",
  };
  const consentLinkHoverStyle = { color: "#93c5fd" };

  return (
    // Outer div remains the same
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      {/* --- ADDED INLINE STYLE TO OVERRIDE NEGATIVE MARGIN --- */}
      <div
        className="left"
        style={{
          marginTop: "0px", // Override the -140px from auth.css
          // We keep align-items: center and justify-content: center from auth.css implicitly
        }}
      >
        {/* REMOVED marginTop from form-container */}
        <motion.div
          className="form-container"
          variants={formContainerVariants}
          initial="hidden"
          animate="visible"
          // style={{ marginTop: '140px' }} // REMOVED THIS LINE
        >
          {/* ... (rest of the form content) ... */}
          <motion.div variants={formItemVariants} className="logo">
            <span>Tour</span>
            <span>Ease</span>
          </motion.div>
          {error && (
            <motion.div variants={formItemVariants} className="error-banner">
              {error}
            </motion.div>
          )}

          <form id="signupForm" onSubmit={handleSubmit}>
            <motion.label variants={formItemVariants}>Username</motion.label>
            <motion.input
              variants={formItemVariants}
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <motion.label variants={formItemVariants} style={{ marginTop: "10px" }}>
              Email address
            </motion.label>
            <motion.input
              variants={formItemVariants}
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <motion.label variants={formItemVariants} style={{ marginTop: "10px" }}>
              Password
            </motion.label>
            <motion.input
              variants={formItemVariants}
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <AnimatePresence>
              {formData.password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ marginTop: "8px", marginBottom: "12px", overflow: "hidden" }}
                  variants={formItemVariants}
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
                  <motion.div
                    variants={formContainerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}
                  >
                    <Requirement met={passwordChecks.length} text="8+ characters" />
                    <Requirement met={passwordChecks.lowercase} text="Lowercase" />
                    <Requirement met={passwordChecks.uppercase} text="Uppercase" />
                    <Requirement met={passwordChecks.number} text="Number" />
                    <Requirement met={passwordChecks.special} text="Special char" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.label variants={formItemVariants} style={{ marginTop: "10px" }}>
              Confirm Password
            </motion.label>
            <motion.input
              variants={formItemVariants}
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <motion.div
              variants={formItemVariants}
              style={{ marginTop: "20px", marginBottom: "20px" }}
            >
              <div style={consentStyle}>
                {" "}
                <input
                  type="checkbox"
                  id="termsConsent"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  required
                  style={{ marginTop: "3px", flexShrink: 0 }}
                />{" "}
                <label htmlFor="termsConsent" style={consentLabelStyle}>
                  {" "}
                  I agree to the TourEase{" "}
                  <a
                    href="#terms"
                    onClick={openTermsModal}
                    style={consentLinkStyle}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = consentLinkHoverStyle.color)
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.color = consentLinkStyle.color)}
                  >
                    Terms of Service
                  </a>
                  .*{" "}
                </label>{" "}
              </div>
              <div style={consentStyle}>
                {" "}
                <input
                  type="checkbox"
                  id="privacyConsent"
                  checked={agreedToPrivacy}
                  onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                  required
                  style={{ marginTop: "3px", flexShrink: 0 }}
                />{" "}
                <label htmlFor="privacyConsent" style={consentLabelStyle}>
                  {" "}
                  I acknowledge the{" "}
                  <a
                    href="#privacy"
                    onClick={openPrivacyModal}
                    style={consentLinkStyle}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = consentLinkHoverStyle.color)
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.color = consentLinkStyle.color)}
                  >
                    Privacy Policy
                  </a>
                  .*{" "}
                </label>{" "}
              </div>
              <div style={consentStyle}>
                {" "}
                <input
                  type="checkbox"
                  id="cookieConsent"
                  checked={agreedToCookies}
                  onChange={(e) => setAgreedToCookies(e.target.checked)}
                  required
                  style={{ marginTop: "3px", flexShrink: 0 }}
                />{" "}
                <label htmlFor="cookieConsent" style={consentLabelStyle}>
                  {" "}
                  I accept the use of cookies as described in the{" "}
                  <a
                    href="#cookies"
                    onClick={openCookieModal}
                    style={consentLinkStyle}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = consentLinkHoverStyle.color)
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.color = consentLinkStyle.color)}
                  >
                    Cookie Policy
                  </a>
                  .*{" "}
                </label>{" "}
              </div>
              <div style={consentStyle}>
                {" "}
                <input
                  type="checkbox"
                  id="marketingConsent"
                  checked={agreedToMarketing}
                  onChange={(e) => setAgreedToMarketing(e.target.checked)}
                  style={{ marginTop: "3px", flexShrink: 0 }}
                />{" "}
                <label htmlFor="marketingConsent" style={consentLabelStyle}>
                  {" "}
                  I would like to receive occasional emails about new features, promotions, and tips
                  (optional).{" "}
                </label>{" "}
              </div>
            </motion.div>

            {/* Remember Me Checkbox REMOVED */}

            <motion.button
              variants={formItemVariants}
              type="submit"
              className="btn"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </motion.button>
          </form>

          <motion.div variants={formItemVariants} className="divider">
            or
          </motion.div>
          <motion.div variants={formItemVariants} className="social-buttons">
            <button aria-label="Sign up with Google">
              <img src="https://www.svgrepo.com/show/355037/google.svg" alt="" /> Sign up with
              Google
            </button>
            <button aria-label="Sign up with Facebook">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
                alt=""
                style={{ height: "18px" }}
              />{" "}
              Sign up with Facebook
            </button>
          </motion.div>
          <motion.div variants={formItemVariants} className="signin">
            Already have an account? <Link to="/signin">Sign In</Link>
          </motion.div>
        </motion.div>{" "}
        {/* End form-container motion div */}
      </div>

      {/* Right side (Video) */}
      <div className="right">
        {/* Video code remains the same (no muted, ref added) */}
        <video ref={videoRef} className="hero-video" autoPlay loop playsInline>
          <source src="/assets/Welcome to Karnataka _ One State Many Worlds.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="video-overlay"></div>
      </div>

      {/* Render Modals using the inline definition (remain the same) */}
      <InlinePolicyModal
        isOpen={isTermsModalOpen}
        onRequestClose={closeTermsModal}
        title="Terms of Service"
      >
        {termsContent}
      </InlinePolicyModal>
      <InlinePolicyModal
        isOpen={isPrivacyModalOpen}
        onRequestClose={closePrivacyModal}
        title="Privacy Policy"
      >
        {privacyContent}
      </InlinePolicyModal>
      <InlinePolicyModal
        isOpen={isCookieModalOpen}
        onRequestClose={closeCookieModal}
        title="Cookie Policy"
      >
        {cookieContent}
      </InlinePolicyModal>
    </div>
  );
};

export default SignUp;
