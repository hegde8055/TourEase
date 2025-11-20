import React, { useEffect, useState } from "react";

export default function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      setProgress(percent);

      // Fade-in when scrolling down slightly, hide when at top
      if (scrollTop > 4) setVisible(true);
      else setVisible(false);
    };

    window.addEventListener("scroll", updateProgress);
    updateProgress();

    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <>
      {/* Frosted reflection bar behind the main bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: visible ? "6px" : "0px",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          background: visible
            ? "linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))"
            : "transparent",
          transition: "height 0.28s ease, opacity 0.3s ease",
          zIndex: 9997,
          opacity: visible ? 1 : 0,
        }}
      ></div>

      {/* Main scroll progress bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: visible ? "4px" : "0px",
          width: progress + "%",
          background: `
            linear-gradient(
              90deg,
              #d4a131 0%,
              #f7d36b 20%,
              #ffefc2 50%,
              #f7d36b 80%,
              #d4a131 100%
            )
          `,
          boxShadow: "0 0 18px rgba(255, 236, 175, 0.55), 0 0 30px rgba(247,211,107,0.45)",
          borderRadius: "0 12px 12px 0",
          transition: "width 0.12s ease-out, height 0.25s ease, opacity 0.35s ease",
          zIndex: 9999,
          opacity: visible ? 1 : 0,
        }}
      ></div>

      {/* Shimmer overlay that moves across the bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: visible ? "4px" : "0px",
          width: progress + "%",
          pointerEvents: "none",
          background:
            "linear-gradient(120deg, rgba(255,255,255,0.35), rgba(255,255,255,0.05), rgba(255,255,255,0.3))",
          backgroundSize: "200% 100%",
          animation: visible ? "shimmerMove 2.5s linear infinite" : "none",
          WebkitMaskImage: "linear-gradient(90deg, transparent, white 60%, transparent)",
          maskImage: "linear-gradient(90deg, transparent, white 60%, transparent)",
          zIndex: 10000,
          opacity: visible ? 0.8 : 0,
          transition: "opacity 0.35s ease, height 0.25s ease",
        }}
      ></div>

      {/* Inline keyframes */}
      <style>
        {`
          @keyframes shimmerMove {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
        `}
      </style>
    </>
  );
}
