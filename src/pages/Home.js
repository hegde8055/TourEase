// /client/src/pages/Home.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  IoSparkles,
  IoMap,
  IoChevronBack,
  IoChevronForward,
  IoAirplane,
  IoCompass,
  IoPlanet,
  IoLocation,
  IoWallet,
  IoPerson,
  IoGlobe,
  IoSwapHorizontal,
} from "react-icons/io5";

// --- CONSTANTS ---
const INDIAN_DESTINATIONS = [
  {
    id: 1,
    name: "Agra",
    image:
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1000&auto=format&fit=crop",
    desc: "Home of the Taj Mahal.",
  },
  {
    id: 2,
    name: "Jaipur",
    image:
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1000&auto=format&fit=crop",
    desc: "The Pink City.",
  },
  {
    id: 3,
    name: "Kerala",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1000&auto=format&fit=crop",
    desc: "God's Own Country.",
  },
  {
    id: 4,
    name: "Ladakh",
    image:
      "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=1000&auto=format&fit=crop",
    desc: "Land of High Passes.",
  },
  {
    id: 5,
    name: "Varanasi",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Ahilya_Ghat_by_the_Ganges%2C_Varanasi.jpg/1200px-Ahilya_Ghat_by_the_Ganges%2C_Varanasi.jpg",
    desc: "Spiritual Capital.",
  },
  {
    id: 6,
    name: "Goa",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1000&auto=format&fit=crop",
    desc: "Beaches & Heritage.",
  },
  {
    id: 7,
    name: "Udaipur",
    image:
      "https://images.unsplash.com/photo-1595262366897-4089903960b7?q=80&w=1000&auto=format&fit=crop",
    desc: "City of Lakes.",
  },
  {
    id: 8,
    name: "Hampi",
    image:
      "https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?q=80&w=1000&auto=format&fit=crop",
    desc: "Ancient Ruins.",
  },
];

// --- STYLES (Cinematic Glassmorphism) ---
const styles = {
  container: {
    width: "100%",
    minHeight: "100vh",
    color: "#ffffff",
    fontFamily: "'Inter', sans-serif",
    overflowX: "hidden",
    position: "relative",
    backgroundColor: "#000",
  },
  videoBackground: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
    objectFit: "cover",
    opacity: 0.6, // Slightly visible initially
  },
  gradientOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 1,
    background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 50%, #000 100%)",
    pointerEvents: "none",
  },
  driftingIconsContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 2,
    pointerEvents: "none",
    overflow: "hidden",
  },
  contentLayer: {
    position: "relative",
    zIndex: 10,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  introSection: {
    height: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  studioLogo: {
    fontSize: "clamp(4rem, 12vw, 10rem)",
    fontWeight: "900",
    letterSpacing: "-0.02em",
    color: "transparent",
    backgroundImage: "linear-gradient(to bottom, #fff 20%, #94a3b8 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    filter: "drop-shadow(0 0 40px rgba(255,255,255,0.3))",
    textAlign: "center",
    lineHeight: 1,
    zIndex: 20,
  },
  tagline: {
    fontSize: "1.2rem",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: "0.4em",
    textTransform: "uppercase",
    marginTop: "2rem",
    fontWeight: 300,
    textAlign: "center",
  },
  glassCard: {
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "24px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
    overflow: "hidden",
  },
  toggleButton: {
    position: "fixed",
    bottom: "32px",
    left: "32px", // Moved to Bottom-Left
    zIndex: 100,
    padding: "12px 24px",
    background: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "999px",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "0.9rem",
    fontWeight: 600,
    transition: "all 0.3s ease",
  },
  // Classic Styles
  section: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "120px",
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
    height: "100%",
    background: "linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.6) 40%, transparent)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    padding: "32px",
  },
  navButton: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    color: "#fff",
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 20,
    transition: "background-color 0.2s, transform 0.2s",
  },
  featuresSection: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "40px",
    width: "100%",
    maxWidth: "1400px",
    marginBottom: "160px",
    padding: "0 24px",
  },
  featureCard: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "32px",
    padding: "48px 32px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    transition: "transform 0.3s, box-shadow 0.3s",
    cursor: "default",
  },
  featureIcon: {
    fontSize: "3.5rem",
    color: "#f59e0b",
    marginBottom: "24px",
    filter: "drop-shadow(0 0 15px rgba(245, 158, 11, 0.4))",
  },
  featureTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: "16px",
  },
  featureDesc: {
    fontSize: "1rem",
    color: "#94a3b8",
    lineHeight: "1.6",
  },
};

// --- COMPONENTS ---

const DriftingIcons = () => {
  const icons = [IoAirplane, IoCompass, IoPlanet, IoLocation, IoMap, IoSparkles];
  return (
    <div style={styles.driftingIconsContainer}>
      {icons.map((Icon, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0,
          }}
          animate={{
            y: [null, Math.random() * -100],
            x: [null, (Math.random() - 0.5) * 50],
            opacity: [0, 0.15, 0],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5,
          }}
          style={{ position: "absolute", color: "#fff", fontSize: `${20 + Math.random() * 40}px` }}
        >
          <Icon />
        </motion.div>
      ))}
    </div>
  );
};

const ModernHome = ({ navigate }) => {
  const { scrollY } = useScroll();
  const logoScale = useTransform(scrollY, [0, 300], [1, 0.3]);
  const logoY = useTransform(scrollY, [0, 300], [0, -window.innerHeight / 2 + 40]);

  // Carousel Logic
  const [activeIndex, setActiveIndex] = useState(2);
  const handleNext = () => setActiveIndex((prev) => (prev + 1) % INDIAN_DESTINATIONS.length);
  const handlePrev = () =>
    setActiveIndex((prev) => (prev - 1 + INDIAN_DESTINATIONS.length) % INDIAN_DESTINATIONS.length);

  useEffect(() => {
    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval);
  }, []);

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
    <div style={styles.contentLayer}>
      {/* INTRO SECTION */}
      <section style={styles.introSection}>
        <motion.div
          style={{ scale: logoScale, y: logoY, zIndex: 50 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <h1 style={styles.studioLogo}>TOUREASE</h1>
        </motion.div>

        <motion.p
          style={{ ...styles.tagline, opacity: useTransform(scrollY, [0, 100], [1, 0]) }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          DISCOVER &bull; EXPERIENCE &bull; REMEMBER
        </motion.p>
      </section>

      {/* CAROUSEL SECTION */}
      <section style={{ width: "100%", padding: "100px 0", position: "relative", zIndex: 20 }}>
        <div
          style={{
            height: "600px",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            perspective: "1000px",
          }}
        >
          <AnimatePresence mode="popLayout">
            {getVisibleCards().map((dest) => {
              const { offset } = dest;
              const isActive = offset === 0;
              return (
                <motion.div
                  key={dest.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    x: offset * 260,
                    z: Math.abs(offset) * -100,
                    rotateY: offset * -15,
                    scale: isActive ? 1.1 : 0.85,
                    opacity: isActive ? 1 : 0.5,
                    filter: isActive ? "blur(0px)" : "blur(4px)",
                  }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                  style={{
                    position: "absolute",
                    width: "380px",
                    height: "520px",
                    borderRadius: "30px",
                    overflow: "hidden",
                    cursor: "pointer",
                    boxShadow: isActive ? "0 25px 50px -12px rgba(0,0,0,0.7)" : "none",
                    border: isActive ? "1px solid rgba(255,255,255,0.2)" : "none",
                  }}
                  onClick={() => {
                    if (isActive) navigate(`/explore?destination=${encodeURIComponent(dest.name)}`);
                    else if (offset < 0) handlePrev();
                    else handleNext();
                  }}
                >
                  <img
                    src={dest.image}
                    alt={dest.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "100%",
                      padding: "30px",
                      background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
                    }}
                  >
                    <h3 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "8px" }}>
                      {dest.name}
                    </h3>
                    <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.8)" }}>
                      {dest.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "30px",
          padding: "0 5%",
          width: "100%",
          maxWidth: "1400px",
          marginBottom: "150px",
        }}
      >
        {[
          { title: "AI Planner", icon: <IoSparkles />, desc: "Smart itineraries tailored to you." },
          { title: "Hidden Gems", icon: <IoMap />, desc: "Discover places off the beaten path." },
          { title: "Luxury Stays", icon: <IoPlanet />, desc: "Handpicked premium accommodations." },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            style={{
              ...styles.glassCard,
              padding: "40px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <div
              style={{
                fontSize: "3rem",
                color: "#f59e0b",
                filter: "drop-shadow(0 0 10px rgba(245, 158, 11, 0.4))",
              }}
            >
              {feature.icon}
            </div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{feature.title}</h3>
            <p style={{ color: "#94a3b8", lineHeight: "1.6" }}>{feature.desc}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
};

// --- CLASSIC HOME (Preserved) ---
const ClassicHome = ({ navigate }) => {
  const features = [
    {
      title: "Intelligent Journey Designer",
      description: "AI-curated escapes.",
      icon: <IoSparkles />,
    },
    {
      title: "Private Concierge Support",
      description: "Your personal travel stylist.",
      icon: <IoPerson />,
    },
    {
      title: "Immersive Cultural Moments",
      description: "After-hours palace tours.",
      icon: <IoGlobe />,
    },
    {
      title: "Dynamic Weather Insights",
      description: "Live micro-climate forecasts.",
      icon: <IoPlanet />,
    },
    {
      title: "Hidden Gems Discovery",
      description: "Find nearby local treasures.",
      icon: <IoCompass />,
    },
    { title: "Cultural Deep Dives", description: "Immersive local traditions.", icon: <IoMap /> },
  ];

  // Carousel Logic for Classic View
  const [activeIndex, setActiveIndex] = useState(2);
  const handleNext = () => setActiveIndex((prev) => (prev + 1) % INDIAN_DESTINATIONS.length);
  const handlePrev = () =>
    setActiveIndex((prev) => (prev - 1 + INDIAN_DESTINATIONS.length) % INDIAN_DESTINATIONS.length);

  useEffect(() => {
    const interval = setInterval(handleNext, 4000);
    return () => clearInterval(interval);
  }, []);

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
    <div style={{ ...styles.container, paddingTop: "80px" }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={styles.section}
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={styles.heroTitleContainer}
        >
          <h1 style={{ ...styles.heroTitle, fontSize: "clamp(3rem, 6vw, 5rem)" }}>TOUREASE</h1>
          <p style={styles.heroSubtitle}>CLASSIC COLLECTION</p>
        </motion.div>

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

        {/* CLASSIC CAROUSEL */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          style={{ ...styles.carouselContainer, marginTop: "80px", marginBottom: "0" }}
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
                    if (offset === 0)
                      navigate(`/explore?destination=${encodeURIComponent(dest.name)}`);
                    else if (offset < 0) handlePrev();
                    else handleNext();
                  }}
                >
                  <img src={dest.image} alt={dest.name} style={styles.cardImage} />
                  <div style={styles.cardOverlay}>
                    <h3 style={{ fontSize: "2.25rem", fontWeight: "bold", marginBottom: "12px" }}>
                      {dest.name}
                    </h3>
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
      </motion.div>

      <section style={styles.featuresSection}>
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            style={{
              ...styles.featureCard,
              padding: "32px",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "24px",
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "16px", color: "#f59e0b" }}>
              {feature.icon}
            </div>
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                color: "#fff",
                marginBottom: "8px",
              }}
            >
              {feature.title}
            </h3>
            <p style={{ color: "#cbd5e1", fontSize: "0.95rem" }}>{feature.description}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("modern"); // 'modern' or 'classic'

  return (
    <div style={styles.container}>
      {/* BACKGROUND VIDEO */}
      <video autoPlay loop muted playsInline style={styles.videoBackground}>
        <source src="/assets/hero-bg.mp4" type="video/mp4" />
      </video>
      <div style={styles.gradientOverlay} />

      {/* DRIFTING ICONS */}
      <DriftingIcons />

      {/* CONTENT */}
      {viewMode === "modern" ? (
        <ModernHome navigate={navigate} />
      ) : (
        <ClassicHome navigate={navigate} />
      )}

      {/* VIEW TOGGLE */}
      <motion.button
        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255,255,255,0.3)" }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setViewMode((prev) => (prev === "modern" ? "classic" : "modern"))}
        style={styles.toggleButton}
      >
        {viewMode === "modern" ? <IoCompass size={20} /> : <IoSparkles size={20} />}
        <span>Switch to {viewMode === "modern" ? "Classic" : "Cinematic"}</span>
      </motion.button>
    </div>
  );
};

export default Home;
