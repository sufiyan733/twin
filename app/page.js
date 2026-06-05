"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { calculateMacros } from "@/lib/macros";
import GradientBlinds from "@/components/GradientBlinds";
import KaiAssistant from "@/components/KaiAssistant";
import OnboardingModal from "@/components/OnboardingModal";
import TasksManager from "@/components/TasksManager";
import MealsManager from "@/components/MealsManager";
import GoalDropdown from "@/components/GoalDropdown";
import CreateGoalModal from "@/components/CreateGoalModal";
import {
  Bell,
  Book,
  Check,
  Circle,
  Dumbbell,
  Flame,
  Heart,
  Leaf,
  Loader2,
  Menu,
  Pill,
  Plus,
  Send,
  Zap,
  Droplet,
  ClipboardList,
  Clock
} from "lucide-react";

// ── Icon registry — all task icons must live here so we can safely render them
// regardless of whether task.icon is a string name or a component reference.
const ICON_MAP = {
  Dumbbell,
  Droplet,
  Book,
  Leaf,
  Pill,
  Zap,
  Heart,
  Flame,
  ClipboardList,
  List: ClipboardList,
};

/** Safely resolve a task icon — accepts a string key, a component fn, or null */
function resolveIcon(icon) {
  if (!icon) return ClipboardList;
  if (typeof icon === "string") return ICON_MAP[icon] ?? ClipboardList;
  if (typeof icon === "function") return icon;
  // Lucide can export objects in some bundler configs; try .render or bail out
  if (typeof icon === "object" && typeof icon.render === "function") return icon;
  return ClipboardList;
}

export default function Page() {
  const [tasks, setTasks] = useState([]);
  const [resetTime, setResetTime] = useState("00:00"); // HH:MM, 24h
  const [lastResetAt, setLastResetAt] = useState(null);
  const [tasksSynced, setTasksSynced] = useState(false); // prevent write before first load

  // ─── Custom Goals ────────────────────────────────────────────────────────────
  const [goals, setGoals] = useState([]);
  const [goalsSynced, setGoalsSynced] = useState(false);
  const [activeGoalId, setActiveGoalId] = useState(null); // null = Daily Tasks
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);


  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isKaiOpen, setIsKaiOpen] = useState(false);
  const [isTasksManagerOpen, setIsTasksManagerOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [calorieTarget, setCalorieTarget] = useState(null);
  // Ensures the profile check runs exactly once per mount — prevents better-auth
  // session token refreshes (which change the session object reference) from
  // re-triggering the effect and re-showing the onboarding modal.
  const profileFetchedRef = useRef(false);

  const [meals, setMeals] = useState([]);
  const [isMealsManagerOpen, setIsMealsManagerOpen] = useState(false);
  const [mealsSynced, setMealsSynced] = useState(false);
  const [lastMealsResetAt, setLastMealsResetAt] = useState(null);

  const consumed = {
    calories: meals.reduce((sum, m) => sum + (m.calories || 0), 0),
    protein: meals.reduce((sum, m) => sum + (m.protein || 0), 0),
    fat: meals.reduce((sum, m) => sum + (m.fat || 0), 0),
    carbs: meals.reduce((sum, m) => sum + (m.carbs || 0), 0),
  };

  const saveMealsToDb = async (newMeals) => {
    if (!session) return;
    try {
      await fetch("/api/meals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meals: newMeals })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleNutritionUpdate = (action) => {
    const newMeal = {
      id: Date.now(),
      name: "Logged via Kai",
      calories: action.calories || 0,
      protein: action.protein || 0,
      fat: action.fat || 0,
      carbs: action.carbs || 0,
    };
    const updatedMeals = [...meals, newMeal];
    setMeals(updatedMeals);
    saveMealsToDb(updatedMeals);
  };

  // ─── Load meals from DB ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!session) return;
    fetch("/api/meals")
      .then(r => r.json())
      .then(data => {
        setMeals(data.meals ?? []);
        setLastMealsResetAt(data.lastResetAt ? new Date(data.lastResetAt) : null);
        setMealsSynced(true);
      })
      .catch(console.error);
  }, [session]);

  // ─── Save meals to DB whenever they change ──────────────────────────────────
  useEffect(() => {
    if (!session || !mealsSynced) return;
    fetch("/api/meals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meals }),
    }).catch(console.error);
  }, [meals, session, mealsSynced]);

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
  const iconMap = { Dumbbell, Droplet, Book, Leaf, Pill, Zap, Heart, Flame, ClipboardList };

  useEffect(() => {
    if (!session) return;
    fetch("/api/tasks")
      .then(r => r.json())
      .then(data => {
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

  // ─── Load goals from DB ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!session) return;
    fetch("/api/goals")
      .then(r => r.json())
      .then(data => {
        // Resolve task icons inside each goal
        const resolved = (data.goals ?? []).map(g => ({
          ...g,
          tasks: (g.tasks ?? []).map(t => ({
            ...t,
            icon: typeof t.icon === "string" ? (iconMap[t.icon] ?? ClipboardList) : (t.icon ?? ClipboardList),
          })),
        }));
        setGoals(resolved);
        setGoalsSynced(true);
      })
      .catch(console.error);
  }, [session]);

  // ─── Save goals to DB whenever they change ───────────────────────────────────
  useEffect(() => {
    if (!session || !goalsSynced) return;
    const serialised = goals.map(g => ({
      ...g,
      tasks: (g.tasks ?? []).map(t => ({
        ...t,
        icon: typeof t.icon === "function"
          ? (t.icon.displayName || t.icon.name || "ClipboardList")
          : (t.icon ?? "ClipboardList"),
      })),
    }));
    fetch("/api/goals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goals: serialised }),
    }).catch(console.error);
  }, [goals, session, goalsSynced]);

  // ─── Handle new goal creation ────────────────────────────────────────────────
  const handleGoalSave = async (newGoal) => {
    const updated = [...goals, newGoal];
    setGoals(updated);
    // Switch to the newly created goal immediately
    setActiveGoalId(newGoal.id);
  };

  // ─── Update tasks inside a specific goal ────────────────────────────────────
  const setGoalTasks = (goalId, updater) => {
    setGoals(prev => prev.map(g =>
      g.id === goalId ? { ...g, tasks: typeof updater === "function" ? updater(g.tasks) : updater } : g
    ));
  };

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

        // 1. Wipe all tasks from DB (no history kept)
        setTasks([]);
        setLastResetAt(now);
        fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }).catch(console.error);

        // 2. Archive meals to meal_history for analysis, then clear
        setMeals([]);
        setLastMealsResetAt(now);
        fetch("/api/meals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ meals, date: dateStr }),
        }).catch(console.error);
      }
    };

    checkReset();
    const interval = setInterval(checkReset, 60 * 1000);
    return () => clearInterval(interval);
  }, [session, tasksSynced, resetTime, lastResetAt, lastMealsResetAt]);

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

  // Check if user has completed onboarding + grab calorie target.
  // profileFetchedRef ensures this runs exactly ONCE per mount regardless of
  // how many times better-auth refreshes the session object reference.
  useEffect(() => {
    if (!session || profileFetchedRef.current) return;
    profileFetchedRef.current = true;
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
      .catch(err => {
        // On error allow a retry next session tick
        profileFetchedRef.current = false;
        console.error(err);
      });
  }, [session]);

  const macros = calculateMacros(calorieTarget);

  // Auth guard
  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [session, isPending, router]);

  // Listen for the global nav's Kai button — BottomNav dispatches this event
  // so the home page can open Kai with full nutrition context.
  useEffect(() => {
    const handler = () => setIsKaiOpen(true);
    window.addEventListener("twin:open-kai", handler);
    return () => window.removeEventListener("twin:open-kai", handler);
  }, []);

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
        <main className="relative z-10 flex-1 flex flex-col overflow-hidden px-4 pb-[84px] space-y-3">

          {/* Calorie Intake Card */}
          <section className="relative shrink-0 overflow-hidden rounded-[20px] border border-white/[0.08] bg-gradient-to-br from-[#040c24] via-[#030818] to-[#020510] p-3.5 shadow-[0_4px_40px_rgba(0,120,255,0.12),inset_0_1px_0_rgba(255,255,255,0.04)]">
            {/* Multi-layer premium background effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,208,255,0.08),transparent_55%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.06),transparent_55%)] pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '16px 16px'}} />
            {/* Top highlight edge */}
            <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[#00d0ff]/25 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="relative grid place-items-center h-[28px] w-[28px] rounded-[10px] bg-gradient-to-br from-[#0a1535] to-[#060e28] border border-[#00d0ff]/25 shadow-[0_0_12px_rgba(0,208,255,0.2),inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <Flame size={14} className="text-[#00d0ff] fill-[#00d0ff]/30 drop-shadow-[0_0_6px_#00d0ff]" />
                </div>
                <div>
                  <h2 className="text-[13px] font-bold text-white/95 tracking-wide leading-none">Calorie Intake</h2>
                  <p className="text-[8px] text-white/30 font-medium tracking-[0.15em] uppercase mt-0.5">Daily Tracker</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsMealsManagerOpen(true)}
                  className="flex items-center gap-1 rounded-[8px] bg-[#00d0ff]/[0.06] px-2.5 py-1.5 text-[9px] font-bold text-[#00d0ff] border border-[#00d0ff]/15 hover:bg-[#00d0ff]/[0.12] hover:border-[#00d0ff]/30 hover:shadow-[0_0_12px_rgba(0,208,255,0.15)] transition-all duration-200 tracking-wider uppercase"
                >
                  <Plus size={10} strokeWidth={2.5} />
                  Meals
                </button>
                <div className="flex items-center gap-1.5 rounded-[8px] bg-[#00d0ff]/[0.03] px-2.5 py-1.5 border border-[#00d0ff]/[0.15] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_2px_8px_rgba(0,0,0,0.2)] backdrop-blur-md">
                  <div className="relative grid place-items-center h-[18px] w-[18px] rounded-full bg-[#00d0ff]/10 border border-[#00d0ff]/20 shadow-[inset_0_1px_2px_rgba(0,208,255,0.2)]">
                    <Clock size={10} className="text-[#00d0ff] drop-shadow-[0_0_5px_rgba(0,208,255,0.8)]" strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-bold text-[#00d0ff]/90 tabular-nums tracking-wider uppercase mt-[1px]" style={{ fontFeatureSettings: '"tnum"' }}>
                    {currentTime || "..."}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between relative z-10">
              {/* Circular Progress Ring - Elegant Premium Edition */}
              <div className="relative flex h-[108px] w-[108px] shrink-0 items-center justify-center -ml-0.5 group">
                
                {/* Subtle ambient backglow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#00d0ff]/5 to-[#3b82f6]/5 rounded-full blur-[15px]" />

                {/* Main Progress Ring */}
                {(() => {
                  const target = calorieTarget || 0;
                  const pct = target > 0 ? Math.min(consumed.calories / target, 1) : 0;
                  const radius = 42;
                  const circumference = 2 * Math.PI * radius;
                  const offset = circumference * (1 - pct);
                  
                  return (
                    <svg className="relative h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="premiumArc" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#38bdf8" />
                          <stop offset="100%" stopColor="#818cf8" />
                        </linearGradient>
                        <filter id="premiumShadow" x="-30%" y="-30%" width="160%" height="160%">
                          <feDropShadow dx="0" dy="4" stdDeviation="4.5" floodColor="#38bdf8" floodOpacity="0.35" />
                        </filter>
                      </defs>

                      {/* Deep base track */}
                      <circle cx="50" cy="50" r={radius} fill="none" stroke="#050b1a" strokeWidth="6" />
                      {/* Track glass overlay */}
                      <circle cx="50" cy="50" r={radius} fill="none" stroke="#ffffff" strokeWidth="6" strokeOpacity="0.04" />
                      {/* Inner metallic lip */}
                      <circle cx="50" cy="50" r={radius - 3} fill="none" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.06" />
                      {/* Outer metallic lip */}
                      <circle cx="50" cy="50" r={radius + 3} fill="none" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.03" />

                      {/* Main glowing progress arc */}
                      <circle
                        cx="50" cy="50" r={radius} fill="none" stroke="url(#premiumArc)"
                        strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={circumference} strokeDashoffset={offset}
                        filter="url(#premiumShadow)"
                        style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)' }}
                      />
                      
                      {/* Crisp inner highlight for the arc (gives it a 3D glass tube feel) */}
                      <circle
                        cx="50" cy="50" r={radius} fill="none" stroke="#ffffff"
                        strokeWidth="1.5" strokeLinecap="round"
                        strokeDasharray={circumference} strokeDashoffset={offset}
                        strokeOpacity="0.4"
                        style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)' }}
                      />

                      {/* Elegant Endpoint Pearl */}
                      {pct > 0 && (() => {
                        const endAngle = (pct * 360) * Math.PI / 180;
                        const cx = 50 + radius * Math.cos(endAngle);
                        const cy = 50 + radius * Math.sin(endAngle);
                        return (
                          <g transform={`translate(${cx}, ${cy}) rotate(90)`}>
                            <circle r="4.5" fill="#ffffff" shadow="0 2px 5px rgba(0,0,0,0.5)" />
                            <circle r="4.5" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />
                          </g>
                        );
                      })()}
                    </svg>
                  );
                })()}

                {/* Center content - Sophisticated Typography */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-0.5">
                  <span 
                    className="text-[25px] font-semibold leading-[1] tracking-[-0.02em] text-white/95" 
                    style={{ fontFeatureSettings: '"tnum", "cv11"' }}
                  >
                    {consumed.calories.toLocaleString()}
                  </span>
                  <span className="text-[7.5px] text-white/40 font-medium tracking-[0.2em] uppercase mt-1.5 mb-1.5">
                    / {calorieTarget ? calorieTarget.toLocaleString() : "—"} kcal
                  </span>
                  
                  {/* Minimalist Frosted Badge */}
                  <div className="inline-flex items-center gap-1.5 rounded-[6px] bg-white/[0.04] px-2 py-[3px] border border-white/[0.08] shadow-[0_2px_10px_rgba(0,0,0,0.2)] backdrop-blur-md">
                    <div className="w-[4px] h-[4px] rounded-full bg-[#38bdf8] shadow-[0_0_6px_#38bdf8]" />
                    <span className="text-[8px] font-medium text-white/75 tracking-wide">
                      {calorieTarget ? Math.max(0, calorieTarget - consumed.calories).toLocaleString() : "—"} left
                    </span>
                  </div>
                </div>
              </div>

              {/* Macro Breakdown */}
              <div className="flex flex-1 flex-col justify-center gap-[7px] pl-3.5">

                {[
                  {
                    label: "Protein",
                    icon: Dumbbell,
                    current: consumed.protein,
                    target: macros.protein,
                    colors: { from: "#8b5cf6", to: "#a78bfa", bg: "rgba(139,92,246,0.06)", border: "rgba(139,92,246,0.12)", text: "#a78bfa", glow: "rgba(139,92,246,0.4)" },
                  },
                  {
                    label: "Fat",
                    icon: Droplet,
                    current: consumed.fat,
                    target: macros.fats,
                    colors: { from: "#f59e0b", to: "#fbbf24", bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.12)", text: "#fbbf24", glow: "rgba(245,158,11,0.4)" },
                  },
                  {
                    label: "Carbs",
                    icon: Leaf,
                    current: consumed.carbs,
                    target: macros.carbs,
                    colors: { from: "#10b981", to: "#34d399", bg: "rgba(16,185,129,0.06)", border: "rgba(16,185,129,0.12)", text: "#34d399", glow: "rgba(16,185,129,0.4)" },
                  },
                  {
                    label: "Calories",
                    icon: Flame,
                    current: consumed.calories,
                    target: calorieTarget,
                    colors: { from: "#3b82f6", to: "#60a5fa", bg: "rgba(59,130,246,0.06)", border: "rgba(59,130,246,0.12)", text: "#60a5fa", glow: "rgba(59,130,246,0.4)" },
                    isCalorie: true,
                  },
                ].map((macro) => {
                  const Icon = macro.icon;
                  const pct = macro.target ? Math.min((macro.current / macro.target) * 100, 100) : 0;
                  return (
                    <div key={macro.label} className="group relative">
                      {/* Row Header */}
                      <div className="flex items-center gap-2 mb-[3px]">
                        <div
                          className="grid place-items-center h-[20px] w-[20px] rounded-[7px] shrink-0 shadow-sm backdrop-blur-sm transition-colors duration-300 group-hover:bg-opacity-20"
                          style={{ 
                            background: macro.colors.bg, 
                            border: `1px solid ${macro.colors.border}`,
                            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08), 0 2px 4px rgba(0,0,0,0.15)' 
                          }}
                        >
                          <Icon size={10} strokeWidth={2.5} style={{ color: macro.colors.text }} className="drop-shadow-[0_0_3px_currentColor]" />
                        </div>
                        <span className="text-[10px] font-medium text-white/70 flex-1 tracking-wide">{macro.label}</span>
                        <span className="text-[10px] font-semibold text-white/95 tabular-nums tracking-tight" style={{ fontFeatureSettings: '"tnum", "cv11"' }}>
                          {macro.isCalorie ? macro.current.toLocaleString() : macro.current}
                          <span className="text-white/40 font-medium text-[8px] ml-[2px] tracking-wider">
                            / {macro.target ? (macro.isCalorie ? macro.target.toLocaleString() : `${macro.target}g`) : "—"}
                          </span>
                        </span>
                      </div>
                      
                      {/* Bar Track - Inset deep groove */}
                      <div className="relative h-[4px] w-full rounded-full bg-[#050b1a] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.6)] border border-white/[0.03] overflow-hidden">
                        {/* Progress Fill - Glossy tube effect */}
                        <div
                          className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] flex justify-end"
                          style={{
                            width: `${pct.toFixed(1)}%`,
                            background: `linear-gradient(90deg, ${macro.colors.from}, ${macro.colors.to})`,
                            boxShadow: `inset 0 1px 1px rgba(255,255,255,0.25), 0 0 8px ${macro.colors.glow}`,
                          }}
                        >
                          {/* Endpoint Specular Pearl */}
                          {pct > 1 && (
                            <div className="h-full w-[3px] bg-white opacity-80 rounded-full blur-[0.5px] shadow-[-2px_0_4px_rgba(255,255,255,0.5)] mr-[1px]" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>
          </section>

          {/* Daily Tasks / Goals Card */}
          <section className="relative flex-1 flex flex-col rounded-[16px] border border-[#00d0ff]/25 bg-[#030818] p-3 shadow-[0_0_35px_rgba(0,150,255,0.15)] backdrop-blur-xl mb-1">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,208,255,0.12),transparent_70%)] pointer-events-none" />

            {/* Card header */}
            <div className="flex items-center justify-between mb-2 relative z-50 shrink-0">
              {/* Left: icon + goal dropdown */}
              <div className="flex items-center gap-2 relative">
                <div className={`grid place-items-center h-[30px] w-[30px] rounded-full border shadow-[0_0_15px_rgba(0,208,255,0.3)] shrink-0 ${
                  activeGoalId
                    ? "bg-[#1a0a35] border-[#a855f7]/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                    : "bg-[#0a1535] border-[#00d0ff]/40"
                }`}>
                  {activeGoalId
                    ? <span className="text-[14px]">🎯</span>
                    : <ClipboardList size={16} className="text-[#00d0ff] drop-shadow-[0_0_5px_#00d0ff]" />
                  }
                </div>
                <GoalDropdown
                  goals={goals}
                  activeGoalId={activeGoalId}
                  onChange={setActiveGoalId}
                  onAddGoal={() => setIsCreateGoalOpen(true)}
                />
              </div>

              {/* Right: manager + add task (daily only) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTasksManagerOpen(true)}
                  className="grid place-items-center h-[26px] w-[26px] rounded-[8px] bg-[#0a1535] border border-[#00d0ff]/20 text-[#00d0ff]/60 hover:text-[#00d0ff] hover:border-[#00d0ff]/50 hover:bg-[#00d0ff]/10 hover:shadow-[0_0_10px_rgba(0,208,255,0.2)] transition-all"
                  title="Open Task Manager"
                >
                  <ClipboardList size={13} strokeWidth={1.8} />
                </button>
                {!activeGoalId && (
                  <button
                    onClick={handleAddTask}
                    className="flex items-center gap-1.5 h-[26px] px-2.5 rounded-[8px] bg-[#0a1535] border border-[#00d0ff]/20 text-[11px] font-medium text-[#00d0ff] hover:border-[#00d0ff]/50 hover:bg-[#00d0ff]/10 hover:shadow-[0_0_10px_rgba(0,208,255,0.2)] transition-all drop-shadow-[0_0_8px_rgba(0,208,255,0.3)]"
                  >
                    <Plus size={12} strokeWidth={2.5} /> Add Task
                  </button>
                )}
              </div>
            </div>

            {/* Goal duration badge (when a custom goal is active) */}
            {(() => {
              const g = goals.find(x => x.id === activeGoalId);
              if (!g) return null;
              const elapsed = Math.floor((Date.now() - new Date(g.startDate)) / 86_400_000);
              const remaining = Math.max(0, g.days - elapsed);
              return (
                <div className="mb-2 flex items-center gap-2 relative z-10 shrink-0">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#a855f7]/10 border border-[#a855f7]/20">
                    <span className="text-[10px] font-semibold text-[#c084fc]">{g.days}d goal</span>
                    <span className="text-white/20 text-[10px]">·</span>
                    <span className="text-[10px] text-white/50">{remaining}d remaining</span>
                  </div>
                </div>
              );
            })()}

            {/* Task list — daily or goal */}
            <div className="flex flex-col gap-1.5 relative z-10 flex-1 overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin scrollbar-thumb-[#00d0ff]/20 scrollbar-track-transparent">
              {(() => {
                // Determine which task list to render
                const activeGoal = goals.find(g => g.id === activeGoalId);
                const displayTasks = activeGoal ? (activeGoal.tasks ?? []) : tasks;
                const accentColor = activeGoal ? "#a855f7" : "#00d0ff";
                const accentBg = activeGoal ? "bg-[#1a0a35]" : "bg-[#0a1535]";
                const accentBorder = activeGoal ? "border-[#a855f7]/20" : "border-[#00d0ff]/20";

                const toggleDisplayTask = (id) => {
                  if (activeGoal) {
                    setGoalTasks(activeGoal.id, prev =>
                      prev.map(t => t.id === id ? { ...t, checked: !t.checked } : t)
                    );
                  } else {
                    toggleTask(id);
                  }
                };

                if (displayTasks.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center flex-1 gap-2 text-white/20">
                      <ClipboardList size={24} strokeWidth={1.2} />
                      <p className="text-[11px]">
                        {activeGoal ? "No tasks yet in this goal" : "No tasks yet. Add one above."}
                      </p>
                    </div>
                  );
                }

                return displayTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => !activeGoal && handleEditTask(task)}
                    className={`group relative flex min-h-[34px] items-center gap-2.5 rounded-[10px] bg-[#07112c]/60 px-3 py-1 transition-all duration-300 border border-transparent shrink-0 overflow-hidden ${
                      task.checked ? 'opacity-70' : ''
                    } ${
                      activeGoal
                        ? 'hover:bg-[#a855f7]/[0.05] hover:border-[#a855f7]/20'
                        : 'hover:bg-[#00d0ff]/[0.05] hover:shadow-[0_0_20px_rgba(0,208,255,0.1)] hover:border-[#00d0ff]/30 cursor-pointer'
                    }`}
                  >
                    {/* Strike-Through Line */}
                    <div
                      className={`absolute left-[40px] right-2 top-1/2 h-[2px] -translate-y-1/2 transition-all duration-500 ease-out z-20 pointer-events-none origin-left ${
                        task.checked ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
                      }`}
                      style={{
                        background: `linear-gradient(to right, ${accentColor}, ${accentColor}cc, transparent)`,
                        boxShadow: `0 0 10px ${accentColor}`,
                      }}
                    />

                    <button
                      onClick={(e) => { e.stopPropagation(); toggleDisplayTask(task.id); }}
                      className="relative shrink-0 grid place-items-center h-4 w-4 transition-transform active:scale-90 z-10"
                    >
                      {task.checked ? (
                        <div
                          className="grid place-items-center h-[20px] w-[20px] rounded-full border text-white"
                          style={{
                            backgroundColor: `${accentColor}33`,
                            borderColor: accentColor,
                            boxShadow: `0 0 12px ${accentColor}99`,
                          }}
                        >
                          <Check size={12} strokeWidth={3} style={{ color: accentColor }} />
                        </div>
                      ) : (
                        <Circle size={20} className="text-white/10 transition-colors group-hover:text-white/30" strokeWidth={1.5} />
                      )}
                    </button>

                    <div className={`grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[8px] border text-white shadow-inner transition-colors z-10 ${accentBg} ${accentBorder} ${
                      task.checked ? 'opacity-50' : ''
                    }`}>
                      {(() => { const Icon = resolveIcon(task.icon); return <Icon size={13} strokeWidth={1.8} style={{ color: accentColor }} className="drop-shadow" />; })()}
                    </div>

                    <div className="flex-1 min-w-0 z-10">
                      <h3 className={`text-[11px] font-semibold truncate tracking-wide transition-colors ${task.checked ? 'text-white/40' : 'text-white/95 group-hover:text-white'}`}>
                        {task.title}
                      </h3>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 text-[9px] font-semibold text-white/40 tracking-wide z-10">
                      {task.value}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </section>
        </main>


        {/* Kai AI Modal Overlay — opened via twin:open-kai event from BottomNav */}
        <KaiAssistant
          isOpen={isKaiOpen}
          onClose={() => setIsKaiOpen(false)}
          consumed={consumed}
          calorieTarget={calorieTarget}
          macros={macros}
          onNutritionUpdate={handleNutritionUpdate}
        />

        {/* Meals Manager Overlay */}
        <MealsManager
          isOpen={isMealsManagerOpen}
          onClose={() => setIsMealsManagerOpen(false)}
          meals={meals}
          setMeals={setMeals}
          saveMealsToDb={saveMealsToDb}
        />

        {/* Tasks Manager Overlay */}
        <TasksManager
          isOpen={isTasksManagerOpen}
          onClose={() => setIsTasksManagerOpen(false)}
          tasks={tasks}
          setTasks={setTasks}
          resetTime={resetTime}
          onResetTimeChange={handleResetTimeChange}
          goals={goals}
          setGoals={setGoals}
          activeGoalId={activeGoalId}
          setActiveGoalId={setActiveGoalId}
        />

        {/* Create Goal Modal */}
        <CreateGoalModal
          isOpen={isCreateGoalOpen}
          onClose={() => setIsCreateGoalOpen(false)}
          onSave={handleGoalSave}
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
                  <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40 ml-1 mb-1 block">Target</label>
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
          onComplete={() => {
            setShowOnboarding(false);
            // Hydrate calorie target immediately after onboarding saves
            fetch("/api/profile")
              .then(r => r.json())
              .then(data => {
                if (!data.profile) return;
                const p = data.profile;
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
          }}
        />
      </div>
    </div>
  );
}
