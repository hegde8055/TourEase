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
  IoCompass,
  IoSwapHorizontal,
} from "react-icons/io5";

// --- SHARED VIDEO BACKGROUND COMPONENT ---
const GlobalVideoBackground = () => (
  <div className="fixed inset-0 z-[-1] overflow-hidden">
    <div className="absolute inset-0 bg-slate-950/40 z-10" /> {/* Global Overlay */}
    <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60">
      <source src="/assets/hero-bg.mp4" type="video/mp4" />
    </video>
  </div>
);

// --- MODERN HOME COMPONENT (High-End Glassmorphism) ---
const ModernHome = ({ activeDestination, weather, navigate, user, setSaveModal }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const yHero = useTransform(scrollYProgress, [0, 0.5], [0, 300]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen text-white overflow-x-hidden font-sans selection:bg-amber-500/30"
    >
      {/* Noise Texture */}
      <div
        className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Aurora Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-600/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-blue-900/20 rounded-full blur-[150px] animate-pulse-slow delay-1000" />
      </div>

      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="relative z-20 text-center px-6 max-w-6xl mx-auto flex flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-8"
          >
            <h1 className="text-[12vw] md:text-[8rem] font-bold leading-[0.9] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50 drop-shadow-2xl mix-blend-overlay">
              TOUREASE
            </h1>
            <p className="text-xl md:text-3xl font-light text-amber-100/80 tracking-[0.5em] uppercase mt-4 backdrop-blur-sm">
              The Art of Travel
            </p>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/explore")}
            className="group relative px-10 py-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-amber-500/50"
          >
            <span className="relative z-10 text-lg font-medium tracking-widest uppercase text-white group-hover:text-amber-200">
              Begin Journey
            </span>
          </motion.button>
        </motion.div>
      </section>

      {/* FEATURED DESTINATION */}
      {activeDestination && (
        <section className="relative z-30 py-32 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="lg:col-span-8 relative h-[600px] rounded-[3rem] overflow-hidden"
            >
              <img
                src={activeDestination.heroImage || activeDestination.image}
                alt={activeDestination.name}
                className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-[1.5s]"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="lg:col-span-5 lg:-ml-32 relative z-10 p-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl"
            >
              <span className="text-amber-300 text-xs font-bold tracking-[0.2em] uppercase mb-6 block">
                Curated For You
              </span>
              <h2 className="text-5xl font-serif text-white mb-6">{activeDestination.name}</h2>
              <p className="text-lg text-white/70 mb-8 font-light">
                {activeDestination.description?.substring(0, 150)}...
              </p>
              {weather && (
                <div className="flex items-center gap-6 mb-10 py-4 border-t border-b border-white/10">
                  <div className="text-5xl">
                    {weather.icon ? <img src={weather.icon} className="w-12" alt="w" /> : "🌤"}
                  </div>
                  <div>
                    <div className="text-2xl font-light text-white">
                      {weather.temperature || weather.temp}°C
                    </div>
                    <div className="text-sm text-white/50 uppercase tracking-wider">
                      {weather.conditionLabel}
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={() =>
                  navigate(`/explore?query=${encodeURIComponent(activeDestination.name)}`)
                }
                className="flex items-center gap-4 text-amber-300 hover:text-amber-200 uppercase tracking-widest"
              >
                Explore Destination <IoArrowForward />
              </button>
            </motion.div>
          </div>
        </section>
      )}

      {/* FEATURES MASONRY */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center mb-24"
        >
          <h2 className="text-4xl md:text-6xl font-serif text-white mb-6">Why TourEase?</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "AI Architect",
              desc: "Intelligent itinerary crafting.",
              icon: <IoSparkles />,
              col: "lg:col-span-2",
              bg: "from-purple-900/40",
            },
            {
              title: "Concierge",
              desc: "24/7 Personal support.",
              icon: <IoPerson />,
              col: "lg:col-span-1",
              bg: "from-blue-900/40",
            },
            {
              title: "Luxury Stays",
              desc: "Handpicked boutique hotels.",
              icon: <IoBed />,
              col: "lg:col-span-1",
              bg: "from-emerald-900/40",
            },
            {
              title: "Fine Dining",
              desc: "Reservations at top tables.",
              icon: <IoRestaurant />,
              col: "lg:col-span-2",
              bg: "from-amber-900/40",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`${feature.col} group relative p-10 rounded-[2rem] bg-white/5 border border-white/5 overflow-hidden hover:border-white/20 transition-all`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.bg} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
              />
              <div className="relative z-10">
                <div className="text-5xl text-white/80 mb-6">{feature.icon}</div>
                <h3 className="text-3xl font-light text-white mb-3">{feature.title}</h3>
                <p className="text-white/50 text-lg">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

// --- CLASSIC HOME COMPONENT (Previous Design) ---
const ClassicHome = ({ activeDestination, weather, navigate, user, setSaveModal }) => {
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
    <div className="w-full min-h-screen text-slate-100 overflow-x-hidden font-sans">
      {/* Hero Content */}
      <div className="relative z-20 text-center px-6 max-w-5xl mx-auto pt-40 h-screen flex flex-col justify-center items-center">
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
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-lg shadow-lg flex items-center gap-2"
            >
              <IoMap /> Start Exploring
            </button>
            <button
              onClick={() => navigate("/trending")}
              className="px-8 py-4 rounded-2xl bg-slate-800/40 backdrop-blur-md border border-amber-500/30 text-amber-200 font-bold text-lg flex items-center gap-2"
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
                  className="py-3 px-6 rounded-xl bg-amber-500 text-slate-950 font-bold"
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
              className="bg-slate-800/40 backdrop-blur-lg border border-white/5 p-8 rounded-3xl"
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
  const { user } = useAuth();
  const [activeDestination, setActiveDestination] = useState(null);
  const [weather, setWeather] = useState(null);
  const [saveModal, setSaveModal] = useState(false);
  const [isModern, setIsModern] = useState(true); // Toggle State

  // Data Loading (Shared Logic)
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

      {/* View Toggle Button */}
      <div className="fixed bottom-6 right-6 z-[1000]">
        <button
          onClick={() => setIsModern(!isModern)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 backdrop-blur-md border border-amber-500/30 rounded-full text-amber-200 text-sm font-bold hover:bg-slate-800 transition-all shadow-lg"
        >
          <IoSwapHorizontal /> {isModern ? "Switch to Classic View" : "Switch to Modern View"}
        </button>
      </div>

      {isModern ? (
        <ModernHome
          activeDestination={activeDestination}
          weather={weather}
          navigate={navigate}
          user={user}
          setSaveModal={setSaveModal}
        />
      ) : (
        <ClassicHome
          activeDestination={activeDestination}
          weather={weather}
          navigate={navigate}
          user={user}
          setSaveModal={setSaveModal}
        />
      )}
    </>
  );
};

export default Home;
