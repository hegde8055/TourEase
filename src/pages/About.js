import React, {
  // Scroll progress bar
  useEffect,
  useState,
  useRef,
} from "react";
import { useScroll, useTransform, motion, useMotionValue, useSpring } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Footer from "../components/Footer";
// ----- Level 3: GSAP ScrollTrigger Cinematic Engine -----
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

/* 🌫️ Level‑3 Atmospherics — fog, bloom, depth */
const fogAnimate = () => {
  gsap.utils.toArray(".fog-layer").forEach((layer, i) => {
    gsap.to(layer, {
      x: i % 2 === 0 ? 80 : -80,
      opacity: 0.5 + i * 0.15,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "+=1200",
        scrub: 1.5,
      },
    });
  });
};

// ----- Magnetic Button + Parallax utilities -----
const MagneticButton = ({ href, children, className }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 25 });
  const sy = useSpring(y, { stiffness: 300, damping: 25 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handle = (e) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      x.set(relX * 0.15);
      y.set(relY * 0.12);
    };
    const reset = () => {
      x.set(0);
      y.set(0);
    };
    el.addEventListener("mousemove", handle);
    el.addEventListener("mouseleave", reset);
    return () => {
      el.removeEventListener("mousemove", handle);
      el.removeEventListener("mouseleave", reset);
    };
  }, [x, y]);

  return (
    <motion.a
      ref={ref}
      href={href}
      className={className}
      style={{ translateX: sx, translateY: sy }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.a>
  );
};

// Small utility to add gentle 3D tilt on event cards
const useCardTilt = (selector = ".event-block-centered") => {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(selector));
    if (!els.length) return;
    const handlers = new Map();
    els.forEach((el) => {
      const mousemove = (e) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        const rx = -py * 6;
        const ry = px * 6;
        el.style.transform = `translateY(-6px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.01)`;
        el.style.transition = "transform 120ms linear";
      };
      const leave = () => {
        el.style.transform = "translateY(0) rotateX(0) rotateY(0) scale(1)";
        el.style.transition = "transform 500ms cubic-bezier(.2,.8,.2,1)";
      };
      el.addEventListener("mousemove", mousemove);
      el.addEventListener("mouseleave", leave);
      handlers.set(el, { mousemove, leave });
    });
    return () => {
      handlers.forEach((v, el) => {
        el.removeEventListener("mousemove", v.mousemove);
        el.removeEventListener("mouseleave", v.leave);
      });
    };
  }, [selector]);
};

const aboutStyles = `
  body.about-page-active .main-content {
    padding-top: 20px;
  }

  body.about-page-active header {
    top: 10px;
  }
  /* 🧭 Tighten navbar position to exactly 10px from the top */
  body, html {
	margin: 0;
	padding: 0;
  }
  
  /* 🧭 Ensure global Navbar always stays on top */
header, .navbar {
  z-index: 9999 !important;
  position: fixed;
  top: 40px; /* increased from 20px for visibility */
  left: 50%;
  transform: translateX(-50%);
}
  
  header {
	width: 100%;
	margin: 0 auto;
	display: flex;
	justify-content: center;
	align-items: center;
  }
  
  /* 🧭 Scroll & background fix */
  html, body {
    height: auto;
    overflow-y: auto;
  }
  html {
	scroll-behavior: smooth;
	backface-visibility: hidden;
	-webkit-font-smoothing: antialiased;
  }
  html, body {
    scroll-behavior: smooth;
    perspective: 1000px;
  }
  
  /* motion elements hint */
  .about-page {
    position: relative;
    min-height: 100%;
    background: transparent;
    overflow-x: hidden;
    overflow-y: visible;
  }

  /* ✨ CINEMATIC SCROLL EFFECTS */

  /* ✨ Apple Vision Pro — Holographic text effect REMOVED for hero area */
/* (Kept disabled except inside event-block-centered cards) */

/* subtle sheen disabled */
  .holo-gradient::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02) 40%, rgba(255,255,255,0.08));
    mix-blend-mode: screen;
    opacity: 0.7;
    transform: translateZ(0);
  }

  /* apply the holographic treatment to most textual elements */
  ./* hologram disabled for hero */
    text-shadow: 0 8px 26px rgba(0,0,0,0.45);
  }

  /* For primary buttons, keep the button background but add a subtle holo sheen on text */
  .btn-primary {
    color: #041120; /* keep readable on bright gradient button */
    position: relative;
    overflow: hidden;
  }
  .btn-primary .holo-text,
  .btn-secondary .holo-text {
    display: inline-block;
    background-image: linear-gradient(90deg, var(--holo-1), var(--holo-2), var(--holo-3), var(--holo-4));
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: holoShift 7.5s linear infinite;
  }

  /* small screens: slow down the holo animation to reduce motion sensitivity */
  @media (max-width: 720px) {
    .holo-gradient, .btn-primary .holo-text, .btn-secondary .holo-text { animation-duration: 14s; }
  }


.hero-video {
  filter: brightness(0.92) contrast(1.05) saturate(1.2);
}

.hero-video::after {
  content: "";
  position: absolute;
  inset: 0;
  backdrop-filter: blur(2px);
}

/* ✨ Apple‑style fade + depth */
.event-block-centered {
  position: relative;
  z-index: 1;
  background: rgba(15,23,42,0.92);
  border: 1px solid rgba(255,255,255,0.08);
  margin: 80px 0;
  padding: 40px;
  border-radius: 20px;
  backdrop-filter: blur(6px);
  transition: transform 0.25s ease, box-shadow 0.3s ease;: transform 0.25s ease, box-shadow 0.3s ease;
	}

	.btn-primary {
		background: linear-gradient(130deg, #facc15, #f97316 55%, #facc15 100%);
		color: #041120;
		box-shadow: 0 25px 45px rgba(250,204,21,0.25);
	}

	.btn-secondary {
		background: rgba(15,23,42,0.72);
		border: 1px solid rgba(148,163,184,0.35);
		color: #e2e8f0;
	}

	.btn-primary:hover,
	.btn-secondary:hover {
		transform: translateY(-4px);
	}

	.content-wrapper {
		width: 100%;
		max-width: 1200px;
		margin: clamp(48px, 9vh, 108px) auto 0;
		padding: 0 clamp(24px, 6vw, 108px);
		display: grid;
		gap: clamp(80px, 10vw, 128px);
		justify-items: center;
	}

	.content-wrapper > * {
		width: 100%;
	}
  
	.section-title {
		font-size: clamp(2rem, 4vw, 3rem);
		font-weight: 700;
		letter-spacing: -0.01em;
		margin-bottom: 16px;
		text-align: center;
	}

	.section-intro {
		max-width: 960px;
		margin: 0 auto;
		padding: 0;
		color: rgba(203,213,225,0.85);
		font-size: 1.05rem;
		line-height: 1.8;
		text-align: center;
	}
	  .cta-panel {
		overflow: visible;
	  }
	  
	.testimonials-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 24px;
	}

	.testimonial-card {
		position: relative;
		padding: 28px 26px;
		border-radius: 20px;
		background: rgba(15,23,42,0.92);
		border: 1px solid rgba(244,229,161,0.18);
		box-shadow: 0 24px 45px rgba(2,6,23,0.55);
	}

	.testimonial-card p {
		color: rgba(226,232,240,0.85);
		line-height: 1.7;
		margin-bottom: 18px;
	}

	.testimonial-meta {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.testimonial-meta span {
		font-size: 0.86rem;
		color: rgba(148,163,184,0.78);
	}
  .event-sequence {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .event-sequence::before {
    content: "";
    position: absolute;
    left: 50%;
    top: 0;
    width: 2px;
    height: 100%;
    background: linear-gradient(to bottom, rgba(250,204,21,0.8), rgba(59,130,246,0.2));
    transform: translateX(-50%);
    z-index: 0;
  }
  
  .event-block-centered {
  position: relative;
  z-index: 1;
  background: rgba(15,23,42,0.85);
  border: 1px solid rgba(255,255,255,0.05);
  margin: 80px 0;
  padding: 60px;
  border-radius: 24px;
  backdrop-filter: blur(10px);
  transition: transform 0.6s ease, opacity 0.6s ease;
}

.event-title {
  font-size: clamp(2.4rem, 5vw, 3.6rem);
  font-weight: 800;
  text-align: center;
  letter-spacing: -0.01em;
  color: #fef3c7; /* original normal text */
  margin-bottom: 20px;
}
}

.event-desc {
  font-size: 1.15rem;
  line-height: 1.75;
  color: rgba(203,213,225,0.85);
  padding: 0 10px;
  text-align: center;
}
}
}
  
  .event-block-centered:hover {
    transform: translateY(-10px);
  }
  
.cta-panel::before {
  content: "";
  position: absolute;
  top: -120px;
  left: 0;
  width: 100%;
  height: 120px;
  background: linear-gradient(to bottom, transparent, rgba(15,23,42,0.9));
  pointer-events: none;
}

.cta-panel {
  position: relative;
  width: 100%;
  text-align: center;
  background: linear-gradient(140deg, rgba(15,23,42,0.95), rgba(9,12,30,0.95));
  border: none;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 20px; /* Reduced padding */
  overflow: visible; /* Ensures no inner scroll */
  max-height: unset; /* Removes height restrictions */
}

.cta-panel > * {
  margin: 12px 0;
}

  
	.cta-panel::after {
		content: "";
		position: absolute;
		inset: -15%;
		background: radial-gradient(circle, rgba(250,204,21,0.2), transparent 70%);
	}

	.cta-panel > * {
		position: relative;
		z-index: 1;
	}

	.cta-bleed {
		position: relative;
		width: 100%;
		margin: clamp(48px, 10vh, 96px) 0 0;
		min-height: min(calc(100vh - 110px), 720px);
		display: flex;
		align-items: stretch;
		justify-content: center;
	}

	@media (max-width: 960px) {
		.hero-content {
			padding: 120px 24px 72px;
		}
		.content-wrapper {
			margin: 64px auto 0;
			padding: 0 24px;
			gap: 80px;
		}
		.timeline {
			margin-left: 12px;
			padding-left: 22px;
		}
		.cta-bleed {
			margin-top: 96px;
		}
		.cta-panel {
			padding: 64px 28px;
		}
	}

	@media (max-width: 640px) {
		.hero-content {
			padding: 96px 20px 56px;
		}
		.btn-primary,
		.btn-secondary {
			width: 100%;
			justify-content: center;
			text-align: center;
		}
		.cta-panel {
			padding: 56px 20px;
		}
	}
`;

// import ScrollProgressBar from "../components/ScrollProgressBar";

const heroVideoSources = [
  { src: "/assets/Welcome to Karnataka _ One State Many Worlds.mp4", type: "video/mp4" },
  { src: "/assets/intro.mkv", type: "video/x-matroska" },
];

const primaryVideoSrc = heroVideoSources[0]?.src ?? "";

const About = () => {
  // enable level-2 parallax tilt on event cards
  useCardTilt();

  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // 🟦 LEVEL‑3: Apple Vision Pro style camera‑push + depth parallax
  useEffect(() => {
    const ctx = gsap.context(() => {
      fogAnimate(); // 🌫️ LEVEL‑3 Fog activated

      // Camera push on scroll
      gsap.to(".hero-video", {
        scale: 1.08,
        ease: "power1.out",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: 2.2,
        },
      });

      // Hero overlay deepen on scroll
      gsap.to(".hero-overlay", {
        opacity: 0.92,
        ease: "power1.out",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: 2.2,
        },
      });

      // Event blocks floating depth
      gsap.utils.toArray(".event-block-centered").forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 120, filter: "blur(12px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              end: "top 40%",
              scrub: 1,
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const { classList } = document.body;
    classList.add("about-page-active");

    // 🎬 Select the hero video for visibility control
    const video = document.querySelector(".hero-video");

    // ⚡ Pause the video when the tab isn't active (saves CPU/GPU)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        video?.pause();
      } else {
        video?.play();
      }
    };
    // Text reveal setup
    document.addEventListener("visibilitychange", handleVisibilityChange);
    // 🧹 Cleanup on component unmount
    // Text reveal setup
    return () => {
      classList.remove("about-page-active");
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
  useEffect(() => {
    // 💤 Lazy-load background video for better performance
    if (videoError) return undefined;

    const video = document.querySelector(".hero-video");

    const loadVideo = () => {
      if (!video) return;

      const sources = Array.from(video.querySelectorAll("source[data-src]"));
      sources.forEach((source) => {
        const dataSrc = source.getAttribute("data-src");
        if (dataSrc && !source.getAttribute("src")) {
          source.setAttribute("src", dataSrc);
        }
      });

      if (!video.getAttribute("src") && primaryVideoSrc) {
        video.setAttribute("src", primaryVideoSrc);
      }

      video.load();
      video.play().catch(() => {});
    };

    if ("requestIdleCallback" in window) {
      requestIdleCallback(loadVideo, { timeout: 2000 });
    } else {
      setTimeout(loadVideo, 1000);
    }
  }, [videoError]);
  // 🌀 Scroll motion setup
  const { scrollYProgress } = useScroll();

  // Parallax movement on scroll
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

  // Shared fade variant for all scroll reveals
  const fadeVariant = {
    hidden: { opacity: 0, y: 80 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };
  // Slight depth motion for hero background video
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  // ✨ Scroll-based text reveal hooks (must be at top-level)
  const [refTitle, inViewTitle] = useInView({ threshold: 0.4, triggerOnce: false });
  const [refBlurb, inViewBlurb] = useInView({ threshold: 0.3, triggerOnce: false });
  const [refCTA, inViewCTA] = useInView({ threshold: 0.3, triggerOnce: false });

  const heroSectionClassName = `hero-section${videoError ? " no-video" : ""}`;
  const revealTitle = hasMounted ? inViewTitle : true;
  const revealBlurb = hasMounted ? inViewBlurb : true;
  const revealCTA = hasMounted ? inViewCTA : true;

  return (
    <div className="about-page">
      <style>{aboutStyles}</style>
      {/* <ScrollProgressBar /> */}
      <div className="about-shell">
        <motion.section
          className={heroSectionClassName}
          variants={fadeVariant}
          initial={hasMounted ? "hidden" : "visible"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          {/* 🌫️ Level‑3 Atmospherics Layers (fog placed under content) */}
          <div className="fog-layer fog-1" aria-hidden />
          <div className="fog-layer fog-2" aria-hidden />
          <div className="fog-layer fog-3" aria-hidden />

          {/* 🎥 Background Video */}
          <motion.video
            className="hero-video"
            poster="/assets/1.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            data-src={primaryVideoSrc}
            onLoadedData={() => setVideoLoaded(true)}
            onError={() => {
              setVideoError(true);
              setVideoLoaded(false);
            }}
            style={{
              y: videoY,
              scale: 1.05, // cinematic zoom
              minWidth: "100%",
              minHeight: "100%",
              width: "100vw",
              height: "100vh",
              objectFit: "cover",
              position: "absolute",
              top: 0,
              left: 0,
            }}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: videoError ? 0 : videoLoaded ? 1 : 0, scale: 1.02 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            {heroVideoSources.map(({ src, type }, index) => (
              <source key={`${type}-${index}`} data-src={src} type={type} />
            ))}
          </motion.video>

          {/* 🌒 Overlay */}
          <motion.div
            className="hero-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
          <motion.div
            className="hero-content"
            variants={fadeVariant}
            initial="hidden"
            whileInView="visible"
            style={{ y }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 20px",
                borderRadius: 999,
                background: "rgba(15,23,42,0.65)",
                border: "1px solid rgba(148,163,184,0.4)",
                color: "#fef3c7",
                fontSize: "0.8rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Journeys Reimagined · Crafted For You · Travel Beyond Ordinary
            </motion.span>

            <h1
              ref={refTitle}
              className="hero-title"
              style={{
                transform: revealTitle ? "translateY(0)" : "translateY(60px)",
                opacity: revealTitle ? 1 : 0,
                transition: "all 1.2s cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            >
              We ease the weight of planning so you can feel every moment of your trip.
            </h1>

            <p
              ref={refBlurb}
              className="hero-blurb"
              style={{
                transform: revealBlurb ? "translateY(0)" : "translateY(50px)",
                opacity: revealBlurb ? 1 : 0,
                transition: "all 1.4s cubic-bezier(0.25, 1, 0.5, 1)",
              }}
            >
              TourEase is the travel companion for explorers who crave depth without the logistics
              grind. We merge human travel designers with adaptive intelligence to choreograph
              itineraries that flex with you—sunrise to midnight.
            </p>

            <div className="hero-cta">
              <MagneticButton href="/get-started" className="btn-primary">
                <span className="holo-text">Start my travel brief</span>
              </MagneticButton>
              <MagneticButton href="mailto:care@tourease.com" className="btn-secondary">
                <span className="holo-text">Talk to a planner</span>
              </MagneticButton>
            </div>
          </motion.div>
        </motion.section>

        {/* ✨ EVENT SEQUENCE — LEVEL‑2 PARALLAX */}
        <motion.main className="event-sequence">
          <motion.div
            className="events-container"
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.3 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.22 } },
            }}
          >
            {/* 1 — Chase the Horizon */}
            <motion.div
              className="event-block-centered"
              variants={{ hidden: { opacity: 0, y: 90 }, visible: { opacity: 1, y: 0 } }}
            >
              <h2 className="event-title">Chase the Horizon</h2>
              <p className="event-desc">
                Stand where the sky kisses the earth. From Mt. Everest’s dawn glow to Bali’s warm
                tides, every journey pulls you toward the edge of possibility.
              </p>
            </motion.div>

            {/* 2 — Echoes of the Unknown */}
            <motion.div
              className="event-block-centered"
              variants={{ hidden: { opacity: 0, y: 90 }, visible: { opacity: 1, y: 0 } }}
            >
              <h2 className="event-title">Echoes of the Unknown</h2>
              <p className="event-desc">
                Walk ancient paths carved by stories older than memory. Desert winds, forest
                whispers, canyon echoes—every step reveals a world untouched.
              </p>
            </motion.div>

            {/* 3 — Rhythm of the Journey */}
            <motion.div
              className="event-block-centered"
              variants={{ hidden: { opacity: 0, y: 90 }, visible: { opacity: 1, y: 0 } }}
            >
              <h2 className="event-title">Rhythm of the Journey</h2>
              <p className="event-desc">
                Cities hum, mountains breathe, oceans roar. Follow the pulse of the planet as it
                guides your path through chaos and calm alike.
              </p>
            </motion.div>

            {/* 4 — Where Memories Are Forged */}
            <motion.div
              className="event-block-centered"
              variants={{ hidden: { opacity: 0, y: 90 }, visible: { opacity: 1, y: 0 } }}
            >
              <h2 className="event-title">Where Memories Are Forged</h2>
              <p className="event-desc">
                Sunsets witnessed. Roads conquered. People met. Journeys complete you in ways
                destinations never could.
              </p>
            </motion.div>

            {/* 5 — Wander Beyond Maps */}
            <motion.div
              className="event-block-centered"
              variants={{ hidden: { opacity: 0, y: 90 }, visible: { opacity: 1, y: 0 } }}
            >
              <h2 className="event-title">Wander Beyond Maps</h2>
              <p className="event-desc">
                Some treasures can’t be located—only discovered. Step beyond routes, lose the map,
                and find the world waiting.
              </p>
            </motion.div>

            {/* 6 — The Path You Haven’t Taken */}
            <motion.div
              className="event-block-centered"
              variants={{ hidden: { opacity: 0, y: 90 }, visible: { opacity: 1, y: 0 } }}
            >
              <h2 className="event-title">The Path You Haven't Taken</h2>
              <p className="event-desc">
                The most meaningful journeys begin with one brave step into the unfamiliar. Let
                curiosity lead—you’ll never walk the same again.
              </p>
            </motion.div>
          </motion.div>
        </motion.main>

        {/* ✨ CTA PANEL */}
        <motion.section
          className="cta-bleed"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.45 }}
          variants={{
            hidden: { opacity: 0, y: 60 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.9, ease: "easeOut" },
            },
          }}
        >
          <div className="cta-panel">
            <motion.h2
              ref={refCTA}
              className="section-title"
              style={{ color: "#facc15" }}
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: revealCTA ? 1 : 0, y: revealCTA ? 0 : 35 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              Start your next unforgettable escape
            </motion.h2>
            <motion.p
              className="section-intro"
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: revealCTA ? 1 : 0, y: revealCTA ? 0 : 35 }}
              transition={{ duration: 1.1, ease: "easeOut", delay: 0.1 }}
            >
              Let our travel specialists craft a journey that moves with you—fluid, cinematic,
              unforgettable.
            </motion.p>

            <MagneticButton href="/planner" className="btn-primary">
              <span className="holo-text">Plan My Journey</span>
            </MagneticButton>
            <MagneticButton href="mailto:care@tourease.com" className="btn-secondary">
              <span className="holo-text">Speak With Us</span>
            </MagneticButton>
          </div>
        </motion.section>

        {/* 🔻 Footer added below */}
        <Footer />
      </div>
    </div>
  );
};

// 🔻 Import Footer

export default About;
