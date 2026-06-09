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

const RESET_CHECK_INTERVAL_MS = 60 * 1000;
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;

function parseResetTimeParts(value) {
  const [rawHours, rawMinutes] = String(value || "00:00").split(":").map(Number);
  const hours = Number.isInteger(rawHours) && rawHours >= 0 && rawHours < HOURS_PER_DAY ? rawHours : 0;
  const minutes = Number.isInteger(rawMinutes) && rawMinutes >= 0 && rawMinutes < MINUTES_PER_HOUR ? rawMinutes : 0;
  return { hours, minutes };
}

function getResetBoundary(now, resetTime) {
  const { hours, minutes } = parseResetTimeParts(resetTime);
  const boundary = new Date(now);
  boundary.setHours(hours, minutes, 0, 0);
  return boundary;
}

function getMostRecentResetBoundary(now, resetTime) {
  const boundary = getResetBoundary(now, resetTime);
  if (now < boundary) boundary.setDate(boundary.getDate() - 1);
  return boundary;
}

function getDueResetBoundary(now, resetTime, lastResetAt) {
  if (!lastResetAt) return null;
  const boundary = getResetBoundary(now, resetTime);
  if (now < boundary) return null;

  const lastReset = new Date(lastResetAt);
  if (Number.isNaN(lastReset.getTime())) return null;
  return lastReset < boundary ? boundary : null;
}

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getArchiveDate(resetBoundary) {
  return formatLocalDate(new Date(resetBoundary.getTime() - 1));
}

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
  const [friends, setFriends] = useState([]);
  const [friendSearchQuery, setFriendSearchQuery] = useState("");
  const [viewingProfile, setViewingProfile] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [calorieTarget, setCalorieTarget] = useState(null);
  const profileFetchedRef = useRef(false);

  const [meals, setMeals] = useState([]);
  const [isMealsManagerOpen, setIsMealsManagerOpen] = useState(false);
  const [mealsSynced, setMealsSynced] = useState(false);
  const [lastMealsResetAt, setLastMealsResetAt] = useState(null);
  const latestMealsRef = useRef([]);
  const resetInFlightRef = useRef(false);
  const baselineInFlightRef = useRef(false);

  const consumed = {
    calories: meals.reduce((sum, m) => sum + (m.calories || 0), 0),
    protein: meals.reduce((sum, m) => sum + (m.protein || 0), 0),
    fat: meals.reduce((sum, m) => sum + (m.fat || 0), 0),
    carbs: meals.reduce((sum, m) => sum + (m.carbs || 0), 0),
  };

  useEffect(() => {
    latestMealsRef.current = meals;
  }, [meals]);

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
    const baseline = getMostRecentResetBoundary(new Date(), newTime);
    const baselineIso = baseline.toISOString();

    setResetTime(newTime);
    setLastResetAt(baseline);
    setLastMealsResetAt(baseline);

    if (!session) return;
    fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resetTime: newTime, lastResetAt: baselineIso }),
    }).catch(console.error);
    fetch("/api/meals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lastResetAt: baselineIso }),
    }).catch(console.error);
  };

  // ─── Establish reset baseline for legacy/new users ──────────────────────────
  useEffect(() => {
    if (!session || !tasksSynced || !mealsSynced) return;
    if (lastResetAt && lastMealsResetAt) return;
    if (baselineInFlightRef.current) return;

    baselineInFlightRef.current = true;
    const baseline = getMostRecentResetBoundary(new Date(), resetTime);
    const baselineIso = baseline.toISOString();

    queueMicrotask(() => {
      if (!lastResetAt) setLastResetAt(baseline);
      if (!lastMealsResetAt) setLastMealsResetAt(baseline);
    });

    Promise.all([
      !lastResetAt
        ? fetch("/api/tasks", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lastResetAt: baselineIso }),
          })
        : Promise.resolve(),
      !lastMealsResetAt
        ? fetch("/api/meals", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lastResetAt: baselineIso }),
          })
        : Promise.resolve(),
    ])
      .catch(console.error)
      .finally(() => {
        baselineInFlightRef.current = false;
      });
  }, [session, tasksSynced, mealsSynced, resetTime, lastResetAt, lastMealsResetAt]);

  // ─── Daily reset check ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!session || !tasksSynced || !mealsSynced || !lastResetAt || !lastMealsResetAt) return;

    const checkReset = async () => {
      if (resetInFlightRef.current) return;
      const now = new Date();
      const tasksBoundary = getDueResetBoundary(now, resetTime, lastResetAt);
      const mealsBoundary = getDueResetBoundary(now, resetTime, lastMealsResetAt);
      if (!tasksBoundary && !mealsBoundary) return;

      resetInFlightRef.current = true;
      const resetAt = new Date();
      const resetAtIso = resetAt.toISOString();
      const resetBoundary = mealsBoundary || tasksBoundary;

      try {
        const response = await fetch("/api/daily-reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            meals: latestMealsRef.current,
            date: getArchiveDate(resetBoundary),
            resetAt: resetAtIso,
            resetTasks: Boolean(tasksBoundary),
            resetMeals: Boolean(mealsBoundary),
          }),
        });

        if (!response.ok) throw new Error(`Daily reset failed with status ${response.status}`);

        if (tasksBoundary) {
          setTasks([]);
          setLastResetAt(resetAt);
        }
        if (mealsBoundary) {
          setMeals([]);
          setLastMealsResetAt(resetAt);
        }
      } catch (err) {
        console.error(err);
      } finally {
        resetInFlightRef.current = false;
      }
    };

    checkReset();
    const interval = setInterval(checkReset, RESET_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [session, tasksSynced, mealsSynced, resetTime, lastResetAt, lastMealsResetAt]);

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
    if (isMenuOpen && friends.length === 0) {
      fetch('/api/friends')
        .then(r => r.json())
        .then(d => {
          if (d.friends) setFriends(d.friends);
        })
        .catch(console.error);
    }
  }, [isMenuOpen, friends.length]);

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
            className="fixed inset-0 z-[99999] flex justify-center animate-in fade-in zoom-in-95 duration-300"
            style={{
              background: "#111318",
              backgroundImage: "radial-gradient(circle at top right, rgba(255,255,255,0.05) 0%, transparent 40%)"
            }}
          >
            <div
              className="w-full max-w-[400px] h-[100dvh] flex flex-col px-6 pt-6 pb-6 overflow-hidden"
              style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
            >
              <div className="relative z-10 flex justify-end shrink-0">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="grid place-items-center h-10 w-10 rounded-full bg-white/5 border border-white/10 active:scale-95 transition-all hover:bg-white/10"
                  style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
                >
                  <Plus size={24} strokeWidth={1.5} style={{ color: "#fff", transform: "rotate(45deg)" }} />
                </button>
              </div>

              <div className="flex flex-col flex-1 justify-between mt-6">
                {/* Friends List Parent Card - Sleek 20/10 UI */}
                <div className="relative z-10 w-full shrink-0 flex flex-col animate-in slide-in-from-bottom-3 duration-500 delay-75 fill-mode-both">
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
                        value={friendSearchQuery}
                        onChange={(e) => setFriendSearchQuery(e.target.value)}
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
                      className="flex flex-col gap-[6px] relative z-10 overflow-y-auto"
                      style={{ height: "210px" }}
                    >
                      {friends.length === 0 ? (
                        <div className="text-center py-4 text-white/50 text-[13px]">Loading friends...</div>
                      ) : (
                        friends.filter(f => f.name.toLowerCase().includes(friendSearchQuery.toLowerCase())).map((friend) => (
                          <button key={friend.id} onClick={() => setViewingProfile(friend)} className="w-full text-left press-scale group shrink-0" style={{ borderRadius: "14px", background: "rgba(255,255,255,0.02)", padding: "8px 10px", display: "flex", alignItems: "center", gap: "12px", position: "relative", overflow: "hidden", transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}>
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.06), transparent)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }} />
                            <div style={{ width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), inset 0 0 0 1px rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", position: "relative", zIndex: 1, overflow: "hidden" }}>
                              {friend.image ? <img src={friend.image} alt={friend.name} className="w-full h-full object-cover" /> : <User size={16} strokeWidth={2.5} />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
                              <div style={{ fontFamily: "var(--font-display)", fontSize: "15px", letterSpacing: "0.01em", color: "#ffffff", lineHeight: 1.2, fontWeight: 600 }}>{friend.name}</div>
                            </div>
                            <div className="group-hover:bg-white/10 transition-colors" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em", color: "#ffffff", background: "rgba(255,255,255,0.06)", padding: "4px 10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)", position: "relative", zIndex: 1 }}>
                              View Profile
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Premium Analytics Card inside Menu */}
                <div className="relative z-10 w-full animate-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both shrink-0">
                  <NutritionAnalytics />
                </div>

                {/* Ultra-Premium Profile Pill Docked to Bottom */}
                <div className="relative w-full shrink-0 group">
                  {/* Subtle ambient shadow behind the card */}
                  <div className="absolute inset-0 rounded-[28px] bg-black/40 blur-xl translate-y-2 opacity-50 pointer-events-none" />

                  <div
                    className="relative flex items-center justify-between p-3.5"
                    style={{
                      borderRadius: "24px",
                      background: "rgba(15, 23, 42, 0.45)",
                      backdropFilter: "blur(40px)",
                      WebkitBackdropFilter: "blur(40px)",
                      border: "1px solid rgba(148,163,184,0.08)",
                      borderTop: "1px solid rgba(255,255,255,0.08)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px -10px rgba(0,0,0,0.5)"
                    }}
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Premium Squircle Avatar */}
                      <div className="relative">
                        <div
                          className="grid place-items-center"
                          style={{
                            width: "44px", height: "44px",
                            borderRadius: "14px",
                            background: "linear-gradient(180deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.95) 100%)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderTop: "1px solid rgba(255,255,255,0.12)",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.3)"
                          }}
                        >
                          <User size={20} strokeWidth={2} style={{ color: "#f8fafc" }} />
                        </div>
                        {/* Active Status Indicator */}
                        <div
                          className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full"
                          style={{
                            background: "#10b981",
                            border: "2.5px solid #0f172a",
                            boxShadow: "0 0 8px rgba(16,185,129,0.5)"
                          }}
                        />
                      </div>

                      {/* Clean Hierarchy Text */}
                      <div className="flex flex-col justify-center">
                        <span
                          className="text-[15px] font-semibold tracking-tight leading-tight"
                          style={{ color: "#f8fafc" }}
                        >
                          {session?.user?.name || "Premium Member"}
                        </span>
                        <span
                          className="text-[12px] font-medium mt-0.5"
                          style={{ color: "#94a3b8" }}
                        >
                          {session?.user?.email || "Welcome to Twin"}
                        </span>
                      </div>
                    </div>

                    {/* Refined Minimalist Action Button */}
                    <button
                      onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => router.push("/login") } })}
                      className="grid place-items-center w-11 h-11 rounded-[12px] transition-all active:scale-[0.95]"
                      style={{
                        background: "transparent",
                      }}
                    >
                      <div
                        className="absolute inset-0 rounded-[12px] opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: "rgba(225,29,72,0.1)" }}
                      />
                      <LogOut size={18} strokeWidth={2} className="relative z-10 transition-colors group-hover:text-rose-400" style={{ color: "#64748b" }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Viewing Profile Modal overlay */}
        {viewingProfile && typeof document !== "undefined" && createPortal(
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-xl animate-in fade-in duration-300"
              style={{ filter: "saturate(150%)" }}
              onClick={() => setViewingProfile(null)}
            />
            <div className="relative w-full max-w-[360px] animate-in zoom-in-95 duration-200 fill-mode-both" style={{
              borderRadius: "32px",
              background: "rgba(10, 15, 30, 0.55)",
              backdropFilter: "blur(48px)",
              WebkitBackdropFilter: "blur(48px)",
              border: "1px solid rgba(148,163,184,0.08)",
              borderTop: "1px solid rgba(255,255,255,0.15)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 0 1px rgba(255,255,255,0.02), 0 0 0 1px rgba(0,0,0,1), 0 32px 64px -12px rgba(0,0,0,0.9), 0 0 80px rgba(110,231,183,0.08)",
              padding: "24px", display: "flex", flexDirection: "column", gap: "24px"
            }}>
              {/* Subtle ambient shadow behind the card */}
              <div className="absolute inset-0 rounded-[32px] bg-[#020617] blur-2xl translate-y-4 opacity-50 pointer-events-none" />
              {/* Internal Core Light Bloom */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 60%)", filter: "blur(40px)" }} />
              {/* Physical Noise Texture */}
              <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.02] mix-blend-overlay rounded-[32px]" style={{ backgroundImage: "url('data:image/svg+xml;utf8,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }} />

              {/* Header: Avatar + Name + Close */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="relative grid place-items-center shrink-0 overflow-hidden"
                    style={{
                      width: "48px", height: "48px",
                      borderRadius: "16px",
                      background: "radial-gradient(120% 120% at 50% 0%, rgba(30,41,59,0.9) 0%, rgba(2,6,23,1) 100%)",
                      border: "1px solid rgba(255,255,255,0.04)",
                      borderTop: "1px solid rgba(255,255,255,0.12)",
                      boxShadow: "inset 0 1px 1px rgba(255,255,255,0.15), 0 8px 16px rgba(0,0,0,0.4)"
                    }}
                  >
                    <div className="absolute inset-0 rounded-[16px] pointer-events-none" style={{ border: "1px solid rgba(0,0,0,0.5)", mixBlendMode: "overlay" }} />
                    <div className="absolute inset-0 rounded-[16px] pointer-events-none" style={{ border: "1px solid rgba(56,189,248,0.2)", boxShadow: "0 0 12px rgba(56,189,248,0.15)" }} />
                    <User size={22} strokeWidth={2} style={{ color: "#f8fafc", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))" }} />
                    <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#020617] shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h2 className="text-[18px] font-bold tracking-tight leading-tight" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #cbd5e1 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>{viewingProfile.name}</h2>
                  </div>
                </div>
                <button
                  onClick={() => setViewingProfile(null)}
                  className="relative grid place-items-center w-10 h-10 rounded-full transition-transform active:scale-[0.85] overflow-hidden"
                  style={{
                    background: "linear-gradient(180deg, rgba(15,23,42,0.9) 0%, rgba(2,6,23,1) 100%)",
                    border: "1px solid rgba(255,255,255,0.02)",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    boxShadow: "inset 0 4px 6px rgba(0,0,0,0.8), inset 0 1px 2px rgba(0,0,0,0.9), 0 1px 1px rgba(255,255,255,0.1)"
                  }}
                >
                  <Plus size={20} strokeWidth={2.5} className="rotate-45 relative z-10" style={{ color: "#64748b", filter: "drop-shadow(0 1px 1px rgba(255,255,255,0.15))" }} />
                </button>
              </div>

              {/* The Ultimate 100/10 Calorie Card with Machined Double-Bezel */}
              <div className="relative z-10 overflow-hidden" style={{
                background: "linear-gradient(180deg, rgba(28,33,45,0.7) 0%, rgba(10,14,20,0.95) 100%)",
                borderRadius: "28px", padding: "24px",
                border: "1px solid rgba(148,163,184,0.12)",
                borderTop: "1px solid rgba(255,255,255,0.2)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.03), 0 24px 48px -12px rgba(0,0,0,0.8)"
              }}>
                {/* Inner Bezel Ring */}
                <div className="absolute inset-0 rounded-[28px] pointer-events-none" style={{ border: "1px solid rgba(0,0,0,0.6)", margin: "1px" }} />
                <div className="absolute inset-0 rounded-[28px] pointer-events-none" style={{ border: "1px solid rgba(255,255,255,0.04)", margin: "2px" }} />

                {/* Diagonal Glass Reflection */}
                <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.02) 100%)" }} />
                {/* Top ambient bleed */}
                <div className="absolute top-0 left-0 right-0 h-px z-0" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }} />

                <div className="flex items-center gap-3.5 mb-8 relative z-10">
                  <div className="grid place-items-center h-10 w-10 rounded-[12px] shrink-0 relative overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(56,189,248,0.25) 0%, rgba(56,189,248,0.05) 100%)", border: "1px solid rgba(56,189,248,0.3)", borderTop: "1px solid rgba(56,189,248,0.6)", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.3), 0 4px 12px rgba(56,189,248,0.2)" }}>
                    {/* Inner flame core glow */}
                    <div className="absolute inset-0 m-auto w-6 h-6 rounded-full animate-[pulse_3s_ease-in-out_infinite]" style={{ background: "radial-gradient(circle, rgba(125,211,252,0.4) 0%, transparent 70%)", filter: "blur(4px)" }} />
                    <Flame size={20} strokeWidth={2.5} className="relative z-10" style={{ color: "#bae6fd", filter: "drop-shadow(0 0 6px rgba(56,189,248,0.9)) drop-shadow(0 2px 2px rgba(0,0,0,0.5))" }} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="text-[18px] font-bold tracking-tight leading-none" style={{ background: "linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>Today's Intake</h3>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="w-[4px] h-[4px] rounded-full bg-emerald-400" style={{ boxShadow: "0 0 8px rgba(52,211,153,1)" }} />
                      <div className="text-[11px] font-bold tracking-widest uppercase leading-none" style={{ color: "#64748b", letterSpacing: "0.15em" }}>Daily Tracker</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 relative z-10">
                  {/* Ring Column */}
                  <div className="flex flex-col items-center justify-center gap-3 shrink-0">
                    {/* Massive 130px Ring - True Hero Metric */}
                    <div className="relative flex h-[130px] w-[130px] items-center justify-center">
                    {/* Radar Scan Holographic Core */}
                    <div className="absolute inset-0 m-auto h-[92px] w-[92px] rounded-full" style={{ background: "conic-gradient(from 145deg at 50% 50%, rgba(16,185,129,0) 0deg, rgba(16,185,129,0.02) 280deg, rgba(16,185,129,0.2) 360deg)", filter: "blur(2px)", border: "1px solid rgba(16,185,129,0.15)" }} />
                    <div className="absolute inset-0 m-auto h-[100px] w-[100px] rounded-full" style={{ background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 60%)" }} />
                    
                    <svg className="absolute overflow-visible pointer-events-none" style={{ width: "160px", height: "160px", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(-90deg)" }} viewBox="0 0 160 160">
                      {/* Background Track */}
                      <circle cx="80" cy="80" r="58" fill="none" stroke="rgba(15,23,42,0.95)" strokeWidth="12" />
                      <circle cx="80" cy="80" r="58" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="12" style={{ boxShadow: "inset 0 4px 8px rgba(0,0,0,1)" }} />
                      
                      {/* Ultra-fine precision lens rings */}
                      <circle cx="80" cy="80" r="65" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                      <circle cx="80" cy="80" r="51" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

                      {/* Precision Inner Gauge */}
                      <circle cx="80" cy="80" r="46" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" strokeDasharray="1 4" />
                      {/* Microscopic Secondary Ticks */}
                      <circle cx="80" cy="80" r="43" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="2" strokeDasharray="0.5 2" />

                      {/* Foreground Track */}
                      <defs>
                        <linearGradient id="emerald-gradient-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6ee7b7" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                        <filter id="glow-drop" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#10b981" floodOpacity="0.8" />
                          <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#10b981" floodOpacity="0.4" />
                        </filter>
                      </defs>
                      <circle cx="80" cy="80" r="58" fill="none" stroke="url(#emerald-gradient-ring)" strokeWidth="12" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 58}
                        strokeDashoffset={2 * Math.PI * 58 * (1 - Math.min(viewingProfile.consumed.calories / viewingProfile.calorieTarget, 1))}
                        filter="url(#glow-drop)"
                      />
                      
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-1 z-10">
                      <span className="text-[38px] leading-none font-black tabular-nums tracking-tighter" style={{ color: "#ffffff", textShadow: "0 4px 12px rgba(0,0,0,0.9), 0 0 20px rgba(255,255,255,0.2)" }}>
                        {viewingProfile.consumed.calories}
                      </span>
                      <span className="text-[11px] font-bold tracking-[0.15em] uppercase mt-1.5" style={{ color: "#94a3b8" }}>
                        / {viewingProfile.calorieTarget}
                      </span>
                    </div>
                  </div>
                  {/* Calorie Label Below Circle */}
                  <div className="mt-2 px-3.5 py-1.5 rounded-full bg-[rgba(2,6,23,0.6)] border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_8px_rgba(0,0,0,0.5)]">
                    <div className="text-[9px] font-black tracking-[0.25em] uppercase" style={{ background: "linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }}>Calories</div>
                  </div>
                </div>

                {/* Horizontal Bars with Glass Housing */}
                  <div className="flex flex-1 flex-col justify-center gap-5 px-4 py-5 rounded-[24px] relative">
                    {/* Glass Housing Background with Carbon/Dot Matrix Texture */}
                    <div className="absolute inset-0 pointer-events-none rounded-[24px] overflow-hidden" style={{ background: "rgba(2,6,23,0.4)", border: "1px solid rgba(255,255,255,0.03)", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05), inset 0 0 20px rgba(0,0,0,0.8)" }}>
                      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)", backgroundSize: "4px 4px" }} />
                    </div>
                    {[
                      { label: "Protein", current: viewingProfile.consumed.protein, target: viewingProfile.macros.protein, color1: "#6ee7b7", color2: "#059669", glow: "rgba(16,185,129,0.5)" },
                      { label: "Carbs", current: viewingProfile.consumed.carbs, target: viewingProfile.macros.carbs, color1: "#fcd34d", color2: "#d97706", glow: "rgba(245,158,11,0.5)" },
                      { label: "Fat", current: viewingProfile.consumed.fats, target: viewingProfile.macros.fats, color1: "#fda4af", color2: "#e11d48", glow: "rgba(244,63,94,0.5)" }
                    ].map((macro) => {
                      const pct = Math.min((macro.current / macro.target) * 100, 100);
                      return (
                        <div key={macro.label} className="flex flex-col gap-2 relative">
                          <div className="flex items-center justify-between leading-none relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: "#94a3b8", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>{macro.label}</span>
                            <div className="flex items-baseline gap-[2px]">
                              <span className="text-[16px] font-black tabular-nums leading-none" style={{ color: "#ffffff", textShadow: "0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(255,255,255,0.15)" }}>{macro.current}</span>
                              <span className="text-[9px] font-bold tabular-nums tracking-[0.1em] uppercase" style={{ color: "#64748b" }}>/ {macro.target}g</span>
                            </div>
                          </div>
                          {/* 3D Deep Canyon Track */}
                          <div className="h-[10px] w-full rounded-full overflow-hidden relative mt-1" style={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.02)", boxShadow: "inset 0 4px 8px rgba(0,0,0,1), 0 1px 1px rgba(255,255,255,0.05)" }}>
                            {/* Precision Segment Dividers */}
                            <div className="absolute inset-0 pointer-events-none z-20" style={{ background: "repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.85) 4px, rgba(0,0,0,0.85) 6px)" }} />
                            
                            {/* Physical glass bar */}
                            <div className="absolute top-0 bottom-0 left-0 z-10" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${macro.color2}, ${macro.color1})`, boxShadow: `0 0 12px ${macro.glow}` }}>
                              {/* Glass edge highlight spanning the whole bar */}
                              <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)" }} />

                              {/* Glowing Bright Head at the leading edge */}
                              <div className="absolute right-0 top-0 bottom-0 w-[6px] bg-white" style={{ filter: "blur(0.5px)", boxShadow: "0 0 10px rgba(255,255,255,1)" }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Ultra-Premium Glass CTA Button */}
              <button className="relative w-full flex items-center justify-center gap-2.5 rounded-[24px] py-4 transition-transform active:scale-[0.96] overflow-hidden mt-2"
                style={{
                  background: "linear-gradient(180deg, rgba(30,41,59,0.6) 0%, rgba(2,6,23,0.9) 100%)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  borderTop: "1px solid rgba(255,255,255,0.15)",
                  boxShadow: "0 16px 32px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.15), inset 0 0 0 1px rgba(255,255,255,0.02), inset 0 -4px 16px rgba(0,0,0,0.8)"
                }}>
                {/* Deep inner luminous rim */}
                <div className="absolute inset-0 rounded-[24px] pointer-events-none" style={{ border: "1px solid rgba(255,255,255,0.03)", margin: "1px" }} />
                
                {/* Ultra subtle specular top edge */}
                <div className="absolute top-0 left-8 right-8 h-px bg-white/40 blur-[1px]" />
                {/* Inner radial glow behind text */}
                <div className="absolute inset-0 m-auto w-[80%] h-full rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse at top, rgba(255,255,255,0.08) 0%, transparent 60%)" }} />
                
                <MessageCircle size={22} strokeWidth={2.5} className="relative z-10" style={{ color: "#e2e8f0", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))" }} />
                <span className="text-[17px] font-bold tracking-[0.05em] relative z-10" style={{ background: "linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))" }}>Message</span>
              </button>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}
