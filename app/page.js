"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
import NutritionAnalytics from "@/components/NutritionAnalytics";
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
  LogOut,
  Menu,
  MessageCircle,
  Pill,
  Plus,
  Send,
  Zap,
  Droplet,
  ClipboardList,
  Clock,
  NotebookText,
  Star,
  Home,
  TrendingUp,
  User,
  Sparkles,
  LayoutList,
  ChevronDown,
  Search,
} from "lucide-react";

// ── Icon registry
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
  Star,
  Home,
  TrendingUp,
  User,
  Sparkles,
  LayoutList,
  ChevronDown,
};

function resolveIcon(icon) {
  if (!icon) return ClipboardList;
  if (typeof icon === "string") return ICON_MAP[icon] ?? ClipboardList;
  if (typeof icon === "function") return icon;
  if (typeof icon === "object" && typeof icon.render === "function") return icon;
  return ClipboardList;
}

// ── Theme tokens (goal image palette)
const T = {
  bg: `radial-gradient(circle at 30% 40%, rgba(255,255,255,0.15) 0%, transparent 4%), radial-gradient(circle at 75% 65%, rgba(255,255,255,0.1) 0%, transparent 3%), linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.12) 30.5%, rgba(255,255,255,0.02) 32%, transparent 34%), linear-gradient(245deg, transparent 60%, rgba(255,255,255,0.1) 60.5%, rgba(255,255,255,0.02) 62%, transparent 64%), linear-gradient(170deg, transparent 75%, rgba(255,255,255,0.08) 75.5%, rgba(255,255,255,0.01) 77%, transparent 78%), linear-gradient(35deg, transparent 40%, rgba(255,255,255,0.06) 40.5%, rgba(255,255,255,0.01) 42%, transparent 43%), conic-gradient(from 90deg at 80% 20%, rgba(255,255,255,0.04) 0deg, transparent 45deg, rgba(255,255,255,0.03) 90deg, transparent 135deg), conic-gradient(from -45deg at 10% 80%, rgba(255,255,255,0.04) 0deg, transparent 60deg), conic-gradient(from 180deg at 75% 65%, #111111 0deg, #000000 30deg, #1a1a1a 90deg, #000000 150deg, #111111 200deg, #000000 260deg, #1a1a1a 320deg, transparent 320.1deg), conic-gradient(from 20deg at 30% 40%, #1a1a1a 0deg, #000000 40deg, #0f0f0f 90deg, #000000 150deg, #1c1c1c 200deg, #000000 260deg, #05140b 300deg, #080808 320deg, #1a1a1a 360deg)`,
  card: `linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 15%, transparent 35%), linear-gradient(180deg, rgba(25,35,50,0.95) 0%, rgba(10,12,15,0.98) 100%)`,
  cardAlt: `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 20%, transparent 35%), linear-gradient(180deg, rgba(35,45,60,0.7) 0%, rgba(15,18,22,0.9) 100%)`,
  border: "rgba(255,255,255,0.12)",
  accent: "#00d0ff",
  textPrimary: "#f8fafc",
  textMuted: "#94a3b8",
  textFaint: "#475569",
};

export default function Page() {
  const [tasks, setTasks] = useState([]);
  const [resetTime, setResetTime] = useState("00:00");
  const [lastResetAt, setLastResetAt] = useState(null);
  const [tasksSynced, setTasksSynced] = useState(false);

  const [goals, setGoals] = useState([]);
  const [goalsSynced, setGoalsSynced] = useState(false);
  const [activeGoalId, setActiveGoalId] = useState(null);
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);

  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isKaiOpen, setIsKaiOpen] = useState(false);
  const [isTasksManagerOpen, setIsTasksManagerOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [calorieTarget, setCalorieTarget] = useState(null);
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
        body: JSON.stringify({ meals: newMeals }),
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
      .then((r) => r.json())
      .then((data) => {
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
      setTasks([
        ...tasks,
        {
          id: Date.now(),
          title: editForm.title || "New Task",
          desc: "Added via Quick Add",
          icon: ClipboardList,
          value: editForm.value || "0 / 1",
          checked: false,
        },
      ]);
      setAddingTask(false);
    } else {
      setTasks(
        tasks.map((t) =>
          t.id === editingTask
            ? { ...t, title: editForm.title, value: editForm.value }
            : t
        )
      );
      setEditingTask(null);
    }
  };

  // ─── Load tasks from DB ─────────────────────────────────────────────────────
  const iconMap = { Dumbbell, Droplet, Book, Leaf, Pill, Zap, Heart, Flame, ClipboardList };

  useEffect(() => {
    if (!session) return;
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data) => {
        const resolved = (data.tasks ?? []).map((t) => ({
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
      .then((r) => r.json())
      .then((data) => {
        const resolved = (data.goals ?? []).map((g) => ({
          ...g,
          tasks: (g.tasks ?? []).map((t) => ({
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
    const serialised = goals.map((g) => ({
      ...g,
      tasks: (g.tasks ?? []).map((t) => ({
        ...t,
        icon:
          typeof t.icon === "function"
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
    setActiveGoalId(newGoal.id);
  };

  // ─── Update tasks inside a specific goal ────────────────────────────────────
  const setGoalTasks = (goalId, updater) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, tasks: typeof updater === "function" ? updater(g.tasks) : updater } : g
      )
    );
  };

  // ─── Save tasks to DB whenever they change ───────────────────────────────────
  useEffect(() => {
    if (!session || !tasksSynced) return;
    const serialised = tasks.map((t) => ({
      ...t,
      icon:
        typeof t.icon === "function"
          ? (t.icon.displayName || t.icon.name || "ClipboardList")
          : (t.icon ?? "ClipboardList"),
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

      if (now >= resetToday) {
        const dateStr = now.toISOString().split("T")[0];
        setTasks([]);
        setLastResetAt(now);
        fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }).catch(console.error);

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

  useEffect(() => {
    if (!session || profileFetchedRef.current) return;
    profileFetchedRef.current = true;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (!data.profile) {
          setShowOnboarding(true);
          return;
        }
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
      .catch((err) => {
        profileFetchedRef.current = false;
        console.error(err);
      });
  }, [session]);

  const macros = calculateMacros(calorieTarget);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    const handler = () => setIsKaiOpen(true);
    window.addEventListener("twin:open-kai", handler);
    return () => window.removeEventListener("twin:open-kai", handler);
  }, []);

  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isPending || !session) {
    return (
      <div className="fixed inset-0 w-full overflow-hidden font-sans text-white selection:bg-emerald-500/30" style={{ background: T.bg }}>
        <div className="relative mx-auto flex h-full w-full max-w-[400px] flex-col overflow-hidden" style={{ background: T.bg }}>
          {/* Header Skeleton */}
          <header className="relative z-10 flex shrink-0 items-center justify-between px-5 pt-3 pb-1">
            <div className="h-9 w-9 rounded-xl animate-pulse shadow-lg" style={{ background: T.cardAlt, border: `1px solid ${T.border}` }} />
            <div className="h-[28px] w-[74px] rounded-xl animate-pulse shadow-lg" style={{ background: T.cardAlt, border: `1px solid ${T.border}` }} />
          </header>
          <div className="px-5 mb-1">
            <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${T.border}, transparent)` }} />
          </div>
          {/* Main Content Skeleton */}
          <main className="relative z-10 flex-1 flex flex-col min-h-0 overflow-hidden px-4 pb-[92px] gap-3 mt-1">
            {/* Calorie Intake Card Skeleton */}
            <section
              className="relative shrink-0 overflow-hidden rounded-2xl p-4"
              style={{
                background: T.card,
                border: `1px solid ${T.border}`,
                borderTop: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.6)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)"
              }}
            >
              <div className="flex items-center justify-between mb-3 -mx-1">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-xl animate-pulse" style={{ background: T.cardAlt }} />
                  <div className="flex flex-col gap-1.5">
                    <div className="h-3.5 w-20 rounded-md animate-pulse" style={{ background: T.cardAlt }} />
                    <div className="h-2 w-12 rounded-sm animate-pulse" style={{ background: T.border }} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-[20px] w-[46px] rounded-xl animate-pulse" style={{ background: T.cardAlt }} />
                  <div className="h-[20px] w-[40px] rounded-xl animate-pulse" style={{ background: T.cardAlt }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div className="h-[100px] w-[100px] rounded-full animate-pulse" style={{ background: T.cardAlt }} />
                  <div className="h-[20px] w-[60px] rounded-full animate-pulse" style={{ background: T.cardAlt }} />
                </div>
                <div className="flex flex-1 flex-col justify-center gap-2.5 pl-6 pr-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-[18px] w-[18px] rounded-[6px] animate-pulse shrink-0" style={{ background: T.cardAlt }} />
                          <div className="h-2 w-10 rounded-sm animate-pulse" style={{ background: T.border }} />
                        </div>
                        <div className="flex items-baseline gap-0.5">
                          <div className="h-2.5 w-12 rounded-sm animate-pulse" style={{ background: T.cardAlt }} />
                        </div>
                      </div>
                      <div className="h-[4px] w-full rounded-full animate-pulse" style={{ background: T.cardAlt }} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
            {/* Daily Tasks / Goals Card Skeleton */}
            <section
              className="relative flex-1 flex flex-col min-h-0 rounded-2xl p-4 overflow-hidden"
              style={{
                background: T.card,
                border: `1px solid ${T.border}`,
                borderTop: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.6)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)"
              }}
            >
              <div className="flex items-center justify-between mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl animate-pulse" style={{ background: T.cardAlt }} />
                  <div className="h-8 w-[100px] rounded-lg animate-pulse" style={{ background: T.cardAlt }} />
                </div>
                <div className="h-8 w-[80px] rounded-xl animate-pulse" style={{ background: T.cardAlt }} />
              </div>
              <div className="flex-1 overflow-hidden space-y-2.5 mt-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-[52px] w-full rounded-[14px] animate-pulse shrink-0" style={{ background: T.cardAlt }} />
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  const toggleTask = (id) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, checked: !t.checked } : t)));
  };

  return (
    <div className="fixed inset-0 w-full overflow-hidden font-sans text-white selection:bg-emerald-500/30" style={{ background: T.bg }}>
      <div className="relative mx-auto flex h-full w-full max-w-[400px] flex-col overflow-hidden" style={{ background: T.bg }}>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <header className="relative z-10 flex shrink-0 items-center justify-between px-5 pt-3 pb-1">
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="grid place-items-center h-9 w-9 rounded-xl shadow-lg transition-transform active:scale-[0.97]"
            style={{ background: T.cardAlt, border: `1px solid ${T.border}` }}
          >
            <Menu size={18} strokeWidth={2} style={{ color: T.textPrimary }} />
          </button>

          <button
            type="button"
            onClick={() => router.push("/notes")}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl shadow-lg transition-transform active:scale-[0.97]"
            style={{ background: T.cardAlt, border: `1px solid ${T.border}` }}
          >
            <NotebookText size={14} strokeWidth={2} style={{ color: T.textPrimary }} />
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: T.textPrimary }}>Notes</span>
          </button>
        </header>

        {/* ── Divider ─────────────────────────────────────────────────────────── */}
        <div className="px-5 mb-1">
          <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${T.border}, transparent)` }} />
        </div>

        {/* ── Main Content ────────────────────────────────────────────────────── */}
        <main className="relative z-10 flex-1 flex flex-col min-h-0 overflow-hidden px-4 pb-[92px] gap-3 mt-1">

          {/* ── Calorie Intake Card ─────────────────────────────────────────── */}
          {/* ── Calorie Intake Card ─────────────────────────────────────────── */}
          <section
            className="relative shrink-0 overflow-hidden rounded-2xl p-4"
            style={{
              background: T.card,
              border: `1px solid ${T.border}`,
              borderTop: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 20px 40px -10px rgba(0,0,0,0.6)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)"
            }}
          >
            {/* Card Header */}
            <div className="flex items-center justify-between mb-3 -mx-1">
              <div className="flex items-center gap-2">
                {/* Flame icon container */}
                <div
                  className="grid place-items-center h-7 w-7 rounded-xl"
                  style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.22)" }}
                >
                  <Flame size={13} style={{ color: "#60a5fa" }} />
                </div>
                <div>
                  <h2 className="text-[13px] font-bold tracking-tight leading-tight" style={{ color: T.textPrimary }}>
                    Calorie Intake
                  </h2>
                  <p className="text-[7px] font-semibold tracking-[0.2em] uppercase" style={{ color: T.textFaint }}>
                    Daily Tracker
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMealsManagerOpen(true)}
                  className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[9px] font-bold shadow-md transition-transform active:scale-[0.97]"
                  style={{ background: T.textPrimary, color: "#000000" }}
                >
                  <Plus size={10} strokeWidth={2.5} />
                  MEALS
                </button>
                <div
                  className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5"
                  style={{ background: T.cardAlt, border: `1px solid ${T.border}` }}
                >
                  <Clock size={10} style={{ color: T.textMuted }} />
                  <span className="text-[9px] font-semibold tabular-nums" style={{ color: T.textPrimary }}>
                    {currentTime || "..."}
                  </span>
                </div>
              </div>
            </div>

            {/* Circular ring + macros */}
            <div className="relative flex items-center justify-between">
              {/* Left Column: Progress Ring & Status Pill */}
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="relative flex h-[100px] w-[100px] items-center justify-center">
                  {/* Subtle glass orb behind text */}
                  <div className="absolute inset-0 m-auto h-[60px] w-[60px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
                  
                  {/* Pulse behind ring if goal hit */}
                  {consumed.calories >= (calorieTarget || 1) && (
                    <div
                      className="absolute inset-0 rounded-full animate-pulse"
                      style={{
                        boxShadow: `0 0 20px ${T.accent}40, 0 0 35px ${T.accent}1A`,
                        transform: "scale(0.85)"
                      }}
                    />
                  )}

                  <svg className="relative h-full w-full -rotate-90 overflow-visible" viewBox="0 0 100 100">
                    {/* Glassy Track - pure frosted dark ring */}
                    <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />

                    {/* Progress arc */}
                    <circle
                      cx="50"
                      cy="50"
                      r="44"
                      fill="none"
                      stroke={T.accent}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 44}
                      strokeDashoffset={
                        2 * Math.PI * 44 * (1 - Math.min(consumed.calories / (calorieTarget || 1), 1))
                      }
                      style={{
                        transition: "stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)",
                        filter: consumed.calories > 0 ? `drop-shadow(0 0 6px ${T.accent}66)` : "none"
                      }}
                    />
                  </svg>

                  {/* Core Typography */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pt-0.5">
                    <span 
                      className="text-[24px] leading-none font-bold tracking-tight tabular-nums" 
                      style={{ color: T.textPrimary }}
                    >
                      {consumed.calories}
                    </span>
                    <span className="text-[9px] font-semibold tracking-wide tabular-nums mt-1" style={{ color: T.textMuted }}>
                      / {calorieTarget ?? "—"} <span className="text-[8px] uppercase tracking-widest ml-0.5" style={{ color: T.textFaint }}>kcal</span>
                    </span>
                  </div>
                </div>

                {/* Left/Over Pill */}
                <div
                  className="flex items-center gap-1 rounded-full px-3 py-1"
                  style={{ 
                    background: consumed.calories >= (calorieTarget || 1) 
                      ? `linear-gradient(135deg, ${T.accent}26 0%, ${T.accent}0D 100%)` 
                      : "rgba(255,255,255,0.03)",
                    border: `1px solid ${consumed.calories >= (calorieTarget || 1) ? `${T.accent}4D` : "rgba(255,255,255,0.05)"}`,
                    boxShadow: consumed.calories >= (calorieTarget || 1) 
                      ? `0 0 10px ${T.accent}26, inset 0 1px 0 rgba(255,255,255,0.1)` 
                      : "inset 0 1px 0 rgba(255,255,255,0.05)"
                  }}
                >
                  <Flame size={9} style={{ 
                    color: consumed.calories >= (calorieTarget || 1) ? T.accent : "#fbbf24",
                    filter: consumed.calories >= (calorieTarget || 1) ? `drop-shadow(0 0 3px ${T.accent})` : "none"
                  }} />
                  <span className="text-[8.5px] font-black uppercase tracking-wider" style={{ 
                    color: consumed.calories >= (calorieTarget || 1) ? T.accent : T.textMuted
                  }}>
                    {calorieTarget
                      ? (consumed.calories > calorieTarget
                        ? `${consumed.calories - calorieTarget} over`
                        : `${Math.max(0, calorieTarget - consumed.calories)} left`)
                      : "—"}
                  </span>
                </div>
              </div>

              {/* Right Column: Macro rows */}
              <div className="flex flex-1 flex-col justify-center gap-2.5 pl-6 pr-1">
                {[
                  { label: "Protein", icon: Dumbbell, current: consumed.protein, target: macros.protein, color: "#10b981" },
                  { label: "Fat", icon: Flame, current: consumed.fat, target: macros.fats, color: "#f43f5e" },
                  { label: "Carbs", icon: Leaf, current: consumed.carbs, target: macros.carbs, color: "#f59e0b" },
                  { label: "Calories", icon: Droplet, current: consumed.calories, target: calorieTarget, color: "#60a5fa", isCalorie: true },
                ].map((macro) => {
                  const Icon = macro.icon;
                  const pct = macro.target ? Math.min((macro.current / macro.target) * 100, 100) : 0;
                  return (
                    <div key={macro.label} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-[18px] w-[18px] rounded-[6px] flex items-center justify-center shadow-inner"
                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}
                          >
                            <Icon size={10} style={{ color: macro.color, filter: `drop-shadow(0 0 3px ${macro.color}80)` }} />
                          </div>
                          <span className="text-[10px] font-semibold tracking-[0.08em] uppercase" style={{ color: T.textMuted }}>
                            {macro.label}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-[11px] font-bold tabular-nums" style={{ color: T.textPrimary }}>
                            {macro.current}
                          </span>
                          <span className="text-[9px] font-medium" style={{ color: T.textFaint }}>
                            / {macro.target ? (macro.isCalorie ? macro.target : `${macro.target}g`) : "—"}
                          </span>
                        </div>
                      </div>
                      
                      {/* Premium Segmented Progress bar */}
                      <div
                        className="relative h-[4px] w-full rounded-full overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.03)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)" }}
                      >
                        <div
                          className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${macro.color}20 0%, ${macro.color} 85%, #ffffff 100%)`,
                            boxShadow: `0 0 8px ${macro.color}`,
                            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)"
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── Daily Tasks / Goals Card ────────────────────────────────────── */}
          <section
            className="relative flex-1 flex flex-col min-h-0 rounded-2xl p-4 overflow-hidden"
            style={{
              background: T.card,
              border: `1px solid ${T.border}`,
              borderTop: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 20px 40px -10px rgba(0,0,0,0.6)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)"
            }}
          >
            {/* Tasks header */}
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div
                  className="grid place-items-center h-8 w-8 rounded-xl"
                  style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}
                >
                  <ClipboardList size={15} style={{ color: "#3b82f6" }} />
                </div>
                <GoalDropdown
                  goals={goals}
                  activeGoalId={activeGoalId}
                  onChange={setActiveGoalId}
                  onAddGoal={() => setIsCreateGoalOpen(true)}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTasksManagerOpen(true)}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-[10px] font-bold shadow-md transition-transform active:scale-[0.97]"
                  style={{ background: T.textPrimary, color: "#000000" }}
                >
                  <Plus size={13} strokeWidth={2.5} /> Add Task
                </button>
              </div>
            </div>

            {/* Goal duration badge */}
            {(() => {
              const g = goals.find((x) => x.id === activeGoalId);
              if (!g) return null;
              const elapsed = Math.floor((Date.now() - new Date(g.startDate)) / 86_400_000);
              const remaining = Math.max(0, g.days - elapsed);
              return (
                <div className="mb-2 flex items-center gap-2 shrink-0">
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md"
                    style={{ background: "rgba(0,208,255,0.10)", border: "1px solid rgba(0,208,255,0.20)" }}
                  >
                    <span className="text-[9px] font-semibold" style={{ color: "#00d0ff" }}>
                      {g.days}d goal
                    </span>
                    <span className="text-[9px]" style={{ color: T.textFaint }}>·</span>
                    <span className="text-[9px]" style={{ color: T.textMuted }}>
                      {remaining}d remaining
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Task list */}
            <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto pr-1">
              {(() => {
                const activeGoal = goals.find((g) => g.id === activeGoalId);
                const displayTasks = activeGoal ? (activeGoal.tasks ?? []) : tasks;

                const toggleDisplayTask = (id) => {
                  if (activeGoal) {
                    setGoalTasks(activeGoal.id, (prev) =>
                      prev.map((t) => (t.id === id ? { ...t, checked: !t.checked } : t))
                    );
                  } else {
                    toggleTask(id);
                  }
                };

                if (displayTasks.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center flex-1 gap-3">
                      <div className="relative">
                        {/* Subtle glow behind empty-state icon */}
                        <div
                          className="absolute inset-0 blur-2xl rounded-full"
                          style={{ background: "rgba(0,208,255,0.08)" }}
                        />
                        <div
                          className="relative grid place-items-center h-16 w-16 rounded-2xl"
                          style={{ background: T.cardAlt, border: `1px solid ${T.border}` }}
                        >
                          <ClipboardList size={30} strokeWidth={1.2} style={{ color: T.textFaint }} />
                          <div className="absolute -right-2 -top-2">
                            <Sparkles size={13} style={{ color: "rgba(0,208,255,0.5)" }} />
                          </div>
                          <div className="absolute -left-2 -bottom-2">
                            <Sparkles size={9} style={{ color: "rgba(0,208,255,0.35)" }} />
                          </div>
                        </div>
                      </div>
                      <p className="text-[13px] font-semibold" style={{ color: T.textMuted }}>
                        No tasks yet.
                      </p>
                      <p className="text-[10px] -mt-1" style={{ color: T.textFaint }}>
                        Add one above.
                      </p>
                    </div>
                  );
                }

                return displayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => !activeGoal && handleEditTask(task)}
                    className="group relative flex min-h-[40px] items-center gap-3 rounded-xl px-3 py-2 transition-all"
                    style={{
                      background: T.cardAlt,
                      border: `1px solid ${T.border}`,
                      opacity: task.checked ? 0.55 : 1,
                      cursor: activeGoal ? "default" : "pointer",
                    }}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleDisplayTask(task.id); }}
                      className="shrink-0 grid place-items-center h-5 w-5"
                    >
                      {task.checked ? (
                        <div
                          className="grid place-items-center h-[20px] w-[20px] rounded-full"
                          style={{
                            border: `1.5px solid ${T.accent}`,
                            background: `${T.accent}33`,
                          }}
                        >
                          <Check size={11} strokeWidth={3} style={{ color: T.accent }} />
                        </div>
                      ) : (
                        <Circle size={20} strokeWidth={1.5} style={{ color: T.textFaint }} />
                      )}
                    </button>

                    {/* Icon */}
                    <div
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-lg"
                      style={{ background: "rgba(0,208,255,0.08)", border: `1px solid ${T.border}` }}
                    >
                      {(() => {
                        const Icon = resolveIcon(task.icon);
                        return <Icon size={13} strokeWidth={1.8} style={{ color: T.accent }} />;
                      })()}
                    </div>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-[12px] font-medium truncate"
                        style={{ color: task.checked ? T.textFaint : T.textPrimary }}
                      >
                        {task.title}
                      </h3>
                    </div>

                    {/* Value */}
                    <div className="shrink-0 text-[10px] font-medium" style={{ color: T.textMuted }}>
                      {task.value}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </section>
        </main>

        {/* ── Bottom Navigation ───────────────────────────────────────────────── */}
        <nav
          className="absolute bottom-0 left-0 right-0 z-20 px-3 pb-4 pt-2"
          style={{
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: `1px solid ${T.border}`,
          }}
        >
          <div className="flex items-center justify-between">
            {/* Home — active */}
            <button
              onClick={() => { }}
              className="flex flex-col items-center gap-0.5 flex-1 py-1"
            >
              <div className="relative">
                <Home size={20} strokeWidth={2} style={{ color: T.textPrimary }} />
                <div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                  style={{ background: T.textPrimary }}
                />
              </div>
              <span className="text-[9px] font-semibold" style={{ color: T.textPrimary }}>Home</span>
            </button>

            {/* Workout */}
            <button
              onClick={() => { }}
              className="flex flex-col items-center gap-0.5 flex-1 py-1 transition-opacity hover:opacity-100"
              style={{ opacity: 0.5 }}
            >
              <Dumbbell size={20} strokeWidth={1.8} style={{ color: T.textPrimary }} />
              <span className="text-[9px] font-medium" style={{ color: T.textPrimary }}>Workout</span>
            </button>

            {/* KAI — floating emerald circle spotlight */}
            <button
              onClick={() => setIsKaiOpen(true)}
              className="flex flex-col items-center gap-0 flex-1 -mt-7 active:scale-[0.97] transition-transform"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: T.textPrimary,
                  boxShadow: "0 0 20px rgba(250,250,250,0.15), 0 0 40px rgba(250,250,250,0.08)",
                }}
              >
                <Sparkles size={24} strokeWidth={2} style={{ color: "#000000" }} />
              </div>
              <span
                className="text-[9px] font-bold mt-0.5 tracking-widest uppercase"
                style={{ color: T.textMuted }}
              >
                KAI
              </span>
            </button>

            {/* Progress */}
            <button
              onClick={() => { }}
              className="flex flex-col items-center gap-0.5 flex-1 py-1 transition-opacity hover:opacity-100"
              style={{ opacity: 0.5 }}
            >
              <TrendingUp size={20} strokeWidth={1.8} style={{ color: T.textPrimary }} />
              <span className="text-[9px] font-medium" style={{ color: T.textPrimary }}>Progress</span>
            </button>

            {/* Profile */}
            <button
              onClick={() => { }}
              className="flex flex-col items-center gap-0.5 flex-1 py-1 transition-opacity hover:opacity-100"
              style={{ opacity: 0.5 }}
            >
              <User size={20} strokeWidth={1.8} style={{ color: T.textPrimary }} />
              <span className="text-[9px] font-medium" style={{ color: T.textPrimary }}>Profile</span>
            </button>
          </div>
        </nav>

        {/* ── Modals ──────────────────────────────────────────────────────────── */}
        <KaiAssistant
          isOpen={isKaiOpen}
          onClose={() => setIsKaiOpen(false)}
          consumed={consumed}
          calorieTarget={calorieTarget}
          macros={macros}
          onNutritionUpdate={handleNutritionUpdate}
        />

        <MealsManager
          isOpen={isMealsManagerOpen}
          onClose={() => setIsMealsManagerOpen(false)}
          meals={meals}
          setMeals={setMeals}
          saveMealsToDb={saveMealsToDb}
        />

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

        <CreateGoalModal
          isOpen={isCreateGoalOpen}
          onClose={() => setIsCreateGoalOpen(false)}
          onSave={handleGoalSave}
        />

        {/* Inline edit/add task overlay */}
        {(editingTask || addingTask) && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
            style={{ background: "rgba(13,17,23,0.92)" }}
          >
            <div
              className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
              style={{ background: T.card, border: `1px solid ${T.border}` }}
            >
              <h3
                className="font-bold text-lg mb-4 text-center"
                style={{ color: T.textPrimary }}
              >
                {addingTask ? "Add New Task" : "Edit Task"}
              </h3>
              <div className="flex flex-col gap-3 mb-6">
                <input
                  autoFocus
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{
                    background: T.cardAlt,
                    border: `1px solid ${T.border}`,
                    color: T.textPrimary,
                  }}
                  placeholder="Enter task name"
                />
                <input
                  type="text"
                  value={editForm.value}
                  onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{
                    background: T.cardAlt,
                    border: `1px solid ${T.border}`,
                    color: T.textPrimary,
                  }}
                  placeholder="e.g. 1 / 2 Liters"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setEditingTask(null); setAddingTask(false); }}
                  className="flex-1 py-3 rounded-xl font-bold text-sm transition-colors"
                  style={{ background: T.cardAlt, color: T.textMuted }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveTask}
                  className="flex-1 py-3 rounded-xl font-bold text-sm transition-transform active:scale-[0.97] shadow-md"
                  style={{ background: T.textPrimary, color: "#000000" }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        <OnboardingModal
          isOpen={showOnboarding}
          onComplete={() => {
            setShowOnboarding(false);
            fetch("/api/profile")
              .then((r) => r.json())
              .then((data) => {
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

        {/* ── Fullscreen Menu Overlay ────────────────────────────────────── */}
        {isMenuOpen && typeof document !== 'undefined' && createPortal(
          <div 
            className="fixed inset-0 z-[99999] flex flex-col p-6 animate-in fade-in zoom-in-95 duration-300 overflow-hidden"
            style={{
              background: "#111318",
              backgroundImage: "radial-gradient(circle at top right, rgba(255,255,255,0.05) 0%, transparent 40%)"
            }}
          >
            <div className="relative z-10 flex justify-end mb-2">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="grid place-items-center h-10 w-10 rounded-full bg-white/5 border border-white/10 active:scale-95 transition-all hover:bg-white/10"
                style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
              >
                <Plus size={24} strokeWidth={1.5} style={{ color: "#fff", transform: "rotate(45deg)" }} />
              </button>
            </div>

            {/* Friends List Parent Card - Sleek 20/10 UI */}
            <div className="relative z-10 w-full animate-in slide-in-from-bottom-3 duration-500 delay-75 fill-mode-both shrink-0">
              <div style={{
                borderRadius: "24px",
                background: "linear-gradient(180deg, rgba(30,41,59,0.5) 0%, rgba(2,6,23,0.9) 100%)",
                boxShadow: "0 32px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 0 0 1px rgba(255,255,255,0.06)",
                backdropFilter: "blur(48px)", WebkitBackdropFilter: "blur(48px)",
                padding: "16px 14px", display: "flex", flexDirection: "column", gap: "6px",
                position: "relative", overflow: "hidden"
              }}>
                {/* Subtle top edge glow */}
                <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: "1px", background: "linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)" }} />

                <div style={{ position: "relative", marginBottom: "4px" }}>
                  <div style={{ position: "absolute", left: "12px", top: "0", bottom: "0", display: "flex", alignItems: "center", pointerEvents: "none", color: "rgba(255,255,255,0.5)" }}>
                    <Search size={14} strokeWidth={2.5} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search friends..." 
                    style={{ 
                      width: "100%", height: "36px", paddingLeft: "34px", paddingRight: "14px",
                      background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px", color: "#ffffff", fontSize: "14px", outline: "none",
                      boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05)", transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                    }} 
                    className="focus:border-white/30 focus:bg-black/60 placeholder:text-white/40"
                  />
                </div>

                <div 
                  className="flex flex-col gap-[6px] overflow-y-auto" 
                  style={{ 
                    maxHeight: "220px",
                    msOverflowStyle: "none",
                    scrollbarWidth: "none"
                  }}
                >
                  {/* Friend Card 1 */}
                  <button className="w-full text-left press-scale group shrink-0" style={{ borderRadius: "14px", background: "rgba(255,255,255,0.02)", padding: "8px 10px", display: "flex", alignItems: "center", gap: "12px", position: "relative", overflow: "hidden", transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.06), transparent)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }} />
                    <div style={{ width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), inset 0 0 0 1px rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", position: "relative", zIndex: 1 }}>
                      <User size={16} strokeWidth={2.5} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "15px", letterSpacing: "0.01em", color: "#ffffff", lineHeight: 1.2, fontWeight: 600 }}>Alex Chen</div>
                    </div>
                    <div className="group-hover:bg-white/10 transition-colors" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em", color: "#ffffff", background: "rgba(255,255,255,0.06)", padding: "4px 10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)", position: "relative", zIndex: 1 }}>
                      View Profile
                    </div>
                  </button>

                  {/* Friend Card 2 */}
                  <button className="w-full text-left press-scale group shrink-0" style={{ borderRadius: "14px", background: "rgba(255,255,255,0.02)", padding: "8px 10px", display: "flex", alignItems: "center", gap: "12px", position: "relative", overflow: "hidden", transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.06), transparent)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }} />
                    <div style={{ width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), inset 0 0 0 1px rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", position: "relative", zIndex: 1 }}>
                      <User size={16} strokeWidth={2.5} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "15px", letterSpacing: "0.01em", color: "#ffffff", lineHeight: 1.2, fontWeight: 600 }}>Sarah Miller</div>
                    </div>
                    <div className="group-hover:bg-white/10 transition-colors" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em", color: "#ffffff", background: "rgba(255,255,255,0.06)", padding: "4px 10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)", position: "relative", zIndex: 1 }}>
                      View Profile
                    </div>
                  </button>
                  
                  {/* Friend Card 3 */}
                  <button className="w-full text-left press-scale group shrink-0" style={{ borderRadius: "14px", background: "rgba(255,255,255,0.02)", padding: "8px 10px", display: "flex", alignItems: "center", gap: "12px", position: "relative", overflow: "hidden", transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.06), transparent)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }} />
                    <div style={{ width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), inset 0 0 0 1px rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", position: "relative", zIndex: 1 }}>
                      <User size={16} strokeWidth={2.5} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "15px", letterSpacing: "0.01em", color: "#ffffff", lineHeight: 1.2, fontWeight: 600 }}>Mike Ross</div>
                    </div>
                    <div className="group-hover:bg-white/10 transition-colors" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em", color: "#ffffff", background: "rgba(255,255,255,0.06)", padding: "4px 10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)", position: "relative", zIndex: 1 }}>
                      View Profile
                    </div>
                  </button>

                  {/* Friend Card 4 */}
                  <button className="w-full text-left press-scale group shrink-0" style={{ borderRadius: "14px", background: "rgba(255,255,255,0.02)", padding: "8px 10px", display: "flex", alignItems: "center", gap: "12px", position: "relative", overflow: "hidden", transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.06), transparent)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }} />
                    <div style={{ width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), inset 0 0 0 1px rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", position: "relative", zIndex: 1 }}>
                      <User size={16} strokeWidth={2.5} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "15px", letterSpacing: "0.01em", color: "#ffffff", lineHeight: 1.2, fontWeight: 600 }}>Emma Stone</div>
                    </div>
                    <div className="group-hover:bg-white/10 transition-colors" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em", color: "#ffffff", background: "rgba(255,255,255,0.06)", padding: "4px 10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)", position: "relative", zIndex: 1 }}>
                      View Profile
                    </div>
                  </button>

                  {/* Friend Card 5 */}
                  <button className="w-full text-left press-scale group shrink-0" style={{ borderRadius: "14px", background: "rgba(255,255,255,0.02)", padding: "8px 10px", display: "flex", alignItems: "center", gap: "12px", position: "relative", overflow: "hidden", transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.06), transparent)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }} />
                    <div style={{ width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), inset 0 0 0 1px rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", position: "relative", zIndex: 1 }}>
                      <User size={16} strokeWidth={2.5} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "15px", letterSpacing: "0.01em", color: "#ffffff", lineHeight: 1.2, fontWeight: 600 }}>Liam Smith</div>
                    </div>
                    <div className="group-hover:bg-white/10 transition-colors" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em", color: "#ffffff", background: "rgba(255,255,255,0.06)", padding: "4px 10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)", position: "relative", zIndex: 1 }}>
                      View Profile
                    </div>
                  </button>

                  {/* Friend Card 6 */}
                  <button className="w-full text-left press-scale group shrink-0" style={{ borderRadius: "14px", background: "rgba(255,255,255,0.02)", padding: "8px 10px", display: "flex", alignItems: "center", gap: "12px", position: "relative", overflow: "hidden", transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.06), transparent)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }} />
                    <div style={{ width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), inset 0 0 0 1px rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", position: "relative", zIndex: 1 }}>
                      <User size={16} strokeWidth={2.5} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "15px", letterSpacing: "0.01em", color: "#ffffff", lineHeight: 1.2, fontWeight: 600 }}>Olivia Davis</div>
                    </div>
                    <div className="group-hover:bg-white/10 transition-colors" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em", color: "#ffffff", background: "rgba(255,255,255,0.06)", padding: "4px 10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)", position: "relative", zIndex: 1 }}>
                      View Profile
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Spacer to perfectly pin content to 100vh bottom */}
            <div className="flex-1 min-h-0"></div>

            {/* Premium Analytics Card inside Menu */}
            <div className="relative z-10 w-full animate-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both shrink-0">
              <NutritionAnalytics />
            </div>

            {/* Ultra-Premium Profile Pill Docked to Bottom */}
            <div className="relative z-10 w-full animate-in slide-in-from-bottom-6 duration-500 delay-200 fill-mode-both mt-4 shrink-0">
              <div style={{
                borderRadius: "32px",
                background: "radial-gradient(120% 100% at 50% 100%, rgba(30,41,59,0.5) 0%, rgba(2,6,23,0.95) 100%)",
                boxShadow: "0 -12px 48px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 0 0 1px rgba(255,255,255,0.05)",
                backdropFilter: "blur(48px)", WebkitBackdropFilter: "blur(48px)",
                padding: "10px 12px", display: "flex", alignItems: "center", gap: "14px",
                position: "relative", overflow: "hidden"
              }}>
                <div style={{ position: "absolute", bottom: 0, left: "20px", width: "80px", height: "80px", background: `radial-gradient(circle, #34d39920 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0 }} />
                
                <div style={{
                  width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.02) 100%)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 0 0 1px rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#34d399", position: "relative", zIndex: 1
                }}>
                  <User size={22} strokeWidth={2} />
                </div>
                
                <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "16px", letterSpacing: "0.01em", color: "#ffffff", lineHeight: 1.2, marginBottom: "2px", textShadow: "0 1px 2px rgba(0,0,0,0.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {session?.user?.name || "Premium Member"}
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "0.03em" }}>
                    {session?.user?.email || "Welcome to Twin"}
                  </div>
                </div>
                
                <button
                  onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => router.push("/login") } })}
                  className="press-scale"
                  style={{
                    all: "unset", width: "44px", height: "44px", borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.05) 100%)", 
                    border: "1px solid rgba(239,68,68,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#f87171", cursor: "pointer", flexShrink: 0, touchAction: "manipulation",
                    position: "relative", zIndex: 1, 
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 16px rgba(239,68,68,0.2)"
                  }}
                >
                  <LogOut size={20} strokeWidth={2.5} style={{ transform: "translateX(1px)" }} />
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}