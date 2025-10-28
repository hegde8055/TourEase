// Coordinates utilities shared across destination views
const toNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const extractFromArray = (value) => {
  if (!Array.isArray(value) || value.length < 2) return null;
  const lat = toNumber(value[1]);
  const lng = toNumber(value[0]);
  if (lat == null || lng == null) return null;
  return { lat, lng };
};

const extractFromObject = (value) => {
  if (!value || typeof value !== "object") return null;

  // GeoJSON style { type: "Point", coordinates: [lng, lat] }
  if (Array.isArray(value.coordinates)) {
    const geoCandidate = extractFromArray(value.coordinates);
    if (geoCandidate) return geoCandidate;
  }

  const lat =
    toNumber(value.lat) ??
    toNumber(value.latitude) ??
    toNumber(value.Latitude) ??
    toNumber(value.y);
  const lng =
    toNumber(value.lng) ??
    toNumber(value.lon) ??
    toNumber(value.longitude) ??
    toNumber(value.Longitude) ??
    toNumber(value.x);

  if (lat == null || lng == null) return null;
  return { lat, lng };
};

export const extractCoordinates = (destination = {}) => {
  const location = destination.location || {};

  const candidates = [
    location.coordinates,
    destination.coordinates,
    destination.coords,
    destination.position,
    destination.geo,
  ];

  let coords = null;
  for (const candidate of candidates) {
    coords = extractFromArray(candidate) || extractFromObject(candidate);
    if (coords) break;
  }

  if (!coords) {
    const arrayFallback = extractFromArray(location.center || destination.center);
    if (arrayFallback) coords = arrayFallback;
  }

  const latCandidate =
    toNumber(location.lat) ??
    toNumber(location.latitude) ??
    coords?.lat ??
    toNumber(destination.lat) ??
    toNumber(destination.latitude);

  const lngCandidate =
    toNumber(location.lng) ??
    toNumber(location.lon) ??
    toNumber(location.longitude) ??
    coords?.lng ??
    toNumber(destination.lng) ??
    toNumber(destination.lon) ??
    toNumber(destination.longitude);

  const lat = latCandidate;
  const lng = lngCandidate;

  if (lat == null || lng == null) {
    return null;
  }

  return { lat, lng };
};
