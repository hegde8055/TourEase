// client/src/components/ScrollProgressBar.js
import { motion, useScroll, useSpring } from "framer-motion";
import React from "react";

/**
 * ScrollProgressBar
 * -----------------
 * Displays a top progress bar that fills as you scroll down.
 */
const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

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
