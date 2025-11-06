// /client/src/utils/api.js
import axios from "axios";
import { getToken, getSessionKey } from "./auth";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

// Add token to all axios requests
axios.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const sessionKey = getSessionKey();
    if (sessionKey) {
      config.headers["X-Session-Key"] = sessionKey;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const postPlaces = async (path, data) => axios.post(`${API_BASE}/api/places/${path}`, data);

export const enhancedPlacesAPI = {
  validateDestination: async (data) => postPlaces("validate", data),
  getTouristPlaces: async (data) => postPlaces("tourist", data),
  getNearbyPlaces: async (data) => postPlaces("nearby", data),
  getPlaceDetails: async (payload) => {
    const placeId = typeof payload === "string" ? payload : payload?.placeId;
    return postPlaces("details", { placeId });
  },
  getWeather: async (lat, lng) =>
    axios.get(`${API_BASE}/api/places/weather`, { params: { lat, lng } }),
  getMapImage: async (location, zoom = 14, size = "600x400") =>
    axios.get(`${API_BASE}/api/places/map`, {
      params: { location: `${location.lat},${location.lng}`, zoom, size },
    }),
  searchPlaces: async (data) => postPlaces("search", data),
  clearSessionCache: async () => {
    try {
      const res = await axios.delete(`${API_BASE}/api/places/cache`);
      return res.data;
    } catch (error) {
      console.error("Clear Destination Cache Error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error || "Failed to clear destination cache");
    }
  },
};

export const enhancedItineraryAPI = {
  saveCompletePlan: async (data) => {
    return await axios.post(`${API_BASE}/api/itinerary/save`, data);
  },
  getCompleteItinerary: async () => {
    return await axios.get(`${API_BASE}/api/itinerary/complete`);
  },
  getAll: async () => {
    return await axios.get(`${API_BASE}/api/itinerary`);
  },
  removeCompletePlan: async (planId) => {
    return await axios.delete(`${API_BASE}/api/itinerary/complete-plan/${planId}`);
  },
  delete: async (id) => {
    return await axios.delete(`${API_BASE}/api/itinerary/${id}`);
  },
  updateItinerary: async (planId, data) => {
    return await axios.put(`${API_BASE}/api/itinerary/complete-plan/${planId}`, data);
  },
  getItineraryDetails: async (planId) => {
    return await axios.get(`${API_BASE}/api/itinerary/complete-plan/${planId}`);
  },
};

export const aiItineraryAPI = {
  generatePlan: async (payload) => {
    // Modified to accept a single payload object
    return await axios.post(`${API_BASE}/api/itinerary/ai/plan`, payload);
  },
  estimateCosts: async ({
    basePerPerson,
    passengers,
    nights,
    travelClass,
    season,
    addOns,
    taxesPct,
    destination,
    interests,
  }) => {
    const res = await axios.post(`${API_BASE}/api/itinerary/ai/cost`, {
      basePerPerson,
      passengers,
      nights,
      travelClass,
      season,
      addOns,
      taxesPct,
      destination,
      interests,
    });
    return res.data;
  },
};

// === THIS IS THE FIX ===
// The paths are changed back to /api/places/
export const geoAPI = {
  distance: async ({ from, to, mode = "drive", itineraryId }) => {
    try {
      const res = await axios.post(`${API_BASE}/api/places/distance`, {
        from,
        to,
        mode,
        itineraryId,
      });
      return res.data;
    } catch (error) {
      console.error("Secure Distance Error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error || "Failed to calculate distance");
    }
  },
  geocode: async ({ query }) => {
    try {
      const res = await axios.post(`${API_BASE}/api/places/geocode`, { query });
      return res.data;
    } catch (error) {
      console.error("Secure Geocode Error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error || "Failed to geocode location");
    }
  },
};
// === END OF FIX ===

// --- NEW API FOR IMAGES ---
export const imageAPI = {
  getDestinationImage: async (query) => {
    return await axios.get(`${API_BASE}/api/images/destination`, { params: { query } });
  },
};

export const enhancedProfileAPI = {
  uploadProfilePhoto: async (formData) => {
    return await axios.post(`${API_BASE}/api/profile/upload-photo`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  updateProfile: async (data) => {
    return await axios.put(`${API_BASE}/api/profile/update`, data);
  },
  getProfile: async () => {
    return await axios.get(`${API_BASE}/api/profile`);
  },
  deleteProfilePhoto: async () => {
    return await axios.delete(`${API_BASE}/api/profile/photo`);
  },
};

export const authAPI = {
  signin: async (data) => {
    return await axios.post(`${API_BASE}/api/signin`, data);
  },
  signup: async (data) => {
    return await axios.post(`${API_BASE}/api/signup`, data);
  },
  login: async (data) => {
    return await axios.post(`${API_BASE}/api/signin`, data);
  },
  register: async (data) => {
    return await axios.post(`${API_BASE}/api/signup`, data);
  },
  forgotPassword: async (data) => {
    return await axios.post(`${API_BASE}/api/forgot-password`, data);
  },
  resetPassword: async (data) => {
    return await axios.post(`${API_BASE}/api/reset-password`, data);
  },
  getMe: async () => {
    return await axios.get(`${API_BASE}/api/auth/me`);
  },
};

export const destinationAPI = {
  getAll: async (params = {}) => {
    return await axios.get(`${API_BASE}/api/destinations`, { params });
  },
  getById: async (id) => {
    return await axios.get(`${API_BASE}/api/destinations/${id}`);
  },
  create: async (data) => {
    return await axios.post(`${API_BASE}/api/destinations`, data);
  },
  getTrending: async (limit = 10) => {
    const response = await axios.get(`${API_BASE}/api/trending`, {
      params: { limit },
    });
    return response.data?.destinations || [];
  },
  ingestFromGeoapify: async (payload) => {
    return await axios.post(`${API_BASE}/api/destinations/ingest`, payload);
  },
};

export const itineraryAPI = {
  get: async () => {
    return await axios.get(`${API_BASE}/api/itinerary/complete`);
  },
  add: async (data) => {
    return await axios.post(`${API_BASE}/api/itinerary/complete-plan`, data);
  },
  remove: async (id) => {
    return await axios.delete(`${API_BASE}/api/itinerary/remove/${id}`);
  },
  delete: async (planId) => {
    return await axios.delete(`${API_BASE}/api/itinerary/complete-plan/${planId}`);
  },
  update: async (planId, data) => {
    return await axios.put(`${API_BASE}/api/itinerary/complete-plan/${planId}`, data);
  },
  share: async (planId) => {
    return await axios.post(`${API_BASE}/api/itinerary/share/${planId}`);
  },
  unshare: async (planId) => {
    return await axios.delete(`${API_BASE}/api/itinerary/share/${planId}`);
  },
  getShared: async (shareToken) => {
    return await axios.get(`${API_BASE}/api/itinerary/shared/${shareToken}`);
  },
};

export const destinationsAPI = {
  getAll: async (params = {}) => {
    return await axios.get(`${API_BASE}/api/destinations`, { params });
  },
  getById: async (id) => {
    return await axios.get(`${API_BASE}/api/destinations/${id}`);
  },
  getByCategory: async (category) => {
    return await axios.get(`${API_BASE}/api/destinations/category/${category}`);
  },
  getCategories: async () => {
    return await axios.get(`${API_BASE}/api/destinations/meta/categories`);
  },
  search: async (query, filters = {}) => {
    return await axios.post(`${API_BASE}/api/destinations/search`, { query, filters });
  },
  ingestFromGeoapify: async (payload) => {
    return await axios.post(`${API_BASE}/api/destinations/ingest`, payload);
  },
};

export const profileAPI = {
  get: async () => {
    return await axios.get(`${API_BASE}/api/profile`);
  },
  update: async (data) => {
    return await axios.put(`${API_BASE}/api/profile/update`, data);
  },
  uploadPhoto: async (data) => {
    return await axios.post(`${API_BASE}/api/profile/upload-photo`, data);
  },
};

export const placesAPI = {
  validateDestination: async (data) => postPlaces("validate", data),
  getTouristPlaces: async (data) => postPlaces("tourist", data),
  getNearbyPlaces: async (data) => postPlaces("nearby", data),
  getPlaceDetails: async (data) => postPlaces("details", data),
  search: async (data) => postPlaces("search", data),
};

export const chatAPI = {
  send: async ({ message, history = [] }) => {
    const response = await axios.post(`${API_BASE}/api/chatbot`, {
      message,
      history,
    });
    return response.data;
  },
};

export const contactAPI = {
  send: async (data) => {
    return await axios.post(`${API_BASE}/api/contact`, data);
  },
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_BASE}${imagePath}`;
};

// This interceptor was duplicated, it's already defined at the top.
// axios.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token") || sessionStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("rememberMe");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("username");
    }
    return Promise.reject(error);
  }
);

const api = {
  enhancedPlacesAPI,
  enhancedItineraryAPI,
  enhancedProfileAPI,
  authAPI,
  destinationAPI,
  itineraryAPI,
  profileAPI,
  placesAPI,
  aiItineraryAPI,
  geoAPI,
  chatAPI,
  contactAPI,
  imageAPI, // <-- EXPORT THE NEW API
  getImageUrl,
};

export default api;
