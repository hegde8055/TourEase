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
        height: "8px",
        background: "linear-gradient(90deg, rgba(11,17,32,0.75) 0%, rgba(11,17,32,0.45) 100%)",
        zIndex: 12000,
        pointerEvents: "none",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(212,175,55,0.38)",
        boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
      }}
      aria-hidden
    >
      {/* This is the moving progress bar */}
      <motion.div
        style={{
          height: "100%",
          // This is the gradient of the bar itself
          background: "linear-gradient(90deg, rgba(245,206,180,1) 0%, rgba(34,197,213,1) 100%)",
          transformOrigin: "0%",
          // This is the glow effect for the bar
          boxShadow: "0 0 14px rgba(245,206,180,0.6)",
          // This is the spring-animated scaleX value
          scaleX,
          // Performance hints
          minWidth: "2px",
          transform: "translateZ(0)",
          willChange: "transform",
        }}
      />
    </div>
  );
};

export default ScrollProgressBar;
