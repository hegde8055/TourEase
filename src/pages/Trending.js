// /client/src/pages/Trending.js
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { destinationAPI, enhancedPlacesAPI } from "../utils/api";
import { getDestinationHeroImage } from "../utils/imageHelpers";
import { extractCoordinates } from "../utils/locationHelpers";
import Navbar from "../components/Navbar";
import AIChatbot from "../components/AIChatbot";

const getPreviewKey = (destination) => {
  if (!destination) return "";
  const candidate = destination._id || destination.slug || destination.name;
  return candidate ? String(candidate) : "";
};

const Trending = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  // Using useRef to store map previews to avoid re-renders on update
  const mapPreviewsRef = useRef({});
  const navigate = useNavigate();

  // Helper function to update mapPreviewsRef safely
  const setPreviewEntry = (key, value) => {
    if (!key) return;
    mapPreviewsRef.current = { ...mapPreviewsRef.current, [key]: value };
    // We might need a way to trigger a re-render if the map image display relies on state,
    // but for now, we assume it can read directly or doesn't need immediate update visibility.
  };

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      try {
        // Fetch top 12 trending destinations (change 12 to 25 if needed)
        const results = await destinationAPI.getTrending(25);
        mapPreviewsRef.current = {}; // Reset map previews on new fetch
        setDestinations(results || []); // Ensure results is an array
      } catch (error) {
        console.error("Error fetching trending destinations:", error);
        setDestinations([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  // Effect to load map images sequentially after destinations are loaded
  useEffect(() => {
    if (!destinations.length) return;
    let cancelled = false;
    const loadMapsSequentially = async () => {
      for (const destination of destinations) {
        if (cancelled) return; // Exit if component unmounted
        const key = getPreviewKey(destination);
        if (!key || mapPreviewsRef.current[key]) continue; // Skip if no key or already processed

        const coordinates = extractCoordinates(destination);
        if (!coordinates) {
          setPreviewEntry(key, { status: "empty" }); // No coordinates found
          continue;
        }

        setPreviewEntry(key, { status: "loading" }); // Mark as loading

        try {
          // Fetch map image from backend API
          const response = await enhancedPlacesAPI.getMapImage(coordinates, 8, "600x360");
          if (cancelled) return;

          const mapUrl = response.data?.mapUrl;
          const provider = response.data?.provider || "geoapify";

          if (mapUrl) {
            setPreviewEntry(key, { status: "ready", url: mapUrl, provider }); // Map loaded
          } else {
            setPreviewEntry(key, { status: "empty" }); // No map URL returned
          }
        } catch (error) {
          if (cancelled) return;
          console.error(`Error fetching map for ${destination.name}:`, error);
          setPreviewEntry(key, { status: "error" }); // Error loading map
        }
        await new Promise((resolve) => setTimeout(resolve, 300)); // Small delay between requests
      }
    };

    loadMapsSequentially();

    // Cleanup function to set cancelled flag on unmount
    return () => {
      cancelled = true;
    };
  }, [destinations]); // Re-run if destinations array changes

  return (
    <div className="main-content">
      <Navbar />
      <div
        style={{
          minHeight: "100vh",
          paddingTop: "100px", // Adjusted padding
          paddingBottom: "60px",
          marginTop: "-180px", // Adjusted margin if needed based on Navbar height
          background:
            "radial-gradient(ellipse at top, rgba(59,130,246,0.1), transparent 50%), radial-gradient(ellipse at bottom, rgba(212,175,55,0.1), transparent 50%)", // Subtle gradient
          backgroundImage: "url('/assets/2.jpg')", // Correct path, wrapped in url()
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 20px" }}>
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: "center", marginBottom: "60px" }}
          >
            <h1
              style={{
                fontSize: "clamp(2.5rem, 6vw, 4rem)", // Responsive font size
                fontWeight: "700",
                marginBottom: "20px",
                background: "linear-gradient(135deg, #d4af37, #3b82f6)", // Gold to blue gradient
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              🔥 Trending Destinations
            </h1>
            <p
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.2rem)", // Responsive font size
                color: "#cbd5e1", // Light grey text
                maxWidth: "700px",
                margin: "0 auto",
                lineHeight: 1.6,
              }}
            >
              Most popular destinations in India right now - Experience what thousands of travelers
              are discovering
            </p>
          </motion.div>

          {/* Loading State */}
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px",
                color: "#9ca3af", // Muted text color
                fontSize: "1.2rem",
              }}
            >
              <div style={{ fontSize: "4rem", marginBottom: "20px" }}>⏳</div>
              Loading trending destinations...
            </div>
          ) : destinations.length === 0 ? (
            // Empty State
            <div
              style={{
                textAlign: "center",
                padding: "80px",
                color: "#9ca3af",
                fontSize: "1.2rem",
              }}
            >
              <div style={{ fontSize: "4rem", marginBottom: "20px" }}>😔</div>
              No trending destinations available at the moment. Please check back later!
            </div>
          ) : (
            // Destinations Grid
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", // Updated for 4 columns potentially
                gap: "30px",
              }}
            >
              {destinations.map((destination, index) => {
                // Safely get hero image URL
                const heroImage = getDestinationHeroImage(destination, {
                  size: "600x400", // Slightly smaller size for grid cards
                  querySuffix: "India travel cinematic",
                });
                const previewKey = getPreviewKey(destination);
                const cardKey = previewKey || `trending-${index}`; // Ensure unique key

                return (
                  <motion.div
                    key={cardKey}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    whileHover={{ y: -8, boxShadow: "0 16px 32px rgba(212, 175, 55, 0.18)" }} // Gold shadow on hover
                    style={{
                      background: "rgba(17, 24, 39, 0.92)", // Dark card background
                      borderRadius: "20px",
                      overflow: "hidden",
                      border: "1.5px solid rgba(212, 175, 55, 0.22)", // Subtle gold border
                      backdropFilter: "blur(10px)", // Frosted glass effect
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)", // Default shadow
                      transition: "box-shadow 0.3s ease, transform 0.3s ease",
                    }}
                    // Navigate on click, using ID or slug or fallback to index
                    onClick={() =>
                      navigate(`/destination/${destination._id || destination.slug || cardKey}`)
                    }
                  >
                    {/* Image Container */}
                    <div style={{ position: "relative", height: "200px", overflow: "hidden" }}>
                      <img
                        src={heroImage}
                        // *** ALT TEXT FIX ***
                        alt={
                          destination.name ? `View of ${destination.name}` : "Trending destination"
                        } // More descriptive, no "Image"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.4s ease",
                        }}
                        // Zoom effect on hover
                        onMouseEnter={(event) => {
                          event.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.transform = "scale(1)";
                        }}
                        // Fallback in case image fails to load
                        onError={(e) => {
                          e.target.onerror = null; // Prevent infinite loop
                          e.target.src =
                            "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&auto=format&fit=crop"; // Generic fallback
                        }}
                      />
                      {/* Category Badge */}
                      {destination.category && (
                        <div
                          style={{
                            position: "absolute",
                            top: "14px",
                            right: "14px",
                            background: "rgba(212, 175, 55, 0.9)",
                            color: "#0b0e14",
                            padding: "6px 14px",
                            borderRadius: "999px",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                          }}
                        >
                          {destination.category}
                        </div>
                      )}
                      {/* Rating Badge */}
                      {destination.rating != null && (
                        <div
                          style={{
                            position: "absolute",
                            top: "14px",
                            left: "14px",
                            background: "rgba(11, 17, 32, 0.9)",
                            color: "#facc15", // Yellow star color
                            padding: "6px 12px",
                            borderRadius: "999px",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <span>⭐</span>
                          <span>
                            {typeof destination.rating === "number"
                              ? destination.rating.toFixed(1)
                              : destination.rating}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div
                      style={{
                        padding: "20px", // Slightly reduced padding
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 1, // Ensure content area grows
                        gap: "10px", // Spacing between elements
                      }}
                    >
                      <h3
                        style={{
                          color: "#fcd34d", // Lighter gold for title
                          fontSize: "1.2rem", // Slightly smaller title
                          marginBottom: "4px",
                          fontWeight: 700,
                          lineHeight: 1.3,
                        }}
                      >
                        {destination.name || "Unknown Destination"}
                      </h3>
                      {/* Description with Ellipsis */}
                      <p
                        style={{
                          color: "#b6c2d6", // Lighter text color
                          fontSize: "0.9rem", // Slightly smaller text
                          lineHeight: 1.6,
                          marginBottom: "8px", // More space below description
                          display: "-webkit-box",
                          WebkitLineClamp: 3, // Limit to 3 lines
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          minHeight: "4.3em", // Ensure space for 3 lines
                        }}
                      >
                        {destination.summary ||
                          destination.description ||
                          "No description available."}
                      </p>
                      {/* Location Info */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: "#e5e7eb", // Even lighter text
                          fontSize: "0.85rem", // Smaller location text
                          fontWeight: 500,
                          marginTop: "auto", // Push to bottom if space allows
                          paddingTop: "10px", // Add padding above location
                        }}
                      >
                        <span style={{ fontSize: "1rem" }}>📍</span>
                        <span>
                          {destination.location?.city || destination.location?.state || "India"}
                        </span>
                      </div>

                      {/* View Details Button */}
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.03, backgroundColor: "#facc15" }} // Brighter hover
                        whileTap={{ scale: 0.98 }}
                        // onClick handled by parent div
                        style={{
                          padding: "10px 16px", // Slightly smaller padding
                          borderRadius: "999px",
                          border: "none",
                          // Gold gradient background
                          background: "linear-gradient(135deg, #d4af37 0%, #f7ef8a 100%)",
                          color: "#0b0e14", // Dark text on button
                          fontWeight: 600,
                          fontSize: "0.85rem", // Smaller button text
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          textAlign: "center",
                          width: "100%", // Make button full width
                          marginTop: "10px", // Space above button
                          boxShadow: "0 8px 16px rgba(212, 175, 55, 0.25)", // Softer shadow
                        }}
                      >
                        View Details
                        <span style={{ fontSize: "1rem" }}>→</span>
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Explore More Section */}
          {!loading && destinations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }} // Animate only once when it comes into view
              style={{
                marginTop: "80px",
                textAlign: "center",
                background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(212,175,55,0.1))", // Blue/Gold gradient
                padding: "clamp(40px, 8vw, 60px) clamp(20px, 5vw, 40px)", // Responsive padding
                borderRadius: "24px",
              }}
            >
              <h2
                style={{
                  fontSize: "clamp(1.5rem, 4vw, 2rem)", // Responsive font size
                  marginBottom: "20px",
                  color: "#e5e7eb", // Light text
                }}
              >
                Ready to plan your next adventure?
              </h2>
              <button
                onClick={() => navigate("/explore")}
                className="btn btn-primary" // Use your primary button style
                style={{
                  padding: "clamp(12px, 2vw, 16px) clamp(28px, 5vw, 40px)", // Responsive padding
                  fontSize: "clamp(1rem, 2.5vw, 1.15rem)", // Responsive font size
                  borderRadius: "999px", // Pill shape
                  fontWeight: 600,
                }}
              >
                🗺️ Explore All Destinations
              </button>
            </motion.div>
          )}
        </div>
      </div>
      <AIChatbot />
    </div>
  );
};

export default Trending;
