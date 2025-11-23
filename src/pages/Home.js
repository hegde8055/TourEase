// /client/src/pages/Home.js
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoSparkles,
  IoPerson,
  IoRestaurant,
  IoBed,
  IoMap,
  IoSwapHorizontal,
  IoChevronBack,
  IoChevronForward,
} from "react-icons/io5";

// --- CONSTANTS ---
const INDIAN_DESTINATIONS = [
  {
    id: 1,
    name: "Agra",
    image:
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1000&auto=format&fit=crop",
    desc: "Home of the Taj Mahal.",
  },
  {
    id: 2,
    name: "Jaipur",
    image:
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1000&auto=format&fit=crop",
    desc: "The Pink City.",
  },
  {
    id: 3,
    name: "Kerala",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1000&auto=format&fit=crop",
    desc: "God's Own Country.",
  },
  {
    id: 4,
    name: "Ladakh",
    image:
      "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=1000&auto=format&fit=crop",
    desc: "Land of High Passes.",
  },
  {
    id: 5,
    name: "Varanasi",
    image:
      "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1000&auto=format&fit=crop",
    desc: "Spiritual Capital.",
  },
  {
    id: 6,
    name: "Goa",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1000&auto=format&fit=crop",
    desc: "Beaches & Heritage.",
  },
  {
    id: 7,
    name: "Udaipur",
    image:
      "https://images.unsplash.com/photo-1595262366897-4089903960b7?q=80&w=1000&auto=format&fit=crop",
    desc: "City of Lakes.",
  },
  {
    id: 8,
    name: "Hampi",
    image:
      "https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?q=80&w=1000&auto=format&fit=crop",
    desc: "Ancient Ruins.",
  },
];

// --- SHARED COMPONENTS ---
const GlobalVideoBackground = () => (
  <div className="fixed inset-0 z-[-1] overflow-hidden">
    <div className="absolute inset-0 bg-slate-950/60 z-10" />
    <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-50">
      <source src="/assets/hero-bg.mp4" type="video/mp4" />
    </video>
  </div>
);

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

// --- MODERN HOME (True Coverflow) ---
const ModernHome = ({ navigate }) => {
  const [activeIndex, setActiveIndex] = useState(2); // Start at index 2

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % INDIAN_DESTINATIONS.length);
  const handlePrev = () =>
    setActiveIndex((prev) => (prev - 1 + INDIAN_DESTINATIONS.length) % INDIAN_DESTINATIONS.length);

  // Calculate visible cards for Coverflow effect
  const getVisibleCards = () => {
    const cards = [];
    const len = INDIAN_DESTINATIONS.length;
    // Show 5 cards: -2, -1, 0, +1, +2
    for (let i = -2; i <= 2; i++) {
      const index = (activeIndex + i + len) % len;
      cards.push({ ...INDIAN_DESTINATIONS[index], offset: i });
    }
    return cards;
  };

  return (
    <div className="relative w-full min-h-screen text-white overflow-x-hidden font-sans pb-20">
      {/* HERO SECTION */}
      <section className="relative pt-40 pb-20 px-6 flex flex-col items-center">
        {/* BRANDING - Solid & Visible */}
        <div className="text-center mb-20 z-20">
          <h1 className="text-[12vw] md:text-[8rem] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-100 to-amber-500 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            TOUREASE
          </h1>
          <p className="text-xl md:text-2xl font-light text-amber-100 tracking-[0.5em] uppercase mt-6 drop-shadow-lg">
            The Art of Travel
          </p>
        </div>

        {/* TRUE COVERFLOW CAROUSEL */}
        <div className="relative w-full max-w-7xl h-[500px] flex items-center justify-center perspective-1000 mb-24">
          <AnimatePresence mode="popLayout">
            {getVisibleCards().map((dest) => {
              const { offset } = dest;
              const isActive = offset === 0;

              return (
                <motion.div
                  key={`${dest.id}-${offset}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    x: offset * 220, // Spacing
                    scale: isActive ? 1.1 : 0.8,
                    rotateY: offset * -25, // 3D Tilt
                    zIndex: 10 - Math.abs(offset),
                    opacity: isActive ? 1 : 0.5,
                    filter: isActive ? "blur(0px)" : "blur(2px) brightness(50%)",
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute w-[300px] md:w-[380px] h-[480px] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 bg-slate-900 cursor-pointer"
                  onClick={() => {
                    if (offset === 0) navigate(`/explore?query=${encodeURIComponent(dest.name)}`);
                    else if (offset < 0) handlePrev();
                    else handleNext();
                  }}
                >
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 p-8 w-full">
                    <h3 className="text-3xl font-bold text-white mb-2">{dest.name}</h3>
                    <p className="text-sm text-slate-300 line-clamp-2">{dest.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Nav Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-4 md:left-0 z-30 p-4 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all text-white border border-white/20"
          >
            <IoChevronBack size={24} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 md:right-0 z-30 p-4 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all text-white border border-white/20"
          >
            <IoChevronForward size={24} />
          </button>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap justify-center gap-6 z-20">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/explore")}
            className="px-12 py-5 rounded-full bg-amber-500 text-slate-950 font-bold text-lg shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all flex items-center gap-2"
          >
            <IoMap /> Start Journey
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/trending")}
            className="px-12 py-5 rounded-full bg-slate-800/60 backdrop-blur-md border border-amber-500/30 text-amber-200 font-bold text-lg hover:bg-slate-800/80 transition-all flex items-center gap-2"
          >
            <IoSparkles /> Trending Now
          </motion.button>
        </div>
      </section>

      {/* FEATURES MASONRY */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-serif text-white mb-6">Why TourEase?</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "AI Architect",
              desc: "Intelligent itinerary crafting.",
              icon: <IoSparkles />,
              col: "lg:col-span-2",
            },
            {
              title: "Concierge",
              desc: "24/7 Personal support.",
              icon: <IoPerson />,
              col: "lg:col-span-1",
            },
            {
              title: "Luxury Stays",
              desc: "Handpicked boutique hotels.",
              icon: <IoBed />,
              col: "lg:col-span-1",
            },
            {
              title: "Fine Dining",
              desc: "Reservations at top tables.",
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
              <SpotlightCard className="h-full p-10 flex flex-col justify-between min-h-[300px]">
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

// --- CLASSIC HOME (Simplified & Fixed) ---
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
    <div className="w-full min-h-screen text-slate-100 overflow-x-hidden font-sans pt-32 pb-20 bg-slate-950">
      {/* Hero Content - Standard Flex Layout */}
      <div className="relative z-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center mb-24">
        <span className="inline-block py-2 px-6 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-medium tracking-widest uppercase mb-8 backdrop-blur-md">
          Where Whimsy Meets Wanderlust
        </span>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-400 mb-8 drop-shadow-2xl leading-tight">
          Discover the Unseen
        </h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
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
      </div>

      {/* Features Grid - Standard Grid Layout */}
      <section className="px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-amber-400 mb-6">
            Why Choose TourEase?
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Experience the perfect blend of AI intelligence and human-curated luxury.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-slate-800/40 backdrop-blur-lg border border-white/5 p-8 rounded-3xl hover:border-amber-500/30 transition-colors flex flex-col items-center text-center h-full"
            >
              <div className="text-5xl mb-6">{feature.icon}</div>
              <h3 className="text-xl font-bold text-slate-100 mb-4">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.description}</p>
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
