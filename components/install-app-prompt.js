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
    <div className="fixed inset-x-0 top-4 z-[60] flex justify-center px-4 pointer-events-none sm:top-6">
      <section
        className="pointer-events-auto relative w-full max-w-[360px] overflow-hidden rounded-[20px] bg-[#04060d]/90 p-3.5 text-white backdrop-blur-[40px]"
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)"
        }}
        role="dialog"
        aria-label="Install app"
      >
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(100,150,255,0.1),transparent_50%)]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleCancel}
          className="absolute top-2.5 right-2.5 z-10 grid h-6 w-6 place-items-center rounded-full bg-white/5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Cancel install prompt"
        >
          <X size={12} />
        </button>

        {/* Top Section */}
        <div className="relative flex items-center gap-3 pr-6">
          {/* Logo */}
          <div 
            className="relative h-[56px] w-[56px] shrink-0 overflow-hidden rounded-[14px] bg-black shadow-[0_0_15px_rgba(255,255,255,0.05)] flex items-center justify-center"
            style={{ border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-40 z-10" />
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent opacity-20 rounded-t-[14px]" />
            <img src="/logo.png" alt="Twin" className="relative z-0 w-full h-full object-cover" />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-bold tracking-tight text-white leading-none">TWIN</h1>
              <span className="flex items-center gap-1 rounded bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-1.5 py-[2px] text-[9px] font-bold text-blue-200 border border-blue-500/20 shadow-[0_0_8px_rgba(59,130,246,0.2)]">
                 AI <Sparkles size={8} className="text-blue-300" />
              </span>
            </div>
            <p className="text-[12px] font-medium text-indigo-400 mt-1 truncate">
              AI Assisted Work Manager
            </p>
            <p className="text-[10px] text-[#94a3b8] leading-tight mt-0.5 line-clamp-1">
              Your personalized AI partner to plan, organize and achieve more.
            </p>
          </div>
        </div>

        {/* Features Row - 4 columns in one line */}
        <div className="relative mt-3 grid grid-cols-4 gap-1 rounded-[12px] bg-white/[0.03] p-1.5 border border-white/5 overflow-hidden divide-x divide-white/5">
           {/* Item 1 */}
           <div className="flex flex-col gap-1 px-1.5">
              <Brain size={14} className="text-purple-400 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]" />
              <div className="flex flex-col">
                <p className="text-[9px] font-bold text-white leading-tight">AI Insights</p>
                <p className="text-[7px] text-white/50 leading-tight mt-0.5">Smart suggestions</p>
              </div>
           </div>
           {/* Item 2 */}
           <div className="flex flex-col gap-1 px-1.5">
              <ListTodo size={14} className="text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]" />
              <div className="flex flex-col">
                <p className="text-[9px] font-bold text-white leading-tight">Task Manager</p>
                <p className="text-[7px] text-white/50 leading-tight mt-0.5">Plan, prioritize</p>
              </div>
           </div>
           {/* Item 3 */}
           <div className="flex flex-col gap-1 px-1.5">
              <Calendar size={14} className="text-purple-400 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]" />
              <div className="flex flex-col">
                <p className="text-[9px] font-bold text-white leading-tight">Schedule</p>
                <p className="text-[7px] text-white/50 leading-tight mt-0.5">Intelligent calendar</p>
              </div>
           </div>
           {/* Item 4 */}
           <div className="flex flex-col gap-1 px-1.5">
              <BarChart2 size={14} className="text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]" />
              <div className="flex flex-col">
                <p className="text-[9px] font-bold text-white leading-tight">Analytics</p>
                <p className="text-[7px] text-white/50 leading-tight mt-0.5">Track progress</p>
              </div>
           </div>
        </div>

        {/* Stats Row */}
        <div className="relative mt-2 grid grid-cols-3 rounded-[12px] bg-white/[0.03] py-2 border border-white/5 divide-x divide-white/5">
           <div className="flex items-center justify-center gap-1.5 px-1">
             <Star size={14} className="text-purple-500 drop-shadow-[0_0_6px_rgba(168,85,247,0.6)] fill-purple-500" />
             <div className="flex flex-col">
               <p className="text-[12px] font-bold text-white leading-none">4.8</p>
               <p className="text-[8px] text-white/50 mt-0.5">12K reviews</p>
             </div>
           </div>
           <div className="flex items-center justify-center gap-1.5 px-1">
             <Download size={14} className="text-blue-500 drop-shadow-[0_0_6px_rgba(59,130,246,0.6)]" />
             <div className="flex flex-col">
               <p className="text-[12px] font-bold text-white leading-none">5M+</p>
               <p className="text-[8px] text-white/50 mt-0.5">Downloads</p>
             </div>
           </div>
           <div className="flex items-center justify-center gap-1.5 px-1">
             <ShieldCheck size={14} className="text-purple-500 drop-shadow-[0_0_6px_rgba(168,85,247,0.6)]" />
             <div className="flex flex-col">
               <p className="text-[12px] font-bold text-white leading-none">3+</p>
               <p className="text-[8px] text-white/50 mt-0.5">Rated for 3+</p>
             </div>
           </div>
        </div>

        {/* Install Button */}
        <div className="relative mt-3 flex h-[44px] w-full overflow-hidden rounded-[12px] bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-transform active:scale-[0.98]">
          <button 
            type="button"
            onClick={handleInstall}
            disabled={isInstalling}
            className="flex-1 flex items-center justify-center text-[15px] font-bold text-white hover:bg-white/10 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isInstalling ? "Opening..." : "Install"}
          </button>
          <div className="w-[1px] bg-white/20 my-2" />
          <button 
            type="button"
            onClick={handleInstall}
            disabled={isInstalling}
            className="w-[48px] flex items-center justify-center text-white hover:bg-white/10 transition-colors disabled:opacity-70 disabled:cursor-not-allowed bg-white/5"
          >
             <Download size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}
