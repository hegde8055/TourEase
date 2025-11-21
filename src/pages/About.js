import React, { useEffect, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
// --- ICONS ADDED HERE ---
import { BsCloudSun, BsSignpostSplit, BsGeoAlt, BsLightbulb } from "react-icons/bs";
import { FaInstagram, FaTwitter, FaYoutube, FaDiscord, FaLinkedin } from "react-icons/fa";

// -----------------------------------------------------------------------------
// Redesigned About.js — cleaned, fixed imports, corrected CSS and animations
// All frontend logic (styles, layout, animations) is contained in this file
// Replace '/assets/founder.jpg' and heroVideoSrc with your actual assets when deploying
// -----------------------------------------------------------------------------

const aboutStyles = `
/* CULPRIT FIX 1: Made resets more aggressive with !important */
html, body, #root {
  margin: 0 !important;
  padding: 0 !important;
  height: 100%;
}
/* safety: hide any leftover spacer elements that use classnames containing 'spacer' */
[class*="spacer"], [id*="spacer"] {
  display: none !important;
  height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
}
/* ensure hero content visually starts under/at the very top */
.hero-content {
  margin-top: 50px !important;
}


:root{
  --gold: #caa72b;
  --deep: #081225;
  --muted: rgba(226,232,240,0.92);
}
*{box-sizing:border-box}
/* Base font-family is now part of the main reset above */
html,body{height:100%;font-family:Poppins,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial}

/* FIX: This is the fix for the top gap.
  This negative margin cancels the 90px padding from App.css.
*/
.about-page{
  margin: -90px 0 0 0; /* This is the fix */
  padding: 0;
  /* background: linear-gradient...; <-- REMOVED to allow video bg */
  color:var(--muted);
  min-height:100vh;
  position: relative; /* For z-index stacking */
}

.scroll-progress-track{
  position:fixed;
  top:0;
  left:0;
  width:100%;
  height:5px;
  background:rgba(255,255,255,0.06);
  backdrop-filter:blur(10px);
  z-index:1400;
  pointer-events:none;
}
.scroll-progress-bar{
  height:100%;
  background:linear-gradient(90deg, #f3cdbc 0%, #e3b8a5 50%, #caa72b 100%);
  box-shadow:0 0 12px rgba(227,184,165,0.65);
}

/* --- NEW: FULL PAGE VIDEO BACKGROUND --- */
.page-video-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -2; /* Behind all content */
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
  z-index: -1; /* On top of video, behind content */
}

/* This padding is for the bottom gap */
.about-shell{
  max-width:1200px;
  margin:0 auto;
  padding: 0 16px 80px 16px; 
  position: relative; /* Ensure content stays on top */
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

/* This padding is correct. It pushes the *content* down so the navbar
  doesn't hide it.
*/
.hero-section{
  position: relative;
  min-height: 70vh;
  display: grid;
  place-items: center;
  padding: var(--nav-height, 70px) 20px 80px;
  margin: 50px 0px 0px 0px ;
  top: 0 !important;
}

/* OLD VIDEO STYLES (REMOVED/DISABLED) */
.hero-video{ display: none; }
.hero-overlay{ display: none; }

.hero-content{position:relative;z-index:3;text-align:center;max-width:980px;padding:28px;border-radius:18px;margin-top:12px;backdrop-filter:blur(10px);background:linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));border:1px solid rgba(255,255,255,0.06);opacity:0;transform:translateY(12px);transition:opacity 0.7s ease, transform 0.7s ease}
.hero-content.visible{opacity:1;transform:none}
.pretitle{display:inline-block;padding:8px 18px;border-radius:999px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.03);letter-spacing:0.12em;text-transform:uppercase;font-size:0.78rem;color:var(--gold)}
.hero-title{font-weight:800;font-size:clamp(2rem,5vw,3.6rem);line-height:1.04;margin:18px 0;background:linear-gradient(120deg,var(--gold),#f7d36b);-webkit-background-clip:text;color:transparent;background-size:120%;}
.hero-title.hero-title-glow{animation:heroGlowSweep 1.8s ease-out forwards;background-size:220%;filter:drop-shadow(0 0 18px rgba(236,198,180,0.55));}
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


.content-wrapper{
  max-width:1200px;  
}

/* Founder / profile section - split layout */
/* --- FIX: Added margin-top: 40px to create space below the hero section --- */
.profile-wrap{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center;padding:40px 24px;background:linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.025));border-radius:18px;margin-top:40px;box-shadow:0 20px 45px rgba(0,0,0,0.25);overflow:visible;border:1px solid rgba(255,255,255,0.1);backdrop-filter:blur(18px);transition:transform 0.45s ease, box-shadow 0.45s ease, border 0.45s ease}
.profile-wrap:hover{transform:translateY(-8px) scale(1.01);box-shadow:0 28px 65px rgba(0,0,0,0.35);border-color:rgba(227,184,165,0.45)}
.profile-photo{width:100%;height:420px;object-fit:cover;border-radius:12px;border:1px solid rgba(255,255,255,0.18);box-shadow:0 10px 30px rgba(0,0,0,0.28);backdrop-filter:blur(6px);transition:transform 0.45s ease}
.profile-wrap:hover .profile-photo{transform:scale(1.02)}
.profile-meta{color:#e3b8a5}
.profile-name{font-size:1.8rem;font-weight:800;color:#f5c6b8;display:inline-block;position:relative}
.profile-name.shimmer-once{background:linear-gradient(120deg,#fde6dc,#f5c6b8,#fee9df);background-size:220%;-webkit-background-clip:text;color:transparent;animation:roseGoldShimmer 1.7s ease-out forwards}
.profile-role{color:#eac2b2;margin-bottom:12px;display:inline-block;position:relative}
.profile-role.shimmer-once{background:linear-gradient(120deg,#fde6dc,#f7d2c2,#fee9df);background-size:220%;-webkit-background-clip:text;color:transparent;animation:roseGoldShimmer 1.6s ease-out forwards}
.profile-bio{color:#e8c5b6;line-height:1.7}
@keyframes roseGoldShimmer{0%{background-position:-160% 50%;filter:drop-shadow(0 0 12px rgba(236,198,180,0.55));}100%{background-position:160% 50%;filter:drop-shadow(0 0 0 rgba(236,198,180,0));}}

/* --- CSS FOR ICONS ADDED HERE --- */
.feature-icon {
  font-size: 2.5rem; /* 40px */
  color: var(--gold);
  margin-bottom: 16px;
  line-height: 1;
}

/* --- NEW: CSS FOR SECTION HEADING --- */
.section-heading {
  text-align: center;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 800;
  color: var(--muted);
  margin-top: 60px; /* Space above the heading */
  margin-bottom: 40px; /* Space between heading and grid */
}

/* Feature grid */
.features{display:grid;grid-template-columns:repeat(4,1fr);gap:28px;margin: 0 0 60px 0;padding:0;list-style:none} /* MODIFIED: margin from 60px 0 */
.feature{background:rgba(255,255,255,0.06);backdrop-filter:blur(12px);padding:24px;border-radius:14px;box-shadow:0 10px 24px rgba(0,0,0,0.18);transition:transform 0.35s cubic-bezier(.2,.9,.2,1),box-shadow 0.35s ease,opacity 0.6s ease;opacity:0;transform:translateY(18px)}
.feature.visible{opacity:1;transform:none}
.feature:hover{transform:translateY(-8px) scale(1.02);box-shadow:0 22px 44px rgba(0,0,0,0.26)}
.feature h4{margin:6px 0;color:#e9b94a}
.feature p{font-size:0.95rem;color:rgba(226,232,240,0.9)}

/* Services band */
.services-band{background:linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));color:#0abab5;padding:36px 18px;margin-top:32px;border-radius:16px;box-shadow:0 20px 40px rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.1);backdrop-filter:blur(18px);transition:transform 0.45s ease, box-shadow 0.45s ease, border 0.45s ease}
.services-band.in-view{animation:servicesGlassReveal 0.85s ease-out forwards}
.services-band:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 26px 60px rgba(0,0,0,0.3);border-color:rgba(10,186,181,0.45)}
.services-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;max-width:1100px;margin:0 auto}
.services-grid h3{font-weight:800;margin-bottom:6px;color:#76e0db}
.services-list{font-size:0.92rem;color:rgba(180,255,250,0.88);line-height:1.6}
@keyframes servicesGlassReveal{0%{opacity:0;transform:translateY(28px) scale(0.95);filter:blur(12px);}100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0);}}
.services-heading{text-align:center;color:#7de3dc;font-weight:900;margin-bottom:8px}
.services-subheading{text-align:center;color:rgba(125,227,220,0.85);margin-bottom:18px}

/* Clients */
.clients{padding:44px 20px 10px 20px;text-align:center}
.clients img{max-height:40px;opacity:0.45;margin:0 24px}

/* CTA panel */
.cta-panel{
  padding:38px 20px;
  background:linear-gradient(180deg, rgba(8,12,24,0.48), rgba(8,12,24,0.6));
  backdrop-filter:blur(16px);
  border-radius:14px;
  margin: 40px 0 0 0;  
  text-align:center;
  border:1px solid rgba(255,255,255,0.06);
}
.cta-panel.in-view{animation:ctaPanelRise 0.9s ease-out forwards}
.cta-panel h3{color:var(--gold);font-weight:800}
.cta-panel p{
  max-width:860px;  
  margin-bottom: 24px; 
  color:rgba(226,232,240,0.95);
}
.cta-panel.in-view .btn-primary{animation:ctaRipple 1.15s ease-out 0.45s forwards}
@keyframes ctaPanelRise{0%{opacity:0;transform:translateY(30px);}100%{opacity:1;transform:translateY(0);}}
@keyframes ctaRipple{0%{box-shadow:0 0 0 0 rgba(243,205,189,0.55);}70%{box-shadow:0 0 0 18px rgba(243,205,189,0);}100%{box-shadow:0 0 0 0 rgba(243,205,189,0);}}

/* NEON ROSE-GOLD & SHIMMER */
.btn-primary{position:relative;overflow:hidden}
.btn-primary::after{content:'';position:absolute;left:-60%;top:0;height:100%;width:60%;background:linear-gradient(120deg, rgba(255,255,255,0.25), rgba(255,255,255,0.06), rgba(255,255,255,0.18));transform:skewX(-18deg);transition:all 0.9s ease;opacity:0}
.btn-primary:hover::after{left:120%;opacity:1}
@keyframes neonPulse{0%{box-shadow:0 0 0 rgba(231,150,150,0)}50%{box-shadow:0 0 24px rgba(231,150,150,0.18)}100%{box-shadow:0 0 0 rgba(231,150,150,0)}}
.btn-primary.neon{animation:neonPulse 2.8s ease-in-out infinite}

/* Reveal line */
.reveal-line{height:3px;width:140px;background:linear-gradient(90deg,#ffd6c2,#e6b0a0);transform-origin:left;transform:scaleX(0);margin:40px auto 40px;border-radius:4px;z-index:5;position:relative}

/* social modal */
.social-modal-backdrop{
  position:fixed;
  inset:0;
  background:rgba(2,6,23,0.72);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:1200;
  padding:20px;
}
.social-modal{
  position:relative;
  width:min(420px,100%);
  background:linear-gradient(180deg, rgba(12,18,36,0.94), rgba(12,18,36,0.88));
  border:1px solid rgba(243,205,189,0.22);
  border-radius:18px;
  padding:32px 28px 36px;
  box-shadow:0 28px 68px rgba(0,0,0,0.45);
  backdrop-filter:blur(18px);
  text-align:center;
}
.social-modal h4{
  color:var(--gold);
  font-size:1.4rem;
  margin-bottom:18px;
}
.social-modal p{
  color:rgba(226,232,240,0.88);
  margin-bottom:20px;
  font-size:0.95rem;
}
.social-modal-close{
  position:absolute;
  top:12px;
  right:12px;
  background:transparent;
  border:none;
  color:rgba(226,232,240,0.75);
  font-size:1.5rem;
  cursor:pointer;
  transition:color 0.2s ease;
}
.social-modal-close:hover{color:rgba(226,232,240,1)}
.social-links{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(120px,1fr));
  gap:16px;
}
.social-icon-btn{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:10px;
  padding:16px 12px;
  background:rgba(255,255,255,0.06);
  border-radius:14px;
  border:1px solid rgba(255,255,255,0.08);
  color:#f5c6b8;
  text-decoration:none;
  font-weight:600;
  transition:transform 0.25s ease, box-shadow 0.25s ease, border 0.25s ease;
}
.social-icon-btn svg,
.social-icon-btn .social-custom-initial{font-size:1.8rem}
.social-icon-btn:hover{
  transform:translateY(-4px) scale(1.02);
  box-shadow:0 16px 32px rgba(0,0,0,0.35);
  border-color:rgba(243,205,189,0.35);
}
.social-icon-btn:focus{outline:2px solid rgba(243,205,189,0.6);outline-offset:3px}
.social-icon-btn span{
  font-size:0.85rem;
  color:rgba(226,232,240,0.85);
}
.social-custom-initial{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:36px;
  height:36px;
  border-radius:12px;
  background:linear-gradient(135deg,#4f46e5,#9333ea);
  font-weight:800;
  font-size:1.05rem;
  color:#fff;
}


/* responsive breakpoint follows */
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

const UnstopIcon = () => (
  <span className="social-custom-initial" aria-hidden="true">
    U
  </span>
);

const About = () => {
  // hero video kept as variable — UPDATED TO INTRO.MKV
  const heroVideoSrc = "/assets/intro.mkv"; // <-- update this to your provided video path
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

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

  // This JS is still needed to calculate the padding-top for the hero section
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

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const updateProgress = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(progress);
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined" || !isSocialModalOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsSocialModalOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [isSocialModalOpen]);

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
  const profileContainer = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.18 },
    },
  };
  const profileItem = {
    hidden: { opacity: 0, y: 38, scale: 0.94 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.75, ease: "easeOut" },
    },
  };
  const featuresContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.16, delayChildren: 0.1 } },
  };
  const featureItem = {
    hidden: { opacity: 0, y: 30, scale: 0.94 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.65, ease: "easeOut" },
    },
  };
  const servicesVariants = {
    hidden: { opacity: 0, y: 32, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };
  const ctaVariants = {
    hidden: { opacity: 0, y: 26 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  const [refProfile, inViewProfile] = useInView({ threshold: 0.2, triggerOnce: true });
  const [refFeatures, inViewFeatures] = useInView({ threshold: 0.15, triggerOnce: true });
  const [heroTitleRef, heroTitleInView] = useInView({ threshold: 0.6, triggerOnce: true });
  const [refServices, inViewServices] = useInView({ threshold: 0.25, triggerOnce: true });
  const [refCTA, inViewCTA] = useInView({ threshold: 0.35, triggerOnce: true });

  const handleOpenSocialModal = () => setIsSocialModalOpen(true);
  const handleCloseSocialModal = () => setIsSocialModalOpen(false);

  const socialLinks = [
    // Update the URLs below with the correct social handles once available.
    { name: "Instagram", href: "https://instagram.com/hegde8055", Icon: FaInstagram },
    { name: "Twitter", href: "https://x.com/hegde8055", Icon: FaTwitter },
    { name: "YouTube", href: "https://youtube.com/@hegde8055", Icon: FaYoutube },
    { name: "Discord", href: "https://discord.com/users/hegde8055", Icon: FaDiscord },
    { name: "LinkedIn", href: "https://www.linkedin.com/in/shridhar-hegde", Icon: FaLinkedin },
    { name: "Unstop", href: "https://unstop.com/p/hegde8055", Icon: UnstopIcon },
  ];

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
      <div className="scroll-progress-track" aria-hidden="true">
        <motion.div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* --- NEW FULLPAGE VIDEO BACKGROUND --- */}
      <div className="page-video-background">
        <motion.video
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
          {/* UPDATED VIDEO TYPE */}
          <source src={heroVideoSrc} type="video/mkv" />
        </motion.video>
        <motion.div className="page-video-overlay" />
      </div>

      <div className="about-shell">
        {/* HERO */}
        <motion.section
          className="hero-section"
          style={{ y: parallax }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.25 }}
        >
          {/* Video and overlay removed from here */}

          <motion.div className="hero-content" variants={container}>
            <motion.span className="pretitle" variants={item}>
              Guided journeys · Smart planning · One person behind the code
            </motion.span>

            <motion.h1
              ref={heroTitleRef}
              className={`hero-title ${heroTitleInView ? "hero-title-glow" : ""}`}
              style={{ marginTop: 12 }}
              variants={item}
            >
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
            className={`profile-wrap ${inViewProfile ? "in-view" : ""}`}
            initial="hidden"
            animate={inViewProfile ? "show" : "hidden"}
            variants={profileContainer}
          >
            <motion.div variants={profileItem}>
              <img src={founder.photo} alt={founder.name} className="profile-photo" />
            </motion.div>
            <motion.div className="profile-meta" variants={profileItem}>
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
                <motion.button
                  whileHover={{ y: -4 }}
                  className="btn btn-primary"
                  type="button"
                  onClick={handleOpenSocialModal}
                  style={{ marginRight: 12 }}
                >
                  Talk to Creator
                </motion.button>
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

          {/* --- NEW: HEADING ADDED HERE --- */}
          <h2 className="section-heading">Our Services</h2>

          {/* --- FEATURES SECTION UPDATED WITH ICONS --- */}
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
              <p>Get real‑time weather updates for any destination before and during your trip.</p>
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
          <motion.section
            ref={refServices}
            className={`services-band ${inViewServices ? "in-view" : ""}`}
            initial="hidden"
            animate={inViewServices ? "show" : "hidden"}
            variants={servicesVariants}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <h2 className="services-heading">Our Capabilities</h2>
              <p className="services-subheading">
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
          </motion.section>

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
          <motion.section
            ref={refCTA}
            className={`cta-panel ${inViewCTA ? "in-view" : ""}`}
            initial="hidden"
            animate={inViewCTA ? "show" : "hidden"}
            variants={ctaVariants}
            viewport={{ once: true, amount: 0.35 }}
          >
            <h3>Ready to plan something memorable?</h3>
            <p>
              Tell me where you want to go and how many days you have — I’ll show you a simple
              itinerary and the next steps.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <a className="btn btn-primary" href="/explore">
                Create my trip
              </a>
              <button className="btn btn-ghost" type="button" onClick={handleOpenSocialModal}>
                Talk to the creator
              </button>
            </div>
          </motion.section>
        </section>
      </div>
      {isSocialModalOpen && (
        <motion.div
          className="social-modal-backdrop"
          onClick={handleCloseSocialModal}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="social-modal"
            onClick={(event) => event.stopPropagation()}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <button
              type="button"
              className="social-modal-close"
              onClick={handleCloseSocialModal}
              aria-label="Close social links modal"
            >
              ×
            </button>
            <h4>Connect with me</h4>
            <p>Follow along on your favourite platform.</p>
            <div className="social-links">
              {socialLinks.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  className="social-icon-btn"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                >
                  <Icon aria-hidden="true" />
                  <span>{name}</span>
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default About;
