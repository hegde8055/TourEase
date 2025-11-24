// /client/src/components/DestinationDetailModal.js
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { placesAPI } from "../utils/api";
import { extractCoordinates } from "../utils/locationHelpers";
import InteractiveMap from "./InteractiveMap";
import { useAuth } from "../App";
import {
  normalizeDbDestination,
  deriveNearbyPlaces,
  resolveNearbyImage,
  normalizePlaceRating,
} from "../utils/destinationHelpers";

const DestinationDetailModal = ({ destination, onClose, onGenerateItinerary }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [normalizedDestination, setNormalizedDestination] = useState(null);
  const [touristPlaces, setTouristPlaces] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [weather, setWeather] = useState(null);
  const [selectedNearbyPlace, setSelectedNearbyPlace] = useState(null);
  const [nearbyPlaceDetails, setNearbyPlaceDetails] = useState(null);
  const [nearbyPlaceStatus, setNearbyPlaceStatus] = useState("idle");
  const [nearbyPlaceError, setNearbyPlaceError] = useState("");
  const [addedPlaces, setAddedPlaces] = useState(new Set());
  const nearbyDetailsRequestRef = useRef(0);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Main effect to process the selected destination
  useEffect(() => {
    if (!destination) {
      setNormalizedDestination(null);
      return;
    }

    const normalized = normalizeDbDestination(destination);
    setNormalizedDestination(normalized);

    setSelectedNearbyPlace(null);
    setNearbyPlaceDetails(null);
    setNearbyPlaceStatus("idle");
    setNearbyPlaceError("");

    const derivedTourist = deriveNearbyPlaces(normalized.nearby.tourist, normalized, "attraction");
    const derivedRestaurants = deriveNearbyPlaces(
      normalized.nearby.restaurants,
      normalized,
      "restaurant"
    );
    const derivedAccommodations = deriveNearbyPlaces(
      normalized.nearby.accommodations,
      normalized,
      "stay"
    );

    setTouristPlaces(derivedTourist);
    setRestaurants(derivedRestaurants);
    setHotels(derivedAccommodations);

    const loadWeather = async (coordinates) => {
      if (!coordinates || coordinates.lat == null || coordinates.lng == null) {
        setWeather(null);
        return;
      }
      try {
        const weatherResponse = await placesAPI.getWeather(coordinates.lat, coordinates.lng);
        setWeather(weatherResponse.data?.weather || null);
      } catch (err) {
        console.warn("Weather fetch failed:", err?.message || err);
        setWeather(null);
      }
    };

    if (normalized.weather) {
      setWeather(normalized.weather);
      if (!normalized.weather.icon && !normalized.weather.symbol && !normalized.weather.emoji) {
        const coords = extractCoordinates(normalized);
        if (coords) loadWeather(coords);
      }
    } else {
      const coords = extractCoordinates(normalized);
      if (coords) loadWeather(coords);
      else setWeather(null);
    }
  }, [destination]);

  // Close modal on 'Escape' key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Click handler for a "nearby" place card
  const handleNearbyPlaceClick = async (place) => {
    if (!place) return;
    setSelectedNearbyPlace(place);
    setNearbyPlaceError("");
    setNearbyPlaceDetails(null);
    if (!place.placeId) {
      setNearbyPlaceStatus("ready");
      return;
    }
    const requestId = Date.now();
    nearbyDetailsRequestRef.current = requestId;
    setNearbyPlaceStatus("loading");
    try {
      const response = await placesAPI.getPlaceDetails(place.placeId);
      if (nearbyDetailsRequestRef.current !== requestId) return;
      const props = response.data?.place || {};
      if (!props || Object.keys(props).length === 0) {
        setNearbyPlaceStatus("ready");
        setNearbyPlaceDetails(null);
        return;
      }
      const openingHours = Array.isArray(props.opening_hours?.weekday_text)
        ? props.opening_hours.weekday_text
        : Array.isArray(props.opening_hours?.labels)
          ? props.opening_hours.labels
          : [];
      const ratingSource =
        typeof props.rank?.confidence === "number"
          ? props.rank.confidence
          : typeof props.rank?.importance === "number"
            ? props.rank.importance
            : typeof props.rating === "number"
              ? props.rating
              : null;
      const detailedRating = normalizePlaceRating(ratingSource);
      setNearbyPlaceDetails({
        name: props.name || place.name,
        address: props.formatted || props.address_line1 || place.address,
        description: props.description || props.datasource?.raw?.description || "",
        categories: props.categories || place.categories || [],
        website: props.website || props.datasource?.raw?.website || place.website || "",
        phone:
          props.contact?.phone ||
          props.contact?.formatted_phone ||
          props.datasource?.raw?.phone ||
          place.phone ||
          "",
        openingHours,
        rating: detailedRating,
        heroImage: place.heroImage || resolveNearbyImage(props),
        raw: props,
      });
      setNearbyPlaceStatus("ready");
    } catch (error) {
      if (nearbyDetailsRequestRef.current !== requestId) return;
      console.error("Place details fetch failed:", error);
      setNearbyPlaceError("We couldn't load more details for this place just now.");
      setNearbyPlaceStatus("error");
    }
  };

  // Memoized function to merge base nearby place with fetched details
  const mergedNearbyPlace = useMemo(() => {
    if (!selectedNearbyPlace) return null;
    const details = nearbyPlaceDetails || {};

    const resolvedOpeningHours =
      Array.isArray(details.openingHours) && details.openingHours.length > 0
        ? details.openingHours
        : Array.isArray(selectedNearbyPlace.openingHours) &&
            selectedNearbyPlace.openingHours.length > 0
          ? selectedNearbyPlace.openingHours
          : Array.isArray(details.raw?.opening_hours?.weekday_text)
            ? details.raw.opening_hours.weekday_text
            : Array.isArray(details.raw?.opening_hours?.labels)
              ? details.raw.opening_hours.labels
              : [];

    const resolvedCategories =
      Array.isArray(details.categories) && details.categories.length > 0
        ? details.categories
        : Array.isArray(selectedNearbyPlace.categories)
          ? selectedNearbyPlace.categories
          : [];

    const ratingCount =
      details.raw?.datasource?.raw?.user_ratings_total ??
      details.raw?.user_ratings_total ??
      details.ratingCount ??
      selectedNearbyPlace.ratingCount ??
      selectedNearbyPlace.raw?.datasource?.raw?.user_ratings_total ??
      null;

    const description = details.description || selectedNearbyPlace.description || "";
    const website = details.website || selectedNearbyPlace.website || "";
    const phone = details.phone || selectedNearbyPlace.phone || "";
    const heroImage = details.heroImage || selectedNearbyPlace.heroImage || "";
    const priceLevel =
      details.priceLevel ??
      details.raw?.price_level ??
      selectedNearbyPlace.priceLevel ??
      selectedNearbyPlace.raw?.price_level ??
      null;

    const mapQueryParts = [selectedNearbyPlace.name, selectedNearbyPlace.address].filter(Boolean);
    const placeId = details.placeId || selectedNearbyPlace.placeId;

    // --- BOSS FIX: Correct Google Maps URL ---
    // This is the one, correct URL structure
    const query = encodeURIComponent(mapQueryParts.join(", "));
    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=$$?q=${query}${placeId ? `&query_place_id=${encodeURIComponent(placeId)}` : ""}`;
    // --- END OF FIX ---

    return {
      ...selectedNearbyPlace,
      ...details,
      rating: details.rating ?? selectedNearbyPlace.rating ?? null,
      ratingCount,
      description,
      website,
      phone,
      heroImage,
      priceLevel,
      categories: resolvedCategories,
      openingHours: resolvedOpeningHours,
      googleMapsLink,
    };
  }, [selectedNearbyPlace, nearbyPlaceDetails]);

  // Click handler for "Generate Itinerary" button
  const handleGenerateClick = useCallback(() => {
    if (!user) {
      alert("Please sign in to create an itinerary.");
      navigate("/signin");
      return;
    }
    if (onGenerateItinerary) {
      onGenerateItinerary(normalizedDestination);
    } else {
      navigate("/ItineraryPlanner", { state: { destinationName: normalizedDestination.name } });
    }
  }, [user, navigate, normalizedDestination, onGenerateItinerary]);

  // Add/Remove Nearby Place Handlers
  const handleAddNearbyPlace = (place) => {
    if (!user) {
      alert("Please sign in to add places to your itinerary.");
      navigate("/signin");
      return;
    }
    setAddedPlaces((prev) => {
      const newSet = new Set(prev);
      newSet.add(place.key);
      return newSet;
    });
  };

  const handleRemoveNearbyPlace = (place) => {
    setAddedPlaces((prev) => {
      const newSet = new Set(prev);
      newSet.delete(place.key);
      return newSet;
    });
  };

  // Reusable Nearby Section Renderer
  const renderNearbySection = (
    items,
    { title, icon, accentColor, borderColor, cardGradient, accentGlow }
  ) => {
    if (!Array.isArray(items) || items.length === 0) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
        style={{
          background: "rgba(17, 24, 39, 0.86)",
          padding: "24px",
          borderRadius: "20px",
          border: `1px solid ${borderColor}`,
          marginBottom: "26px",
        }}
      >
        <h3
          style={{
            color: accentColor,
            marginBottom: "18px",
            fontSize: "1.3rem",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {" "}
          <span>{icon}</span> {title}{" "}
        </h3>
        <div
          style={{
            display: "grid",
            gap: "18px",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          }}
        >
          {items.map((place) => (
            <div
              key={place.key}
              style={{
                borderRadius: "18px",
                padding: "18px",
                background:
                  cardGradient ||
                  "linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.92))",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: accentGlow || "0 20px 40px rgba(15, 23, 42, 0.45)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {place.heroImage && (
                <div
                  style={{
                    width: "100%",
                    borderRadius: "14px",
                    overflow: "hidden",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                  }}
                >
                  {" "}
                  <img
                    src={place.heroImage}
                    alt={place.name}
                    style={{ width: "100%", height: "150px", objectFit: "cover", display: "block" }}
                    loading="lazy"
                  />{" "}
                </div>
              )}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px", flex: "1 1 auto" }}
              >
                {" "}
                <span
                  style={{
                    color: "#fef9c3",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    lineHeight: 1.3,
                    letterSpacing: "0.01em",
                  }}
                >
                  {" "}
                  {place.name}{" "}
                </span>{" "}
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "10px", fontSize: "0.85rem" }}
                >
                  {" "}
                  <span
                    style={{
                      color: "#fbbf24",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {" "}
                    ⭐ {place.rating != null ? place.rating : "N/A"}{" "}
                    {place.ratingCount ? ` (${place.ratingCount})` : ""}{" "}
                  </span>{" "}
                  {place.priceLevel != null && (
                    <span style={{ color: "#f97316" }}>
                      {" "}
                      Price:{" "}
                      {"₹".repeat(Math.min(Math.max(Number(place.priceLevel) || 0, 1), 4))}{" "}
                    </span>
                  )}{" "}
                </div>{" "}
                {place.distanceText && (
                  <span style={{ color: "#bfdbfe", fontSize: "0.9rem" }}>{place.distanceText}</span>
                )}{" "}
                {place.address && (
                  <span style={{ color: "#cbd5f5", fontSize: "0.9rem", lineHeight: 1.5 }}>
                    {" "}
                    {place.address}{" "}
                  </span>
                )}{" "}
                {place.description && (
                  <span
                    style={{
                      color: "#d1d5db",
                      fontSize: "0.85rem",
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {" "}
                    {place.description}{" "}
                  </span>
                )}{" "}
                {Array.isArray(place.categories) && place.categories.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {" "}
                    {place.categories.slice(0, 3).map((category, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: "rgba(59, 130, 246, 0.2)",
                          color: "#bfdbfe",
                          padding: "6px 12px",
                          borderRadius: "999px",
                          fontSize: "0.75rem",
                          textTransform: "capitalize",
                          border: "1px solid rgba(59, 130, 246, 0.35)",
                        }}
                      >
                        {" "}
                        {category}{" "}
                      </span>
                    ))}{" "}
                  </div>
                )}{" "}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "auto",
                }}
              >
                <motion.button
                  type="button"
                  whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                  whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                  onClick={() => handleNearbyPlaceClick(place)}
                  style={{
                    background: "linear-gradient(135deg, #38bdf8, #3b82f6)",
                    color: "#0f172a",
                    border: "none",
                    borderRadius: "999px",
                    padding: "10px 20px",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 12px 24px rgba(56, 189, 248, 0.35)",
                    flex: 1,
                  }}
                >
                  {" "}
                  View Details{" "}
                </motion.button>
                {addedPlaces.has(place.key) ? (
                  <motion.button
                    type="button"
                    whileHover={{ scale: prefersReducedMotion ? 1 : 1.08 }}
                    whileTap={{ scale: prefersReducedMotion ? 1 : 0.92 }}
                    onClick={() => handleRemoveNearbyPlace(place)}
                    style={{
                      background: "linear-gradient(135deg, #ef4444, #dc2626)",
                      color: "#fef2f2",
                      border: "none",
                      borderRadius: "999px",
                      padding: "10px 16px",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 12px 24px rgba(239, 68, 68, 0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: "44px",
                      minHeight: "44px",
                    }}
                    title="Remove from itinerary"
                  >
                    −
                  </motion.button>
                ) : (
                  <motion.button
                    type="button"
                    whileHover={{ scale: prefersReducedMotion ? 1 : 1.08 }}
                    whileTap={{ scale: prefersReducedMotion ? 1 : 0.92 }}
                    onClick={() => handleAddNearbyPlace(place)}
                    style={{
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      color: "#f0fdf4",
                      border: "none",
                      borderRadius: "999px",
                      padding: "10px 16px",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 12px 24px rgba(16, 185, 129, 0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: "44px",
                      minHeight: "44px",
                    }}
                    title="Add to itinerary"
                  >
                    +
                  </motion.button>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  // --- Main Render ---
  if (!normalizedDestination) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        key="destination-details"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(8, 11, 19, 0.78)",
          backdropFilter: prefersReducedMotion ? "none" : "blur(12px)",
          zIndex: 950,
          display: "flex",
          alignItems: "flex-start", // Align to top for scrolling
          justifyContent: "center",
          padding: "40px 20px",
          overflowY: "auto", // Allow scroll on backdrop for modal
          overflowX: "hidden",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 30 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
          style={{
            width: "100%",
            maxWidth: "1100px",
            minHeight: "200px", // Ensure minimum height
            maxHeight: "none", // Remove max height constraint
            margin: "auto 0", // Center vertically in flex container
            background: "linear-gradient(180deg, rgba(11,14,20,0.95) 0%, rgba(17,24,39,0.98) 100%)",
            borderRadius: "28px",
            border: "1px solid rgba(212, 175, 55, 0.25)",
            boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
            padding: "34px",
            position: "relative",
          }}
          onClick={(event) => event.stopPropagation()}
        >
          {/* --- Sticky Close Button --- */}
          <div
            style={{
              position: "sticky",
              top: 0,
              display: "flex",
              justifyContent: "flex-end",
              paddingBottom: "12px",
              marginBottom: "12px",
              zIndex: 20,
              background:
                "linear-gradient(180deg, rgba(11,14,20,0.98) 0%, rgba(11,14,20,0.82) 45%, rgba(11,14,20,0) 100%)",
            }}
          >
            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{
                scale: prefersReducedMotion ? 1 : 1.06,
                rotate: prefersReducedMotion ? 0 : 2,
              }}
              whileTap={{ scale: prefersReducedMotion ? 1 : 0.94, rotate: 0 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "10px 18px",
                borderRadius: "999px",
                border: "1px solid rgba(148, 163, 184, 0.45)",
                background:
                  "linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(31,41,55,0.95) 100%)",
                color: "#e2e8f0",
                cursor: "pointer",
                boxShadow: "0 10px 24px rgba(15, 23, 42, 0.45)",
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
              aria-label="Close destination details"
            >
              <IoClose size={20} />
              <span style={{ fontSize: "0.85rem" }}>Close</span>
            </motion.button>
          </div>

          {/* --- Header Content --- */}
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
            style={{
              background: "rgba(17, 24, 39, 0.92)",
              borderRadius: "24px",
              padding: "26px",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              marginBottom: "30px",
            }}
          >
            <div style={{ display: "flex", gap: "26px", flexWrap: "wrap", alignItems: "center" }}>
              <motion.img
                src={normalizedDestination.photo}
                alt={normalizedDestination.name}
                style={{
                  width: "320px",
                  height: "220px",
                  objectFit: "cover",
                  borderRadius: "16px",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                }}
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.03 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
              />
              <div style={{ flex: 1, minWidth: "260px" }}>
                <h2 style={{ color: "#fcd34d", marginBottom: "12px", fontSize: "2rem" }}>
                  {" "}
                  {normalizedDestination.name}{" "}
                </h2>
                <p style={{ color: "#e5e7eb", marginBottom: "10px" }}>
                  {" "}
                  <strong>📍 Address:</strong> {normalizedDestination.formatted_address}{" "}
                </p>
                <p style={{ color: "#e5e7eb", marginBottom: "10px" }}>
                  {" "}
                  <strong>⭐ Rating:</strong> {normalizedDestination.rating}{" "}
                </p>
                <p style={{ color: "#e5e7eb", marginBottom: "10px" }}>
                  {" "}
                  <strong>🕒 Best time to visit:</strong>{" "}
                  {normalizedDestination.bestTimeToVisit}{" "}
                </p>
                <p style={{ color: "#e5e7eb", marginBottom: "20px" }}>
                  {" "}
                  <strong>💰 Entry fee:</strong> {normalizedDestination.entryFee}{" "}
                </p>
                {normalizedDestination.website && (
                  <p style={{ color: "#e5e7eb", marginBottom: "18px" }}>
                    {" "}
                    <strong>🌐 Website:</strong>{" "}
                    <a
                      href={normalizedDestination.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#60a5fa" }}
                    >
                      {" "}
                      {normalizedDestination.website}{" "}
                    </a>{" "}
                  </p>
                )}
                <motion.button
                  type="button"
                  onClick={handleGenerateClick}
                  whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                  whileTap={{ scale: prefersReducedMotion ? 1 : 0.96 }}
                  style={{
                    padding: "12px 26px",
                    background: "linear-gradient(135deg, #d4af37 0%, #f7ef8a 100%)",
                    color: "#0b0e14",
                    border: "none",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    boxShadow: "0 15px 30px rgba(212, 175, 55, 0.25)",
                  }}
                >
                  🤖 Generate AI Itinerary
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* --- Weather Section --- */}
          {weather && (
            <motion.div
              initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
              style={{
                background: "rgba(59, 130, 246, 0.1)",
                padding: "18px 24px",
                borderRadius: "16px",
                border: "1px solid rgba(59, 130, 246, 0.25)",
                display: "flex",
                alignItems: "center",
                gap: "18px",
                marginBottom: "28px",
              }}
            >
              {" "}
              {weather.icon ? (
                <img
                  src={weather.icon}
                  alt={weather.conditionLabel || weather.description || "Weather"}
                  style={{ width: "58px", height: "58px" }}
                  loading="lazy"
                />
              ) : (
                <div
                  style={{
                    width: "58px",
                    height: "58px",
                    borderRadius: "50%",
                    background: "rgba(30, 64, 175, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.9rem",
                  }}
                  aria-hidden="true"
                >
                  {" "}
                  {weather.symbol || weather.emoji || "🌦️"}{" "}
                </div>
              )}{" "}
              <div>
                {" "}
                <h3 style={{ color: "#fcd34d", marginBottom: "6px" }}>Current Weather</h3>{" "}
                <p style={{ color: "#e5e7eb" }}>
                  {" "}
                  {weather.temp ?? weather.temperature ?? "—"}{" "}
                  {weather.temp != null || weather.temperature != null ? "°C" : ""} {" • "}{" "}
                  {weather.conditionLabel || weather.description || "Weather"}{" "}
                  {weather.city ? ` in ${weather.city}` : ""}{" "}
                </p>{" "}
                <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "4px" }}>
                  {" "}
                  Feels like {weather.feels_like ?? weather.feelsLike ?? "—"}{" "}
                  {weather.feels_like != null || weather.feelsLike != null ? "°C" : ""}{" "}
                  {" • Humidity: "} {weather.humidity != null ? `${weather.humidity}%` : "—"}{" "}
                </p>{" "}
              </div>{" "}
            </motion.div>
          )}

          {/* --- Description --- */}
          {normalizedDestination.description && (
            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
              style={{
                background: "rgba(17, 24, 39, 0.86)",
                padding: "26px",
                borderRadius: "20px",
                border: "1px solid rgba(148, 163, 184, 0.25)",
                marginBottom: "26px",
              }}
            >
              {" "}
              <h3 style={{ color: "#fcd34d", marginBottom: "14px", fontSize: "1.4rem" }}>
                {" "}
                Overview{" "}
              </h3>{" "}
              <p style={{ color: "#cbd5f5", lineHeight: 1.7 }}>
                {" "}
                {normalizedDestination.description}{" "}
              </p>{" "}
            </motion.div>
          )}

          {/* --- Nearby Sections --- */}
          {renderNearbySection(touristPlaces, {
            title: "Nearby Attractions",
            icon: "🧭",
            accentColor: "#60a5fa",
            borderColor: "rgba(59, 130, 246, 0.25)",
            cardGradient:
              "linear-gradient(160deg, rgba(29, 78, 216, 0.45), rgba(14, 116, 144, 0.55))",
            accentGlow: "0 22px 48px rgba(37, 99, 235, 0.35)",
          })}
          {renderNearbySection(restaurants, {
            title: "Dining & Cafés",
            icon: "🍽️",
            accentColor: "#f97316",
            borderColor: "rgba(249, 115, 22, 0.28)",
            cardGradient:
              "linear-gradient(160deg, rgba(124, 45, 18, 0.45), rgba(236, 72, 153, 0.4))",
            accentGlow: "0 22px 48px rgba(236, 72, 153, 0.28)",
          })}
          {renderNearbySection(hotels, {
            title: "Stays & Lodging",
            icon: "🛏️",
            accentColor: "#34d399",
            borderColor: "rgba(52, 211, 153, 0.28)",
            cardGradient:
              "linear-gradient(160deg, rgba(13, 148, 136, 0.4), rgba(56, 189, 248, 0.35))",
            accentGlow: "0 22px 48px rgba(45, 212, 191, 0.32)",
          })}

          {/* --- Map --- */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <InteractiveMap
              coordinates={extractCoordinates(normalizedDestination)}
              name={normalizedDestination.name}
              address={normalizedDestination.formatted_address}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* --- Nearby Place Detail Modal (nested) --- */}
      <AnimatePresence>
        {selectedNearbyPlace && (
          <motion.div
            key={selectedNearbyPlace.key || selectedNearbyPlace.placeId || selectedNearbyPlace.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1300,
              background: "rgba(15, 23, 42, 0.85)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
            }}
            onClick={() => setSelectedNearbyPlace(null)}
          >
            <motion.div
              initial={{ y: prefersReducedMotion ? 0 : 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: prefersReducedMotion ? 0 : 20, opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
              onClick={(event) => event.stopPropagation()}
              style={{
                width: "min(520px, 95vw)",
                maxHeight: "90vh",
                overflowY: "auto",
                background: "rgba(17, 24, 39, 0.95)",
                borderRadius: "24px",
                border: "1px solid rgba(59, 130, 246, 0.35)",
                boxShadow: "0 25px 70px rgba(8, 12, 20, 0.65)",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: "#fcd34d", margin: 0, fontSize: "1.5rem" }}>
                    {mergedNearbyPlace.name}
                  </h3>
                  {mergedNearbyPlace.address && (
                    <p style={{ color: "#cbd5f5", margin: "8px 0 0", fontSize: "0.95rem" }}>
                      {mergedNearbyPlace.address}
                    </p>
                  )}
                </div>
                <motion.button
                  type="button"
                  onClick={() => setSelectedNearbyPlace(null)}
                  whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                  whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                  style={{
                    border: "none",
                    background: "rgba(30, 41, 59, 0.8)",
                    color: "#e2e8f0",
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    fontSize: "1.4rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ×
                </motion.button>
              </div>

              {mergedNearbyPlace.heroImage && (
                <motion.img
                  initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                  src={mergedNearbyPlace.heroImage}
                  alt={mergedNearbyPlace.name}
                  style={{
                    width: "100%",
                    maxHeight: "240px",
                    objectFit: "cover",
                    borderRadius: "16px",
                    border: "1px solid rgba(59, 130, 246, 0.35)",
                  }}
                  loading="lazy"
                />
              )}

              {nearbyPlaceStatus === "loading" && (
                <p style={{ color: "#60a5fa", margin: "12px 0 0" }}>Fetching more details…</p>
              )}
              {nearbyPlaceStatus === "error" && (
                <p style={{ color: "#f87171", margin: "12px 0 0" }}>{nearbyPlaceError}</p>
              )}

              {mergedNearbyPlace && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div
                    style={{
                      display: "grid",
                      gap: "12px",
                      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    }}
                  >
                    {mergedNearbyPlace.rating != null && (
                      <div
                        style={{
                          background: "rgba(251, 191, 36, 0.15)",
                          borderRadius: "14px",
                          border: "1px solid rgba(251, 191, 36, 0.25)",
                          padding: "12px",
                        }}
                      >
                        <p style={{ margin: 0, color: "#fbbf24", fontSize: "0.75rem" }}>Rating</p>
                        <p
                          style={{
                            margin: "4px 0 0",
                            color: "#fde68a",
                            fontSize: "1.05rem",
                            fontWeight: 600,
                          }}
                        >
                          {" "}
                          {mergedNearbyPlace.rating}{" "}
                        </p>
                        {mergedNearbyPlace.ratingCount && (
                          <p style={{ margin: "4px 0 0", color: "#facc15", fontSize: "0.75rem" }}>
                            {" "}
                            {mergedNearbyPlace.ratingCount} reviews{" "}
                          </p>
                        )}
                      </div>
                    )}
                    {mergedNearbyPlace.priceLevel != null && (
                      <div
                        style={{
                          background: "rgba(134, 239, 172, 0.12)",
                          borderRadius: "14px",
                          border: "1px solid rgba(52, 211, 153, 0.28)",
                          padding: "12px",
                        }}
                      >
                        <p style={{ margin: 0, color: "#4ade80", fontSize: "0.75rem" }}>
                          {" "}
                          Price Level{" "}
                        </p>
                        <p
                          style={{
                            margin: "4px 0 0",
                            color: "#bbf7d0",
                            fontSize: "1rem",
                            fontWeight: 600,
                          }}
                        >
                          {" "}
                          {"₹".repeat(
                            Math.min(Math.max(Number(mergedNearbyPlace.priceLevel) || 0, 1), 4)
                          )}{" "}
                        </p>
                      </div>
                    )}
                  </div>

                  {mergedNearbyPlace.description && (
                    <div>
                      {" "}
                      <p style={{ color: "#e5e7eb", fontWeight: 600, marginBottom: "6px" }}>
                        {" "}
                        About this place{" "}
                      </p>{" "}
                      <p style={{ color: "#cbd5f5", lineHeight: 1.6 }}>
                        {" "}
                        {mergedNearbyPlace.description}{" "}
                      </p>{" "}
                    </div>
                  )}

                  {mergedNearbyPlace.website ||
                  mergedNearbyPlace.phone ||
                  mergedNearbyPlace.googleMapsLink ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                      {mergedNearbyPlace.website && (
                        <a
                          href={mergedNearbyPlace.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: "linear-gradient(135deg, #38bdf8, #3b82f6)",
                            color: "#0f172a",
                            borderRadius: "999px",
                            padding: "10px 18px",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            textDecoration: "none",
                            boxShadow: "0 14px 28px rgba(56, 189, 248, 0.25)",
                          }}
                        >
                          {" "}
                          Visit Website{" "}
                        </a>
                      )}
                      {mergedNearbyPlace.googleMapsLink && (
                        <a
                          href={mergedNearbyPlace.googleMapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: "linear-gradient(135deg, #f472b6, #ec4899)",
                            color: "#0f172a",
                            borderRadius: "999px",
                            padding: "10px 18px",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            textDecoration: "none",
                            boxShadow: "0 14px 28px rgba(236, 72, 153, 0.25)",
                          }}
                        >
                          {" "}
                          View on Maps{" "}
                        </a>
                      )}
                      {mergedNearbyPlace.phone && (
                        <a
                          href={`tel:${mergedNearbyPlace.phone.replace(/\s+/g, "")}`}
                          style={{
                            background: "linear-gradient(135deg, #34d399, #10b981)",
                            color: "#022c22",
                            borderRadius: "999px",
                            padding: "10px 18px",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            textDecoration: "none",
                            boxShadow: "0 14px 28px rgba(16, 185, 129, 0.28)",
                          }}
                        >
                          {" "}
                          Call Now{" "}
                        </a>
                      )}
                    </div>
                  ) : null}

                  {Array.isArray(mergedNearbyPlace.openingHours) &&
                    mergedNearbyPlace.openingHours.length > 0 && (
                      <div>
                        <p style={{ color: "#60a5fa", marginBottom: "6px", fontWeight: 600 }}>
                          {" "}
                          Opening Hours{" "}
                        </p>
                        <div style={{ display: "grid", gap: "4px" }}>
                          {mergedNearbyPlace.openingHours.map((line, index) => (
                            <span key={index} style={{ color: "#cbd5f5", fontSize: "0.85rem" }}>
                              {line}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default DestinationDetailModal;
