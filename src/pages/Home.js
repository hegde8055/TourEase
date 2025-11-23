// /client/src/pages/Home.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
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
} from "react-icons/io5";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  const searchType = "destination";
  const [searchError, setSearchError] = useState("");
  const [activeDestination, setActiveDestination] = useState(null);
  const [touristSuggestions, setTouristSuggestions] = useState([]);
  const [hotelSuggestions, setHotelSuggestions] = useState([]);
  const [restaurantSuggestions, setRestaurantSuggestions] = useState([]);
  const [weather, setWeather] = useState(null);
  const [mapImageUrl, setMapImageUrl] = useState(null);
  const [mapProvider, setMapProvider] = useState("geoapify");
  const [saveModal, setSaveModal] = useState(false);

  const [passengerData, setPassengerData] = useState({
    passengers: 2,
    travelClass: "royal",
    travelDates: { start: "", end: "" },
    preferences: ["Private chauffeur", "Signature dining"],
    notes: "",
  });

  // Parallax Effects
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const yHero = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scaleHero = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const features = [
    {
      title: "Intelligent Journey Designer",
      description:
        "AI-curated escapes with handpicked stays, chauffeurs, and signature dining for every mood.",
      icon: "🧠",
    },
    {
      title: "Private Concierge Support",
      description:
        "Your personal travel stylist handles reservations, upgrades, and surprises in real time.",
      icon: "🤵",
    },
    {
      title: "Immersive Cultural Moments",
      description:
        "After-hours palace tours, private heritage walks, and storytelling dinners under the stars.",
      icon: "🏛️",
    },
    {
      title: "Dynamic Weather Insights",
      description:
        "Live micro-climate forecasts blended with style and packing cues tailored to your itinerary.",
      icon: "🌦️",
    },
  ];

  const stats = [
    { number: "3K+", label: "Boutique Retreats" },
    { number: "120+", label: "Signature Experiences" },
    { number: "18", label: "Luxury Specialists" },
    { number: "98%", label: "Guest Delight Score" },
  ];

  const handleFeatureAction = () => {
    if (user) return true;
    setSearchError("Sign in to unlock bespoke planning and save your itineraries.");
    return false;
  };

  const loadDestinationWeather = useCallback(async (destination) => {
    const coordsSource =
      destination?.location?.coordinates ||
      destination?.location ||
      destination?.coordinates ||
      destination?.coords ||
      null;

    const lat =
      coordsSource?.lat ??
      coordsSource?.latitude ??
      (Array.isArray(coordsSource) ? Number(coordsSource[1]) : null);
    const lng =
      coordsSource?.lng ??
      coordsSource?.lon ??
      coordsSource?.longitude ??
      (Array.isArray(coordsSource) ? Number(coordsSource[0]) : null);

    if (lat == null || lng == null) {
      setWeather(null);
      return;
    }

    try {
      const weatherResponse = await enhancedPlacesAPI.getWeather(lat, lng);
      const weatherData = weatherResponse.data?.weather || weatherResponse.data;
      if (weatherData) {
        setWeather({
          temperature: weatherData.temperature ?? weatherData.temp,
          conditionLabel: weatherData.conditionLabel || weatherData.condition,
          description: weatherData.description,
          humidity: weatherData.humidity,
          icon: weatherData.icon,
          symbol: weatherData.symbol,
          emoji: weatherData.emoji,
        });
      }
    } catch (error) {
      console.warn("Weather fetch failed:", error.message || error);
    }
  }, []);

  const loadDestinationMap = useCallback(async (destination) => {
    const coords =
      destination?.location?.coordinates ||
      destination?.coordinates ||
      destination?.location ||
      null;

    const lat =
      coords?.lat ?? coords?.latitude ?? (Array.isArray(coords) ? Number(coords[1]) : null);
    const lng =
      coords?.lng ??
      coords?.lon ??
      coords?.longitude ??
      (Array.isArray(coords) ? Number(coords[0]) : null);

    if (lat == null || lng == null) {
      setMapImageUrl(null);
      setMapProvider("geoapify");
      return;
    }

    try {
      const mapResponse = await enhancedPlacesAPI.getMapImage({ lat, lng }, 12, "900x600");
      const provider = mapResponse.data?.provider || "geoapify";
      setMapImageUrl(mapResponse.data?.mapUrl || null);
      setMapProvider(provider);
    } catch (error) {
      console.warn("Map fetch failed:", error.message || error);
      setMapImageUrl(null);
      setMapProvider("geoapify");
    }
  }, []);

  const applyDestinationData = useCallback(
    (destination) => {
      if (!destination) return;

      setActiveDestination(destination);
      setTouristSuggestions(destination.nearbyAttractions || destination.touristPlaces || []);
      setHotelSuggestions(destination.hotels || []);
      setRestaurantSuggestions(destination.restaurants || []);

      if (destination.weather) {
        setWeather(destination.weather);
        if (
          !destination.weather.icon &&
          !destination.weather.symbol &&
          !destination.weather.emoji
        ) {
          loadDestinationWeather(destination);
        }
      } else {
        loadDestinationWeather(destination);
      }

      if (destination.mapImage) {
        setMapImageUrl(destination.mapImage);
        setMapProvider(destination.mapProvider || "geoapify");
      } else {
        setMapProvider("geoapify");
        loadDestinationMap(destination);
      }
    },
    [loadDestinationMap, loadDestinationWeather]
  );

  const ingestDestination = useCallback(
    async (queryText, options = {}) => {
      const payload = {
        query: queryText,
        type: options.type || searchType,
      };

      if (options.force) payload.force = true;

      const response = await destinationAPI.ingestFromGeoapify(payload);
      const destination = response.data?.destination;

      if (!destination) {
        throw new Error(response.data?.error || "Destination data unavailable");
      }

      applyDestinationData(destination);
      return destination;
    },
    [applyDestinationData, searchType]
  );

  const formatTemperature = (value) => {
    if (value == null) return null;
    if (typeof value === "number") {
      return `${value.toFixed(1)}°C`;
    }
    return `${value}°C`;
  };

  const updatePassengerField = (field, value) => {
    setPassengerData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateTravelDate = (field, value) => {
    setPassengerData((prev) => ({
      ...prev,
      travelDates: {
        ...prev.travelDates,
        [field]: value,
      },
    }));
  };

  useEffect(() => {
    let isMounted = true;

    const bootstrapDestination = async () => {
      try {
        const trending = await destinationAPI.getTrending(6);
        if (!isMounted) return;

        if (Array.isArray(trending) && trending.length > 0) {
          const blockedKeywords = ["taj", "taj mahal", "kyoto", "bloom trail"];
          const preferred = trending.find((destination) => {
            const haystack = `${destination?.name || ""} ${destination?.description || ""}`
              .toLowerCase()
              .trim();
            return haystack && !blockedKeywords.some((keyword) => haystack.includes(keyword));
          });

          applyDestinationData(preferred || trending[0]);
        } else {
          const fallback = await ingestDestination("Mysuru, Karnataka", { force: true });
          if (!isMounted) return;
          applyDestinationData(fallback);
        }
      } catch (error) {
        console.warn("Initial destination load failed:", error);
      }
    };

    bootstrapDestination();

    return () => {
      isMounted = false;
    };
  }, [applyDestinationData, ingestDestination]);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden font-sans selection:bg-amber-500/30">
      <AnimatePresence>
        {saveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setSaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-slate-900/95 border border-amber-500/30 rounded-3xl p-8 shadow-2xl shadow-black/50"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-amber-200">Save this bespoke itinerary</h3>
                <button
                  onClick={() => setSaveModal(false)}
                  className="text-amber-200/60 hover:text-amber-200 transition-colors text-2xl"
                >
                  <IoSparkles />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-amber-200/80">Arrival</label>
                  <input
                    type="date"
                    value={passengerData.travelDates.start}
                    onChange={(e) => updateTravelDate("start", e.target.value)}
                    className="w-full bg-slate-800/50 border border-amber-500/20 rounded-xl px-4 py-3 text-slate-100 focus:border-amber-500/60 outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-amber-200/80">Departure</label>
                  <input
                    type="date"
                    value={passengerData.travelDates.end}
                    onChange={(e) => updateTravelDate("end", e.target.value)}
                    className="w-full bg-slate-800/50 border border-amber-500/20 rounded-xl px-4 py-3 text-slate-100 focus:border-amber-500/60 outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-amber-200/80">Travellers</label>
                  <input
                    type="number"
                    min={1}
                    value={passengerData.passengers}
                    onChange={(e) => updatePassengerField("passengers", Number(e.target.value) || 1)}
                    className="w-full bg-slate-800/50 border border-amber-500/20 rounded-xl px-4 py-3 text-slate-100 focus:border-amber-500/60 outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-amber-200/80">Travel Style</label>
                  <select
                    value={passengerData.travelClass}
                    onChange={(e) => updatePassengerField("travelClass", e.target.value)}
                    className="w-full bg-slate-800/50 border border-amber-500/20 rounded-xl px-4 py-3 text-slate-100 focus:border-amber-500/60 outline-none transition-colors"
                  >
                    <option value="royal">Royal Retreat</option>
                    <option value="heritage">Heritage Hideaway</option>
                    <option value="adventure">Adventure Luxe</option>
                    <option value="wellness">Wellness Sanctuary</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={() => setSaveModal(false)}
                  className="px-6 py-3 rounded-xl text-amber-200/80 hover:bg-amber-500/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert("Feature coming soon!");
                    setSaveModal(false);
                  }}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold hover:shadow-lg hover:shadow-amber-500/20 transition-all transform hover:-translate-y-0.5"
                >
                  Save Journey
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div ref={heroRef} className="relative w-full h-screen overflow-hidden flex items-center justify-center">
        {/* Background Image & Overlay */}
        <motion.div 
          style={{ y: yHero, scale: scaleHero, opacity: opacityHero }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-slate-950/30 z-10" />
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/assets/hero-bg.mp4" type="video/mp4" />
          </video>
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-20 text-center px-6 max-w-5xl mx-auto mt-[-80px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block py-1 px-4 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-medium tracking-widest uppercase mb-6 backdrop-blur-md">
              Where Whimsy Meets Wanderlust
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-400 mb-8 drop-shadow-2xl">
              Discover the Unseen
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Let moonlit palaces, spice-scented markets, and secret coffee trails unfold as we craft your next chapter across India's most enchanting escapes.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/explore")}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-lg shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all flex items-center gap-2"
              >
                <IoMap /> Start Exploring
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/trending")}
                className="px-8 py-4 rounded-2xl bg-slate-800/40 backdrop-blur-md border border-amber-500/30 text-amber-200 font-bold text-lg hover:bg-slate-800/60 transition-all flex items-center gap-2"
              >
                <IoSparkles /> Trending Now
              </motion.button>
            </div>
          </motion.div>

          {searchError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-red-400 bg-red-950/30 px-4 py-2 rounded-lg inline-block backdrop-blur-sm border border-red-500/20"
            >
              {searchError}
            </motion.div>
          )}
        </div>
      </div>

      {/* Featured Destination Section */}
      {activeDestination && activeDestination.name !== "Goa" && (
        <div className="relative z-30 -mt-32 px-6 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto bg-slate-900/80 backdrop-blur-xl border border-amber-500/20 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/50"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Image Side */}
              <div className="relative h-[400px] lg:h-auto overflow-hidden group">
                <img
                  src={activeDestination.heroImage || activeDestination.image || "/assets/pexels-adhwaith-chandran-214377112-20258863.jpg"}
                  alt={activeDestination.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-8 left-8">
                  <span className="text-amber-400 text-sm font-bold uppercase tracking-wider mb-2 block">Featured Escape</span>
                  <h2 className="text-4xl font-bold text-white mb-1">{activeDestination.name}</h2>
                  <p className="text-slate-300 flex items-center gap-2">
                    <IoMap className="text-amber-500" /> {activeDestination.location?.formatted || "India"}
                  </p>
                </div>
              </div>

              {/* Content Side */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <p className="text-slate-300 leading-relaxed mb-8 text-lg">
                  {activeDestination.description}
                </p>

                {/* Weather Widget */}
                {weather && (
                  <div className="flex items-center gap-4 bg-slate-800/50 rounded-2xl p-4 mb-8 border border-white/5">
                    <div className="text-4xl">
                      {weather.icon ? (
                        <img src={weather.icon} alt="Weather" className="w-12 h-12" />
                      ) : (
                        weather.symbol || weather.emoji || "🌦️"
                      )}
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">
                        {formatTemperature(weather.temperature ?? weather.temp)}
                      </div>
                      <div className="text-slate-400 text-sm">
                        {weather.conditionLabel || weather.description}
                        {weather.humidity && ` • ${weather.humidity}% Humidity`}
                      </div>
                    </div>
                  </div>
                )}

                {/* Highlights Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-slate-800/30 rounded-xl p-4 border border-white/5">
                    <div className="text-amber-400 mb-2"><IoStar /> Highlights</div>
                    <ul className="text-sm text-slate-400 space-y-1">
                      {touristSuggestions.slice(0, 2).map((item, i) => (
                        <li key={i} className="truncate">• {item.name}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-800/30 rounded-xl p-4 border border-white/5">
                    <div className="text-amber-400 mb-2"><IoBed /> Stays</div>
                    <ul className="text-sm text-slate-400 space-y-1">
                      {hotelSuggestions.slice(0, 2).map((item, i) => (
                        <li key={i} className="truncate">• {item.name}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-800/30 rounded-xl p-4 border border-white/5">
                    <div className="text-amber-400 mb-2"><IoRestaurant /> Dining</div>
                    <ul className="text-sm text-slate-400 space-y-1">
                      {restaurantSuggestions.slice(0, 2).map((item, i) => (
                        <li key={i} className="truncate">• {item.name}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => navigate(`/explore?query=${encodeURIComponent(activeDestination.name)}`)}
                    className="flex-1 py-3 px-6 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
                  >
                    Explore More <IoArrowForward />
                  </button>
                  {user && (
                    <button
                      onClick={() => setSaveModal(true)}
                      className="px-6 rounded-xl border border-amber-500/30 text-amber-200 hover:bg-amber-500/10 transition-colors"
                    >
                      Save
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Features Section */}
      <section ref={featuresRef} className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900 z-0" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 mb-6">
              Why Choose TourEase?
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Experience the perfect blend of AI intelligence and human-curated luxury for your next adventure.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-slate-800/40 backdrop-blur-lg border border-white/5 p-8 rounded-3xl hover:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/10 transition-all group"
              >
                <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-4 group-hover:text-amber-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-900 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-amber-500 mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-400 font-medium uppercase tracking-wider text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-400 opacity-10" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
            <p className="text-xl text-slate-300 mb-10">
              Join thousands of travelers crafting their perfect escapes with TourEase.
            </p>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => navigate("/signup")}
                className="px-8 py-4 rounded-2xl bg-amber-500 text-slate-950 font-bold text-lg hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/25"
              >
                Get Started Free
              </button>
              <button
                onClick={() => navigate("/signin")}
                className="px-8 py-4 rounded-2xl bg-slate-800 text-white font-bold text-lg border border-slate-700 hover:bg-slate-700 transition-all"
              >
                Sign In
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
