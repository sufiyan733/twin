"use client";

import { useState, useEffect } from "react";

export default function SplashScreen() {
  const [splashState, setSplashState] = useState("visible"); // 'visible' | 'animating' | 'hidden'
  const [glowState, setGlowState] = useState(false);
  
  useEffect(() => {
    // Check if we've already shown the splash this session
    const hasSeenSplash = sessionStorage.getItem("twin_splash_seen");
    if (hasSeenSplash) {
      setSplashState("hidden");
      return;
    }
    
    // Mark as seen
    sessionStorage.setItem("twin_splash_seen", "true");
    
    // Sequence the animations
    // 1. Wait a moment for the DOM to settle (matching the native splash)
    const glowTimer = setTimeout(() => {
      setGlowState(true);
    }, 400);

    // 2. Start the fade out animation
    const animateTimer = setTimeout(() => {
      setSplashState("animating");
    }, 1800);
    
    // 3. Remove from DOM
    const hideTimer = setTimeout(() => {
      setSplashState("hidden");
    }, 2800); // 1800 + 1000ms duration
    
    return () => {
      clearTimeout(glowTimer);
      clearTimeout(animateTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (splashState === "hidden") return null;

  return (
    <div 
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-black transition-opacity duration-[800ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
        splashState === "animating" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div 
        className={`relative flex items-center justify-center transition-all duration-[800ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
          splashState === "animating" ? "scale-[1.08] opacity-0 blur-md translate-y-4" : "scale-100 opacity-100 blur-0 translate-y-0"
        }`}
      >
        {/* Core Logo matching the native Android PWA splash screen */}
        <img
          src="/icon-512.png"
          alt="Twin Logo"
          className="w-[144px] h-[144px] sm:w-[160px] sm:h-[160px] object-contain drop-shadow-2xl z-10"
        />

        {/* Cinematic Emerald Core Glow */}
        <div 
          className={`absolute inset-0 bg-[#6ee7b7] rounded-full mix-blend-screen filter blur-[60px] transition-all duration-1000 ease-out z-0 ${
            glowState && splashState !== "animating" ? "opacity-30 scale-150" : "opacity-0 scale-50"
          }`}
        />
        
        {/* Premium ambient edge light around the logo */}
        <div 
          className={`absolute inset-[-2px] rounded-[32px] border border-white/10 transition-all duration-1000 ease-out z-20 ${
            glowState && splashState !== "animating" ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
          style={{
            boxShadow: "inset 0 0 40px rgba(255,255,255,0.05)"
          }}
        />
      </div>
    </div>
  );
}
