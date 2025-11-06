import { getToken, getSessionKey } from "./auth";

/**
 * routingUtils.js
 * Utilities for calculating routes and distances by calling the SECURE BACKEND
 */

// NO API KEY HERE! This file is now secure.

// ==========================================================
// --- THIS IS THE FIX ---
// We now use an absolute URL to point to your Render backend.
// ==========================================================
const API_BASE_URL = process.env.REACT_APP_API_URL || "https://tourease-backend-vj25.onrender.com";

/**
 * Calculate route through multiple waypoints by calling our secure backend
 * @param {Array} waypoints - Array of {lat, lng} coordinates
 * @param {String} mode - 'drive', 'walk', or 'bike' (default: 'drive')
 * @returns {Promise} - Route data including distance, duration, and polyline
 */
export const calculateMultiPointRoute = async (waypoints, mode = "drive") => {
  if (!waypoints || waypoints.length < 2) {
    return null;
  }

  try {
    // 1. Get auth token
    const token = getToken();
    if (!token) {
      console.warn("No auth token found, route calculation will fail.");
    }

    const sessionKey = getSessionKey();
    if (!sessionKey) {
      console.warn("No session key found, route calculation cache may miss.");
    }

    // 2. Call your backend endpoint at the correct Render URL
    console.log(`🚗 Fetching secure route from backend at ${API_BASE_URL}...`);

    // ==========================================================
    // --- THIS IS THE FIX ---
    // The fetch URL is now absolute.
    // ==========================================================
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (sessionKey) {
      headers["X-Session-Key"] = sessionKey;
    }

    const response = await fetch(`${API_BASE_URL}/api/itinerary/calculate-route`, {
      method: "POST",
      headers,
      body: JSON.stringify({ waypoints, mode }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let err;
      try {
        err = JSON.parse(errText);
      } catch (e) {
        err = { error: errText };
      }
      throw new Error(err.error || `HTTP error! status: ${response.status}`);
    }

    // 3. Process the response data
    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      // Check for the format I *previously* (and incorrectly) suggested
      if (data.polylineCoordinates) {
        console.warn("Route API returned legacy format. Adjusting.");
        return {
          distance: data.distanceKm * 1000,
          duration: data.durationMinutes * 60,
          distanceKm: data.distanceKm,
          durationMinutes: data.durationMinutes,
          polylineCoordinates: data.polylineCoordinates,
          geometry: {
            type: "LineString",
            coordinates: data.polylineCoordinates.map(([lat, lng]) => [lng, lat]),
          },
          properties: {},
        };
      }
      throw new Error("No route features found in response");
    }

    const feature = data.features[0];
    const geometry = feature.geometry;
    const properties = feature.properties || {};

    // Extract route data
    let distance = 0;
    let duration = 0;

    if (properties.distance != null) {
      distance = Number(properties.distance); // in meters
    } else if (properties.distance_m != null) {
      distance = Number(properties.distance_m);
    }

    if (properties.time != null) {
      duration = Number(properties.time); // in seconds
    } else if (properties.time_seconds != null) {
      duration = Number(properties.time_seconds);
    }

    // Extract polyline coordinates
    let polylineCoordinates = [];
    if (geometry.type === "LineString" && Array.isArray(geometry.coordinates)) {
      polylineCoordinates = geometry.coordinates.map((coord) => [coord[1], coord[0]]); // [lat, lng]
    } else if (geometry.type === "MultiLineString" && Array.isArray(geometry.coordinates)) {
      polylineCoordinates = geometry.coordinates.flatMap((seg) =>
        seg.map((coord) => [coord[1], coord[0]])
      );
    }

    console.log(
      `✅ Secure route calculated: ${(distance / 1000).toFixed(2)} km, ${Math.round(
        duration / 60
      )} mins`
    );

    return {
      distance, // in meters
      duration, // in seconds
      distanceKm: distance / 1000,
      durationMinutes: Math.round(duration / 60),
      polylineCoordinates,
      geometry,
      properties,
    };
  } catch (error) {
    console.error("❌ Secure route calculation failed:", error);
    throw error;
  }
};

/**
 * Calculate distance between two points using the secure backend
 * @param {Object} from - {lat, lng}
 * @param {Object} to - {lat, lng}
 *D * @param {String} mode - 'drive', 'walk', or 'bike'
 * @returns {Promise} - Distance and duration
 */
export const calculateDistance = async (from, to, mode = "drive") => {
  if (!from || !to || from.lat == null || from.lng == null || to.lat == null || to.lng == null) {
    return null;
  }

  // This function now automatically uses the new secure
  // calculateMultiPointRoute function
  return await calculateMultiPointRoute([from, to], mode);
};

const routingUtils = {
  calculateMultiPointRoute,
  calculateDistance,
};

export default routingUtils;
