import React from "react";
import { Link } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

// Smooth scroll helper
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const Footer = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });

  React.useEffect(() => {
    if (inView) controls.start("visible");
  }, [controls, inView]);

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: i * 0.25, ease: "easeOut" },
    }),
  };

  const conciergeActions = [
    {
      eyebrow: "Need a hand?",
      heading:
        "Speak with our concierge team for tailored itineraries, upgrades, and last-minute magic.",
      to: "/profile?tab=contact",
      label: "Contact Us",
    },
    {
      eyebrow: "Wanna know about us?",
      heading: "Discover the story, vision, and people who craft TourEase's signature journeys.",
      to: "/about",
      label: "About TourEase",
      align: "center",
    },
  ];

  const contactDetails = [
    { icon: "📍", text: "Bengaluru, Karnataka" },
    { icon: "📧", text: "support@tourease.com" },
    { icon: "📞", text: "+91 1800 123 4567" },
  ];

  const year = new Date().getFullYear();

  return (
    <motion.footer
      ref={ref}
      initial="hidden"
      animate={controls}
      className="site-footer"
      style={{
        background: "rgba(10,15,25,0.85)",
        backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        color: "#cbd5e1",
      }}
    >
      <div className="footer-content">
        {/* 🏷️ Brand Section */}
        <motion.div
          variants={fadeUp}
          custom={0}
          className="footer-brand"
          style={{ flex: "1", minWidth: "260px" }}
        >
          <h2
            style={{
              color: "var(--gold)",
              fontWeight: "700",
              marginBottom: "10px",
            }}
          >
            TourEase
          </h2>
          <p style={{ maxWidth: "380px", lineHeight: "1.7" }}>
            Crafting luxurious, hyper-personalized journeys across India with curated stays,
            immersive experiences, and concierge precision.
          </p>

          <div className="footer-contact">
            {contactDetails.map((detail, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                custom={idx + 1}
                className="footer-contact-item"
              >
                <span style={{ marginRight: "8px" }}>{detail.icon}</span>
                <span>{detail.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 💫 Concierge Blocks */}
        {conciergeActions.map((action, index) => (
          <motion.div
            key={action.label}
            variants={fadeUp}
            custom={index + 2}
            className={`footer-cta-block${
              action.align === "center" ? " footer-cta-block--center" : ""
            }`}
            style={{
              flex: "1",
              minWidth: "260px",
              textAlign: action.align || "left",
            }}
          >
            <span
              className="footer-cta-eyebrow"
              style={{
                display: "block",
                fontSize: "0.9rem",
                color: "#9ca3af",
                marginBottom: "6px",
              }}
            >
              {action.eyebrow}
            </span>

            <h3
              style={{
                color: "#e5e7eb",
                fontSize: "1.1rem",
                lineHeight: "1.6",
                marginBottom: "16px",
              }}
            >
              {action.heading}
            </h3>

            <motion.div whileHover={{ y: -4, scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                to={action.to}
                onClick={scrollToTop}
                className="footer-cta-button"
                style={{
                  display: "inline-block",
                  padding: "12px 24px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, var(--gold), var(--blue))",
                  color: "#0b0e14",
                  fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "0 6px 18px rgba(212,175,55,0.3)",
                  transition: "all 0.3s ease",
                }}
              >
                {action.label}
              </Link>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Footer bottom area */}
      <motion.div
        variants={fadeUp}
        custom={4}
        className="footer-bottom"
        style={{
          marginTop: "40px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: "20px",
          textAlign: "center",
          fontSize: "0.95rem",
        }}
      >
        <span>© {year} TourEase. All rights reserved.</span>
        <br />
        <span className="footer-bottom-text" style={{ opacity: 0.75 }}>
          Bespoke journeys • Dedicated concierge • Unforgettable stories
        </span>
      </motion.div>

      {/* Responsive adjustments */}
      <style>
        {`
          @media (max-width: 900px) {
            .footer-content {
              flex-direction: column;
              gap: 30px;
              text-align: center;
            }
            .footer-cta-block--center {
              text-align: center !important;
            }
            .footer-brand {
              align-items: center;
              margin-bottom: 20px;
            }
          }
          .footer-content {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 40px;
            padding: 50px 30px;
          }
          .footer-contact-item {
            margin-top: 8px;
            font-size: 0.95rem;
          }
          .footer-cta-button:hover {
            box-shadow: 0 0 20px rgba(212,175,55,0.45);
            transform: translateY(-2px);
          }
        `}
      </style>
    </motion.footer>
  );
};

export default Footer;
