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
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
      const scrollHeight = document.documentElement.scrollHeight || 1;
      const maxScrollable = Math.max(scrollHeight - viewportHeight, 1);
      const rawValue = scrollTop / maxScrollable;
      const clampedValue = Math.min(Math.max(rawValue, 0), 1);
      progress.set(Number.isFinite(clampedValue) ? clampedValue : 0);
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
        background: "rgba(7, 11, 22, 0.55)",
        zIndex: 12000,
        pointerEvents: "none",
        backdropFilter: "blur(10px)",
      }}
      aria-hidden
    >
      {/* This is the moving progress bar */}
      <motion.div
        style={{
          height: "100%",
          // This is the gradient of the bar itself
          background: "linear-gradient(90deg,#d4af37 0%,#f5c6b8 45%,#0abab5 100%)",
          transformOrigin: "0% 50%",
          // This is the glow effect for the bar
          boxShadow: "0 0 12px rgba(245,206,180,0.6)",
          // This is the spring-animated scaleX value
          scaleX,
          // Performance hints
          minWidth: "1px",
          transform: "translateZ(0)",
          willChange: "transform",
        }}
      />
    </div>
  );
};

export default ScrollProgressBar;
