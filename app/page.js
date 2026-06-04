"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { calculateMacros } from "@/lib/macros";
import GradientBlinds from "@/components/GradientBlinds";
import KaiAssistant from "@/components/KaiAssistant";
import ProfileCard from "@/components/ProfileCard";
import OnboardingModal from "@/components/OnboardingModal";
import TasksManager from "@/components/TasksManager";
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
  const [tasks, setTasks] = useState([]);
  const [resetTime, setResetTime] = useState("00:00"); // HH:MM, 24h
  const [lastResetAt, setLastResetAt] = useState(null);
  const [tasksSynced, setTasksSynced] = useState(false); // prevent write before first load


  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isKaiOpen, setIsKaiOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTasksManagerOpen, setIsTasksManagerOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [calorieTarget, setCalorieTarget] = useState(null);

  const [editingTask, setEditingTask] = useState(null);
  const [addingTask, setAddingTask] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", value: "" });

  const handleEditTask = (task) => {
    setEditingTask(task.id);
    setAddingTask(false);
    setEditForm({ title: task.title, value: task.value });
  };

  const handleAddTask = () => {
    setAddingTask(true);
    setEditingTask(null);
    setEditForm({ title: "", value: "" });
  };

  const saveTask = () => {
    if (addingTask) {
      setTasks([...tasks, {
        id: Date.now(),
        title: editForm.title || "New Task",
        desc: "Added via Quick Add",
        icon: ClipboardList,
        value: editForm.value || "0 / 1",
        checked: false
      }]);
      setAddingTask(false);
    } else {
      setTasks(tasks.map(t =>
        t.id === editingTask ? { ...t, title: editForm.title, value: editForm.value } : t
      ));
      setEditingTask(null);
    }
  };

  // ─── Load tasks from DB ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!session) return;
    fetch("/api/tasks")
      .then(r => r.json())
      .then(data => {
        // Icons are stored as strings in DB, resolve them back to components
        const iconMap = {
          Dumbbell, Droplet, Book, Leaf, Pill, Zap, Heart, Flame: Flame, ClipboardList,
        };
        const resolved = (data.tasks ?? []).map(t => ({
          ...t,
          icon: typeof t.icon === "string" ? (iconMap[t.icon] ?? ClipboardList) : (t.icon ?? ClipboardList),
        }));
        setTasks(resolved);
        setResetTime(data.resetTime ?? "00:00");
        setLastResetAt(data.lastResetAt ? new Date(data.lastResetAt) : null);
        setTasksSynced(true);
      })
      .catch(console.error);
  }, [session]);

  // ─── Save tasks to DB whenever they change ───────────────────────────────────
  useEffect(() => {
    if (!session || !tasksSynced) return;
    const serialised = tasks.map(t => ({
      ...t,
      icon: typeof t.icon === "function" ? t.icon.displayName || t.icon.name || "ClipboardList" : (t.icon ?? "ClipboardList"),
    }));
    fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks: serialised }),
    }).catch(console.error);
  }, [tasks, session, tasksSynced]);

  // ─── Save resetTime to DB when it changes ────────────────────────────────────
  const handleResetTimeChange = (newTime) => {
    setResetTime(newTime);
    if (!session) return;
    fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resetTime: newTime }),
    }).catch(console.error);
  };

  // ─── Daily reset check ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!session || !tasksSynced) return;

    const checkReset = () => {
      const now = new Date();
      const [rh, rm] = resetTime.split(":").map(Number);
      const resetToday = new Date();
      resetToday.setHours(rh, rm, 0, 0);

      const alreadyReset = lastResetAt && new Date(lastResetAt) >= resetToday;
      if (alreadyReset) return;

      // It's past the reset time for today and we haven't reset yet
      if (now >= resetToday) {
        const dateStr = now.toISOString().split("T")[0];
        const serialised = tasks.map(t => ({
          ...t,
          icon: typeof t.icon === "function" ? t.icon.displayName || t.icon.name || "ClipboardList" : (t.icon ?? "ClipboardList"),
        }));
        // Archive today's snapshot THEN reset
        fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tasks: serialised, date: dateStr }),
        })
          .then(() => {
            setTasks(prev => prev.map(t => ({ ...t, checked: false })));
            const now2 = new Date();
            setLastResetAt(now2);
            // Persist lastResetAt
            fetch("/api/tasks", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ lastResetAt: now2.toISOString() }),
            }).catch(console.error);
          })
          .catch(console.error);
      }
    };

    checkReset();
    const interval = setInterval(checkReset, 60 * 1000); // check every minute
    return () => clearInterval(interval);
  }, [session, tasksSynced, resetTime, lastResetAt]);

  // ─── Calorie Target ─────────────────────────────────────────────────────────
  function calcCalorieTarget({ weight, height, age, gender, workoutDays }) {
    const w = Number(weight) || 0;
    const h = Number(height) || 0;
    const a = Number(age) || 0;
    const d = Number(workoutDays) || 3;
    if (!w || !h || !a || !gender) return null;
    let bmr;
    if (gender === "male") bmr = 10 * w + 6.25 * h - 5 * a + 5;
    else if (gender === "female") bmr = 10 * w + 6.25 * h - 5 * a - 161;
    else bmr = 10 * w + 6.25 * h - 5 * a - 78;
    const mult = d <= 2 ? 1.375 : d <= 4 ? 1.55 : d <= 6 ? 1.725 : 1.9;
    return Math.round(bmr * mult);
  }

  // Check if user has completed onboarding + grab calorie target
  useEffect(() => {
    if (!session) return;
    fetch("/api/profile")
      .then(r => r.json())
      .then(data => {
        if (!data.profile) {
          setShowOnboarding(true);
          return;
        }
        const p = data.profile;
        // Use DB value or fall back to client-side calculation
        const target =
          p.calorieTarget ||
          calcCalorieTarget({
            weight: p.weight,
            height: p.height,
            age: p.age,
            gender: p.gender,
            workoutDays: p.workoutDays,
          });
        setCalorieTarget(target);
      })
      .catch(console.error);
  }, [session]);

  const macros = calculateMacros(calorieTarget);

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

                {/* Main Progress Ring — circumference 251.3, offset = (1-progress)*251.3 */}
                {(() => {
                  const consumed = 0; // set to 0 to await actual implementation
                  const target = calorieTarget || 0;
                  const pct = target > 0 ? Math.min(consumed / target, 1) : 0;
                  const offset = Math.round(251.3 * (1 - pct));
                  return (
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
                        strokeWidth="5.5" strokeLinecap="round"
                        strokeDasharray="251.3" strokeDashoffset={offset}
                        filter="url(#glow)"
                      />
                      {/* Crisp Solid Core Layer */}
                      <circle
                        cx="50" cy="50" r="40" fill="none" stroke="#00f0ff"
                        strokeWidth="1.5" strokeLinecap="round"
                        strokeDasharray="251.3" strokeDashoffset={offset}
                      />
                    </svg>
                  );
                })()}

                {/* Crisp Typography */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-1">
                  <span className="text-[22px] font-bold leading-none tracking-tighter text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">0</span>
                  <span className="text-[7px] text-white/50 font-bold tracking-[0.2em] uppercase mt-1 mb-1.5">
                    / {calorieTarget ? calorieTarget.toLocaleString() : "—"} Kcal
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#00d0ff]/[0.1] px-2 py-0.5 text-[9px] font-bold text-[#00d0ff] border border-[#00d0ff]/20">
                    {calorieTarget ? calorieTarget.toLocaleString() : "—"} LEFT
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
                    <span className="font-semibold text-white">0g <span className="text-white/30 font-medium">/ {macros.protein ? `${macros.protein}g` : "—"}</span></span>
                  </div>
                  <div className="h-[4px] w-full rounded-full bg-[#08102b] overflow-hidden shadow-inner">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#00d0ff]/60 to-[#00d0ff] shadow-[0_0_8px_#00d0ff] transition-all duration-700"
                      style={{ width: macros.protein ? `${Math.min((0 / macros.protein) * 100, 100).toFixed(1)}%` : '0%' }}
                    />
                  </div>
                </div>

                {/* Fats (Azure) */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2 text-white/80">
                      <div className="grid place-items-center h-[20px] w-[20px] rounded-full bg-[#0a1535] border border-[#38bdf8]/30">
                        <Droplet size={10} className="text-[#38bdf8] fill-[#38bdf8]/20 drop-shadow-[0_0_5px_#38bdf8]" />
                      </div>
                      Fat
                    </div>
                    <span className="font-semibold text-white">0g <span className="text-white/30 font-medium">/ {macros.fats ? `${macros.fats}g` : "—"}</span></span>
                  </div>
                  <div className="h-[4px] w-full rounded-full bg-[#08102b] overflow-hidden shadow-inner">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#38bdf8]/60 to-[#38bdf8] shadow-[0_0_8px_#38bdf8] transition-all duration-700"
                      style={{ width: macros.fats ? `${Math.min((0 / macros.fats) * 100, 100).toFixed(1)}%` : '0%' }}
                    />
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
                    <span className="font-semibold text-white">0g <span className="text-white/30 font-medium">/ {macros.carbs ? `${macros.carbs}g` : "—"}</span></span>
                  </div>
                  <div className="h-[4px] w-full rounded-full bg-[#08102b] overflow-hidden shadow-inner">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2dd4bf]/60 to-[#2dd4bf] shadow-[0_0_8px_#2dd4bf] transition-all duration-700"
                      style={{ width: macros.carbs ? `${Math.min((0 / macros.carbs) * 100, 100).toFixed(1)}%` : '0%' }}
                    />
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
                    <span className="font-semibold text-white">
                      0 <span className="text-white/30 font-medium">/ {calorieTarget ? calorieTarget.toLocaleString() : "—"}</span>
                    </span>
                  </div>
                  <div className="h-[4px] w-full rounded-full bg-[#08102b] overflow-hidden shadow-inner">
                    <div
                      className="h-full rounded-full bg-[#3b82f6] shadow-[0_0_8px_#3b82f6] transition-all duration-700"
                      style={{ width: calorieTarget ? `${Math.min((0 / calorieTarget) * 100, 100).toFixed(1)}%` : '0%' }}
                    />
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
              <button onClick={handleAddTask} className="text-[11px] font-medium text-[#00d0ff] hover:text-white transition-colors flex items-center gap-1.5 drop-shadow-[0_0_8px_rgba(0,208,255,0.5)]">
                <Plus size={12} /> Add Task
              </button>
            </div>

            <div className="flex flex-col gap-1.5 relative z-10 flex-1 overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin scrollbar-thumb-[#00d0ff]/20 scrollbar-track-transparent">
              {tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => handleEditTask(task)}
                  className={`group relative flex min-h-[34px] items-center gap-2.5 rounded-[10px] bg-[#07112c]/60 px-3 py-1 transition-all duration-300 hover:bg-[#00d0ff]/[0.05] hover:shadow-[0_0_20px_rgba(0,208,255,0.1)] border border-transparent hover:border-[#00d0ff]/30 cursor-pointer shrink-0 overflow-hidden ${task.checked ? 'opacity-70' : ''}`}
                >
                  {/* Premium Strike-Through Line */}
                  <div
                    className={`absolute left-[40px] right-2 top-1/2 h-[2px] -translate-y-1/2 bg-gradient-to-r from-[#00d0ff] via-[#00d0ff]/80 to-transparent shadow-[0_0_10px_#00d0ff] transition-all duration-500 ease-out z-20 pointer-events-none origin-left ${task.checked ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}`}
                  />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTask(task.id);
                    }}
                    className="relative shrink-0 grid place-items-center h-4 w-4 transition-transform active:scale-90 z-10"
                  >
                    {task.checked ? (
                      <div className="grid place-items-center h-[20px] w-[20px] rounded-full bg-[#00d0ff]/20 border border-[#00d0ff] text-[#00d0ff] shadow-[0_0_12px_rgba(0,208,255,0.6)]">
                        <Check size={12} strokeWidth={3} className="drop-shadow-[0_0_5px_#00d0ff]" />
                      </div>
                    ) : (
                      <Circle size={20} className="text-white/10 transition-colors group-hover:text-[#00d0ff]/40" strokeWidth={1.5} />
                    )}
                  </button>

                  <div className={`grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[8px] bg-[#0a1535] border border-[#00d0ff]/20 text-[#00d0ff] shadow-inner transition-colors z-10 ${task.checked ? 'opacity-50' : 'group-hover:bg-[#00d0ff]/10 group-hover:border-[#00d0ff]/40'}`}>
                    {task.icon && <task.icon size={13} strokeWidth={1.8} className="drop-shadow-[0_0_5px_rgba(0,208,255,0.5)]" />}
                  </div>

                  <div className="flex-1 min-w-0 z-10">
                    <h3 className={`text-[11px] font-semibold truncate tracking-wide transition-colors ${task.checked ? 'text-white/40' : 'text-white/95 group-hover:text-white'}`}>
                      {task.title}
                    </h3>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 text-[9px] font-semibold text-white/40 tracking-wide transition-colors z-10">
                    {task.valIcon && <task.valIcon size={9} className="fill-current" />}
                    {task.value}
                  </div>
                </div>
              ))}
            </div>
          </section>



        </main>

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <nav className="flex h-[68px] pb-2 items-center justify-between bg-[#030818]/95 px-6 backdrop-blur-2xl border-t border-[#1e3a8a]/40 shadow-[0_-15px_35px_rgba(0,0,0,0.5)]">
            {[
              { label: 'Home', icon: Home, active: true },
              { label: 'Tasks', icon: Check, isBox: true },
              { label: 'Kai', icon: Sparkles, isKai: true },
              { label: 'Fitness', icon: Heart },
              { label: 'Profile', icon: User },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (item.label === 'Kai') setIsKaiOpen(true);
                  if (item.label === 'Profile') setIsProfileOpen(true);
                  if (item.label === 'Tasks') setIsTasksManagerOpen(true);
                }}
                className="group relative flex flex-col items-center justify-center w-[52px] h-full transition-all"
              >
                {item.active ? (
                  <>
                    <div className="absolute inset-0 top-1 bottom-1 bg-[#00d0ff]/10 rounded-[16px]" />
                    <item.icon size={22} className="text-[#00d0ff] fill-[#00d0ff] drop-shadow-[0_0_12px_rgba(0,208,255,0.6)] z-10" />
                    <span className="text-[9px] font-bold text-[#00d0ff] z-10 mt-1">{item.label}</span>
                    <div className="absolute bottom-1.5 left-1/2 h-[4px] w-6 -translate-x-1/2 rounded-t-full bg-[#00d0ff] shadow-[0_0_10px_#00d0ff] z-10" />
                  </>
                ) : item.isKai ? (
                  <div className="relative flex flex-col items-center -mt-8 z-30">
                    <div className="relative group flex items-center justify-center">

                      {/* Ambient breathing glow */}
                      <div className="absolute inset-0 bg-[#00d0ff]/20 rounded-full blur-xl scale-[1.8] animate-pulse" />

                      {/* Base shadow layer for elevation */}
                      <div className="absolute -bottom-2 w-8 h-4 bg-black/60 rounded-[100%] blur-md" />

                      {/* The Button Body */}
                      <div className="relative h-[56px] w-[56px] rounded-full p-[1px] bg-gradient-to-br from-white/30 via-white/5 to-[#00d0ff]/20 shadow-[0_10px_25px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105 group-active:scale-95 cursor-pointer">

                        <div className="relative h-full w-full rounded-full bg-gradient-to-b from-[#0a1535] to-[#010614] overflow-hidden flex items-center justify-center shadow-[inset_0_2px_15px_rgba(0,208,255,0.2),inset_0_-2px_15px_rgba(168,85,247,0.15)]">

                          {/* Glossy top reflection */}
                          <div className="absolute top-0 inset-x-2 h-1/2 rounded-full bg-gradient-to-b from-white/10 to-transparent opacity-60" />

                          {/* Inner glowing accent strip */}
                          <div className="absolute top-0 w-2/3 h-[2px] bg-gradient-to-r from-transparent via-[#00d0ff]/90 to-transparent" />

                          {/* Glowing Icon */}
                          <item.icon size={22} className="relative z-10 text-white drop-shadow-[0_0_8px_rgba(0,208,255,0.8)]" />

                          {/* Bottom colorful light bounce */}
                          <div className="absolute -bottom-2 w-full h-[15px] bg-[#00d0ff]/30 blur-[6px] rounded-full" />
                        </div>
                      </div>
                    </div>

                    <span className="relative text-[9px] font-bold text-white tracking-[0.2em] uppercase mt-2 drop-shadow-[0_0_5px_rgba(0,208,255,0.4)]">{item.label}</span>
                  </div>
                ) : (
                  <>
                    <div className="absolute inset-0 top-1 bottom-1 bg-white/0 group-hover:bg-white/[0.04] rounded-[16px] transition-all" />
                    {item.isBox ? (
                      <div className="grid place-items-center text-white/50 h-[22px] w-[22px] border-[1.5px] border-white/30 rounded-[6px] group-hover:text-white group-hover:border-white/60 transition-all z-10">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    ) : (
                      <item.icon size={22} className="text-white/40 group-hover:text-white/80 transition-colors z-10" strokeWidth={1.8} />
                    )}
                    <span className="text-[9px] font-medium text-white/40 group-hover:text-white/80 transition-colors z-10 mt-1">{item.label}</span>
                  </>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Kai AI Modal Overlay */}
        <KaiAssistant isOpen={isKaiOpen} onClose={() => setIsKaiOpen(false)} />

        {/* Profile Card Overlay */}
        <ProfileCard isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

        {/* Tasks Manager Overlay */}
        <TasksManager
          isOpen={isTasksManagerOpen}
          onClose={() => setIsTasksManagerOpen(false)}
          tasks={tasks}
          setTasks={setTasks}
          resetTime={resetTime}
          onResetTimeChange={handleResetTimeChange}
        />

        {/* Task Edit / Add Modal */}
        {(editingTask || addingTask) && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-[24px] bg-[#030818] border border-[#00d0ff]/30 p-6 shadow-[0_0_50px_rgba(0,150,255,0.15)] flex flex-col">
              <h3 className="text-white font-bold text-lg mb-4 tracking-wide text-center drop-shadow-[0_0_8px_rgba(0,208,255,0.5)]">
                {addingTask ? "Add New Task" : "Edit Task"}
              </h3>

              <div className="flex flex-col gap-3 mb-6">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40 ml-1 mb-1 block">Main Task</label>
                  <input
                    autoFocus
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#00d0ff]/50 focus:shadow-[0_0_15px_rgba(0,208,255,0.15)] transition-all"
                    placeholder="Enter task name"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40 ml-1 mb-1 block">Right Corner Value</label>
                  <input
                    type="text"
                    value={editForm.value}
                    onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                    className="w-full rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#00d0ff]/50 focus:shadow-[0_0_15px_rgba(0,208,255,0.15)] transition-all"
                    placeholder="e.g. 1 / 2 Liters"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-auto">
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setAddingTask(false);
                  }}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-white/60 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveTask}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-[#030818] bg-gradient-to-r from-[#00d0ff] to-[#3b82f6] shadow-[0_0_20px_rgba(0,208,255,0.4)] hover:shadow-[0_0_25px_rgba(0,208,255,0.6)] transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mandatory Onboarding Modal — shown once, no way to dismiss without completing */}
        <OnboardingModal
          isOpen={showOnboarding}
          onComplete={() => setShowOnboarding(false)}
        />
      </div>
    </div>
  );
}
