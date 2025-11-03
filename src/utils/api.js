// This file configures all your application's API endpoints.
// It imports the central 'api' instance from 'enhancedApi.js'
// which handles the base URL and auth tokens.

import { api } from "./enhancedApi";
import { getToken } from "./auth";

// --- Authentication API ---
export const authAPI = {
  login: (credentials) => api.post("/signin", credentials),
  signup: (userData) => api.post("/signup", userData),
  forgotPassword: (email) => api.post("/forgot-password", { email }),
  resetPassword: (token, newPassword) => api.post("/reset-password", { token, newPassword }),
  getProfile: () => api.get("/profile"),
  updateProfile: (profileData) => api.put("/profile/update", profileData),
  uploadPhoto: (base64Photo) => api.post("/profile/upload-photo", { photo: base64Photo }),
  deletePhoto: () => api.delete("/profile/photo"),
};

// --- Itinerary API ---
// Basic CRUD for itineraries
export const itineraryAPI = {
  getAll: () => api.get("/itinerary"),
  getById: (id) => api.get(`/itinerary/${id}`),
  save: (itineraryData) => api.post("/itinerary/save", itineraryData),
  update: (id, itineraryData) => api.put(`/itinerary/${id}`, itineraryData),
  delete: (id) => api.delete(`/itinerary/${id}`),
  getStats: () => api.get("/itinerary/stats/summary"),
};

// --- Enhanced Itinerary API ---
// Combines basic CRUD with AI and Cost functions
export const enhancedItineraryAPI = {
  ...itineraryAPI, // Includes all functions from itineraryAPI

  // This function is for the *full* AI-generated plan
  generatePlan: (planRequest) => api.post("/itinerary/ai/plan", planRequest),

  // This function is for saving the *complete* user-modified plan
  saveCompletePlan: (planData) => api.post("/itinerary/save", planData),
};

// --- AI Itinerary & Cost API ---
// A focused object for the ItineraryPlanner page
export const aiItineraryAPI = {
  generatePlan: (planRequest) => api.post("/itinerary/ai/plan", planRequest),
  estimateCosts: (costInputs) => api.post("/itinerary/ai/cost", costInputs),
};

// --- Destinations & Places API ---
export const destinationsAPI = {
  getAll: (params) => api.get("/destinations", { params }),
  getById: (id) => api.get(`/destinations/${id}`),
  getTrending: (limit) => api.get("/trending", { params: { limit } }),
  getCategories: () => api.get("/destinations/categories"), // Assuming this route exists
  ingestFromGeoapify: (payload) => api.post("/destinations/ingest", payload),
};

// --- Geo & Places API (Geoapify) ---
// For maps, routing, and place lookups
export const geoAPI = {
  geocode: (params) => api.get("/places/geocode", { params }),
  reverseGeocode: (params) => api.get("/places/reverse-geocode", { params }),
  distance: (params) => api.post("/places/distance", params),
};

export const enhancedPlacesAPI = {
  getNearbyPlaces: (params) => api.get("/places/nearby", { params }),
  getTouristPlaces: (params) => api.get("/places/tourist", { params }),
  searchPlaces: (params) => api.get("/places/search-autocomplete", { params }),

  // --- ADDED MISSING FUNCTIONS ---
  getWeather: (lat, lng) => api.get("/places/weather", { params: { lat, lng } }),
  getPlaceDetails: (placeId) => api.get(`/places/place-details/${placeId}`),
  getMapImage: (coords, zoom, format) => api.post("/places/map-image", { coords, zoom, format }),
};

// --- Image API ---
export const imageAPI = {
  getDestinationImage: (destinationName) => {
    return api.get(`/images/destination/${encodeURIComponent(destinationName)}`);
  },
};

// --- Chatbot API ---
export const chatAPI = {
  send: (payload) => {
    return api.post("/chatbot", payload, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  },
};
