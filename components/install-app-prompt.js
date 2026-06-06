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
        className="pointer-events-auto relative w-full max-w-[360px] overflow-hidden rounded-[24px] bg-[#0f172a]/90 p-5 text-[#f1f5f9] backdrop-blur-[24px]"
        style={{
          border: "1px solid rgba(148,163,184,0.12)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 20px 40px -10px rgba(0,0,0,0.8)"
        }}
        role="dialog"
        aria-label="Install app"
      >
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.03),transparent_65%)]" />

        <div className="relative flex items-start gap-4">
          <div 
            className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-[#1e293b] shadow-inner"
            style={{ border: "1px solid rgba(148,163,184,0.12)" }}
          >
            <Download size={20} className="text-[#f1f5f9]" />
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <h2 className="text-[16px] font-bold tracking-tight text-[#f1f5f9]">
              Install Twin
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-[#94a3b8]">
              Add the app to your device for a faster, immersive full-screen experience.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#94a3b8] transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Cancel install prompt"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative mt-6 grid grid-cols-[1fr_auto] gap-3">
          <button
            type="button"
            onClick={handleInstall}
            disabled={isInstalling}
            className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[14px] bg-[#6ee7b7] px-4 text-[14px] font-bold text-[#020617] transition-all hover:bg-[#34d399] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70"
            style={{
              boxShadow: "0 0 20px rgba(110,231,183,0.15), 0 0 40px rgba(110,231,183,0.08)"
            }}
          >
            <Download size={16} />
            {isInstalling ? "Opening..." : "Install App"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="h-[48px] rounded-[14px] border px-5 text-[14px] font-semibold text-[#f1f5f9] transition-colors hover:bg-white/5"
            style={{
              border: "1px solid rgba(148,163,184,0.12)",
              backgroundColor: "rgba(30,41,59,0.5)"
            }}
          >
            Not Now
          </button>
        </div>
      </section>
    </div>
  );
}
