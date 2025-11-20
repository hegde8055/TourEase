import React, { useState, useEffect } from "react";

const ScrollProgressBar = () => {
  const [scrollWidth, setScrollWidth] = useState(0);

  const handleScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

    const scrolled = (scrollTop / docHeight) * 100;
    setScrollWidth(scrolled);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: `${scrollWidth}%`,
        height: "6px",
        zIndex: 9999,
        // Gradient: Gold -> Rose Gold -> Tiffany Blue
        background: "linear-gradient(90deg, #FFD700, #B76E79, #0ABAB5)",
        transition: "width 0.1s ease-out",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    />
  );
};

export default ScrollProgressBar;
