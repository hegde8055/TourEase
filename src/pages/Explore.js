// /client/src/pages/Explore.js
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import InteractiveMap from "../components/InteractiveMap";
import { placesAPI, destinationsAPI } from "../utils/api";
import { extractCoordinates } from "../utils/locationHelpers";
import { getDestinationHeroImage } from "../utils/imageHelpers";
import { useAuth } from "../App";
import { IoClose } from "react-icons/io5";

const formatAddress = (location = {}) => {
  if (!location) return "India";
  if (location.address) return location.address;
  const parts = [location.city, location.state, location.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "India";
};
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
const normalizePlaceRating = (value) => {
  if (value == null) return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  const scaled = numeric <= 1 ? numeric * 5 : numeric;
  const clamped = Math.max(0, Math.min(scaled, 5));
  return Number(clamped.toFixed(1));
};
const extractPlaceId = (place = {}) => {
  return (
    place.placeId || place.place_id || place.id || place.raw?.place_id || place.raw?.id || null
  );
};
const NEARBY_IMAGE_CANDIDATE_KEYS = [
  "heroImage",
  "hero_image_url",
  "image",
  "photo",
  "thumbnail",
  "cover",
  "primaryImage",
  "imageUrl",
  "image_url",
  "preview",
];
const resolveNearbyImage = (place = {}) => {
  const inspect = (value) => {
    if (!value) return null;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return null;
      if (trimmed.startsWith("//")) return `https:${trimmed}`;
      if (trimmed.startsWith("http") || trimmed.startsWith("data:")) return trimmed;
      return null;
    }
    if (typeof value === "object") {
      const nestedKeys = ["url", "src", "image", "imageUrl", "image_url", "path"];
      for (const key of nestedKeys) {
        const nested = inspect(value[key]);
        if (nested) return nested;
      }
    }
    return null;
  };
  for (const key of NEARBY_IMAGE_CANDIDATE_KEYS) {
    const resolved = inspect(place[key] ?? place.raw?.[key]);
    if (resolved) return resolved;
  }
  if (Array.isArray(place.images) && place.images.length > 0) {
    const candidate = inspect(place.images[0]);
    if (candidate) return candidate;
  }
  return null;
};
const deriveNearbyPlaces = (items = [], destination, fallbackKey) => {
  if (!Array.isArray(items) || items.length === 0) return [];
  const baseKey =
    destination?._id || destination?.id || destination?.slug || destination?.name || fallbackKey;
  return items
    .map((item = {}, index) => {
      const placeId = extractPlaceId(item);
      const textualDistance =
        typeof item.distance === "string" && item.distance.trim()
          ? item.distance.trim()
          : typeof item.distanceText === "string" && item.distanceText.trim()
            ? item.distanceText.trim()
            : typeof item.raw?.distanceText === "string" && item.raw.distanceText.trim()
              ? item.raw.distanceText.trim()
              : typeof item.vicinity === "string" && item.vicinity.trim()
                ? item.vicinity.trim()
                : "";
      const ratingCandidates = [
        item.rating,
        item.rank?.importance,
        item.rank?.confidence,
        item.raw?.rank?.importance,
        item.raw?.rank?.confidence,
        item.details?.rating,
        item.details?.rank?.popularity,
        item.details?.datasource?.raw?.rating,
      ];
      const ratingSource = ratingCandidates.find((score) => typeof score === "number");
      const normalizedRating = normalizePlaceRating(ratingSource);
      const categories = Array.isArray(item.categories)
        ? item.categories
        : Array.isArray(item.raw?.categories)
          ? item.raw.categories
          : [];
      const reviewCount =
        item.raw?.rating?.count ||
        item.raw?.datasource?.raw?.user_ratings_total ||
        item.details?.user_ratings_total ||
        item.details?.datasource?.raw?.user_ratings_total ||
        item.reviewCount ||
        null;
      const priceLevel =
        item.raw?.price_level ??
        item.details?.price_level ??
        item.raw?.datasource?.raw?.price_level ??
        null;
      return {
        key: placeId || `${baseKey || "destination"}-nearby-${index}`,
        placeId,
        name: item.name || item.title || item.address || `Nearby place ${index + 1}`,
        address:
          item.address ||
          item.formatted ||
          item.vicinity ||
          item.description ||
          item.raw?.address_line1 ||
          item.raw?.formatted ||
          "",
        distanceText: textualDistance,
        rating: normalizedRating != null ? normalizedRating : null,
        ratingCount: reviewCount,
        priceLevel,
        categories,
        website: item.website || item.raw?.website || item.details?.website || "",
        phone: item.phone || item.raw?.phone || item.details?.contact?.phone || "",
        heroImage: resolveNearbyImage(item),
        heroImageSource: item.heroImageSource || item.raw?.heroImageSource || "",
        heroImageAttribution:
          item.heroImageAttribution ||
          item.raw?.heroImageAttribution ||
          item.details?.imageCredits ||
          "",
        description:
          item.description ||
          item.summary ||
          item.raw?.description ||
          item.raw?.datasource?.raw?.description ||
          item.details?.description ||
          "",
        openingHours:
          item.details?.opening_hours?.weekday_text ||
          item.raw?.opening_hours?.weekday_text ||
          item.raw?.datasource?.raw?.opening_hours ||
          null,
        coordinates: item.coordinates || item.raw?.coordinates || null,
        raw: item,
      };
    })
    .filter((entry) => Boolean(entry.name));
};
const normalizeDbDestination = (destination) => {
  if (!destination) return null;
  const normalizedRating = normalizePlaceRating(destination.rating);
  const normalized = {
    id: destination._id,
    name: destination.name,
    category: destination.category,
    description: destination.description,
    formatted_address: formatAddress(destination.location),
    rating:
      normalizedRating != null
        ? normalizedRating
        : typeof destination.rating === "number"
          ? Number(destination.rating.toFixed(1))
          : destination.rating || "N/A",
    website: destination.website || "",
    entryFee: destination.entryFee || "Included in package",
    bestTimeToVisit: destination.bestTimeToVisit || "Year round",
    photo: getDestinationHeroImage(destination, {
      size: "900x600",
      querySuffix: "India landmark cinematic",
    }),
    location: destination.location,
    highlights: destination.highlights || [],
    activities: destination.activities || [],
    nearbyAttractions: destination.nearbyAttractions || [],
    nearby: {
      tourist: Array.isArray(destination.nearby?.tourist) ? destination.nearby.tourist : [],
      restaurants: Array.isArray(destination.nearby?.restaurants)
        ? destination.nearby.restaurants
        : [],
      accommodations: Array.isArray(destination.nearby?.accommodations)
        ? destination.nearby.accommodations
        : [],
    },
    tips: destination.tips || [],
    howToReach: destination.howToReach || "",
    weather: destination.weather || null,
    mapImage:
      destination.mapImage ||
      destination.map?.image ||
      destination.map?.staticMap ||
      destination.staticMap ||
      null,
    mapProvider: destination.mapProvider || destination.map?.provider || "geoapify",
    raw: destination,
  };
  return normalized;
};

const Explore = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const suggestionRefs = useRef([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestionNames, setSuggestionNames] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null); // for outside-click handling
  const [loading, setLoading] = useState(false);
  const [dbDestinations, setDbDestinations] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState("");
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [touristPlaces, setTouristPlaces] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [weather, setWeather] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [selectedNearbyPlace, setSelectedNearbyPlace] = useState(null);
  const [nearbyPlaceDetails, setNearbyPlaceDetails] = useState(null);
  const [nearbyPlaceStatus, setNearbyPlaceStatus] = useState("idle");
  const [nearbyPlaceError, setNearbyPlaceError] = useState("");
  const [addedPlaces, setAddedPlaces] = useState(new Set());

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
    const googleMapsLink = mapQueryParts.length
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          mapQueryParts.join(" ")
        )}${placeId ? `&query_place_id=${encodeURIComponent(placeId)}` : ""}`
      : "";

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

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const nearbyDetailsRequestRef = useRef(0);

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
          const list = destinationsRes.value.data?.destinations || destinationsRes.value.data || [];
          setDbDestinations(list);
        } else {
          setDbDestinations([]);
          setDbError("We couldn't load curated destinations just now.");
        }
        if (categoriesRes.status === "fulfilled") {
          const fetched = categoriesRes.value.data?.categories || [];
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
  useEffect(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) {
      setSuggestionNames([]);
      setShowSuggestions(false);
      return;
    }

    const matches = dbDestinations
      .filter(
        (d) =>
          d?.name &&
          d.name.toLowerCase().startsWith(q) &&
          (d.category === "place" || d.type === "city" || !d.category)
      )
      .map((d) => d.name);

    const unique = [...new Set(matches)].slice(0, 8);
    setSuggestionNames(unique);
    setShowSuggestions(unique.length > 0);
  }, [searchQuery, dbDestinations]);

  const filteredDestinations = useMemo(() => {
    if (selectedCategory === "All") return dbDestinations;
    return dbDestinations.filter((destination) => destination.category === selectedCategory);
  }, [dbDestinations, selectedCategory]);

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
  useEffect(() => {
    const onDoc = (e) => {
      if (!searchInputRef.current?.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  useEffect(() => {
    if (activeSuggestionIndex >= 0 && suggestionRefs.current[activeSuggestionIndex]) {
      suggestionRefs.current[activeSuggestionIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeSuggestionIndex]);

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

  const applySelection = (destination) => {
    const normalized = normalizeDbDestination(destination);
    setSelectedDestination(normalized);
    setSelectedNearbyPlace(null);
    setNearbyPlaceDetails(null);
    setNearbyPlaceStatus("idle");
    setNearbyPlaceError("");
    const derivedTourist = deriveNearbyPlaces(
      destination.nearby?.tourist || destination.nearbyAttractions || [],
      destination,
      "attraction"
    );
    const derivedRestaurants = deriveNearbyPlaces(
      destination.nearby?.restaurants || destination.restaurants || [],
      destination,
      "restaurant"
    );
    const derivedAccommodations = deriveNearbyPlaces(
      destination.nearby?.accommodations || destination.hotels || destination.accommodations || [],
      destination,
      "stay"
    );
    setTouristPlaces(derivedTourist);
    setRestaurants(derivedRestaurants);
    setHotels(derivedAccommodations);
    if (destination.weather) {
      setWeather(destination.weather);
      if (!destination.weather.icon && !destination.weather.symbol && !destination.weather.emoji) {
        const coords = extractCoordinates(destination);
        if (coords) {
          loadWeather(coords);
        }
      }
    } else {
      const coords = extractCoordinates(destination);
      if (coords) {
        loadWeather(coords);
      } else {
        setWeather(null);
      }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError("Please enter a destination to search.");
      return;
    }
    setLoading(true);
    setSearchError("");
    try {
      const ingestResponse = await destinationsAPI.ingestFromGeoapify({
        query: searchQuery.trim(),
      });
      const destination = ingestResponse.data?.destination;
      if (!destination) {
        setSearchError(
          ingestResponse.data?.error ||
            "No destination details were returned. Please try a different search."
        );
        setSelectedDestination(null);
        setTouristPlaces([]);
        setHotels([]);
        setRestaurants([]);
        setWeather(null);
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
      applySelection(destination);
    } catch (err) {
      console.error("Search failed:", err);
      setSearchError(err.response?.data?.error || "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (destination) => {
    if (!destination) return;
    const hasNearbyData =
      Array.isArray(destination.nearby?.tourist) && destination.nearby.tourist.length > 0;
    const hasLegacyNearby =
      Array.isArray(destination.nearbyAttractions) && destination.nearbyAttractions.length > 0;
    if (!hasNearbyData && !hasLegacyNearby && destination._id) {
      try {
        const response = await destinationsAPI.getById(destination._id);
        const hydrated = response.data?.destination || destination;
        applySelection(hydrated);
        return;
      } catch (error) {
        console.warn("Destination hydration failed:", error);
      }
    }
    applySelection(destination);
  };

  const closeDetails = useCallback(() => {
    setSelectedDestination(null);
    setWeather(null);
    setSelectedNearbyPlace(null);
    setNearbyPlaceDetails(null);
    setNearbyPlaceStatus("idle");
    setNearbyPlaceError("");
  }, []);

  useEffect(() => {
    if (!selectedDestination) return;
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDetails();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [selectedDestination, closeDetails]);

  const handleKeyDown = (event) => {
    if (!showSuggestions || suggestionNames.length === 0) {
      if (event.key === "Enter") handleSearch();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestionIndex((prev) => (prev < suggestionNames.length - 1 ? prev + 1 : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestionIndex((prev) => (prev > 0 ? prev - 1 : suggestionNames.length - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeSuggestionIndex >= 0) {
        const name = suggestionNames[activeSuggestionIndex];
        setSearchQuery(name);
        setShowSuggestions(false);
        const found = dbDestinations.find((d) => d.name.toLowerCase() === name.toLowerCase());
        if (found) handleCardClick(found);
      } else {
        handleSearch();
      }
    } else if (event.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // --- MODIFIED FUNCTION ---
  // This function now handles navigation to the planner page
  const handleGenerateItineraryClick = (destination) => {
    if (!user) {
      alert("Please sign in to create an itinerary.");
      navigate("/signin");
      return;
    }
    // Navigate to the planner page and pass the destination name in the state
    navigate("/ItineraryPlanner", { state: { destinationName: destination.name } });
  };

  // Handler for adding a nearby place to the itinerary planner
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

  // Handler for removing a nearby place from the itinerary planner
  const handleRemoveNearbyPlace = (place) => {
    setAddedPlaces((prev) => {
      const newSet = new Set(prev);
      newSet.delete(place.key);
      return newSet;
    });
  };

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
          <div style={{ position: "relative", width: "100%", maxWidth: "420px" }}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              style={{
                width: "100%",
                padding: "12px 18px",
                borderRadius: "24px",
                border: "1px solid rgba(212,175,55,0.4)",
                background: "rgba(15,23,42,0.9)",
                color: "#f3f4f6",
                fontSize: "1rem",
                outline: "none",
                transition: "all 0.25s ease",
                zIndex: 2,
              }}
            />

            {showSuggestions && suggestionNames.length > 0 && (
              <ul
                style={{
                  position: "absolute",
                  top: "110%",
                  left: 0,
                  right: 0,
                  background: "rgba(15,23,42,0.98)",
                  borderRadius: "14px",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(212,175,55,0.2)",
                  listStyle: "none",
                  padding: "6px 0",
                  margin: 0,
                  zIndex: 50,
                }}
              >
                {suggestionNames.map((name, index) => {
                  const query = searchQuery.trim().toLowerCase();
                  const lowerName = name.toLowerCase();
                  const startIndex = lowerName.indexOf(query);
                  const endIndex = startIndex + query.length;

                  const before = name.slice(0, startIndex);
                  const match = name.slice(startIndex, endIndex);
                  const after = name.slice(endIndex);

                  const isActive = index === activeSuggestionIndex;

                  return (
                    <li
                      key={name}
                      ref={(el) => (suggestionRefs.current[index] = el)} // 👈 add this line
                      onClick={() => {
                        setSearchQuery(name);
                        setShowSuggestions(false);
                        const found = dbDestinations.find(
                          (d) => d.name.toLowerCase() === name.toLowerCase()
                        );
                        if (found) handleCardClick(found);
                      }}
                      style={{
                        padding: "10px 18px",
                        cursor: "pointer",
                        color: "#fef9c3",
                        fontSize: "0.95rem",
                        background: isActive ? "rgba(212,175,55,0.15)" : "transparent",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={() => setActiveSuggestionIndex(index)}
                      onMouseLeave={() => setActiveSuggestionIndex(-1)}
                    >
                      {before}
                      <span style={{ color: "#d4af37", fontWeight: 700 }}>{match}</span>
                      {after}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <motion.button
            type="button"
            onClick={handleSearch}
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
              minWidth: "160px",
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

      <AnimatePresence>
        {selectedDestination && (
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
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 20px",
            }}
            onClick={closeDetails}
          >
            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 30 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
              style={{
                width: "100%",
                maxWidth: "1100px",
                maxHeight: "90vh",
                overflowY: "auto",
                background:
                  "linear-gradient(180deg, rgba(11,14,20,0.95) 0%, rgba(17,24,39,0.98) 100%)",
                borderRadius: "28px",
                border: "1px solid rgba(212, 175, 55, 0.25)",
                boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
                padding: "34px",
                position: "relative",
              }}
              onClick={(event) => event.stopPropagation()}
            >
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
                  onClick={closeDetails}
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
                <div
                  style={{ display: "flex", gap: "26px", flexWrap: "wrap", alignItems: "center" }}
                >
                  <motion.img
                    src={selectedDestination.photo}
                    alt={selectedDestination.name}
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
                      {selectedDestination.name}{" "}
                    </h2>
                    <p style={{ color: "#e5e7eb", marginBottom: "10px" }}>
                      {" "}
                      <strong>📍 Address:</strong> {selectedDestination.formatted_address}{" "}
                    </p>
                    <p style={{ color: "#e5e7eb", marginBottom: "10px" }}>
                      {" "}
                      <strong>⭐ Rating:</strong> {selectedDestination.rating}{" "}
                    </p>
                    <p style={{ color: "#e5e7eb", marginBottom: "10px" }}>
                      {" "}
                      <strong>🕒 Best time to visit:</strong>{" "}
                      {selectedDestination.bestTimeToVisit}{" "}
                    </p>
                    <p style={{ color: "#e5e7eb", marginBottom: "20px" }}>
                      {" "}
                      <strong>💰 Entry fee:</strong> {selectedDestination.entryFee}{" "}
                    </p>
                    {selectedDestination.website && (
                      <p style={{ color: "#e5e7eb", marginBottom: "18px" }}>
                        {" "}
                        <strong>🌐 Website:</strong>{" "}
                        <a
                          href={selectedDestination.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#60a5fa" }}
                        >
                          {" "}
                          {selectedDestination.website}{" "}
                        </a>{" "}
                      </p>
                    )}
                    {/* --- MODIFIED BUTTON --- */}
                    <motion.button
                      type="button"
                      onClick={() => handleGenerateItineraryClick(selectedDestination)}
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
                      {" • Humidity: "}{" "}
                      {weather.humidity != null ? `${weather.humidity}%` : "—"}{" "}
                    </p>{" "}
                  </div>{" "}
                </motion.div>
              )}
              {selectedDestination.description && (
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
                    {selectedDestination.description}{" "}
                  </p>{" "}
                </motion.div>
              )}
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

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <InteractiveMap
                  coordinates={extractCoordinates(selectedDestination)}
                  name={selectedDestination.name}
                  address={selectedDestination.formatted_address}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
    </div>
  );
};

export default Explore;
