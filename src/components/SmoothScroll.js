import { useEffect } from "react";
import Lenis from "lenis";

// Global Lenis instance
let lenisInstance = null;

export const getLenis = () => lenisInstance;
export const stopLenis = () => lenisInstance?.stop();
export const startLenis = () => lenisInstance?.start();

const SmoothScroll = ({ children }) => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    lenisInstance = lenis; // Store globally
    console.log("Lenis initialized"); // Debug log

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return children;
};

export default SmoothScroll;
