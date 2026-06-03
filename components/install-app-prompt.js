"use client";

import { Download, X } from "lucide-react";
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
        className="pointer-events-auto relative w-full max-w-[360px] overflow-hidden rounded-[18px] border border-[#00d0ff]/30 bg-[#030818]/95 p-4 text-white shadow-[0_0_40px_rgba(0,208,255,0.26)] backdrop-blur-xl"
        role="dialog"
        aria-label="Install app"
      >
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,rgba(0,208,255,0.12),transparent_65%)]" />

        <div className="relative flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] border border-[#00d0ff]/35 bg-[#07112c] shadow-[0_0_16px_rgba(0,208,255,0.28)]">
            <Download size={18} className="text-[#00d0ff]" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-[14px] font-bold leading-tight tracking-wide">
              Install Twin
            </h2>
            <p className="mt-1 text-[12px] leading-5 text-white/58">
              Add the app to your device for a faster full-screen experience.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/45 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Cancel install prompt"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative mt-4 grid grid-cols-[1fr_auto] gap-2">
          <button
            type="button"
            onClick={handleInstall}
            disabled={isInstalling}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] bg-[#00d0ff] px-4 text-[13px] font-bold text-[#020617] shadow-[0_0_24px_rgba(0,208,255,0.38)] transition-all hover:shadow-[0_0_32px_rgba(0,208,255,0.58)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Download size={15} />
            {isInstalling ? "Opening..." : "Install"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="h-10 rounded-[12px] border border-white/10 px-4 text-[13px] font-semibold text-white/65 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </section>
    </div>
  );
}
