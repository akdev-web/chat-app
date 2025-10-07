// ScreenSizeContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

// Tailwind default breakpoints
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

const ScreenSizeContext = createContext();

export const ScreenSizeProvider = ({ children }) => {
  const [screenSize, setScreenSize] = useState(getScreenSize(window.innerWidth));

  function getScreenSize(width) {
    if (width < breakpoints.sm) return "sm"; // Mobile
    if (width < breakpoints.md) return "md"; // Tablet
    if (width < breakpoints.lg) return "lg"; // Laptop
    if (width < breakpoints.xl) return "xl"; // Desktop
    return "2xl"; // Large monitor
  }

  useEffect(() => {
    const handleResize = () => {
      setScreenSize(getScreenSize(window.innerWidth));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <ScreenSizeContext.Provider value={{ screenSize }}>
      {children}
    </ScreenSizeContext.Provider>
  );
};

export const useScreenSize = () => useContext(ScreenSizeContext);
