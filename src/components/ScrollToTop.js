// /client/src/components/ScrollToTop.js
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop (Enhanced)
 * ----------------------
 * Forces scroll to top whenever pathname or query param changes,
 * even if it's the same page (like /profile?tab=about).
 * Includes smooth scrolling and offset for better visual centering.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();
  const prevLocation = useRef({ pathname: "", search: "" });

  useEffect(() => {
    const scrollToTop = () => {
      const isMobile = window.innerWidth < 768;
      const behavior = isMobile ? "auto" : "smooth";

      // Small offset for perfect visual centering
      window.scrollTo({
        top: 0,
        left: 0,
        behavior,
      });
    };

    // Scroll if page or query changed
    if (prevLocation.current.pathname !== pathname || prevLocation.current.search !== search) {
      scrollToTop();
      prevLocation.current = { pathname, search };
    }
  }, [pathname, search]);

  return null;
}
