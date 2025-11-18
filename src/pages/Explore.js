// /client/src/pages/Explore.js
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
// --- REMOVED InteractiveMap import ---
import { placesAPI, destinationsAPI } from "../utils/api";
// --- REMOVED extractCoordinates import ---
import { getDestinationHeroImage } from "../utils/imageHelpers";
import { useAuth } from "../App";
// --- REMOVED IoClose import ---

// --- REMOVED unused destinationHelpers imports ---

// --- Import the new modal component ---
import DestinationDetailModal from "../components/DestinationDetailModal";

const heroVariants = {
  hidden: { opacity: 0, y: -40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: "easeOut" } },
};
const heroSupportingVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.15 } },
};
const chipContainerVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, delayChildren: 0.1, ease: "easeOut" },
  },
};
const chipVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 240, damping: 18 },
  },
};
const cardVariants = {
  hidden: { opacity: 0, y: 35, rotateX: -8 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.5, delay: index * 0.04, ease: "easeOut" },
  }),
};
const orbAnimation = (delay = 0) => ({
  y: [0, -30, 0],
  scale: [1, 1.15, 1],
  opacity: [0.25, 0.6, 0.25],
  transition: { duration: 5, repeat: Infinity, ease: "easeInOut", delay },
});

const Explore = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [dbDestinations, setDbDestinations] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState("");
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchError, setSearchError] = useState("");

  const [selectedDestination, setSelectedDestination] = useState(null);

  const [localSuggestions, setLocalSuggestions] = useState([]);
  const [apiSuggestions, setApiSuggestions] = useState([]);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const debounceTimeoutRef = useRef(null);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.6]);
  const heroTranslate = useTransform(scrollYProgress, [0, 1], [0, -80]);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Fetch curated destinations
  useEffect(() => {
    let isMounted = true;
    const fetchCurated = async () => {
      setDbLoading(true);
      setDbError("");
      try {
        const [destinationsRes, categoriesRes] = await Promise.allSettled([
          destinationsAPI.getAll({ limit: 40, sort: "rating" }),
          destinationsAPI.getCategories(),
        ]);
        if (!isMounted) return;
        if (destinationsRes.status === "fulfilled") {
          const apiValue = destinationsRes.value;
          const list =
            apiValue?.destinations ||
            apiValue?.data?.destinations ||
            (Array.isArray(apiValue) ? apiValue : apiValue?.data) ||
            [];
          setDbDestinations(Array.isArray(list) ? list : []);
        } else {
          setDbDestinations([]);
          setDbError("We couldn't load curated destinations just now.");
        }
        if (categoriesRes.status === "fulfilled") {
          const categoryValue = categoriesRes.value;
          const fetched = categoryValue?.categories || categoryValue?.data?.categories || [];
          setCategories(["All", ...fetched]);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Curated destinations fetch failed:", err);
        setDbDestinations([]);
        setDbError(err.response?.data?.error || "Failed to load curated destinations.");
      } finally {
        if (isMounted) {
          setDbLoading(false);
        }
      }
    };
    fetchCurated();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredDestinations = useMemo(() => {
    if (selectedCategory === "All") return dbDestinations;
    return dbDestinations.filter((destination) => destination.category === selectedCategory);
  }, [dbDestinations, selectedCategory]);

  // Document click listener for closing suggestions
  useEffect(() => {
    const onDoc = (e) => {
      if (!searchInputRef.current?.contains(e.target)) {
        setIsInputFocused(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Modified handleSearch
  const handleSearch = async (queryToSearch) => {
    const query = (typeof queryToSearch === "string" ? queryToSearch : searchQuery).trim();

    if (!query) {
      setSearchError("Please enter a destination to search.");
      return;
    }

    setLoading(true);
    setSearchError("");
    try {
      const ingestResponse = await destinationsAPI.ingestFromGeoapify({
        query: `${query}, India`,
        country: "IN",
      });

      const destination = ingestResponse.data?.destination;
      if (!destination) {
        setSearchError(
          ingestResponse.data?.error ||
            "No destination details were returned. Please try a different search."
        );
        setSelectedDestination(null);
        return;
      }

      setDbDestinations((prev = []) => {
        const next = [...prev];
        const matchesDestination = (item) => {
          if (!item) return false;
          if (destination._id && item._id && item._id === destination._id) return true;
          if (destination.slug && item.slug && item.slug === destination.slug) return true;
          return false;
        };
        const existingIndex = next.findIndex(matchesDestination);
        if (existingIndex >= 0) {
          next[existingIndex] = destination;
          return next;
        }
        return [destination, ...next];
      });

      if (destination.category) {
        setCategories((prevCategories) => {
          if (prevCategories.includes(destination.category)) return prevCategories;
          return [...prevCategories, destination.category];
        });
      }

      setSelectedDestination(destination);
    } catch (err) {
      console.error("Search failed:", err);
      setSearchError(err.response?.data?.error || "Search failed. Please try again.");
    } finally {
      setLoading(false);
      setIsInputFocused(false); // Close suggestions
    }
  };

  // Modified handleCardClick
  const handleCardClick = async (destination) => {
    if (!destination) return;

    const hasNearbyData =
      (Array.isArray(destination.nearby?.tourist) && destination.nearby.tourist.length > 0) ||
      (Array.isArray(destination.nearbyAttractions) && destination.nearbyAttractions.length > 0);

    if (!hasNearbyData && destination._id) {
      try {
        const response = await destinationsAPI.getById(destination._id);
        const hydrated = response.data?.destination || destination;
        setSelectedDestination(hydrated);
        return;
      } catch (error) {
        console.warn("Destination hydration failed:", error);
        setSelectedDestination(destination);
      }
    } else {
      setSelectedDestination(destination);
    }
  };

  const closeDetails = useCallback(() => {
    setSelectedDestination(null);
  }, []);

  // --- Hybrid Autosuggest Logic ---
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch(searchQuery);
      event.preventDefault();
      setIsInputFocused(false);
      setLocalSuggestions([]);
      setApiSuggestions([]);
    }
  };

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (!searchQuery.trim()) {
      setLocalSuggestions([]);
      setApiSuggestions([]);
      setIsApiLoading(false);
      return;
    }
    const filteredLocal = dbDestinations
      .filter((destination) => destination.name.toLowerCase().startsWith(searchQuery.toLowerCase()))
      .slice(0, 3);
    setLocalSuggestions(filteredLocal);
    setIsApiLoading(true);
    setApiSuggestions([]);

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const [cityResults, touristResults] = await placesAPI.getAutocomplete(searchQuery);
        let combinedFeatures = [];
        if (cityResults.status === "fulfilled" && cityResults.value.data.features) {
          combinedFeatures.push(...cityResults.value.data.features);
        }
        if (touristResults.status === "fulfilled" && touristResults.value.data.features) {
          combinedFeatures.push(...touristResults.value.data.features);
        }
        const seen = new Set(filteredLocal.map((d) => d.name.toLowerCase()));
        const processedApiResults = combinedFeatures
          .map((feature) => ({
            text:
              feature.properties.name ||
              feature.properties.formatted ||
              feature.properties.address_line1,
            data: feature.properties,
          }))
          .filter((suggestion) => {
            if (!suggestion.text || seen.has(suggestion.text.toLowerCase())) {
              return false;
            }
            seen.add(suggestion.text.toLowerCase());
            return true;
          });
        setApiSuggestions(processedApiResults.slice(0, 5));
      } catch (error) {
        console.warn("Autocomplete API fetch failed:", error);
        setApiSuggestions([]);
      } finally {
        setIsApiLoading(false);
      }
    }, 400);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery, dbDestinations]);

  const handleLocalSuggestionClick = (destination) => {
    setSearchQuery(destination.name);
    setIsInputFocused(false);
    setLocalSuggestions([]);
    setApiSuggestions([]);
    handleCardClick(destination);
  };

  const handleApiSuggestionClick = (suggestionText) => {
    setSearchQuery(suggestionText);
    setIsInputFocused(false);
    setLocalSuggestions([]);
    setApiSuggestions([]);
    handleSearch(suggestionText);
  };
  // --- End of Hybrid Autosuggest Logic ---

  const handleGenerateItineraryClick = (destination) => {
    if (!user) {
      alert("Please sign in to create an itinerary.");
      navigate("/signin");
      return;
    }
    navigate("/ItineraryPlanner", { state: { destinationName: destination.name } });
  };

  return (
    <div className="main-content">
      <Navbar />

      <motion.section
        ref={heroRef}
        style={{
          position: "relative",
          overflow: "hidden",
          width: "100%",
          maxWidth: "none",
          margin: 0,
          padding: "160px 0 140px",
          marginTop: "-180px",
          textAlign: "center",
          background:
            "linear-gradient(rgba(6, 10, 18, 0.78), rgba(14, 23, 42, 0.85)), url('/assets/1.jpg') center/cover no-repeat",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          opacity: heroOpacity,
          y: heroTranslate,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 1.1 }}
      >
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0.25 }}
          animate={prefersReducedMotion ? { opacity: 0.28 } : { opacity: [0.2, 0.45, 0.2] }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 8, repeat: Infinity }}
          style={{
            position: "absolute",
            top: "-35%",
            left: "-45%",
            width: "80%",
            height: "80%",
            background:
              "radial-gradient(circle at center, rgba(212, 175, 55, 0.25), transparent 70%)",
            filter: "blur(70px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        {[
          { id: "orb-1", top: "12%", left: "8%", size: 180, delay: 0 },
          { id: "orb-2", top: "18%", right: "10%", size: 240, delay: 1.4 },
          { id: "orb-3", bottom: "20%", left: "18%", size: 200, delay: 0.9 },
          { id: "orb-4", bottom: "10%", right: "24%", size: 160, delay: 2.1 },
          { id: "orb-5", top: "46%", left: "48%", size: 130, delay: 1.8 },
        ].map((orb) => (
          <motion.span
            key={orb.id}
            animate={prefersReducedMotion ? { opacity: 0.25 } : orbAnimation(orb.delay)}
            style={{
              position: "absolute",
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(99, 102, 241, 0.15), rgba(14, 23, 42, 0.05))",
              filter: "blur(10px)",
              pointerEvents: "none",
              zIndex: 0,
              ...(orb.left ? { left: orb.left } : {}),
              ...(orb.right ? { right: orb.right } : {}),
              ...(orb.top ? { top: orb.top } : {}),
              ...(orb.bottom ? { bottom: orb.bottom } : {}),
            }}
          />
        ))}
        <motion.div
          aria-hidden="true"
          animate={
            prefersReducedMotion
              ? { opacity: 0.18 }
              : { opacity: [0.12, 0.3, 0.12], rotate: [0, 2, 0] }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 12, repeat: Infinity, ease: "easeInOut" }
          }
          style={{
            position: "absolute",
            bottom: "-12%",
            width: "160%",
            height: "55%",
            background:
              "linear-gradient(180deg, rgba(12, 18, 30, 0) 0%, rgba(12, 18, 30, 0.75) 65%, rgba(6, 9, 16, 0.95) 100%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "900px", width: "100%" }}>
          <motion.h1
            variants={heroVariants}
            initial="hidden"
            animate="visible"
            style={{
              fontSize: "3.6rem",
              color: "#d4af37",
              marginBottom: "20px",
              textShadow: "0 0 28px rgba(212, 175, 55, 0.45)",
            }}
          >
            Explore India's Top Destinations for 2025
          </motion.h1>
          <motion.p
            variants={heroSupportingVariants}
            initial="hidden"
            animate="visible"
            style={{
              color: "#e5e7eb",
              marginBottom: "52px",
              fontSize: "1.18rem",
              maxWidth: "720px",
              lineHeight: 1.7,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Discover curated beaches, mountains, and cultural icons across India. Filter by travel
            style, dig into highlights, and build your perfect itinerary in minutes.
          </motion.p>
        </div>

        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.94 }}
          animate={
            prefersReducedMotion
              ? { opacity: 1, scale: 1 }
              : {
                  opacity: 1,
                  scale: 1,
                  boxShadow: [
                    "0 20px 40px rgba(12, 18, 30, 0.45)",
                    "0 28px 55px rgba(212, 175, 55, 0.35)",
                    "0 20px 40px rgba(12, 18, 30, 0.45)",
                  ],
                  borderColor: [
                    "rgba(212, 175, 55, 0.35)",
                    "rgba(212, 175, 55, 0.65)",
                    "rgba(212, 175, 55, 0.35)",
                  ],
                }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: 6, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
          }
          style={{
            position: "relative",
            display: "flex",
            flexWrap: "wrap",
            gap: "15px",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg, rgba(17, 24, 39, 0.82) 0%, rgba(10, 16, 28, 0.88) 50%, rgba(17, 24, 39, 0.82) 100%)",
            border: "1px solid rgba(212, 175, 55, 0.35)",
            padding: "20px",
            borderRadius: "22px",
            backdropFilter: "blur(22px)",
            overflow: "hidden",
            zIndex: 1,
            minWidth: "min(90%, 650px)",
          }}
        >
          {!prefersReducedMotion && (
            <motion.span
              aria-hidden="true"
              animate={{ opacity: [0.12, 0.3, 0.12], x: ["-35%", "120%", "-35%"] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                top: "-30%",
                width: "130%",
                height: "160%",
                background:
                  "linear-gradient(120deg, rgba(212, 175, 55, 0.18) 0%, rgba(212, 175, 55, 0) 60%)",
                pointerEvents: "none",
              }}
            />
          )}

          <div style={{ flex: "1 1 300px", minWidth: "280px", position: "relative", zIndex: 10 }}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search destinations, cities, or experiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => {
                setTimeout(() => setIsInputFocused(false), 200);
              }}
              autoComplete="off"
              style={{
                width: "100%",
                padding: "14px 18px",
                borderRadius: "12px",
                border: "1px solid rgba(212,175,55,0.4)",
                background: "rgba(15,23,42,0.9)",
                color: "#f3f4f6",
                fontSize: "1rem",
                outline: "none",
                transition: "all 0.25s ease",
                zIndex: 2,
              }}
            />

            <AnimatePresence>
              {isInputFocused &&
                (localSuggestions.length > 0 || apiSuggestions.length > 0 || isApiLoading) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 4px)",
                      left: 0,
                      width: "100%",
                      background: "rgba(17, 24, 39, 0.98)",
                      border: "1px solid rgba(212, 175, 55, 0.35)",
                      borderRadius: "12px",
                      backdropFilter: "blur(10px)",
                      overflow: "hidden",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                      maxHeight: "40vh",
                      overflowY: "auto",
                      padding: "8px",
                      zIndex: 50,
                    }}
                  >
                    {localSuggestions.length > 0 && (
                      <>
                        <h4
                          style={{
                            padding: "8px 12px",
                            color: "#fcd34d",
                            fontSize: "0.8rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            margin: 0,
                          }}
                        >
                          Curated Destinations
                        </h4>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                          {localSuggestions.map((destination) => (
                            <li
                              key={destination._id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleLocalSuggestionClick(destination);
                              }}
                              style={{
                                padding: "12px 16px",
                                color: "#f3f4f6",
                                cursor: "pointer",
                                borderRadius: "8px",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = "rgba(212, 175, 55, 0.2)")
                              }
                              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                            >
                              {destination.name}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {(apiSuggestions.length > 0 || isApiLoading) && (
                      <>
                        <h4
                          style={{
                            padding: "8px 12px",
                            color: "#60a5fa",
                            fontSize: "0.8rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            margin: localSuggestions.length > 0 ? "8px 0 0" : "0",
                          }}
                        >
                          Search Results
                        </h4>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                          {isApiLoading && (
                            <li
                              style={{
                                padding: "12px 16px",
                                color: "#94a3b8",
                                fontStyle: "italic",
                              }}
                            >
                              Searching...
                            </li>
                          )}
                          {apiSuggestions.map((suggestion) => (
                            <li
                              key={suggestion.text}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleApiSuggestionClick(suggestion.text);
                              }}
                              style={{
                                padding: "12px 16px",
                                color: "#f3f4f6",
                                cursor: "pointer",
                                borderRadius: "8px",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)")
                              }
                              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                            >
                              {suggestion.text}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </motion.div>
                )}
            </AnimatePresence>
          </div>

          <motion.button
            type="button"
            onClick={() => handleSearch()}
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.05 }}
            whileTap={{ scale: loading ? 1 : 0.96 }}
            style={{
              padding: "14px 26px",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(135deg, #d4af37 0%, #f7ef8a 100%)",
              color: "#0b0e14",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "1rem",
              boxShadow: "0 14px 28px rgba(212, 175, 55, 0.35)",
              position: "relative",
              zIndex: 1,
              minWidth: "120px",
              flexShrink: 0,
            }}
          >
            {loading ? "Searching..." : "Search"}
          </motion.button>
        </motion.div>

        {!prefersReducedMotion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.4], y: [0, 12, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "relative",
              zIndex: 1,
              marginTop: "70px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              color: "#fcd34d",
              fontSize: "0.8rem",
              letterSpacing: "0.35em",
            }}
          >
            <span>SCROLL</span>
            <span
              style={{
                display: "block",
                width: "1px",
                height: "42px",
                background:
                  "linear-gradient(180deg, rgba(252, 211, 77, 0) 0%, rgba(252, 211, 77, 0.75) 100%)",
              }}
            />
          </motion.div>
        )}

        <AnimatePresence>
          {searchError && (
            <motion.div
              key="search-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
              style={{
                marginTop: "24px",
                padding: "12px 18px",
                background: "rgba(239, 68, 68, 0.12)",
                color: "#fecaca",
                borderRadius: "12px",
                border: "1px solid rgba(248, 113, 113, 0.35)",
                maxWidth: "520px",
              }}
            >
              {searchError}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <section
        style={{
          background: "linear-gradient(180deg, #0b1120 0%, #111827 100%)",
          padding: "0 0 60px",
          maxWidth: "none",
          margin: 0,
        }}
      >
        <div style={{ width: "100%", margin: 0, maxWidth: "100%", padding: "0 20px" }}>
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: "easeOut" }}
            style={{ textAlign: "center", marginBottom: "50px" }}
          >
            <h2 style={{ color: "#f7f7f8", fontSize: "2.4rem", marginBottom: "12px" }}>
              {" "}
              Curated India Experiences 2025{" "}
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "1rem" }}>
              {" "}
              Browse handpicked destinations from our travel experts. Jump straight into the ones
              that match your vibe.{" "}
            </p>
          </motion.div>
          {dbError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                marginBottom: "30px",
                padding: "18px",
                borderRadius: "14px",
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(248, 113, 113, 0.25)",
                color: "#fecaca",
                textAlign: "center",
              }}
            >
              {dbError}
            </motion.div>
          )}
          <motion.div
            variants={chipContainerVariants}
            initial="hidden"
            animate="visible"
            transition={prefersReducedMotion ? undefined : { duration: 0.5, ease: "easeOut" }}
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              justifyContent: "center",
              marginBottom: "40px",
            }}
          >
            {categories.map((category) => {
              const active = category === selectedCategory;
              return (
                <motion.button
                  key={category}
                  type="button"
                  {...(!prefersReducedMotion && { variants: chipVariants })}
                  onClick={() => setSelectedCategory(category)}
                  whileHover={{ scale: active ? 1 : 1.05 }}
                  whileTap={{ scale: active ? 1 : 0.95 }}
                  style={{
                    padding: "12px 26px",
                    borderRadius: "30px",
                    border: "2px solid rgba(212, 175, 55, 0.35)",
                    background: active
                      ? "linear-gradient(135deg, #d4af37 0%, #f7ef8a 100%)"
                      : "rgba(17, 24, 39, 0.7)",
                    color: active ? "#0b0e14" : "#d4af37",
                    fontWeight: "bold",
                    cursor: "pointer",
                    backdropFilter: "blur(12px)",
                    boxShadow: active ? "0 12px 24px rgba(212, 175, 55, 0.25)" : "none",
                  }}
                >
                  {category}
                </motion.button>
              );
            })}
          </motion.div>

          {dbLoading ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                style={{
                  width: "60px",
                  height: "60px",
                  border: "4px solid rgba(212, 175, 55, 0.2)",
                  borderTop: "4px solid #d4af37",
                  borderRadius: "50%",
                  margin: "0 auto 16px",
                }}
              />
              <p style={{ color: "#94a3b8", fontSize: "1rem" }}>Loading curated destinations...</p>
            </div>
          ) : filteredDestinations.length ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 320px))",
                gap: "clamp(18px, 2vw, 32px)",
                width: "100%",
                justifyItems: "stretch",
                justifyContent: "center",
              }}
            >
              {filteredDestinations.map((destination, index) => {
                const cardImage = getDestinationHeroImage(destination, {
                  size: "900x600",
                  querySuffix: "India landmark cinematic",
                });
                const ratingDisplay =
                  typeof destination.rating === "number"
                    ? destination.rating.toFixed(1)
                    : destination.rating || "N/A";
                return (
                  <motion.div
                    key={destination._id || `${destination.name}-${index}`}
                    {...(!prefersReducedMotion && { variants: cardVariants })}
                    custom={index}
                    initial={prefersReducedMotion ? undefined : "hidden"}
                    whileInView={prefersReducedMotion ? undefined : "visible"}
                    viewport={{ once: true, amount: 0.2 }}
                    whileHover={{
                      y: prefersReducedMotion ? 0 : -10,
                      boxShadow: "0 24px 48px rgba(212, 175, 55, 0.25)",
                    }}
                    style={{
                      background: "rgba(17, 24, 39, 0.92)",
                      borderRadius: "20px",
                      overflow: "hidden",
                      border: "1.5px solid rgba(212, 175, 55, 0.22)",
                      backdropFilter: "blur(16px)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      minHeight: "100%",
                      position: "relative",
                      transition: "box-shadow 0.3s ease, transform 0.3s ease",
                    }}
                    onClick={() => handleCardClick(destination)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(event) => {
                      if (event.key === "Enter") handleCardClick(destination);
                    }}
                  >
                    <div style={{ position: "relative", height: "200px", overflow: "hidden" }}>
                      <img
                        src={cardImage}
                        alt={destination.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          filter: "brightness(0.97)",
                          transition: "transform 0.4s ease",
                        }}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.transform = "scale(1)";
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: "14px",
                          right: "14px",
                          background: "rgba(212, 175, 55, 0.9)",
                          color: "#0b0e14",
                          padding: "7px 18px",
                          borderRadius: "999px",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          boxShadow: "0 2px 8px rgba(212, 175, 55, 0.2)",
                        }}
                      >
                        {" "}
                        {destination.category}{" "}
                      </div>
                      <div
                        style={{
                          position: "absolute",
                          top: "14px",
                          left: "14px",
                          background: "rgba(11, 17, 32, 0.9)",
                          color: "#facc15",
                          padding: "7px 16px",
                          borderRadius: "999px",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.35)",
                        }}
                      >
                        {" "}
                        ⭐ {ratingDisplay}{" "}
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "22px",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        gap: "12px",
                      }}
                    >
                      <h3
                        style={{
                          color: "#fcd34d",
                          fontSize: "1.25rem",
                          marginBottom: "4px",
                          fontWeight: 700,
                          letterSpacing: "0.01em",
                        }}
                      >
                        {" "}
                        {destination.name}{" "}
                      </h3>
                      <p
                        style={{
                          color: "#b6c2d6",
                          fontSize: "0.95rem",
                          lineHeight: 1.6,
                          marginBottom: "4px",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {" "}
                        {destination.description}{" "}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: "#e5e7eb",
                          fontSize: "0.9rem",
                          fontWeight: 500,
                        }}
                      >
                        {" "}
                        <span style={{ fontSize: "1.1rem" }}>📍</span>{" "}
                        <span>{destination.location?.city || "India"}</span>{" "}
                      </div>
                      <div
                        style={{
                          marginTop: "auto",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px",
                            color: "#cbd5f5",
                            fontSize: "0.88rem",
                          }}
                        >
                          <span>Best time: {destination.bestTimeToVisit || "All year"}</span>
                          <span style={{ color: "#facc15", fontWeight: 600 }}>
                            {" "}
                            {destination.entryFee || "See details"}{" "}
                          </span>
                        </div>
                        <motion.button
                          type="button"
                          whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                          whileTap={{ scale: prefersReducedMotion ? 1 : 0.96 }}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleCardClick(destination);
                          }}
                          style={{
                            padding: "10px 18px",
                            borderRadius: "999px",
                            border: "none",
                            background: "linear-gradient(135deg, #d4af37 0%, #f7ef8a 100%)",
                            color: "#0b0e14",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            textAlign: "center",
                            boxShadow: "0 12px 24px rgba(212, 175, 55, 0.3)",
                          }}
                        >
                          View Details
                          <span style={{ fontSize: "1rem" }}>→</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "rgba(15, 23, 42, 0.75)",
                borderRadius: "18px",
                border: "1px solid rgba(148, 163, 184, 0.25)",
                color: "#94a3b8",
              }}
            >
              No destinations found in this category just yet. Try another filter or search above.
            </motion.div>
          )}
        </div>
      </section>

      <DestinationDetailModal
        destination={selectedDestination}
        onClose={closeDetails}
        onGenerateItinerary={handleGenerateItineraryClick}
      />
    </div>
  );
};

export default Explore;
