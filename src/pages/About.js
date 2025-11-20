import React, { useEffect } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { BsCloudSun, BsSignpostSplit, BsGeoAlt, BsLightbulb } from "react-icons/bs";

const aboutStyles = `
html, body, #root {
  margin: 0 !important;
  padding: 0 !important;
  height: 100%;
}
[class*="spacer"], [id*="spacer"] {
  display: none !important;
  height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
}
.hero-content {
  margin-top: 50px !important;
}

:root{
  --gold: #caa72b;
  --deep: #081225;
  --muted: rgba(226,232,240,0.92);
}
*{box-sizing:border-box}
html,body{height:100%;font-family:Poppins,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial}

/* PAGE SHELL */
.about-page{
  margin: -90px 0 0 0;
  padding: 0;
  color:var(--muted);
  min-height:100vh;
  position: relative;
  will-change: opacity, transform, filter;
}

/* FULL PAGE VIDEO BACKGROUND */
.page-video-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -2;
}
.page-video-background video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.36) contrast(1.03);
}
.page-video-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(2,6,23,0.32) 0%, rgba(2,6,23,0.65) 60%, rgba(2,6,23,0.82) 100%);
  z-index: -1;
}

/* MAIN CONTAINER */
.about-shell{
  max-width:1200px;
  margin:0 auto;
  padding: 0 16px 80px 16px; 
  position: relative;
  z-index: 2;
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
@keyframes heroGlowSweep{0%{background-position:-150% 50%;filter:drop-shadow(0 0 24px rgba(236,198,180,0.65));}100%{background-position:170% 50%;filter:drop-shadow(0 0 0 rgba(236,198,180,0));}}

/* HERO SECTION */
.hero-section{
  position: relative;
  min-height: 70vh;
  display: grid;
  place-items: center;
  padding: var(--nav-height, 70px) 20px 80px;
  margin: 50px 0px 0px 0px ;
  top: 0 !important;
}
.hero-video{ display: none; }
.hero-overlay{ display: none; }

.hero-content{
  position:relative;
  z-index:3;
  text-align:center;
  max-width:980px;
  padding:28px;
  border-radius:18px;
  margin-top:12px;
  backdrop-filter:blur(10px);
  background:linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
  border:1px solid rgba(255,255,255,0.06);
  opacity:0;
  transform:translateY(24px) scale(0.98);
  filter: blur(14px);
}
.pretitle{
  display:inline-block;
  padding:8px 18px;
  border-radius:999px;
  background:rgba(255,255,255,0.02);
  border:1px solid rgba(255,255,255,0.03);
  letter-spacing:0.12em;
  text-transform:uppercase;
  font-size:0.78rem;
  color:var(--gold);
}
.hero-title{
  font-weight:800;
  font-size:clamp(2rem,5vw,3.6rem);
  line-height:1.04;
  margin:18px 0;
  background:linear-gradient(120deg,var(--gold),#f7d36b);
  -webkit-background-clip:text;
  color:transparent;
  background-size:120%;
}
.hero-title.hero-title-glow{
  animation:heroGlowSweep 1.8s ease-out forwards;
  background-size:220%;
  filter:drop-shadow(0 0 18px rgba(236,198,180,0.55));
}
.hero-blurb{
  max-width:760px;
  margin:10px auto 18px;
  color:rgba(226,232,240,0.9);
  font-size:1.04rem
}
.hero-cta{
  display:flex;
  gap:14px;
  justify-content:center;
  flex-wrap:wrap
}

/* BUTTONS */
.btn{
  padding:12px 30px;
  border-radius:999px;
  font-weight:700;
  text-transform:uppercase;
  letter-spacing:0.06em;
  border:none;
  cursor:pointer;
  outline:none
}
.btn-primary{
  background:linear-gradient(135deg,#e3b8a5 0%,#f6d4c8 100%);
  color:#2a0e12;
  border:1px solid rgba(255,255,255,0.18);
  transition:transform 0.28s cubic-bezier(.2,.9,.2,1), box-shadow 0.35s ease;
  position:relative;
  overflow:hidden
}
.btn-primary:hover{
  transform:translateY(-4px) scale(1.03);
  box-shadow:0 14px 40px rgba(227,146,146,0.12)
}
.btn-primary::after{
  content:'';
  position:absolute;
  left:-60%;
  top:0;
  height:100%;
  width:60%;
  background:linear-gradient(120deg, rgba(255,255,255,0.25), rgba(255,255,255,0.06), rgba(255,255,255,0.18));
  transform:skewX(-18deg);
  transition:all 0.9s ease;
  opacity:0
}
.btn-primary:hover::after{
  left:120%;
  opacity:1
}
@keyframes neonPulse{0%{box-shadow:0 0 0 rgba(231,150,150,0)}50%{box-shadow:0 0 24px rgba(231,150,150,0.18)}100%{box-shadow:0 0 0 rgba(231,150,150,0)}}
.btn-primary.neon{animation:neonPulse 2.8s ease-in-out infinite}
.btn-ghost{
  background:rgba(255,255,255,0.12);
  border:1px solid rgba(255,255,255,0.12);
  color:var(--muted);
  transition:box-shadow 0.3s ease, transform 0.3s ease
}
.btn-ghost:hover{
  box-shadow:0 10px 28px rgba(0,0,0,0.28);
  transform:translateY(-3px)
}

/* CONTENT WRAPPER */
.content-wrapper{
  max-width:1200px;  
}

/* PROFILE SECTION */
.profile-wrap{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:40px;
  align-items:center;
  padding:40px 24px;
  background:linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.025));
  border-radius:18px;
  margin-top:40px;
  box-shadow:0 20px 45px rgba(0,0,0,0.25);
  overflow:visible;
  border:1px solid rgba(255,255,255,0.1);
  backdrop-filter:blur(18px);
}
.profile-photo{
  width:100%;
  height:420px;
  object-fit:cover;
  border-radius:12px;
  border:1px solid rgba(255,255,255,0.18);
  box-shadow:0 10px 30px rgba(0,0,0,0.28);
  backdrop-filter:blur(6px);
}
.profile-meta{color:#e3b8a5}
.profile-name{
  font-size:1.8rem;
  font-weight:800;
  color:#f5c6b8;
  display:inline-block;
  position:relative
}
.profile-name.shimmer-once{
  background:linear-gradient(120deg,#fde6dc,#f5c6b8,#fee9df);
  background-size:220%;
  -webkit-background-clip:text;
  color:transparent;
  animation:roseGoldShimmer 1.7s ease-out forwards
}
.profile-role{
  color:#eac2b2;
  margin-bottom:12px;
  display:inline-block;
  position:relative;
  font-size:0.92rem;
  font-weight:600
}
.profile-role.shimmer-once{
  background:linear-gradient(120deg,#fde6dc,#f7d2c2,#fee9df);
  background-size:220%;
  -webkit-background-clip:text;
  color:transparent;
  animation:roseGoldShimmer 1.6s ease-out forwards
}
.profile-bio{color:#e8c5b6;line-height:1.7}
@keyframes roseGoldShimmer{0%{background-position:-160% 50%;filter:drop-shadow(0 0 12px rgba(236,198,180,0.55));}100%{background-position:160% 50%;filter:drop-shadow(0 0 0 rgba(236,198,180,0));}}

/* ICONS */
.feature-icon {
  font-size: 2.5rem;
  color: var(--gold);
  margin-bottom: 16px;
  line-height: 1;
}

/* SECTION HEADING */
.section-heading {
  text-align: center;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 800;
  color: var(--muted);
  margin-top: 60px;
  margin-bottom: 40px;
}

/* FEATURES GRID */
.features{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:28px;
  margin: 0 0 60px 0;
  padding:0;
  list-style:none
}
.feature{
  background:rgba(255,255,255,0.06);
  backdrop-filter:blur(12px);
  padding:24px;
  border-radius:14px;
  box-shadow:0 10px 24px rgba(0,0,0,0.18);
  opacity:0;
  transform:translateY(24px) scale(0.97);
  filter: blur(10px);
  will-change: transform, opacity, filter;
  transition: box-shadow 0.35s ease, transform 0.35s ease;
}
.feature:hover{
  transform:translateY(-8px) scale(1.02);
  box-shadow:0 22px 44px rgba(0,0,0,0.26)
}
.feature h4{margin:6px 0;color:#e9b94a}
.feature p{font-size:0.95rem;color:rgba(226,232,240,0.9)}

/* SERVICES BAND */
.services-band{
  background:linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));
  color:#0abab5;
  padding:36px 18px;
  margin-top:32px;
  border-radius:16px;
  box-shadow:0 20px 40px rgba(0,0,0,0.25);
  border:1px solid rgba(255,255,255,0.1);
  backdrop-filter:blur(18px);
}
.services-grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:18px;
  max-width:1100px;
  margin:0 auto
}
.services-grid h3{font-weight:800;margin-bottom:6px;color:#76e0db}
.services-list{font-size:0.92rem;color:rgba(180,255,250,0.88);line-height:1.6}
.services-heading{text-align:center;color:#7de3dc;font-weight:900;margin-bottom:8px}
.services-subheading{text-align:center;color:rgba(125,227,220,0.85);margin-bottom:18px}

/* CLIENTS */
.clients{
  padding:44px 20px 10px 20px;
  text-align:center
}
.clients img{
  max-height:40px;
  opacity:0.45;
  margin:0 24px
}

/* CTA PANEL */
.cta-panel{
  padding:38px 20px;
  background:linear-gradient(180deg, rgba(8,12,24,0.48), rgba(8,12,24,0.6));
  backdrop-filter:blur(16px);
  border-radius:14px;
  margin: 40px 0 0 0;  
  text-align:center;
  border:1px solid rgba(255,255,255,0.06);
}
.cta-panel h3{color:var(--gold);font-weight:800}
.cta-panel p{
  max-width:860px;  
  margin-bottom: 24px; 
  color:rgba(226,232,240,0.95);
}

/* REVEAL LINE */
.reveal-line{
  height:3px;
  width:140px;
  background:linear-gradient(90deg,#ffd6c2,#e6b0a0);
  transform-origin:left;
  transform:scaleX(0);
  margin:40px auto 40px;
  border-radius:4px;
  z-index:5;
  position:relative
}

/* RESPONSIVE */
@media (max-width:980px){
  .profile-wrap{grid-template-columns:1fr;padding:28px}
  .features{grid-template-columns:repeat(2,1fr)}
  .services-grid{grid-template-columns:repeat(2,1fr)}
  .hero-section{padding:var(--nav-height, 70px) 16px 60px}
}
@media (max-width:640px){
  .hero-title{font-size:1.8rem}
  .features{grid-template-columns:1fr}
  .services-grid{grid-template-columns:1fr}
  .profile-photo{height:320px}
}
`;

/* === FRAMER-MOTION VARIANTS (APPLE-STYLE LAYERED REVEAL) === */

const pageVariants = {
  hidden: { opacity: 0, filter: "blur(12px)" },
  show: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const heroContainer = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.98,
    filter: "blur(16px)",
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.85,
      ease: "easeOut",
      staggerChildren: 0.16,
      delayChildren: 0.18,
    },
  },
};

const heroItemTop = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const heroItemMid = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

const heroItemBottom = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const profileContainer = {
  hidden: {
    opacity: 0,
    y: 46,
    scale: 0.96,
    filter: "blur(18px)",
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: "easeOut",
      staggerChildren: 0.18,
      delayChildren: 0.18,
    },
  },
};

const profileImageVariant = {
  hidden: { opacity: 0, x: -40, filter: "blur(14px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: "easeOut" },
  },
};

const profileTextVariant = {
  hidden: { opacity: 0, x: 40, filter: "blur(14px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const featuresContainer = {
  hidden: {
    opacity: 0,
    y: 40,
    filter: "blur(16px)",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: "easeOut",
      staggerChildren: 0.12,
      delayChildren: 0.14,
    },
  },
};

const featureItem = {
  hidden: { opacity: 0, y: 26, scale: 0.96, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

const servicesVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.97,
    filter: "blur(16px)",
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.75,
      ease: "easeOut",
      staggerChildren: 0.16,
    },
  },
};

const servicesTextVariant = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const servicesGridItemVariant = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

const clientsSectionVariant = {
  hidden: {
    opacity: 0,
    y: 40,
    filter: "blur(16px)",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.75,
      ease: "easeOut",
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const clientsHeadingVariant = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const clientsLogoVariant = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const ctaVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.97,
    filter: "blur(16px)",
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: "easeOut",
      staggerChildren: 0.16,
      delayChildren: 0.14,
    },
  },
};

const ctaHeadingVariant = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const ctaTextVariant = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

const ctaButtonsVariant = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const About = () => {
  const heroVideoSrc = "/assets/intro.mkv";

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    document.body.classList.add("about-page-active");
    const video = document.querySelector(".page-video-background video");
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
    const video = document.querySelector(".page-video-background video");
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

  useEffect(() => {
    const computeNavHeight = () => {
      if (typeof document === "undefined") return;
      const nav = document.querySelector('nav, header, .navbar, #navbar, [role="navigation"]');
      const h = nav ? nav.getBoundingClientRect().height : 0;
      document.documentElement.style.setProperty("--nav-height", `${h}px`);
    };
    computeNavHeight();
    window.addEventListener("resize", computeNavHeight);
    const t = setTimeout(computeNavHeight, 200);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", computeNavHeight);
    };
  }, []);

  const { scrollYProgress } = useScroll();
  const parallax = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  const [refProfile, inViewProfile] = useInView({ threshold: 0.2, triggerOnce: true });
  const [refFeatures, inViewFeatures] = useInView({ threshold: 0.15, triggerOnce: true });
  const [heroTitleRef, heroTitleInView] = useInView({ threshold: 0.6, triggerOnce: true });
  const [refServices, inViewServices] = useInView({ threshold: 0.25, triggerOnce: true });
  const [refCTA, inViewCTA] = useInView({ threshold: 0.35, triggerOnce: true });
  const [refClients, inViewClients] = useInView({ threshold: 0.15, triggerOnce: true });

  const founder = {
    name: "Shridhar Sharatkumar Hegde",
    role: "Founder & Full-Stack Developer",
    location: "Siddapur-581355 (U.K)",
    school: "SDMIT, Ujire — Information Science",
    bio: `Born and raised in the quiet town of Siddapur-581355, I am currently pursuing my career as an Information Science engineer at SDMIT, Ujire. I built TourEase as a one-man full-stack project — starting from beginner-level web development skills and iterating until the platform could help travellers plan with less friction. I handle UI, backend glue, basic AI integrations, and the day-to-day code that keeps TourEase running.`,
    photo: "/assets/founder.jpg",
  };

  return (
    <motion.div className="about-page" variants={pageVariants} initial="hidden" animate="show">
      <style>{aboutStyles}</style>

      {/* FULLPAGE BACKGROUND VIDEO */}
      <div className="page-video-background">
        <motion.video
          poster="/assets/hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          data-src={heroVideoSrc}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        >
          <source src={heroVideoSrc} type="video/mkv" />
        </motion.video>
        <motion.div
          className="page-video-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.0, ease: "easeOut" }}
        />
      </div>

      <div className="about-shell">
        {/* HERO */}
        <motion.section
          className="hero-section"
          style={{ y: parallax }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
        >
          <motion.div className="hero-content" variants={heroContainer}>
            <motion.span className="pretitle" variants={heroItemTop}>
              Guided journeys · Smart planning · One person behind the code
            </motion.span>

            <motion.h1
              ref={heroTitleRef}
              className={`hero-title ${heroTitleInView ? "hero-title-glow" : ""}`}
              style={{ marginTop: 12 }}
              variants={heroItemMid}
            >
              TourEase — travel planning that keeps the adventure, loses the friction.
            </motion.h1>

            <motion.p className="hero-blurb" variants={heroItemMid}>
              A compact, friendly tool to plan trips, collect memories and hand off the logistics to
              a simple, predictable system. Built with care by one developer who wanted fewer tabs,
              less stress, and more time in the sun.
            </motion.p>

            <motion.div className="hero-cta" variants={heroItemBottom}>
              <motion.a
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-primary"
                href="/planner"
              >
                Start your itinerary
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.02, y: -1 }}
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

        {/* MAIN CONTENT */}
        <section className="content-wrapper">
          {/* PROFILE SECTION */}
          <motion.div
            ref={refProfile}
            className={`profile-wrap ${inViewProfile ? "in-view" : ""}`}
            initial="hidden"
            animate={inViewProfile ? "show" : "hidden"}
            variants={profileContainer}
          >
            <motion.div variants={profileImageVariant}>
              <img src={founder.photo} alt={founder.name} className="profile-photo" />
            </motion.div>
            <motion.div className="profile-meta" variants={profileTextVariant}>
              <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                <h2 className={`profile-name ${inViewProfile ? "shimmer-once" : ""}`}>
                  {founder.name}
                </h2>
                <span className={`profile-role ${inViewProfile ? "shimmer-once" : ""}`}>
                  {founder.role}
                </span>
              </div>
              <div style={{ margin: "10px 0 8px", color: "rgba(7,18,34,0.6)", fontWeight: 600 }}>
                {founder.school} · {founder.location}
              </div>
              <p className="profile-bio">{founder.bio}</p>

              <div style={{ marginTop: 18 }}>
                <motion.a
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-primary"
                  href="mailto:shridhars@example.com"
                  style={{ marginRight: 12 }}
                >
                  Talk to Creator
                </motion.a>
                <motion.a
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-ghost"
                  href="mailto:shridhars@example.com"
                >
                  Contact me
                </motion.a>
              </div>

              <div style={{ marginTop: 22, display: "flex", gap: 14, alignItems: "center" }}>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(7,18,34,0.6)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Skills:
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["React", "Node.js", "MongoDB", "Framer Motion"].map((skill) => (
                    <span
                      key={skill}
                      style={{
                        background: "#e9e6dd",
                        color: "#071122",
                        padding: "6px 10px",
                        borderRadius: 8,
                        fontWeight: 700,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* SERVICES TITLE */}
          <motion.h2
            className="section-heading"
            initial={{ opacity: 0, y: 32, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            Our Services
          </motion.h2>

          {/* FEATURES GRID */}
          <motion.div
            ref={refFeatures}
            className="features"
            initial="hidden"
            animate={inViewFeatures ? "show" : "hidden"}
            variants={featuresContainer}
          >
            <motion.div
              whileHover={{ rotateX: 2, rotateY: -2, scale: 1.04 }}
              transition={{ type: "spring", stiffness: 120 }}
              className="feature"
              variants={featureItem}
            >
              <BsCloudSun className="feature-icon" />
              <h4>Live Weather</h4>
              <p>Get real-time weather updates for any destination before and during your trip.</p>
            </motion.div>
            <motion.div className="feature" variants={featureItem}>
              <BsSignpostSplit className="feature-icon" />
              <h4>Routing Info</h4>
              <p>Smart routing suggestions to optimize your travel time between locations.</p>
            </motion.div>
            <motion.div className="feature" variants={featureItem}>
              <BsGeoAlt className="feature-icon" />
              <h4>Nearby Spots</h4>
              <p>Discover restaurants, attractions, fuel stations and essentials around you.</p>
            </motion.div>
            <motion.div className="feature" variants={featureItem}>
              <BsLightbulb className="feature-icon" />
              <h4>Trip Insights</h4>
              <p>Auto-generated trip insights based on your itinerary and behavior.</p>
            </motion.div>
          </motion.div>

          {/* REVEAL LINE */}
          <motion.div
            className="reveal-line"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            viewport={{ once: true }}
            style={{ transformOrigin: "left" }}
          />

          {/* SERVICES BAND */}
          <motion.section
            ref={refServices}
            className={`services-band ${inViewServices ? "in-view" : ""}`}
            initial="hidden"
            animate={inViewServices ? "show" : "hidden"}
            variants={servicesVariants}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <motion.h2 className="services-heading" variants={servicesTextVariant}>
                Our Capabilities
              </motion.h2>
              <motion.p className="services-subheading" variants={servicesTextVariant}>
                TourEase is lightweight but focused — here are the building blocks that power the
                site.
              </motion.p>

              <motion.div className="services-grid">
                <motion.div variants={servicesGridItemVariant}>
                  <h3>Planner</h3>
                  <div className="services-list">
                    Itinerary creator · Day split automation · Shared links
                  </div>
                </motion.div>
                <motion.div variants={servicesGridItemVariant}>
                  <h3>Uploads</h3>
                  <div className="services-list">
                    Assignment & receipts upload · File previews · Versioned attachments
                  </div>
                </motion.div>
                <motion.div variants={servicesGridItemVariant}>
                  <h3>Profile & History</h3>
                  <div className="services-list">
                    Track your past trips · Personal notes · Export to PDF
                  </div>
                </motion.div>
                <motion.div variants={servicesGridItemVariant}>
                  <h3>Smarts</h3>
                  <div className="services-list">
                    Basic recommendations · Priority sorting · Lightweight caching
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.section>

          {/* CLIENTS SECTION */}
          <motion.section
            ref={refClients}
            className="clients"
            initial="hidden"
            animate={inViewClients ? "show" : "hidden"}
            variants={clientsSectionVariant}
          >
            <motion.h3
              style={{ color: "#9aa0ab", marginBottom: 24 }}
              variants={clientsHeadingVariant}
            >
              Trusted by early users & test trips
            </motion.h3>
            <motion.div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 20,
                flexWrap: "wrap",
              }}
              variants={clientsLogoVariant}
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
            </motion.div>
          </motion.section>

          {/* CTA PANEL */}
          <motion.section
            ref={refCTA}
            className={`cta-panel ${inViewCTA ? "in-view" : ""}`}
            initial="hidden"
            animate={inViewCTA ? "show" : "hidden"}
            variants={ctaVariants}
            viewport={{ once: true, amount: 0.35 }}
          >
            <motion.h3 variants={ctaHeadingVariant}>Ready to plan something memorable?</motion.h3>
            <motion.p variants={ctaTextVariant}>
              Tell me where you want to go and how many days you have — I’ll show you a simple
              itinerary and the next steps.
            </motion.p>
            <motion.div
              style={{ display: "flex", gap: 12, justifyContent: "center" }}
              variants={ctaButtonsVariant}
            >
              <motion.a
                className="btn btn-primary"
                href="/planner"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Create my trip
              </motion.a>
              <motion.a
                className="btn btn-ghost"
                href="mailto:shridhars@example.com"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                Talk to the creator
              </motion.a>
            </motion.div>
          </motion.section>
        </section>
      </div>
    </motion.div>
  );
};

export default About;
