"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import GradientBlinds from "@/components/GradientBlinds";
import KaiAssistant from "@/components/KaiAssistant";
import ProfileCard from "@/components/ProfileCard";
import OnboardingModal from "@/components/OnboardingModal";
import {
  Bell,
  Book,
  Check,
  Circle,
  Dumbbell,
  Flame,
  Heart,
  Home,
  Leaf,
  Loader2,
  Menu,
  Pill,
  Plus,
  Send,
  Sparkles,
  User,
  Zap,
  Droplet,
  ClipboardList
} from "lucide-react";

export default function Page() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Morning Workout",
      desc: "30 min Strength Training",
      icon: Dumbbell,
      accent: "text-[#ff5e5e]",
      bg: "bg-[#112a46]",
      iconColor: "text-[#60a5fa]",
      value: "350 kcal",
      checked: true,
      valIcon: Flame
    },
    {
      id: 2,
      title: "Drink 2L Water",
      desc: "Stay Hydrated",
      icon: Droplet,
      accent: "text-[#60a5fa]",
      bg: "bg-[#0b284a]",
      iconColor: "text-[#60a5fa]",
      value: "2 / 2 Liters",
      checked: true,
    },
    {
      id: 3,
      title: "Read 20 Pages",
      desc: "Self Growth",
      icon: Book,
      accent: "text-[#10b981]",
      bg: "bg-[#063328]",
      iconColor: "text-[#10b981]",
      value: "0 / 20 Pages",
      checked: false,
    },
    {
      id: 4,
      title: "Meditate",
      desc: "10 min Mindfulness",
      icon: Leaf,
      accent: "text-[#a855f7]",
      bg: "bg-[#2d1b4e]",
      iconColor: "text-[#a855f7]",
      value: "0 / 10 min",
      checked: false,
    },
    {
      id: 5,
      title: "Take Vitamins",
      desc: "Health First",
      icon: Pill,
      value: "1 / 1 Done",
      checked: true,
    },
    {
      id: 6,
      title: "Evening Walk",
      desc: "Relaxing Stroll",
      icon: Zap,
      value: "0 / 20 min",
      checked: false,
    },
    {
      id: 7,
      title: "Stretch",
      desc: "Mobility",
      icon: Dumbbell,
      value: "0 / 10 min",
      checked: false,
    },
  ]);


  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isKaiOpen, setIsKaiOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if user has completed onboarding
  useEffect(() => {
    if (!session) return;
    fetch("/api/profile")
      .then(r => r.json())
      .then(data => {
        if (!data.profile) {
          setShowOnboarding(true);
        }
      })
      .catch(console.error);
  }, [session]);

  // Auth guard
  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [session, isPending, router]);

  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Show spinner while checking auth
  if (isPending || !session) {
    return (
      <div className="h-[100dvh] w-full flex items-center justify-center bg-[#020617]">
        <Loader2 className="text-[#00d0ff] animate-spin" size={32} />
      </div>
    );
  }

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
  };

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-[#020617] font-sans text-white">
      <div className="relative mx-auto flex h-[100dvh] w-full max-w-[400px] flex-col overflow-hidden bg-[#010614] shadow-[0_0_50px_rgba(0,10,40,0.5)]">

        {/* Background Gradients & Effects */}
        <div className="absolute inset-0 z-0">
          <GradientBlinds
            gradientColors={['#010614', '#0a1d47', '#00d0ff', '#010614']}
            angle={-45}
            noise={0.18}
            blindCount={12}
            blindMinWidth={25}
            spotlightRadius={2.8}
            spotlightSoftness={0.4}
            spotlightOpacity={0.9}
            mouseDampening={0.15}
            distortAmount={0.6}
            shineDirection="right"
            mixBlendMode="screen"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:20px_20px] z-0" />

        {/* Header */}
        <header className="relative z-10 flex shrink-0 items-center justify-between px-5 pt-3 pb-1">
          <button type="button" className="text-white/80 hover:text-white transition-colors">
            <Menu size={24} strokeWidth={1.5} />
          </button>

          <button type="button" className="relative text-white/80 hover:text-white transition-colors">
            <Bell size={22} strokeWidth={1.5} />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#00d0ff] shadow-[0_0_8px_#00d0ff]" />
          </button>
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex-1 flex flex-col overflow-hidden px-4 pb-[70px] space-y-3">

          {/* Calorie Intake Card */}
          <section className="relative shrink-0 overflow-hidden rounded-[16px] border border-[#00d0ff]/25 bg-[#030818] p-3 shadow-[0_0_35px_rgba(0,150,255,0.18)] backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,208,255,0.12),transparent_65%)] pointer-events-none" />

            <div className="flex items-center justify-between mb-2.5 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="grid place-items-center h-[30px] w-[30px] rounded-full bg-[#0a1535] border border-[#00d0ff]/40 shadow-[0_0_15px_rgba(0,208,255,0.4)]">
                  <Flame size={16} className="text-[#00d0ff] fill-[#00d0ff] drop-shadow-[0_0_5px_#00d0ff]" />
                </div>
                <h2 className="text-[14px] font-semibold text-white tracking-wide">Calorie Intake</h2>
              </div>
              <div className="flex items-center gap-1 rounded-[10px] bg-[#071330] px-3 py-1.5 text-[10px] font-semibold text-white/90 border border-[#00d0ff]/10 shadow-[inset_0_0_8px_rgba(0,208,255,0.1)]">
                {currentTime || "..."}
              </div>
            </div>

            <div className="flex items-center justify-between relative z-10">
              {/* Circular Progress Ring */}
              <div className="relative flex h-[105px] w-[105px] shrink-0 items-center justify-center -ml-1">

                {/* Outer Dashed Track (Premium Detail) */}
                <svg className="absolute h-full w-full -rotate-90 transform opacity-10" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="2 3" />
                </svg>

                {/* Main Progress Ring */}
                <svg className="relative h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="premiumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00d0ff" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Track Background */}
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#08102b" strokeWidth="5.5" />

                  {/* Blurred Glow Layer */}
                  <circle
                    cx="50" cy="50" r="40" fill="none" stroke="url(#premiumGrad)"
                    strokeWidth="5.5" strokeLinecap="round" strokeDasharray="251.3" strokeDashoffset="55"
                    filter="url(#glow)"
                  />

                  {/* Crisp Solid Core Layer */}
                  <circle
                    cx="50" cy="50" r="40" fill="none" stroke="#00f0ff"
                    strokeWidth="1.5" strokeLinecap="round" strokeDasharray="251.3" strokeDashoffset="55"
                  />
                </svg>

                {/* Crisp Typography */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-1">
                  <span className="text-[22px] font-bold leading-none tracking-tighter text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">1,850</span>
                  <span className="text-[7px] text-white/50 font-bold tracking-[0.2em] uppercase mt-1 mb-1.5">/ 2400 Kcal</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#00d0ff]/[0.1] px-2 py-0.5 text-[9px] font-bold text-[#00d0ff] border border-[#00d0ff]/20">
                    550 LEFT
                  </span>
                </div>
              </div>

              {/* Macro Bars (Crystal Blue Theme) */}
              <div className="flex flex-1 flex-col justify-center gap-2 pl-4">

                {/* Protein */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2 text-white/80">
                      <div className="grid place-items-center h-[20px] w-[20px] rounded-full bg-[#0a1535] border border-[#00d0ff]/30">
                        <Dumbbell size={10} className="text-[#00d0ff] fill-[#00d0ff]/20 drop-shadow-[0_0_5px_#00d0ff]" />
                      </div>
                      Protein
                    </div>
                    <span className="font-semibold text-white">120g <span className="text-white/30 font-medium">/ 150g</span></span>
                  </div>
                  <div className="h-[4px] w-full rounded-full bg-[#08102b] overflow-hidden shadow-inner">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#00d0ff]/60 to-[#00d0ff] shadow-[0_0_8px_#00d0ff]" style={{ width: '80%' }} />
                  </div>
                </div>

                {/* Fats (Azure) */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2 text-white/80">
                      <div className="grid place-items-center h-[20px] w-[20px] rounded-full bg-[#0a1535] border border-[#38bdf8]/30">
                        <Droplet size={10} className="text-[#38bdf8] fill-[#38bdf8]/20 drop-shadow-[0_0_5px_#38bdf8]" />
                      </div>
                      Fats
                    </div>
                    <span className="font-semibold text-white">60g <span className="text-white/30 font-medium">/ 80g</span></span>
                  </div>
                  <div className="h-[4px] w-full rounded-full bg-[#08102b] overflow-hidden shadow-inner">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#38bdf8]/60 to-[#38bdf8] shadow-[0_0_8px_#38bdf8]" style={{ width: '75%' }} />
                  </div>
                </div>

                {/* Carbs (Teal) */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2 text-white/80">
                      <div className="grid place-items-center h-[20px] w-[20px] rounded-full bg-[#0a1535] border border-[#2dd4bf]/30">
                        <Leaf size={10} className="text-[#2dd4bf] fill-[#2dd4bf]/20 drop-shadow-[0_0_5px_#2dd4bf]" />
                      </div>
                      Carbs
                    </div>
                    <span className="font-semibold text-white">210g <span className="text-white/30 font-medium">/ 300g</span></span>
                  </div>
                  <div className="h-[4px] w-full rounded-full bg-[#08102b] overflow-hidden shadow-inner">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#2dd4bf]/60 to-[#2dd4bf] shadow-[0_0_8px_#2dd4bf]" style={{ width: '70%' }} />
                  </div>
                </div>

                {/* Calories (Deep Blue) */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2 text-white/80">
                      <div className="grid place-items-center h-[20px] w-[20px] rounded-full bg-[#0a1535] border border-[#3b82f6]/30">
                        <Flame size={10} className="text-[#3b82f6] fill-[#3b82f6]/20 drop-shadow-[0_0_5px_#3b82f6]" />
                      </div>
                      Calories
                    </div>
                    <span className="font-semibold text-white">1850 <span className="text-white/30 font-medium">/ 2400</span></span>
                  </div>
                  <div className="h-[4px] w-full rounded-full bg-[#08102b] overflow-hidden shadow-inner">
                    <div className="h-full rounded-full bg-[#3b82f6] shadow-[0_0_8px_#3b82f6]" style={{ width: '77%' }} />
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Daily Tasks Card */}
          <section className="relative flex-1 flex flex-col overflow-hidden rounded-[16px] border border-[#00d0ff]/25 bg-[#030818] p-3 shadow-[0_0_35px_rgba(0,150,255,0.15)] backdrop-blur-xl mb-1">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,208,255,0.12),transparent_70%)] pointer-events-none" />

            <div className="flex items-center justify-between mb-2 relative z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="grid place-items-center h-[30px] w-[30px] rounded-full bg-[#0a1535] border border-[#00d0ff]/40 shadow-[0_0_15px_rgba(0,208,255,0.3)]">
                  <ClipboardList size={16} className="text-[#00d0ff] drop-shadow-[0_0_5px_#00d0ff]" />
                </div>
                <h2 className="text-[14px] font-semibold text-white tracking-wide">Daily Tasks</h2>
              </div>
              <button className="text-[11px] font-medium text-[#00d0ff] hover:text-white transition-colors flex items-center gap-1.5 drop-shadow-[0_0_8px_rgba(0,208,255,0.5)]">
                <Plus size={12} /> Add Task
              </button>
            </div>

            <div className="flex flex-col gap-1.5 relative z-10 flex-1 overflow-hidden">
              {tasks.map(task => (
                <div key={task.id} className="group relative flex flex-1 min-h-[34px] items-center gap-2.5 rounded-[10px] bg-[#07112c]/60 px-3 py-1 transition-all duration-300 hover:bg-[#00d0ff]/[0.05] hover:shadow-[0_0_20px_rgba(0,208,255,0.1)] border border-transparent hover:border-[#00d0ff]/30 cursor-pointer">

                  <button
                    onClick={() => toggleTask(task.id)}
                    className="relative shrink-0 grid place-items-center h-4 w-4 transition-transform active:scale-90"
                  >
                    {task.checked ? (
                      <div className="grid place-items-center h-[20px] w-[20px] rounded-full bg-[#00d0ff]/20 border border-[#00d0ff] text-[#00d0ff] shadow-[0_0_12px_rgba(0,208,255,0.6)]">
                        <Check size={12} strokeWidth={3} className="drop-shadow-[0_0_5px_#00d0ff]" />
                      </div>
                    ) : (
                      <Circle size={20} className="text-white/10 transition-colors group-hover:text-[#00d0ff]/40" strokeWidth={1.5} />
                    )}
                  </button>

                  <div className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[8px] bg-[#0a1535] border border-[#00d0ff]/20 text-[#00d0ff] shadow-inner group-hover:bg-[#00d0ff]/10 group-hover:border-[#00d0ff]/40 transition-colors">
                    <task.icon size={13} strokeWidth={1.8} className="drop-shadow-[0_0_5px_rgba(0,208,255,0.5)]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-[11px] font-semibold text-white/95 truncate tracking-wide transition-colors group-hover:text-white">{task.title}</h3>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 text-[9px] font-semibold text-white/40 tracking-wide group-hover:text-[#00d0ff] transition-colors">
                    {task.valIcon && <task.valIcon size={9} className="fill-current drop-shadow-[0_0_5px_currentColor]" />}
                    {task.value}
                  </div>
                </div>
              ))}
            </div>
          </section>



        </main>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 left-0 right-0 z-20 flex h-[60px] items-start justify-between bg-[#030716]/95 px-6 pt-2 backdrop-blur-xl border-t border-[#1e3a8a]/30">
          {[
            { label: 'Home', icon: Home, active: true },
            { label: 'Tasks', icon: Check, isBox: true },
            { label: 'Kai', icon: Sparkles },
            { label: 'Fitness', icon: Heart },
            { label: 'Profile', icon: User },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (item.label === 'Kai') setIsKaiOpen(true);
                if (item.label === 'Profile') setIsProfileOpen(true);
              }}
              className="group relative flex flex-col items-center gap-0.5"
            >
              {item.active ? (
                <>
                  <item.icon size={20} className="text-[#3b82f6] fill-[#3b82f6] drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                  <span className="text-[8px] font-medium text-[#3b82f6]">{item.label}</span>
                  <div className="absolute -bottom-2 left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-t-full bg-[#3b82f6] shadow-[0_0_8px_#3b82f6]" />
                </>
              ) : (
                <>
                  {item.isBox ? (
                    <div className="grid place-items-center text-white/40 h-[18px] w-[18px] border-[1.5px] border-white/40 rounded-[4px]">
                      <Check size={10} strokeWidth={3} />
                    </div>
                  ) : (
                    <item.icon size={20} className="text-white/40" strokeWidth={1.8} />
                  )}
                  <span className="text-[8px] font-medium text-white/40">{item.label}</span>
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Kai AI Modal Overlay */}
        <KaiAssistant isOpen={isKaiOpen} onClose={() => setIsKaiOpen(false)} />

        {/* Profile Card Overlay */}
        <ProfileCard isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

        {/* Mandatory Onboarding Modal — shown once, no way to dismiss without completing */}
        <OnboardingModal
          isOpen={showOnboarding}
          onComplete={() => setShowOnboarding(false)}
        />
      </div>
    </div>
  );
}
