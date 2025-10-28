// /client/src/utils/enhancedApi.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE;

const postPlaces = async (path, data) => axios.post(`${API_BASE}/api/places/${path}`, data);

// Enhanced API functions powered by Geoapify
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
  // Save complete travel plan
  saveCompletePlan: async (data) => {
    return await axios.post(`${API_BASE}/api/itinerary/complete-plan`, data);
  },

  // Get complete itinerary
  getCompleteItinerary: async () => {
    return await axios.get(`${API_BASE}/api/itinerary/complete`);
  },

  // Remove complete plan
  removeCompletePlan: async (planId) => {
    return await axios.delete(`${API_BASE}/api/itinerary/complete-plan/${planId}`);
  },
};

export const enhancedProfileAPI = {
  // Upload profile photo with cropping
  uploadProfilePhoto: async (formData) => {
    return await axios.post(`${API_BASE}/api/profile/upload-photo`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Update profile with enhanced data
  updateProfile: async (data) => {
    return await axios.put(`${API_BASE}/api/profile/update`, data);
  },
};
