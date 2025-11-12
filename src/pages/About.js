import React, { useEffect } from "react";
import { motion } from "framer-motion";
//import Navbar from "../components/Navbar"; // 🧭 adjust path if needed

const heroVideoSrc = "/assets/intro.mkv";

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
	  position: fixed;
	  top: 0;
	  left: 0;
	  width: 100%;
	  height: 100%;
	  object-fit: cover;
	  z-index: 0;
	  filter: saturate(110%) contrast(95%) brightness(0.75);
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
		padding: clamp(40px, 8vh, 100px) clamp(10px, 4vw, 60px) clamp(32px, 6vh, 80px);
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

	.essentials-grid {
		display: grid;
		gap: 26px;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
	}

	.essential-card {
		position: relative;
		padding: 28px 32px;
		border-radius: 20px;
		background: linear-gradient(150deg, rgba(15,23,42,0.92), rgba(8,11,26,0.92));
		border: 1px solid rgba(148,163,184,0.22);
		box-shadow: 0 24px 48px rgba(2,6,23,0.45);
		overflow: hidden;
	}

	.essential-card::after {
		content: "";
		position: absolute;
		inset: 0;
		background: linear-gradient(140deg, rgba(56,189,248,0.24), transparent 68%);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.essential-card:hover::after {
		opacity: 1;
	}

	.essential-card h3 {
		font-size: 1.15rem;
		font-weight: 600;
		margin-bottom: 12px;
		color: #fef3c7;
	}

	.essential-card p {
		color: rgba(203,213,225,0.8);
		line-height: 1.7;
		font-size: 0.95rem;
	}

	.timeline {
		position: relative;
		border-left: 1px solid rgba(148,163,184,0.35);
		margin-left: 16px;
		padding-left: 28px;
		display: grid;
		gap: 42px;
	}

	.timeline-point {
		position: relative;
	}

	.timeline-point::before {
		content: "";
		position: absolute;
		left: -39px;
		top: 6px;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		border: 3px solid rgba(56,189,248,0.8);
		background: #0f172a;
		box-shadow: 0 0 18px rgba(56,189,248,0.55);
	}

	.timeline-point h4 {
		font-size: 1.2rem;
		font-weight: 600;
		margin-bottom: 8px;
	}

	.timeline-point p {
		color: rgba(203,213,225,0.8);
		line-height: 1.7;
	}

	.story-canvas {
		position: relative;
		border-radius: 28px;
		overflow: hidden;
		background: linear-gradient(180deg, rgba(15,23,42,0.9), rgba(2,6,23,0.95));
		border: 1px solid rgba(226,232,240,0.12);
		box-shadow: 0 28px 50px rgba(2,6,23,0.6);
		margin: 0 auto;
	}

	.story-media {
		position: relative;
		padding-bottom: 56.25%;
	}

	.story-media video {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: saturate(115%);
	}

	.story-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgba(15,23,42,0.25), rgba(15,23,42,0.95));
	}

	.story-copy {
		position: relative;
		padding: 36px 32px 48px;
		display: grid;
		gap: 18px;
		text-align: left;
	}

	.story-copy h3 {
		font-size: 1.55rem;
		font-weight: 600;
		color: #fef3c7;
	}

	.story-copy p {
		color: rgba(203,213,225,0.85);
		line-height: 1.8;
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

	.cta-panel {
		position: relative;
		border-radius: 0;
		padding: clamp(48px, 6vw, 80px) clamp(20px, 5vw, 80px);
		text-align: center;
		background: linear-gradient(140deg, rgba(15,23,42,0.95), rgba(9,12,30,0.95));
		border: none;
		box-shadow: none;
		overflow: hidden;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
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

const essentials = [
  {
    title: "We translate your travel pulse",
    copy: "Tell us your pace, dietary needs, and must-feel moments. Our planners stitch that into a living itinerary that evolves with you.",
  },
  {
    title: "Human experts on standby",
    copy: "From lost luggage to sudden storms, our travel concierges and local fixers smooth out surprises before they derail your day.",
  },
  {
    title: "Tech that watches the horizon",
    copy: "Real-time flight intel, strike alerts, and weather pivots are baked in. We adjust bookings and notify you instantly.",
  },
  {
    title: "Group harmony tools",
    copy: "Shared boards, split payments, and mood-based suggestions keep everyone excited—no endless message threads required.",
  },
];

const serviceStages = [
  {
    heading: "Dream Mapping",
    body: "We co-create your travel DNA through a guided discovery. Mood boards, past favorites, accessibility needs, and hidden hopes are captured here.",
  },
  {
    heading: "Adaptive Blueprint",
    body: "Our AI blends local expertise with live data to propose a cinematic itinerary. You edit with clicks, we refine until it feels like you.",
  },
  {
    heading: "Launch & Companion",
    body: "The TourEase app becomes your co-pilot—tickets stored, directions guided, and concierge chat ready for on-the-ground requests.",
  },
  {
    heading: "Moments That Linger",
    body: "We capture highlights, polaroids, and journal prompts so the story of your trip lives on. Rebook favorite spots in a single tap.",
  },
];

const travelerVoices = [
  {
    name: "Hannah & Omar",
    role: "Newlyweds, Marrakech escape",
    words:
      "We handed TourEase a Pinterest board and they gave us lantern-lit dinners, quiet riads, and sunrise desert guides who felt like friends.",
  },
  {
    name: "Arjun",
    role: "Solo climber, Patagonia",
    words:
      "Weather turned, buses stopped, and somehow I still summited. They rerouted me mid-hike and had a warm lodge waiting that night.",
  },
  {
    name: "Nguyen family",
    role: "Three generations, Japan",
    words:
      "Wheelchair-ready routes, toddler nap windows, and tea ceremonies my parents still talk about. We just showed up and soaked it in.",
  },
];

const About = () => {
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

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 🧹 Cleanup on component unmount
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

  return (
    <div className="about-page">
      <style>{aboutStyles}</style>
      <div className="about-shell">
        <section className="hero-section">
          <motion.video
            className="hero-video"
            data-src={heroVideoSrc}
            autoPlay
            muted
            loop
            playsInline
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
          />
          <motion.div
            className="hero-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />

          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
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
            <h1 className="hero-title">
              We ease the weight of planning so you can feel every moment of your trip.
            </h1>
            <p className="hero-blurb">
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
        </section>

        <main className="content-wrapper">
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }} // 👈 small but powerful upgrade
            transition={{ duration: 0.7, ease: "easeOut" }} // smoother animation
          >
            <h2 className="section-title">Why TourEase exists</h2>
            <p className="section-intro">
              We are travelers who lost weekends to spreadsheets and sleepless nights refreshing
              airline tabs. TourEase began to rewrite that experience—giving adventurers cinematic
              stories without the stress sweat.
            </p>
            <div className="essentials-grid">
              {essentials.map((item) => (
                <motion.div
                  key={item.title}
                  className="essential-card"
                  whileHover={{ translateY: -6 }}
                >
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h2 className="section-title">How we choreograph your adventure</h2>
            <p className="section-intro">
              Our service weaves technology, empathetic planners, and a global caretaker network.
              Every stage keeps you relaxed yet ready for whatever the road reveals.
            </p>
            <div className="timeline">
              {serviceStages.map((stage) => (
                <div key={stage.heading} className="timeline-point">
                  <h4>{stage.heading}</h4>
                  <p>{stage.body}</p>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="story-canvas">
              <div className="story-media">
                <video src={heroVideoSrc} autoPlay muted loop playsInline />
                <div className="story-overlay" />
              </div>
              <div className="story-copy">
                <h3>From idea to immersive escape</h3>
                <p>
                  The film you see is where TourEase travelers have stood—dawn flights over coral
                  reefs, markets humming with colour, and cliffside sunsets captured only after we
                  cleared their schedules. Every journey is guarded by our concierge team, adapting
                  the plan when tides shift.
                </p>
                <p>
                  Whether you crave hidden trails or a resort cocoon, our planners collaborate with
                  local hosts, sustainable vendors, and safety scouts so the experience stays
                  magical and mindful.
                </p>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h2 className="section-title">Travelers who trusted us with their time</h2>
            <p className="section-intro">
              Real voices from journeys we shepherded—from deserts to glaciers, families to
              soloists. They handed us the heavy lifting and reclaimed awe.
            </p>
            <div className="testimonials-grid">
              {travelerVoices.map((voice) => (
                <motion.div key={voice.name} className="testimonial-card" whileHover={{ y: -6 }}>
                  <p>“{voice.words}”</p>
                  <div className="testimonial-meta">
                    <strong>{voice.name}</strong>
                    <span>{voice.role}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </main>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="cta-panel">
            <h2 className="section-title" style={{ marginBottom: 20 }}>
              Ready to feel excited—not exhausted—about planning?
            </h2>
            <p className="section-intro" style={{ margin: "0 auto 32px" }}>
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
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default About;
