import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const BAR_GRADIENT = "linear-gradient(90deg,#d4af37 0%,#f5c6b8 50%,#0abab5 100%)";

const readScrollProgress = () => {
  const scrollingElement = document.scrollingElement || document.documentElement || document.body;
  const maxScrollable = Math.max(scrollingElement.scrollHeight - scrollingElement.clientHeight, 1);
  const ratio = scrollingElement.scrollTop / maxScrollable;
  if (!Number.isFinite(ratio)) return 0;
  return Math.min(Math.max(ratio, 0), 1);
};

const ScrollProgressBar = () => {
  const progress = useMotionValue(0);
  const scaleX = useSpring(progress, {
    stiffness: 200,
    damping: 32,
    restDelta: 0.0005,
  });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    let rafId = 0;

    const tick = () => {
      progress.set(readScrollProgress());
      rafId = window.requestAnimationFrame(tick);
    };

    tick();

    const handleResize = () => progress.set(readScrollProgress());
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, [progress]);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "6px",
        background: "rgba(7,11,22,0.55)",
        zIndex: 12000,
        pointerEvents: "none",
        backdropFilter: "blur(10px)",
      }}
    >
      <motion.div
        style={{
          height: "100%",
          background: BAR_GRADIENT,
          transformOrigin: "0% 50%",
          boxShadow: "0 0 12px rgba(245,206,180,0.55)",
          scaleX,
          minWidth: "1px",
          transform: "translateZ(0)",
        }}
      />
    </div>
  );
};

export default ScrollProgressBar;
