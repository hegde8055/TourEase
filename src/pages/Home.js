// /client/src/pages/Home.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Navbar from "../components/Navbar";
import AIChatbot from "../components/AIChatbot";
import { useAuth } from "../App";
import { destinationsAPI, itineraryAPI, enhancedPlacesAPI } from "../utils/api"; // <-- FIX: Renamed to destinationsAPI

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const heroRef = useRef(null);
  const ctaRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);

  const searchType = "destination";

  const [searchError, setSearchError] = useState("");
  const [activeDestination, setActiveDestination] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
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

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.85, 0.4]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 12]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const springY = useSpring(y3, { damping: 14, stiffness: 120 });
  const ctaOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0]);
  const ctaScale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);

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
    { number: "3K+", label: "Boutique retreats" },
    { number: "120+", label: "Signature experiences" },
    { number: "18", label: "Luxury specialists" },
    { number: "98%", label: "Guest delight score" },
  ];

  const handleFeatureAction = () => {
    if (user) return true;
    setSearchError("Sign in to unlock bespoke planning and save your itineraries.");
    return false;
  };

  const handleCtaDragEnd = useCallback((_, info) => {
    if (info?.offset?.y > 90) {
      featuresRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

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
      if (provider === "osm" && mapResponse.data?.fallbackReason) {
        console.warn(
          "Geoapify static map unavailable for featured destination, using OpenStreetMap fallback:",
          mapResponse.data.fallbackReason
        );
      }
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
      setSelectedPlace(destination);
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

      const response = await destinationsAPI.ingestFromGeoapify(payload); // <-- FIX: Renamed to destinationsAPI
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

  const calculateTravelCost = (baseCost, passengers) => {
    const costPerPerson = baseCost;
    const total = costPerPerson * passengers;
    const tax = total * 0.18;

    return {
      perPerson: costPerPerson,
      total: total + tax,
      tax,
    };
  };

  const handleSaveToItinerary = async () => {
    if (!handleFeatureAction()) return;

    if (!passengerData.travelDates.start || !passengerData.travelDates.end) {
      alert("Please select travel dates");
      return;
    }

    const costEstimate = calculateTravelCost(5000, passengerData.passengers);

    const itineraryData = {
      destination: selectedPlace,
      touristPlaces: touristSuggestions.slice(0, 5),
      hotels: hotelSuggestions.slice(0, 3),
      restaurants: restaurantSuggestions.slice(0, 3),
      passengerInfo: passengerData,
      costEstimate,
      dateAdded: new Date().toISOString(),
    };

    try {
      await itineraryAPI.saveCompletePlan(itineraryData);
      alert("Trip saved to itinerary!");
      setSaveModal(false);
      navigate("/itinerary");
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving itinerary");
    }
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
        const trending = await destinationsAPI.getTrending(6); // <-- FIX: Renamed to destinationsAPI
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
    <div className="main-content">
      <Navbar />

      {saveModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(5, 8, 15, 0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 1200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setSaveModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(620px, 92vw)",
              borderRadius: "24px",
              padding: "32px 36px",
              background:
                "linear-gradient(135deg, rgba(12, 18, 30, 0.95) 0%, rgba(18, 24, 38, 0.88) 100%)",
              border: "1px solid rgba(212, 175, 55, 0.35)",
              boxShadow: "0 40px 120px rgba(8, 11, 19, 0.65)",
              color: "#f4e5a1",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.6rem", margin: 0 }}>Save this bespoke itinerary</h3>
              <button
                onClick={() => setSaveModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#f4e5a1",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
                aria-label="Close itinerary modal"
              >
                ×
              </button>
            </div>
            <p
              style={{
                color: "#e5e7eb",
                marginTop: "6px",
                marginBottom: "24px",
                fontSize: "0.95rem",
              }}
            >
              Lock in your travel party details and we’ll craft confirmations, white-glove
              transfers, and concierge notes around your chosen dates.
            </p>

            <div
              style={{
                display: "grid",
                gap: "18px",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              }}
            >
              <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ color: "#f4e5a1", fontWeight: 600 }}>Arrival</span>
                <input
                  type="date"
                  value={passengerData.travelDates.start}
                  onChange={(e) => updateTravelDate("start", e.target.value)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1px solid rgba(212, 175, 55, 0.3)",
                    background: "rgba(11, 16, 26, 0.7)",
                    color: "#f9fafb",
                  }}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ color: "#f4e5a1", fontWeight: 600 }}>Departure</span>
                <input
                  type="date"
                  value={passengerData.travelDates.end}
                  onChange={(e) => updateTravelDate("end", e.target.value)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1px solid rgba(212, 175, 55, 0.3)",
                    background: "rgba(11, 16, 26, 0.7)",
                    color: "#f9fafb",
                  }}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ color: "#f4e5a1", fontWeight: 600 }}>Travellers</span>
                <input
                  type="number"
                  min={1}
                  value={passengerData.passengers}
                  onChange={(e) => updatePassengerField("passengers", Number(e.target.value) || 1)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1px solid rgba(212, 175, 55, 0.3)",
                    background: "rgba(11, 16, 26, 0.7)",
                    color: "#f9fafb",
                  }}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ color: "#f4e5a1", fontWeight: 600 }}>Travel Style</span>
                <select
                  value={passengerData.travelClass}
                  onChange={(e) => updatePassengerField("travelClass", e.target.value)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1px solid rgba(212, 175, 55, 0.3)",
                    background: "rgba(11, 16, 26, 0.7)",
                    color: "#f9fafb",
                  }}
                >
                  <option value="royal">Royal Retreat</option>
                  <option value="heritage">Heritage Hideaway</option>
                  <option value="adventure">Adventure Luxe</option>
                  <option value="wellness">Wellness Sanctuary</option>
                </select>
              </label>
            </div>

            <label
              style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "18px" }}
            >
              <span style={{ color: "#f4e5a1", fontWeight: 600 }}>Wishlist & indulgences</span>
              <textarea
                rows={3}
                value={passengerData.notes}
                onChange={(e) => updatePassengerField("notes", e.target.value)}
                placeholder="Tell us about anniversaries, vintage convertibles, or sunset yacht cravings..."
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                  background: "rgba(11, 16, 26, 0.7)",
                  color: "#f9fafb",
                  resize: "vertical",
                  minHeight: "110px",
                }}
              />
            </label>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "28px",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <span style={{ color: "#e5e7eb", fontSize: "0.95rem" }}>
                We’ll weave chauffeurs, culinary tastings, and private guides around these details.
              </span>
              <div style={{ display: "flex", gap: "12px" }}>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSaveModal(false)}
                  style={{
                    padding: "12px 22px",
                    borderRadius: "12px",
                    border: "1px solid rgba(244, 229, 161, 0.4)",
                    background: "transparent",
                    color: "#f4e5a1",
                    cursor: "pointer",
                  }}
                >
                  Not now
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 18px 45px rgba(212, 175, 55, 0.35)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSaveToItinerary}
                  style={{
                    padding: "12px 28px",
                    borderRadius: "12px",
                    border: "none",
                    background: "linear-gradient(135deg, #d4af37 0%, #f4e5a1 100%)",
                    color: "#111827",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Save this journey
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Hero Section with Parallax */}
      <motion.div
        id="home"
        className="hero-home"
        ref={heroRef}
        style={{ y: y1, opacity, position: "relative", marginTop: "-180px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.sin(i) * 20, 0],
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
            style={{
              position: "absolute",
              width: `${20 + i * 5}px`,
              height: `${20 + i * 5}px`,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(212, 175, 55, ${0.4 - i * 0.05}) 0%, transparent 70%)`,
              left: `${10 + i * 12}%`,
              top: `${20 + i * 8}%`,
              pointerEvents: "none",
              filter: "blur(2px)",
            }}
          />
        ))}

        <motion.div
          className="hero-cta reveal"
          ref={ctaRef}
          style={{
            position: "relative",
            maxWidth: "680px",
            margin: "120px auto 0",
            textAlign: "center",
            padding: "36px 40px",
            borderRadius: "28px",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(212, 175, 55, 0.35)",
            background:
              "linear-gradient(135deg, rgba(15, 20, 32, 0.88) 0%, rgba(12, 18, 30, 0.62) 100%)",
            boxShadow: "0 40px 120px rgba(8, 11, 19, 0.65)",
            opacity: ctaOpacity,
            scale: ctaScale,
            cursor: "grab",
            zIndex: 2,
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.8, ease: "easeOut" }}
          drag="y"
          dragConstraints={{ top: -60, bottom: 140 }}
          dragElastic={0.18}
          dragSnapToOrigin
          onDragEnd={handleCtaDragEnd}
          whileTap={{ cursor: "grabbing" }}
        >
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            style={{
              display: "inline-block",
              textTransform: "uppercase",
              letterSpacing: "0.35em",
              fontSize: "0.75rem",
              color: "rgba(244, 229, 161, 0.85)",
              marginBottom: "18px",
            }}
          >
            WHERE WHIMSY MEETS WANDERLUST
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.8 }}
            style={{
              fontSize: "clamp(2.8rem, 5vw, 4rem)",
              color: "#f4e5a1",
              marginBottom: "20px",
              textShadow: "0 20px 60px rgba(212, 175, 55, 0.45)",
              lineHeight: 1.1,
            }}
          >
            Whisper to Wanderlust
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.8 }}
            style={{
              color: "#e5e7eb",
              fontSize: "1.1rem",
              lineHeight: 1.8,
              maxWidth: "540px",
              margin: "0 auto",
            }}
          >
            Let moonlit palaces, spice-scented markets, and secret coffee trails unfold as we craft
            your next chapter across Karnataka’s most enchanting escapes.
          </motion.p>

          <div
            style={{
              display: "flex",
              gap: "18px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: "28px",
            }}
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 18px 45px rgba(212, 175, 55, 0.45)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/explore")}
              style={{
                padding: "16px 34px",
                borderRadius: "14px",
                border: "none",
                fontWeight: 600,
                fontSize: "1.05rem",
                cursor: "pointer",
                background: "linear-gradient(135deg, #d4af37 0%, #f4e5a1 100%)",
                color: "#111827",
                letterSpacing: "0.05em",
              }}
            >
              ✨ Take Me Exploring
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, borderColor: "rgba(244, 229, 161, 0.8)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/trending")}
              style={{
                padding: "16px 34px",
                borderRadius: "14px",
                border: "1px solid rgba(244, 229, 161, 0.45)",
                background: "rgba(17, 24, 39, 0.35)",
                color: "#f4e5a1",
                fontWeight: 600,
                fontSize: "1.05rem",
                cursor: "pointer",
                letterSpacing: "0.05em",
              }}
            >
              🔥 Reveal What’s Trending
            </motion.button>
          </div>

          {searchError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                marginTop: "24px",
                color: "#fca5a5",
                fontSize: "0.95rem",
              }}
            >
              {searchError}
            </motion.div>
          )}
        </motion.div>

        {activeDestination && activeDestination.name !== "Goa" && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              width: "min(1100px, 92%)",
              margin: "40px auto 0",
              padding: "30px",
              borderRadius: "24px",
              border: "1px solid rgba(212, 175, 55, 0.35)",
              background:
                "linear-gradient(125deg, rgba(11,14,20,0.9) 0%, rgba(18,23,38,0.85) 100%)",
              backdropFilter: "blur(18px)",
              boxShadow: "0 35px 90px rgba(8, 11, 19, 0.72)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "28px",
            }}
          >
            <div style={{ display: "grid", gap: "22px" }}>
              <div
                style={{
                  position: "relative",
                  borderRadius: "20px",
                  overflow: "hidden",
                  border: "1px solid rgba(212, 175, 55, 0.35)",
                }}
              >
                <img
                  src={
                    activeDestination.heroImage ||
                    activeDestination.image ||
                    "/assets/pexels-adhwaith-chandran-214377112-20258863.jpg"
                  }
                  alt={`${activeDestination.name} hero`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    minHeight: "260px",
                  }}
                  loading="lazy"
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(6,10,18,0.1) 0%, rgba(6,10,18,0.65) 100%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: "20px",
                    bottom: "20px",
                    color: "#f9fafb",
                    fontWeight: 600,
                    textShadow: "0 8px 20px rgba(6,10,18,0.9)",
                  }}
                >
                  <div style={{ fontSize: "0.9rem", opacity: 0.85 }}>Featured Escape</div>
                  <div style={{ fontSize: "1.4rem" }}>{activeDestination.name}</div>
                </div>
              </div>

              {mapImageUrl && (
                <div
                  style={{
                    position: "relative",
                    borderRadius: "18px",
                    overflow: "hidden",
                    border: "1px solid rgba(212, 175, 55, 0.25)",
                    background: "rgba(12, 16, 25, 0.85)",
                  }}
                >
                  <img
                    src={typeof mapImageUrl === "string" ? mapImageUrl.trim() : mapImageUrl}
                    alt={`${activeDestination.name} map preview`}
                    style={{ width: "100%", display: "block" }}
                    loading="lazy"
                    onError={(e) => (e.target.alt = "Map failed to load")}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      right: "12px",
                      fontSize: "0.75rem",
                      color: "rgba(226, 232, 240, 0.75)",
                      background: "rgba(15, 23, 42, 0.72)",
                      padding: "6px 10px",
                      borderRadius: "999px",
                      border: "1px solid rgba(212, 175, 55, 0.2)",
                    }}
                  >
                    Map by {mapProvider === "osm" ? "OpenStreetMap" : "Geoapify"}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "grid", gap: "18px" }}>
              <div>
                <h2
                  style={{
                    color: "#f4e5a1",
                    fontSize: "2rem",
                    marginBottom: "10px",
                    textShadow: "0 15px 40px rgba(212, 175, 55, 0.35)",
                  }}
                >
                  {activeDestination.name}
                </h2>
                <div style={{ color: "#d1d5db", fontSize: "1.05rem", marginBottom: "12px" }}>
                  {activeDestination.location?.formatted || "India"}
                </div>
                <p style={{ color: "#9ca3af", lineHeight: 1.7 }}>{activeDestination.description}</p>
              </div>

              {weather && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px 18px",
                    borderRadius: "14px",
                    background: "rgba(17, 24, 39, 0.65)",
                    border: "1px solid rgba(212, 175, 55, 0.25)",
                  }}
                >
                  {weather.icon ? (
                    <img
                      src={weather.icon}
                      alt={weather.conditionLabel || weather.description || "Weather"}
                      style={{ width: "46px", height: "46px" }}
                      loading="lazy"
                    />
                  ) : (
                    <span
                      role="img"
                      aria-label={weather.conditionLabel || weather.description || "Weather"}
                      style={{ fontSize: "1.8rem" }}
                    >
                      {weather.symbol || weather.emoji || "🌦️"}
                    </span>
                  )}
                  <div style={{ color: "#e5e7eb", fontSize: "0.95rem" }}>
                    <strong>
                      {formatTemperature(weather.temperature ?? weather.temp) || "Weather"}
                    </strong>
                    {weather.conditionLabel || weather.description
                      ? ` • ${weather.conditionLabel || weather.description}`
                      : ""}
                    {weather.humidity != null ? ` • Humidity ${weather.humidity}%` : ""}
                  </div>
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gap: "18px",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                }}
              >
                <div
                  style={{
                    background: "rgba(17, 24, 39, 0.68)",
                    borderRadius: "14px",
                    padding: "16px",
                    border: "1px solid rgba(212, 175, 55, 0.2)",
                  }}
                >
                  <h4 style={{ color: "#f4e5a1", marginBottom: "8px" }}>Highlights</h4>
                  <ul style={{ color: "#d1d5db", margin: 0, paddingLeft: "18px", lineHeight: 1.5 }}>
                    {(touristSuggestions || []).slice(0, 3).map((item, index) => (
                      <li key={`highlight-${item.placeId || index}`}>{item.name}</li>
                    ))}
                  </ul>
                </div>
                <div
                  style={{
                    background: "rgba(17, 24, 39, 0.68)",
                    borderRadius: "14px",
                    padding: "16px",
                    border: "1px solid rgba(212, 175, 55, 0.2)",
                  }}
                >
                  <h4 style={{ color: "#f4e5a1", marginBottom: "8px" }}>Stay Ideas</h4>
                  <ul style={{ color: "#d1d5db", margin: 0, paddingLeft: "18px", lineHeight: 1.5 }}>
                    {(hotelSuggestions || []).slice(0, 3).map((item, index) => (
                      <li key={`hotel-${item.placeId || index}`}>{item.name}</li>
                    ))}
                  </ul>
                </div>
                <div
                  style={{
                    background: "rgba(17, 24, 39, 0.68)",
                    borderRadius: "14px",
                    padding: "16px",
                    border: "1px solid rgba(212, 175, 55, 0.2)",
                  }}
                >
                  <h4 style={{ color: "#f4e5a1", marginBottom: "8px" }}>Food Stops</h4>
                  <ul style={{ color: "#d1d5db", margin: 0, paddingLeft: "18px", lineHeight: 1.5 }}>
                    {(restaurantSuggestions || []).slice(0, 3).map((item, index) => (
                      <li key={`restaurant-${item.placeId || index}`}>{item.name}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                {activeDestination.tags?.slice(0, 6).map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "999px",
                      border: "1px solid rgba(212, 175, 55, 0.35)",
                      color: "#f4e5a1",
                      fontSize: "0.85rem",
                      background: "rgba(24, 31, 48, 0.7)",
                    }}
                  >
                    #{tag.replace(/\s+/g, "")}
                  </span>
                ))}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() =>
                    navigate(`/explore?query=${encodeURIComponent(activeDestination.name)}`)
                  }
                  style={{
                    padding: "14px 26px",
                    borderRadius: "12px",
                    border: "none",
                    fontWeight: 600,
                    fontSize: "1rem",
                    background: "linear-gradient(135deg, #d4af37 0%, #f4e5a1 100%)",
                    color: "#111827",
                    cursor: "pointer",
                  }}
                >
                  Deep Dive in Explore
                </motion.button>
                {user && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSaveModal(true)}
                    style={{
                      padding: "14px 26px",
                      borderRadius: "12px",
                      border: "1px solid rgba(244, 229, 161, 0.5)",
                      background: "transparent",
                      color: "#f4e5a1",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Save to Itinerary
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Features Section */}
      <section
        ref={featuresRef}
        style={{
          padding: "100px 20px",
          background: "linear-gradient(135deg, #0b0e14 0%, #1a1f2e 100%)",
          position: "relative",
          overflow: "hidden",
          margin: 0,
          maxWidth: "100%",
          width: "100%",
        }}
      >
        {/* Floating Background Elements with Parallax */}
        <motion.div
          style={{
            position: "absolute",
            top: "10%",
            left: "5%",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)",
            y: y2,
            rotate,
          }}
        />
        <motion.div
          style={{
            position: "absolute",
            top: "60%",
            right: "10%",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)",
            y: y3,
            scale,
          }}
        />
        <motion.div
          style={{
            position: "absolute",
            bottom: "20%",
            left: "15%",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)",
            y: springY,
          }}
        />

        <div style={{ width: "100%", margin: 0, position: "relative", zIndex: 1 }}>
          <motion.h2
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.8 }}
            transition={{ duration: 1, type: "spring", stiffness: 80 }}
            style={{
              textAlign: "center",
              fontSize: "3rem",
              color: "#d4af37",
              marginBottom: "20px",
              textShadow: "0 0 30px rgba(212, 175, 55, 0.3)",
              cursor: "default",
              userSelect: "none",
            }}
          >
            {["Why", " ", "Choose", " ", "TourEase", "?"].map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  type: "spring",
                  stiffness: 150,
                }}
                whileHover={{
                  scale: 1.1,
                  color: "#f4e5a1",
                  textShadow: "0 0 20px rgba(212, 175, 55, 0.8)",
                }}
                style={{
                  display: "inline-block",
                  marginRight: word === " " ? "0.3em" : "0",
                  cursor: "default",
                  userSelect: "none",
                }}
              >
                {word}
              </motion.span>
            ))}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              textAlign: "center",
              color: "#e5e7eb",
              fontSize: "1.2rem",
              marginBottom: "40px",
              maxWidth: "600px",
              margin: "0 auto 40px",
            }}
          >
            Discover the ultimate travel planning experience with our AI-powered platform
          </motion.p>

          {/* CTA Banner - Sign Up to Use Features */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{
                background: "linear-gradient(135deg, #d4af37 0%, #f4e5a1 100%)",
                padding: "30px 40px",
                borderRadius: "20px",
                textAlign: "center",
                marginBottom: "60px",
                boxShadow: "0 10px 40px rgba(212, 175, 55, 0.4)",
              }}
            >
              <h3
                style={{
                  color: "#0b0e14",
                  fontSize: "1.8rem",
                  marginBottom: "15px",
                  fontWeight: "bold",
                }}
              >
                🚀 Ready to Start Your Journey?
              </h3>
              <p
                style={{
                  color: "#1f2937",
                  fontSize: "1.1rem",
                  marginBottom: "25px",
                }}
              >
                Sign up now to access all features, create itineraries, and explore destinations!
              </p>
              <div
                style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(0,0,0,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/signup")}
                  style={{
                    padding: "15px 40px",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    background: "#0b0e14",
                    color: "#d4af37",
                    border: "none",
                    borderRadius: "12px",
                    cursor: "pointer",
                  }}
                >
                  Get Started Free
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/signin")}
                  style={{
                    padding: "15px 40px",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    background: "transparent",
                    color: "#0b0e14",
                    border: "2px solid #0b0e14",
                    borderRadius: "12px",
                    cursor: "pointer",
                  }}
                >
                  Sign In
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Features Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: "30px",
              marginBottom: 0,
            }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.9, rotateX: -10 }}
                whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{
                  y: -15,
                  scale: 1.08,
                  rotateY: 5,
                  boxShadow: "0 25px 50px rgba(212, 175, 55, 0.4)",
                  borderColor: "rgba(212, 175, 55, 0.5)",
                }}
                onClick={() => !user && navigate("/signup")}
                style={{
                  background:
                    "linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(26, 31, 46, 0.8) 100%)",
                  padding: "40px 30px",
                  borderRadius: "20px",
                  border: "2px solid rgba(212, 175, 55, 0.2)",
                  textAlign: "center",
                  backdropFilter: "blur(15px)",
                  cursor: user ? "default" : "pointer",
                  transformStyle: "preserve-3d",
                  perspective: "1000px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Animated background gradient */}
                <motion.div
                  animate={{
                    background: [
                      "radial-gradient(circle at 20% 20%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)",
                      "radial-gradient(circle at 80% 80%, rgba(212, 175, 55, 0.15) 0%, transparent 50%)",
                      "radial-gradient(circle at 20% 20%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)",
                    ],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: "none",
                  }}
                />

                <motion.div
                  style={{
                    fontSize: "4rem",
                    marginBottom: "20px",
                    transform: "translateZ(50px)",
                  }}
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  whileHover={{
                    scale: 1.3,
                    rotateY: 15,
                    rotateZ: 10,
                  }}
                >
                  {feature.icon}
                </motion.div>
                <h3
                  style={{
                    color: "#d4af37",
                    fontSize: "1.5rem",
                    marginBottom: "15px",
                    transform: "translateZ(30px)",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    color: "#9ca3af",
                    lineHeight: "1.6",
                    transform: "translateZ(20px)",
                    marginBottom: user ? "0" : "20px",
                  }}
                >
                  {feature.description}
                </p>

                {/* "Sign Up to Use" Badge */}
                {!user && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                      marginTop: "20px",
                      padding: "10px 20px",
                      background: "linear-gradient(135deg, #d4af37 0%, #f4e5a1 100%)",
                      color: "#0b0e14",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                      display: "inline-block",
                    }}
                  >
                    🔒 Sign Up to Use
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Stats Section */}
          <motion.div
            ref={statsRef}
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 1, type: "spring", stiffness: 50 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "40px",
              textAlign: "center",
              marginTop: "60px",
            }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.3, rotateY: -180 }}
                whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 120,
                }}
                whileHover={{
                  scale: 1.15,
                  y: -10,
                  rotateZ: 5,
                }}
                style={{
                  background: "rgba(212, 175, 55, 0.1)",
                  padding: "30px 20px",
                  borderRadius: "15px",
                  border: "2px solid rgba(212, 175, 55, 0.3)",
                }}
              >
                <motion.div
                  style={{
                    fontSize: "3.5rem",
                    fontWeight: "bold",
                    color: "#d4af37",
                    marginBottom: "10px",
                  }}
                  animate={{
                    scale: [1, 1.05, 1],
                    textShadow: [
                      "0 0 10px rgba(212, 175, 55, 0.5)",
                      "0 0 25px rgba(212, 175, 55, 0.8)",
                      "0 0 10px rgba(212, 175, 55, 0.5)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  {stat.number}
                </motion.div>
                <div style={{ color: "#e5e7eb", fontSize: "1.1rem" }}>{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* AI Chatbot Integration - Positioned in bottom-right corner */}
      <AIChatbot />
    </div>
  );
};

export default Home;
