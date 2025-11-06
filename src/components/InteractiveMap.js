// InteractiveMap.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { calculateMultiPointRoute } from "../utils/routingUtils"; // 🔹 include multi-point route

const LEAFLET_CSS_ID = "leaflet-css";
const LEAFLET_JS_ID = "leaflet-js";

const loadLeaflet = () => {
  if (window.L) return Promise.resolve(window.L);
  if (window.__leafletLoadingPromise) return window.__leafletLoadingPromise;

  window.__leafletLoadingPromise = new Promise((resolve, reject) => {
    try {
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
      script.onload = () => resolve(window.L);
      script.onerror = () => reject(new Error("Failed to load Leaflet"));
      document.head.appendChild(script);
    } catch (error) {
      reject(error);
    }
  });

  return window.__leafletLoadingPromise;
};

// Normalize coordinates safely
const normalizeCoordinates = (value) => {
  if (!value) return null;
  if (Array.isArray(value)) {
    const [a, b] = value;
    if (Math.abs(a) <= 90 && Math.abs(b) <= 180) return { lat: a, lng: b };
    if (Math.abs(b) <= 90 && Math.abs(a) <= 180) return { lat: b, lng: a };
  }
  if (typeof value === "object") {
    const { lat, lng, latitude, longitude } = value;
    return { lat: lat ?? latitude, lng: lng ?? longitude };
  }
  return null;
};

/**
 * Props:
 * - coordinates: destination coordinates
 * - name: destination name
 * - address: destination address
 * - userLocation: { lat, lng }
 * - nearbyPlaces: array of nearby places
 * - showRoute: boolean (NEW)
 * - onRouteCalculated: callback
 */
const InteractiveMap = ({
  coordinates,
  name,
  address,
  userLocation = null,
  nearbyPlaces = [],
  showRoute = true, // 🔹 default true for highlight
  onRouteCalculated = () => {},
  precomputedRoute = null,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLayerRef = useRef(null);
  const markersRef = useRef([]);
  const addedCoordsRef = useRef([]);
  const onRouteCalculatedRef = useRef(onRouteCalculated);
  const routeRequestIdRef = useRef(0);
  const lastRouteSignatureRef = useRef(null);
  const [mapError, setMapError] = useState("");

  const resolvedCoordinates = useMemo(() => normalizeCoordinates(coordinates), [coordinates]);

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
    onRouteCalculatedRef.current = onRouteCalculated;
  }, [onRouteCalculated]);

  useEffect(() => {
    if (!resolvedCoordinates) return;

    let cancelled = false;

    const setupMap = async () => {
      try {
        const L = await loadLeaflet();
        if (cancelled || !mapContainerRef.current) return;

        let map = mapInstanceRef.current;
        if (!map) {
          map = L.map(mapContainerRef.current, {
            center: [resolvedCoordinates.lat, resolvedCoordinates.lng],
            zoom: 10,
            zoomControl: false,
            zoomAnimation: false,
          });
          mapInstanceRef.current = map;
          L.control.zoom({ position: "bottomright" }).addTo(map);

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
            maxZoom: 19,
          }).addTo(map);
        } else {
          map.setView([resolvedCoordinates.lat, resolvedCoordinates.lng]);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Map setup failed:", err);
          setMapError(err.message || "Failed to initialize map");
        }
      }
    };

    setupMap();

    return () => {
      cancelled = true;
    };
  }, [resolvedCoordinates]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = window.L;
    if (!map || !L || !resolvedCoordinates) return;

    const createIcon = (url) =>
      L.icon({
        iconUrl: url,
        shadowUrl: iconUrls.shadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

    const userIcon = createIcon(iconUrls.blue);
    const destIcon = createIcon(iconUrls.red);
    const nearIcon = createIcon(iconUrls.green);

    if (markersRef.current.length) {
      markersRef.current.forEach((marker) => {
        if (marker) {
          map.removeLayer(marker);
        }
      });
      markersRef.current = [];
    }

    const addedCoords = [];

    if (userLocation?.lat && userLocation?.lng) {
      const marker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        title: "Your Location",
      }).bindPopup("<strong>You are here</strong>");

      marker.addTo(map);
      markersRef.current.push(marker);
      addedCoords.push([userLocation.lat, userLocation.lng]);
    }

    const destLatLng = [resolvedCoordinates.lat, resolvedCoordinates.lng];
    const destMarker = L.marker(destLatLng, {
      icon: destIcon,
      title: name || "Destination",
    }).bindPopup(`<b>${name || "Destination"}</b><br>${address || ""}`);

    destMarker.addTo(map);
    markersRef.current.push(destMarker);
    addedCoords.push(destLatLng);

    for (const place of nearbyPlaces) {
      const coords = normalizeCoordinates(place.coordinates || place.location);
      if (!coords) continue;

      const marker = L.marker([coords.lat, coords.lng], {
        icon: nearIcon,
        title: place.name || "Nearby place",
      }).bindPopup(`<b>${place.name || "Nearby Place"}</b>`);

      marker.addTo(map);
      markersRef.current.push(marker);
    }

    if (!routeLayerRef.current && addedCoords.length) {
      const bounds = L.latLngBounds(addedCoords);
      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.2), { padding: [50, 50] });
      }
    }

    addedCoordsRef.current = addedCoords;
  }, [resolvedCoordinates, userLocation, nearbyPlaces, name, address, iconUrls]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = window.L;
    if (!map || !L || !resolvedCoordinates) return;

    const clearRouteLayer = () => {
      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
    };

    const fitFallbackBounds = () => {
      const coords = addedCoordsRef.current || [];
      if (coords.length) {
        const bounds = L.latLngBounds(coords);
        if (bounds.isValid()) {
          map.fitBounds(bounds.pad(0.2), { padding: [50, 50] });
        }
      } else {
        map.setView([resolvedCoordinates.lat, resolvedCoordinates.lng], 10);
      }
    };

    const hasOrigin = Number.isFinite(userLocation?.lat) && Number.isFinite(userLocation?.lng);
    if (!showRoute || !hasOrigin) {
      clearRouteLayer();
      fitFallbackBounds();
      return;
    }

    const waypoints = [
      { lat: userLocation.lat, lng: userLocation.lng },
      { lat: resolvedCoordinates.lat, lng: resolvedCoordinates.lng },
    ];

    const requestId = routeRequestIdRef.current + 1;
    routeRequestIdRef.current = requestId;
    let cancelled = false;

    const applyRoute = (routeData) => {
      if (!routeData?.polylineCoordinates?.length) {
        return false;
      }

      const signature = JSON.stringify(routeData.polylineCoordinates);
      if (signature === lastRouteSignatureRef.current) {
        return true;
      }

      clearRouteLayer();

      const polyline = L.polyline(routeData.polylineCoordinates, {
        color: "#38bdf8",
        weight: 6,
        opacity: 0.8,
        lineJoin: "round",
      }).addTo(map);

      routeLayerRef.current = polyline;
      lastRouteSignatureRef.current = signature;

      const bounds = L.latLngBounds(routeData.polylineCoordinates);
      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.2), { padding: [50, 50], maxZoom: 15 });
      }

      const distanceMeters =
        routeData.distanceMeters ?? routeData.distance ?? routeData.properties?.distance ?? 0;
      const durationSeconds =
        routeData.durationSeconds ?? routeData.duration ?? routeData.properties?.time ?? 0;

      const distanceKm = Number.isFinite(distanceMeters) ? distanceMeters / 1000 : 0;
      const durationMinutes = Number.isFinite(durationSeconds)
        ? Math.round(durationSeconds / 60)
        : 0;

      onRouteCalculatedRef.current({ distanceKm, durationMinutes });
      setMapError((prev) => (prev ? "" : prev));
      return true;
    };

    const handleRouteFailure = (message) => {
      clearRouteLayer();
      fitFallbackBounds();
      setMapError(message || "Route unavailable for these waypoints.");
    };

    const resolveRoute = async () => {
      try {
        let routeData = null;
        if (precomputedRoute?.polylineCoordinates?.length) {
          routeData = precomputedRoute;
        } else {
          routeData = await calculateMultiPointRoute(waypoints, "drive");
        }

        if (cancelled || routeRequestIdRef.current !== requestId) {
          return;
        }

        if (routeData && applyRoute(routeData)) {
          return;
        }

        handleRouteFailure("Route unavailable for these waypoints.");
      } catch (error) {
        if (cancelled || routeRequestIdRef.current !== requestId) {
          return;
        }
        console.error("Route calculation failed:", error);
        handleRouteFailure(error?.message || "Route calculation failed.");
      }
    };

    resolveRoute();

    return () => {
      cancelled = true;
    };
  }, [showRoute, userLocation, resolvedCoordinates, precomputedRoute]);

  useEffect(() => {
    return () => {
      const map = mapInstanceRef.current;
      if (map) {
        if (routeLayerRef.current) {
          map.removeLayer(routeLayerRef.current);
          routeLayerRef.current = null;
        }
        if (markersRef.current.length) {
          markersRef.current.forEach((marker) => {
            if (marker) {
              map.removeLayer(marker);
            }
          });
          markersRef.current = [];
        }
        map.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Placeholder view
  if (!resolvedCoordinates) {
    return (
      <div
        style={{
          width: "100%",
          height: "400px",
          background: "linear-gradient(135deg, #374151 0%, #111827 100%)",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
        }}
      >
        Waiting for destination...
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
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
          overflow: "hidden",
        }}
      />
      {mapError && (
        <p
          style={{
            position: "absolute",
            bottom: 8,
            left: 16,
            background: "rgba(0,0,0,0.5)",
            color: "#f87171",
            padding: "6px 10px",
            borderRadius: "6px",
            fontSize: "13px",
          }}
        >
          {mapError}
        </p>
      )}
    </div>
  );
};

export default InteractiveMap;
