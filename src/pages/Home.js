// /client/src/pages/Home.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useAuth } from "../App";
import { destinationAPI, enhancedPlacesAPI } from "../utils/api";
import {
  IoSparkles,
  IoPerson,
  IoRestaurant,
  IoBed,
  IoMap,
  IoArrowForward,
  IoStar,
  IoSwapHorizontal,
} from "react-icons/io5";

// --- ANIMATION HELPERS ---

// 1. Staggered Text Reveal
const StaggeredText = ({ text, className = "" }) => {
  const letters = text.split("");
  return (
    <span className={`inline-block ${className}`}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03, duration: 0.5, ease: "easeOut" }}
          className="inline-block"
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </span>
  );
};

// 2. Spotlight Card Effect
const SpotlightCard = ({ children, className = "" }) => {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 hover:border-amber-500/30 ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-0"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(212, 175, 55, 0.15), transparent 40%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// --- SHARED VIDEO BACKGROUND ---
const GlobalVideoBackground = () => (
  <div className="fixed inset-0 z-[-1] overflow-hidden">
    <div className="absolute inset-0 bg-slate-950/60 z-10" />{" "}
    {/* Darker overlay for better text contrast */}
    <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60">
      <source src="/assets/hero-bg.mp4" type="video/mp4" />
    </video>
  </div>
);

// --- MODERN HOME COMPONENT ---
const ModernHome = ({ activeDestination, weather, navigate }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const textY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen text-white overflow-x-hidden font-sans selection:bg-amber-500/30"
    >
      {/* Noise Texture */}
      <div
        className="fixed inset-0 pointer-events-none z-[100] opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Aurora Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-600/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-blue-900/20 rounded-full blur-[150px] animate-pulse-slow delay-1000" />
      </div>

      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="relative z-20 text-center px-6 max-w-7xl mx-auto flex flex-col items-center"
        >
          <div className="mb-10">
            <h1 className="text-[10vw] md:text-[7rem] lg:text-[8rem] font-bold leading-[0.9] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50 drop-shadow-2xl mix-blend-overlay">
              <StaggeredText text="TOUREASE" />
            </h1>
            <p className="text-lg md:text-2xl font-light text-amber-100/80 tracking-[0.3em] uppercase mt-6 backdrop-blur-sm">
              <StaggeredText text="The Art of Travel" />
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/explore")}
            className="group relative px-12 py-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <span className="relative z-10 text-xl font-medium tracking-widest uppercase text-white group-hover:text-amber-200">
              Begin Journey
            </span>
          </motion.button>
        </motion.div>
      </section>

      {/* FEATURED DESTINATION */}
      {activeDestination && (
        <section className="relative z-30 py-32 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-center">
            {/* Image Container */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-8 relative h-[500px] lg:h-[600px] rounded-[3rem] overflow-hidden shadow-2xl z-0"
            >
              <img
                src={activeDestination.heroImage || activeDestination.image}
                alt={activeDestination.name}
                className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-[1.5s]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
            </motion.div>

            {/* Content Card - Overlapping */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-5 lg:-ml-24 relative z-10 p-8 md:p-12 bg-slate-950/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <span className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
                Curated For You
              </span>
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">
                {activeDestination.name}
              </h2>
              <p className="text-lg text-white/80 mb-8 font-light leading-relaxed">
                {activeDestination.description?.substring(0, 150)}...
              </p>

              {weather && (
                <div className="flex items-center gap-6 mb-8 py-4 border-t border-b border-white/10">
                  <div className="text-4xl">
                    {weather.icon ? <img src={weather.icon} className="w-12 h-12" alt="w" /> : "🌤"}
                  </div>
                  <div>
                    <div className="text-2xl font-light text-white">
                      {weather.temperature || weather.temp}°C
                    </div>
                    <div className="text-sm text-white/60 uppercase tracking-wider">
                      {weather.conditionLabel}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() =>
                  navigate(`/explore?query=${encodeURIComponent(activeDestination.name)}`)
                }
                className="flex items-center gap-4 text-amber-300 hover:text-amber-200 uppercase tracking-widest py-4 px-2 -ml-2 rounded-lg hover:bg-white/5 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <span className="text-lg font-bold">Explore Destination</span>{" "}
                <IoArrowForward className="text-xl" />
              </button>
            </motion.div>
          </div>
        </section>
      )}

      {/* FEATURES MASONRY WITH SPOTLIGHT */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center mb-24"
        >
          <h2 className="text-4xl md:text-6xl font-serif text-white mb-6">Why TourEase?</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {[
            {
              title: "AI Architect",
              desc: "Intelligent itinerary crafting tailored to your preferences.",
              icon: <IoSparkles />,
              col: "lg:col-span-2",
            },
            {
              title: "Concierge",
              desc: "24/7 Personal support for every step.",
              icon: <IoPerson />,
              col: "lg:col-span-1",
            },
            {
              title: "Luxury Stays",
              desc: "Handpicked boutique hotels and villas.",
              icon: <IoBed />,
              col: "lg:col-span-1",
            },
            {
              title: "Fine Dining",
              desc: "Reservations at top-tier restaurants.",
              icon: <IoRestaurant />,
              col: "lg:col-span-2",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={feature.col}
            >
              <SpotlightCard className="h-full p-10 flex flex-col justify-between">
                <div className="text-5xl text-amber-400/80 mb-6">{feature.icon}</div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/60 text-lg leading-relaxed">{feature.desc}</p>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

// --- CLASSIC HOME COMPONENT ---
const ClassicHome = ({ activeDestination, weather, navigate }) => {
  const features = [
    { title: "Intelligent Journey Designer", description: "AI-curated escapes.", icon: "🧠" },
    {
      title: "Private Concierge Support",
      description: "Your personal travel stylist.",
      icon: "🤵",
    },
    { title: "Immersive Cultural Moments", description: "After-hours palace tours.", icon: "🏛️" },
    { title: "Dynamic Weather Insights", description: "Live micro-climate forecasts.", icon: "🌦️" },
  ];

  return (
    <div className="w-full min-h-screen text-slate-100 overflow-x-hidden font-sans pt-24">
      {" "}
      {/* Added pt-24 for spacing */}
      {/* Hero Content */}
      <div className="relative z-20 text-center px-6 max-w-5xl mx-auto h-[80vh] flex flex-col justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block py-1 px-4 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-medium tracking-widest uppercase mb-6 backdrop-blur-md">
            Where Whimsy Meets Wanderlust
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-400 mb-8 drop-shadow-2xl">
            Discover the Unseen
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Let moonlit palaces, spice-scented markets, and secret coffee trails unfold.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <button
              onClick={() => navigate("/explore")}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-lg shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <IoMap /> Start Exploring
            </button>
            <button
              onClick={() => navigate("/trending")}
              className="px-8 py-4 rounded-2xl bg-slate-800/40 backdrop-blur-md border border-amber-500/30 text-amber-200 font-bold text-lg flex items-center gap-2 hover:bg-slate-800/60 transition-colors"
            >
              <IoSparkles /> Trending Now
            </button>
          </div>
        </motion.div>
      </div>
      {/* Featured Destination */}
      {activeDestination && (
        <div className="relative z-30 px-6 pb-24">
          <div className="max-w-6xl mx-auto bg-slate-900/80 backdrop-blur-xl border border-amber-500/20 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative h-[400px] lg:h-auto overflow-hidden">
                <img
                  src={activeDestination.heroImage || activeDestination.image}
                  alt={activeDestination.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-8 left-8">
                  <h2 className="text-4xl font-bold text-white mb-1">{activeDestination.name}</h2>
                </div>
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <p className="text-slate-300 leading-relaxed mb-8 text-lg">
                  {activeDestination.description}
                </p>
                {weather && (
                  <div className="flex items-center gap-4 bg-slate-800/50 rounded-2xl p-4 mb-8 border border-white/5">
                    <div className="text-4xl">
                      {weather.icon ? <img src={weather.icon} alt="w" className="w-12" /> : "🌦"}
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">
                        {weather.temperature || weather.temp}°C
                      </div>
                    </div>
                  </div>
                )}
                <button
                  onClick={() =>
                    navigate(`/explore?query=${encodeURIComponent(activeDestination.name)}`)
                  }
                  className="py-3 px-6 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors"
                >
                  Explore More
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Features */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-amber-400 mb-6">
            Why Choose TourEase?
          </h2>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-slate-800/40 backdrop-blur-lg border border-white/5 p-8 rounded-3xl hover:border-amber-500/30 transition-colors"
            >
              <div className="text-5xl mb-6">{feature.icon}</div>
              <h3 className="text-xl font-bold text-slate-100 mb-4">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// --- MAIN HOME COMPONENT ---
const Home = () => {
  const navigate = useNavigate();
  const [activeDestination, setActiveDestination] = useState(null);
  const [weather, setWeather] = useState(null);
  const [isModern, setIsModern] = useState(true);

  const loadDestinationWeather = useCallback(async (destination) => {
    const coordsSource = destination?.location?.coordinates || destination?.location || null;
    const lat = coordsSource?.lat ?? (Array.isArray(coordsSource) ? Number(coordsSource[1]) : null);
    const lng = coordsSource?.lng ?? (Array.isArray(coordsSource) ? Number(coordsSource[0]) : null);
    if (lat == null || lng == null) return;
    try {
      const weatherResponse = await enhancedPlacesAPI.getWeather(lat, lng);
      const weatherData = weatherResponse.data?.weather || weatherResponse.data;
      if (weatherData) setWeather(weatherData);
    } catch (e) {
      console.warn("Weather fetch failed");
    }
  }, []);

  useEffect(() => {
    const bootstrapDestination = async () => {
      try {
        const trending = await destinationAPI.getTrending(6);
        if (trending?.length > 0) {
          const preferred = trending.find(
            (d) => !["taj", "kyoto"].some((k) => (d.name || "").toLowerCase().includes(k))
          );
          const dest = preferred || trending[0];
          setActiveDestination(dest);
          loadDestinationWeather(dest);
        }
      } catch (e) {
        console.warn(e);
      }
    };
    bootstrapDestination();
  }, [loadDestinationWeather]);

  return (
    <>
      <GlobalVideoBackground />

      {/* View Toggle Button - Moved to Bottom Left to avoid Chatbot */}
      <div className="fixed bottom-6 left-6 z-[1000]">
        <button
          onClick={() => setIsModern(!isModern)}
          className="flex items-center gap-3 px-6 py-3 bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 rounded-full text-amber-200 text-base font-bold hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/50 focus:outline-none focus:ring-2 focus:ring-amber-500"
          aria-label={isModern ? "Switch to Classic View" : "Switch to Modern View"}
        >
          <IoSwapHorizontal className="text-xl" />
          <span>{isModern ? "Switch to Classic View" : "Switch to Modern View"}</span>
        </button>
      </div>

      {isModern ? (
        <ModernHome activeDestination={activeDestination} weather={weather} navigate={navigate} />
      ) : (
        <ClassicHome activeDestination={activeDestination} weather={weather} navigate={navigate} />
      )}
    </>
  );
};

export default Home;
