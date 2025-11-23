// /client/src/pages/Home.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useSpring,
  useMotionValue,
} from "framer-motion";
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
  IoChevronBack,
  IoChevronForward,
} from "react-icons/io5";

// --- CONSTANTS: TOP 10 INDIAN DESTINATIONS ---
const INDIAN_DESTINATIONS = [
  {
    id: 1,
    name: "Agra",
    image:
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1000&auto=format&fit=crop",
    desc: "Home of the Taj Mahal, an eternal symbol of love.",
  },
  {
    id: 2,
    name: "Jaipur",
    image:
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1000&auto=format&fit=crop",
    desc: "The Pink City, a royal tapestry of palaces and forts.",
  },
  {
    id: 3,
    name: "Kerala",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1000&auto=format&fit=crop",
    desc: "God's Own Country, serene backwaters and lush greenery.",
  },
  {
    id: 4,
    name: "Ladakh",
    image:
      "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=1000&auto=format&fit=crop",
    desc: "Land of High Passes, stark mountains and azure lakes.",
  },
  {
    id: 5,
    name: "Varanasi",
    image:
      "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1000&auto=format&fit=crop",
    desc: "The spiritual heart of India on the banks of the Ganges.",
  },
  {
    id: 6,
    name: "Goa",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1000&auto=format&fit=crop",
    desc: "Sun-kissed beaches and vibrant Portuguese heritage.",
  },
  {
    id: 7,
    name: "Udaipur",
    image:
      "https://images.unsplash.com/photo-1595262366897-4089903960b7?q=80&w=1000&auto=format&fit=crop",
    desc: "The City of Lakes, romantic and architecturally stunning.",
  },
  {
    id: 8,
    name: "Hampi",
    image:
      "https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?q=80&w=1000&auto=format&fit=crop",
    desc: "Ancient ruins of Vijayanagara, a boulder-strewn wonder.",
  },
  {
    id: 9,
    name: "Darjeeling",
    image:
      "https://images.unsplash.com/photo-1544634076-a901606f4180?q=80&w=1000&auto=format&fit=crop",
    desc: "Queen of the Hills, famous for tea and Kanchenjunga views.",
  },
  {
    id: 10,
    name: "Mysuru",
    image:
      "https://images.unsplash.com/photo-1590050752117-238cb0fb56b9?q=80&w=1000&auto=format&fit=crop",
    desc: "The City of Palaces, rich in history and silk.",
  },
];

// --- ANIMATION HELPERS ---
const StaggeredText = ({ text, className = "" }) => {
  const letters = text.split("");
  return (
    <span className={`inline-block ${className}`}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: i * 0.04, duration: 0.7, ease: "easeOut" }}
          className="inline-block"
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </span>
  );
};

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
      className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-500 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 z-0"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(212, 175, 55, 0.2), transparent 40%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// --- SHARED VIDEO BACKGROUND ---
const GlobalVideoBackground = () => (
  <div className="fixed inset-0 z-[-1] overflow-hidden">
    <div className="absolute inset-0 bg-slate-950/60 z-10" /> {/* Cinematic Darkening */}
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-20 mix-blend-overlay pointer-events-none" />{" "}
    {/* Film Grain */}
    <video
      autoPlay
      loop
      muted
      playsInline
      className="w-full h-full object-cover opacity-50 scale-105"
    >
      <source src="/assets/hero-bg.mp4" type="video/mp4" />
    </video>
  </div>
);

// --- MODERN HOME COMPONENT (Hover-Scrub) ---
const ModernHome = ({ navigate }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const x = useMotionValue(0);

  // Hover-Scrub Logic
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left; // Mouse X relative to container
    const percentage = mouseX / rect.width; // 0 to 1

    // Map percentage to index (0 to 9)
    const newIndex = Math.min(
      Math.max(Math.floor(percentage * INDIAN_DESTINATIONS.length), 0),
      INDIAN_DESTINATIONS.length - 1
    );

    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <div className="relative w-full min-h-screen text-white overflow-x-hidden font-sans selection:bg-amber-500/30 pb-20">
      {/* Aurora Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-amber-600/10 rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-blue-900/20 rounded-full blur-[180px] animate-pulse-slow delay-1000" />
      </div>

      {/* HERO SECTION - Spacing Fixed (pt-40) */}
      <section className="relative min-h-screen flex flex-col items-center pt-40 pb-12">
        <div className="text-center mb-16 z-20 px-4">
          <h1 className="text-[12vw] md:text-[7rem] lg:text-[8.5rem] font-bold leading-[0.85] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-600 drop-shadow-2xl mix-blend-overlay">
            <StaggeredText text="TOUREASE" />
          </h1>
          <p className="text-lg md:text-2xl font-light text-amber-100/90 tracking-[0.5em] uppercase mt-8 backdrop-blur-sm">
            <StaggeredText text="The Art of Travel" />
          </p>
        </div>

        {/* HOVER-SCRUB CAROUSEL */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          className="relative w-full max-w-[90vw] h-[600px] flex items-center justify-center z-20 mb-24 cursor-crosshair perspective-1000"
        >
          <AnimatePresence mode="popLayout">
            {INDIAN_DESTINATIONS.map((dest, index) => {
              // Only render active and adjacent cards for performance
              if (Math.abs(index - activeIndex) > 2) return null;

              const isActive = index === activeIndex;
              const offset = index - activeIndex; // -2, -1, 0, 1, 2

              return (
                <motion.div
                  key={dest.id}
                  layoutId={`card-${dest.id}`}
                  initial={{ opacity: 0, scale: 0.8, x: offset * 100 }}
                  animate={{
                    opacity: isActive ? 1 : 0.4,
                    scale: isActive ? 1.1 : 0.85,
                    x: offset * 250, // Spread distance
                    zIndex: isActive ? 50 : 40 - Math.abs(offset),
                    rotateY: offset * -15,
                    filter: isActive ? "blur(0px)" : "blur(4px) grayscale(50%)",
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  className="absolute w-[350px] md:w-[450px] h-[550px] rounded-[3rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/10 bg-slate-900"
                  onClick={() => navigate(`/explore?query=${encodeURIComponent(dest.name)}`)}
                >
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                  {/* Content only visible on active card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
                    className="absolute bottom-0 left-0 p-10 w-full"
                  >
                    <div className="flex items-center gap-2 text-amber-400 mb-2 text-sm font-bold tracking-widest uppercase">
                      <IoMap /> Top Destination #{index + 1}
                    </div>
                    <h3 className="text-5xl font-serif text-white mb-4">{dest.name}</h3>
                    <p className="text-white/80 text-lg leading-relaxed line-clamp-2">
                      {dest.desc}
                    </p>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Scrub Indicator */}
          <div className="absolute bottom-[-40px] left-0 w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-amber-500"
              animate={{ width: `${((activeIndex + 1) / INDIAN_DESTINATIONS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* ACTION BUTTONS (Wide Padding) */}
        <div className="flex flex-wrap justify-center gap-8 z-20">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(245,158,11,0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/explore")}
            className="px-14 py-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xl shadow-lg transition-all flex items-center gap-3"
          >
            <IoMap /> Start Journey
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(30, 41, 59, 0.8)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/trending")}
            className="px-14 py-6 rounded-full bg-slate-800/60 backdrop-blur-md border border-amber-500/30 text-amber-200 font-bold text-xl transition-all flex items-center gap-3"
          >
            <IoSparkles /> Trending Now
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/planner")}
            className="px-14 py-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-xl transition-all flex items-center gap-3"
          >
            <IoBed /> Plan Itinerary
          </motion.button>
        </div>
      </section>

      {/* FEATURES MASONRY */}
      <section className="py-40 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center mb-32"
        >
          <h2 className="text-5xl md:text-7xl font-serif text-white mb-8">Why TourEase?</h2>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            {
              title: "AI Architect",
              desc: "Intelligent itinerary crafting tailored to your deepest travel desires.",
              icon: <IoSparkles />,
              col: "lg:col-span-2",
            },
            {
              title: "Concierge",
              desc: "24/7 Personal support for every step of your journey.",
              icon: <IoPerson />,
              col: "lg:col-span-1",
            },
            {
              title: "Luxury Stays",
              desc: "Handpicked boutique hotels, villas, and palaces.",
              icon: <IoBed />,
              col: "lg:col-span-1",
            },
            {
              title: "Fine Dining",
              desc: "Reservations at top-tier restaurants and hidden gems.",
              icon: <IoRestaurant />,
              col: "lg:col-span-2",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className={feature.col}
            >
              <SpotlightCard className="h-full p-12 flex flex-col justify-between min-h-[350px]">
                <div className="text-6xl text-amber-400/80 mb-8">{feature.icon}</div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-white/60 text-xl leading-relaxed">{feature.desc}</p>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

// --- CLASSIC HOME COMPONENT (Fixed Spacing) ---
const ClassicHome = ({ navigate }) => {
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
    <div className="w-full min-h-screen text-slate-100 overflow-x-hidden font-sans pt-40 pb-20">
      {" "}
      {/* pt-40 for safe spacing */}
      {/* Hero Content */}
      <div className="relative z-20 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full"
        >
          <span className="inline-block py-2 px-6 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-medium tracking-widest uppercase mb-8 backdrop-blur-md">
            Where Whimsy Meets Wanderlust
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-400 mb-8 drop-shadow-2xl leading-tight">
            Discover the Unseen
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-16 leading-relaxed">
            Let moonlit palaces, spice-scented markets, and secret coffee trails unfold as we craft
            your next chapter across India's most enchanting escapes.
          </p>

          <div className="flex flex-wrap justify-center gap-8">
            <button
              onClick={() => navigate("/explore")}
              className="px-12 py-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xl shadow-lg flex items-center gap-3 hover:scale-105 transition-transform"
            >
              <IoMap /> Start Exploring
            </button>
            <button
              onClick={() => navigate("/trending")}
              className="px-12 py-5 rounded-2xl bg-slate-800/40 backdrop-blur-md border border-amber-500/30 text-amber-200 font-bold text-xl flex items-center gap-3 hover:bg-slate-800/60 transition-colors"
            >
              <IoSparkles /> Trending Now
            </button>
          </div>
        </motion.div>
      </div>
      {/* Features Grid */}
      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-amber-400 mb-6">
              Why Choose TourEase?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Experience the perfect blend of AI intelligence and human-curated luxury.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-800/40 backdrop-blur-lg border border-white/5 p-10 rounded-3xl hover:border-amber-500/30 transition-colors flex flex-col items-center text-center h-full"
              >
                <div className="text-5xl mb-6">{feature.icon}</div>
                <h3 className="text-xl font-bold text-slate-100 mb-4">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// --- MAIN HOME COMPONENT ---
const Home = () => {
  const navigate = useNavigate();
  const [isModern, setIsModern] = useState(true);

  return (
    <>
      <GlobalVideoBackground />

      {/* View Toggle Button - Bottom Left */}
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

      {isModern ? <ModernHome navigate={navigate} /> : <ClassicHome navigate={navigate} />}
    </>
  );
};

export default Home;
