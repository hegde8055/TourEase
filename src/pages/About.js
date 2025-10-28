import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Navbar from "../components/Navbar";
import { aboutFeatures, aboutTimeline } from "../utils/aboutContent";

const About = () => {
  const featureGridRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: featureGridRef,
    offset: ["start 80%", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  const cardVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: (index = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        delay: index * 0.12,
        ease: "easeOut",
      },
    }),
  };

  const ambientGlow = [
    "0 0 0 rgba(212, 175, 55, 0)",
    "0 0 28px rgba(212, 175, 55, 0.18)",
    "0 0 0 rgba(212, 175, 55, 0)",
  ];

  return (
    <div className="main-content">
      <Navbar />
      <main className="page-container" style={{ paddingTop: "140px", paddingBottom: "120px" }}>
        <section className="page-hero" style={{ textAlign: "center", marginBottom: "70px" }}>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{
              fontSize: "3.2rem",
              fontWeight: 800,
              background: "linear-gradient(135deg, #d4af37, #3b82f6)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "22px",
            }}
          >
            Curating Stories Beyond Travel
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            style={{
              maxWidth: "780px",
              margin: "0 auto",
              color: "rgba(226, 232, 240, 0.82)",
              fontSize: "1.15rem",
              lineHeight: 1.8,
            }}
          >
            TourEase is powered by travel artists, data scientists, and a concierge crew that
            understands the soul of India. We stitch together rare access, meaningful encounters,
            and perfectly-timed experiences so every escape feels like a private narrative written
            just for you.
          </motion.p>
        </section>

        <section style={{ marginBottom: "80px" }}>
          <motion.div
            ref={featureGridRef}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="glass-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "28px",
              maxWidth: "1100px",
              margin: "0 auto",
              y: parallaxY,
            }}
          >
            {aboutFeatures.map((item, index) => (
              <motion.article
                key={item.title}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.35 }}
                whileHover={{ y: -8, scale: 1.02 }}
                animate={{ boxShadow: ambientGlow }}
                transition={{
                  boxShadow: {
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: index * 0.25,
                    ease: "easeInOut",
                  },
                }}
                className="glass-card"
                style={{
                  padding: "32px",
                  borderRadius: "20px",
                  background: "var(--glass)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(12px)",
                  minHeight: "220px",
                }}
              >
                <motion.div
                  style={{ fontSize: "2.4rem", marginBottom: "18px" }}
                  initial={{ rotateX: 35, opacity: 0 }}
                  whileInView={{ rotateX: 0, opacity: 1 }}
                  viewport={{ once: true, amount: 0.45 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.08, ease: "easeOut" }}
                >
                  {item.icon}
                </motion.div>
                <h3 style={{ color: "#d4af37", fontSize: "1.25rem", marginBottom: "12px" }}>
                  {item.title}
                </h3>
                <p style={{ color: "rgba(226, 232, 240, 0.82)", lineHeight: 1.7 }}>
                  {item.description}
                </p>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <section style={{ maxWidth: "960px", margin: "0 auto" }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            style={{
              fontSize: "2.4rem",
              marginBottom: "36px",
              fontWeight: 700,
              color: "#d4af37",
              textAlign: "center",
            }}
          >
            Our Journey So Far
          </motion.h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "26px",
            }}
          >
            {aboutTimeline.map((milestone) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5 }}
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  borderRadius: "18px",
                  padding: "28px",
                  border: "1px solid rgba(59, 130, 246, 0.18)",
                  boxShadow: "0 20px 45px rgba(15, 23, 42, 0.35)",
                }}
              >
                <div
                  style={{
                    fontSize: "2.2rem",
                    color: "#3b82f6",
                    fontWeight: 700,
                    marginBottom: "12px",
                  }}
                >
                  {milestone.year}
                </div>
                <h4 style={{ color: "#e2e8f0", marginBottom: "10px", fontSize: "1.15rem" }}>
                  {milestone.title}
                </h4>
                <p style={{ color: "rgba(226, 232, 240, 0.78)", lineHeight: 1.7 }}>
                  {milestone.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
