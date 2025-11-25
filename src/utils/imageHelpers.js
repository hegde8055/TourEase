import { getImageUrl } from "./api";

export const DEFAULT_DESTINATION_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&auto=format&fit=crop";

const HTTP_URL_REGEX = /^https?:\/\//i;

const CITY_KEYWORDS = [
  "city skyline",
  "cityscape",
  "urban aerial",
  "night lights",
  "panoramic view",
];

const HERITAGE_KEYWORDS = [
  "heritage architecture",
  "iconic monument",
  "historic fort",
  "temple complex",
  "palace",
  "landmark",
];

const NATURE_KEYWORDS = [
  "scenic landscape",
  "mountain range",
  "valley vista",
  "sunrise view",
  "misty hills",
  "dramatic sky",
];

const BEACH_KEYWORDS = ["sunset beach", "coastal aerial", "tropical shore", "seaside panorama"];

const WATER_KEYWORDS = ["waterfront reflection", "riverfront", "lakeside skyline", "bridge view"];

const isPlaceholderAsset = (value = "") => {
  const normalized = value.trim().toLowerCase();
  return normalized.startsWith("/assets/") || normalized.startsWith("assets/");
};

const resolveCandidateUrl = (candidate) => {
  if (!candidate || typeof candidate !== "string") return null;
  const trimmed = candidate.trim();
  if (!trimmed) return null;
  if (HTTP_URL_REGEX.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("data:")) return trimmed;
  if (isPlaceholderAsset(trimmed)) return null;
  return getImageUrl(trimmed);
};

const resolveHeroImageObject = (value) => {
  if (!value || typeof value !== "object") return null;
  const nestedKeys = ["url", "src", "image", "imageUrl", "image_url", "path"];
  for (const key of nestedKeys) {
    const resolved = resolveCandidateUrl(value[key]);
    if (resolved) return resolved;
  }
  return null;
};

const toLowerSet = (values = []) => {
  const set = new Set();
  for (const value of values) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim().toLowerCase();
    if (trimmed) set.add(trimmed);
  }
  return set;
};

const collectContextKeywords = (destination = {}) => {
  const keywords = new Set(["cinematic frame", "dramatic lighting", "iconic landmark"]);
  const category =
    typeof destination.category === "string" ? destination.category.toLowerCase() : "";
  const tags = toLowerSet(destination.tags || destination.keywords || []);

  const hasTag = (...candidates) => candidates.some((candidate) => tags.has(candidate));
  const includesCategory = (token) => category.includes(token);

  const isCity = includesCategory("city") || hasTag("city", "urban", "metropolitan");
  const isHeritage = hasTag("heritage", "fort", "temple", "palace", "monument", "historical");
  const isNature = hasTag("hill", "mountain", "forest", "valley", "waterfall", "national park");
  const isBeach = hasTag("beach", "coast", "island", "coastal");
  const isWaterfront = hasTag("river", "lake", "backwater", "riverfront", "waterfront");

  if (isCity) {
    CITY_KEYWORDS.forEach((keyword) => keywords.add(keyword));
  }

  if (isHeritage) {
    HERITAGE_KEYWORDS.forEach((keyword) => keywords.add(keyword));
  }

  if (isNature) {
    NATURE_KEYWORDS.forEach((keyword) => keywords.add(keyword));
  }

  if (isBeach) {
    BEACH_KEYWORDS.forEach((keyword) => keywords.add(keyword));
  }

  if (isWaterfront) {
    WATER_KEYWORDS.forEach((keyword) => keywords.add(keyword));
  }

  return Array.from(keywords);
};

const buildQueryFromDestination = (destination, querySuffix) => {
  if (!destination) return "";
  const { name, state } = destination;
  const city = destination.location?.city || destination.location?.name;
  const computedState = state || destination.location?.state;
  const country = destination.location?.country || destination.country || "India";
  const contextKeywords = collectContextKeywords(destination);
  const seen = new Set();
  const parts = [];

  const append = (value) => {
    if (!value || typeof value !== "string") return;
    const trimmed = value.trim();
    if (!trimmed) return;
    const signature = trimmed.toLowerCase();
    if (seen.has(signature)) return;
    seen.add(signature);
    parts.push(trimmed);
  };

  append(name);
  append(city);
  append(computedState);
  append(country);
  contextKeywords.forEach(append);
  if (querySuffix) {
    querySuffix
      .split(/[|,]/)
      .map((segment) => segment.trim())
      .filter(Boolean)
      .forEach(append);
  }

  return parts.join(" ");
};

export const getDestinationHeroImage = (destination, options = {}) => {
  if (!destination) return options.fallback || DEFAULT_DESTINATION_FALLBACK_IMAGE;

  const {
    fields = [
      "heroImage",
      "hero_image_url",
      "image",
      "imageUrl",
      "image_url",
      "imagePath",
      "photo",
      "thumbnail",
      "cover",
    ],
    size = "800x600",
    querySuffix = "India landmark cinematic",
    fallback = DEFAULT_DESTINATION_FALLBACK_IMAGE,
  } = options;

  const prioritizedCandidates = [
    resolveCandidateUrl(typeof destination.heroImage === "string" ? destination.heroImage : null),
    resolveHeroImageObject(destination.heroImage),
    resolveHeroImageObject(destination.image),
  ].filter(Boolean);

  if (prioritizedCandidates.length > 0) {
    return prioritizedCandidates[0];
  }

  for (const field of fields) {
    const rawValue = destination[field];
    let candidate = null;
    if (typeof rawValue === "string") {
      candidate = resolveCandidateUrl(rawValue);
    } else if (rawValue && typeof rawValue === "object") {
      candidate = resolveHeroImageObject(rawValue);
    }
    if (candidate) return candidate;
  }

  // source.unsplash.com is deprecated. Return the static fallback instead.
  return fallback;
};
