import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../App";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:5000";

const buildEmptyDestinationForm = () => ({
  name: "",
  category: "Historical",
  headline: "",
  description: "",
  query: "",
  slug: "",
  location: {
    name: "",
    formatted: "",
    city: "",
    state: "",
    country: "India",
    coordinates: { lat: "", lng: "" },
  },
  rating: "",
  entryFee: "",
  timings: "",
  bestTimeToVisit: "",
  heroImage: "",
  heroImageAttribution: "",
  heroImageSource: "manual",
  highlights: [],
  activities: [],
  nearbyAttractions: [],
  travelTips: [],
  tags: [],
  contactNumber: "",
  website: "",
  trending: false,
  trendingRank: "",
});

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingDestination, setEditingDestination] = useState(null);
  const [formData, setFormData] = useState(buildEmptyDestinationForm());

  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  const formatCoordinate = (value) => {
    if (value === null || value === undefined || value === "") return "";
    return value.toString();
  };

  const coerceArrayForForm = (value) => {
    if (!Array.isArray(value)) return [];
    if (value.every((item) => typeof item === "string")) {
      return value;
    }
    return value.map((item) => {
      if (item && typeof item === "object") {
        const parts = [item.name, item.distance, item.description]
          .filter(Boolean)
          .map((part) => part.toString().trim());
        if (parts.length > 0) {
          return parts.join(" | ");
        }
      }
      return (item ?? "").toString();
    });
  };

  const mapDestinationToForm = (destination) => {
    if (!destination) return buildEmptyDestinationForm();
    const base = buildEmptyDestinationForm();
    return {
      ...base,
      name: destination.name || base.name,
      category: destination.category || base.category,
      headline: destination.headline || "",
      description: destination.description || "",
      query: destination.query || "",
      slug: destination.slug || "",
      location: {
        ...base.location,
        ...(destination.location || {}),
        coordinates: {
          lat: formatCoordinate(destination.location?.coordinates?.lat),
          lng: formatCoordinate(destination.location?.coordinates?.lng),
        },
      },
      rating:
        destination.rating !== undefined && destination.rating !== null
          ? destination.rating.toString()
          : "",
      entryFee: destination.entryFee || "",
      timings: destination.timings || "",
      bestTimeToVisit: destination.bestTimeToVisit || "",
      heroImage: destination.heroImage || "",
      heroImageAttribution: destination.heroImageAttribution || "",
      heroImageSource: destination.heroImageSource || "manual",
      highlights: coerceArrayForForm(destination.highlights),
      activities: coerceArrayForForm(destination.activities),
      nearbyAttractions: coerceArrayForForm(destination.nearbyAttractions),
      travelTips: coerceArrayForForm(destination.travelTips),
      tags: coerceArrayForForm(destination.tags),
      contactNumber: destination.contactNumber || "",
      website: destination.website || "",
      trending: Boolean(destination.trending),
      trendingRank:
        destination.trendingRank !== undefined && destination.trendingRank !== null
          ? destination.trendingRank.toString()
          : "",
    };
  };

  const buildSubmitPayload = (data) => {
    const coordinates = data.location?.coordinates || {};
    const lat =
      coordinates.lat !== "" && coordinates.lat !== undefined
        ? parseFloat(coordinates.lat)
        : undefined;
    const lng =
      coordinates.lng !== "" && coordinates.lng !== undefined
        ? parseFloat(coordinates.lng)
        : undefined;

    const payload = {
      ...data,
      location: {
        ...data.location,
        coordinates:
          lat !== undefined && !Number.isNaN(lat) && lng !== undefined && !Number.isNaN(lng)
            ? { lat, lng }
            : undefined,
      },
      rating: data.rating === "" ? undefined : parseFloat(data.rating),
      trendingRank: data.trendingRank === "" ? undefined : parseInt(data.trendingRank, 10),
    };

    if (!payload.location.coordinates) {
      delete payload.location.coordinates;
    }

    if (!payload.trending) {
      delete payload.trendingRank;
    }

    return payload;
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/admin/stats`, {
        headers: getAuthHeaders(),
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      if (error.response?.status === 403) {
        alert("Access denied. Admin privileges required.");
        navigate("/explore");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/admin/destinations`, {
        headers: getAuthHeaders(),
      });
      setDestinations(response.data.destinations);
    } catch (error) {
      console.error("Failed to fetch destinations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/admin/users`, {
        headers: getAuthHeaders(),
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "destinations") {
      fetchDestinations();
    } else if (activeTab === "users") {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleCreateDestination = async (e) => {
    e.preventDefault();
    try {
      const payload = buildSubmitPayload(formData);
      await axios.post(`${API_BASE}/api/admin/destinations`, payload, {
        headers: getAuthHeaders(),
      });
      alert("Destination created successfully!");
      setShowModal(false);
      resetForm();
      fetchDestinations();
    } catch (error) {
      console.error("Failed to create destination:", error);
      alert("Failed to create destination: " + error.response?.data?.error);
    }
  };

  const handleUpdateDestination = async (e) => {
    e.preventDefault();
    try {
      const payload = buildSubmitPayload(formData);
      await axios.put(`${API_BASE}/api/admin/destinations/${editingDestination._id}`, payload, {
        headers: getAuthHeaders(),
      });
      alert("Destination updated successfully!");
      setShowModal(false);
      setEditingDestination(null);
      resetForm();
      fetchDestinations();
    } catch (error) {
      console.error("Failed to update destination:", error);
      alert("Failed to update destination: " + error.response?.data?.error);
    }
  };

  const handleDeleteDestination = async (id) => {
    if (!window.confirm("Are you sure you want to delete this destination?")) {
      return;
    }
    try {
      await axios.delete(`${API_BASE}/api/admin/destinations/${id}`, {
        headers: getAuthHeaders(),
      });
      alert("Destination deleted successfully!");
      fetchDestinations();
    } catch (error) {
      console.error("Failed to delete destination:", error);
      alert("Failed to delete destination");
    }
  };

  const handleToggleAdmin = async (userId) => {
    try {
      await axios.patch(
        `${API_BASE}/api/admin/users/${userId}/toggle-admin`,
        {},
        { headers: getAuthHeaders() }
      );
      alert("User admin status updated!");
      fetchUsers();
    } catch (error) {
      console.error("Failed to toggle admin status:", error);
      alert("Failed to update user");
    }
  };

  const openCreateModal = () => {
    resetForm();
    setEditingDestination(null);
    setShowModal(true);
  };

  const openEditModal = (destination) => {
    setEditingDestination(destination);
    setFormData(mapDestinationToForm(destination));
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData(buildEmptyDestinationForm());
  };

  const handleArrayInput = (field, value) => {
    const array = value
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item !== "");
    setFormData({ ...formData, [field]: array });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🛠️ Admin Panel</h1>
        <p style={styles.subtitle}>Manage destinations, users, and view statistics</p>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab("dashboard")}
          style={{
            ...styles.tab,
            ...(activeTab === "dashboard" ? styles.activeTab : {}),
          }}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setActiveTab("destinations")}
          style={{
            ...styles.tab,
            ...(activeTab === "destinations" ? styles.activeTab : {}),
          }}
        >
          🏛️ Destinations
        </button>
        <button
          onClick={() => setActiveTab("users")}
          style={{
            ...styles.tab,
            ...(activeTab === "users" ? styles.activeTab : {}),
          }}
        >
          👥 Users
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.content}
        >
          <div style={styles.statsGrid}>
            <div
              style={{
                ...styles.statCard,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              <div style={styles.statIcon}>🏛️</div>
              <div style={styles.statNumber}>{stats.destinations}</div>
              <div style={styles.statLabel}>Destinations</div>
            </div>
            <div
              style={{
                ...styles.statCard,
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              }}
            >
              <div style={styles.statIcon}>👥</div>
              <div style={styles.statNumber}>{stats.users}</div>
              <div style={styles.statLabel}>Users</div>
            </div>
            <div
              style={{
                ...styles.statCard,
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              }}
            >
              <div style={styles.statIcon}>📋</div>
              <div style={styles.statNumber}>{stats.itineraries}</div>
              <div style={styles.statLabel}>Itineraries</div>
            </div>
            <div
              style={{
                ...styles.statCard,
                background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              }}
            >
              <div style={styles.statIcon}>🔥</div>
              <div style={styles.statNumber}>{stats.trending}</div>
              <div style={styles.statLabel}>Trending</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Destinations Tab */}
      {activeTab === "destinations" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.content}
        >
          <button onClick={openCreateModal} style={styles.createButton}>
            ➕ Add New Destination
          </button>

          {loading ? (
            <div style={styles.loading}>Loading...</div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Location</th>
                    <th style={styles.th}>Rating</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {destinations.map((dest) => (
                    <tr key={dest._id} style={styles.tr}>
                      <td style={styles.td}>{dest.name}</td>
                      <td style={styles.td}>{dest.category}</td>
                      <td style={styles.td}>
                        {dest.location?.city}, {dest.location?.state}
                      </td>
                      <td style={styles.td}>⭐ {dest.rating}</td>
                      <td style={styles.td}>
                        <button
                          onClick={() => openEditModal(dest)}
                          style={{ ...styles.actionButton, ...styles.editButton }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDestination(dest._id)}
                          style={{ ...styles.actionButton, ...styles.deleteButton }}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.content}
        >
          {loading ? (
            <div style={styles.loading}>Loading...</div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Admin</th>
                    <th style={styles.th}>Created</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} style={styles.tr}>
                      <td style={styles.td}>{u.name}</td>
                      <td style={styles.td}>{u.email}</td>
                      <td style={styles.td}>{u.isAdmin ? "✅ Yes" : "❌ No"}</td>
                      <td style={styles.td}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleToggleAdmin(u._id)}
                          style={{ ...styles.actionButton, ...styles.toggleButton }}
                        >
                          {u.isAdmin ? "Remove Admin" : "Make Admin"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Modal for Create/Edit Destination */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.modalOverlay}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={styles.modalTitle}>
                {editingDestination ? "✏️ Edit Destination" : "➕ Create New Destination"}
              </h2>
              <form
                onSubmit={editingDestination ? handleUpdateDestination : handleCreateDestination}
              >
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={styles.input}
                    >
                      <option>Historical</option>
                      <option>Hill Station</option>
                      <option>Beach</option>
                      <option>Wildlife</option>
                      <option>Religious</option>
                      <option>Adventure</option>
                      <option>City</option>
                      <option>Nature</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Headline</label>
                    <input
                      type="text"
                      value={formData.headline}
                      onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                      style={styles.input}
                      placeholder={`Explore ${formData.name || "destination"}`}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Search Query Override</label>
                    <input
                      type="text"
                      value={formData.query}
                      onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                      style={styles.input}
                      placeholder="Defaults to destination name"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Slug Override</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      style={styles.input}
                      placeholder="auto-generated-from-name"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>City *</label>
                    <input
                      type="text"
                      value={formData.location.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: { ...formData.location, city: e.target.value },
                        })
                      }
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>State *</label>
                    <input
                      type="text"
                      value={formData.location.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: { ...formData.location, state: e.target.value },
                        })
                      }
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Country</label>
                    <input
                      type="text"
                      value={formData.location.country}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: { ...formData.location, country: e.target.value },
                        })
                      }
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.location.coordinates.lat}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: {
                            ...formData.location,
                            coordinates: {
                              ...formData.location.coordinates,
                              lat: e.target.value,
                            },
                          },
                        })
                      }
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.location.coordinates.lng}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: {
                            ...formData.location,
                            coordinates: {
                              ...formData.location.coordinates,
                              lng: e.target.value,
                            },
                          },
                        })
                      }
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Rating (1-5)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Entry Fee</label>
                    <input
                      type="text"
                      value={formData.entryFee}
                      onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Timings</label>
                    <input
                      type="text"
                      value={formData.timings}
                      onChange={(e) => setFormData({ ...formData, timings: e.target.value })}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Best Time to Visit</label>
                    <input
                      type="text"
                      value={formData.bestTimeToVisit}
                      onChange={(e) =>
                        setFormData({ ...formData, bestTimeToVisit: e.target.value })
                      }
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Hero Image URL *</label>
                    <input
                      type="url"
                      value={formData.heroImage}
                      onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                      style={styles.input}
                      placeholder="https://"
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Hero Image Attribution</label>
                    <input
                      type="text"
                      value={formData.heroImageAttribution}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          heroImageAttribution: e.target.value,
                        })
                      }
                      style={styles.input}
                      placeholder="Photo by ..."
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Hero Image Source</label>
                    <input
                      type="text"
                      value={formData.heroImageSource}
                      onChange={(e) =>
                        setFormData({ ...formData, heroImageSource: e.target.value })
                      }
                      style={styles.input}
                      placeholder="manual / unsplash / pexels"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Contact Number</label>
                    <input
                      type="text"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Website</label>
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.checkboxLabel}>Featured in Trending</label>
                    <div style={styles.checkboxRow}>
                      <input
                        type="checkbox"
                        checked={formData.trending}
                        onChange={(e) => setFormData({ ...formData, trending: e.target.checked })}
                        style={styles.checkbox}
                      />
                      <span style={styles.checkboxHint}>
                        Toggle to surface this destination in the trending carousel
                      </span>
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Trending Rank</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.trendingRank}
                      onChange={(e) => setFormData({ ...formData, trendingRank: e.target.value })}
                      style={styles.input}
                      disabled={!formData.trending}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{ ...styles.input, minHeight: "80px" }}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Highlights (one per line)</label>
                  <textarea
                    value={formData.highlights.join("\n")}
                    onChange={(e) => handleArrayInput("highlights", e.target.value)}
                    style={{ ...styles.input, minHeight: "80px" }}
                    placeholder="Beautiful architecture&#10;Historical significance&#10;Photography spot"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Activities (one per line)</label>
                  <textarea
                    value={formData.activities.join("\n")}
                    onChange={(e) => handleArrayInput("activities", e.target.value)}
                    style={{ ...styles.input, minHeight: "80px" }}
                    placeholder="Sightseeing&#10;Photography&#10;Guided tours"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Nearby Attractions (one per line)</label>
                  <textarea
                    value={formData.nearbyAttractions.join("\n")}
                    onChange={(e) => handleArrayInput("nearbyAttractions", e.target.value)}
                    style={{ ...styles.input, minHeight: "80px" }}
                    placeholder="Place 1&#10;Place 2&#10;Place 3"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Travel Tips (one per line)</label>
                  <textarea
                    value={formData.travelTips.join("\n")}
                    onChange={(e) => handleArrayInput("travelTips", e.target.value)}
                    style={{ ...styles.input, minHeight: "80px" }}
                    placeholder="Carry water bottles&#10;Book tickets in advance"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Tags (one per line)</label>
                  <textarea
                    value={formData.tags.join("\n")}
                    onChange={(e) => handleArrayInput("tags", e.target.value)}
                    style={{ ...styles.input, minHeight: "80px" }}
                    placeholder="heritage&#10;palace&#10;family"
                  />
                </div>

                <div style={styles.modalButtons}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>
                  <button type="submit" style={styles.submitButton}>
                    {editingDestination ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "40px 20px",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "48px",
    fontWeight: "bold",
    color: "#fff",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "18px",
    color: "rgba(255, 255, 255, 0.9)",
  },
  tabs: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginBottom: "30px",
  },
  tab: {
    padding: "12px 30px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#fff",
    background: "rgba(255, 255, 255, 0.2)",
    border: "2px solid transparent",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  activeTab: {
    background: "#fff",
    color: "#667eea",
    borderColor: "#fff",
  },
  content: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "30px",
  },
  statCard: {
    padding: "30px",
    borderRadius: "20px",
    color: "#fff",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  },
  statIcon: {
    fontSize: "48px",
    marginBottom: "15px",
  },
  statNumber: {
    fontSize: "48px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  statLabel: {
    fontSize: "18px",
    opacity: 0.9,
  },
  createButton: {
    padding: "15px 30px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#fff",
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    marginBottom: "30px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
  },
  tableContainer: {
    background: "#fff",
    borderRadius: "15px",
    padding: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "15px",
    textAlign: "left",
    fontWeight: "bold",
    color: "#667eea",
    borderBottom: "2px solid #667eea",
  },
  tr: {
    borderBottom: "1px solid #e0e0e0",
  },
  td: {
    padding: "15px",
    color: "#333",
  },
  actionButton: {
    padding: "8px 15px",
    fontSize: "14px",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginRight: "10px",
  },
  editButton: {
    background: "#4facfe",
    color: "#fff",
  },
  deleteButton: {
    background: "#f5576c",
    color: "#fff",
  },
  toggleButton: {
    background: "#43e97b",
    color: "#fff",
  },
  loading: {
    textAlign: "center",
    fontSize: "24px",
    color: "#fff",
    padding: "50px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    overflowY: "auto",
    padding: "20px",
  },
  modal: {
    background: "#fff",
    borderRadius: "20px",
    padding: "40px",
    maxWidth: "900px",
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalTitle: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#667eea",
    marginBottom: "30px",
    textAlign: "center",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "8px",
  },
  checkboxLabel: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "8px",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
  },
  checkboxHint: {
    fontSize: "13px",
    color: "#666",
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.3s ease",
  },
  modalButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "15px",
    marginTop: "30px",
  },
  cancelButton: {
    padding: "12px 30px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#666",
    background: "#e0e0e0",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
  submitButton: {
    padding: "12px 30px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#fff",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
};

export default Admin;
