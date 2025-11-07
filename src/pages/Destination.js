import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom"; // ✅ Added useNavigate
import Navbar from "../components/Navbar"; // ✅ Added Navbar
import InteractiveMap from "../components/InteractiveMap"; // ✅ Already correct
import { getDestinationHeroImage } from "../utils/imageHelpers";
import AIChatbot from "../components/AIChatbot";

const Destination = () => {
  const { id } = useParams(); // Get the destination ID/slug from the URL
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wiki, setWiki] = useState(null);
  const [wikiLoading, setWikiLoading] = useState(false);
  const [wikiError, setWikiError] = useState("");

  // Effect to load destination data when the component mounts or ID changes
  useEffect(() => {
    loadDestination();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Dependency array includes 'id'

  // Effect to fetch Wikipedia summary after destination data is loaded
  useEffect(() => {
    if (destination && destination.name) {
      fetchWikipedia(destination.name);
    } else {
      // Reset Wikipedia state if destination is null or has no name
      setWiki(null);
      setWikiError("");
      setWikiLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination]); // Dependency array includes 'destination'

  // Function to fetch Wikipedia summary using backend proxy
  const fetchWikipedia = async (destinationName) => {
    setWikiLoading(true);
    setWikiError("");
    setWiki(null); // Reset previous wiki data

    try {
      // Get the backend base URL from environment variables
      const backendApiUrl = process.env.REACT_APP_API_BASE || "";
      // Construct the full API endpoint URL
      const wikiApiEndpoint = `${backendApiUrl}/api/wikipedia-summary`; // Ensure this matches your backend route

      // Make the API call to your backend
      const res = await fetch(`${wikiApiEndpoint}?title=${encodeURIComponent(destinationName)}`);

      if (!res.ok) {
        // Handle HTTP errors (like 404, 500)
        const errorData = await res.json().catch(() => ({})); // Try to parse error JSON
        throw new Error(
          errorData.error || `Wikipedia API request failed: ${res.statusText} (${res.status})`
        );
      }

      const data = await res.json();

      // Check if the backend response indicates success and data exists
      if (data.success && data.extract) {
        setWiki(data); // Set the Wikipedia data state
      } else {
        // Handle cases where backend found no summary or returned an error
        setWikiError(data.error || "No relevant Wikipedia summary found.");
      }
    } catch (err) {
      console.error("Wikipedia fetch error:", err);
      // Set a user-friendly error message
      setWikiError(
        "Failed to fetch Wikipedia summary. Please check your connection or try again later."
      );
    } finally {
      setWikiLoading(false); // Ensure loading state is turned off
    }
  };

  // Function to load destination details from the API
  // Function to load destination details from the API (auto-fetching upgrade)
  const loadDestination = async () => {
    try {
      setLoading(true);
      setError("");
      setDestination(null);

      // Try fetching from main destinations endpoint
      let response = await fetch(`/api/destinations/${id}`);
      if (!response.ok) {
        // Fallback to trending API if not found
        response = await fetch(`/api/trending/${id}`);
      }

      const data = await response.json();

      if (data.success === false || !data.destination) {
        setError("Destination data could not be found.");
        return;
      }

      // Normalize result
      const normalizedData = data.destination || data;
      setDestination(normalizedData);
    } catch (err) {
      console.error("Error loading destination:", err);
      setError(
        "Failed to load destination details. Please check your connection or try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // --- Utility Functions ---
  // Safely extract coordinates using the helper
  const fallbackImage =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";

  // --- Render Logic ---

  // Loading State UI
  if (loading) {
    return (
      <>
        <Navbar />
        <div
          className="main-content"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "calc(100vh - 80px)",
            color: "#cbd5e1",
            fontSize: "1.2rem",
          }}
        >
          ⏳ Loading destination details...
        </div>
        <AIChatbot />
      </>
    );
  }

  // Error State or No Destination Found UI
  if (error || !destination) {
    return (
      <>
        <Navbar />
        <div
          className="main-content container"
          style={{ textAlign: "center", padding: "60px 20px" }}
        >
          <h2 style={{ color: "#fca5a5", marginBottom: "20px", fontSize: "1.5rem" }}>
            😕 {error || "Sorry, we couldn't find details for this destination."}
          </h2>
          <button onClick={() => navigate("/")} className="btn btn-primary">
            ← Back to Home
          </button>
        </div>
        <AIChatbot />
      </>
    );
  }

  // --- Data Extraction for Rendering (with fallbacks) ---
  const heroImage = getDestinationHeroImage(destination, {
    size: "1200x600",
    querySuffix: "India landmark travel cinematic high resolution", // More specific query
  });
  const name = destination.name || "Destination Details";
  // Prioritize summary, then description
  const summary =
    destination.summary || destination.description || "No summary available for this destination.";
  // Use curatedHighlights if available, otherwise fall back to highlights
  const highlights = destination.curatedHighlights || destination.highlights || [];
  const nearby = destination.nearbyAttractions || [];
  const bestTime = destination.bestTimeToVisit || "Information not available";
  const entryFee = destination.entryFee || "Information not available";
  const duration = destination.recommendedDuration || "Information not available";
  // Get formatted location or fallback address
  const locationFormatted =
    destination.location?.formatted || destination.address || "Location details not available";
  // Safe coordinate extraction (handles both formats)
  const coordinates =
    destination.location?.coordinates ||
    (destination.location?.lat && destination.location?.lng
      ? [destination.location.lng, destination.location.lat]
      : null);

  // Safely slice photos array, ensuring it exists
  const photos = Array.isArray(destination.photos) ? destination.photos.slice(1, 7) : [];
  // Safely slice reviews array, ensuring it exists
  const reviews = Array.isArray(destination.reviews) ? destination.reviews.slice(0, 5) : [];

  // --- Main Component Render ---
  return (
    <div className="main-content">
      <Navbar />
      <div className="container" style={{ paddingTop: "40px", paddingBottom: "60px" }}>
        {/* Main content card */}
        <div
          className="profile-card"
          style={{ maxWidth: "1000px", margin: "0 auto", padding: "clamp(20px, 5vw, 40px)" }}
        >
          {" "}
          {/* Added responsive padding */}
          {/* Hero Image */}
          {/* Hero Image */}
          {heroImage && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                borderRadius: "20px",
                overflow: "hidden",
                marginBottom: "30px",
                position: "relative",
              }}
            >
              <img
                src={heroImage || fallbackImage}
                alt={name ? `Scenic view of ${name}` : "Destination landscape"}
                onError={(e) => (e.currentTarget.src = fallbackImage)}
                style={{
                  width: "100%",
                  height: "420px",
                  objectFit: "cover",
                  filter: "brightness(80%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  width: "100%",
                  padding: "40px 20px",
                  background: "linear-gradient(0deg, rgba(0,0,0,0.7), rgba(0,0,0,0.1))",
                  color: "#fff",
                }}
              >
                <h1
                  style={{
                    fontSize: "2.8rem",
                    fontWeight: 700,
                    color: "#d4af37",
                    marginBottom: "8px",
                    textAlign: "center",
                  }}
                >
                  {name}
                </h1>
                <p style={{ color: "#cbd5e1", fontSize: "1.1rem", textAlign: "center" }}>
                  {locationFormatted || "Address unavailable"}
                </p>
              </div>
            </motion.div>
          )}
          {/* Key Information Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", // Adjust min width for responsiveness
              gap: "25px", // Increased gap
              marginBottom: "35px", // More space below grid
              padding: "25px", // More padding
              background: "rgba(255, 255, 255, 0.04)", // Slightly more visible background
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.08)", // Subtle border
            }}
          >
            {/* Grid Item Template */}
            <div style={{ paddingBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <strong
                style={{
                  color: "#60a5fa",
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "0.9rem",
                }}
              >
                📅 Best Time to Visit:
              </strong>
              <span style={{ color: "#cbd5e1", fontSize: "1rem" }}>{bestTime}</span>
            </div>
            <div style={{ paddingBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <strong
                style={{
                  color: "#60a5fa",
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "0.9rem",
                }}
              >
                ⏳ Recommended Duration:
              </strong>
              <span style={{ color: "#cbd5e1", fontSize: "1rem" }}>{duration}</span>
            </div>
            <div style={{ paddingBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <strong
                style={{
                  color: "#60a5fa",
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "0.9rem",
                }}
              >
                💰 Entry Fee Info:
              </strong>
              <span style={{ color: "#cbd5e1", fontSize: "1rem" }}>{entryFee}</span>
            </div>
            <div style={{ gridColumn: "1 / -1", paddingTop: "10px" }}>
              {" "}
              {/* Full width for location */}
              <strong
                style={{
                  color: "#60a5fa",
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "0.9rem",
                }}
              >
                📍 Location:
              </strong>
              <span style={{ color: "#cbd5e1", fontSize: "1rem", lineHeight: 1.5 }}>
                {locationFormatted}
              </span>
            </div>
          </div>
          {/* Summary/Description Section */}
          <section style={{ marginBottom: "35px" }}>
            <h3
              style={{
                color: "#60a5fa",
                fontSize: "1.4rem",
                fontWeight: 700,
                marginBottom: 15,
                borderBottom: "2px solid #60a5fa",
                paddingBottom: "8px",
                display: "inline-block",
              }}
            >
              📝 About {name}
            </h3>
            <p style={{ color: "#cbd5e1", fontSize: "1.1rem", lineHeight: "1.8" }}>{summary}</p>
          </section>
          {/* Highlights Section */}
          {highlights.length > 0 && (
            <section style={{ marginBottom: "35px" }}>
              <h3
                style={{
                  color: "#60a5fa",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  marginBottom: 15,
                  borderBottom: "2px solid #60a5fa",
                  paddingBottom: "8px",
                  display: "inline-block",
                }}
              >
                ✨ Must-See Highlights
              </h3>
              <ul
                style={{
                  listStyle: "none",
                  paddingLeft: 0,
                  columnCount: highlights.length > 5 ? 2 : 1,
                  columnGap: "20px",
                }}
              >
                {" "}
                {/* Multi-column for longer lists */}
                {highlights.map((item, index) => (
                  <li
                    key={index}
                    style={{
                      color: "#cbd5e1",
                      marginBottom: "10px",
                      paddingLeft: "28px",
                      position: "relative",
                      fontSize: "1.05rem",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        color: "#d4af37",
                        fontSize: "1.2rem",
                      }}
                    >
                      ✓
                    </span>{" "}
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {/* Nearby Attractions Section */}
          {nearby.length > 0 && (
            <section style={{ marginBottom: "35px" }}>
              <h3
                style={{
                  color: "#60a5fa",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  marginBottom: 15,
                  borderBottom: "2px solid #60a5fa",
                  paddingBottom: "8px",
                  display: "inline-block",
                }}
              >
                🏞️ Explore Nearby
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {nearby.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      padding: "15px 20px",
                      borderRadius: "10px",
                      borderLeft: "4px solid #d4af37",
                    }}
                  >
                    <strong
                      style={{
                        color: "#fcd34d",
                        display: "block",
                        marginBottom: "5px",
                        fontSize: "1.1rem",
                      }}
                    >
                      {item.name}
                    </strong>
                    <p style={{ color: "#cbd5e1", margin: 0, fontSize: "1rem" }}>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
          {/* Wikipedia Summary Section */}
          <section style={{ marginBottom: "35px" }}>
            <h3
              style={{
                color: "#60a5fa",
                fontSize: "1.4rem",
                fontWeight: 700,
                marginBottom: 15,
                borderBottom: "2px solid #60a5fa",
                paddingBottom: "8px",
                display: "inline-block",
              }}
            >
              📚 More Info (Wikipedia)
            </h3>
            {wikiLoading ? (
              <div style={{ color: "#cbd5e1" }}>⏳ Loading Wikipedia summary...</div>
            ) : wiki && wiki.extract ? (
              <div
                style={{
                  background: "rgba(255,255,255,0.05)",
                  padding: "20px",
                  borderRadius: "12px",
                  color: "#cbd5e1",
                }}
              >
                <div style={{ fontSize: "1.05rem", marginBottom: 12, lineHeight: 1.7 }}>
                  {wiki.extract}
                </div>
                {wiki.content_urls?.desktop?.page && (
                  <a
                    href={wiki.content_urls.desktop.page}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#60a5fa", textDecoration: "underline", fontWeight: 600 }}
                  >
                    Read the full article on Wikipedia →
                  </a>
                )}
              </div>
            ) : (
              <div style={{ color: "#9ca3af" }}>
                {wikiError || "No Wikipedia summary seems to be available for this specific place."}
              </div>
            )}
          </section>
          {/* Photo Gallery Section */}
          {photos.length > 0 && (
            <section style={{ marginBottom: "35px" }}>
              <h3
                style={{
                  color: "#60a5fa",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  marginBottom: 16,
                  borderBottom: "2px solid #60a5fa",
                  paddingBottom: "8px",
                  display: "inline-block",
                }}
              >
                📸 Photo Gallery
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "16px",
                }}
              >
                {photos.map((photoUrl, index) => (
                  <img
                    key={index}
                    src={photoUrl}
                    // *** ALT TEXT FIX ***
                    alt={name ? `${name} gallery ${index + 1}` : `Gallery view ${index + 1}`} // Descriptive, unique per image
                    loading="lazy" // Lazy load gallery images
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      cursor: "pointer", // Could add a lightbox later
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "scale(1.04)";
                      e.target.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                      e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ))}
              </div>
            </section>
          )}
          {/* Reviews Section */}
          {reviews.length > 0 && (
            <section style={{ marginBottom: "35px" }}>
              <h3
                style={{
                  color: "#60a5fa",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  marginBottom: 16,
                  borderBottom: "2px solid #60a5fa",
                  paddingBottom: "8px",
                  display: "inline-block",
                }}
              >
                💬 Recent Reviews
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {reviews.map((review, index) => (
                  <div
                    key={index}
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      padding: "16px",
                      borderRadius: "12px",
                      borderLeft: "4px solid #60a5fa", // Blue accent
                    }}
                  >
                    {/* Review Header */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                        flexWrap: "wrap",
                        gap: "10px",
                      }}
                    >
                      <strong style={{ color: "#d4af37", fontSize: "1.05rem" }}>
                        {review.author_name || "Visitor"}
                      </strong>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {review.rating != null && (
                          <span style={{ color: "#fbbf24", fontSize: "1rem" }}>
                            {"⭐".repeat(review.rating)}
                          </span>
                        )}
                        {review.relative_time_description && (
                          <span style={{ color: "#9ca3af", fontSize: "0.85rem" }}>
                            {review.relative_time_description}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Review Text */}
                    {review.text && (
                      <p style={{ color: "#cbd5e1", margin: 0, fontSize: "1rem", lineHeight: 1.6 }}>
                        "{review.text}" {/* Adding quotes */}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          {/* Interactive Map Section */}
          {coordinates && (
            <section style={{ marginBottom: "35px" }}>
              <h3
                style={{
                  color: "#60a5fa",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  marginBottom: 16,
                  borderBottom: "2px solid #60a5fa",
                  paddingBottom: "8px",
                  display: "inline-block",
                }}
              >
                🗺️ Location Map
              </h3>
              <div
                style={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <InteractiveMap coordinates={coordinates} name={name} address={locationFormatted} />
              </div>
            </section>
          )}
          {/* Back Button */}
          <div style={{ marginTop: "40px", textAlign: "center" }}>
            <button
              onClick={() => navigate("/")} // Navigate to home
              className="btn btn-primary"
              style={{
                padding: "14px 32px",
                fontSize: "1.1rem",
                borderRadius: "999px", // Pill shape
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      <AIChatbot />
    </div>
  );
};

export default Destination;
