// /client/src/utils/destinationHelpers.js
import { getDestinationHeroImage } from "./imageHelpers";

// These functions are extracted from Explore.js to be reusable

export const formatAddress = (location = {}) => {
  if (!location) return "India";
  if (location.address) return location.address;
  const parts = [location.city, location.state, location.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "India";
};

export const normalizePlaceRating = (value) => {
  if (value == null) return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  const scaled = numeric <= 1 ? numeric * 5 : numeric;
  const clamped = Math.max(0, Math.min(scaled, 5));
  return Number(clamped.toFixed(1));
};

export const extractPlaceId = (place = {}) => {
  return (
    place.placeId || place.place_id || place.id || place.raw?.place_id || place.raw?.id || null
  );
};

export const NEARBY_IMAGE_CANDIDATE_KEYS = [
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

export const resolveNearbyImage = (place = {}) => {
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

export const deriveNearbyPlaces = (items = [], destination, fallbackKey) => {
  if (!Array.isArray(items) || items.length === 0) return [];
  const baseKey =
    destination?._id || destination?.id || destination?.slug || destination?.name || fallbackKey;

  const processedEntries = items.map((item = {}, index) => {
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
  });

  // --- BOSS FIX: Add filtering for highways and duplicate names ---
  const seenNames = new Set();
  return processedEntries.filter((entry) => {
    if (!entry.name) return false; // Filter out entries with no name

    // Filter out highways (as requested)
    const lowerName = entry.name.toLowerCase();
    if (lowerName.includes("highway") || lowerName.includes(" nh ") || lowerName.includes(" sh ")) {
      return false;
    }

    // Filter out redundant names (as requested)
    if (seenNames.has(lowerName)) {
      return false;
    }
    seenNames.add(lowerName);
    return true;
  });
  // --- END OF FIX ---
};

export const normalizeDbDestination = (destination) => {
  if (!destination) return null;
  const normalizedRating = normalizePlaceRating(destination.rating);
  const rawName = typeof destination.name === "string" ? destination.name.trim() : "";
  const isLikelyPostalCode = rawName && /^[0-9]{4,6}$/.test(rawName);
  const fallbackNameCandidates = [
    destination.displayName,
    destination.title,
    destination.location?.name,
    destination.location?.label,
    destination.location?.city,
    destination.location?.district,
    destination.location?.region,
    destination.location?.state,
    destination.location?.country,
  ];
  const readableFallback = fallbackNameCandidates.find((value) => {
    if (typeof value !== "string") return false;
    const trimmed = value.trim();
    if (!trimmed) return false;
    return !/^[0-9]{4,6}$/.test(trimmed);
  });
  const resolvedNameCandidate = readableFallback
    ? readableFallback.trim()
    : fallbackNameCandidates.find((value) => typeof value === "string" && value.trim().length > 0);
  const sanitizedFallback =
    typeof resolvedNameCandidate === "string" ? resolvedNameCandidate.trim() : "";
  const resolvedName = isLikelyPostalCode
    ? sanitizedFallback || rawName || "Featured destination"
    : rawName || sanitizedFallback || "Featured destination";
  const normalized = {
    id: destination._id,
    _id: destination._id, // Ensure _id is present
    name: resolvedName,
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
    nearbyAttractions: destination.nearbyAttractions || [], // Keep this for backward compatibility

    // --- BOSS FIX: Correctly find all nearby arrays from all possible data structures ---
    nearby: {
      tourist: Array.isArray(destination.nearby?.tourist)
        ? destination.nearby.tourist
        : Array.isArray(destination.nearbyAttractions)
          ? destination.nearbyAttractions
          : [],
      restaurants: Array.isArray(destination.nearby?.restaurants)
        ? destination.nearby.restaurants
        : Array.isArray(destination.restaurants)
          ? destination.restaurants
          : [],
      accommodations: Array.isArray(destination.nearby?.accommodations)
        ? destination.nearby.accommodations
        : Array.isArray(destination.hotels)
          ? destination.hotels
          : Array.isArray(destination.accommodations)
            ? destination.accommodations
            : [],
    },
    // --- END OF FIX ---

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
