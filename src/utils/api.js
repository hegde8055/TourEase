// /client/src/utils/api.js
import axios from "axios";
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

export const itineraryAPI = {
  generate: async (data) => {
    return await axios.post(`${API_BASE}/api/itinerary/generate`, data);
  },
  save: async (data) => {
    return await axios.post(`${API_BASE}/api/itinerary/save`, data);
  },
  getAll: async () => {
    return await axios.get(`${API_BASE}/api/itinerary/saved`);
  },
  getById: async (id) => {
    return await axios.get(`${API_BASE}/api/itinerary/saved/${id}`);
  },
  delete: async (id) => {
    return await axios.delete(`${API_BASE}/api/itinerary/saved/${id}`);
  },
  update: async (id, data) => {
    return await axios.put(`${API_BASE}/api/itinerary/saved/${id}`, data);
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
    return await axios.put(`${API_BASE}/api/profile`, data);
  },
  uploadPhoto: async (formData) => {
    return await axios.post(`${API_BASE}/api/profile/photo`, formData, {
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

// This is the object that was in your `enhancedApi.js`
// We keep it separate for clarity, but export it as `placesAPI` for `Explore.js`
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

  // --- THIS IS THE FUNCTION WE BUILT ---
  /**
   * Fetches autocomplete suggestions from Geoapify.
   * We bias results towards India and prefer cities/tourist spots.
   */
  getAutocomplete: async (text) => {
    // --- BOSS FIX: Read the key from the .env file ---
    const GEOAPIFY_API_KEY = process.env.REACT_APP_GEOAPIFY_API_KEY;
    // --- END OF FIX ---

    // This check now correctly reads the variable
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

    // We use axios.get() here because we are calling an external URL
    const citySearch = axios.get(`https://api.geoapify.com/v1/geocode/autocomplete?${params}`);
    const touristSearch = axios.get(`https://api.geoapify.com/v2/places?${touristParams}`);

    return Promise.allSettled([citySearch, touristSearch]);
  },
  // --- END OF NEW FUNCTION ---
};

// Export the APIs for use in components
export { geoapifyPlacesAPI as placesAPI };

export const chatbotAPI = {
  sendMessage: async (message, history = []) => {
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
      clearStoredAuth();
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(AUTH_EXPIRED_EVENT, {
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
  enhancedProfileAPI,
  authAPI,
  destinationAPI,
  itineraryAPI,
  profileAPI,
  placesAPI: geoapifyPlacesAPI, // Ensure default export includes the right one
  chatbotAPI,
  contactAPI,
  getImageUrl,
};

export default api;
