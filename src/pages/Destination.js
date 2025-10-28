import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import InteractiveMap from "../components/InteractiveMap";
import { destinationAPI } from "../utils/api";
import { getDestinationHeroImage } from "../utils/imageHelpers";
import AIChatbot from "../components/AIChatbot";

const Destination = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wiki, setWiki] = useState(null);
  const [wikiLoading, setWikiLoading] = useState(false);
  const [wikiError, setWikiError] = useState("");

  useEffect(() => {
    loadDestination();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (destination && destination.name) {
      fetchWikipedia();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination]);
  // Fetch Wikipedia summary for this destination
  const fetchWikipedia = async () => {
    setWikiLoading(true);
    setWikiError("");
    try {
      const res = await fetch(
        `/api/destinations/wikipedia?title=${encodeURIComponent(destination.name)}`
      );
      const data = await res.json();
      if (data.success) {
        setWiki(data);
      } else {
        setWiki(null);
        setWikiError(data.error || "No Wikipedia summary found");
      }
    } catch (err) {
      setWiki(null);
      setWikiError("Failed to fetch Wikipedia summary");
    } finally {
      setWikiLoading(false);
    }
  };

  const loadDestination = async () => {
    try {
      setLoading(true);
      const response = await destinationAPI.getById(id);
      setDestination(response.data);
    } catch (err) {
      setError("Failed to load destination");
      console.error("Error loading destination:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading destination...</div>
      </>
    );
  }

  if (error || !destination) {
    return (
      <>
        <Navbar />
        <div className="container" style={{ textAlign: "center", padding: "60px 20px" }}>
          <h2 style={{ color: "#fca5a5", marginBottom: "20px" }}>
            {error || "Destination not found"}
          </h2>
          <button onClick={() => navigate("/")} className="btn btn-primary">
            Back to Home
          </button>
        </div>
      </>
    );
  }

  const heroImage = destination
    ? getDestinationHeroImage(destination, {
        size: "1200x700",
        querySuffix: "India landmark cinematic",
      })
    : null;

  return (
    <div className="main-content">
      <Navbar />
      <div className="container" style={{ paddingTop: "40px", paddingBottom: "60px" }}>
        <div className="profile-card" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Hero Image */}
          {heroImage && (
            <img
              src={heroImage}
              alt={destination.name}
              style={{
                width: "100%",
                height: "450px",
                objectFit: "cover",
                borderRadius: "20px",
                marginBottom: "30px",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
              }}
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&auto=format&fit=crop";
              }}
            />
          )}

          {/* Title & Rating */}
          <div style={{ marginBottom: "24px" }}>
            <h1
              style={{
                color: "#d4af37",
                marginBottom: "12px",
                fontSize: "2.5rem",
                fontWeight: "800",
              }}
            >
              {destination.name}
            </h1>
            {/* Rating hidden as requested */}
          </div>

          {/* Address & Contact */}
          {destination.address && (
            <div
              style={{
                marginBottom: "24px",
                padding: "16px",
                background: "rgba(59, 130, 246, 0.1)",
                borderRadius: "12px",
              }}
            >
              <p style={{ color: "#cbd5e1", fontSize: "1rem", margin: 0 }}>
                📍 <strong>Address:</strong> {destination.address}
              </p>
              {destination.phone && destination.phone !== "N/A" && (
                <p style={{ color: "#cbd5e1", fontSize: "1rem", margin: "8px 0 0 0" }}>
                  📞 <strong>Phone:</strong> {destination.phone}
                </p>
              )}
              {destination.website && destination.website !== "N/A" && (
                <p style={{ color: "#cbd5e1", fontSize: "1rem", margin: "8px 0 0 0" }}>
                  🌐 <strong>Website:</strong>{" "}
                  <a
                    href={destination.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#3b82f6", textDecoration: "none" }}
                  >
                    Visit Website
                  </a>
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <p
            style={{
              color: "#cbd5e1",
              fontSize: "1.1rem",
              lineHeight: "1.8",
              marginBottom: "30px",
            }}
          >
            {destination.description}
          </p>

          {/* Wikipedia Summary */}
          <div style={{ marginBottom: "30px" }}>
            <h3 style={{ color: "#3b82f6", fontSize: "1.3rem", fontWeight: 700, marginBottom: 12 }}>
              📚 About (Wikipedia)
            </h3>
            {wikiLoading ? (
              <div style={{ color: "#cbd5e1" }}>Loading Wikipedia summary...</div>
            ) : wiki && wiki.extract ? (
              <div
                style={{
                  background: "rgba(255,255,255,0.05)",
                  padding: "16px",
                  borderRadius: "12px",
                  color: "#cbd5e1",
                  marginBottom: "8px",
                }}
              >
                <div style={{ fontSize: "1.05rem", marginBottom: 8 }}>{wiki.extract}</div>
                {wiki.content_urls?.desktop?.page && (
                  <a
                    href={wiki.content_urls.desktop.page}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#3b82f6", textDecoration: "underline" }}
                  >
                    Read more on Wikipedia
                  </a>
                )}
              </div>
            ) : wikiError ? (
              <div style={{ color: "#fca5a5" }}>{wikiError}</div>
            ) : null}
          </div>

          {/* Opening Hours */}
          {destination.opening_hours && destination.opening_hours.length > 0 && (
            <div style={{ marginBottom: "30px" }}>
              <h3
                style={{
                  color: "#3b82f6",
                  marginBottom: "12px",
                  fontSize: "1.3rem",
                  fontWeight: "700",
                }}
              >
                🕐 Opening Hours
              </h3>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  padding: "16px",
                  borderRadius: "12px",
                }}
              >
                {destination.opening_hours.map((hour, index) => (
                  <p
                    key={index}
                    style={{
                      color: "#cbd5e1",
                      margin: "6px 0",
                      fontSize: "0.95rem",
                    }}
                  >
                    {hour}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Photo Gallery */}
          {destination.photos && destination.photos.length > 1 && (
            <div style={{ marginBottom: "30px" }}>
              <h3
                style={{
                  color: "#3b82f6",
                  marginBottom: "16px",
                  fontSize: "1.3rem",
                  fontWeight: "700",
                }}
              >
                📸 Photo Gallery
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "16px",
                }}
              >
                {destination.photos.slice(1, 7).map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`${destination.name} ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "transform 0.3s",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                    }}
                    onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                    onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {destination.reviews && destination.reviews.length > 0 && (
            <div style={{ marginBottom: "30px" }}>
              <h3
                style={{
                  color: "#3b82f6",
                  marginBottom: "16px",
                  fontSize: "1.3rem",
                  fontWeight: "700",
                }}
              >
                💬 Reviews
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {destination.reviews.slice(0, 5).map((review, index) => (
                  <div
                    key={index}
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      padding: "16px",
                      borderRadius: "12px",
                      borderLeft: "4px solid #3b82f6",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "8px",
                      }}
                    >
                      <strong style={{ color: "#d4af37" }}>{review.author_name}</strong>
                      <span style={{ color: "#fbbf24" }}>{"⭐".repeat(review.rating)}</span>
                      <span style={{ color: "#9ca3af", fontSize: "0.85rem" }}>
                        {review.relative_time_description}
                      </span>
                    </div>
                    <p style={{ color: "#cbd5e1", margin: 0, fontSize: "0.95rem" }}>
                      {review.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Map */}
          {destination.coordinates && (
            <InteractiveMap
              coordinates={destination.coordinates}
              name={destination.name}
              address={destination.address}
            />
          )}

          {/* Back Button */}
          <div style={{ marginTop: "40px", textAlign: "center" }}>
            <button
              onClick={() => navigate("/")}
              className="btn btn-primary"
              style={{
                padding: "14px 32px",
                fontSize: "1.1rem",
                borderRadius: "999px",
              }}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* AI Chatbot Integration */}
      <AIChatbot />
    </div>
  );
};

export default Destination;
