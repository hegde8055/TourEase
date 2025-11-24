import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();
  
  // Use a spring for smooth but responsive movement, or raw scrollYProgress for instant
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "6px",
        zIndex: 9999,
        // Gradient: Gold -> Rose Gold -> Tiffany Blue
        background: "linear-gradient(90deg, #FFD700, #B76E79, #0ABAB5)",
        transformOrigin: "0%",
        scaleX, // Bind directly to motion value
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    />
  );
};

export default ScrollProgressBar;
