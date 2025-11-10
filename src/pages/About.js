import React from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

const heroVideoSrc =
  "https://cdn.coverr.co/videos/coverr-aerial-view-of-tropical-island-5118/1080p.mp4";

const aboutStyles = `
	.about-page {
		min-height: 100vh;
		background: #020617;
		color: #e2e8f0;
		font-family: "Poppins", sans-serif;
		position: relative;
		overflow-x: hidden;
	}

	.about-shell {
		position: relative;
		width: 100%;
	}

	.hero-section {
		position: relative;
		min-height: 90vh;
		display: grid;
		place-items: center;
		overflow: hidden;
	}

	.hero-video {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: saturate(115%) contrast(105%);
	}

	.hero-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgba(3,7,18,0.35) 0%, rgba(3,7,18,0.92) 100%),
			radial-gradient(900px 540px at 18% 18%, rgba(14,116,144,0.35), transparent 70%);
		mix-blend-mode: multiply;
	}

	.hero-content {
		position: relative;
		z-index: 2;
		width: 100%;
		max-width: 1180px;
		padding: 140px 32px 120px;
		display: grid;
		gap: 32px;
	}

	.hero-title {
		font-size: clamp(2.8rem, 6vw, 4.6rem);
		font-weight: 800;
		line-height: 1.05;
		letter-spacing: -0.02em;
		max-width: 760px;
		background: linear-gradient(120deg, #fef3c7 0%, #facc15 40%, #38bdf8 85%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.hero-blurb {
		max-width: 640px;
		color: rgba(226,232,240,0.9);
		font-size: 1.1rem;
		line-height: 1.8;
	}

	.hero-cta {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		margin-top: 12px;
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
		max-width: 1180px;
		margin: 0 auto;
		padding: 0 32px 120px;
		display: grid;
		gap: 100px;
	}

	.section-title {
		font-size: clamp(2rem, 4vw, 3rem);
		font-weight: 700;
		letter-spacing: -0.01em;
		margin-bottom: 16px;
	}

	.section-intro {
		max-width: 720px;
		color: rgba(203,213,225,0.85);
		font-size: 1.05rem;
		line-height: 1.8;
	}

	.essentials-grid {
		display: grid;
		gap: 26px;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
	}

	.essential-card {
		position: relative;
		padding: 28px 24px;
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
		border-radius: 26px;
		padding: 52px 42px;
		text-align: center;
		background: linear-gradient(140deg, rgba(15,23,42,0.92), rgba(9,12,30,0.94));
		border: 1px solid rgba(148,163,184,0.25);
		box-shadow: 0 30px 60px rgba(2,6,23,0.65);
		overflow: hidden;
	}

	.cta-panel::after {
		content: "";
		position: absolute;
		inset: -20%;
		background: radial-gradient(circle, rgba(250,204,21,0.18), transparent 70%);
	}

	.cta-panel > * {
		position: relative;
		z-index: 1;
	}

	@media (max-width: 960px) {
		.hero-content {
			padding: 120px 24px 100px;
		}
		.content-wrapper {
			padding: 0 24px 100px;
		}
		.timeline {
			margin-left: 12px;
			padding-left: 22px;
		}
	}

	@media (max-width: 640px) {
		.hero-section {
			min-height: 80vh;
		}
		.hero-content {
			padding-top: 100px;
		}
		.btn-primary,
		.btn-secondary {
			width: 100%;
			justify-content: center;
			text-align: center;
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
  return (
    <div className="about-page">
      <Navbar />
      <style>{aboutStyles}</style>

      <div className="about-shell">
        <section className="hero-section">
          <motion.video
            className="hero-video"
            src={heroVideoSrc}
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
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
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
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
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
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
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
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
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

          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="cta-panel">
              <h2 className="section-title" style={{ marginBottom: 20 }}>
                Ready to feel excited—not exhausted—about planning?
              </h2>
              <p className="section-intro" style={{ margin: "0 auto 32px" }}>
                Share your dream destination, travel crew, and vibe. We will translate it into a
                flexible itinerary, secure your bookings, and stay close while you explore.
              </p>
              <div className="hero-cta" style={{ justifyContent: "center" }}>
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
        </main>
      </div>
    </div>
  );
};

export default About;
