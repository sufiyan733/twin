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
  Clock,
  NotebookText,
  Star,
  Home,
  TrendingUp,
  User,
  Sparkles,
  LayoutList,
  ChevronDown,
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
  bg: "#0d1117",          // deep navy-black page background
  card: "#161b26",        // card surface
  cardAlt: "#1c2333",     // slightly lighter card variant
  border: "rgba(255,255,255,0.07)",
  accent: "#8b5cf6",      // purple accent (unchanged)
  textPrimary: "#f0f4ff",
  textMuted: "rgba(240,244,255,0.45)",
  textFaint: "rgba(240,244,255,0.22)",
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
      <div className="h-[100dvh] w-full flex items-center justify-center" style={{ background: T.bg }}>
        <Loader2 className="animate-spin" style={{ color: T.accent }} size={32} />
      </div>
    );
  }

  const toggleTask = (id) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, checked: !t.checked } : t)));
  };

  return (
    <div className="h-[100dvh] w-full overflow-hidden font-sans text-white selection:bg-violet-600/30" style={{ background: T.bg }}>
      <div className="relative mx-auto flex h-[100dvh] w-full max-w-[400px] flex-col overflow-hidden" style={{ background: T.bg }}>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <header className="relative z-10 flex shrink-0 items-center justify-between px-5 pt-5 pb-2">
          <button type="button" className="transition-colors" style={{ color: "rgba(240,244,255,0.5)" }}>
            <Menu size={22} strokeWidth={1.5} />
          </button>

          <button
            type="button"
            onClick={() => router.push("/notes")}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl shadow-lg transition-all hover:opacity-90"
            style={{ background: T.cardAlt, border: `1px solid ${T.border}` }}
          >
            <NotebookText size={14} strokeWidth={2} style={{ color: T.textPrimary }} />
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: T.textPrimary }}>Notes</span>
          </button>
        </header>

        {/* ── Main Content ────────────────────────────────────────────────────── */}
        <main className="relative z-10 flex-1 flex flex-col overflow-hidden px-4 pb-[92px] gap-3">

          {/* ── Calorie Intake Card ─────────────────────────────────────────── */}
          <section
            className="relative shrink-0 overflow-hidden rounded-2xl p-5 shadow-xl"
            style={{ background: T.card, border: `1px solid ${T.border}` }}
          >
            {/* Card Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {/* Flame icon container — matches goal image: orange tint */}
                <div
                  className="grid place-items-center h-9 w-9 rounded-xl"
                  style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.22)" }}
                >
                  <Flame size={18} style={{ color: "#f87171" }} />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold tracking-tight" style={{ color: T.textPrimary }}>
                    Calorie Intake
                  </h2>
                  <p className="text-[8px] font-semibold tracking-[0.2em] uppercase" style={{ color: T.textFaint }}>
                    Daily Tracker
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMealsManagerOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-bold shadow-md transition-all hover:opacity-90"
                  style={{ background: T.textPrimary, color: "#0d1117" }}
                >
                  <Plus size={12} strokeWidth={2.5} />
                  MEALS
                </button>
                <div
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
                  style={{ background: T.cardAlt, border: `1px solid ${T.border}` }}
                >
                  <Clock size={12} style={{ color: T.textMuted }} />
                  <span className="text-[10px] font-semibold tabular-nums" style={{ color: T.textPrimary }}>
                    {currentTime || "..."}
                  </span>
                </div>
              </div>
            </div>

            {/* Circular ring + macros */}
            <div className="flex items-center justify-between">
              {/* Progress Ring */}
              <div className="relative flex h-[130px] w-[130px] shrink-0 items-center justify-center">
                <svg className="relative h-full w-full -rotate-90" viewBox="0 0 100 100">
                  {/* Track */}
                  <circle cx="50" cy="50" r="44" fill="none" stroke={T.cardAlt} strokeWidth="5.5" />
                  {/* Progress arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke={T.accent}
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 44}
                    strokeDashoffset={
                      2 * Math.PI * 44 * (1 - Math.min(consumed.calories / (calorieTarget || 1), 1))
                    }
                    style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)" }}
                  />
                  {consumed.calories > 0 && (
                    <circle cx="92" cy="50" r="3" fill={T.textPrimary} />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold tracking-tight" style={{ color: T.textPrimary }}>
                    {consumed.calories}
                  </span>
                  <span className="text-[9px] font-medium" style={{ color: T.textMuted }}>
                    / {calorieTarget ?? "—"} KCAL
                  </span>
                  <div
                    className="mt-1.5 flex items-center gap-1.5 rounded-md px-2.5 py-0.5"
                    style={{ background: "rgba(0,0,0,0.35)", border: `1px solid ${T.border}` }}
                  >
                    <Flame size={9} style={{ color: "#f59e0b" }} />
                    <span className="text-[9px] font-medium" style={{ color: T.textMuted }}>
                      {calorieTarget ? Math.max(0, calorieTarget - consumed.calories) : "—"} left
                    </span>
                  </div>
                </div>
              </div>

              {/* Macro rows — goal image shows icon in coloured pill */}
              <div className="flex flex-1 flex-col justify-center gap-3 pl-4">
                {[
                  { label: "Protein", icon: Dumbbell, current: consumed.protein, target: macros.protein, color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
                  { label: "Fat", icon: Flame, current: consumed.fat, target: macros.fats, color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
                  { label: "Carbs", icon: Leaf, current: consumed.carbs, target: macros.carbs, color: "#34d399", bg: "rgba(52,211,153,0.12)" },
                  { label: "Calories", icon: Droplet, current: consumed.calories, target: calorieTarget, color: "#38bdf8", bg: "rgba(56,189,248,0.12)", isCalorie: true },
                ].map((macro) => {
                  const Icon = macro.icon;
                  const pct = macro.target ? Math.min((macro.current / macro.target) * 100, 100) : 0;
                  return (
                    <div key={macro.label} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {/* Coloured icon pill — key visual from goal image */}
                          <div
                            className="h-5 w-5 rounded-lg flex items-center justify-center"
                            style={{ background: macro.bg }}
                          >
                            <Icon size={10} style={{ color: macro.color }} />
                          </div>
                          <span className="text-[10px] font-medium" style={{ color: T.textMuted }}>
                            {macro.label}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold tabular-nums" style={{ color: T.textPrimary }}>
                          {macro.current}
                          <span className="text-[8px] ml-0.5" style={{ color: T.textFaint }}>
                            / {macro.target ? (macro.isCalorie ? macro.target : `${macro.target}g`) : "—"}
                          </span>
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div
                        className="h-[3px] w-full rounded-full overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background: macro.color,
                            boxShadow: `0 0 6px ${macro.color}55`,
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
            className="relative flex-1 flex flex-col rounded-2xl p-4 shadow-xl overflow-hidden"
            style={{ background: T.card, border: `1px solid ${T.border}` }}
          >
            {/* Tasks header */}
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div
                  className="grid place-items-center h-8 w-8 rounded-xl"
                  style={{ background: "rgba(139,92,246,0.10)", border: "1px solid rgba(139,92,246,0.18)" }}
                >
                  <ClipboardList size={15} style={{ color: T.accent }} />
                </div>
                <GoalDropdown
                  goals={goals}
                  activeGoalId={activeGoalId}
                  onChange={setActiveGoalId}
                  onAddGoal={() => setIsCreateGoalOpen(true)}
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Layout list icon button */}
                <button
                  onClick={() => setIsTasksManagerOpen(true)}
                  className="grid place-items-center h-8 w-8 rounded-xl transition-all hover:opacity-100"
                  style={{
                    background: T.cardAlt,
                    border: `1px solid ${T.border}`,
                    color: T.textMuted,
                  }}
                >
                  <LayoutList size={14} strokeWidth={1.8} />
                </button>

                {/* + button (goal image shows a standalone +) */}
                {!activeGoalId && (
                  <button
                    onClick={handleAddTask}
                    className="grid place-items-center h-8 w-8 rounded-xl transition-all hover:opacity-80"
                    style={{ background: T.cardAlt, border: `1px solid ${T.border}`, color: T.textPrimary }}
                  >
                    <Plus size={16} strokeWidth={2} />
                  </button>
                )}

                {!activeGoalId && (
                  <button
                    onClick={handleAddTask}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-[10px] font-bold shadow-md transition-all hover:opacity-90"
                    style={{ background: T.textPrimary, color: "#0d1117" }}
                  >
                    <Plus size={13} strokeWidth={2.5} /> Add Task
                  </button>
                )}
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
                    style={{ background: "rgba(139,92,246,0.10)", border: "1px solid rgba(139,92,246,0.18)" }}
                  >
                    <span className="text-[9px] font-semibold" style={{ color: "#c4b5fd" }}>
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
                          style={{ background: "rgba(139,92,246,0.08)" }}
                        />
                        <div
                          className="relative grid place-items-center h-16 w-16 rounded-2xl"
                          style={{ background: T.cardAlt, border: `1px solid ${T.border}` }}
                        >
                          <ClipboardList size={30} strokeWidth={1.2} style={{ color: T.textFaint }} />
                          <div className="absolute -right-2 -top-2">
                            <Sparkles size={13} style={{ color: "rgba(139,92,246,0.5)" }} />
                          </div>
                          <div className="absolute -left-2 -bottom-2">
                            <Sparkles size={9} style={{ color: "rgba(139,92,246,0.35)" }} />
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
                      style={{ background: "rgba(139,92,246,0.08)", border: `1px solid ${T.border}` }}
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
            background: T.card,
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

            {/* KAI — floating white circle */}
            <button
              onClick={() => setIsKaiOpen(true)}
              className="flex flex-col items-center gap-0 flex-1 -mt-7"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                style={{
                  background: T.textPrimary,
                  boxShadow: "0 4px 24px rgba(240,244,255,0.20)",
                }}
              >
                <Sparkles size={24} strokeWidth={2} style={{ color: "#0d1117" }} />
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
                  className="flex-1 py-3 rounded-xl font-bold text-sm transition-all shadow-md"
                  style={{ background: T.textPrimary, color: "#0d1117" }}
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
      </div>
    </div>
  );
}