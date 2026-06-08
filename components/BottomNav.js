"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, Dumbbell, Sparkles, TrendingUp, User } from "lucide-react";
import ProfileCard from "@/components/ProfileCard";

// Same tokens as page.jsx
const T = {
  pageBg: "#0a0b0f",
  cardBg: "#111318",
  border: "rgba(255,255,255,0.06)",
  white: "#ffffff",
  blackText: "#0a0a0a",
  textPri: "#e8eaf0",
  textMid: "rgba(232,234,240,0.50)",
};

const NAV_ITEMS = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Workout", icon: Dumbbell, href: "/workout" },
  { label: "KAI", icon: Sparkles, isKai: true },
  { label: "Progress", icon: TrendingUp, href: "/progress" },
  { label: "Profile", icon: User, isProfile: true },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handlePress = (item) => {
    if (item.isKai) { window.dispatchEvent(new CustomEvent("twin:open-kai")); return; }
    if (item.isProfile) { setIsProfileOpen(true); return; }
    if (item.href) { router.push(item.href); return; }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none bottom-nav-container">
        <nav
          className="pointer-events-auto flex w-full max-w-[400px] items-end justify-between px-4 pt-2 pb-4"
          style={{ background: T.cardBg, borderTop: `1px solid ${T.border}` }}
        >
          {NAV_ITEMS.map((item) => {
            const isWorkoutPage = pathname === "/workout" || pathname === "/workout-record";
            const active = !item.isKai && !item.isProfile && (item.href === pathname || (item.href === "/workout" && isWorkoutPage));

            /* ── KAI floating circle ─────────────────────────────────────── */
            if (item.isKai) {
              return (
                <button
                  key="kai"
                  onClick={() => handlePress(item)}
                  className="flex flex-col items-center gap-0.5 flex-1 -mt-8"
                >
                  <div
                    className="h-[58px] w-[58px] rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                    style={{
                      background: T.white,
                      boxShadow: "0 4px 20px rgba(255,255,255,0.18), 0 0 0 1px rgba(255,255,255,0.10)",
                    }}
                  >
                    <item.icon size={24} strokeWidth={1.8} style={{ color: T.blackText }} />
                  </div>
                  <span
                    className="text-[9px] font-bold tracking-widest uppercase mt-1"
                    style={{ color: T.textMid }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            }

            /* ── Active item: white filled rounded rect ──────────────────── */
            if (active) {
              return (
                <button
                  key={item.label}
                  onClick={() => handlePress(item)}
                  className="flex flex-col items-center gap-0.5 flex-1"
                >
                  <div
                    className="flex flex-col items-center gap-0.5 px-3 pt-2 pb-1.5 rounded-xl"
                    style={{ background: T.white }}
                  >
                    <item.icon size={20} strokeWidth={2} style={{ color: T.blackText }} />
                    <span className="text-[9px] font-bold" style={{ color: T.blackText }}>
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            }

            /* ── Inactive item ───────────────────────────────────────────── */
            return (
              <button
                key={item.label}
                onClick={() => handlePress(item)}
                className="flex flex-col items-center gap-0.5 flex-1 py-2 transition-opacity hover:opacity-70"
                style={{ opacity: 0.40 }}
              >
                <item.icon size={20} strokeWidth={1.8} style={{ color: T.textPri }} />
                <span className="text-[9px] font-medium" style={{ color: T.textPri }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <ProfileCard isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
}