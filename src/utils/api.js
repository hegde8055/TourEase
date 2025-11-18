// /client/src/utils/api.js
import axios from "axios";
// BOSS FIX: Import all auth functions from auth.js, not here
import { getToken, getSessionKey, clearStoredAuth, AUTH_EXPIRED_EVENT } from "./auth";

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
  search: async (data) => postPlaces("search", data),
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
};

export const enhancedItineraryAPI = {
  saveCompletePlan: async (data) => {
    return await axios.post(`${API_BASE}/api/itinerary/complete-plan`, data);
  },
  getCompleteItinerary: async () => {
    return await axios.get(`${API_BASE}/api/itinerary/complete`);
  },
  removeCompletePlan: async (planId) => {
    return await axios.delete(`${API_BASE}/api/itinerary/complete-plan/${planId}`);
  },
};

export const aiItineraryAPI = {
  generatePlan: async (data) => {
    return await axios.post(`${API_BASE}/api/itinerary/ai/plan`, data);
  },
  estimateCosts: async (data) => {
    return await axios.post(`${API_BASE}/api/itinerary/ai/cost`, data);
  },
  calculateRoute: async (data) => {
    return await axios.post(`${API_BASE}/api/itinerary/calculate-route`, data);
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
};

export const authAPI = {
  login: async (credentials) => {
    return await axios.post(`${API_BASE}/api/auth/login`, credentials);
  },
  register: async (userData) => {
    return await axios.post(`${API_BASE}/api/auth/register`, userData);
  },
  verifyOtp: async (otpData) => {
    return await axios.post(`${API_BASE}/api/auth/verify-otp`, otpData);
  },
  requestPasswordReset: async (email) => {
    return await axios.post(`${API_BASE}/api/auth/request-password-reset`, { email });
  },
  verifyResetToken: async (token) => {
    return await axios.get(`${API_BASE}/api/auth/verify-reset-token/${token}`);
  },
  resetPassword: async (token, newPassword) => {
    return await axios.post(`${API_BASE}/api/auth/reset-password`, {
      token,
      newPassword,
    });
  },
  getProfile: async () => {
    return await axios.get(`${API_BASE}/api/auth/profile`);
  },
  checkAdmin: async () => {
    return await axios.get(`${API_BASE}/api/auth/check-admin`);
  },
};

export const destinationAPI = {
  getAll: async (params = {}) => {
    const response = await axios.get(`${API_BASE}/api/destinations`, { params });
    return response.data;
  },
  getById: async (id) => {
    return await axios.get(`${API_BASE}/api/destinations/${id}`);
  },
  getCategories: async () => {
    return await axios.get(`${API_BASE}/api/destinations/meta/categories`);
  },
  search: async (query, filters = {}) => {
    const response = await axios.post(`${API_BASE}/api/destinations/search`, {
      query,
      filters,
    });
    return response.data;
  },
  ingestFromGeoapify: async (data) => {
    return await axios.post(`${API_BASE}/api/destinations/ingest`, data);
  },
  getTrending: async (limit = 10) => {
    const response = await axios.get(`${API_BASE}/api/trending`, { params: { limit } });
    return response.data?.destinations;
  },
};

export const destinationsAPI = destinationAPI;

export const itineraryAPI = {
  generate: async (data) => {
    return await axios.post(`${API_BASE}/api/itinerary/generate`, data);
  },
  save: async (data) => {
    return await axios.post(`${API_BASE}/api/itinerary/save`, data);
  },
  getAll: async () => {
    return await axios.get(`${API_BASE}/api/itinerary`);
  },
  getById: async (id) => {
    return await axios.get(`${API_BASE}/api/itinerary/${id}`);
  },
  delete: async (id) => {
    return await axios.delete(`${API_BASE}/api/itinerary/${id}`);
  },
  update: async (id, data) => {
    return await axios.put(`${API_BASE}/api/itinerary/${id}`, data);
  },
  getPopular: async (limit = 5) => {
    const response = await axios.get(`${API_BASE}/api/itinerary/popular`, {
      params: { limit },
    });
    return response.data?.itineraries;
  },
};

export const profileAPI = {
  getProfile: async () => {
    return await axios.get(`${API_BASE}/api/profile`);
  },
  updateProfile: async (data) => {
    return await axios.put(`${API_BASE}/api/profile/update`, data);
  },
  uploadPhoto: async (formData) => {
    return await axios.post(`${API_BASE}/api/profile/upload-photo`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  getSavedDestinations: async () => {
    return await axios.get(`${API_BASE}/api/profile/saved-destinations`);
  },
  saveDestination: async (destinationId) => {
    return await axios.post(`${API_BASE}/api/profile/saved-destinations`, {
      destinationId,
    });
  },
  unsaveDestination: async (destinationId) => {
    return await axios.delete(`${API_BASE}/api/profile/saved-destinations/${destinationId}`);
  },
};

const geoapifyPlacesAPI = {
  validateDestination: async (data) => postPlaces("validate", data),
  getTouristPlaces: async (data) => postPlaces("tourist", data),
  getNearbyPlaces: async (data) => postPlaces("nearby", data),
  search: async (data) => postPlaces("search", data),

  getPlaceDetails: async (payload) => {
    const placeId = typeof payload === "string" ? payload : payload?.placeId;
    return postPlaces("details", { placeId });
  },
  getWeather: async (lat, lng) =>
    axios.get(`${API_BASE}/api/places/weather`, { params: { lat, lng } }),

  getAutocomplete: async (text) => {
    // This now correctly reads your .env file
    const GEOAPIFY_API_KEY = process.env.REACT_APP_GEOAPIFY_API_KEY;

    if (!GEOAPIFY_API_KEY || GEOAPIFY_API_KEY === "YOUR_GEOAPIFY_API_KEY") {
      console.warn("Geoapify API key is missing. Autocomplete will not work.");
      return Promise.reject(new Error("Missing Geoapify API key"));
    }

    const params = new URLSearchParams({
      text: text,
      apiKey: GEOAPIFY_API_KEY,
      type: "city",
      filter: "countrycode:in",
      bias: "countrycode:in",
      limit: 5,
    });

    const touristParams = new URLSearchParams({
      text: text,
      apiKey: GEOAPIFY_API_KEY,
      categories: "tourism.attraction",
      filter: "countrycode:in",
      bias: "countrycode:in",
      limit: 5,
    });

    const citySearch = axios.get(`https://api.geoapify.com/v1/geocode/autocomplete?${params}`);
    const touristSearch = axios.get(`https://api.geoapify.com/v2/places?${touristParams}`);

    return Promise.allSettled([citySearch, touristSearch]);
  },
};

export { geoapifyPlacesAPI as placesAPI };

export const geoAPI = {
  geocode: async (payload) => axios.post(`${API_BASE}/api/places/geocode`, payload),
  distance: async (payload) => axios.post(`${API_BASE}/api/places/distance`, payload),
  suggest: async (query) =>
    axios.get(`${API_BASE}/api/places/suggest`, {
      params: { query },
    }),
};

export const chatbotAPI = {
  sendMessage: async (message, history = []) => {
    const response = await axios.post(`${API_BASE}/api/chatbot`, {
      message,
      history,
    });
    return response.data;
  },
};

export const chatAPI = chatbotAPI;

export const imageAPI = {
  getDestinationImage: async (query) =>
    axios.get(`${API_BASE}/api/images/destination`, { params: { query } }),
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

// This interceptor now uses clearStoredAuth and AUTH_EXPIRED_EVENT
// from auth.js, as it should.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const errorMessage = (error.response?.data?.error || "").toLowerCase();
    const tokenError =
      status === 401 ||
      (status === 403 &&
        (errorMessage.includes("invalid or expired token") ||
          errorMessage.includes("access token required")));

    if (tokenError) {
      clearStoredAuth(); // This function is now imported correctly from auth.js
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(AUTH_EXPIRED_EVENT, {
            // This constant is also from auth.js
            detail: {
              status,
              message: error.response?.data?.error,
            },
          })
        );
      }
    }

    return Promise.reject(error);
  }
);

const api = {
  enhancedPlacesAPI,
  enhancedItineraryAPI,
  aiItineraryAPI,
  enhancedProfileAPI,
  authAPI,
  destinationAPI,
  destinationsAPI,
  itineraryAPI,
  profileAPI,
  placesAPI: geoapifyPlacesAPI,
  geoAPI,
  chatbotAPI,
  chatAPI,
  imageAPI,
  contactAPI,
  getImageUrl,
};

export { AUTH_EXPIRED_EVENT, clearStoredAuth };

export default api;
