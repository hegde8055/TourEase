// InteractiveMap.js
import React, { useEffect, useMemo, useRef, useState } from "react";
// Import the routing functions that call your secure backend
import { calculateDistance } from "../utils/routingUtils"; // Only need calculateDistance now

// === LEAFLET LOADER ===
const LEAFLET_CSS_ID = "leaflet-css";
const LEAFLET_JS_ID = "leaflet-js";
const loadLeaflet = () => {
  if (window.L) return Promise.resolve(window.L);
  if (window.__leafletLoadingPromise) return window.__leafletLoadingPromise;

  window.__leafletLoadingPromise = new Promise((resolve, reject) => {
    try {
      console.log("🗺️  Loading Leaflet...");
      if (!document.getElementById(LEAFLET_CSS_ID)) {
        const link = document.createElement("link");
        link.id = LEAFLET_CSS_ID;
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.css";
        link.crossOrigin = "anonymous";
        document.head.appendChild(link);
      }
      const script = document.createElement("script");
      script.id = LEAFLET_JS_ID;
      script.src = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.js";
      script.crossOrigin = "anonymous";
      script.async = true;
      script.onload = () => {
        console.log("✓ Leaflet loaded successfully");
        resolve(window.L);
      };
      script.onerror = () => {
        console.error("Failed to load Leaflet");
        reject(new Error("Failed to load Leaflet"));
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error("Error setting up Leaflet:", error);
      reject(error);
    }
  });
  return window.__leafletLoadingPromise;
};
// === END OF LOADER ===

// === UTILITY FUNCTIONS ===
const normalizeCoordinates = (value) => {
  if (!value) return null;
  if (typeof value === "object" && !Array.isArray(value)) {
    const latCandidate =
      value.lat ??
      value.latitude ??
      value.Latitude ??
      (Array.isArray(value.coordinates) ? value.coordinates[1] : (value.y ?? value[1]));
    const lngCandidate =
      value.lng ??
      value.lon ??
      value.longitude ??
      value.Longitude ??
      (Array.isArray(value.coordinates) ? value.coordinates[0] : (value.x ?? value[0]));
    if (Number.isFinite(Number(latCandidate)) && Number.isFinite(Number(lngCandidate))) {
      return { lat: Number(latCandidate), lng: Number(lngCandidate) };
    }
  }
  if (Array.isArray(value)) {
    const [first, second] = value.length === 2 ? value : [value[0], value[1]];
    if (Number.isFinite(Number(first)) && Number.isFinite(Number(second))) {
      // Basic check for lat/lng order (latitude is between -90 and 90)
      if (Math.abs(Number(first)) <= 90 && Math.abs(Number(second)) <= 180) {
        return { lat: Number(first), lng: Number(second) };
      } else if (Math.abs(Number(second)) <= 90 && Math.abs(Number(first)) <= 180) {
        console.warn("Detected [lng, lat] array format, converting to {lat, lng}");
        return { lat: Number(second), lng: Number(first) }; // Convert [lng, lat]
      }
    }
  }
  if (typeof value === "string") {
    const parts = value.split(/[,\s]+/).map((part) => Number(part.trim()));
    if (parts.length >= 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
      if (Math.abs(parts[0]) <= 90 && Math.abs(parts[1]) <= 180) {
        return { lat: parts[0], lng: parts[1] };
      } else if (Math.abs(parts[1]) <= 90 && Math.abs(parts[0]) <= 180) {
        console.warn("Detected lng, lat string format, converting to {lat, lng}");
        return { lat: parts[1], lng: parts[0] };
      }
    }
  }
  console.warn("Could not normalize coordinates:", value);
  return null;
};
// === END UTILITY FUNCTIONS ===

/**
 * InteractiveMap props:
 * - coordinates: destination coordinates
 * - name: destination name
 * - address: destination address
 * - userLocation: { lat, lng } OR null
 * - nearbyPlaces: array of places
 * - onRouteCalculated: callback({ distanceKm, durationMinutes }) for user-to-destination route
 */
const InteractiveMap = ({
  coordinates,
  name,
  address,
  userLocation = null,
  nearbyPlaces = [],
  onRouteCalculated = () => {},
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userToDestRouteLayerRef = useRef(null);
  const markersRef = useRef([]);
  const [mapError, setMapError] = useState("");
  const resolvedCoordinates = useMemo(() => normalizeCoordinates(coordinates), [coordinates]);

  // Icon URLs remain constant
  const iconUrls = useMemo(
    () => ({
      blue: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      red: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
      green:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
      shadow: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/dist/images/marker-shadow.png",
    }),
    []
  );

  useEffect(() => {
    if (!resolvedCoordinates) {
      console.warn("InteractiveMap: No valid destination coordinates provided.");
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return () => {};
    }

    let cancelled = false;
    let L = null; // Variable to hold Leaflet object within this effect scope

    const setupMap = async () => {
      try {
        L = await loadLeaflet(); // Assign Leaflet to local L variable
        if (cancelled || !mapContainerRef.current || !L) return; // Check L exists

        // --- FIX: Define createIcon and icons *inside* useEffect after L is loaded ---
        const createIcon = (colorUrl) => {
          try {
            return L.icon({
              // Now using the locally scoped L
              iconUrl: colorUrl,
              shadowUrl: iconUrls.shadow,
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            });
          } catch (e) {
            console.error("Failed to create Leaflet icon, falling back to default:", e);
            return L.icon(L.Icon.Default.prototype.options); // Use L here too
          }
        };

        const userIcon = createIcon(iconUrls.blue);
        const destinationIcon = createIcon(iconUrls.red);
        const nearbyIcon = createIcon(iconUrls.green);
        // --- END FIX ---

        // Clean up previous map instance AND layers/markers
        if (mapInstanceRef.current) {
          console.log("InteractiveMap: Removing previous map instance.");
          if (userToDestRouteLayerRef.current) {
            mapInstanceRef.current.removeLayer(userToDestRouteLayerRef.current);
            userToDestRouteLayerRef.current = null;
          }
          markersRef.current.forEach((marker) => {
            if (marker) mapInstanceRef.current.removeLayer(marker);
          });
          markersRef.current = [];
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Create map
        const center = [resolvedCoordinates.lat, resolvedCoordinates.lng];
        console.log("InteractiveMap: Creating map centered at:", center);

        const map = L.map(mapContainerRef.current, {
          // Use L here
          center,
          zoom: 10,
          zoomControl: false,
        });
        mapInstanceRef.current = map;

        L.control.zoom({ position: "bottomright" }).addTo(map); // Use L here
        map.attributionControl.setPrefix(false);

        // --- Use OpenStreetMap Tiles ---
        L.tileLayer(`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`, {
          // Use L here
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
          maxZoom: 19,
          minZoom: 1,
        }).addTo(map);
        // --- End Tile Layer ---

        // Helper to add marker and track
        const addTrackedMarker = (latlng, opts = {}, popupHtml = "") => {
          if (
            !mapInstanceRef.current ||
            !latlng ||
            latlng.length !== 2 ||
            latlng.some((coord) => !Number.isFinite(coord))
          ) {
            console.warn("InteractiveMap: Invalid LatLng for marker:", latlng);
            return null;
          }
          console.log("InteractiveMap: Adding marker at", latlng, "with options", opts.title || "");
          const m = L.marker(latlng, opts); // Use L here
          if (popupHtml) m.bindPopup(popupHtml);
          m.addTo(mapInstanceRef.current);
          markersRef.current.push(m);
          return m;
        };

        // --- Add Markers with Specific Icons ---
        let addedMarkerCoords = [];

        // 1. User Marker (Blue)
        if (userLocation && userLocation.lat != null && userLocation.lng != null) {
          const userLatLng = [userLocation.lat, userLocation.lng];
          const marker = addTrackedMarker(
            userLatLng,
            { icon: userIcon, title: "Your Location", zIndexOffset: 1000 },
            "<strong>You are here</strong>"
          );
          if (marker) {
            marker.openPopup();
            addedMarkerCoords.push(userLatLng);
          }
        } else {
          console.log("InteractiveMap: User location not available for marker.");
        }

        // 2. Destination Marker (Red)
        const destLatLng = [resolvedCoordinates.lat, resolvedCoordinates.lng];
        const destPopup = `
          <div style="min-width: 180px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;">
            <strong style="display:block; margin-bottom:6px;">${name || "Destination"}</strong>
            ${address ? `<div style="font-size:13px;color:#4b5563;">${address}</div>` : ""}
            <small style="color:#9ca3af;">Main Destination</small>
          </div>
        `;
        const destMarker = addTrackedMarker(
          destLatLng,
          { icon: destinationIcon, title: name || "Destination", zIndexOffset: 900 },
          destPopup
        );
        if (destMarker) addedMarkerCoords.push(destLatLng);

        // 3. Nearby Place Markers (Green)
        const normalizedNearby = (nearbyPlaces || [])
          .map((p) => {
            const coords = normalizeCoordinates(p.coordinates || p.location || p);
            if (!coords) return null;
            return { coords, name: p.name || p.title || p.label || "Place", raw: p };
          })
          .filter(Boolean);

        console.log(`InteractiveMap: Processing ${normalizedNearby.length} nearby places.`);
        if (normalizedNearby.length) {
          for (const np of normalizedNearby) {
            const nearbyLatLng = [np.coords.lat, np.coords.lng];
            if (
              Math.abs(np.coords.lat - resolvedCoordinates.lat) < 1e-6 &&
              Math.abs(np.coords.lng - resolvedCoordinates.lng) < 1e-6
            ) {
              console.log(
                "InteractiveMap: Skipping nearby place identical to destination:",
                np.name
              );
              continue;
            }
            const nearbyPopupHtml = `
              <div style="min-width:170px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto;">
                <strong style="display:block;margin-bottom:6px;">${np.name}</strong>
                <small style="color:#9ca3af;">Nearby Place</small>
              </div>
            `;
            const nearbyMarker = addTrackedMarker(
              nearbyLatLng,
              { icon: nearbyIcon, title: np.name, zIndexOffset: 800 },
              nearbyPopupHtml
            );
            if (nearbyMarker) addedMarkerCoords.push(nearbyLatLng);
          }
        }
        // --- End Add Markers ---

        // --- Calculate and Draw User-to-Destination Route ---
        if (userLocation && userLocation.lat != null && userLocation.lng != null) {
          try {
            console.log("InteractiveMap: Calculating direct route: User -> Destination");
            const routeData = await calculateDistance(userLocation, resolvedCoordinates, "drive"); // Using secure backend call

            if (cancelled) return;

            if (
              routeData &&
              routeData.polylineCoordinates &&
              routeData.polylineCoordinates.length > 0
            ) {
              console.log(
                `InteractiveMap: Direct route data received: ${routeData.distanceKm.toFixed(2)} km, ${routeData.durationMinutes} mins`
              );
              if (userToDestRouteLayerRef.current) {
                mapInstanceRef.current?.removeLayer(userToDestRouteLayerRef.current);
                userToDestRouteLayerRef.current = null;
                console.log("InteractiveMap: Removed previous route layer.");
              }

              const routeLayer = L.polyline(routeData.polylineCoordinates, {
                // Use L here
                color: "#0ea5e9",
                weight: 6,
                opacity: 0.75,
              }).addTo(mapInstanceRef.current);
              userToDestRouteLayerRef.current = routeLayer;
              console.log("InteractiveMap: Added new route layer.");

              const routeBounds = L.latLngBounds(routeData.polylineCoordinates); // Use L here
              const userLatLng = [userLocation.lat, userLocation.lng];
              const destLatLng = [resolvedCoordinates.lat, resolvedCoordinates.lng];
              const combinedBounds = routeBounds.extend(userLatLng).extend(destLatLng);

              mapInstanceRef.current?.fitBounds(combinedBounds.pad(0.2), {
                padding: [50, 50],
                maxZoom: 16,
              });
              console.log("InteractiveMap: Fitted map bounds to route.");

              onRouteCalculated({
                distanceKm: routeData.distanceKm,
                durationMinutes: routeData.durationMinutes,
              });
            } else {
              console.warn("InteractiveMap: No polyline data returned for direct route.");
              onRouteCalculated({ distanceKm: 0, durationMinutes: 0 });
              if (addedMarkerCoords.length > 0) {
                const markerBounds = L.latLngBounds(addedMarkerCoords); // Use L here
                mapInstanceRef.current?.fitBounds(markerBounds.pad(0.2), {
                  padding: [50, 50],
                  maxZoom: 16,
                });
                console.log("InteractiveMap: Fitted map bounds to markers (route failed).");
              }
            }
          } catch (err) {
            if (!cancelled) {
              console.error("InteractiveMap: Direct route calculation failed:", err);
              setMapError(`Route Calc Error: ${err.message || "Unknown"}`);
              onRouteCalculated({ distanceKm: 0, durationMinutes: 0 });
              if (addedMarkerCoords.length > 0) {
                const markerBounds = L.latLngBounds(addedMarkerCoords); // Use L here
                mapInstanceRef.current?.fitBounds(markerBounds.pad(0.2), {
                  padding: [50, 50],
                  maxZoom: 16,
                });
                console.log("InteractiveMap: Fitted map bounds to markers (route error).");
              }
            }
          }
        } else {
          console.log("InteractiveMap: User location not available for route calculation.");
          onRouteCalculated({ distanceKm: 0, durationMinutes: 0 });
          if (addedMarkerCoords.length > 0) {
            const markerBounds = L.latLngBounds(addedMarkerCoords); // Use L here
            mapInstanceRef.current?.fitBounds(markerBounds.pad(0.2), {
              padding: [50, 50],
              maxZoom: 16,
            });
            console.log("InteractiveMap: Fitted map bounds to markers (no user location).");
          } else {
            mapInstanceRef.current?.setView([resolvedCoordinates.lat, resolvedCoordinates.lng], 10);
            console.log("InteractiveMap: Setting view to destination (no markers).");
          }
        }
        // --- End Route Calculation/Drawing ---

        setMapError(""); // Clear any previous errors on successful setup
      } catch (error) {
        if (!cancelled) {
          const errMsg = error?.message || String(error) || "Unknown map error";
          console.error("InteractiveMap: Map setup failed critically:", error);
          setMapError(`Map Setup Error: ${errMsg}`);
          onRouteCalculated({ distanceKm: 0, durationMinutes: 0 });
        }
      }
    };

    setupMap();

    // Cleanup function
    return () => {
      console.log("InteractiveMap: Cleanup triggered for useEffect.");
      cancelled = true;
      // Map instance removal is handled at the start of the next setupMap call
    };
  }, [
    // --- Updated Dependencies ---
    resolvedCoordinates,
    name,
    address,
    userLocation,
    nearbyPlaces, // Main data
    iconUrls, // Add iconUrls object
    onRouteCalculated, // Callback
  ]);

  // --- Display logic ---
  if (!resolvedCoordinates) {
    return (
      // Show placeholder if no valid destination coords yet
      <div
        style={{
          width: "100%",
          height: "400px",
          background: "linear-gradient(135deg, #374151 0%, #111827 100%)",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
          fontSize: "16px",
          flexDirection: "column",
          gap: "12px",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div>Waiting for destination...</div>
        <small style={{ opacity: 0.8, fontSize: "12px" }}>
          {" "}
          Map will load once a destination is selected.{" "}
        </small>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "400px",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          overflow: "hidden",
          border: "1px solid rgba(102, 126, 234, 0.3)",
          backgroundColor: "#1f2937",
        }}
      />
      {mapError && (
        <p
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            background: "rgba(239, 68, 68, 0.85)",
            color: "white",
            padding: "6px 12px",
            borderRadius: "8px",
            zIndex: 1000,
            fontSize: "0.9rem",
            boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
          }}
        >
          {" "}
          🗺️ Map Error: {mapError}{" "}
        </p>
      )}
    </div>
  );
};

export default InteractiveMap;
