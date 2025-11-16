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
        viewportHeight
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
    window.addEventListener("resize", scheduleUpdate);

    updateProgress();

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [progress]);

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "4px",
        background: "linear-gradient(90deg, rgba(212,175,55,0.95) 0%, rgba(59,130,246,0.95) 100%)",
        transformOrigin: "0%",
        scaleX,
        zIndex: 12000,
        pointerEvents: "none",
      }}
      aria-hidden
    />
  );
};

export default ScrollProgressBar;
