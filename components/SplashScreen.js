"use client";

import { useState, useEffect } from "react";

export default function SplashScreen() {
  const [splashState, setSplashState] = useState("visible");
  
  useEffect(() => {
    // Only show splash screen once per session
    const hasSeenSplash = sessionStorage.getItem("twin_splash_seen");
    if (hasSeenSplash) {
      setSplashState("hidden");
      return;
    }
    
    sessionStorage.setItem("twin_splash_seen", "true");
    
    const fadeTimer = setTimeout(() => setSplashState("fading"), 1800);
    const hideTimer = setTimeout(() => setSplashState("hidden"), 2400);
    
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (splashState === "hidden") return null;

  return (
    <div 
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-[#020305] transition-opacity duration-[600ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
        splashState === "fading" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <img
        src="/opening.png"
        alt="Twin OS"
        className="w-full h-full object-cover"
        style={{
          animation: "splash-scale 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
        }}
      />
      <style>{`
        @keyframes splash-scale {
          0% { transform: scale(1.03); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
