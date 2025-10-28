import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// Scroll to top helper
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const Footer = () => {
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
      to: "/profile?tab=about",
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="site-footer"
    >
      <div className="footer-content">
        <div className="footer-brand">
          <h2>TourEase</h2>
          <p>
            Crafting luxurious, hyper-personalized journeys across India with curated stays,
            immersive experiences, and concierge precision.
          </p>
          <div className="footer-contact">
            {contactDetails.map((detail, idx) => (
              <div key={idx} className="footer-contact-item">
                <span>{detail.icon}</span>
                <span>{detail.text}</span>
              </div>
            ))}
          </div>
        </div>
        {conciergeActions.map((action) => (
          <div
            key={action.label}
            className={`footer-cta-block${
              action.align === "center" ? " footer-cta-block--center" : ""
            }`}
          >
            <span className="footer-cta-eyebrow">{action.eyebrow}</span>
            <h3>{action.heading}</h3>
            <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}>
              <Link to={action.to} className="footer-cta-button" onClick={scrollToTop}>
                {action.label}
              </Link>
            </motion.div>
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <span>© {year} TourEase. All rights reserved.</span>
        <span className="footer-bottom-text">
          Bespoke journeys • Dedicated concierge • Unforgettable stories
        </span>
      </div>
    </motion.footer>
  );
};

export default Footer;
