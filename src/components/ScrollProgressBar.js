// client/src/components/ScrollProgressBar.js
import { motion, useMotionValue, useSpring } from "framer-motion";
import React, { useEffect } from "react";

/**
 * ScrollProgressBar
 * -----------------
 * Displays a top progress bar that fills as you scroll down.
 */
const ScrollProgressBar = () => {
  const progress = useMotionValue(0);
  const scaleX = useSpring(progress, {
    stiffness: 160,
    damping: 26,
    restDelta: 0.0005,
  });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    let animationFrameId;

    const updateProgress = () => {
      // Find the element that scrolls
      const scrollingElement = document.scrollingElement || document.documentElement;
      if (!scrollingElement) {
        progress.set(0);
        return;
      }

      const scrollTop = scrollingElement.scrollTop;
      const viewportHeight = scrollingElement.clientHeight;
      const scrollHeight = scrollingElement.scrollHeight;

      // Calculate the maximum scrollable distance
      const maxScrollable = Math.max(scrollHeight - viewportHeight, 1);

      // Calculate the raw progress value
      const rawValue = scrollTop / maxScrollable;

      // Ensure the value is between 0 and 1
      const clampedValue = Math.min(Math.max(rawValue, 0), 1);

      // Ensure the value is a valid number before setting
      const safeValue = Number.isFinite(clampedValue) ? clampedValue : 0;

      progress.set(safeValue);
    };

    const scheduleUpdate = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(updateProgress);
    };

    // Add event listeners for both scroll and resize
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });

    // Set initial progress
    updateProgress();

    // Cleanup function
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [progress]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "6px",
        // This is the background of the "track"
        background: "linear-gradient(90deg, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.25) 100%)",
        zIndex: 12000,
        pointerEvents: "none",
        backdropFilter: "blur(12px)",
      }}
      aria-hidden
    >
      {/* This is the moving progress bar */}
      <motion.div
        style={{
          height: "100%",
          // This is the gradient of the bar itself
          background: "linear-gradient(90deg, rgba(212,175,55,1) 0%, rgba(59,130,246,1) 100%)",
          transformOrigin: "0%",
          // This is the glow effect for the bar
          boxShadow: "0 0 12px rgba(212,175,55,0.45)",
          // This is the spring-animated scaleX value
          scaleX,
          // Performance hints
          minWidth: "1px",
          transform: "translateZ(0)",
        }}
      />
    </div>
  );
};

export default ScrollProgressBar;
