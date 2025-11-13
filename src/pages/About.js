import React, { useEffect } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

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
  top: -100px;
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
  
  motion.section, motion.div {
    will-change: transform, opacity;
  }
  
  
  .about-page {
    position: relative;
    min-height: 100%;
    background: transparent;
    overflow-x: hidden;
    overflow-y: visible;
  }

  /* Global video overlay for readability */
  body.about-page-active::before {
    content: "";
    position: fixed;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.2) 0%,
      rgba(0, 0, 0, 0.45) 100%
    );
    z-index: 0;
    pointer-events: none;
  }
	
	.about-page {
		min-height: 100vh;
		background: #020617;
		color: #e2e8f0;
		font-family: "Poppins", sans-serif;
		position: relative;
		overflow-x: hidden;
		margin: 0;
		padding: 0;
	}
		.about-shell {
			position: relative;
			width: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
		}

	.hero-section {
			position: relative;
			min-height: 100vh;
			display: grid;
			place-items: center;
			overflow: hidden;
			width: 100%;
	}
	/* Ensures video stays visible behind all content */
	.about-page,
	body.about-page-active .main-content,
	header,
	footer {
	  position: relative;
	  z-index: 1;
	}
	
	/* Keeps video layered correctly and visible site-wide */
	.hero-video {
    width: 100%;
    height: 100vh;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    transform-origin: center center;
    will-change: transform;
  }
  
	.hero-overlay {
		will-change: transform, opacity;
			position: absolute;
			top: 0;
			left: 50%;
			width: 100vw;
			height: 100%;
			transform: translateX(-50%);
			background:
				linear-gradient(180deg, rgba(5,10,25,0.68) 0%, rgba(2,6,23,0.9) 80%),
				radial-gradient(900px 540px at 18% 18%, rgba(14,116,144,0.22), transparent 70%);
			mix-blend-mode: normal;
	}

	.hero-content {
		position: relative;
		z-index: 2;
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
    padding: clamp(0px, 2vh, 40px) clamp(10px, 4vw, 60px) clamp(32px, 6vh, 80px);
    margin-top: -40px; /* pulls section closer to navbar */
    display: grid;
		gap: 18px;
		justify-items: center;
		text-align: center;
	  }
	  
	.hero-title {
		font-size: clamp(2.8rem, 6vw, 4.6rem);
		font-weight: 800;
		line-height: 1.05;
		letter-spacing: -0.02em;
		max-width: 760px;
		margin: 0 auto;
		background: linear-gradient(120deg, #fef3c7 0%, #facc15 40%, #38bdf8 85%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.hero-blurb {
		max-width: 640px;
		color: rgba(226,232,240,0.9);
		font-size: 1.1rem;
		line-height: 1.8;
		margin: 0 auto;
	}

	.hero-cta {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		margin-top: 12px;
		justify-content: center;
	}

	.btn-primary,
	.btn-secondary {
		padding: 14px 34px;
		border-radius: 999px;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		font-size: 0.82rem;
		transition: transform 0.25s ease, box-shadow 0.3s ease;
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

const About = () => {
  const heroVideoSrc = "/assets/intro.mkv";
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
    const video = document.querySelector(".hero-video");

    const loadVideo = () => {
      if (!video) return;
      const src = video.getAttribute("data-src");
      if (src) {
        video.src = src;
        video.load();
        video.play().catch(() => {});
      }
    };

    if ("requestIdleCallback" in window) {
      requestIdleCallback(loadVideo, { timeout: 2000 });
    } else {
      setTimeout(loadVideo, 1000);
    }
  }, []);
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

  return (
    <div className="about-page">
      <style>{aboutStyles}</style>
      <div className="about-shell">
        <motion.section
          className="hero-section"
          style={{ y }} // 🌊 Parallax motion tied to scroll
          variants={fadeVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          {/* 🎥 Background Video */}
          <motion.video
            className="hero-video"
            poster="/assets/hero-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            style={{
              y: videoY ?? 0, // fallback to prevent stretch on load
              scale: 1.02, // slight zoom for cinematic tone
              transformOrigin: "center center",
              willChange: "transform",
            }}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1.02 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <source src={heroVideoSrc} type="video/mp4" />
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
              Guided journeys · Seamless support · Real stories
            </motion.span>

            <h1
              ref={refTitle}
              className="hero-title"
              style={{
                transform: inViewTitle ? "translateY(0)" : "translateY(60px)",
                opacity: inViewTitle ? 1 : 0,
                transition: "all 1.2s cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            >
              We ease the weight of planning so you can feel every moment of your trip.
            </h1>

            <p
              ref={refBlurb}
              className="hero-blurb"
              style={{
                transform: inViewBlurb ? "translateY(0)" : "translateY(50px)",
                opacity: inViewBlurb ? 1 : 0,
                transition: "all 1.4s cubic-bezier(0.25, 1, 0.5, 1)",
              }}
            >
              TourEase is the travel companion for explorers who crave depth without the logistics
              grind. We merge human travel designers with adaptive intelligence to choreograph
              itineraries that flex with you—sunrise to midnight.
            </p>

            <div className="hero-cta">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                href="/planner"
                className="btn-primary"
              >
                Craft my itinerary
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                href="/stories"
                className="btn-secondary"
              >
                Watch traveler stories
              </motion.a>
            </div>
          </motion.div>

          <main className="event-sequence">
            {/* Content 1 */}
            <motion.div
              className="event-block-centered"
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: false, amount: 0.4 }}
              whileHover={{ scale: 1.03 }}
            >
              <h2 className="event-title">CHASE THE HORIZON</h2>
              <p className="event-desc">
                Feel the wind bite as you ascend Himalayan trails, or the golden sand slip through
                your fingers in Goa’s twilight. TourEase designs journeys that blur the line between
                dream and reality — so every sunrise feels like your first.
              </p>
            </motion.div>

            {/* Content 2 */}
            <motion.div
              className="event-block-centered"
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: false, amount: 0.6 }}
            >
              <h2 className="event-title">BEYOND THE MAP</h2>
              <p className="event-desc">
                From city skylines lit like constellations to mountain ridges kissed by mist — we
                guide you to places that don’t exist on ordinary maps. Every turn, every trail,
                every tide — sculpted by your own rhythm. Adventure doesn’t start with a booking. It
                starts with a heartbeat.
              </p>
            </motion.div>

            {/* Content 3 */}
            <motion.div
              className="event-block-centered"
              initial={{ opacity: 0, y: 120 }}
              whileInView={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -120 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              viewport={{ once: false, amount: 0.6 }}
            >
              <h2 className="event-title">WHERE STORIES BEGIN</h2>
              <p className="event-desc">
                Whether it’s sharing laughter with locals under Bali’s lantern-lit skies, or tracing
                footprints across Iceland’s icy silence — we turn your travels into living stories.
                Not just destinations, but memories carved into time.
              </p>
            </motion.div>
          </main>
          <motion.section
            className="cta-panel"
            style={{ y }}
            variants={fadeVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
          >
            <h2
              ref={refCTA}
              className="section-title"
              style={{
                transform: inViewCTA ? "translateY(0)" : "translateY(40px)",
                opacity: inViewCTA ? 1 : 0,
                transition: "all 1s cubic-bezier(0.23, 1, 0.32, 1)",
                marginBottom: 20,
              }}
            >
              Ready to feel excited—not exhausted—about planning?
            </h2>

            <p
              className="section-intro"
              style={{
                transform: inViewCTA ? "translateY(0)" : "translateY(40px)",
                opacity: inViewCTA ? 1 : 0,
                transition: "all 1.2s cubic-bezier(0.23, 1, 0.32, 1)",
                margin: "0 auto 32px",
              }}
            >
              Share your dream destination, travel crew, and vibe. We will translate it into a
              flexible itinerary, secure your bookings, and stay close while you explore.
            </p>
            <div className="hero-cta">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                href="/get-started"
                className="btn-primary"
              >
                Start my travel brief
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                href="mailto:care@tourease.com"
                className="btn-secondary"
              >
                Talk to a planner
              </motion.a>
            </div>
          </motion.section>
        </motion.section>
      </div>
    </div>
  );
};

export default About;
