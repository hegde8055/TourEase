// /client/src/components/ScrollToTop.js
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop Component
 * ---------------------
 * Ensures that the page scrolls to the top when navigating between routes
 * or query parameters (e.g. /profile → /profile?tab=about).
 *
 * - Smooth scroll on desktops & tablets
 * - Instant scroll on smaller mobile screens (better performance)
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const isMobile = window.innerWidth < 768; // Responsive check
    const scrollBehavior = isMobile ? "auto" : "smooth";

    window.scrollTo({ top: 0, behavior: scrollBehavior });
  }, [pathname, search]);

  return null;
}
