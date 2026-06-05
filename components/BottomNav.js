"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Dumbbell,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";
import ProfileCard from "@/components/ProfileCard";

const NAV_ITEMS = [
  { label: "Home",     icon: Home,       href: "/" },
  { label: "Workout",  icon: Dumbbell,   href: "/workout" },
  { label: "KAI",      icon: Sparkles,   isKai: true },
  { label: "Progress", icon: TrendingUp, href: "/progress" },
  { label: "Profile",  icon: User,       isProfile: true },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router   = useRouter();

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handlePress = (item) => {
    if (item.isKai) {
      // Dispatch a global event — the active page (e.g. home) listens and opens
      // its own Kai instance with full nutrition context.
      window.dispatchEvent(new CustomEvent("twin:open-kai"));
      return;
    }
    if (item.isProfile) { setIsProfileOpen(true); return; }
    if (item.href)      { router.push(item.href);  return; }
  };

  return (
    <>
      {/* ── Nav Bar ─────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
        <nav
          className="pointer-events-auto flex h-[68px] pb-2 w-full max-w-[400px] items-center justify-between
                     bg-[#030818]/95 px-6 backdrop-blur-2xl
                     border-t border-[#1e3a8a]/40
                     shadow-[0_-15px_35px_rgba(0,0,0,0.5)]"
        >
          {NAV_ITEMS.map((item) => {
            const active = !item.isKai && !item.isProfile && item.href === pathname;

            if (item.isKai) {
              return (
                <button
                  key="kai"
                  onClick={() => handlePress(item)}
                  className="group relative flex flex-col items-center -mt-8 z-30 w-[52px]"
                >
                  <div className="relative flex flex-col items-center">
                    <div className="absolute inset-0 bg-[#00d0ff]/20 rounded-full blur-xl scale-[1.8] animate-pulse" />
                    <div className="absolute -bottom-2 w-8 h-4 bg-black/60 rounded-[100%] blur-md" />

                    <div className="relative h-[56px] w-[56px] rounded-full p-[1px] bg-gradient-to-br from-white/30 via-white/5 to-[#00d0ff]/20 shadow-[0_10px_25px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
                      <div className="relative h-full w-full rounded-full bg-gradient-to-b from-[#0a1535] to-[#010614] overflow-hidden flex items-center justify-center shadow-[inset_0_2px_15px_rgba(0,208,255,0.2),inset_0_-2px_15px_rgba(168,85,247,0.15)]">
                        <div className="absolute top-0 inset-x-2 h-1/2 rounded-full bg-gradient-to-b from-white/10 to-transparent opacity-60" />
                        <div className="absolute top-0 w-2/3 h-[2px] bg-gradient-to-r from-transparent via-[#00d0ff]/90 to-transparent" />
                        <item.icon size={22} className="relative z-10 text-white drop-shadow-[0_0_8px_rgba(0,208,255,0.8)]" />
                        <div className="absolute -bottom-2 w-full h-[15px] bg-[#00d0ff]/30 blur-[6px] rounded-full" />
                      </div>
                    </div>

                    <span className="relative text-[9px] font-bold text-white tracking-[0.2em] uppercase mt-2 drop-shadow-[0_0_5px_rgba(0,208,255,0.4)]">
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            }

            if (active) {
              return (
                <button
                  key={item.label}
                  onClick={() => handlePress(item)}
                  className="group relative flex flex-col items-center justify-center w-[52px] h-full transition-all active:scale-[0.97]"
                >
                  <div className="absolute inset-0 top-1 bottom-1 bg-[#00d0ff]/10 rounded-[16px]" />
                  <item.icon size={22} className="text-[#00d0ff] fill-[#00d0ff] drop-shadow-[0_0_12px_rgba(0,208,255,0.6)] z-10" />
                  <span className="text-[9px] font-bold text-[#00d0ff] z-10 mt-1">{item.label}</span>
                  <div className="absolute bottom-1.5 left-1/2 h-[4px] w-6 -translate-x-1/2 rounded-t-full bg-[#00d0ff] shadow-[0_0_10px_#00d0ff] z-10" />
                </button>
              );
            }

            return (
              <button
                key={item.label}
                onClick={() => handlePress(item)}
                className="group relative flex flex-col items-center justify-center w-[52px] h-full transition-all active:scale-[0.97]"
              >
                <div className="absolute inset-0 top-1 bottom-1 bg-white/0 group-hover:bg-white/[0.04] rounded-[16px] transition-all" />
                <item.icon size={22} className="text-white/40 group-hover:text-white/80 transition-colors z-10" strokeWidth={1.8} />
                <span className="text-[9px] font-medium text-white/40 group-hover:text-white/80 transition-colors z-10 mt-1">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile card lives here — it doesn't need route-specific data */}
      <ProfileCard isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
}
