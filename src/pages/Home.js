// /client/src/pages/Home.js
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoSparkles,
  IoPerson,
  IoRestaurant,
  IoBed,
  IoMap,
  IoSwapHorizontal,
  IoChevronBack,
  IoChevronForward,
  IoAirplane,
  IoGlobe,
} from "react-icons/io5";

// --- CONSTANTS ---
const INDIAN_DESTINATIONS = [
  { id: 1, name: "Agra", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1000&auto=format&fit=crop", desc: "Home of the Taj Mahal." },
  { id: 2, name: "Jaipur", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1000&auto=format&fit=crop", desc: "The Pink City." },
  { id: 3, name: "Kerala", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1000&auto=format&fit=crop", desc: "God's Own Country." },
  { id: 4, name: "Ladakh", image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=1000&auto=format&fit=crop", desc: "Land of High Passes." },
  { id: 5, name: "Varanasi", image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1000&auto=format&fit=crop", desc: "Spiritual Capital." },
  { id: 6, name: "Goa", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1000&auto=format&fit=crop", desc: "Beaches & Heritage." },
  { id: 7, name: "Udaipur", image: "https://images.unsplash.com/photo-1595262366897-4089903960b7?q=80&w=1000&auto=format&fit=crop", desc: "City of Lakes." },
  { id: 8, name: "Hampi", image: "https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?q=80&w=1000&auto=format&fit=crop", desc: "Ancient Ruins." },
];

// --- STYLES OBJECTS (Inline CSS) ---
const styles = {
  container: {
    width: "100%",
    minHeight: "100vh",
    color: "#ffffff",
    fontFamily: "'Inter', sans-serif",
    overflowX: "hidden",
    position: "relative",
    paddingBottom: "100px",
    // Removed solid background color to let video show through
  },
  videoBackground: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: -1,
    overflow: "hidden",
    backgroundColor: "#000", // Fallback
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(2, 6, 23, 0.4)", // Lighter overlay for visibility
    zIndex: 10,
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.7, // Increased opacity
  },
  section: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "120px", // Reduced from 160px
    paddingBottom: "80px",
    paddingLeft: "24px",
    paddingRight: "24px",
    position: "relative",
  },
  heroTitleContainer: {
    textAlign: "center",
    marginBottom: "80px",
    zIndex: 20,
  },
  heroTitle: {
    fontSize: "clamp(4rem, 10vw, 9rem)",
    fontWeight: "bold",
    lineHeight: "0.9",
    letterSpacing: "-0.05em",
    color: "transparent",
    backgroundImage: "linear-gradient(to bottom, #ffffff, #fef3c7, #f59e0b)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.5))",
    margin: 0,
    cursor: "default",
  },
  heroSubtitle: {
    fontSize: "clamp(1rem, 2vw, 1.5rem)",
    fontWeight: "300",
    color: "#fef3c7",
    letterSpacing: "0.5em",
    textTransform: "uppercase",
    marginTop: "24px",
    textShadow: "0 4px 10px rgba(0,0,0,0.3)",
  },
  aestheticPhrase: {
    fontSize: "1.5rem",
    fontWeight: "300",
    color: "#e2e8f0",
    maxWidth: "800px",
    textAlign: "center",
    marginBottom: "80px",
    lineHeight: "1.6",
    textShadow: "0 2px 5px rgba(0,0,0,0.3)",
  },
  buttonGroup: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "40px",
    marginBottom: "100px",
    zIndex: 20,
  },
  primaryButton: {
    padding: "20px 40px",
    borderRadius: "9999px",
    backgroundColor: "#f59e0b",
    color: "#0f172a",
    fontWeight: "bold",
    fontSize: "1.125rem",
    border: "none",
    boxShadow: "0 10px 15px -3px rgba(245, 158, 11, 0.3)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  secondaryButton: {
    padding: "20px 40px",
    borderRadius: "9999px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: "1.125rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    transition: "background-color 0.2s",
  },
  tertiaryButton: {
    padding: "20px 40px",
    borderRadius: "9999px",
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(148, 163, 184, 0.5)",
    color: "#e2e8f0",
    fontWeight: "bold",
    fontSize: "1.125rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    transition: "background-color 0.2s",
  },
  carouselContainer: {
    position: "relative",
    width: "100%",
    maxWidth: "1400px",
    height: "600px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    perspective: "1000px",
    marginBottom: "128px",
  },
  card: {
    position: "absolute",
    width: "400px",
    height: "550px",
    borderRadius: "40px",
    overflow: "hidden",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    backgroundColor: "#0f172a",
    cursor: "pointer",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  cardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    padding: "40px",
    background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
  },
  navButton: {
    position: "absolute",
    zIndex: 30,
    padding: "24px",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#ffffff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  featuresSection: {
    padding: "96px 24px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  sectionHeader: {
    textAlign: "center",
    marginBottom: "80px",
  },
  sectionTitle: {
    fontSize: "clamp(3rem, 5vw, 4.5rem)",
    fontFamily: "serif",
    color: "#ffffff",
    marginBottom: "32px",
    textShadow: "0 4px 10px rgba(0,0,0,0.5)",
  },
  divider: {
    width: "128px",
    height: "4px",
    background: "linear-gradient(to right, transparent, #f59e0b, transparent)",
    margin: "0 auto",
    borderRadius: "9999px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "48px",
  },
  glassCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "40px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(24px)",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
    padding: "48px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "350px",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  toggleButton: {
    position: "fixed",
    bottom: "32px",
    left: "32px",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px 32px",
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(245, 158, 11, 0.3)",
    borderRadius: "9999px",
    color: "#fde68a",
    fontSize: "1.125rem",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
  },
};

// --- COMPONENTS ---

const GlobalVideoBackground = () => (
  <div style={styles.videoBackground}>
    <div style={styles.videoOverlay} />
    <video autoPlay loop muted playsInline style={styles.video}>
      <source src="/assets/hero-bg.mp4" type="video/mp4" />
    </video>
  </div>
);

const SpotlightCard = ({ children, style = {} }) => {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      style={{ ...styles.glassCard, ...style }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(212, 175, 55, 0.15), transparent 40%)`,
          pointerEvents: "none",
          transition: "opacity 0.3s",
          zIndex: 0,
        }}
      />
      <div style={{ position: "relative", zIndex: 10 }}>{children}</div>
    </div>
  );
};

const ModernHome = ({ navigate }) => {
  const [activeIndex, setActiveIndex] = useState(2);

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % INDIAN_DESTINATIONS.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + INDIAN_DESTINATIONS.length) % INDIAN_DESTINATIONS.length);

  const getVisibleCards = () => {
    const cards = [];
    const len = INDIAN_DESTINATIONS.length;
    for (let i = -2; i <= 2; i++) {
      const index = (activeIndex + i + len) % len;
      cards.push({ ...INDIAN_DESTINATIONS[index], offset: i });
    }
    return cards;
  };

  return (
    <div style={styles.container}>
      {/* HERO SECTION */}
      <section style={styles.section}>
        {/* FADE TEXT - Scroll Reveal */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            marginBottom: "32px",
            color: "rgba(253, 230, 138, 0.8)",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            fontSize: "0.9rem",
          }}
        >
          Discover • Experience • Remember
        </motion.div>

        {/* TITLE - Scroll Reveal */}
        <div style={styles.heroTitleContainer}>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={styles.heroTitle}
            whileHover={{ scale: 1.05, letterSpacing: "-0.02em" }}
          >
            TOUREASE
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
            style={styles.heroSubtitle}
          >
            The Art of Travel
          </motion.p>
        </div>

        {/* PHRASE - Scroll Reveal */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, duration: 0.8 }}
          style={styles.aestheticPhrase}
        >
          "Wander where the WiFi is weak and the memories are strong."
        </motion.p>

        {/* BUTTONS - Scroll Reveal */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9, duration: 0.8 }}
          style={styles.buttonGroup}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/explore")}
            style={styles.primaryButton}
          >
            <IoMap size={24} /> Start Your Journey Here
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/trending")}
            style={styles.secondaryButton}
          >
            <IoSparkles size={24} color="#fbbf24" /> See What's Trending Now
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/planner")}
            style={styles.tertiaryButton}
          >
            <IoBed size={24} /> Craft Your Perfect Trip
          </motion.button>
        </motion.div>

        {/* CAROUSEL - Scroll Reveal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          style={styles.carouselContainer}
        >
          <AnimatePresence mode="popLayout">
            {getVisibleCards().map((dest) => {
              const { offset } = dest;
              const isActive = offset === 0;

              return (
                <motion.div
                  key={`${dest.id}-${offset}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    x: offset * 280,
                    scale: isActive ? 1.2 : 0.85,
                    rotateY: offset * -30,
                    zIndex: 10 - Math.abs(offset),
                    opacity: isActive ? 1 : 0.6,
                    filter: isActive ? "blur(0px)" : "blur(3px) brightness(60%)",
                  }}
                  transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
                  style={styles.card}
                  onClick={() => {
                    if (offset === 0) navigate(`/explore?query=${encodeURIComponent(dest.name)}`);
                    else if (offset < 0) handlePrev();
                    else handleNext();
                  }}
                >
                  <img src={dest.image} alt={dest.name} style={styles.cardImage} />
                  <div style={styles.cardOverlay}>
                    <h3 style={{ fontSize: "2.25rem", fontWeight: "bold", marginBottom: "12px" }}>{dest.name}</h3>
                    <p style={{ fontSize: "1rem", color: "#e2e8f0" }}>{dest.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <button onClick={handlePrev} style={{ ...styles.navButton, left: "40px" }}>
            <IoChevronBack size={32} />
          </button>
          <button onClick={handleNext} style={{ ...styles.navButton, right: "40px" }}>
            <IoChevronForward size={32} />
          </button>
        </motion.div>
      </section>

      {/* FEATURES - Scroll Reveal */}
      <section style={styles.featuresSection}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={styles.sectionHeader}
        >
          <h2 style={styles.sectionTitle}>Why Choose Us?</h2>
          <div style={styles.divider} />
        </motion.div>

        <div style={styles.grid}>
          {[
            { title: "AI Architect", desc: "Smart itineraries tailored to you.", icon: <IoSparkles /> },
            { title: "Concierge", desc: "24/7 Personal support.", icon: <IoPerson /> },
            { title: "Luxury Stays", desc: "Handpicked boutique hotels.", icon: <IoBed /> },
            { title: "Fine Dining", desc: "Reservations at top tables.", icon: <IoRestaurant /> },
            { title: "Private Charter", desc: "Exclusive jets and choppers.", icon: <IoAirplane /> },
            { title: "Cultural Deep Dives", desc: "Immersive local traditions.", icon: <IoGlobe /> },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03, rotate: 1 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
            >
              <SpotlightCard>
                <div style={{ fontSize: "4rem", color: "#fbbf24", marginBottom: "32px", filter: "drop-shadow(0 0 15px rgba(251,191,36,0.4))" }}>
                  {feature.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: "1.875rem", fontWeight: "bold", marginBottom: "16px", color: "#fff" }}>{feature.title}</h3>
                  <p style={{ fontSize: "1.25rem", color: "#cbd5e1", lineHeight: "1.6" }}>{feature.desc}</p>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

// --- CLASSIC HOME (Inline CSS) ---
const ClassicHome = ({ navigate }) => {
  const features = [
    { title: "Intelligent Journey Designer", description: "AI-curated escapes.", icon: "🧠" },
    { title: "Private Concierge Support", description: "Your personal travel stylist.", icon: "🤵" },
    { title: "Immersive Cultural Moments", description: "After-hours palace tours.", icon: "🏛️" },
    { title: "Dynamic Weather Insights", description: "Live micro-climate forecasts.", icon: "🌦️" },
    { title: "Private Charter", description: "Exclusive jets and choppers.", icon: "✈️" },
    { title: "Cultural Deep Dives", description: "Immersive local traditions.", icon: "🌏" },
  ];

  return (
    <div style={{ ...styles.container, paddingTop: "80px" }}> {/* Reduced padding from 160px to 80px */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{ ...styles.section, minHeight: "60vh", paddingBottom: "80px", paddingTop: "40px" }} // Reduced internal padding
      >
        <motion.span
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            display: "inline-block",
            padding: "12px 32px",
            borderRadius: "9999px",
            backgroundColor: "rgba(245, 158, 11, 0.1)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            color: "#fcd34d",
            fontSize: "0.875rem",
            fontWeight: "500",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "32px", // Reduced margin
            backdropFilter: "blur(12px)",
          }}
        >
          Where Whimsy Meets Wanderlust
        </motion.span>
        <motion.h1
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          style={{
            fontSize: "clamp(3rem, 8vw, 6rem)",
            fontWeight: "bold",
            color: "transparent",
            backgroundImage: "linear-gradient(to bottom, #fef3c7, #f59e0b)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            marginBottom: "32px", // Reduced margin
            textAlign: "center",
            lineHeight: "1.1",
          }}
        >
          Discover the Unseen
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            fontSize: "1.25rem",
            color: "#cbd5e1",
            maxWidth: "800px",
            textAlign: "center",
            marginBottom: "48px", // Reduced margin
            lineHeight: "1.7",
          }}
        >
          Let moonlit palaces, spice-scented markets, and secret coffee trails unfold as we craft your next chapter across India's most enchanting escapes.
        </motion.p>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={styles.buttonGroup}
        >
          <button onClick={() => navigate("/explore")} style={styles.primaryButton}>
            <IoMap /> Start Exploring
          </button>
          <button onClick={() => navigate("/trending")} style={styles.secondaryButton}>
            <IoSparkles /> Trending Now
          </button>
        </motion.div>
      </motion.div>

      <section style={styles.featuresSection}>
        <div style={styles.sectionHeader}>
          <h2 style={{ ...styles.sectionTitle, color: "#fbbf24" }}>Why Choose TourEase?</h2>
          <p style={{ fontSize: "1.25rem", color: "#94a3b8", maxWidth: "800px", margin: "0 auto" }}>
            Experience the perfect blend of AI intelligence and human-curated luxury.
          </p>
        </div>

        <div style={styles.grid}>
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              style={{
                backgroundColor: "rgba(30, 41, 59, 0.4)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                padding: "40px",
                borderRadius: "32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                transition: "border-color 0.3s",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "32px" }}>{feature.icon}</div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "16px", color: "#f1f5f9" }}>{feature.title}</h3>
              <p style={{ color: "#94a3b8", lineHeight: "1.6" }}>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

// --- MAIN HOME COMPONENT ---
const Home = () => {
  const navigate = useNavigate();
  const [isModern, setIsModern] = useState(true);

  return (
    <>
      <GlobalVideoBackground />
      
      <div style={styles.toggleButton}>
        <button
          onClick={() => setIsModern(!isModern)}
          style={{
            background: "none",
            border: "none",
            color: "inherit",
            font: "inherit",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <IoSwapHorizontal size={24} /> 
          <span>{isModern ? "Switch to Classic View" : "Switch to Modern View"}</span>
        </button>
      </div>

      {isModern ? (
        <ModernHome navigate={navigate} />
      ) : (
        <ClassicHome navigate={navigate} />
      )}
    </>
  );
};

export default Home;
