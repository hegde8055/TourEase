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
  // const [mapPreviews, setMapPreviews] = useState({});
  const mapPreviewsRef = useRef({});
  const navigate = useNavigate();

  const setPreviewEntry = (key, value) => {
    if (!key) return;
    mapPreviewsRef.current = { ...mapPreviewsRef.current, [key]: value };
  };

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      try {
        const results = await destinationAPI.getTrending(12);
        mapPreviewsRef.current = {};
        setDestinations(results);
      } catch (error) {
        console.error("Error fetching trending destinations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  useEffect(() => {
    if (!destinations.length) return;
    let cancelled = false;
    const loadMapsSequentially = async () => {
      for (const destination of destinations) {
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
          const provider = response.data?.provider || "geoapify";
          if (mapUrl) {
            setPreviewEntry(key, { status: "ready", url: mapUrl, provider });
          } else {
            setPreviewEntry(key, { status: "empty" });
          }
        } catch (error) {
          if (cancelled) return;
          setPreviewEntry(key, { status: "error" });
        }
      }
    };
    loadMapsSequentially();
    return () => {
      cancelled = true;
    };
  }, [destinations]);

  return (
    <div className="main-content">
      <Navbar />
      <div
        style={{
          minHeight: "100vh",
          paddingTop: "100px",
          paddingBottom: "60px",
          marginTop: "-160px",
          background:
            "radial-gradient(ellipse at top, rgba(59,130,246,0.15), transparent 50%), radial-gradient(ellipse at bottom, rgba(212,175,55,0.15), transparent 50%)",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 20px" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: "center", marginBottom: "60px" }}
          >
            <h1
              style={{
                fontSize: "4rem",
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
                fontSize: "1.2rem",
                color: "#cbd5e1",
                maxWidth: "700px",
                margin: "0 auto",
              }}
            >
              Most popular destinations in India right now - Experience what thousands of travelers
              are discovering
            </p>
          </motion.div>
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px",
                color: "#9ca3af",
                fontSize: "1.2rem",
              }}
            >
              <div style={{ fontSize: "4rem", marginBottom: "20px" }}>⏳</div>
              Loading trending destinations...
            </div>
          ) : destinations.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px",
                color: "#9ca3af",
                fontSize: "1.2rem",
              }}
            >
              <div style={{ fontSize: "4rem", marginBottom: "20px" }}>😔</div>
              No trending destinations available at the moment.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "30px",
              }}
            >
              {destinations.map((destination, index) => {
                const heroImage = getDestinationHeroImage(destination, {
                  size: "900x600",
                  querySuffix: "India landmark cinematic",
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
                      backdropFilter: "blur(16px)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      minHeight: "100%",
                      position: "relative",
                      transition: "box-shadow 0.3s ease, transform 0.3s ease",
                    }}
                  >
                    <div style={{ position: "relative", height: "200px", overflow: "hidden" }}>
                      <img
                        src={heroImage}
                        alt={destination.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          filter: "brightness(0.97)",
                          transition: "transform 0.4s ease",
                        }}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.transform = "scale(1)";
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: "14px",
                          right: "14px",
                          background: "rgba(212, 175, 55, 0.9)",
                          color: "#0b0e14",
                          padding: "7px 18px",
                          borderRadius: "999px",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          boxShadow: "0 2px 8px rgba(212, 175, 55, 0.2)",
                        }}
                      >
                        {destination.category}
                      </div>
                      <div
                        style={{
                          position: "absolute",
                          top: "14px",
                          left: "14px",
                          background: "rgba(11, 17, 32, 0.9)",
                          color: "#facc15",
                          padding: "7px 16px",
                          borderRadius: "999px",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.35)",
                        }}
                      >
                        ⭐{" "}
                        {typeof destination.rating === "number"
                          ? destination.rating.toFixed(1)
                          : destination.rating || "N/A"}
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "22px",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        gap: "12px",
                      }}
                    >
                      <h3
                        style={{
                          color: "#fcd34d",
                          fontSize: "1.25rem",
                          marginBottom: "4px",
                          fontWeight: 700,
                          letterSpacing: "0.01em",
                        }}
                      >
                        {destination.name}
                      </h3>
                      <p
                        style={{
                          color: "#b6c2d6",
                          fontSize: "0.95rem",
                          lineHeight: 1.6,
                          marginBottom: "4px",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {destination.description}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: "#e5e7eb",
                          fontSize: "0.9rem",
                          fontWeight: 500,
                        }}
                      >
                        <span style={{ fontSize: "1.1rem" }}>📍</span>
                        <span>{destination.location?.city || "India"}</span>
                      </div>
                      <div
                        style={{
                          marginTop: "auto",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px",
                            color: "#cbd5f5",
                            fontSize: "0.88rem",
                          }}
                        >
                          <span>Best time: {destination.bestTimeToVisit || "All year"}</span>
                          <span style={{ color: "#facc15", fontWeight: 600 }}>
                            {destination.entryFee || "See details"}
                          </span>
                        </div>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() =>
                            navigate(`/destination/${destination._id || destination.slug || index}`)
                          }
                          style={{
                            padding: "10px 18px",
                            borderRadius: "999px",
                            border: "none",
                            background: "linear-gradient(135deg, #d4af37 0%, #f7ef8a 100%)",
                            color: "#0b0e14",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            textAlign: "center",
                            boxShadow: "0 12px 24px rgba(212, 175, 55, 0.3)",
                          }}
                        >
                          View Details
                          <span style={{ fontSize: "1rem" }}>→</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
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
                padding: "50px 30px",
                borderRadius: "24px",
              }}
            >
              <h2
                style={{
                  fontSize: "2rem",
                  marginBottom: "20px",
                  color: "#e5e7eb",
                }}
              >
                Want to explore more destinations?
              </h2>
              <button
                onClick={() => navigate("/explore")}
                className="btn btn-primary"
                style={{
                  padding: "clamp(12px, 2vw, 18px) clamp(28px, 4vw, 48px)",
                  fontSize: "clamp(1rem, 0.95rem + 0.3vw, 1.25rem)",
                  borderRadius: "999px",
                  fontWeight: 600,
                  letterSpacing: "0.01em",
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
