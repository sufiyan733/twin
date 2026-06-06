"use client";

import { Download, X, Sparkles, Brain, ListTodo, Calendar, BarChart2, Star, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

const DISMISSED_KEY = "twin-install-prompt-dismissed";

function isStandaloneApp() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export default function InstallAppPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || isStandaloneApp()) {
      return;
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();

      if (window.sessionStorage.getItem(DISMISSED_KEY) === "true") {
        return;
      }

      setDeferredPrompt(event);
      window.setTimeout(() => setIsVisible(true), 700);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsVisible(false);
      window.sessionStorage.removeItem(DISMISSED_KEY);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    setIsInstalling(true);
    deferredPrompt.prompt();

    const choice = await deferredPrompt.userChoice;
    setIsInstalling(false);
    setDeferredPrompt(null);
    setIsVisible(false);

    if (choice.outcome !== "accepted") {
      window.sessionStorage.setItem(DISMISSED_KEY, "true");
    }
  };

  const handleCancel = () => {
    window.sessionStorage.setItem(DISMISSED_KEY, "true");
    setIsVisible(false);
  };

  if (!isVisible || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4 pointer-events-none sm:bottom-6">
      <section
        className="pointer-events-auto relative w-full max-w-[360px] overflow-hidden rounded-[24px] bg-[#050510]/85 p-4 text-white backdrop-blur-[40px]"
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 30px 60px -15px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)"
        }}
        role="dialog"
        aria-label="Install app"
      >
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(100,150,255,0.08),transparent_50%)]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleCancel}
          className="absolute top-3 right-3 z-10 grid h-7 w-7 place-items-center rounded-full bg-white/5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Cancel install prompt"
        >
          <X size={14} />
        </button>

        {/* Top Section */}
        <div className="relative flex items-center gap-3 pr-6">
          {/* Logo */}
          <div 
            className="relative h-[64px] w-[64px] shrink-0 overflow-hidden rounded-[16px] bg-black shadow-[0_0_20px_rgba(255,255,255,0.05)] flex items-center justify-center"
            style={{ border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-40 z-10" />
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent opacity-20 rounded-t-[14px]" />
            <img src="/logo.png" alt="Twin" className="relative z-0 w-full h-full object-cover" />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-[22px] font-bold tracking-tight text-white leading-none">TWIN</h1>
              <span className="flex items-center gap-1 rounded-[6px] bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-200 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                 AI <Sparkles size={10} className="text-blue-300" />
              </span>
            </div>
            <p className="text-[13px] font-medium text-indigo-400 mt-1.5 truncate">
              AI Assisted Work Manager
            </p>
            <p className="text-[11px] text-[#94a3b8] leading-snug mt-1 line-clamp-2">
              Your personalized AI partner to plan, organize and achieve more.
            </p>
          </div>
        </div>

        {/* Features Row - 2x2 grid for compact size */}
        <div className="relative mt-4 grid grid-cols-2 gap-px rounded-[16px] bg-white/[0.02] p-2 border border-white/5 overflow-hidden">
           {/* Item 1 */}
           <div className="flex items-center gap-2 p-1.5">
              <Brain size={16} className="text-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.5)] shrink-0" />
              <p className="text-[10px] font-bold text-white leading-tight">AI Insights</p>
           </div>
           {/* Item 2 */}
           <div className="flex items-center gap-2 p-1.5">
              <ListTodo size={16} className="text-blue-400 drop-shadow-[0_0_6px_rgba(96,165,250,0.5)] shrink-0" />
              <p className="text-[10px] font-bold text-white leading-tight">Task Manager</p>
           </div>
           {/* Item 3 */}
           <div className="flex items-center gap-2 p-1.5">
              <Calendar size={16} className="text-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.5)] shrink-0" />
              <p className="text-[10px] font-bold text-white leading-tight">Schedule</p>
           </div>
           {/* Item 4 */}
           <div className="flex items-center gap-2 p-1.5">
              <BarChart2 size={16} className="text-blue-400 drop-shadow-[0_0_6px_rgba(96,165,250,0.5)] shrink-0" />
              <p className="text-[10px] font-bold text-white leading-tight">Analytics</p>
           </div>
        </div>

        {/* Stats Row */}
        <div className="relative mt-2 grid grid-cols-3 rounded-[16px] bg-white/[0.02] py-2 border border-white/5 divide-x divide-white/5">
           <div className="flex flex-col items-center justify-center gap-0.5 px-1">
             <div className="flex items-center gap-1">
               <Star size={12} className="text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)] fill-purple-500" />
               <p className="text-[13px] font-bold text-white leading-none">4.8</p>
             </div>
             <p className="text-[9px] text-white/50">12K reviews</p>
           </div>
           <div className="flex flex-col items-center justify-center gap-0.5 px-1">
             <div className="flex items-center gap-1">
               <Download size={12} className="text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
               <p className="text-[13px] font-bold text-white leading-none">5M+</p>
             </div>
             <p className="text-[9px] text-white/50">Downloads</p>
           </div>
           <div className="flex flex-col items-center justify-center gap-0.5 px-1">
             <div className="flex items-center gap-1">
               <ShieldCheck size={12} className="text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
               <p className="text-[13px] font-bold text-white leading-none">3+</p>
             </div>
             <p className="text-[9px] text-white/50">Rated for 3+</p>
           </div>
        </div>

        {/* Install Button */}
        <div className="relative mt-4 flex h-[52px] w-full overflow-hidden rounded-[16px] bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-transform active:scale-[0.98]">
          <button 
            type="button"
            onClick={handleInstall}
            disabled={isInstalling}
            className="flex-1 flex items-center justify-center text-[16px] font-bold text-white hover:bg-white/10 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isInstalling ? "Opening..." : "Install"}
          </button>
          <div className="w-[1px] bg-white/20 my-2.5" />
          <button 
            type="button"
            onClick={handleInstall}
            disabled={isInstalling}
            className="w-[56px] flex items-center justify-center text-white hover:bg-white/10 transition-colors disabled:opacity-70 disabled:cursor-not-allowed bg-white/5"
          >
             <Download size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}
