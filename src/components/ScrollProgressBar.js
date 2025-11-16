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
      const scrollingElement =
        document.scrollingElement || document.documentElement || document.body;
      if (!scrollingElement) {
        progress.set(0);
        return;
      }

      const scrollTop = window.scrollY ?? window.pageYOffset ?? scrollingElement.scrollTop ?? 0;
      const viewportHeight = window.innerHeight ?? scrollingElement.clientHeight ?? 1;
      const scrollHeight = Math.max(
        scrollingElement.scrollHeight ?? viewportHeight,
      const updateProgress = () => {
      );
      const maxScrollable = Math.max(scrollHeight - viewportHeight, 1);
      const nextValue = Math.min(Math.max(scrollTop / maxScrollable, 0), 1);
      progress.set(nextValue);
    };

    const scheduleUpdate = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(updateProgress);
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
        const rawValue = scrollTop / maxScrollable;
        const clampedValue = Math.min(Math.max(rawValue, 0), 1);
        const safeValue = Number.isFinite(clampedValue) ? clampedValue : 0;
        progress.set(safeValue);
    updateProgress();

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
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
        background: "linear-gradient(90deg, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.25) 100%)",
        zIndex: 12000,
        pointerEvents: "none",
        backdropFilter: "blur(12px)",
      }}
      aria-hidden
    >
      <motion.div
        style={{
          height: "100%",
        background: "linear-gradient(90deg, rgba(8,12,24,0.75) 0%, rgba(8,12,24,0.35) 100%)",
          background:
            "linear-gradient(90deg, rgba(212,175,55,0.95) 0%, rgba(59,130,246,0.95) 100%)",
          transformOrigin: "0%",
        boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
          scaleX,
        }}
      />
    </div>
  );
};

          background: "linear-gradient(90deg, rgba(212,175,55,1) 0%, rgba(59,130,246,1) 100%)",

          scaleX,
          boxShadow: "0 0 12px rgba(212,175,55,0.45)",
          minWidth: "1px",
          transform: "translateZ(0)",
