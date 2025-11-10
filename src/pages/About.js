import React from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

// ✅ NEW: Added a style tag for the responsive grid.
// Inline styles can't handle media queries, so this is the cleanest way.
const gridStyles = `
  .about-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 40px 60px;
    max-width: 1200px;
    margin: 0 auto;
  }

  @media (max-width: 900px) {
    .about-grid {
      grid-template-columns: 1fr;
    }
  }
`;

const About = () => {
  return (
    <div className="main-content">
      <Navbar />
      <style>{gridStyles}</style>

      {/* ✨ Animated Gold Gradient Background (Unchanged) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(800px 400px at 20% 20%, rgba(212,175,55,0.15), transparent 70%), radial-gradient(800px 500px at 80% 80%, rgba(244,229,161,0.12), transparent 70%), #0b0e14",
          zIndex: -1,
          overflow: "hidden",
        }}
      >
        <motion.div
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(1000px 600px at 30% 70%, rgba(212,175,55,0.15), transparent 80%), radial-gradient(900px 700px at 70% 30%, rgba(244,229,161,0.08), transparent 70%)",
            backgroundSize: "200% 200%",
            filter: "blur(120px)",
          }}
        ></motion.div>
      </motion.div>

      {/* ✨ Main Page Content */}
      <main
        className="about-grid" // ✅ CHANGED: Using the responsive grid class
        style={{
          color: "#e5e7eb",
          padding: "140px 24px 120px 24px", // Added horizontal padding
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        {/* ===== HERO (Grid Cell 1: Top-Left) ===== */}
        <section
          style={{
            // ✅ CHANGED: Aligned left, not center
            textAlign: "left",
            marginBottom: "60px",
            // Spans 1 column
          }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              fontSize: "3rem",
              fontWeight: 800,
              background: "linear-gradient(135deg, #d4af37, #f4e5a1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "24px",
            }}
          >
            Curating Journeys. <br /> Elevating Experiences.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              // ✅ CHANGED: Removed max-width and margin: auto
              color: "rgba(226,232,240,0.82)",
              fontSize: "1.15rem",
              lineHeight: 1.8,
            }}
          >
            TourEase transforms ordinary travel into an extraordinary narrative — powered by
            intelligent automation and human warmth. Every itinerary we craft is a personalized
            story, merging technology, culture, and the traveler’s own rhythm.
          </motion.p>
        </section>

        {/* ===== ✨ NEW: TEAM SECTION (Grid Cell 2: Top-Right) ===== */}
        <section style={{ marginBottom: "60px" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h3
              style={{
                color: "#f4e5a1",
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              Our Team
            </h3>
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                color: "#d4af37",
                marginBottom: "16px",
              }}
            >
              We care deeply about the quality of our work
            </h2>
            {/* 📸 YOUR IMAGE GOES HERE 📸 */}
            <div
              style={{
                width: "100%",
                aspectRatio: "16 / 10", // Keeps a consistent shape
                borderRadius: "16px",
                border: "1px solid rgba(244,229,161,0.15)",
                background: "rgba(255,255,255,0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(244,229,161,0.4)",
                fontSize: "1.2rem",
                // ✅ ADD YOUR IMAGE HERE as a background image or <img> tag
                // Example:
                // backgroundImage: "url('/path/to/your-team-photo.jpg')",
                // backgroundSize: "cover",
                // backgroundPosition: "center",
              }}
            >
              Add your team photo here
            </div>
            <p
              style={{
                color: "rgba(226,232,240,0.8)",
                fontSize: "0.9rem",
                marginTop: "12px",
              }}
            >
              The founders & innovators behind TourEase
            </p>
          </motion.div>
        </section>

        {/* ===== OUR STORY (Grid Cell 3: Mid-Left) ===== */}
        <section
          style={{
            // ✅ CHANGED: Removed grid styles from this section
            marginBottom: "60px",
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h3
              style={{
                color: "#f4e5a1",
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              Our Story
            </h3>
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                color: "#d4af37",
                marginBottom: "16px",
              }}
            >
              Designed for Travelers, Crafted by Innovators
            </h2>
            <p style={{ color: "rgba(226,232,240,0.85)", lineHeight: 1.8, marginBottom: "32px" }}>
              Founded in 2024, TourEase was born from the belief that travel should be seamless,
              soulful, and intelligent. We’ve built an AI-powered ecosystem that bridges technology
              and exploration — where every moment feels curated, not automated.
            </p>

            {/* ✅ CHANGED: Stats are now *below* the text, not beside it */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              style={{
                borderRadius: "20px",
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(244,229,161,0.15)",
                boxShadow: "0 0 24px rgba(212,175,55,0.1)",
                padding: "40px 24px",
                display: "flex",
                justifyContent: "space-around",
              }}
            >
              {[
                { label: "Founded", value: "2024" },
                { label: "Users", value: "2.5K+" },
                { label: "Trips", value: "12K+" },
              ].map((stat, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <h3
                    style={{
                      fontSize: "2rem",
                      color: "#d4af37",
                      fontWeight: 700,
                      marginBottom: "6px",
                    }}
                  >
                    {stat.value}
                  </h3>
                  <p style={{ color: "rgba(226,232,240,0.8)", fontSize: "0.95rem" }}>{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ===== TRUST BACKED BY NUMBERS (Grid Cell 4: Mid-Right) ===== */}
        <section style={{ textAlign: "center", marginBottom: "60px" }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              fontSize: "2.4rem",
              fontWeight: 700,
              color: "#d4af37",
              marginBottom: "20px",
            }}
          >
            Trust Backed by Numbers
          </motion.h2>
          <p
            style={{
              // ✅ CHANGED: Removed max-width and margin: auto
              margin: "0 auto 40px",
              color: "rgba(226,232,240,0.8)",
              fontSize: "1.1rem",
              lineHeight: 1.7,
            }}
          >
            From real-time recommendations to curated experiences — TourEase continues to redefine
            how modern travelers explore.
          </p>

          <div
            style={{
              display: "flex",
              // ✅ CHANGED: Stacked vertically
              flexDirection: "column",
              justifyContent: "center",
              gap: "24px",
            }}
          >
            {[
              { value: "50+", label: "Destinations Curated" },
              { value: "98%", label: "Traveler Satisfaction" },
              { value: "24/7", label: "Smart Assistance" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "18px",
                  padding: "32px 48px",
                  border: "1px solid rgba(212,175,55,0.2)",
                  boxShadow: "0 0 32px rgba(212,175,55,0.08)",
                }}
              >
                <h3
                  style={{
                    fontSize: "2rem",
                    color: "#f4e5a1",
                    fontWeight: 700,
                    marginBottom: "8px",
                  }}
                >
                  {stat.value}
                </h3>
                <p style={{ color: "rgba(226,232,240,0.85)" }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===== CTA (Grid Cell 5: Full-Width Bottom) ===== */}
        <section
          style={{
            textAlign: "center",
            marginTop: "60px",
            // ✅ CHANGED: Spans both columns
            gridColumn: "1 / -1",
          }}
        >
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              color: "#f4e5a1",
              fontWeight: 600,
              fontSize: "1.6rem",
              marginBottom: "28px",
            }}
          >
            Begin your next journey, effortlessly.
          </motion.h2>
          <motion.a
            href="/explore"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2 }}
            style={{
              display: "inline-block",
              padding: "14px 38px",
              borderRadius: "999px",
              background: "linear-gradient(135deg, #d4af37, #f4e5a1)",
              color: "#0b0e14",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 0 22px rgba(212,175,55,0.4)",
            }}
          >
            Explore with TourEase
          </motion.a>
        </section>
      </main>
    </div>
  );
};

export default About;