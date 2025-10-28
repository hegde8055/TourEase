// /client/src/pages/Trending.js
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { destinationAPI, enhancedPlacesAPI } from "../utils/api";
import { getDestinationHeroImage } from "../utils/imageHelpers";
import { extractCoordinates } from "../utils/locationHelpers";
import Navbar from "../components/Navbar";
import AIChatbot from "../components/AIChatbot";

// Helper function to generate a unique key for mapping
const getPreviewKey = (destination) => {
  if (!destination) return "";
  const candidate = destination._id || destination.slug || destination.name;
  return candidate ? String(candidate) : "";
};

const Trending = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapPreviewsRef = useRef({}); // Using ref for map previews
  const navigate = useNavigate();

  // Helper to update map previews ref
  const setPreviewEntry = (key, value) => {
    if (!key) return;
    mapPreviewsRef.current = { ...mapPreviewsRef.current, [key]: value };
  };

  // Fetch trending destinations on mount
  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      try {
        // Fetching 25 destinations
        const results = await destinationAPI.getTrending(25);
        mapPreviewsRef.current = {}; // Reset map previews
        setDestinations(results || []); // Ensure it's an array
      } catch (error) {
        console.error("Error fetching trending destinations:", error);
        setDestinations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []); // Empty dependency array means run once on mount

  // Fetch map images sequentially after destinations load
  useEffect(() => {
    if (!destinations.length) return;
    let cancelled = false;
    const loadMapsSequentially = async () => {
      for (const destination of destinations) {
        if (cancelled) return;
        const key = getPreviewKey(destination);
        if (!key || mapPreviewsRef.current[key]) continue;

        const coordinates = extractCoordinates(destination);
        if (!coordinates) {
          setPreviewEntry(key, { status: "empty" });
          continue;
        }
        setPreviewEntry(key, { status: "loading" });

        try {
          const response = await enhancedPlacesAPI.getMapImage(coordinates, 8, "600x360");
          if (cancelled) return;
          const mapUrl = response.data?.mapUrl;
          if (mapUrl)
            setPreviewEntry(key, {
              status: "ready",
              url: mapUrl,
              provider: response.data?.provider || "geoapify",
            });
          else setPreviewEntry(key, { status: "empty" });
        } catch (error) {
          if (cancelled) return;
          console.error(`Error fetching map for ${destination.name}:`, error);
          setPreviewEntry(key, { status: "error" });
        }
        await new Promise((resolve) => setTimeout(resolve, 300)); // Delay between requests
      }
    };
    loadMapsSequentially();
    return () => {
      cancelled = true;
    }; // Cleanup on unmount
  }, [destinations]);

  return (
    // main-content class likely adds padding-top automatically from App.css
    <div className="main-content">
      <Navbar />
      {/* --- THIS IS THE MAIN CONTAINER WITH CORRECTED STYLES --- */}
      <div
        style={{
          minHeight: "100vh",
          paddingTop: "100px", // Keep padding to push content below Navbar
          paddingBottom: "60px",
          marginTop: "-180px", // *** KEEPING the negative margin as requested ***
          // --- COMBINED BACKGROUND STYLES ---
          background: `
            radial-gradient(ellipse at top, rgba(59,130,246,0.1), transparent 50%),
            radial-gradient(ellipse at bottom, rgba(212,175,55,0.1), transparent 50%),
            url('/assets/2.jpg') /* Correct path */
          `,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed", // *** IMPORTANT: Keeps background fixed to viewport ***
        }}
      >
        {/* Max width container */}
        {/* Adjusted padding: Removed top padding here since parent div handles it */}
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 20px" }}>
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: "center", marginBottom: "60px", paddingTop: "80px" }} // Add padding here to compensate for removed negative margin's effect on position
          >
            <h1
              style={{
                fontSize: "clamp(2.5rem, 6vw, 4rem)",
                fontWeight: "700",
                marginBottom: "20px",
                background: "linear-gradient(135deg, #d4af37, #3b82f6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              🔥 Trending Destinations
            </h1>
            <p
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                color: "#cbd5e1",
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
                color: "#9ca3af",
                fontSize: "1.2rem",
                background: "rgba(11, 14, 20, 0.6)",
                borderRadius: "15px",
              }}
            >
              {" "}
              {/* Added background for visibility */}
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
                background: "rgba(11, 14, 20, 0.6)",
                borderRadius: "15px",
              }}
            >
              {" "}
              {/* Added background */}
              <div style={{ fontSize: "4rem", marginBottom: "20px" }}>😔</div>
              No trending destinations available at the moment. Please check back later!
            </div>
          ) : (
            // Destinations Grid
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", // Should allow ~4 columns
                gap: "30px",
              }}
            >
              {/* --- Card Mapping remains the same as previous correct version --- */}
              {destinations.map((destination, index) => {
                const heroImage = getDestinationHeroImage(destination, {
                  size: "600x400",
                  querySuffix: "India travel scenic",
                });
                const previewKey = getPreviewKey(destination);
                const cardKey = previewKey || `trending-${index}`;

                return (
                  <motion.div
                    key={cardKey}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    whileHover={{ y: -8, boxShadow: "0 16px 32px rgba(212, 175, 55, 0.18)" }}
                    style={{
                      background: "rgba(17, 24, 39, 0.92)",
                      borderRadius: "20px",
                      overflow: "hidden",
                      border: "1.5px solid rgba(212, 175, 55, 0.22)",
                      backdropFilter: "blur(10px)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
                      transition: "box-shadow 0.3s ease, transform 0.3s ease",
                    }}
                    onClick={() =>
                      navigate(`/destination/${destination._id || destination.slug || cardKey}`)
                    }
                  >
                    <div style={{ position: "relative", height: "200px", overflow: "hidden" }}>
                      <img
                        src={heroImage}
                        alt={
                          destination.name ? `View of ${destination.name}` : "Trending destination"
                        }
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.4s ease",
                        }}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.transform = "scale(1)";
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&auto=format&fit=crop";
                        }}
                      />
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
                          {" "}
                          {destination.category}{" "}
                        </div>
                      )}
                      {destination.rating != null && (
                        <div
                          style={{
                            position: "absolute",
                            top: "14px",
                            left: "14px",
                            background: "rgba(11, 17, 32, 0.9)",
                            color: "#facc15",
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
                          {" "}
                          <span>⭐</span>{" "}
                          <span>
                            {typeof destination.rating === "number"
                              ? destination.rating.toFixed(1)
                              : destination.rating}
                          </span>{" "}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 1,
                        gap: "10px",
                      }}
                    >
                      <h3
                        style={{
                          color: "#fcd34d",
                          fontSize: "1.2rem",
                          marginBottom: "4px",
                          fontWeight: 700,
                          lineHeight: 1.3,
                        }}
                      >
                        {" "}
                        {destination.name || "Unknown Destination"}{" "}
                      </h3>
                      <p
                        style={{
                          color: "#b6c2d6",
                          fontSize: "0.9rem",
                          lineHeight: 1.6,
                          marginBottom: "8px",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          minHeight: "4.3em",
                        }}
                      >
                        {" "}
                        {destination.summary ||
                          destination.description ||
                          "No description available."}{" "}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: "#e5e7eb",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          marginTop: "auto",
                          paddingTop: "10px",
                        }}
                      >
                        {" "}
                        <span style={{ fontSize: "1rem" }}>📍</span>{" "}
                        <span>
                          {destination.location?.city || destination.location?.state || "India"}
                        </span>{" "}
                      </div>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.03, backgroundColor: "#facc15" }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          padding: "10px 16px",
                          borderRadius: "999px",
                          border: "none",
                          background: "linear-gradient(135deg, #d4af37 0%, #f7ef8a 100%)",
                          color: "#0b0e14",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          textAlign: "center",
                          width: "100%",
                          marginTop: "10px",
                          boxShadow: "0 8px 16px rgba(212, 175, 55, 0.25)",
                        }}
                      >
                        {" "}
                        View Details <span style={{ fontSize: "1rem" }}>→</span>{" "}
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
              viewport={{ once: true }}
              style={{
                marginTop: "80px",
                textAlign: "center",
                background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(212,175,55,0.1))",
                padding: "clamp(40px, 8vw, 60px) clamp(20px, 5vw, 40px)",
                borderRadius: "24px",
              }}
            >
              <h2
                style={{
                  fontSize: "clamp(1.5rem, 4vw, 2rem)",
                  marginBottom: "20px",
                  color: "#e5e7eb",
                }}
              >
                {" "}
                Ready to plan your next adventure?{" "}
              </h2>
              <button
                onClick={() => navigate("/explore")}
                className="btn btn-primary"
                style={{
                  padding: "clamp(12px, 2vw, 16px) clamp(28px, 5vw, 40px)",
                  fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
                  borderRadius: "999px",
                  fontWeight: 600,
                }}
              >
                {" "}
                🗺️ Explore All Destinations{" "}
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
