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
  IoChevronBack,
  IoChevronForward,
} from "react-icons/io5";

// --- CONSTANTS ---
const INDIAN_DESTINATIONS = [
  {
    id: 1,
    name: "Jaipur",
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1000&auto=format&fit=crop",
    desc: "The Pink City, where royal heritage meets vibrant culture.",
  },
  {
    id: 2,
    name: "Kerala",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1000&auto=format&fit=crop",
    desc: "God's Own Country, famous for its serene backwaters.",
  },
  {
    id: 3,
    name: "Ladakh",
    image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=1000&auto=format&fit=crop",
    desc: "Land of High Passes, a breathtaking cold desert.",
  },
  {
    id: 4,
    name: "Varanasi",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1000&auto=format&fit=crop",
    desc: "The spiritual capital of India, older than history itself.",
  },
  {
    id: 5,
    name: "Goa",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1000&auto=format&fit=crop",
    desc: "Sun, sand, and spices - the perfect tropical getaway.",
  },
  {
    id: 6,
    name: "Udaipur",
    image: "https://images.unsplash.com/photo-1595262366897-4089903960b7?q=80&w=1000&auto=format&fit=crop",
    desc: "The City of Lakes, a romantic masterpiece in white marble.",
  },
  {
    id: 7,
    name: "Hampi",
    image: "https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?q=80&w=1000&auto=format&fit=crop",
    desc: "Ancient ruins and boulder-strewn landscapes of Vijayanagara.",
  },
  {
    id: 8,
    name: "Darjeeling",
    image: "https://images.unsplash.com/photo-1544634076-a901606f4180?q=80&w=1000&auto=format&fit=crop",
    desc: "Queen of the Hills, famous for tea gardens and Kanchenjunga views.",
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.6, ease: "easeOut" }}
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
    <div className="absolute inset-0 bg-slate-950/70 z-10" />
    <video
      autoPlay
      loop
      muted
      playsInline
      className="w-full h-full object-cover opacity-60"
    >
      <source src="/assets/hero-bg.mp4" type="video/mp4" />
    </video>
  </div>
);

// --- MODERN HOME COMPONENT (Coverflow) ---
const ModernHome = ({ navigate }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % INDIAN_DESTINATIONS.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + INDIAN_DESTINATIONS.length) % INDIAN_DESTINATIONS.length);
  };

  return (
    <div className="relative w-full min-h-screen text-white overflow-x-hidden font-sans selection:bg-amber-500/30 pb-20">
      {/* Noise & Aurora */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.04] mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-600/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-blue-900/20 rounded-full blur-[150px] animate-pulse-slow delay-1000" />
      </div>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-12">
        <div className="text-center mb-20 z-20 px-4">
          <h1 className="text-[12vw] md:text-[7rem] lg:text-[8rem] font-bold leading-[0.9] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-500 drop-shadow-2xl mix-blend-overlay">
            <StaggeredText text="TOUREASE" />
          </h1>
          <p className="text-lg md:text-2xl font-light text-amber-100/90 tracking-[0.4em] uppercase mt-8 backdrop-blur-sm">
            <StaggeredText text="The Art of Travel" />
          </p>
        </div>

        {/* COVERFLOW CAROUSEL */}
        <div className="relative w-full max-w-7xl mx-auto h-[550px] flex items-center justify-center perspective-1000 z-20 mb-20">
          {INDIAN_DESTINATIONS.map((dest, index) => {
            const isActive = index === activeIndex;
            const isPrev = index === (activeIndex - 1 + INDIAN_DESTINATIONS.length) % INDIAN_DESTINATIONS.length;
            const isNext = index === (activeIndex + 1) % INDIAN_DESTINATIONS.length;
            
            let x = 0;
            let scale = 0.8;
            let zIndex = 0;
            let opacity = 0;
            let rotateY = 0;

            if (isActive) {
              scale = 1.15;
              zIndex = 10;
              opacity = 1;
            } else if (isPrev) {
              x = -350; // Move left
              scale = 0.85;
              zIndex = 5;
              opacity = 0.5;
              rotateY = 30;
            } else if (isNext) {
              x = 350; // Move right
              scale = 0.85;
              zIndex = 5;
              opacity = 0.5;
              rotateY = -30;
            }

            // Only render active, prev, and next for performance/cleanliness
            if (!isActive && !isPrev && !isNext) return null;

            return (
              <motion.div
                key={dest.id}
                initial={false}
                animate={{ x, scale, opacity, rotateY, zIndex }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
                className="absolute w-[320px] md:w-[420px] h-[520px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 bg-slate-900 cursor-pointer group"
                onClick={() => {
                  if (isPrev) handlePrev();
                  if (isNext) handleNext();
                  if (isActive) navigate(`/explore?query=${encodeURIComponent(dest.name)}`);
                }}
              >
                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <h3 className="text-4xl font-bold text-white mb-3">{dest.name}</h3>
                  <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">{dest.desc}</p>
                </div>
              </motion.div>
            );
          })}
          
          {/* Navigation Buttons */}
          <button onClick={handlePrev} className="absolute left-4 md:left-10 z-30 p-5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/20 hover:scale-110 transition-all text-white shadow-lg">
            <IoChevronBack size={28} />
          </button>
          <button onClick={handleNext} className="absolute right-4 md:right-10 z-30 p-5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/20 hover:scale-110 transition-all text-white shadow-lg">
            <IoChevronForward size={28} />
          </button>
        </div>

        {/* ACTION BUTTONS (Wide Padding) */}
        <div className="flex flex-wrap justify-center gap-8 z-20 mt-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/explore")}
            className="px-14 py-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all flex items-center gap-3"
          >
            <IoMap /> Start Journey
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/trending")}
            className="px-14 py-6 rounded-full bg-slate-800/60 backdrop-blur-md border border-amber-500/30 text-amber-200 font-bold text-xl hover:bg-slate-800/80 transition-all flex items-center gap-3"
          >
            <IoSparkles /> Trending Now
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/planner")}
            className="px-14 py-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-xl hover:bg-white/20 transition-all flex items-center gap-3"
          >
            <IoBed /> Plan Itinerary
          </motion.button>
        </div>
      </section>

      {/* FEATURES MASONRY */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-serif text-white mb-6">Why TourEase?</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto" />
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "AI Architect", desc: "Intelligent itinerary crafting.", icon: <IoSparkles />, col: "lg:col-span-2" },
              { title: "Concierge", desc: "24/7 Personal support.", icon: <IoPerson />, col: "lg:col-span-1" },
              { title: "Luxury Stays", desc: "Handpicked boutique hotels.", icon: <IoBed />, col: "lg:col-span-1" },
              { title: "Fine Dining", desc: "Reservations at top tables.", icon: <IoRestaurant />, col: "lg:col-span-2" },
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

// --- CLASSIC HOME COMPONENT (Fixed Alignment) ---
const ClassicHome = ({ navigate }) => {
  const features = [
    { title: "Intelligent Journey Designer", description: "AI-curated escapes.", icon: "🧠" },
    { title: "Private Concierge Support", description: "Your personal travel stylist.", icon: "🤵" },
    { title: "Immersive Cultural Moments", description: "After-hours palace tours.", icon: "🏛️" },
    { title: "Dynamic Weather Insights", description: "Live micro-climate forecasts.", icon: "🌦️" },
  ];

  return (
    <div className="w-full min-h-screen text-slate-100 overflow-x-hidden font-sans pt-32 pb-20">
      {/* Hero Content - Centered Properly */}
      <div className="relative z-20 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="w-full">
          <span className="inline-block py-2 px-6 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-medium tracking-widest uppercase mb-8 backdrop-blur-md">
            Where Whimsy Meets Wanderlust
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-400 mb-8 drop-shadow-2xl leading-tight">
            Discover the Unseen
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Let moonlit palaces, spice-scented markets, and secret coffee trails unfold as we craft your next chapter across India's most enchanting escapes.
          </p>
          
          {/* Buttons with Wide Padding */}
          <div className="flex flex-wrap justify-center gap-8">
            <button onClick={() => navigate("/explore")} className="px-12 py-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xl shadow-lg flex items-center gap-3 hover:scale-105 transition-transform">
              <IoMap /> Start Exploring
            </button>
            <button onClick={() => navigate("/trending")} className="px-12 py-5 rounded-2xl bg-slate-800/40 backdrop-blur-md border border-amber-500/30 text-amber-200 font-bold text-xl flex items-center gap-3 hover:bg-slate-800/60 transition-colors">
              <IoSparkles /> Trending Now
            </button>
          </div>
        </motion.div>
      </div>

      {/* Features Grid - Centered & Spaced */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-amber-400 mb-6">Why Choose TourEase?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Experience the perfect blend of AI intelligence and human-curated luxury.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-slate-800/40 backdrop-blur-lg border border-white/5 p-8 rounded-3xl hover:border-amber-500/30 transition-colors flex flex-col items-center text-center h-full">
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

      {isModern ? (
        <ModernHome navigate={navigate} />
      ) : (
        <ClassicHome navigate={navigate} />
      )}
    </>
  );
};

export default Home;
