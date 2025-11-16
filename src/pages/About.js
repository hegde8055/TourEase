import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import ScrollProgressBar from "../components/ScrollProgressBar";
import { useScroll, useTransform, motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

// -----------------------------------------------------------------------------
// Redesigned About.js — cleaned, fixed imports, corrected CSS and animations
// All frontend logic (styles, layout, animations) is contained in this file
// Replace '/assets/founder.jpg' and heroVideoSrc with your actual assets when deploying
// -----------------------------------------------------------------------------

const aboutStyles = `
:root{
  --gold: #caa72b;
  --deep: #081225;
  --muted: rgba(226,232,240,0.92);
}
*{box-sizing:border-box}
html,body{height:100%;margin:0;font-family:Poppins,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial}

.about-page{background:linear-gradient(180deg,var(--deep) 0%, #071122 70%);color:var(--muted);min-height:100vh}
.about-shell{
  max-width:1200px;
  margin:0 auto;
  padding:0 16px 0 16px; /* no top padding */
}


/* PARTICLES */
.hero-particles{position:absolute;inset:0;z-index:2;overflow:hidden;pointer-events:none}
.hero-particles span{position:absolute;width:6px;height:6px;background:rgba(255,199,173,0.8);border-radius:50%;filter:blur(1px);animation:floatUp 8s linear infinite}
.hero-particles span:nth-child(1){left:10%;animation-duration:7s}
.hero-particles span:nth-child(2){left:25%;animation-duration:9s}
.hero-particles span:nth-child(3){left:40%;animation-duration:11s}
.hero-particles span:nth-child(4){left:55%;animation-duration:8s}
.hero-particles span:nth-child(5){left:70%;animation-duration:10s}
.hero-particles span:nth-child(6){left:85%;animation-duration:12s}
.hero-particles span:nth-child(7){left:30%;animation-duration:14s}
.hero-particles span:nth-child(8){left:60%;animation-duration:13s}
.hero-particles span:nth-child(9){left:75%;animation-duration:9s}
.hero-particles span:nth-child(10){left:50%;animation-duration:15s}
@keyframes floatUp{0%{transform:translateY(120vh) scale(0.6);opacity:0}20%{opacity:0.9}100%{transform:translateY(-20vh) scale(1.1);opacity:0}}
.hero-section{
  position: relative;
  min-height: 70vh;
  display: grid;
  place-items: center;
  padding: 0 20px 80px;  /* Removed ALL top padding */
  margin-top: calc(var(--nav-height, 72px)); /* Offset for fixed navbar dynamically */
}

.hero-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;filter:brightness(0.36) contrast(1.03);transition:opacity 0.8s ease,transform 1.2s ease}
/* overlay reduces top darkness so title always visible */
.hero-overlay{position:absolute;inset:0;background:linear-gradient(180deg, rgba(2,6,23,0.32) 0%, rgba(2,6,23,0.65) 60%, rgba(2,6,23,0.82) 100%);z-index:1;pointer-events:none}
.hero-content{position:relative;z-index:3;text-align:center;max-width:980px;padding:28px;border-radius:18px;margin-top:12px;backdrop-filter:blur(10px);background:linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));border:1px solid rgba(255,255,255,0.06);opacity:0;transform:translateY(12px);transition:opacity 0.7s ease, transform 0.7s ease}
.hero-content.visible{opacity:1;transform:none}
.pretitle{display:inline-block;padding:8px 18px;border-radius:999px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.03);letter-spacing:0.12em;text-transform:uppercase;font-size:0.78rem;color:var(--gold)}
.hero-title{font-weight:800;font-size:clamp(2rem,5vw,3.6rem);line-height:1.04;margin:18px 0;background:linear-gradient(120deg,var(--gold),#f7d36b);-webkit-background-clip:text;color:transparent}
.hero-blurb{max-width:760px;margin:10px auto 18px;color:rgba(226,232,240,0.9);font-size:1.04rem}
.hero-cta{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.btn{padding:12px 30px;border-radius:999px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;border:none;cursor:pointer;outline:none}
/* Primary button clean */
.btn-primary{background:linear-gradient(135deg,#e3b8a5 0%,#f6d4c8 100%);color:#2a0e12;border:1px solid rgba(255,255,255,0.18);transition:transform 0.28s cubic-bezier(.2,.9,.2,1), box-shadow 0.35s ease;position:relative;overflow:hidden}
.btn-primary:hover{transform:translateY(-4px) scale(1.03);box-shadow:0 14px 40px rgba(227,146,146,0.12)}
.btn-primary::after{content:'';position:absolute;left:-60%;top:0;height:100%;width:60%;background:linear-gradient(120deg, rgba(255,255,255,0.25), rgba(255,255,255,0.06), rgba(255,255,255,0.18));transform:skewX(-18deg);transition:all 0.9s ease;opacity:0}
.btn-primary:hover::after{left:120%;opacity:1}
.btn-primary.neon{animation:neonPulse 2.8s ease-in-out infinite}
@keyframes neonPulse{0%{box-shadow:0 0 0 rgba(231,150,150,0)}50%{box-shadow:0 0 24px rgba(231,150,150,0.18)}100%{box-shadow:0 0 0 rgba(231,150,150,0)}}
.btn-ghost{background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.12);color:var(--muted);transition:box-shadow 0.3s ease}
.btn-ghost:hover{box-shadow:0 10px 28px rgba(0,0,0,0.28);transform:translateY(-3px)}

/* ensure content below hero isn't covered */
.content-wrapper{max-width:1200px;  margin-bottom: 0 !important;
padding-bottom: 0 !important;}

/* Founder / profile section - split layout */
.profile-wrap{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center;padding:40px 24px;background:linear-gradient(135deg,#b76e79 0%,#eec9d2 100%);border-radius:12px;margin-top:0;box-shadow:0 20px 45px rgba(0,0,0,0.25);overflow:visible}
.profile-photo{width:100%;height:420px;object-fit:cover;border-radius:10px;border:2px solid rgba(255,255,255,0.22);box-shadow:0 10px 30px rgba(0,0,0,0.28);backdrop-filter:blur(6px)}
.profile-meta{color:#3a1f21}
.profile-name{font-size:1.8rem;font-weight:800;color:#3a1f21}
.profile-role{color:#5a2e31;margin-bottom:12px}
.profile-bio{color:#4b272a;line-height:1.7}

/* Feature grid */
.features{display:grid;grid-template-columns:repeat(4,1fr);gap:28px;margin:60px 0;padding:0;list-style:none}
.feature{background:rgba(255,255,255,0.06);backdrop-filter:blur(12px);padding:24px;border-radius:14px;box-shadow:0 10px 24px rgba(0,0,0,0.18);transition:transform 0.35s cubic-bezier(.2,.9,.2,1),box-shadow 0.35s ease,opacity 0.6s ease;opacity:0;transform:translateY(18px)}
.feature.visible{opacity:1;transform:none}
.feature:hover{transform:translateY(-8px) scale(1.02);box-shadow:0 22px 44px rgba(0,0,0,0.26)}
.feature h4{margin:6px 0;color:#e9b94a}
.feature p{font-size:0.95rem;color:rgba(226,232,240,0.9)}

/* Services band */
.services-band{background:linear-gradient(135deg,#81d8d0 0%,#b0f0ea 100%);color:#071122;padding:36px 18px;margin-top:32px;border-radius:12px;box-shadow:0 12px 28px rgba(0,0,0,0.18)}
.services-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;max-width:1100px;margin:0 auto}
.services-grid h3{font-weight:800;margin-bottom:6px}
.services-list{font-size:0.92rem;color:#081225;line-height:1.6}

/* Clients */
.clients{padding:44px 20px 10px 20px;text-align:center}
.clients img{max-height:40px;opacity:0.45;margin:0 24px}

/* CTA panel */
.cta-panel{padding:38px 20px;background:linear-gradient(180deg, rgba(8,12,24,0.48), rgba(8,12,24,0.6));backdrop-filter:blur(16px);border-radius:14px;margin:40px 0;text-align:center;border:1px solid rgba(255,255,255,0.06)}
.cta-panel h3{color:var(--gold);font-weight:800}
.cta-panel p{max-width:860px;  margin-bottom: 0 !important;color:rgba(226,232,240,0.95)}

/* NEON ROSE-GOLD & SHIMMER */
.btn-primary{position:relative;overflow:hidden}
.btn-primary::after{content:'';position:absolute;left:-60%;top:0;height:100%;width:60%;background:linear-gradient(120deg, rgba(255,255,255,0.25), rgba(255,255,255,0.06), rgba(255,255,255,0.18));transform:skewX(-18deg);transition:all 0.9s ease;opacity:0}
.btn-primary:hover::after{left:120%;opacity:1}
@keyframes neonPulse{0%{box-shadow:0 0 0 rgba(231,150,150,0)}50%{box-shadow:0 0 24px rgba(231,150,150,0.18)}100%{box-shadow:0 0 0 rgba(231,150,150,0)}}
.btn-primary.neon{animation:neonPulse 2.8s ease-in-out infinite}

/* Reveal line */
.reveal-line{height:3px;width:140px;background:linear-gradient(90deg,#ffd6c2,#e6b0a0);transform-origin:left;transform:scaleX(0);margin:40px auto 40px;border-radius:4px;z-index:5;position:relative}

/* responsive breakpoint follows */
@media (max-width:980px){
  .profile-wrap{grid-template-columns:1fr;padding:28px}
  .features{grid-template-columns:repeat(2,1fr)}
  .services-grid{grid-template-columns:repeat(2,1fr)}
  .hero-section{padding:40px 16px 60px}
}
@media (max-width:640px){
  .hero-title{font-size:1.8rem}
  .features{grid-template-columns:1fr}
  .services-grid{grid-template-columns:1fr}
  .profile-photo{height:320px}
}
`;

const About = () => {
  // hero video kept as variable — replace with uploaded filename when ready
  const heroVideoSrc = "/assets/hero-bg.mp4"; // <-- update this to your provided video path

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    document.body.classList.add("about-page-active");
    const video = document.querySelector(".hero-video");
    const handleVisibilityChange = () => {
      if (document.hidden) video?.pause();
      else video?.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.body.classList.remove("about-page-active");
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const video = document.querySelector(".hero-video");
    const loadVideo = () => {
      if (!video) return;
      const src = video.getAttribute("data-src");
      if (src && video.src !== src) {
        video.src = src;
        video.load();
        video.play().catch(() => {});
      }
    };
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      requestIdleCallback(loadVideo, { timeout: 1600 });
    } else {
      setTimeout(loadVideo, 600);
    }
  }, []);
  useEffect(() => {
    const computeHeight = () => {
      const nav = document.querySelector("nav, .navbar, header");
      const h = nav ? nav.getBoundingClientRect().height : 0;
      document.documentElement.style.setProperty("--nav-height", `${h}px`);
    };
    computeHeight();
    window.addEventListener("resize", computeHeight);
    return () => window.removeEventListener("resize", computeHeight);
  }, []);

  // motion + scroll effects
  const { scrollYProgress } = useScroll();
  const parallax = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  const container = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.12 } },
  };
  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const [refProfile, inViewProfile] = useInView({ threshold: 0.2, triggerOnce: true });
  const [refFeatures, inViewFeatures] = useInView({ threshold: 0.15, triggerOnce: true });

  // ----------------
  // Founder details (user provided)
  // ----------------
  const founder = {
    name: "Shridhar Sharatkumar Hegde",
    role: "Founder & Full-Stack Developer",
    location: "Siddapur-581355 (U.K)",
    school: "SDMIT, Ujire — Information Science",
    bio: `Born and raised in the quiet town of Siddapur-581355, I am currently pursuing my career as an Information Science engineer at SDMIT, Ujire. I built TourEase as a one-man full-stack project — starting from beginner-level web development skills and iterating until the platform could help travellers plan with less friction. I handle UI, backend glue, basic AI integrations, and the day-to-day code that keeps TourEase running.`,
    photo: "/assets/founder.jpg",
  };

  return (
    <div className="about-page">
      <style>{aboutStyles}</style>
      <div className="about-shell">
        {/* <Navbar /> */}
        <ScrollProgressBar />
        <Navbar />

        {/* HERO */}
        <motion.section
          className="hero-section"
          style={{ y: parallax }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.25 }}
        >
          <motion.video
            className="hero-video"
            poster="/assets/hero-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            data-src={heroVideoSrc}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.1 }}
          >
            <source src={heroVideoSrc} type="video/mp4" />
          </motion.video>

          <motion.div className="hero-overlay" aria-hidden />

          <motion.div className="hero-content" variants={container}>
            <motion.span className="pretitle" variants={item}>
              Guided journeys · Smart planning · One person behind the code
            </motion.span>

            <motion.h1 className="hero-title" style={{ marginTop: 12 }} variants={item}>
              TourEase — travel planning that keeps the adventure, loses the friction.
            </motion.h1>

            <motion.p className="hero-blurb" variants={item}>
              A compact, friendly tool to plan trips, collect memories and hand off the logistics to
              a simple, predictable system. Built with care by one developer who wanted fewer tabs,
              less stress, and more time in the sun.
            </motion.p>

            <motion.div className="hero-cta" variants={item}>
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-primary"
                href="/planner"
              >
                Start your itinerary
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-ghost"
                href="/explore"
              >
                Explore destinations
              </motion.a>
            </motion.div>
          </motion.div>
          <div className="hero-particles">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </motion.section>

        {/* Founder / Profile Section */}
        <section className="content-wrapper">
          <motion.div
            ref={refProfile}
            className="profile-wrap"
            initial="hidden"
            animate={inViewProfile ? "show" : "hidden"}
            variants={container}
          >
            <motion.div variants={item}>
              <img src={founder.photo} alt={founder.name} className="profile-photo" />
            </motion.div>
            <motion.div className="profile-meta" variants={item}>
              <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                <h2 className="profile-name">{founder.name}</h2>
                <span style={{ fontSize: 14, color: "rgba(7,18,34,0.45)" }}>{founder.role}</span>
              </div>
              <div style={{ margin: "10px 0 8px", color: "rgba(7,18,34,0.6)", fontWeight: 600 }}>
                {founder.school} · {founder.location}
              </div>
              <p className="profile-bio">{founder.bio}</p>

              <div style={{ marginTop: 18 }}>
                <motion.a
                  whileHover={{ y: -4 }}
                  className="btn btn-primary"
                  href="mailto:shridhars@example.com"
                  style={{ marginRight: 12 }}
                >
                  Talk to Creator
                </motion.a>
                <motion.a
                  whileHover={{ y: -2 }}
                  className="btn btn-ghost"
                  href={`mailto:shridhars@example.com`}
                >
                  Contact me
                </motion.a>
              </div>

              <div style={{ marginTop: 22, display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ fontSize: 13, color: "rgba(7,18,34,0.6)", fontWeight: 700 }}>
                  Skills:
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span
                    style={{
                      background: "#e9e6dd",
                      color: "#071122",
                      padding: "6px 10px",
                      borderRadius: 8,
                      fontWeight: 700,
                    }}
                  >
                    React
                  </span>
                  <span
                    style={{
                      background: "#e9e6dd",
                      color: "#071122",
                      padding: "6px 10px",
                      borderRadius: 8,
                      fontWeight: 700,
                    }}
                  >
                    Node.js
                  </span>
                  <span
                    style={{
                      background: "#e9e6dd",
                      color: "#071122",
                      padding: "6px 10px",
                      borderRadius: 8,
                      fontWeight: 700,
                    }}
                  >
                    MongoDB
                  </span>
                  <span
                    style={{
                      background: "#e9e6dd",
                      color: "#071122",
                      padding: "6px 10px",
                      borderRadius: 8,
                      fontWeight: 700,
                    }}
                  >
                    Framer Motion
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Features / Value props */}
          <motion.div
            ref={refFeatures}
            className="features"
            initial="hidden"
            animate={inViewFeatures ? "show" : "hidden"}
            variants={container}
          >
            <motion.div
              whileHover={{ rotateX: 2, rotateY: -2, scale: 1.04 }}
              transition={{ type: "spring", stiffness: 120 }}
              className="feature"
              variants={item}
            >
              <h4>Live Weather</h4>
              <p>Get real‑time weather updates for any destination before and during your trip.</p>
            </motion.div>
            <motion.div className="feature" variants={item}>
              <h4>Routing Info</h4>
              <p>Smart routing suggestions to optimize your travel time between locations.</p>
            </motion.div>
            <motion.div className="feature" variants={item}>
              <h4>Nearby Spots</h4>
              <p>Discover restaurants, attractions, fuel stations and essentials around you.</p>
            </motion.div>
            <motion.div className="feature" variants={item}>
              <h4>Trip Insights</h4>
              <p>Auto‑generated trip insights based on your itinerary and behavior.</p>
            </motion.div>
          </motion.div>

          {/* Services band */}
          <motion.div
            className="reveal-line"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            viewport={{ once: true }}
            style={{ transformOrigin: "left" }}
          />
          <section className="services-band">
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <h2
                style={{ textAlign: "center", color: "#071122", fontWeight: 900, marginBottom: 8 }}
              >
                Our Capabilities
              </h2>
              <p style={{ textAlign: "center", color: "#071122", opacity: 0.9, marginBottom: 18 }}>
                TourEase is lightweight but focused — here are the building blocks that power the
                site.
              </p>

              <div className="services-grid">
                <div>
                  <h3>Planner</h3>
                  <div className="services-list">
                    Itinerary creator · Day split automation · Shared links
                  </div>
                </div>
                <div>
                  <h3>Uploads</h3>
                  <div className="services-list">
                    Assignment & receipts upload · File previews · Versioned attachments
                  </div>
                </div>
                <div>
                  <h3>Profile & History</h3>
                  <div className="services-list">
                    Track your past trips · Personal notes · Export to PDF
                  </div>
                </div>
                <div>
                  <h3>Smarts</h3>
                  <div className="services-list">
                    Basic recommendations · Priority sorting · Lightweight caching
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Clients / partners (placeholder logos) */}
          <section className="clients">
            <h3 style={{ color: "#9aa0ab", marginBottom: 24 }}>
              Trusted by early users & test trips
            </h3>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 20,
                flexWrap: "wrap",
              }}
            >
              <img
                src="/assets/clients/amc.svg"
                alt="AMC"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <img
                src="/assets/clients/disney.svg"
                alt="Disney"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <img
                src="/assets/clients/nbc.svg"
                alt="NBC"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </section>

          {/* CTA panel */}
          <section className="cta-panel">
            <h3>Ready to plan something memorable?</h3>
            <p>
              Tell me where you want to go and how many days you have — I’ll show you a simple
              itinerary and the next steps.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <a className="btn btn-primary" href="/planner">
                Create my trip
              </a>
              <a className="btn btn-ghost" href="mailto:shridhars@example.com">
                Talk to the creator
              </a>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
};

export default About;
