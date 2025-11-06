import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import InteractiveMap from "../components/InteractiveMap";
import {
  enhancedItineraryAPI,
  aiItineraryAPI,
  geoAPI,
  enhancedPlacesAPI,
  imageAPI,
} from "../utils/api";
import { calculateMultiPointRoute } from "../utils/routingUtils";
import { useAuth } from "../App";
import {
  IoCalendar,
  IoCheckmarkCircle,
  IoClose,
  IoCopy,
  IoLocation,
  IoLogoFacebook,
  IoLogoLinkedin,
  IoLogoTwitter,
  IoLogoWhatsapp,
  IoMail,
  IoPeople,
  IoRemoveCircle,
  IoShareSocial,
  IoTrash,
} from "react-icons/io5";

// --- NEW: DND-KIT IMPORTS ---
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// All styles from ItineraryPlanner.css are converted to a JS object
const styles = {
  itineraryPlannerPage: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "-100px",
  },
  mainContent: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  baseSection: {
    border: "none",
    background: "transparent",
    boxShadow: "none",
  },
  heroSectionWrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: "80px 24px 40px",
    boxSizing: "border-box",
  },
  heroSectionInner: {
    width: "100%",
    maxWidth: "1400px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  contentWrapperOuter: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    paddingTop: "40px",
    paddingBottom: "120px",
    paddingLeft: "24px",
    paddingRight: "24px",
    boxSizing: "border-box",
  },
  contentWrapperInner: {
    width: "100%",
    maxWidth: "1600px", // Increased width
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  planYourTripContainer: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    border: "none",
    background: "transparent",
    boxShadow: "none",
  },
  planYourTripBox: {
    width: "100%",
    maxWidth: "480px",
    padding: "2rem",
    background: "rgba(15, 23, 42, 0.92)",
    border: "1px solid rgba(148, 163, 184, 0.3)",
    borderRadius: "20px",
  },
};

const defaultAiForm = {
  destinationName: "",
  startDate: "",
  endDate: "",
  passengers: 2,
  travelStyle: "standard",
  interests: "",
  basePerPerson: 3500, // This will now be updated automatically
  travelClass: "economy",
  season: "standard",
  taxesPct: 0.18,
  addOns: { visa: 0, insurance: 0, buffer: 0 },
};

const SIGNAL_COLORS = {
  alert: "#f87171",
  warning: "#fbbf24",
  info: "#60a5fa",
  positive: "#34d399",
};

const filterOptions = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
];

// --- NEW: Draggable Place Card Component ---
// For places in the suggestions/search list that can be dragged to itinerary days
const DraggablePlaceCard = ({ place, isDraggedOver, isAlreadySelected }) => {
  const placeKey = place.placeId || place.id;

  return (
    <div
      draggable={!isAlreadySelected}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "copy";
        e.dataTransfer.setData(
          "application/json",
          JSON.stringify({
            type: "place",
            place,
            placeId: placeKey,
          })
        );
      }}
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        padding: "12px",
        borderRadius: "14px",
        border: isDraggedOver
          ? "2px solid rgba(34, 197, 94, 0.6)"
          : "1px solid rgba(148, 163, 184, 0.25)",
        background: isDraggedOver ? "rgba(34, 197, 94, 0.1)" : "rgba(15, 23, 42, 0.72)",
        opacity: isAlreadySelected ? 0.5 : 1,
        cursor: isAlreadySelected ? "not-allowed" : "grab",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ color: "#f8fafc", fontWeight: 600 }}>{place.name}</div>
        {place.address && (
          <div style={{ color: "#9ca3af", fontSize: "0.85rem" }}>{place.address}</div>
        )}
        {place.categories?.length > 0 && (
          <div
            style={{
              color: "#60a5fa",
              fontSize: "0.75rem",
              marginTop: "4px",
            }}
          >
            {place.categories.slice(0, 3).join(" - ")}
          </div>
        )}
      </div>
    </div>
  );
};

// --- NEW: DND-Kit Sortable Item Component ---
// This component wraps each place in your itinerary list
const SortablePlaceItem = ({ id, place, dayIndex, removePlaceFromDay, distanceMap }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 1, // High z-index when dragging
    opacity: isDragging ? 0.85 : 1,
    boxShadow: isDragging ? "0 10px 20px rgba(0,0,0,0.3)" : "none",
  };

  const placeKey = place.placeId || place.id;
  const distanceInMeters = distanceMap.get(placeKey);

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        display: "grid",
        gridTemplateColumns: "auto 1fr auto", // Column for handle, info, and button
        gap: "10px",
        alignItems: "center",
        padding: "10px",
        background: "rgba(2, 6, 23, 0.8)",
        border: "1px solid rgba(59, 130, 246, 0.2)",
        borderRadius: "10px",
      }}
      {...attributes} // Spread DND attributes
    >
      {/* Drag Handle */}
      <div
        {...listeners} // Spread DND listeners
        style={{ cursor: "grab", color: "#9ca3af", padding: "0 6px" }}
        title="Drag to reorder"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="9" cy="6" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="9" cy="18" r="1.5" />
          <circle cx="15" cy="6" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="15" cy="18" r="1.5" />
        </svg>
      </div>

      {/* Place Info */}
      <div>
        <div style={{ color: "#f8fafc", fontWeight: 600 }}>
          {place.name}
          {/* --- FIX: This will now be populated correctly --- */}
          {distanceInMeters != null && distanceInMeters > 0 && (
            <span
              style={{
                color: "#60a5fa",
                fontSize: "0.8rem",
                marginLeft: "8px",
              }}
            >
              ({(distanceInMeters / 1000).toFixed(1)} km)
            </span>
          )}
        </div>
        {place.address && (
          <div style={{ color: "#9ca3af", fontSize: "0.8rem" }}>
            {place.address || place.formattedAddress}
          </div>
        )}
      </div>

      {/* Remove Button */}
      <div style={{ display: "flex", gap: "6px" }}>
        <motion.button
          onClick={() => removePlaceFromDay(dayIndex, placeKey)}
          style={{
            background: "transparent",
            border: "none",
            color: "#fca5a5",
            cursor: "pointer",
          }}
          title="Remove"
        >
          <IoRemoveCircle size={22} />
        </motion.button>
      </div>
    </div>
  );
};

const ItineraryPlanner = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("planner");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [itineraries, setItineraries] = useState([]);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itineraryToDelete, setItineraryToDelete] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [itineraryToShare, setItineraryToShare] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const [aiForm, setAiForm] = useState(defaultAiForm);
  const [aiPlan, setAiPlan] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiCostResult, setAiCostResult] = useState(null);
  const [tripBudgetInput, setTripBudgetInput] = useState(""); // NEW: Unified trip budget field
  const [hasManualTripBudget, setHasManualTripBudget] = useState(false);

  const [itineraryDays, setItineraryDays] = useState([{ dayNumber: 1, places: [] }]);

  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });
  const [destinationDetails, setDestinationDetails] = useState(null);
  const [suggestedPlaces, setSuggestedPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState("");
  const [routeSummary, setRouteSummary] = useState(null);
  const [geoRouteData, setGeoRouteData] = useState(null);
  const [geoRouteLoading, setGeoRouteLoading] = useState(false);
  const [geoRouteError, setGeoRouteError] = useState("");
  const [routingLoading, setRoutingLoading] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [mapRouteMetrics, setMapRouteMetrics] = useState(null);

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [placeSearchQuery, setPlaceSearchQuery] = useState("");
  const [placeSearchResults, setPlaceSearchResults] = useState([]);
  const [placeSearchLoading, setPlaceSearchLoading] = useState(false);
  const [placeSearchError, setPlaceSearchError] = useState("");

  const distanceCacheRef = useRef(new Map());
  const resultsRef = useRef(null);
  const [focusedInput, setFocusedInput] = useState(null);

  const baseInputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    borderRadius: "10px",
    border: "2px solid",
    borderImage: "linear-gradient(135deg, #3b82f6, #22d3ee) 1",
    background: "rgba(2, 6, 23, 0.9)",
    color: "#f8fafc",
    fontSize: "14px",
    outline: "none",
    transition: "border-image 0.3s ease",
  };

  const activeInputStyle = {
    borderImage: "linear-gradient(135deg, #fcd34d, #f59e0b) 1",
  };

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // --- DND-Kit Sensor Setup ---
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });

  const sensors = useSensors(pointerSensor, keyboardSensor);

  // --- NEW: State for Responsiveness ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [dragOverDayIndex, setDragOverDayIndex] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (location.state?.destinationName) {
      setAiForm((prevForm) => ({
        ...prevForm,
        destinationName: location.state.destinationName,
      }));
    }
  }, [location.state]);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
    body {
      margin: 0 !important;
      padding: 0 !important;
      margin-top: 0px !important;
      margin-bottom: 0px !important;
    }

    html {
      margin: 0 !important;
      padding: 0 !important;
    }

    input[type="date"]::-webkit-calendar-picker-indicator {
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%23fcd34d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>') !important;
      background-color: rgba(252, 211, 77, 0.2) !important;
      border-radius: 8px !important;
      padding: 6px !important;
      cursor: pointer !important;
      width: 20px !important;
      height: 20px !important;
      transition: all 0.3s ease !important;
    }

    input[type="date"]::-webkit-calendar-picker-indicator:hover {
      background-color: rgba(252, 211, 77, 0.4) !important;
      transform: scale(1.1);
    }

    /* Firefox */
    input[type="date"]::-moz-calendar-picker-indicator {
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%23fcd34d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>') !important;
      background-color: rgba(252, 211, 77, 0.2) !important;
      border-radius: 8px !important;
      padding: 6px !important;
      cursor: pointer !important;
      width: 20px !important;
      height: 20px !important;
      transition: all 0.3s ease !important;
    }

    input[type="date"]::-moz-calendar-picker-indicator:hover {
      background-color: rgba(252, 211, 77, 0.4) !important;
      transform: scale(1.1);
    }

    /* Other browsers... */

    input[type="date"] {
      color-scheme: dark;
    }
  `;
    style.id = "itinerary-planner-body-style";
    document.head.appendChild(style);
    return () => {
      const styleTag = document.getElementById("itinerary-planner-body-style");
      if (styleTag) document.head.removeChild(styleTag);
    };
  }, []);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number.isFinite(amount) ? amount : 0);
  }, []);

  const fetchItineraries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await enhancedItineraryAPI.getAll();
      // === CONSOLE LOG REMOVED ===
      // console.log("Fetched itineraries response:", response.data);
      setItineraries(response.data?.itineraries || response.data || []);
    } catch (err) {
      console.error("Fetch itineraries error:", err);
      setError(err.response?.data?.error || "Unable to load itineraries right now.");
    } finally {
      setLoading(false);
    }
  }, []); // Added missing dependency

  useEffect(() => {
    fetchItineraries();
  }, [fetchItineraries]);

  // --- UPDATED: Geolocation useEffect with better error handling ---
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        console.warn("Geolocation failed or was denied. User location will not be used as origin.");
        setUserLocation({ lat: null, lng: null }); // Explicitly set to null
      }
    );
  }, []); // Empty dependency array is correct, only run on mount

  useEffect(() => {
    const { startDate, endDate, basePerPerson, passengers, travelClass, season, addOns, taxesPct } =
      aiForm;

    if (!startDate || !endDate) {
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end < start) {
      return;
    }

    const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const result = await aiItineraryAPI.estimateCosts({
          basePerPerson,
          passengers,
          nights,
          travelClass,
          season,
          addOns,
          taxesPct,
          destination: aiForm.destinationName,
          interests: aiForm.interests,
        });
        if (!cancelled) {
          setAiCostResult(result);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Cost estimation failed", err);
          setAiError((prev) => prev || err.response?.data?.error || "Failed to estimate costs.");
        }
      } finally {
        // Cost loading complete
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [aiForm]);

  const numericTripBudget = useMemo(() => {
    if (tripBudgetInput === "" || tripBudgetInput == null) {
      return null;
    }
    const parsed = Number(tripBudgetInput);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  }, [tripBudgetInput]);

  const fallbackTripBudget = useMemo(() => {
    const passengerCount = Math.max(1, aiForm.passengers || 1);
    return Math.max(0, Math.round(aiForm.basePerPerson * passengerCount));
  }, [aiForm.basePerPerson, aiForm.passengers]);

  const effectiveTripBudget = useMemo(() => {
    if (numericTripBudget != null && numericTripBudget > 0) {
      return numericTripBudget;
    }
    return fallbackTripBudget;
  }, [numericTripBudget, fallbackTripBudget]);

  const hasEnteredTripBudget = numericTripBudget != null && numericTripBudget > 0;

  const perPersonTripBudget = useMemo(() => {
    const passengerCount = Math.max(1, aiForm.passengers || 1);
    return effectiveTripBudget / passengerCount;
  }, [effectiveTripBudget, aiForm.passengers]);

  const availabilityIntel = useMemo(() => {
    const insights = [];
    if (!aiForm.startDate || !aiForm.endDate) {
      return insights;
    }

    const start = new Date(aiForm.startDate);
    const end = new Date(aiForm.endDate);

    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
      return insights;
    }

    const today = new Date();
    const daysUntilTrip = Math.round((start - today) / (1000 * 60 * 60 * 24));
    const tripDuration = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));

    if (daysUntilTrip <= 21) {
      insights.push({
        level: "alert",
        message: `Trip starts in ${Math.max(daysUntilTrip, 0)} days — expect limited last-minute availability for popular stays and activities.`,
      });
    } else if (daysUntilTrip <= 45) {
      insights.push({
        level: "warning",
        message: `Trip begins in ${daysUntilTrip} days; lock in hotels and transport soon to avoid surge pricing.`,
      });
    }

    if (aiForm.season === "peak") {
      insights.push({
        level: "warning",
        message: "Peak season selected — book tickets and stays early to avoid sold-out dates.",
      });
    } else if (aiForm.season === "off") {
      insights.push({
        level: "positive",
        message:
          "Off-season travel — you may find flexible availability and better promotional rates.",
      });
    }

    if (tripDuration >= 10) {
      insights.push({
        level: "info",
        message: `Extended itinerary (${tripDuration} days) — consider splitting lodging across neighborhoods to improve availability.`,
      });
    }

    return insights;
  }, [aiForm.startDate, aiForm.endDate, aiForm.season]);

  const budgetIntel = useMemo(() => {
    if (!aiCostResult) {
      return [];
    }

    const insights = [];
    const passengers = Math.max(1, aiForm.passengers || 1);
    const aiPerPerson = aiCostResult.total / passengers;
    const variance =
      perPersonTripBudget > 0
        ? ((aiPerPerson - perPersonTripBudget) / perPersonTripBudget) * 100
        : 0;
    const remaining = effectiveTripBudget - aiCostResult.total;

    if (hasEnteredTripBudget) {
      if (variance > 10) {
        insights.push({
          level: "alert",
          message: `AI estimate is about ${variance.toFixed(0)}% above your per-person budget. Revisit optional add-ons or reduce trip length.`,
        });
      } else if (variance < -10) {
        insights.push({
          level: "positive",
          message: `You're trending ${Math.abs(variance).toFixed(0)}% under budget per traveler. Add experiences or upgrade stays if desired.`,
        });
      }
    } else {
      insights.push({
        level: "info",
        message: "Using auto-generated budget. Enter your own trip budget to activate guardrails.",
      });
    }

    if (remaining < 0) {
      insights.push({
        level: "alert",
        message: `Plan currently exceeds funding by ${formatCurrency(Math.abs(remaining))}. Trim activities or increase your budget.`,
      });
    } else if (remaining < effectiveTripBudget * 0.15) {
      insights.push({
        level: "warning",
        message: "Less than 15% buffer left. Hold some contingency for on-trip surprises.",
      });
    } else if (remaining > effectiveTripBudget * 0.25) {
      insights.push({
        level: "positive",
        message: "Healthy surplus detected — consider premium experiences or saving the remainder.",
      });
    }

    return insights;
  }, [
    aiCostResult,
    aiForm.passengers,
    perPersonTripBudget,
    hasEnteredTripBudget,
    effectiveTripBudget,
    formatCurrency,
  ]);

  const filteredItineraries = useMemo(() => {
    if (filter === "all") return itineraries;
    const now = new Date();
    return itineraries.filter((itinerary) => {
      const startDate = itinerary.passengerInfo?.travelDates?.start
        ? new Date(itinerary.passengerInfo.travelDates.start)
        : null;
      if (!startDate) return false;
      if (filter === "upcoming") return startDate > now;
      if (filter === "past") return startDate <= now;
      return true;
    });
  }, [itineraries, filter]);

  const routeStops = useMemo(() => {
    const stops = [];
    if (userLocation.lat != null && userLocation.lng != null) {
      stops.push({
        id: "origin",
        name: "Your Location",
        coordinates: userLocation,
        type: "origin",
      });
    }
    itineraryDays.forEach((day) => {
      day.places.forEach((place) => {
        // --- This check is now reliable thanks to the fix in handleGeneratePlan ---
        if (place?.coordinates?.lat != null && place?.coordinates?.lng != null) {
          stops.push({
            id: place.placeId || place.id,
            name: place.name,
            address: place.address,
            coordinates: place.coordinates,
            type: "stop",
          });
        }
      });
    });
    if (destinationDetails?.location?.coordinates) {
      const destCoords = destinationDetails.location.coordinates;
      if (
        !stops.some(
          (stop) =>
            Math.abs(stop.coordinates.lat - destCoords.lat) < 1e-6 &&
            Math.abs(stop.coordinates.lng - destCoords.lng) < 1e-6
        )
      ) {
        stops.push({
          id: "destination",
          name: destinationDetails.name,
          address: destinationDetails.location?.formatted,
          coordinates: destCoords,
          type: "destination",
        });
      }
    }
    return stops;
  }, [userLocation, itineraryDays, destinationDetails]);

  // --- UPDATED: Simplified useEffect for route calculation ---
  useEffect(() => {
    if (routeStops.length < 2) {
      setRoutingLoading(false);
      if (!routeStops.length) {
        setRouteSummary(null);
      }
      setMapRouteMetrics(null);
      return;
    }

    let cancelled = false;
    const routeMode = "drive"; // Default route mode

    const computeRoute = async () => {
      setRoutingLoading(true);
      setRouteError("");

      try {
        const legs = [];
        // Removed totalMeters and totalSeconds from here

        for (let index = 0; index < routeStops.length - 1; index += 1) {
          const from = routeStops[index];
          const to = routeStops[index + 1];
          if (!from?.coordinates || !to?.coordinates) {
            continue;
          }

          const cacheKey = `${from.coordinates.lat},${from.coordinates.lng}|${to.coordinates.lat},${to.coordinates.lng}|${routeMode}`;
          let legResult = distanceCacheRef.current.get(cacheKey);
          if (!legResult) {
            legResult = await geoAPI.distance({
              from: from.coordinates,
              to: to.coordinates,
              mode: routeMode,
            });
            distanceCacheRef.current.set(cacheKey, legResult);
          }

          if (cancelled) {
            return;
          }

          const distanceMeters = legResult?.distanceMeters ?? 0;
          const durationSeconds = legResult?.durationSeconds ?? 0;

          legs.push({
            from,
            to,
            distanceMeters,
            durationSeconds,
          });
          // Removed accumulation logic from here
        }

        if (!cancelled) {
          setRouteSummary({
            points: routeStops,
            legs,
            mode: routeMode,
          });
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Routing failed", err);
          setRouteError(err.response?.data?.error || err.message || "Failed to compute route.");
          setRouteSummary(null); // This was causing the card to disappear
        }
      } finally {
        if (!cancelled) {
          setRoutingLoading(false);
        }
      }
    };

    computeRoute();

    return () => {
      cancelled = true;
    };
  }, [routeStops]);

  // --- NEW: Geoapify Multi-Point Route Calculation ---
  useEffect(() => {
    if (!routeStops || routeStops.length < 2) {
      setGeoRouteData(null);
      setMapRouteMetrics(null);
      setGeoRouteError("");
      setGeoRouteLoading(false);
      return;
    }

    let cancelled = false;

    const calculateGeoapifyRoute = async () => {
      setGeoRouteError("");
      setGeoRouteLoading(true);

      try {
        const waypoints = routeStops
          .map((stop) => {
            const coords = stop.coordinates;
            if (coords && coords.lat != null && coords.lng != null) {
              return { lat: coords.lat, lng: coords.lng };
            }
            return null;
          })
          .filter(Boolean);

        if (waypoints.length < 2) {
          console.warn("Insufficient waypoints for Geoapify routing");
          setGeoRouteData(null);
          setGeoRouteError("Add at least two stops to calculate a route.");
          return;
        }

        console.log(`📍 Calculating Geoapify route for ${waypoints.length} waypoints...`);
        const routeData = await calculateMultiPointRoute(waypoints, "drive");

        if (cancelled) return;

        if (routeData) {
          console.log(
            `✅ Geoapify route: ${routeData.distanceKm.toFixed(2)} km, ${routeData.durationMinutes} mins`
          );
          setGeoRouteData(routeData);
        } else {
          console.warn("No route data returned from Geoapify");
          setGeoRouteData(null);
          setGeoRouteError("No route data returned from Geoapify.");
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("Geoapify routing failed:", error);
          setGeoRouteData(null);
          setGeoRouteError(
            error?.message || "Geoapify could not build a route for the selected waypoints."
          );
        }
      } finally {
        if (!cancelled) {
          setGeoRouteLoading(false);
        }
      }
    };

    calculateGeoapifyRoute();

    return () => {
      cancelled = true;
    };
  }, [routeStops]);

  const distanceMap = useMemo(() => {
    const map = new Map();
    if (routeSummary?.legs) {
      routeSummary.legs.forEach((leg) => {
        if (leg.to?.id) {
          map.set(leg.to.id, leg.distanceMeters);
        }
      });
    }
    return map;
  }, [routeSummary]);

  // --- NEW: useMemo hook to calculate totals (Fixes Green Arrow) ---
  const baseRouteTotals = useMemo(() => {
    if (geoRouteData) {
      const totalMeters = Number.parseFloat(
        geoRouteData.distance ?? geoRouteData.distanceMeters ?? geoRouteData.distanceKm * 1000
      );
      const totalSeconds = Number.parseFloat(
        geoRouteData.duration ?? geoRouteData.durationSeconds ?? geoRouteData.durationMinutes * 60
      );

      const meters = Number.isFinite(totalMeters) ? totalMeters : 0;
      const seconds = Number.isFinite(totalSeconds) ? totalSeconds : 0;

      if (meters > 0 || seconds > 0) {
        return { totalMeters: meters, totalSeconds: seconds };
      }
    }

    if (mapRouteMetrics?.distanceKm != null || mapRouteMetrics?.durationMinutes != null) {
      const totalMeters = Number.isFinite(mapRouteMetrics.distanceKm)
        ? mapRouteMetrics.distanceKm * 1000
        : 0;
      const totalSeconds = Number.isFinite(mapRouteMetrics.durationMinutes)
        ? mapRouteMetrics.durationMinutes * 60
        : 0;

      if (totalMeters > 0 || totalSeconds > 0) {
        return { totalMeters, totalSeconds };
      }
    }

    if (!routeSummary?.legs) {
      return { totalMeters: 0, totalSeconds: 0 };
    }

    let totalMeters = 0;
    let totalSeconds = 0;

    for (const leg of routeSummary.legs) {
      totalMeters += leg.distanceMeters ?? 0;
      totalSeconds += leg.durationSeconds ?? 0;
    }

    return { totalMeters, totalSeconds };
  }, [geoRouteData, mapRouteMetrics, routeSummary]);

  const lastRouteTotalsRef = useRef({ totalMeters: 0, totalSeconds: 0 });

  const routeTotals = useMemo(() => {
    const hasBaseTotals = baseRouteTotals.totalMeters > 0 || baseRouteTotals.totalSeconds > 0;

    if (hasBaseTotals) {
      lastRouteTotalsRef.current = baseRouteTotals;
      return baseRouteTotals;
    }

    if (geoRouteData?.distanceKm != null && geoRouteData?.durationMinutes != null) {
      const fallback = {
        totalMeters: Number(geoRouteData.distanceKm) * 1000,
        totalSeconds: Number(geoRouteData.durationMinutes) * 60,
      };

      if (fallback.totalMeters > 0 || fallback.totalSeconds > 0) {
        lastRouteTotalsRef.current = fallback;
        return fallback;
      }
    }

    return lastRouteTotalsRef.current;
  }, [baseRouteTotals, geoRouteData]);

  const legsCount = useMemo(() => {
    if (geoRouteData?.properties?.waypoints?.length > 1) {
      return geoRouteData.properties.waypoints.length - 1;
    }
    if (routeSummary?.legs?.length) {
      return routeSummary.legs.length;
    }
    return Math.max(routeStops.length - 1, 0);
  }, [geoRouteData, routeSummary, routeStops]);

  const polylinePreview = useMemo(() => {
    if (!geoRouteData?.polylineCoordinates?.length) {
      return null;
    }

    const coords = geoRouteData.polylineCoordinates;
    const formatPoint = (point) => {
      if (!Array.isArray(point) || point.length < 2) {
        return null;
      }
      const [lat, lng] = point;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
      }
      return `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
    };

    const start = formatPoint(coords[0]);
    const end = formatPoint(coords[coords.length - 1]);

    if (!start || !end) {
      return null;
    }

    return {
      summary: `${start} → ${end}`,
      points: coords.length,
    };
  }, [geoRouteData]);

  // --- NEW: Recalculate costs when route distance changes ---
  useEffect(() => {
    if (!aiForm.startDate || !aiForm.endDate || routeTotals.totalMeters === 0) {
      return;
    }

    const start = new Date(aiForm.startDate);
    const end = new Date(aiForm.endDate);
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end < start) {
      return;
    }

    const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const tripDistanceKm = routeTotals.totalMeters / 1000;

        const result = await aiItineraryAPI.estimateCosts({
          basePerPerson: aiForm.basePerPerson,
          passengers: aiForm.passengers,
          nights,
          travelClass: aiForm.travelClass,
          season: aiForm.season,
          addOns: aiForm.addOns,
          taxesPct: aiForm.taxesPct,
          destination: aiForm.destinationName,
          interests: aiForm.interests,
          tripDistanceKm,
        });
        if (!cancelled) {
          setAiCostResult(result);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Cost re-estimation failed", err);
          // Don't override existing error, just log
        }
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    routeTotals,
    aiForm.startDate,
    aiForm.endDate,
    aiForm.basePerPerson,
    aiForm.passengers,
    aiForm.travelClass,
    aiForm.season,
    aiForm.addOns,
    aiForm.taxesPct,
    aiForm.destinationName,
    aiForm.interests,
  ]);

  const loadSuggestedPlaces = useCallback(async (destination) => {
    if (!destination?.location?.coordinates) {
      setSuggestedPlaces([]);
      return [];
    }
    const coords = destination.location.coordinates;
    setPlacesLoading(true);
    setPlacesError("");
    try {
      // Priority 1: Fetch famous tourist spots
      const touristResponse = await enhancedPlacesAPI.getTouristPlaces({
        location: coords,
        radius: 60000,
        limit: 10,
      });

      // Priority 2: Fetch restaurants and diners
      const restaurantResponse = await enhancedPlacesAPI.getNearbyPlaces({
        location: coords,
        categories: "catering.restaurant,catering.fast_food,catering.cafe",
        radius: 60000,
        limit: 8,
      });

      // Priority 3: Fetch lodging
      const lodgingResponse = await enhancedPlacesAPI.getNearbyPlaces({
        location: coords,
        categories: "accommodation",
        radius: 60000,
        limit: 6,
      });

      const touristPlaces = (touristResponse.data?.places || []).map((p) => ({
        ...p,
        type: "attraction",
      }));
      const restaurantPlaces = (restaurantResponse.data?.places || []).map((p) => ({
        ...p,
        type: "restaurant",
      }));
      const lodgingPlaces = (lodgingResponse.data?.places || []).map((p) => ({
        ...p,
        type: "accommodation",
      }));

      const combinedPlaces = [...touristPlaces, ...restaurantPlaces, ...lodgingPlaces];
      setSuggestedPlaces(combinedPlaces);
      return combinedPlaces;
    } catch (err) {
      console.error("Suggested places load failed", err);
      setPlacesError(err.response?.data?.error || "Failed to load nearby places.");
      setSuggestedPlaces([]);
      return [];
    } finally {
      setPlacesLoading(false);
    }
  }, []);

  const handlePlaceSearch = useCallback(async () => {
    if (!placeSearchQuery.trim() || !destinationDetails?.location?.coordinates) {
      setPlaceSearchResults([]);
      return;
    }
    setPlaceSearchLoading(true);
    setPlaceSearchError("");
    setPlaceSearchResults([]);
    try {
      const response = await enhancedPlacesAPI.searchPlaces({
        query: placeSearchQuery,
        location: destinationDetails.location.coordinates,
        limit: 5,
      });
      const results = response.data?.suggestions || [];
      if (results.length === 0) {
        setPlaceSearchError("No results found for that search.");
      }
      setPlaceSearchResults(results);
    } catch (err) {
      console.error("Custom place search failed:", err);
      setPlaceSearchError(err.response?.data?.error || "Could not find that place.");
    } finally {
      setPlaceSearchLoading(false);
    }
  }, [placeSearchQuery, destinationDetails]);

  const addDay = () =>
    setItineraryDays((prev) => [...prev, { dayNumber: prev.length + 1, places: [] }]);
  const removeDay = (dayIndex) =>
    setItineraryDays((prev) =>
      prev.filter((_, i) => i !== dayIndex).map((d, i) => ({ ...d, dayNumber: i + 1 }))
    );

  const addPlaceToDay = useCallback((place, dayIndex = -1) => {
    const coords = place.coordinates || place.location?.coordinates || place.location;
    if (!coords?.lat || !coords?.lng) return;
    const placeToAdd = { ...place, coordinates: coords };
    const key = place.placeId || place.id;
    setItineraryDays((prev) => {
      if (prev.some((d) => d.places.some((p) => (p.placeId || p.id) === key))) return prev;
      const targetDay = dayIndex === -1 ? prev.length - 1 : dayIndex;
      return prev.map((d, i) =>
        i === targetDay ? { ...d, places: [...d.places, placeToAdd] } : d
      );
    });
  }, []);

  const removePlaceFromDay = useCallback((dayIndex, placeId) => {
    setItineraryDays((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? { ...d, places: d.places.filter((p) => (p.placeId || p.id) !== placeId) }
          : d
      )
    );
  }, []);

  // --- REMOVED `reorderPlaceInDay` as it's replaced by DND ---

  // --- NEW: DND-Kit Drag End Handler ---
  const handleDragEnd = useCallback((event, dayIndex) => {
    const { active, over } = event;

    // Check if the drag ended on a valid drop target
    if (over && active.id !== over.id) {
      setItineraryDays((prevDays) => {
        // Create a new copy of the days array
        const newDays = [...prevDays];
        const day = newDays[dayIndex];
        if (!day) return prevDays; // Safety check

        // Find the old and new index of the dragged item
        const oldIndex = day.places.findIndex((p) => (p.placeId || p.id) === active.id);
        const newIndex = day.places.findIndex((p) => (p.placeId || p.id) === over.id);

        if (oldIndex === -1 || newIndex === -1) return prevDays; // Safety check

        // Update the places array for the specific day
        newDays[dayIndex] = {
          ...day,
          places: arrayMove(day.places, oldIndex, newIndex),
        };

        return newDays;
      });
    }
  }, []); // `setItineraryDays` from useState is stable

  // --- NEW: Drop Handlers for Dragging Places from Suggestions to Days ---
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDropOnDay = useCallback(
    (dayIndex, e) => {
      e.preventDefault();
      setDragOverDayIndex(null);

      try {
        const data = e.dataTransfer.getData("application/json");
        if (!data) return;

        const draggedItem = JSON.parse(data);
        if (draggedItem.type === "place") {
          addPlaceToDay(draggedItem.place, dayIndex);
        }
      } catch (err) {
        console.error("Drop handler error:", err);
      }
    },
    [addPlaceToDay]
  );

  const handleDragEnter = useCallback((dayIndex) => {
    setDragOverDayIndex(dayIndex);
  }, []);

  const handleDragLeave = useCallback((dayIndex) => {
    setDragOverDayIndex(null);
  }, []);

  const handleGeneratePlan = useCallback(
    async (autoSave = false) => {
      setAiError("");
      setAiPlan(null);
      setAiLoading(true);
      setRouteSummary(null);
      setRouteError("");
      setSaveSuccess(false);
      distanceCacheRef.current.clear();
      setDestinationDetails(null);

      // --- NEW: This will hold the potentially updated budget ---
      const passengersCount = Math.max(1, aiForm.passengers || 1);
      let calculatedBaseBudget = aiForm.basePerPerson;

      try {
        if (!aiForm.destinationName?.trim()) {
          throw new Error("Enter a destination to generate a smart itinerary.");
        }
        if (!aiForm.startDate || !aiForm.endDate) {
          throw new Error("Select travel start and end dates to continue.");
        }
        if (new Date(aiForm.endDate) < new Date(aiForm.startDate)) {
          throw new Error("End date cannot be earlier than the start date.");
        }

        const geoRes = await geoAPI.geocode({ query: aiForm.destinationName });
        if (!geoRes || !geoRes.coordinates) {
          throw new Error("Could not find coordinates for the destination.");
        }

        let heroImageURL = null;
        try {
          const imageRes = await imageAPI.getDestinationImage(aiForm.destinationName);
          heroImageURL = imageRes.data.imageUrl;
        } catch (imgErr) {
          console.warn("Could not fetch hero image.", imgErr);
        }

        const destinationFull = {
          name: aiForm.destinationName,
          heroImageURL,
          location: {
            formatted: geoRes.formattedAddress,
            city: geoRes.city,
            state: geoRes.state,
            country: geoRes.country,
            coordinates: geoRes.coordinates,
          },
          formatted_address: geoRes.formattedAddress,
        };

        setDestinationDetails(destinationFull);

        // --- NEW: BUDGET CALCULATION LOGIC ---
        if (userLocation.lat && userLocation.lng && destinationFull.location?.coordinates) {
          try {
            const distanceRes = await geoAPI.distance({
              from: userLocation,
              to: destinationFull.location.coordinates,
              mode: "drive", // Using 'drive' for a ground-distance estimate
            });
            const distanceInKM = (distanceRes.distanceMeters || 0) / 1000;

            // Simple formula: 3000 base + 5 INR per KM for travel
            // Only apply if the distance is significant (e.g., > 100km)
            if (distanceInKM > 100) {
              const estimatedTravelCost = 3000 + distanceInKM * 5;
              calculatedBaseBudget = Math.round(estimatedTravelCost / 100) * 100; // Round to nearest 100
            } else {
              // For local trips, use a smaller base
              calculatedBaseBudget = 3500;
            }

            // Update the form state so the user sees the new budget
            setAiForm((prev) => ({ ...prev, basePerPerson: calculatedBaseBudget }));
            if (!hasManualTripBudget) {
              setTripBudgetInput(String(Math.round(calculatedBaseBudget * passengersCount)));
            }
          } catch (distErr) {
            console.warn("Could not calculate distance for budget:", distErr);
            // Fail silently, use the user's provided budget
            calculatedBaseBudget = aiForm.basePerPerson;
          }
        }
        if (!hasManualTripBudget) {
          setTripBudgetInput(String(Math.round(calculatedBaseBudget * passengersCount)));
        }
        // --- END OF BUDGET CALCULATION ---

        // Scroll AFTER state is set
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);

        setItineraryDays([{ dayNumber: 1, places: [] }]);
        const loadedPlaces = await loadSuggestedPlaces(destinationFull);
        if (loadedPlaces.length) {
          // --- FIX: Ensure coordinates are correctly formatted for initial places ---
          const initialPlacesRaw = loadedPlaces.slice(0, Math.min(4, loadedPlaces.length));
          const initialPlaces = initialPlacesRaw
            .map((place) => {
              const coords = place.coordinates || place.location?.coordinates || place.location;
              if (!coords || coords.lat == null || coords.lng == null) {
                console.warn(
                  "Initial suggested place missing valid coordinates:",
                  place.name,
                  coords
                );
                return { ...place, coordinates: { lat: undefined, lng: undefined } }; // Add placeholder if invalid
              }
              return { ...place, coordinates: { lat: coords.lat, lng: coords.lng } }; // Normalize to {lat, lng}
            })
            .filter((p) => p.coordinates.lat != null && p.coordinates.lng != null); // Filter out any that were truly invalid

          if (initialPlaces.length > 0) {
            setItineraryDays([{ dayNumber: 1, places: initialPlaces }]);
          } else {
            console.warn("No valid initial places found after coordinate check.");
          }
        }

        const nights = Math.max(
          1,
          Math.round(
            (new Date(aiForm.endDate).getTime() - new Date(aiForm.startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        );

        const payload = {
          destination: destinationFull,
          startDate: aiForm.startDate,
          endDate: aiForm.endDate,
          passengers: aiForm.passengers,
          travelStyle: aiForm.travelStyle,
          interests: aiForm.interests,
          save: autoSave,
          userLocation: userLocation.lat && userLocation.lng ? userLocation : null,
          costInputs: {
            // --- UPDATED: Use the calculated budget ---
            basePerPerson: calculatedBaseBudget,
            passengers: aiForm.passengers,
            nights,
            travelClass: aiForm.travelClass,
            season: aiForm.season,
            taxesPct: aiForm.taxesPct,
            addOns: aiForm.addOns,
          },
        };

        const response = await aiItineraryAPI.generatePlan(payload);
        const plan = response.data?.plan || response.data?.itinerary || response.data;
        setAiPlan(plan);
        if (response.data?.costEstimate) {
          setAiCostResult(response.data.costEstimate);
        }

        if (autoSave) {
          await fetchItineraries();
          setActiveTab("dashboard");
        }
      } catch (err) {
        setAiError(err.response?.data?.error || err.message || "Failed to generate plan.");
      } finally {
        setAiLoading(false);
      }
    },
    // --- UPDATED dependencies ---
    [
      aiForm,
      userLocation,
      loadSuggestedPlaces,
      fetchItineraries,
      hasManualTripBudget,
      setTripBudgetInput,
    ]
  );

  const handlePersistItinerary = useCallback(async () => {
    if (!aiPlan) {
      setAiError("Generate an AI itinerary before saving.");
      return;
    }

    if (!destinationDetails) {
      setAiError("Destination details are missing. Regenerate the plan and try again.");
      return;
    }

    if (!aiForm.startDate || !aiForm.endDate) {
      setAiError("Travel dates are required to store your itinerary.");
      return;
    }

    setSaveLoading(true);
    setSaveSuccess(false);
    setAiError(""); // Clear previous errors

    try {
      const destinationLocation = destinationDetails.location || {};
      const destinationCoordinates =
        destinationLocation.coordinates ||
        (destinationLocation.lat != null && destinationLocation.lng != null
          ? { lat: destinationLocation.lat, lng: destinationLocation.lng }
          : undefined);

      const placeDistanceMap = new Map();
      if (routeSummary?.legs?.length) {
        routeSummary.legs.forEach((leg) => {
          if (leg.to?.type === "stop" && leg.distanceMeters != null) {
            const key = leg.to.id;
            placeDistanceMap.set(
              key,
              `${(leg.distanceMeters / 1000).toFixed(1)} km from ${leg.from.name}`
            );
          }
        });
      }

      const costEstimatePayload = aiCostResult
        ? {
            perPerson: aiCostResult.perPerson ?? aiCostResult.perPersonCost ?? 0,
            total: aiCostResult.total ?? aiCostResult.totalCost ?? 0,
            tax: aiCostResult.tax ?? aiCostResult.taxAmount ?? 0,
          }
        : { perPerson: 0, total: 0, tax: 0 };

      const payload = {
        destination: {
          ...destinationDetails,
          location: {
            ...destinationLocation,
            coordinates: destinationCoordinates,
          },
        },
        aiPlan,
        passengerInfo: {
          passengers: aiForm.passengers,
          travelClass: aiForm.travelStyle,
          travelDates: { start: aiForm.startDate, end: aiForm.endDate },
        },
        touristPlacesByDay: itineraryDays.map((day) => ({
          dayNumber: day.dayNumber,
          places: day.places.map((place) => {
            const key = place.placeId || place.id;
            // --- Ensure coordinates are included in saved place data ---
            const coords = place.coordinates || place.location?.coordinates || place.location;
            return {
              placeId: key,
              name: place.name,
              address: place.address,
              rating: place.rating ?? null,
              categories: place.categories || [],
              // Add coordinates if they exist
              coordinates:
                coords && coords.lat != null && coords.lng != null
                  ? { lat: coords.lat, lng: coords.lng }
                  : undefined,
              distanceText:
                placeDistanceMap.get(key) ||
                (place.distance ? `${Math.round(place.distance)} m from center` : ""),
              heroImage: place.heroImage,
            };
          }),
        })),
        costEstimate: costEstimatePayload,
        dateAdded: new Date().toISOString(),
      };

      // --- ADDED CONSOLE LOG FOR DEBUGGING SAVE ---
      console.log("--- Payload being sent to save API:", JSON.stringify(payload, null, 2));

      await enhancedItineraryAPI.saveCompletePlan(payload);
      setSaveSuccess(true);
      await fetchItineraries();
      setActiveTab("dashboard");
    } catch (err) {
      // --- IMPROVED ERROR LOGGING ---
      console.error("Save itinerary failed:", err); // Log the full error object
      console.error("Error response data:", err.response?.data); // Log specific response data if available
      setAiError(
        `Failed to save: ${err.response?.data?.error || err.message || "Unknown error"}. Check console & server logs.`
      ); // More detailed error
    } finally {
      setSaveLoading(false);
      setTimeout(() => setSaveSuccess(false), 3500); // Increased timeout slightly
    }
  }, [
    aiPlan,
    destinationDetails,
    aiForm,
    itineraryDays,
    aiCostResult,
    routeSummary,
    fetchItineraries,
  ]);

  const handleDeleteItinerary = useCallback(
    async (id) => {
      try {
        await enhancedItineraryAPI.delete(id);
        await fetchItineraries();
        setShowDeleteConfirm(false);
        setItineraryToDelete(null);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to delete itinerary");
      }
    },
    [fetchItineraries]
  );

  const generateShareText = useCallback(
    (itinerary) => {
      const destination = itinerary.destination?.name || "Unknown Destination";
      const dates = itinerary.passengerInfo?.travelDates?.start
        ? `from ${new Date(itinerary.passengerInfo.travelDates.start).toLocaleDateString()}`
        : "";
      const cost = itinerary.costEstimate?.total
        ? `Estimated cost: ${formatCurrency(itinerary.costEstimate.total)}`
        : "";

      return `🌍 Planning a trip to ${destination} ${dates}! ${cost} ✈️ #TravelPlanner #TourEase`;
    },
    [formatCurrency]
  );

  const generateShareUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin + "/itinerary-planner";
  }, []);

  const handleShare = useCallback(
    (platform, itinerary) => {
      if (!itinerary) return;

      const text = generateShareText(itinerary);
      const url = generateShareUrl();
      const encodedText = encodeURIComponent(text);
      const encodedUrl = encodeURIComponent(url);

      let shareUrl = "";

      switch (platform) {
        case "facebook":
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
          break;
        case "twitter":
          shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
          break;
        case "whatsapp":
          shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
          break;
        case "linkedin":
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
          break;
        case "email":
          shareUrl = `mailto:?subject=${encodeURIComponent("Check out my travel itinerary!")}&body=${encodedText}%20${encodedUrl}`;
          break;
        default:
          return;
      }

      window.open(shareUrl, "_blank", "width=600,height=400");
    },
    [generateShareText, generateShareUrl]
  );

  const handleCopyLink = useCallback(() => {
    const url = generateShareUrl();
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  }, [generateShareUrl]);

  if (!user) {
    return null;
  }

  return (
    <div
      style={{
        ...styles.itineraryPlannerPage,
        minHeight: "100vh",
        background: `linear-gradient(135deg, rgba(2, 6, 23, 0.85), rgba(15, 23, 42, 0.88)), url("/assets/8.jpg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        color: "#e2e8f0",
      }}
    >
      <Navbar />
      <main
        style={{
          width: "100%",
          margin: "0",
          padding: "0 0 0 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ ...styles.heroSectionWrapper, paddingTop: "130px" }}>
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              ...styles.baseSection,
              ...styles.heroSectionInner,
              minHeight: "60vh",
              textAlign: "center",
              color: "#f8fafc",
            }}
          >
            <h1
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                fontWeight: 800,
                color: "#fcd34d",
                marginBottom: "20px",
                textShadow: "0 0 24px rgba(250, 204, 21, 0.3)",
              }}
            >
              Design Tomorrow’s Journeys with AI Intelligence
            </h1>
            <p
              style={{
                fontSize: "1.1rem",
                color: "#cbd5f5",
                maxWidth: "700px",
                margin: "0 auto 50px",
                lineHeight: 1.7,
              }}
            >
              Create, refine, and save cinematic travel plans with adaptive AI routing, live
              budgeting, and curated highlights — all in one place.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "24px",
                flexWrap: "wrap",
              }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab("planner")}
                style={{
                  padding: "16px 36px",
                  borderRadius: "14px",
                  border: "none",
                  background: "linear-gradient(135deg, #3b82f6, #22d3ee)",
                  color: "#020617",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  cursor: "pointer",
                  boxShadow: "0 20px 40px rgba(34, 197, 249, 0.35)",
                }}
              >
                AI Planning Studio
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab("dashboard")}
                style={{
                  padding: "16px 36px",
                  borderRadius: "14px",
                  border: "none",
                  background: "linear-gradient(135deg, #fcd34d, #f59e0b)",
                  color: "#0f172a",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  cursor: "pointer",
                  boxShadow: "0 20px 40px rgba(252, 211, 77, 0.3)",
                }}
              >
                Saved Itineraries
              </motion.button>
            </div>
          </motion.section>
        </div>

        <div style={styles.contentWrapperOuter}>
          <div style={styles.contentWrapperInner}>
            <section style={{ ...styles.baseSection, display: "grid", gap: "32px" }}>
              {activeTab === "planner" ? (
                <motion.section
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    ...styles.baseSection,
                    display: "grid",
                    gap: "28px",
                    padding: "0",
                    width: "100%",
                  }}
                >
                  <div style={styles.planYourTripContainer}>
                    <div style={styles.planYourTripBox}>
                      <h3 style={{ color: "#fcd34d", marginBottom: "16px", fontSize: "1.4rem" }}>
                        Plan your trip
                      </h3>
                      <div style={{ display: "grid", gap: "14px" }}>
                        <div>
                          <label
                            style={{
                              color: "#fcd34d",
                              fontSize: "0.9rem",
                              fontWeight: 600,
                              marginBottom: "6px",
                              display: "block",
                            }}
                          >
                            Destination Name
                          </label>
                          <input
                            placeholder="Destination name (e.g., Kyoto)"
                            value={aiForm.destinationName}
                            onChange={(e) =>
                              setAiForm((p) => ({ ...p, destinationName: e.target.value }))
                            }
                            onFocus={() => setFocusedInput("destinationName")}
                            onBlur={() => setFocusedInput(null)}
                            style={{
                              ...baseInputStyle,
                              ...(focusedInput === "destinationName" && activeInputStyle),
                            }}
                          />
                        </div>
                        <div
                          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}
                        >
                          <div>
                            <label
                              style={{
                                color: "#fcd34d",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                marginBottom: "6px",
                                display: "block",
                              }}
                            >
                              Start Date
                            </label>
                            <div
                              style={{
                                position: "relative",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <input
                                type="date"
                                value={aiForm.startDate}
                                onChange={(e) =>
                                  setAiForm((p) => ({ ...p, startDate: e.target.value }))
                                }
                                onFocus={() => setFocusedInput("startDate")}
                                onBlur={() => setFocusedInput(null)}
                                style={{
                                  ...baseInputStyle,
                                  padding: "12px 12px 12px 40px",
                                  cursor: "pointer",
                                  ...(focusedInput === "startDate" && activeInputStyle),
                                }}
                              />
                              <IoCalendar
                                size={18}
                                style={{
                                  position: "absolute",
                                  left: 12,
                                  pointerEvents: "none",
                                  color: "#fcd34d",
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <label
                              style={{
                                color: "#fcd34d",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                marginBottom: "6px",
                                display: "block",
                              }}
                            >
                              End Date
                            </label>
                            <div
                              style={{
                                position: "relative",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <input
                                type="date"
                                value={aiForm.endDate}
                                onChange={(e) =>
                                  setAiForm((p) => ({ ...p, endDate: e.target.value }))
                                }
                                onFocus={() => setFocusedInput("endDate")}
                                onBlur={() => setFocusedInput(null)}
                                style={{
                                  ...baseInputStyle,
                                  padding: "12px 12px 12px 40px",
                                  cursor: "pointer",

                                  ...(focusedInput === "endDate" && activeInputStyle),
                                }}
                              />
                              <IoCalendar
                                size={18}
                                style={{
                                  position: "absolute",
                                  left: 12,
                                  pointerEvents: "none",
                                  color: "#60a5fa",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div
                          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}
                        >
                          <div>
                            <label
                              style={{
                                color: "#fcd34d",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                marginBottom: "6px",
                                display: "block",
                              }}
                            >
                              Number of Passengers
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={aiForm.passengers}
                              onChange={(e) => {
                                const nextPassengers = Math.max(1, Number(e.target.value) || 1);
                                setAiForm((prev) => {
                                  const updated = { ...prev, passengers: nextPassengers };
                                  if (tripBudgetInput !== "") {
                                    const numericBudget = Number(tripBudgetInput);
                                    if (!Number.isNaN(numericBudget)) {
                                      updated.basePerPerson =
                                        Math.round(
                                          (numericBudget / Math.max(1, nextPassengers)) * 100
                                        ) / 100;
                                    }
                                  }
                                  return updated;
                                });
                              }}
                              onFocus={() => setFocusedInput("passengers")}
                              onBlur={() => setFocusedInput(null)}
                              style={{
                                ...baseInputStyle,
                                ...(focusedInput === "passengers" && activeInputStyle),
                              }}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                color: "#fcd34d",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                marginBottom: "6px",
                                display: "block",
                              }}
                            >
                              Travel Style
                            </label>
                            <select
                              value={aiForm.travelStyle}
                              onChange={(e) =>
                                setAiForm((p) => ({ ...p, travelStyle: e.target.value }))
                              }
                              onFocus={() => setFocusedInput("travelStyle")}
                              onBlur={() => setFocusedInput(null)}
                              style={{
                                ...baseInputStyle,
                                ...(focusedInput === "travelStyle" && activeInputStyle),
                              }}
                            >
                              {[
                                "economy",
                                "standard",
                                "business",
                                "royal",
                                "heritage",
                                "adventure",
                                "wellness",
                              ].map((v) => (
                                <option key={v} value={v}>
                                  {v}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label
                              style={{
                                color: "#fcd34d",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                marginBottom: "6px",
                                display: "block",
                              }}
                            >
                              Interests (optional)
                            </label>
                            <textarea
                              placeholder="e.g., hiking, museums, street food, local markets..."
                              value={aiForm.interests}
                              onChange={(e) =>
                                setAiForm((p) => ({ ...p, interests: e.target.value }))
                              }
                              onFocus={() => setFocusedInput("interests")}
                              onBlur={() => setFocusedInput(null)}
                              style={{
                                ...baseInputStyle,
                                ...(focusedInput === "interests" && activeInputStyle),
                                height: "80px",
                                resize: "vertical",
                              }}
                            />
                          </div>
                        </div>
                        <h4 style={{ color: "#fcd34d", margin: "12px 0 0" }}>Cost details</h4>
                        <div>
                          <label
                            style={{
                              color: "#fcd34d",
                              fontSize: "0.9rem",
                              fontWeight: 600,
                              marginBottom: "6px",
                              display: "block",
                            }}
                          >
                            Your Trip Budget (INR)
                          </label>
                          <input
                            type="number"
                            min={0}
                            placeholder="e.g., 125000"
                            value={tripBudgetInput}
                            onChange={(e) => {
                              const rawValue = e.target.value;
                              if (rawValue === "") {
                                setTripBudgetInput("");
                                setHasManualTripBudget(false);
                                return;
                              }
                              setTripBudgetInput(rawValue);
                              setHasManualTripBudget(true);

                              const numericBudget = Number(rawValue);
                              if (!Number.isNaN(numericBudget)) {
                                setAiForm((prev) => ({
                                  ...prev,
                                  basePerPerson:
                                    Math.round(
                                      (numericBudget / Math.max(1, prev.passengers || 1)) * 100
                                    ) / 100,
                                }));
                              }
                            }}
                            onFocus={() => setFocusedInput("tripBudget")}
                            onBlur={() => setFocusedInput(null)}
                            style={{
                              ...baseInputStyle,
                              ...(focusedInput === "tripBudget" && activeInputStyle),
                            }}
                          />
                          <div
                            style={{
                              color: "#9ca3af",
                              fontSize: "0.8rem",
                              marginTop: "6px",
                              lineHeight: 1.4,
                            }}
                          >
                            We will auto-balance {aiForm.passengers || 1} travelers at approximately{" "}
                            {formatCurrency(perPersonTripBudget)} per person.
                          </div>
                        </div>
                        <div
                          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}
                        >
                          <div>
                            <label
                              style={{
                                color: "#fcd34d",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                marginBottom: "6px",
                                display: "block",
                              }}
                            >
                              Travel Class
                            </label>
                            <select
                              value={aiForm.travelClass}
                              onChange={(e) =>
                                setAiForm((p) => ({ ...p, travelClass: e.target.value }))
                              }
                              onFocus={() => setFocusedInput("travelClass")}
                              onBlur={() => setFocusedInput(null)}
                              style={{
                                ...baseInputStyle,
                                ...(focusedInput === "travelClass" && activeInputStyle),
                              }}
                            >
                              {[
                                "economy",
                                "standard",
                                "business",
                                "royal",
                                "heritage",
                                "adventure",
                                "wellness",
                              ].map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label
                              style={{
                                color: "#fcd34d",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                marginBottom: "6px",
                                display: "block",
                              }}
                            >
                              Season
                            </label>
                            <select
                              value={aiForm.season}
                              onChange={(e) => setAiForm((p) => ({ ...p, season: e.target.value }))}
                              onFocus={() => setFocusedInput("season")}
                              onBlur={() => setFocusedInput(null)}
                              style={{
                                ...baseInputStyle,
                                ...(focusedInput === "season" && activeInputStyle),
                              }}
                            >
                              {["off", "standard", "peak"].map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: "12px",
                          }}
                        >
                          <div>
                            <label
                              style={{
                                color: "#fcd34d",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                marginBottom: "6px",
                                display: "block",
                              }}
                            >
                              Visa Cost
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={aiForm.addOns.visa}
                              onChange={(e) =>
                                setAiForm((p) => ({
                                  ...p,
                                  addOns: { ...p.addOns, visa: Number(e.target.value) },
                                }))
                              }
                              onFocus={() => setFocusedInput("visa")}
                              onBlur={() => setFocusedInput(null)}
                              style={{
                                ...baseInputStyle,
                                ...(focusedInput === "visa" && activeInputStyle),
                              }}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                color: "#fcd34d",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                marginBottom: "6px",
                                display: "block",
                              }}
                            >
                              Insurance Cost
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={aiForm.addOns.insurance}
                              onChange={(e) =>
                                setAiForm((p) => ({
                                  ...p,
                                  addOns: { ...p.addOns, insurance: Number(e.target.value) },
                                }))
                              }
                              onFocus={() => setFocusedInput("insurance")}
                              onBlur={() => setFocusedInput(null)}
                              style={{
                                ...baseInputStyle,
                                ...(focusedInput === "insurance" && activeInputStyle),
                              }}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                color: "#fcd34d",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                marginBottom: "6px",
                                display: "block",
                              }}
                            >
                              Emergency Buffer
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={aiForm.addOns.buffer}
                              onChange={(e) =>
                                setAiForm((p) => ({
                                  ...p,
                                  addOns: { ...p.addOns, buffer: Number(e.target.value) },
                                }))
                              }
                              onFocus={() => setFocusedInput("buffer")}
                              onBlur={() => setFocusedInput(null)}
                              style={{
                                ...baseInputStyle,
                                ...(focusedInput === "buffer" && activeInputStyle),
                              }}
                            />
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <label style={{ color: "#cbd5f5", fontSize: "0.9rem", minWidth: "70px" }}>
                            Taxes %
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={1}
                            step={0.01}
                            value={aiForm.taxesPct}
                            onChange={(e) =>
                              setAiForm((p) => ({ ...p, taxesPct: Number(e.target.value) }))
                            }
                            onFocus={() => setFocusedInput("taxes")}
                            onBlur={() => setFocusedInput(null)}
                            style={{
                              ...baseInputStyle,
                              flex: 1,
                              ...(focusedInput === "taxes" && activeInputStyle),
                            }}
                          />
                        </div>

                        <h4 style={{ color: "#fcd34d", margin: "18px 0 0" }}>Your location</h4>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <IoLocation size={20} color="#f472b6" />
                          <span style={{ color: "#cbd5f5", flex: 1 }}>
                            {userLocation.lat && userLocation.lng
                              ? `Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}`
                              : "Location not set"}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition((pos) => {
                                  setUserLocation({
                                    lat: pos.coords.latitude,
                                    lng: pos.coords.longitude,
                                  });
                                });
                              }
                            }}
                            style={{
                              padding: "8px 16px",
                              borderRadius: "10px",
                              border: "1px solid rgba(250, 204, 21, 0.45)",
                              background: "rgba(120, 113, 198, 0.1)",
                              color: "#fde68a",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Use my location
                          </motion.button>
                        </div>

                        <motion.button
                          whileHover={{ scale: aiLoading ? 1 : 1.02 }}
                          whileTap={{ scale: aiLoading ? 1 : 0.96 }}
                          onClick={() => handleGeneratePlan(false)}
                          disabled={aiLoading}
                          style={{
                            padding: "14px",
                            borderRadius: "14px",
                            border: "none",
                            background: "linear-gradient(135deg, #3b82f6, #22d3ee)",
                            color: "#0f172a",
                            fontWeight: 700,
                            fontSize: "1rem",
                            cursor: aiLoading ? "not-allowed" : "pointer",
                            opacity: aiLoading ? 0.7 : 1,
                            marginTop: "16px",
                          }}
                        >
                          {aiLoading ? "Crafting your itinerary..." : "Generate AI plan"}
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: !saveLoading && aiPlan ? 1.02 : 1 }}
                          whileTap={{ scale: !saveLoading && aiPlan ? 0.96 : 1 }}
                          onClick={handlePersistItinerary}
                          disabled={saveLoading || !aiPlan}
                          style={{
                            padding: "14px",
                            borderRadius: "14px",
                            border: "none",
                            background: aiPlan
                              ? "linear-gradient(135deg, #fcd34d, #f59e0b)"
                              : "rgba(2, 6, 23, 0.5)",
                            color: "#0f172a",
                            fontWeight: 700,
                            fontSize: "1rem",
                            cursor: saveLoading || !aiPlan ? "not-allowed" : "pointer",
                            opacity: saveLoading || !aiPlan ? 0.6 : 1,
                            marginTop: "8px",
                          }}
                        >
                          {saveLoading ? "Saving itinerary..." : "Save to dashboard"}
                        </motion.button>
                        {saveSuccess && (
                          <div
                            style={{
                              color: "#34d399",
                              background: "rgba(34, 197, 94, 0.12)",
                              border: "1px solid rgba(34, 197, 94, 0.32)",
                              borderRadius: "12px",
                              padding: "10px 14px",
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <IoCheckmarkCircle size={18} /> Saved! Find it under “Saved
                            itineraries”.
                          </div>
                        )}
                        {aiError && (
                          <div
                            style={{
                              color: "#fca5a5",
                              background: "rgba(239, 68, 68, 0.15)",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                              borderRadius: "12px",
                              padding: "10px 14px",
                              fontWeight: 500,
                            }}
                          >
                            {aiError}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {destinationDetails && (
                    <div
                      ref={resultsRef}
                      style={{
                        padding: "28px",
                        background: "rgba(15, 23, 42, 0.92)",
                        borderRadius: "20px",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        boxShadow: "0 26px 60px rgba(2, 6, 23, 0.7)",
                        display: "grid",
                        gap: "22px",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gap: "8px",
                        }}
                      >
                        <h3 style={{ color: "#93c5fd", margin: "0 0 8px 0", fontSize: "1.5rem" }}>
                          Smart route & highlights
                        </h3>
                        <span style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
                          Powered by Geoapify live data
                        </span>
                      </div>

                      {/* --- UPDATED: Layout and Responsiveness --- */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", // Dynamic columns
                          gap: "20px",
                          // Removed broken @media query
                        }}
                      >
                        {/* --- NEW: Wrapper for Left Column --- */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                          {/* --- Item 1: Discover & Search --- */}
                          <div
                            style={{
                              background: "rgba(2, 6, 23, 0.75)",
                              borderRadius: "18px",
                              border: "1px solid rgba(212, 175, 55, 0.3)",
                              padding: "18px",
                              display: "grid",
                              gap: "12px",
                              maxHeight: "600px",
                              overflowY: "auto",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <h4 style={{ color: "#fcd34d", margin: 0 }}>Discover & Search</h4>
                              {(placesLoading || placeSearchLoading) && (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                  style={{
                                    width: "22px",
                                    height: "22px",
                                    borderRadius: "50%",
                                    border: "2px solid rgba(252, 211, 77, 0.25)",
                                    borderTop: "2px solid #fcd34d",
                                  }}
                                />
                              )}
                            </div>
                            <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: 0 }}>
                              Curated attractions within 60km of {destinationDetails.name}.
                            </p>

                            {/* Search Input Section */}
                            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                              <input
                                placeholder="Search for a specific place..."
                                value={placeSearchQuery}
                                onChange={(e) => setPlaceSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handlePlaceSearch()}
                                style={{
                                  flex: 1,
                                  padding: "10px 12px",
                                  background: "rgba(15, 23, 42, 0.8)",
                                  border: "1px solid rgba(252, 211, 77, 0.3)",
                                  borderRadius: "10px",
                                  color: "#f8fafc",
                                  fontSize: "0.9rem",
                                  outline: "none",
                                  transition: "all 0.3s ease",
                                }}
                                onFocus={(e) => {
                                  e.target.style.borderColor = "rgba(252, 211, 77, 0.6)";
                                  e.target.style.boxShadow = "0 0 12px rgba(252, 211, 77, 0.2)";
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = "rgba(252, 211, 77, 0.3)";
                                  e.target.style.boxShadow = "none";
                                }}
                              />
                              <motion.button
                                onClick={handlePlaceSearch}
                                disabled={placeSearchLoading || !placeSearchQuery.trim()}
                                whileHover={{ scale: placeSearchLoading ? 1 : 1.05 }}
                                whileTap={{ scale: placeSearchLoading ? 1 : 0.95 }}
                                style={{
                                  padding: "10px 16px",
                                  background: placeSearchLoading
                                    ? "rgba(252, 211, 77, 0.3)"
                                    : "linear-gradient(135deg, #d4af37 0%, #fcd34d 100%)",
                                  color: placeSearchLoading ? "#94a3b8" : "#0f172a",
                                  border: "none",
                                  borderRadius: "10px",
                                  fontWeight: 600,
                                  cursor: placeSearchLoading ? "not-allowed" : "pointer",
                                  transition: "all 0.3s ease",
                                }}
                              >
                                {placeSearchLoading ? "..." : "Search"}
                              </motion.button>
                            </div>

                            {placeSearchError && (
                              <div
                                style={{
                                  color: "#fca5a5",
                                  background: "rgba(239, 68, 68, 0.12)",
                                  border: "1px solid rgba(239, 68, 68, 0.3)",
                                  borderRadius: "12px",
                                  padding: "10px",
                                }}
                              >
                                {placeSearchError}
                              </div>
                            )}

                            {placesError && (
                              <div
                                style={{
                                  color: "#fca5a5",
                                  background: "rgba(239, 68, 68, 0.12)",
                                  border: "1px solid rgba(239, 68, 68, 0.3)",
                                  borderRadius: "12px",
                                  padding: "10px",
                                }}
                              >
                                {placesError}
                              </div>
                            )}

                            <div style={{ display: "grid", gap: "12px" }}>
                              {placeSearchResults.length > 0 && (
                                <div style={{ display: "grid", gap: "8px" }}>
                                  <h5
                                    style={{
                                      color: "#fcd34d",
                                      margin: "4px 0",
                                      fontSize: "0.95rem",
                                    }}
                                  >
                                    Search Results - Drag to add ({placeSearchResults.length})
                                  </h5>
                                  {placeSearchResults.map((place) => {
                                    const placeKey = place.placeId || place.id;
                                    const alreadySelected = itineraryDays.some((day) =>
                                      day.places.some((p) => (p.placeId || p.id) === placeKey)
                                    );
                                    return (
                                      <div key={placeKey}>
                                        <DraggablePlaceCard
                                          place={place}
                                          isAlreadySelected={alreadySelected}
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {suggestedPlaces.length > 0 && (
                                <div style={{ display: "grid", gap: "8px" }}>
                                  <h5
                                    style={{
                                      color: "#fcd34d",
                                      margin: "4px 0",
                                      fontSize: "0.95rem",
                                    }}
                                  >
                                    Suggestions (drag to add)
                                  </h5>
                                  {suggestedPlaces.map((place) => {
                                    const placeKey = place.placeId || place.id;
                                    const alreadySelected = itineraryDays.some((day) =>
                                      day.places.some((p) => (p.placeId || p.id) === placeKey)
                                    );
                                    return (
                                      <div key={placeKey}>
                                        <DraggablePlaceCard
                                          place={place}
                                          isAlreadySelected={alreadySelected}
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {suggestedPlaces.length === 0 &&
                                placeSearchResults.length === 0 &&
                                !placesLoading &&
                                !placeSearchLoading &&
                                !placesError &&
                                !placeSearchError && (
                                  <div style={{ color: "#9ca3af" }}>
                                    No places found yet. Try searching or generate a plan.
                                  </div>
                                )}
                            </div>
                          </div>
                          {/* --- End Item 1 --- */}

                          {/* --- Item 2: Live Map (Moved) --- */}
                          <div
                            style={{
                              background: "rgba(2, 6, 23, 0.75)",
                              borderRadius: "18px",
                              border: "1px solid rgba(212, 175, 55, 0.3)",
                              padding: "18px",
                              display: "grid",
                              gap: "12px",
                              minHeight: "300px",
                            }}
                          >
                            <h4 style={{ color: "#fbbf24", margin: 0, marginBottom: "8px" }}>
                              Live map preview
                            </h4>
                            <p style={{ color: "#94a3b8", fontSize: "0.88rem", margin: 0 }}>
                              Explore the destination and plan your route visually.
                            </p>
                            {destinationDetails.location?.coordinates ? (
                              <>
                                <InteractiveMap
                                  coordinates={destinationDetails.location.coordinates}
                                  name={destinationDetails.name}
                                  address={destinationDetails.location?.formatted}
                                  stops={routeSummary?.points || []}
                                  legs={routeSummary?.legs || []}
                                  userLocation={userLocation}
                                  nearbyPlaces={suggestedPlaces}
                                  onRouteCalculated={(metrics) => {
                                    if (
                                      metrics &&
                                      typeof metrics.distanceKm === "number" &&
                                      Number.isFinite(metrics.distanceKm) &&
                                      typeof metrics.durationMinutes === "number" &&
                                      Number.isFinite(metrics.durationMinutes)
                                    ) {
                                      setMapRouteMetrics(metrics);
                                    }
                                  }}
                                  precomputedRoute={geoRouteData}
                                />
                              </>
                            ) : (
                              <div
                                style={{
                                  marginTop: "2px",
                                  color: "#94a3b8",
                                  background: "rgba(15, 23, 42, 0.7)",
                                  borderRadius: "14px",
                                  border: "1px solid rgba(148, 163, 184, 0.25)",
                                  padding: "14px",
                                }}
                              >
                                Map preview unavailable for this destination.
                              </div>
                            )}
                          </div>
                          {/* --- End Item 2 --- */}
                        </div>
                        {/* --- END: Wrapper for Left Column --- */}

                        {/* --- Item 3: Right Column (Itinerary) --- */}
                        <div
                          style={{
                            background: "rgba(2, 6, 23, 0.75)",
                            borderRadius: "18px",
                            border: "1px solid rgba(96, 165, 250, 0.3)",
                            padding: "18px",
                            display: "grid",
                            gap: "12px",
                            alignContent: "start", // Ensures content starts from the top
                          }}
                        >
                          <h4 style={{ color: "#93c5fd", margin: 0 }}>Your Multi-Day Itinerary</h4>

                          {itineraryDays.map((day, dayIndex) => {
                            // --- NEW: Get list of IDs for DND context ---
                            const placeIds = day.places.map((p) => p.placeId || p.id);

                            return (
                              <div
                                key={`day-${day.dayNumber}`}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDropOnDay(dayIndex, e)}
                                onDragEnter={() => handleDragEnter(dayIndex)}
                                onDragLeave={() => handleDragLeave(dayIndex)}
                                style={{
                                  border:
                                    dragOverDayIndex === dayIndex
                                      ? "2px solid rgba(34, 197, 94, 0.6)"
                                      : "1px solid rgba(59, 130, 246, 0.25)",
                                  borderRadius: "14px",
                                  padding: "12px",
                                  background:
                                    dragOverDayIndex === dayIndex
                                      ? "rgba(34, 197, 94, 0.1)"
                                      : "rgba(15, 23, 42, 0.72)",
                                  transition: "all 0.3s ease",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "10px",
                                  }}
                                >
                                  <h5 style={{ color: "#f8fafc", margin: 0 }}>
                                    Day {day.dayNumber}
                                  </h5>
                                  {itineraryDays.length > 1 && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => removeDay(dayIndex)}
                                      style={{
                                        background: "rgba(239, 68, 68, 0.15)",
                                        border: "1px solid rgba(239, 68, 68, 0.3)",
                                        color: "#fca5a5",
                                        borderRadius: "50%",
                                        width: "28px",
                                        height: "28px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <IoTrash size={14} />
                                    </motion.button>
                                  )}
                                </div>

                                {day.places.length === 0 ? (
                                  <div
                                    style={{
                                      color: "#9ca3af",
                                      fontSize: "0.9rem",
                                      textAlign: "center",
                                      padding: "10px 0",
                                    }}
                                  >
                                    <div style={{ marginBottom: "10px" }}>
                                      Drag places here or use +/- buttons below
                                    </div>

                                    {/* --- NEW: +/- Fallback Buttons --- */}
                                    {suggestedPlaces.length > 0 && (
                                      <div style={{ marginTop: "12px" }}>
                                        <h6
                                          style={{
                                            color: "#cbd5f5",
                                            marginBottom: "8px",
                                            fontSize: "0.85rem",
                                          }}
                                        >
                                          Quick Add Places:
                                        </h6>
                                        <div
                                          style={{
                                            display: "grid",
                                            gap: "6px",
                                            maxHeight: "150px",
                                            overflowY: "auto",
                                          }}
                                        >
                                          {suggestedPlaces.map((place, idx) => {
                                            const isAlreadyAdded = itineraryDays.some((d) =>
                                              d.places.some(
                                                (p) =>
                                                  (p.placeId || p.id) ===
                                                  (place.placeId || place.id)
                                              )
                                            );
                                            return (
                                              <div
                                                key={place.placeId || place.id}
                                                style={{
                                                  display: "flex",
                                                  justifyContent: "space-between",
                                                  alignItems: "center",
                                                  background: "rgba(2, 6, 23, 0.6)",
                                                  padding: "8px 10px",
                                                  borderRadius: "8px",
                                                  border: "1px solid rgba(59, 130, 246, 0.2)",
                                                }}
                                              >
                                                <span
                                                  style={{
                                                    fontSize: "0.85rem",
                                                    color: "#cbd5f5",
                                                    flex: 1,
                                                    textAlign: "left",
                                                  }}
                                                >
                                                  {place.name?.length > 20
                                                    ? place.name.substring(0, 20) + "..."
                                                    : place.name}
                                                </span>
                                                <motion.button
                                                  whileHover={{ scale: 1.15 }}
                                                  whileTap={{ scale: 0.9 }}
                                                  onClick={() => {
                                                    if (!isAlreadyAdded) {
                                                      const newPlace = {
                                                        placeId: place.placeId || place.id,
                                                        name: place.name,
                                                        address:
                                                          place.address ||
                                                          place.formatted_address ||
                                                          "",
                                                        rating: place.rating,
                                                        categories: place.categories || [],
                                                        heroImage: place.heroImage || place.photo,
                                                        description: place.description || "",
                                                        coordinates: place.coordinates || {
                                                          latitude: 0,
                                                          longitude: 0,
                                                        },
                                                        distanceText: place.distanceText || "N/A",
                                                      };
                                                      setItineraryDays((prev) =>
                                                        prev.map((d, dIdx) =>
                                                          dIdx === dayIndex
                                                            ? {
                                                                ...d,
                                                                places: [...d.places, newPlace],
                                                              }
                                                            : d
                                                        )
                                                      );
                                                    }
                                                  }}
                                                  disabled={isAlreadyAdded}
                                                  style={{
                                                    background: isAlreadyAdded
                                                      ? "rgba(107, 114, 128, 0.3)"
                                                      : "rgba(34, 197, 94, 0.2)",
                                                    border: `1px solid ${isAlreadyAdded ? "rgba(107, 114, 128, 0.3)" : "rgba(34, 197, 94, 0.4)"}`,
                                                    color: isAlreadyAdded ? "#9ca3af" : "#86efac",
                                                    borderRadius: "6px",
                                                    width: "32px",
                                                    height: "28px",
                                                    cursor: isAlreadyAdded
                                                      ? "not-allowed"
                                                      : "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: "1rem",
                                                    fontWeight: 700,
                                                    opacity: isAlreadyAdded ? 0.5 : 1,
                                                  }}
                                                >
                                                  +
                                                </motion.button>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  // --- NEW: DND-Kit Context Wrapper ---
                                  <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={(event) => handleDragEnd(event, dayIndex)}
                                  >
                                    <SortableContext
                                      items={placeIds}
                                      strategy={verticalListSortingStrategy}
                                    >
                                      <div style={{ display: "grid", gap: "10px" }}>
                                        {day.places.map((place, placeIndex) => (
                                          <SortablePlaceItem
                                            key={place.placeId || place.id}
                                            id={place.placeId || place.id}
                                            place={place}
                                            dayIndex={dayIndex}
                                            removePlaceFromDay={removePlaceFromDay}
                                            distanceMap={distanceMap}
                                          />
                                        ))}
                                      </div>
                                    </SortableContext>
                                  </DndContext>
                                )}
                              </div>
                            );
                          })}

                          <motion.button
                            onClick={addDay}
                            whileHover={{ scale: 1.05 }}
                            style={{
                              padding: "10px",
                              background: "rgba(34, 197, 94, 0.15)",
                              border: "1px solid rgba(34, 197, 94, 0.3)",
                              color: "#bbf7d0",
                              borderRadius: "12px",
                              cursor: "pointer",
                              fontWeight: 600,
                            }}
                          >
                            + Add New Day
                          </motion.button>

                          {(routingLoading || geoRouteLoading) && (
                            <div style={{ color: "#93c5fd", fontSize: "0.85rem" }}>
                              Calculating travel distance…
                            </div>
                          )}
                          {routeError && (
                            <div
                              style={{
                                color: "#fca5a5",
                                background: "rgba(239, 68, 68, 0.12)",
                                border: "1px solid rgba(239, 68, 0.3)",
                                borderRadius: "12px",
                                padding: "10px",
                              }}
                            >
                              {routeError}
                            </div>
                          )}
                          {geoRouteError && (
                            <div
                              style={{
                                color: "#facc15",
                                background: "rgba(250, 204, 21, 0.12)",
                                border: "1px solid rgba(250, 204, 21, 0.25)",
                                borderRadius: "12px",
                                padding: "10px",
                              }}
                            >
                              {geoRouteError}
                            </div>
                          )}

                          {/* --- UPDATED: Route Summary (Green Arrow Fix) --- */}
                          {/* This card will now appear even if summary is null, to show loading/error */}
                          <div
                            style={{
                              background: "rgba(30, 64, 175, 0.2)",
                              borderRadius: "14px",
                              padding: "16px",
                              border: "1px solid rgba(59, 130, 246, 0.25)",
                              color: "#bfdbfe",
                              fontSize: "0.9rem",
                              marginTop: "10px",
                            }}
                          >
                            <div
                              style={{ fontWeight: 600, marginBottom: "10px", fontSize: "1rem" }}
                            >
                              📍 Route & Trip Summary
                            </div>
                            {(routeSummary || geoRouteData || mapRouteMetrics) &&
                              !(routingLoading || geoRouteLoading) && (
                                <div style={{ display: "grid", gap: "8px" }}>
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <span>Total Trip Distance:</span>
                                    <strong style={{ color: "#60a5fa", fontSize: "1.05rem" }}>
                                      {(routeTotals.totalMeters / 1000).toFixed(1)} km
                                    </strong>
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <span>Estimated Travel Time:</span>
                                    <strong style={{ color: "#34d399", fontSize: "1.05rem" }}>
                                      {Math.floor(routeTotals.totalSeconds / 3600)}h{" "}
                                      {Math.round((routeTotals.totalSeconds % 3600) / 60)}m
                                    </strong>
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "0.8rem",
                                      color: "#93c5fd",
                                      marginTop: "4px",
                                    }}
                                  >
                                    {legsCount} {legsCount === 1 ? "leg" : "legs"} • Starting from{" "}
                                    {userLocation.lat && userLocation.lng
                                      ? "your location"
                                      : "destination"}
                                  </div>
                                  {geoRouteData?.durationMinutes != null &&
                                    geoRouteData?.distanceKm != null && (
                                      <div style={{ fontSize: "0.78rem", color: "#bae6fd" }}>
                                        Geoapify: {geoRouteData.distanceKm.toFixed(2)} km •{" "}
                                        {geoRouteData.durationMinutes} mins
                                      </div>
                                    )}
                                  {!geoRouteData && mapRouteMetrics && (
                                    <div style={{ fontSize: "0.78rem", color: "#bae6fd" }}>
                                      Map route: {mapRouteMetrics.distanceKm.toFixed(2)} km •{" "}
                                      {mapRouteMetrics.durationMinutes} mins
                                    </div>
                                  )}
                                  {polylinePreview && (
                                    <div
                                      style={{
                                        fontSize: "0.78rem",
                                        color: "#a5b4fc",
                                        background: "rgba(30, 64, 175, 0.25)",
                                        borderRadius: "8px",
                                        padding: "8px 10px",
                                        lineHeight: 1.4,
                                      }}
                                    >
                                      <div style={{ fontWeight: 600 }}>Polyline Preview</div>
                                      <div>
                                        {polylinePreview.summary} ({polylinePreview.points} points)
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            {/* Show loading state inside the card */}
                            {(routingLoading || geoRouteLoading) && (
                              <div style={{ color: "#60a5fa" }}>
                                🔄 Calculating route distance and time...
                              </div>
                            )}
                            {/* Show if no summary and not loading (e.g., error) */}
                            {!routeSummary &&
                              !geoRouteData &&
                              !routingLoading &&
                              !geoRouteLoading && (
                                <div style={{ color: "#9ca3af" }}>
                                  📌 Add places to your itinerary to see route summary
                                </div>
                              )}
                          </div>

                          {/* --- NEW: Budget Overview (Yellow Arrow Fix) --- */}
                          {aiCostResult && (
                            <div
                              style={{
                                background: "rgba(15, 23, 42, 0.8)",
                                borderRadius: "14px",
                                padding: "16px",
                                border: "1px solid rgba(252, 211, 77, 0.3)",
                                color: "#e2e8f0",
                                fontSize: "0.95rem",
                                marginTop: "10px",
                                display: "grid",
                                gap: "10px",
                              }}
                            >
                              <h5 style={{ color: "#fcd34d", margin: 0, fontSize: "1.1rem" }}>
                                💰 Budget Overview
                              </h5>

                              {hasEnteredTripBudget ? (
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                  <span style={{ color: "#cbd5f5" }}>Your Trip Budget:</span>
                                  <span style={{ fontWeight: 600, color: "#f8fafc" }}>
                                    {formatCurrency(effectiveTripBudget)}
                                  </span>
                                </div>
                              ) : (
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                  <span style={{ color: "#cbd5f5" }}>Auto Estimated Budget:</span>
                                  <span style={{ fontWeight: 600, color: "#f8fafc" }}>
                                    {formatCurrency(fallbackTripBudget)}
                                  </span>
                                </div>
                              )}
                              <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "#cbd5f5" }}>Per Person Allocation:</span>
                                <span style={{ color: "#f0f9ff" }}>
                                  {formatCurrency(perPersonTripBudget)}
                                </span>
                              </div>

                              {routeTotals.totalMeters > 0 && (
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: "0.85rem",
                                  }}
                                >
                                  <span style={{ color: "#cbd5f5" }}>Trip Distance Factor:</span>
                                  <span style={{ color: "#60a5fa" }}>
                                    {(routeTotals.totalMeters / 1000).toFixed(1)} km
                                  </span>
                                </div>
                              )}

                              <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "#cbd5f5" }}>
                                  AI Estimated Trip Cost (Gemini):
                                </span>
                                <span style={{ fontWeight: 600, color: "#f8fafc" }}>
                                  {formatCurrency(aiCostResult.total)}
                                </span>
                              </div>

                              {aiCostResult.breakdown && (
                                <div
                                  style={{
                                    fontSize: "0.85rem",
                                    color: "#9ca3af",
                                    display: "grid",
                                    gap: "4px",
                                  }}
                                >
                                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>├─ Accommodation:</span>
                                    <span>
                                      {formatCurrency(aiCostResult.breakdown.accommodation || 0)}
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>├─ Food & Activities:</span>
                                    <span>
                                      {formatCurrency(aiCostResult.breakdown.activities || 0)}
                                    </span>
                                  </div>
                                  {aiCostResult.breakdown.travel > 0 && (
                                    <div
                                      style={{ display: "flex", justifyContent: "space-between" }}
                                    >
                                      <span>└─ Travel & Transport:</span>
                                      <span>{formatCurrency(aiCostResult.breakdown.travel)}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              <hr
                                style={{
                                  border: "none",
                                  borderTop: "1px solid rgba(148, 163, 184, 0.2)",
                                  margin: "4px 0",
                                }}
                              />

                              {hasEnteredTripBudget ? (
                                <div>
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      fontSize: "1.05rem",
                                    }}
                                  >
                                    <span style={{ color: "#cbd5f5" }}>Remaining Funds:</span>
                                    <span
                                      style={{
                                        fontWeight: 700,
                                        color:
                                          effectiveTripBudget - aiCostResult.total >= 0
                                            ? "#34d399"
                                            : "#fca5a5",
                                      }}
                                    >
                                      {formatCurrency(effectiveTripBudget - aiCostResult.total)}
                                    </span>
                                  </div>
                                  {effectiveTripBudget - aiCostResult.total < 0 && (
                                    <div
                                      style={{
                                        fontSize: "0.8rem",
                                        color: "#fca5a5",
                                        marginTop: "8px",
                                        fontStyle: "italic",
                                      }}
                                    >
                                      ⚠️ Budget exceeded by{" "}
                                      {formatCurrency(aiCostResult.total - effectiveTripBudget)}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div style={{ color: "#9ca3af", fontSize: "0.85rem" }}>
                                  💡 Enter your trip budget above to see remaining funds
                                </div>
                              )}
                            </div>
                          )}
                          {(availabilityIntel.length > 0 || budgetIntel.length > 0) && (
                            <div
                              style={{
                                background: "rgba(15, 23, 42, 0.72)",
                                borderRadius: "14px",
                                padding: "16px",
                                border: "1px solid rgba(96, 165, 250, 0.25)",
                                color: "#e2e8f0",
                                fontSize: "0.95rem",
                                marginTop: "12px",
                                display: "grid",
                                gap: "10px",
                              }}
                            >
                              <h5 style={{ color: "#60a5fa", margin: 0, fontSize: "1.05rem" }}>
                                🧭 Trip Intelligence
                              </h5>

                              {availabilityIntel.length > 0 && (
                                <div style={{ display: "grid", gap: "6px" }}>
                                  <span style={{ color: "#cbd5f5", fontSize: "0.85rem" }}>
                                    Availability Signals
                                  </span>
                                  {availabilityIntel.map((signal, idx) => (
                                    <div
                                      key={`availability-${idx}`}
                                      style={{
                                        display: "flex",
                                        gap: "8px",
                                        alignItems: "flex-start",
                                        background: "rgba(30, 41, 59, 0.6)",
                                        borderRadius: "10px",
                                        padding: "8px 10px",
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontWeight: 700,
                                          color: SIGNAL_COLORS[signal.level] || "#e2e8f0",
                                        }}
                                      >
                                        •
                                      </span>
                                      <span style={{ lineHeight: 1.4 }}>{signal.message}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {budgetIntel.length > 0 && (
                                <div style={{ display: "grid", gap: "6px" }}>
                                  <span style={{ color: "#cbd5f5", fontSize: "0.85rem" }}>
                                    Budget Guardrails
                                  </span>
                                  {budgetIntel.map((signal, idx) => (
                                    <div
                                      key={`budget-${idx}`}
                                      style={{
                                        display: "flex",
                                        gap: "8px",
                                        alignItems: "flex-start",
                                        background: "rgba(30, 41, 59, 0.6)",
                                        borderRadius: "10px",
                                        padding: "8px 10px",
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontWeight: 700,
                                          color: SIGNAL_COLORS[signal.level] || "#e2e8f0",
                                        }}
                                      >
                                        •
                                      </span>
                                      <span style={{ lineHeight: 1.4 }}>{signal.message}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          {/* --- End Budget Overview --- */}
                        </div>
                        {/* --- End Item 3 --- */}
                      </div>
                    </div>
                  )}
                </motion.section>
              ) : (
                <motion.section
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    ...styles.baseSection,
                    padding: "32px",
                    background: "rgba(15, 23, 42, 0.78)",
                    borderRadius: "26px",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    boxShadow: "0 30px 70px rgba(2, 6, 23, 0.6)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "16px",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "28px",
                    }}
                  >
                    <div style={{ display: "grid", gap: "6px" }}>
                      <h2 style={{ margin: 0, color: "#f8fafc", fontSize: "1.9rem" }}>
                        Saved itineraries
                      </h2>
                      <span style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
                        Track every curated journey and reopen complete day-by-day plans instantly.
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      {filterOptions.map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setFilter(value)}
                          style={{
                            padding: "8px 18px",
                            borderRadius: "12px",
                            border:
                              filter === value
                                ? "1px solid rgba(59, 130, 246, 0.6)"
                                : "1px solid rgba(148, 163, 184, 0.25)",
                            background:
                              filter === value ? "rgba(37, 99, 235, 0.3)" : "rgba(2, 6, 23, 0.55)",
                            color: filter === value ? "#dbeafe" : "#cbd5f5",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {loading && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "80px 20px",
                      }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "50%",
                          border: "3px solid rgba(59, 130, 246, 0.25)",
                          borderTop: "3px solid #60a5fa",
                        }}
                      />
                    </div>
                  )}

                  {!loading && error && (
                    <div
                      style={{
                        padding: "18px",
                        borderRadius: "14px",
                        border: "1px solid rgba(239, 68, 68, 0.35)",
                        background: "rgba(239, 68, 68, 0.12)",
                        color: "#fecaca",
                        textAlign: "center",
                      }}
                    >
                      {error}
                    </div>
                  )}

                  {!loading && !error && filteredItineraries.length === 0 && (
                    <div
                      style={{
                        padding: "72px 24px",
                        borderRadius: "20px",
                        border: "1px dashed rgba(148, 163, 184, 0.35)",
                        background: "rgba(2, 6, 23, 0.55)",
                        textAlign: "center",
                        display: "grid",
                        gap: "18px",
                        justifyItems: "center",
                      }}
                    >
                      <motion.div
                        animate={
                          prefersReducedMotion
                            ? {}
                            : {
                                y: [0, -10, 0],
                              }
                        }
                        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                        style={{ fontSize: "2.6rem", fontWeight: 700 }}
                      >
                        ✈️
                      </motion.div>
                      <div style={{ color: "#f8fafc", fontWeight: 700, fontSize: "1.4rem" }}>
                        No trips saved yet.
                      </div>
                      <div style={{ color: "#94a3b8", maxWidth: "480px", lineHeight: 1.6 }}>
                        Switch to the AI Planning Studio to draft a smart itinerary and pin it here
                        for quick access on future sessions.
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab("planner")}
                        style={{
                          padding: "12px 26px",
                          borderRadius: "12px",
                          border: "none",
                          background: "linear-gradient(135deg, #d97706, #facc15)",
                          color: "#0f172a",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Create an itinerary now
                      </motion.button>
                    </div>
                  )}

                  {!loading && !error && filteredItineraries.length > 0 && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                        gap: "24px",
                      }}
                    >
                      {filteredItineraries.map((itinerary, index) => {
                        const cardStyle = {
                          background: `linear-gradient(rgba(2, 6, 23, 0.85), rgba(15, 23, 42, 0.9)), url(${itinerary.destination?.heroImageURL || "/assets/default-card-bg.jpg"})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          borderRadius: "18px",
                          border: "1px solid rgba(37, 99, 235, 0.25)",
                          padding: "22px",
                          cursor: "pointer",
                          display: "grid",
                          gap: "16px",
                        };

                        return (
                          <motion.div
                            key={itinerary._id || index}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.06 }}
                            whileHover={{ y: -6 }}
                            onClick={() => setSelectedItinerary(itinerary)}
                            style={cardStyle}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <div
                                style={{ fontSize: "1.25rem", fontWeight: 700, color: "#f8fafc" }}
                              >
                                {itinerary.destination?.name || "Untitled Adventure"}
                              </div>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <motion.button
                                  whileHover={{ scale: 1.08 }}
                                  whileTap={{ scale: 0.92 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setItineraryToShare(itinerary);
                                    setShowShareModal(true);
                                  }}
                                  style={{
                                    background: "rgba(59, 130, 246, 0.18)",
                                    border: "1px solid rgba(59, 130, 246, 0.35)",
                                    borderRadius: "10px",
                                    padding: "6px",
                                    color: "#60a5fa",
                                    cursor: "pointer",
                                  }}
                                >
                                  <IoShareSocial size={16} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.08 }}
                                  whileTap={{ scale: 0.92 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setItineraryToDelete(itinerary);
                                    setShowDeleteConfirm(true);
                                  }}
                                  style={{
                                    background: "rgba(244, 63, 94, 0.18)",
                                    border: "1px solid rgba(244, 63, 94, 0.35)",
                                    borderRadius: "10px",
                                    padding: "6px",
                                    color: "#fca5a5",
                                    cursor: "pointer",
                                  }}
                                >
                                  <IoTrash size={16} />
                                </motion.button>
                              </div>
                            </div>

                            <div style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
                              {itinerary.destination?.formatted_address ||
                                "Location details unavailable"}
                            </div>

                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "14px",
                                color: "#cbd5f5",
                                fontSize: "0.9rem",
                              }}
                            >
                              <span
                                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                              >
                                <IoPeople size={16} color="#60a5fa" />
                                {itinerary.passengerInfo?.passengers || 1} travelers
                              </span>
                              <span
                                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                              >
                                <IoLocation size={16} color="#f472b6" />
                                {itinerary.passengerInfo?.travelDates?.start
                                  ? new Date(
                                      itinerary.passengerInfo.travelDates.start
                                    ).toLocaleDateString()
                                  : "No start date"}
                              </span>
                            </div>

                            {itinerary.costEstimate?.total && (
                              <div
                                style={{ color: "#fbbf24", fontWeight: 700, fontSize: "1.05rem" }}
                              >
                                {formatCurrency(itinerary.costEstimate.total)}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.section>
              )}
            </section>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showShareModal && itineraryToShare && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1100,
              padding: "24px",
            }}
            onClick={() => {
              setShowShareModal(false);
              setItineraryToShare(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "520px",
                background: "rgba(17, 24, 39, 0.95)",
                borderRadius: "20px",
                border: "1px solid rgba(96, 165, 250, 0.35)",
                padding: "28px",
                boxShadow: "0 20px 50px rgba(15, 23, 42, 0.6)",
                backdropFilter: "blur(16px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      background: "rgba(96, 165, 250, 0.2)",
                      borderRadius: "12px",
                      width: "44px",
                      height: "44px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#60a5fa",
                    }}
                  >
                    <IoShareSocial size={22} />
                  </div>
                  <div>
                    <h3 style={{ color: "#d4af37", margin: 0, fontSize: "1.4rem" }}>
                      Share Itinerary
                    </h3>
                    <p style={{ color: "#9ca3af", margin: 0 }}>
                      {itineraryToShare?.destination?.name || "Your itinerary"}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setShowShareModal(false);
                    setItineraryToShare(null);
                  }}
                  style={{
                    background: "rgba(148, 163, 184, 0.15)",
                    border: "1px solid rgba(148, 163, 184, 0.4)",
                    borderRadius: "50%",
                    width: "38px",
                    height: "38px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#cbd5f5",
                    cursor: "pointer",
                  }}
                >
                  <IoClose size={18} />
                </motion.button>
              </div>

              <div style={{ display: "grid", gap: "12px" }}>
                <button
                  onClick={() => handleShare("facebook", itineraryToShare)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(59, 130, 246, 0.35)",
                    background: "rgba(59, 130, 246, 0.15)",
                    color: "#bfdbfe",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  <IoLogoFacebook size={20} /> Share on Facebook
                </button>
                <button
                  onClick={() => handleShare("twitter", itineraryToShare)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(96, 165, 250, 0.35)",
                    background: "rgba(96, 165, 250, 0.15)",
                    color: "#cbd5f5",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  <IoLogoTwitter size={20} /> Share on X (Twitter)
                </button>
                <button
                  onClick={() => handleShare("whatsapp", itineraryToShare)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(34, 197, 94, 0.35)",
                    background: "rgba(34, 197, 94, 0.15)",
                    color: "#bbf7d0",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  <IoLogoWhatsapp size={20} /> Share on WhatsApp
                </button>
                <button
                  onClick={() => handleShare("linkedin", itineraryToShare)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(59, 130, 246, 0.35)",
                    background: "rgba(37, 99, 235, 0.15)",
                    color: "#bfdbfe",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  <IoLogoLinkedin size={20} /> Share on LinkedIn
                </button>
                <button
                  onClick={() => handleShare("email", itineraryToShare)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(236, 72, 153, 0.35)",
                    background: "rgba(236, 72, 153, 0.15)",
                    color: "#fbcfe8",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  <IoMail size={20} /> Share via Email
                </button>
                <button
                  onClick={handleCopyLink}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(148, 163, 184, 0.35)",
                    background: "rgba(148, 163, 184, 0.15)",
                    color: "#e2e8f0",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  <IoCopy size={20} /> Copy Shareable Link
                </button>
              </div>

              {copySuccess && (
                <div
                  style={{
                    marginTop: "14px",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "rgba(34, 197, 94, 0.12)",
                    border: "1px solid rgba(34, 197, 94, 0.35)",
                    color: "#bbf7d0",
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  Link copied to clipboard!
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedItinerary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px",
            }}
            onClick={() => setSelectedItinerary(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "rgba(17, 24, 39, 0.95)",
                borderRadius: "20px",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                maxWidth: "600px",
                width: "100%",
                maxHeight: "80vh",
                overflow: "auto",
                padding: "30px",
                backdropFilter: "blur(20px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h2 style={{ color: "#d4af37", margin: 0, fontSize: "1.8rem" }}>
                  {selectedItinerary.destination?.name}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedItinerary(null)}
                  style={{
                    background: "rgba(239, 68, 68, 0.2)",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fca5a5",
                    cursor: "pointer",
                  }}
                >
                  <IoClose size={20} />
                </motion.button>
              </div>

              <div style={{ color: "#e5e7eb", lineHeight: 1.6 }}>
                <div style={{ marginBottom: "16px" }}>
                  <strong style={{ color: "#d4af37" }}>Address:</strong>{" "}
                  {selectedItinerary.destination?.formatted_address || "Not available"}
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <strong style={{ color: "#d4af37" }}>Passengers:</strong>{" "}
                  {selectedItinerary.passengerInfo?.passengers || 1}
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <strong style={{ color: "#d4af37" }}>Travel Dates:</strong>{" "}
                  {selectedItinerary.passengerInfo?.travelDates?.start
                    ? new Date(
                        selectedItinerary.passengerInfo.travelDates.start
                      ).toLocaleDateString()
                    : "Not set"}{" "}
                  to{" "}
                  {selectedItinerary.passengerInfo?.travelDates?.end
                    ? new Date(selectedItinerary.passengerInfo.travelDates.end).toLocaleDateString()
                    : "Not set"}
                </div>

                {selectedItinerary.costEstimate?.total && (
                  <div style={{ marginBottom: "16px" }}>
                    <strong style={{ color: "#d4af37" }}>Estimated Cost:</strong>{" "}
                    <span style={{ color: "#fbbf24", fontWeight: 700 }}>
                      {formatCurrency(selectedItinerary.costEstimate.total)}
                    </span>
                  </div>
                )}

                {selectedItinerary.aiPlan && (
                  <div style={{ marginTop: "20px" }}>
                    <h3 style={{ color: "#60a5fa", marginBottom: "12px" }}>AI Plan</h3>
                    {Array.isArray(selectedItinerary.aiPlan.days) &&
                      selectedItinerary.aiPlan.days.map((day, idx) => (
                        <div key={idx} style={{ marginBottom: "16px" }}>
                          <h4 style={{ color: "#fcd34d", marginBottom: "8px" }}>
                            {day.title || `Day ${idx + 1}`}
                          </h4>
                          {day.summary && (
                            <p style={{ color: "#9ca3af", marginBottom: "8px" }}>{day.summary}</p>
                          )}
                          {Array.isArray(day.activities) && (
                            <ul style={{ marginLeft: "20px" }}>
                              {day.activities.map((activity, actIdx) => (
                                <li key={actIdx} style={{ marginBottom: "4px" }}>
                                  {activity.time && `[${activity.time}] `}
                                  {activity.title || activity.details}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && itineraryToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: "rgba(17, 24, 39, 0.95)",
                borderRadius: "16px",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                padding: "30px",
                maxWidth: "400px",
                width: "100%",
                textAlign: "center",
                backdropFilter: "blur(20px)",
              }}
            >
              <h3 style={{ color: "#fca5a5", marginBottom: "16px" }}>Delete Itinerary?</h3>
              <p style={{ color: "#e5e7eb", marginBottom: "24px" }}>
                Are you sure you want to delete this itinerary? This action cannot be undone.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setItineraryToDelete(null);
                  }}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "1px solid rgba(156, 163, 175, 0.4)",
                    background: "transparent",
                    color: "#9ca3af",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDeleteItinerary(itineraryToDelete._id)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #ef4444, #f87171)",
                    color: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ItineraryPlanner;
