"use client";

import { Download, X, Sparkles, Brain, ListTodo, Calendar, BarChart2, Star, ShieldCheck, Dumbbell } from "lucide-react";
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
        className="pointer-events-auto relative w-full max-w-[360px] overflow-hidden rounded-[20px] bg-white/95 p-3.5 text-black backdrop-blur-[40px]"
        style={{
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)"
        }}
        role="dialog"
        aria-label="Install app"
      >
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(0,0,0,0.03),transparent_50%)]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleCancel}
          className="absolute top-2.5 right-2.5 z-10 grid h-6 w-6 place-items-center rounded-full bg-black/5 text-black/40 transition-colors hover:bg-black/10 hover:text-black"
          aria-label="Cancel install prompt"
        >
          <X size={12} />
        </button>

        {/* Top Section */}
        <div className="relative flex items-center gap-3 pr-6">
          {/* Logo */}
          <div 
            className="relative h-[56px] w-[56px] shrink-0 overflow-hidden rounded-[14px] bg-white shadow-[0_0_15px_rgba(0,0,0,0.05)] flex items-center justify-center"
            style={{ border: "1px solid rgba(0,0,0,0.1)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent opacity-40 z-10" />
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/80 to-transparent opacity-80 rounded-t-[14px]" />
            <img src="/logo.png" alt="Twin" className="relative z-0 w-full h-full object-cover" />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-bold tracking-tight text-black leading-none">TWIN</h1>
              <span className="flex items-center gap-1 rounded bg-gradient-to-r from-black/5 to-black/5 px-1.5 py-[2px] text-[9px] font-bold text-black border border-black/10 shadow-[0_0_8px_rgba(0,0,0,0.05)]">
                 AI <Sparkles size={8} className="text-black" />
              </span>
            </div>
            <p className="text-[12px] font-medium text-black/80 mt-1 truncate">
              AI Assisted Work Manager
            </p>
            <p className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-1">
              Your personalized AI partner to plan, organize and achieve more.
            </p>
          </div>
        </div>

        {/* Features Row - 4 columns in one line */}
        <div className="relative mt-3 grid grid-cols-4 gap-1 rounded-[12px] bg-black/[0.03] p-1.5 border border-black/5 overflow-hidden divide-x divide-black/5">
           {/* Item 1 */}
           <div className="flex flex-col gap-1 px-1.5">
              <Brain size={14} className="text-black drop-shadow-[0_0_5px_rgba(0,0,0,0.1)]" />
              <div className="flex flex-col">
                <p className="text-[9px] font-bold text-black leading-tight">AI Insights</p>
                <p className="text-[7px] text-black/60 leading-tight mt-0.5">Smart suggestions</p>
              </div>
           </div>
           {/* Item 2 */}
           <div className="flex flex-col gap-1 px-1.5">
              <ListTodo size={14} className="text-black drop-shadow-[0_0_5px_rgba(0,0,0,0.1)]" />
              <div className="flex flex-col">
                <p className="text-[9px] font-bold text-black leading-tight">Task Manager</p>
                <p className="text-[7px] text-black/60 leading-tight mt-0.5">Plan, prioritize</p>
              </div>
           </div>
           {/* Item 3 */}
           <div className="flex flex-col gap-1 px-1.5">
              <Dumbbell size={14} className="text-black drop-shadow-[0_0_5px_rgba(0,0,0,0.1)]" />
              <div className="flex flex-col">
                <p className="text-[9px] font-bold text-black leading-tight">Workout</p>
                <p className="text-[7px] text-black/60 leading-tight mt-0.5">Plan and record</p>
              </div>
           </div>
           {/* Item 4 */}
           <div className="flex flex-col gap-1 px-1.5">
              <BarChart2 size={14} className="text-black drop-shadow-[0_0_5px_rgba(0,0,0,0.1)]" />
              <div className="flex flex-col">
                <p className="text-[9px] font-bold text-black leading-tight">Analytics</p>
                <p className="text-[7px] text-black/60 leading-tight mt-0.5">Track progress</p>
              </div>
           </div>
        </div>

        {/* Install Button */}
        <div className="relative mt-3 flex h-[44px] w-full overflow-hidden rounded-[12px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] border border-black/10 transition-transform active:scale-[0.98]">
          <button 
            type="button"
            onClick={handleInstall}
            disabled={isInstalling}
            className="flex-1 flex items-center justify-center text-[15px] font-bold text-black hover:bg-black/5 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isInstalling ? "Opening..." : "Install"}
          </button>
          <div className="w-[1px] bg-black/10 my-2" />
          <button 
            type="button"
            onClick={handleInstall}
            disabled={isInstalling}
            className="w-[48px] flex items-center justify-center text-black hover:bg-black/5 transition-colors disabled:opacity-70 disabled:cursor-not-allowed bg-black/5"
          >
             <Download size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}
