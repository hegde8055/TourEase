import React from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

const aboutStyles = `
  .about-page {
    min-height: 100vh;
    background: #02060f;
    color: #e2e8f0;
    font-family: "Poppins", sans-serif;
    position: relative;
    overflow: hidden;
  }

  .about-gradient {
    position: fixed;
    inset: 0;
    z-index: -2;
    background: radial-gradient(1200px 900px at 15% 15%, rgba(212,175,55,0.18), transparent 70%),
      radial-gradient(1400px 900px at 85% 80%, rgba(56,189,248,0.14), transparent 73%),
      linear-gradient(135deg, #030711, #060b1b 55%, #030711);
  }

  .about-parallax {
    position: fixed;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    background: radial-gradient(900px 600px at 30% 70%, rgba(15,118,213,0.12), transparent 70%),
      radial-gradient(1100px 700px at 70% 25%, rgba(244,229,161,0.1), transparent 72%);
    background-size: 180% 180%;
    filter: blur(90px);
    opacity: 0.9;
  }

  .about-content {
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    padding: 140px 28px 120px;
    display: grid;
    gap: 80px;
  }

  .hero-grid {
    display: grid;
    gap: 32px;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    align-items: center;
  }

  .hero-copy {
    grid-column: span 7;
  }

  .hero-visual {
    grid-column: span 5;
    display: grid;
    gap: 20px;
    perspective: 1600px;
  }

  .hero-title {
    font-size: clamp(2.8rem, 4vw, 4.2rem);
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.02em;
    background: linear-gradient(120deg, #fef9c3 0%, #facc15 33%, #38bdf8 72%, #fef3c7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 24px;
  }

  .hero-subtitle {
    font-size: 1.1rem;
    color: rgba(148,163,184,0.9);
    line-height: 1.8;
    max-width: 560px;
    margin-bottom: 32px;
  }

  .hero-cta {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  .cta-primary,
  .cta-secondary {
    padding: 14px 30px;
    border-radius: 999px;
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.02em;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  .cta-primary {
    background: linear-gradient(130deg, #facc15, #f97316 48%, #facc15 100%);
    color: #040611;
    box-shadow: 0 20px 50px rgba(250, 204, 21, 0.25);
  }

  .cta-secondary {
    background: rgba(15,23,42,0.7);
    border: 1px solid rgba(148, 163, 184, 0.32);
    color: #e2e8f0;
  }

  .cta-primary:hover,
  .cta-secondary:hover {
    transform: translateY(-4px);
  }

  .tilt-layer {
    position: relative;
    background: linear-gradient(140deg, rgba(17,24,39,0.92), rgba(8,11,26,0.9));
    border-radius: 20px;
    padding: 28px;
    border: 1px solid rgba(255,255,255,0.06);
    box-shadow: 0 20px 45px rgba(15,23,42,0.35);
    transform-style: preserve-3d;
    overflow: hidden;
  }

  .tilt-layer::after {
    content: "";
    position: absolute;
    inset: -40%;
    background: radial-gradient(circle at top left, rgba(250, 204, 21, 0.23), transparent 55%);
    transform: translateZ(-40px);
  }

  .tilt-layer:hover {
    transform: rotateX(-6deg) rotateY(7deg) translateY(-8px);
  }

  .capabilities-grid {
    display: grid;
    gap: 24px;
    grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
  }

  .capability-card {
    position: relative;
    padding: 28px 26px;
    border-radius: 18px;
    background: linear-gradient(160deg, rgba(15,23,42,0.88), rgba(8,11,26,0.88));
    border: 1px solid rgba(148,163,184,0.22);
    box-shadow: 0 20px 38px rgba(15,23,42,0.4);
    overflow: hidden;
    transform-style: preserve-3d;
  }

  .capability-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(140deg, rgba(59,130,246,0.25), transparent 65%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .capability-card:hover::before {
    opacity: 1;
  }

  .capability-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;
    letter-spacing: 0.02em;
    margin-bottom: 12px;
  }

  .capability-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 10px;
    color: rgba(203,213,225,0.82);
  }

  .metrics-row {
    display: grid;
    gap: 20px;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .metric-tile {
    position: relative;
    padding: 30px;
    border-radius: 20px;
    background: radial-gradient(circle at top, rgba(226,232,240,0.12), transparent 58%),
      rgba(15,23,42,0.88);
    border: 1px solid rgba(226,232,240,0.12);
    box-shadow: inset 0 0 0 1px rgba(148,163,184,0.12);
    text-align: center;
  }

  .metric-value {
    font-size: 2.4rem;
    font-weight: 700;
    background: linear-gradient(120deg, #facc15, #fef08a, #bae6fd);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 6px;
  }

  .metric-label {
    font-size: 0.92rem;
    color: rgba(148,163,184,0.86);
  }

  .showreel-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
    gap: 26px;
  }

  .showreel-card {
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid rgba(59,130,246,0.35);
    background: linear-gradient(180deg, rgba(15,23,42,0.92), rgba(2,6,23,0.92));
    box-shadow: 0 28px 42px rgba(14, 23, 42, 0.45);
    position: relative;
    transform-style: preserve-3d;
  }

  .showreel-card:hover {
    transform: translateY(-10px) rotateX(-4deg);
  }

  .showreel-cover {
    height: 200px;
    background: linear-gradient(135deg, rgba(59,130,246,0.35), rgba(14,116,144,0.55));
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(226,232,240,0.9);
    font-weight: 600;
    letter-spacing: 0.06em;
  }

  .stack-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 18px;
  }

  .stack-chip {
    padding: 6px 14px;
    border-radius: 999px;
    background: rgba(15,118,213,0.12);
    border: 1px solid rgba(37,99,235,0.25);
    color: #93c5fd;
    font-size: 0.78rem;
    letter-spacing: 0.05em;
  }

  .testimonials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
  }

  .testimonial-card {
    position: relative;
    padding: 28px;
    border-radius: 18px;
    background: rgba(15,23,42,0.92);
    border: 1px solid rgba(244,229,161,0.16);
    box-shadow: 0 20px 38px rgba(8,11,26,0.45);
  }

  .testimonial-quote {
    font-size: 1rem;
    line-height: 1.75;
    color: rgba(226,232,240,0.85);
    margin-bottom: 22px;
  }

  .testimonial-author {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .author-pill {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: linear-gradient(140deg, #facc15, #f97316);
    display: grid;
    place-items: center;
    color: #020617;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .cta-panel {
    position: relative;
    border-radius: 26px;
    padding: 56px 42px;
    text-align: center;
    overflow: hidden;
    background: linear-gradient(130deg, rgba(15,23,42,0.92), rgba(8,11,26,0.92));
    border: 1px solid rgba(148,163,184,0.24);
    box-shadow: 0 30px 60px rgba(2,6,23,0.6);
  }

  .cta-panel::after {
    content: "";
    position: absolute;
    inset: -30%;
    background: radial-gradient(circle at center, rgba(250,204,21,0.2), transparent 70%);
    opacity: 0.6;
  }

  .cta-panel > * {
    position: relative;
    z-index: 1;
  }

  .floating {
    animation: float 6s ease-in-out infinite;
  }

  .glow {
    animation: pulseGlow 4.5s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px) rotateX(0deg) rotateY(0deg);
    }
    50% {
      transform: translateY(-10px) rotateX(2deg) rotateY(-2deg);
    }
  }

  @keyframes pulseGlow {
    0%, 100% {
      opacity: 0.45;
      box-shadow: 0 0 30px rgba(250, 204, 21, 0.15);
    }
    50% {
      opacity: 0.7;
      box-shadow: 0 0 60px rgba(250, 204, 21, 0.28);
    }
  }

  @media (max-width: 1024px) {
    .hero-grid {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
    .hero-copy,
    .hero-visual {
      grid-column: span 1;
    }
  }

  @media (max-width: 720px) {
    .about-content {
      padding: 120px 18px 96px;
    }
    .hero-title {
      font-size: clamp(2.4rem, 8vw, 3.4rem);
    }
    .cta-panel {
      padding: 48px 28px;
    }
    .showreel-cover {
      height: 170px;
    }
  }
`;

const capabilities = [
  {
    title: "Full-stack Experience",
    code: "01",
    points: [
      "Strategy & UX blueprints",
      "Responsive product engineering",
      "API-first architectures",
      "Accessibility by design",
    ],
  },
  {
    title: "Immersive UI Systems",
    code: "02",
    points: [
      "Cinematic web animations",
      "Micro-interaction libraries",
      "Design system governance",
      "Brand motion playbooks",
    ],
  },
  {
    title: "AI-Forward Delivery",
    code: "03",
    points: [
      "Predictive personalization",
      "Generative content tooling",
      "MLOps readiness",
      "Insight dashboards",
    ],
  },
];

const metrics = [
  { label: "Award Nominations", value: "14" },
  { label: "Launch Velocity", value: "6 wk avg" },
  { label: "Client Retention", value: "92%" },
  { label: "NPS", value: "78" },
];

const signatureWork = [
  {
    title: "NeoCruise Concierge",
    body: "A luxury cruise marketplace reimagined with AI concierges, real-time cabin visualization, and volumetric ambient soundscapes.",
    stack: ["React", "Three.js", "GraphQL", "AWS"],
  },
  {
    title: "Aurora Atlas VR Portal",
    body: "Multi-device travel planning using stitched 360° narratives, procedural lighting, and adaptive scene streaming for frictionless booking.",
    stack: ["Next.js", "WebXR", "Prisma", "Edge Functions"],
  },
  {
    title: "Stride.Labs Enterprise",
    body: "A B2B mobility platform combining predictive routing, contract automation, and governance dashboards tuned for global ops teams.",
    stack: ["Vue", "D3.js", "Python", "Kubernetes"],
  },
];

const testimonials = [
  {
    name: "Isha Menon",
    role: "Founder, Horizon Retreats",
    quote:
      "We engaged TourEase to redesign our digital presence; they choreographed a cinematic customer journey that doubled bookings in 90 days.",
  },
  {
    name: "Daniel Ruiz",
    role: "VP Product, MetroFly",
    quote:
      "Their team speaks the language of product, engineering, and brand simultaneously. Velocity without compromise.",
  },
  {
    name: "Meera Chand",
    role: "Innovation Lead, Helios Ventures",
    quote:
      "If you want teams that merge art direction with ruthless technical execution, TourEase is the benchmark.",
  },
];

const About = () => {
  return (
    <div className="about-page">
      <Navbar />
      <style>{aboutStyles}</style>

      <motion.div
        className="about-gradient"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      />
      <motion.div
        className="about-parallax"
        initial={{ backgroundPosition: "0% 0%" }}
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      />

      <main className="about-content">
        <motion.section
          className="hero-grid"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <div className="hero-copy">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 18px",
                borderRadius: 999,
                background: "rgba(15,23,42,0.65)",
                border: "1px solid rgba(246,189,96,0.35)",
                color: "#fde68a",
                fontSize: "0.8rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Studio Reel 2025 · Immersive Webcraft
            </motion.span>
            <h1 className="hero-title">
              We design cinematic digital worlds where brands earn lifetime advocates.
            </h1>
            <p className="hero-subtitle">
              From strategic discovery to shippable product, TourEase fuses cinematic interaction
              design, disciplined engineering, and AI-native thinking. We operate as a strike team
              that can concept, prototype, and launch experiential platforms in weeks—not quarters.
            </p>
            <div className="hero-cta">
              <motion.a
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                href="/contact"
                className="cta-primary"
              >
                Build with TourEase
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                href="/explore"
                className="cta-secondary"
              >
                View Case Studies
              </motion.a>
            </div>
          </div>

          <div className="hero-visual">
            <motion.div
              className="tilt-layer floating"
              initial={{ rotateX: -6, rotateY: 8, opacity: 0 }}
              animate={{ rotateX: 0, rotateY: 0, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            >
              <motion.h3
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 600,
                  marginBottom: 12,
                  color: "#fef9c3",
                  letterSpacing: "0.05em",
                }}
                animate={{ letterSpacing: ["0.04em", "0.08em", "0.04em"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                Signature Moves
              </motion.h3>
              <div style={{ display: "grid", gap: 16 }}>
                {[
                  "Narrative-driven product strategy",
                  "3D compositing & volumetric UI",
                  "AI-assisted design sprints",
                  "Cloud-native delivery playbooks",
                ].map((item) => (
                  <motion.div
                    key={item}
                    whileHover={{ x: 6 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      color: "rgba(226,232,240,0.86)",
                      fontSize: "0.94rem",
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #facc15, #38bdf8)",
                        boxShadow: "0 0 12px rgba(56,189,248,0.45)",
                      }}
                    />
                    {item}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="tilt-layer glow"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.9 }}
            >
              <h3
                style={{
                  fontSize: "0.95rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "rgba(226,232,240,0.72)",
                  marginBottom: 18,
                }}
              >
                Trusted By
              </h3>
              <div
                style={{
                  display: "grid",
                  gap: 14,
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                }}
              >
                {["VisaDirect", "Nimbus Air", "Helios", "Stride", "Aurora", "Monad Labs"].map(
                  (brand) => (
                    <div
                      key={brand}
                      style={{
                        padding: "14px 18px",
                        borderRadius: 14,
                        background: "rgba(6,12,27,0.85)",
                        border: "1px solid rgba(148,163,184,0.18)",
                        fontSize: "0.85rem",
                        color: "rgba(226,232,240,0.75)",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        textAlign: "center",
                      }}
                    >
                      {brand}
                    </div>
                  )
                )}
              </div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 24,
              marginBottom: 24,
            }}
          >
            <div>
              <h2 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: 14 }}>
                Why brands hire TourEase
              </h2>
              <p style={{ color: "rgba(148,163,184,0.9)", maxWidth: 560, lineHeight: 1.7 }}>
                We orchestrate vision from the first whiteboard to production hardening. Every
                engagement blends cinematic craft with rigorous delivery so your product feels like
                a premiere, not a release.
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              style={{
                alignSelf: "flex-start",
                padding: "12px 20px",
                borderRadius: 999,
                background: "rgba(15,23,42,0.6)",
                border: "1px solid rgba(59,130,246,0.35)",
                color: "#bfdbfe",
                fontSize: "0.85rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Studio Model · Strategy + Design + Engineering
            </motion.div>
          </div>
          <div className="capabilities-grid">
            {capabilities.map((cap) => (
              <motion.div
                key={cap.code}
                className="capability-card"
                whileHover={{ translateY: -8 }}
              >
                <div className="capability-title">
                  <span style={{ color: "#fef9c3", letterSpacing: "0.08em", fontSize: "0.78rem" }}>
                    Capability {cap.code}
                  </span>
                  <span style={{ fontSize: "1.05rem", fontWeight: 600 }}>{cap.title}</span>
                </div>
                <ul className="capability-list">
                  {cap.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: "2.1rem", fontWeight: 700, marginBottom: 10 }}>
              Signal and proof
            </h2>
            <p style={{ color: "rgba(148,163,184,0.88)", maxWidth: 520 }}>
              Performance metrics from the last twelve launches our core team delivered end-to-end.
            </p>
          </div>
          <div className="metrics-row">
            {metrics.map((metric) => (
              <motion.div key={metric.label} className="metric-tile" whileHover={{ scale: 1.03 }}>
                <div className="metric-value">{metric.value}</div>
                <div className="metric-label">{metric.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div
            style={{
              marginBottom: 30,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ fontSize: "2.1rem", fontWeight: 700, marginBottom: 12 }}>
                Recent cinematic builds
              </h2>
              <p style={{ color: "rgba(148,163,184,0.88)", maxWidth: 560 }}>
                A snapshot of platform stories we have sculpted with layered motion, 3D surfacing,
                and outcome-focused product thinking.
              </p>
            </div>
            <a
              href="/portfolio"
              style={{ color: "#93c5fd", fontSize: "0.9rem", textDecoration: "none" }}
            >
              View full portfolio →
            </a>
          </div>
          <div className="showreel-grid">
            {signatureWork.map((work) => (
              <motion.div key={work.title} className="showreel-card" whileHover={{ rotateY: 6 }}>
                <div className="showreel-cover">Concept Preview</div>
                <div style={{ padding: "26px 24px" }}>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: 12 }}>
                    {work.title}
                  </h3>
                  <p
                    style={{
                      color: "rgba(203,213,225,0.84)",
                      fontSize: "0.95rem",
                      lineHeight: 1.7,
                    }}
                  >
                    {work.body}
                  </p>
                  <div className="stack-chips">
                    {work.stack.map((item) => (
                      <span key={item} className="stack-chip">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div style={{ marginBottom: 26 }}>
            <h2 style={{ fontSize: "2.1rem", fontWeight: 700, marginBottom: 10 }}>
              Leaders speaking about TourEase
            </h2>
            <p style={{ color: "rgba(148,163,184,0.88)", maxWidth: 540 }}>
              Product, brand, and venture leaders trust our studio to transform complex ideas into
              living, breathing digital experiences.
            </p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((item) => (
              <motion.div key={item.name} className="testimonial-card" whileHover={{ y: -6 }}>
                <p className="testimonial-quote">“{item.quote}”</p>
                <div className="testimonial-author">
                  <span className="author-pill">
                    {item.name
                      .split(" ")
                      .map((word) => word[0])
                      .join("")}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: "0.85rem", color: "rgba(148,163,184,0.78)" }}>
                      {item.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="cta-panel">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: 16 }}
            >
              Ready to premiere your next digital flagship?
            </motion.h2>
            <p
              style={{
                color: "rgba(203,213,225,0.85)",
                fontSize: "1.05rem",
                maxWidth: 620,
                margin: "0 auto 32px",
                lineHeight: 1.7,
              }}
            >
              We embed with your team, co-author the product vision, and deliver in cinematic
              chapters. Let’s storyboard your roadmap together.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap" }}>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="mailto:studio@tourease.com"
                className="cta-primary"
              >
                Book a discovery call
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/portfolio"
                className="cta-secondary"
              >
                Download capabilities deck
              </motion.a>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default About;
