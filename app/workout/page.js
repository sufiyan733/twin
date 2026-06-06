"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import KaiAssistant from "@/components/KaiAssistant";
/* ═══════════════════════════════════════════════════════════
   GLOBAL STYLES — injected once at root
═══════════════════════════════════════════════════════════ */
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&display=swap');

  .workout-page, .workout-page * {
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }

  .workout-page {
    --c-bg: #04060d;
    --c-surface: #090e1a;
    --c-surface2: #0e1623;
    --c-border: rgba(255,255,255,0.065);
    --c-border-hi: rgba(255,255,255,0.13);
    --c-text: #eef2ff;
    --c-muted: #38506e;
    --c-dim: #1a2d44;
    --c-accent: #5b9bff;
    --c-accent2: #a78bfa;
    --c-accent-dim: rgba(91,155,255,0.11);
    --c-accent-glow: rgba(91,155,255,0.28);
    --font-display: 'Bebas Neue', sans-serif;
    --font-body: 'DM Sans', sans-serif;
    --r-sm: 10px;
    --r-md: 14px;
    --r-lg: 20px;
    --r-xl: 26px;
    --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
    --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
    font-family: var(--font-body);
    background: var(--c-bg);
    color: var(--c-text);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes chipPop {
    0%   { opacity: 0; transform: scale(0.6) translateY(4px); }
    70%  { transform: scale(1.06) translateY(-1px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes shimmer {
    0%   { transform: translateX(-120%); }
    100% { transform: translateX(120%); }
  }
  @keyframes floatBlob {
    0%,100% { transform: translate(0,0) scale(1); }
    33%      { transform: translate(18px,-12px) scale(1.04); }
    66%      { transform: translate(-10px,16px) scale(0.97); }
  }
  @keyframes floatBlob2 {
    0%,100% { transform: translate(0,0) scale(1); }
    40%      { transform: translate(-14px,10px) scale(1.03); }
    70%      { transform: translate(12px,-8px) scale(0.98); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.55; }
    50%       { opacity: 1; }
  }
  @keyframes ctaGlow {
    0%,100% { box-shadow: 0 0 32px rgba(91,155,255,0.18), 0 0 0 1px rgba(91,155,255,0.22); }
    50%      { box-shadow: 0 0 56px rgba(91,155,255,0.34), 0 0 0 1px rgba(91,155,255,0.38); }
  }
  @keyframes successBounce {
    0%  { transform: scale(0.88); }
    60% { transform: scale(1.1); }
    100%{ transform: scale(1); }
  }
  @keyframes badgePop {
    0%  { transform: scale(0) rotate(-15deg); opacity:0; }
    70% { transform: scale(1.15) rotate(3deg); opacity:1; }
    100%{ transform: scale(1) rotate(0deg); opacity:1; }
  }
  @keyframes planCardIn {
    from { opacity: 0; transform: translateY(20px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes exRowSlide {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes glowPulse {
    0%,100% { opacity: 0.5; }
    50% { opacity: 1; }
  }

  .ws-scroll::-webkit-scrollbar { width: 2px; }
  .ws-scroll::-webkit-scrollbar-track { background: transparent; }
  .ws-scroll::-webkit-scrollbar-thumb { background: rgba(91,155,255,0.18); border-radius: 2px; }

  .press-scale { transition: transform 0.12s var(--ease-spring); }
  .press-scale:active { transform: scale(0.93) !important; }

  .action-card {
    transition: transform 0.2s var(--ease-spring), background 0.2s, border-color 0.2s, box-shadow 0.22s !important;
  }
  .action-card:hover {
    background: rgba(91,155,255,0.08) !important;
    border-color: rgba(91,155,255,0.4) !important;
    box-shadow: 0 8px 32px rgba(91,155,255,0.1), inset 0 1px 0 rgba(255,255,255,0.06) !important;
    transform: translateY(-2px) !important;
  }
  .action-card:active { transform: scale(0.97) translateY(0) !important; }

  .plan-card-hover {
    transition: transform 0.22s var(--ease-spring), border-color 0.22s, box-shadow 0.22s !important;
  }
  .plan-card-hover:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 12px 40px rgba(0,0,0,0.5) !important;
  }
  .plan-card-hover:active { transform: scale(0.98) !important; }

  .day-card-hover { transition: box-shadow 0.22s !important; }
  .day-card-hover:hover { box-shadow: 0 4px 24px rgba(0,0,0,0.35) !important; }

  .ex-row-hover { transition: background 0.14s !important; }
  .ex-row-hover:hover { background: rgba(255,255,255,0.035) !important; border-radius: 10px; }
`;

/* ═══════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════ */
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_SHORT = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const MUSCLE_GROUPS = [
  { id: "chest", label: "Chest", emoji: "🫁", color: "#ef5a5a", cat: "Push" },
  { id: "triceps", label: "Triceps", emoji: "🦾", color: "#f97316", cat: "Push" },
  { id: "front_delt", label: "Front Delt", emoji: "⬆️", color: "#fb923c", cat: "Push" },
  { id: "lateral_delt", label: "Lat. Delt", emoji: "↔️", color: "#a855f7", cat: "Push" },
  { id: "back", label: "Back", emoji: "🏔️", color: "#3b82f6", cat: "Pull" },
  { id: "biceps", label: "Biceps", emoji: "💪", color: "#60a5fa", cat: "Pull" },
  { id: "rear_delt", label: "Rear Delt", emoji: "⬇️", color: "#818cf8", cat: "Pull" },
  { id: "legs", label: "Legs", emoji: "🦵", color: "#22c55e", cat: "Legs" },
  { id: "glutes", label: "Glutes", emoji: "🍑", color: "#ec4899", cat: "Legs" },
  { id: "core", label: "Core", emoji: "⚡", color: "#06b6d4", cat: "Core" },
  { id: "fullbody", label: "Full Body", emoji: "🌟", color: "#eab308", cat: "Core" },
  { id: "shoulders", label: "Shoulders", emoji: "🏋️", color: "#c084fc", cat: "Push" },
];

const MG_CATS = ["Push", "Pull", "Legs", "Core"];

const EX_MUSCLES = [
  { id: "chest", label: "Chest", emoji: "🫁", color: "#ef5a5a" },
  { id: "back", label: "Back", emoji: "🏔️", color: "#3b82f6" },
  { id: "shoulders", label: "Shoulders", emoji: "🏋️", color: "#c084fc" },
  { id: "biceps", label: "Biceps", emoji: "💪", color: "#60a5fa" },
  { id: "triceps", label: "Triceps", emoji: "🦾", color: "#f97316" },
  { id: "legs", label: "Legs", emoji: "🦵", color: "#22c55e" },
];

const EXERCISES = {
  chest: [
    { id: "bp", name: "Barbell Bench Press", tag: "Compound" },
    { id: "dbp", name: "Dumbbell Bench Press", tag: "Compound" },
    { id: "ibp", name: "Incline Barbell Press", tag: "Compound" },
    { id: "idbp", name: "Incline DB Press", tag: "Compound" },
    { id: "cfly", name: "Cable Fly", tag: "Isolation" },
    { id: "dfly", name: "Dumbbell Fly", tag: "Isolation" },
    { id: "pec", name: "Pec Deck Machine", tag: "Machine" },
    { id: "dips", name: "Chest Dips", tag: "Bodyweight" },
    { id: "push", name: "Push-Ups", tag: "Bodyweight" },
    { id: "dbp2", name: "Decline Bench Press", tag: "Compound" },
  ],
  back: [
    { id: "dl", name: "Deadlift", tag: "Compound" },
    { id: "pr", name: "Barbell Row", tag: "Compound" },
    { id: "pu", name: "Pull-Ups", tag: "Bodyweight" },
    { id: "lat", name: "Lat Pulldown", tag: "Compound" },
    { id: "csr", name: "Cable Seated Row", tag: "Compound" },
    { id: "dbr", name: "Single-Arm DB Row", tag: "Compound" },
    { id: "tbar", name: "T-Bar Row", tag: "Compound" },
    { id: "shr", name: "Straight-Arm Pulldown", tag: "Isolation" },
    { id: "chi", name: "Chin-Ups", tag: "Bodyweight" },
    { id: "hyp", name: "Hyperextension", tag: "Isolation" },
  ],
  shoulders: [
    { id: "ohp", name: "Overhead Press", tag: "Compound" },
    { id: "dbop", name: "DB Shoulder Press", tag: "Compound" },
    { id: "mlat", name: "DB Lateral Raise", tag: "Isolation" },
    { id: "clat", name: "Cable Lateral Raise", tag: "Isolation" },
    { id: "frt", name: "DB Front Raise", tag: "Isolation" },
    { id: "rfly", name: "Rear Delt Fly", tag: "Isolation" },
    { id: "face", name: "Face Pulls", tag: "Isolation" },
    { id: "uprt", name: "Upright Row", tag: "Compound" },
    { id: "arnp", name: "Arnold Press", tag: "Compound" },
    { id: "mach", name: "Machine Shoulder Press", tag: "Machine" },
  ],
  biceps: [
    { id: "bcurl", name: "Barbell Curl", tag: "Compound" },
    { id: "dbcurl", name: "Dumbbell Curl", tag: "Isolation" },
    { id: "hcurl", name: "Hammer Curl", tag: "Isolation" },
    { id: "ccurl", name: "Cable Curl", tag: "Isolation" },
    { id: "pcurl", name: "Preacher Curl", tag: "Isolation" },
    { id: "icurl", name: "Incline DB Curl", tag: "Isolation" },
    { id: "concurl", name: "Concentration Curl", tag: "Isolation" },
    { id: "spcurl", name: "Spider Curl", tag: "Isolation" },
    { id: "zbar", name: "EZ-Bar Curl", tag: "Compound" },
    { id: "mcurl", name: "Machine Curl", tag: "Machine" },
  ],
  triceps: [
    { id: "cgbp", name: "Close-Grip Bench", tag: "Compound" },
    { id: "skul", name: "Skull Crushers", tag: "Isolation" },
    { id: "tpd", name: "Tricep Pushdown", tag: "Isolation" },
    { id: "tov", name: "Overhead Extension", tag: "Isolation" },
    { id: "dips2", name: "Tricep Dips", tag: "Bodyweight" },
    { id: "kbk", name: "Tricep Kickback", tag: "Isolation" },
    { id: "rope", name: "Rope Pushdown", tag: "Isolation" },
    { id: "dbskg", name: "DB Skull Crusher", tag: "Isolation" },
    { id: "spbar", name: "Single-Arm Pushdown", tag: "Isolation" },
    { id: "dmnd", name: "Diamond Push-Ups", tag: "Bodyweight" },
  ],
  legs: [
    { id: "squat", name: "Back Squat", tag: "Compound" },
    { id: "fsq", name: "Front Squat", tag: "Compound" },
    { id: "leg", name: "Leg Press", tag: "Machine" },
    { id: "rdl", name: "Romanian Deadlift", tag: "Compound" },
    { id: "lunge", name: "Lunges", tag: "Compound" },
    { id: "legcl", name: "Leg Curl", tag: "Isolation" },
    { id: "legex", name: "Leg Extension", tag: "Isolation" },
    { id: "calfr", name: "Calf Raises", tag: "Isolation" },
    { id: "hams", name: "Hack Squat", tag: "Machine" },
    { id: "bsqb", name: "Bulgarian Split Squat", tag: "Compound" },
  ],
};

const TAG_META = {
  Compound: { bg: "rgba(59,130,246,0.14)", bd: "rgba(96,165,250,0.28)", tx: "#93c5fd" },
  Isolation: { bg: "rgba(168,85,247,0.14)", bd: "rgba(192,132,252,0.28)", tx: "#d8b4fe" },
  Bodyweight: { bg: "rgba(34,197,94,0.14)", bd: "rgba(74,222,128,0.28)", tx: "#86efac" },
  Machine: { bg: "rgba(234,179,8,0.14)", bd: "rgba(250,204,21,0.28)", tx: "#fde047" },
};

/* ═══════════════════════════════════════════════════════════
   PREMIUM WORKOUT PLANS DATA
═══════════════════════════════════════════════════════════ */
const WORKOUT_PLANS = [
  {
    id: "hybrid-ppl",
    name: "Super Split",
    tagline: "Legs First, Balanced Upper",
    days: 6,
    level: "Intermediate",
    badge: "HYBRID",
    badgeColor: "#10b981",
    accent: "#10b981",
    accentDim: "rgba(16,185,129,0.12)",
    gradient: "linear-gradient(135deg,#064e3b 0%,#022c22 100%)",
    borderColor: "rgba(16,185,129,0.35)",
    freq: "2× per muscle",
    volume: "14–18 sets/muscle/wk",
    rest: "Sun",
    goal: "Hypertrophy",
    icon: "🧬",
    schedule: [
      { day: "MON", label: "Legs", muscles: "Hamstrings · Quads", color: "#10b981" },
      { day: "TUE", label: "Chest + Back", muscles: "Chest · Lats · Mid-back", color: "#3b82f6" },
      { day: "WED", label: "Shoulders + Arms", muscles: "Delts · Biceps · Triceps", color: "#8b5cf6" },
      { day: "THU", label: "Legs", muscles: "Hamstrings · Quads", color: "#10b981" },
      { day: "FRI", label: "Chest + Back", muscles: "Chest · Lats · Mid-back", color: "#3b82f6" },
      { day: "SAT", label: "Shoulders + Arms", muscles: "Delts · Biceps · Triceps", color: "#8b5cf6" },
      { day: "SUN", label: "Rest", muscles: "Recovery", color: "#38506e" },
    ],
    workouts: [
      {
        label: "Legs",
        color: "#10b981",
        exercises: [
          { name: "Hamstring Curl", sets: "2 sets", note: "Pre-exhaustion" },
          { name: "Squats", sets: "3 sets", note: "Primary lower compound" },
          { name: "Hamstring Curl", sets: "2 sets", note: "Post-squat isolation" },
          { name: "Leg Extension", sets: "3 sets", note: "Quad isolation" },
        ],
      },
      {
        label: "Chest + Back",
        color: "#3b82f6",
        exercises: [
          { name: "Incline DB Press", sets: "3 sets", note: "Upper chest focus" },
          { name: "Lat Pulldown", sets: "3 sets", note: "Vertical pull" },
          { name: "Cable Press / Pec Fly", sets: "3 sets", note: "Chest isolation" },
          { name: "Machine Row / Barbell Row", sets: "3 sets", note: "Horizontal pull" },
          { name: "Lower Back", sets: "3 sets", note: "Spinal erectors" },
        ],
      },
      {
        label: "Shoulders + Arms",
        color: "#8b5cf6",
        exercises: [
          { name: "DB / Machine OHP", sets: "3 sets", note: "Vertical press" },
          { name: "Biceps Curl", sets: "3 sets", note: "Bicep isolation" },
          { name: "Triceps Pushdown", sets: "3 sets", note: "Tricep isolation" },
          { name: "Lateral Raises", sets: "3 sets", note: "Medial delt" },
          { name: "Hammer Curl", sets: "3 sets", note: "Brachialis focus" },
          { name: "Triceps Overhead Extension", sets: "3 sets", note: "Long head focus" },
          { name: "Shrugs", sets: "3 sets", note: "Trap development" },
        ],
      },
    ],
    scienceNote: "Starting the rotation with Legs prioritizes lower body development. Grouping Chest/Back and Shoulders/Arms allows for antagonistic supersets and massive pumps.",
  },
  {
    id: "ppl6",
    name: "Push Pull Legs",
    tagline: "The Gold Standard",
    days: 6,
    level: "Intermediate",
    badge: "MOST POPULAR",
    badgeColor: "#5b9bff",
    accent: "#5b9bff",
    accentDim: "rgba(91,155,255,0.12)",
    gradient: "linear-gradient(135deg,#1e3a5f 0%,#0c1e36 100%)",
    borderColor: "rgba(91,155,255,0.35)",
    freq: "2× per muscle",
    volume: "10–16 sets/muscle/wk",
    rest: "Sun",
    goal: "Hypertrophy + Strength",
    icon: "⚡",
    schedule: [
      { day: "MON", label: "Push A", muscles: "Chest · Shoulders · Triceps", color: "#ef5a5a" },
      { day: "TUE", label: "Pull A", muscles: "Back · Biceps · Rear Delt", color: "#3b82f6" },
      { day: "WED", label: "Legs A", muscles: "Quads · Hamstrings · Calves", color: "#22c55e" },
      { day: "THU", label: "Push B", muscles: "Shoulders (focus) · Chest · Tris", color: "#ef5a5a" },
      { day: "FRI", label: "Pull B", muscles: "Back (width) · Biceps · Traps", color: "#3b82f6" },
      { day: "SAT", label: "Legs B", muscles: "Glutes · Hams · Quads · Core", color: "#22c55e" },
      { day: "SUN", label: "Rest", muscles: "Active recovery / mobility", color: "#38506e" },
    ],
    workouts: [
      {
        label: "Push A — Chest Focus",
        color: "#ef5a5a",
        exercises: [
          { name: "Flat Barbell Bench Press", sets: "4×5–8", note: "Primary compound · 3min rest" },
          { name: "Incline DB Press", sets: "3×8–12", note: "Upper chest emphasis" },
          { name: "Cable Fly (high-to-low)", sets: "3×12–15", note: "Stretch-focused isolation" },
          { name: "OHP (seated dumbbell)", sets: "3×10–12", note: "Front delt & upper chest" },
          { name: "Rope Pushdown", sets: "3×12–15", note: "Tricep isolation · superset ok" },
          { name: "Overhead Tricep Extension", sets: "2×12–15", note: "Long head focus" },
        ],
      },
      {
        label: "Pull A — Back Thickness",
        color: "#3b82f6",
        exercises: [
          { name: "Deadlift", sets: "4×4–6", note: "Max strength focus · 3–4min rest" },
          { name: "Barbell Row (pronated)", sets: "4×6–10", note: "Mid-back thickness" },
          { name: "Lat Pulldown (wide)", sets: "3×10–12", note: "Lat width" },
          { name: "Incline DB Curl", sets: "3×10–12", note: "Bicep stretch position" },
          { name: "Face Pulls", sets: "3×15–20", note: "Rear delt health & posture" },
          { name: "Hammer Curl", sets: "2×12–15", note: "Brachialis & brachioradialis" },
        ],
      },
      {
        label: "Legs A — Quad Dominant",
        color: "#22c55e",
        exercises: [
          { name: "Back Squat", sets: "4×5–8", note: "Primary lower compound · 3min rest" },
          { name: "Leg Press", sets: "3×10–15", note: "Volume accumulator" },
          { name: "Bulgarian Split Squat", sets: "3×8–10 each", note: "Unilateral quad + glute" },
          { name: "Leg Extension", sets: "3×12–15", note: "Quad isolation · full ROM" },
          { name: "Seated Leg Curl", sets: "3×10–12", note: "Hamstring isolation" },
          { name: "Standing Calf Raise", sets: "4×15–20", note: "Gastrocnemius focus" },
        ],
      },
    ],
    scienceNote: "2× frequency with 10–16 sets per muscle group per week. Push A emphasises horizontal pressing; Push B shifts to vertical. Allows 48h+ recovery between same-muscle sessions.",
  },
  {
    id: "ul4",
    name: "Upper Lower",
    tagline: "Science-Backed Efficiency",
    days: 4,
    level: "Beginner–Intermediate",
    badge: "BEST FOR GAINS",
    badgeColor: "#a78bfa",
    accent: "#a78bfa",
    accentDim: "rgba(167,139,250,0.12)",
    gradient: "linear-gradient(135deg,#2e1a5e 0%,#110d2a 100%)",
    borderColor: "rgba(167,139,250,0.35)",
    freq: "2× per muscle",
    volume: "12–18 sets/muscle/wk",
    rest: "Wed · Sat · Sun",
    goal: "Hypertrophy + Strength",
    icon: "🎯",
    schedule: [
      { day: "MON", label: "Upper A", muscles: "Chest · Back · Shoulders · Arms", color: "#a78bfa" },
      { day: "TUE", label: "Lower A", muscles: "Quads · Hamstrings · Glutes · Calves", color: "#22c55e" },
      { day: "WED", label: "Rest", muscles: "Mobility / light cardio", color: "#38506e" },
      { day: "THU", label: "Upper B", muscles: "Back (focus) · Chest · Arms", color: "#a78bfa" },
      { day: "FRI", label: "Lower B", muscles: "Posterior chain + quad volume", color: "#22c55e" },
      { day: "SAT", label: "Rest", muscles: "Active recovery", color: "#38506e" },
      { day: "SUN", label: "Rest", muscles: "Full recovery", color: "#38506e" },
    ],
    workouts: [
      {
        label: "Upper A — Horizontal Emphasis",
        color: "#a78bfa",
        exercises: [
          { name: "Flat Bench Press", sets: "4×6–10", note: "Horizontal push strength" },
          { name: "Barbell Row (underhand)", sets: "4×6–10", note: "Mid-back + bicep synergy" },
          { name: "Incline DB Press", sets: "3×10–12", note: "Upper chest hypertrophy" },
          { name: "Seated Cable Row", sets: "3×10–12", note: "Lat thickness" },
          { name: "Lateral Raise (cable)", sets: "3×15–20", note: "Medial delt isolation" },
          { name: "EZ-Bar Curl", sets: "3×10–12", note: "Supinated bicep curl" },
          { name: "Skull Crushers", sets: "3×10–12", note: "Tricep long head" },
        ],
      },
      {
        label: "Lower A — Squat Dominant",
        color: "#22c55e",
        exercises: [
          { name: "Back Squat", sets: "4×5–8", note: "King of lower body compounds" },
          { name: "Romanian Deadlift", sets: "3×8–12", note: "Hamstring + glute hinge" },
          { name: "Leg Press (wide stance)", sets: "3×12–15", note: "Glute-biased volume" },
          { name: "Leg Curl (lying)", sets: "3×12–15", note: "Hamstring isolation" },
          { name: "Leg Extension", sets: "3×12–15", note: "Terminal quad contraction" },
          { name: "Seated Calf Raise", sets: "4×15–20", note: "Soleus focus" },
        ],
      },
    ],
    scienceNote: "48h recovery between upper sessions, 48h between lower sessions. Upper A emphasises horizontal pressing; Upper B shifts to vertical pulling. Research-optimal 2× frequency.",
  },

  {
    id: "arnold",
    name: "Arnold Split",
    tagline: "Chest/Back Superset System",
    days: 6,
    level: "Advanced",
    badge: "LEGENDARY",
    badgeColor: "#eab308",
    accent: "#eab308",
    accentDim: "rgba(234,179,8,0.12)",
    gradient: "linear-gradient(135deg,#3a2800 0%,#1a1200 100%)",
    borderColor: "rgba(234,179,8,0.35)",
    freq: "2× per muscle",
    volume: "16–22 sets/muscle/wk",
    rest: "Sun",
    goal: "Maximum Hypertrophy",
    icon: "👑",
    schedule: [
      { day: "MON", label: "Chest + Back", muscles: "Full chest · Full back superset", color: "#eab308" },
      { day: "TUE", label: "Shoulders + Arms", muscles: "Delts · Biceps · Triceps", color: "#c084fc" },
      { day: "WED", label: "Legs", muscles: "Quads · Hams · Glutes · Calves", color: "#22c55e" },
      { day: "THU", label: "Chest + Back", muscles: "Angle variation — incline focus", color: "#eab308" },
      { day: "FRI", label: "Shoulders + Arms", muscles: "Heavy OHP · arm isolation", color: "#c084fc" },
      { day: "SAT", label: "Legs", muscles: "Posterior chain focus + core", color: "#22c55e" },
      { day: "SUN", label: "Rest", muscles: "Complete rest — mandatory", color: "#38506e" },
    ],
    workouts: [
      {
        label: "Chest + Back A (Supersets)",
        color: "#eab308",
        exercises: [
          { name: "Bench Press ↔ Wide-Grip Pull-Up", sets: "5×6–10", note: "Superset — opposing muscles" },
          { name: "Incline DB Press ↔ T-Bar Row", sets: "4×8–12", note: "Superset — upper chest + mid-back" },
          { name: "Dumbbell Fly ↔ Seated Cable Row", sets: "4×10–15", note: "Isolation superset" },
          { name: "Decline Bench Press", sets: "3×10–12", note: "Lower chest finishing" },
          { name: "Straight-Arm Pulldown", sets: "3×12–15", note: "Lat isolation finisher" },
        ],
      },
      {
        label: "Shoulders + Arms",
        color: "#c084fc",
        exercises: [
          { name: "Standing Barbell OHP", sets: "4×6–8", note: "Primary delt compound" },
          { name: "DB Lateral Raise", sets: "5×12–15", note: "Arnold's signature high volume" },
          { name: "Rear Delt Fly (cable)", sets: "4×15–20", note: "Posterior delt isolation" },
          { name: "Barbell Curl", sets: "4×8–12", note: "Bicep mass builder" },
          { name: "Incline DB Curl", sets: "3×10–12", note: "Stretch-focused supination" },
          { name: "Skull Crushers", sets: "4×8–12", note: "Tricep long head" },
          { name: "Tricep Dips (weighted)", sets: "3×8–12", note: "Overall tricep mass" },
        ],
      },
    ],
    scienceNote: "Chest+Back supersets pre-fatigue antagonistic muscles, increasing pump and time-efficiency. The 6-day frequency produces high MPS but requires elite recovery — prioritise 8h+ sleep and 0.8g/lb protein intake.",
  },

  {
    id: "bro5",
    name: "Modified Bro Split",
    tagline: "High Volume Specialisation",
    days: 5,
    level: "Intermediate–Advanced",
    badge: "MAX VOLUME",
    badgeColor: "#ef5a5a",
    accent: "#ef5a5a",
    accentDim: "rgba(239,90,90,0.12)",
    gradient: "linear-gradient(135deg,#3a0a0a 0%,#1a0404 100%)",
    borderColor: "rgba(239,90,90,0.35)",
    freq: "1–2× per muscle",
    volume: "14–22 sets/muscle/day",
    rest: "Sat · Sun",
    goal: "Hypertrophy · Advanced",
    icon: "💪",
    schedule: [
      { day: "MON", label: "Chest + Triceps", muscles: "Full chest · Tricep isolation", color: "#ef5a5a" },
      { day: "TUE", label: "Back + Biceps", muscles: "Full back · Bicep isolation", color: "#3b82f6" },
      { day: "WED", label: "Shoulders", muscles: "All 3 delt heads · Traps", color: "#c084fc" },
      { day: "THU", label: "Legs", muscles: "Full lower body · Core", color: "#22c55e" },
      { day: "FRI", label: "Arms + Core", muscles: "Biceps · Triceps · Abs", color: "#f97316" },
      { day: "SAT", label: "Rest", muscles: "Active recovery", color: "#38506e" },
      { day: "SUN", label: "Rest", muscles: "Full recovery", color: "#38506e" },
    ],
    workouts: [
      {
        label: "Chest + Triceps",
        color: "#ef5a5a",
        exercises: [
          { name: "Flat Barbell Bench Press", sets: "4×6–10", note: "Primary mass builder" },
          { name: "Incline Barbell Press", sets: "4×8–12", note: "Upper chest priority" },
          { name: "Incline DB Fly", sets: "3×12–15", note: "Upper chest stretch" },
          { name: "Cable Fly (low-to-high)", sets: "3×12–15", note: "Inner chest peak" },
          { name: "Chest Dips", sets: "3×10–15", note: "Lower chest + tricep" },
          { name: "Skull Crushers", sets: "4×10–12", note: "Tricep long head primary" },
          { name: "Rope Pushdown", sets: "3×12–15", note: "Lateral head finisher" },
        ],
      },
      {
        label: "Shoulders (All Heads)",
        color: "#c084fc",
        exercises: [
          { name: "Standing Barbell OHP", sets: "4×6–8", note: "Strength foundation" },
          { name: "DB Lateral Raise", sets: "5×15–20", note: "Medial delt width" },
          { name: "Cable Lateral Raise", sets: "3×15–20", note: "Continuous tension" },
          { name: "Rear Delt Fly (machine)", sets: "4×15–20", note: "Posterior delt + posture" },
          { name: "Face Pulls", sets: "3×20", note: "Rotator cuff health" },
          { name: "DB Front Raise", sets: "3×12–15", note: "Anterior delt" },
          { name: "Barbell Shrug", sets: "3×12–15", note: "Trap development" },
        ],
      },
    ],
    scienceNote: "Maximises per-session volume for each muscle group. Friday 'arms' session serves as secondary stimulus for biceps and triceps hit earlier in the week. Best suited for lifters with 2+ years of training age.",
  },

];

/* ═══════════════════════════════════════════════════════════
   SHARED PRIMITIVES
═══════════════════════════════════════════════════════════ */
const Tag = ({ label }) => {
  const m = TAG_META[label] || TAG_META.Compound;
  return (
    <span style={{
      fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em",
      padding: "2px 7px", borderRadius: "6px",
      background: m.bg, border: `1px solid ${m.bd}`, color: m.tx,
      textTransform: "uppercase", flexShrink: 0,
    }}>{label}</span>
  );
};

const CheckCircle = ({ checked, color }) => (
  <div style={{
    width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
    background: checked ? `${color}22` : "rgba(255,255,255,0.04)",
    border: `1.5px solid ${checked ? color : "rgba(255,255,255,0.1)"}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: color, transition: "all 0.18s var(--ease-spring)",
    boxShadow: checked ? `0 0 10px ${color}40` : "none",
  }}>
    {checked && (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    )}
  </div>
);

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={e => { e.stopPropagation(); onChange(); }}
    aria-pressed={checked}
    style={{
      all: "unset", position: "relative", width: "46px", height: "26px",
      borderRadius: "13px", flexShrink: 0,
      background: checked
        ? "linear-gradient(135deg,#4f8ef7,#1d4ed8)"
        : "rgba(255,255,255,0.07)",
      border: checked ? "1px solid rgba(79,142,247,0.5)" : "1px solid rgba(255,255,255,0.1)",
      cursor: "pointer",
      transition: "background 0.28s, border 0.28s, box-shadow 0.28s",
      boxShadow: checked ? "0 0 14px rgba(79,142,247,0.4)" : "none",
      touchAction: "manipulation",
    }}
  >
    <div style={{
      position: "absolute", top: "4px",
      left: checked ? "23px" : "4px",
      width: "16px", height: "16px", borderRadius: "50%",
      background: checked ? "#fff" : "rgba(255,255,255,0.28)",
      transition: "left 0.26s var(--ease-spring)",
      boxShadow: checked ? "0 1px 6px rgba(0,0,0,0.35)" : "none",
      pointerEvents: "none",
    }} />
  </button>
);

const SheetOverlay = ({ visible, onClose, zIndex = 298 }) => (
  <div onClick={onClose} style={{
    position: "fixed", inset: 0, zIndex,
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    opacity: visible ? 1 : 0,
    transition: "opacity 0.25s ease",
    pointerEvents: visible ? "auto" : "none",
  }} />
);

const SheetHandle = () => (
  <div style={{ width: "32px", height: "3px", borderRadius: "2px", background: "rgba(255,255,255,0.12)", margin: "0 auto 16px" }} />
);

/* ═══════════════════════════════════════════════════════════
   MUSCLE PICKER
═══════════════════════════════════════════════════════════ */
const MusclePicker = ({ dayLabel, selected, onToggle, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState("Push");

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  const filtered = MUSCLE_GROUPS.filter(mg => mg.cat === tab);

  return (
    <>
      <SheetOverlay visible={visible} onClose={close} zIndex={298} />
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 299,
        display: "flex", justifyContent: "center",
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.32s var(--ease-out)",
        pointerEvents: visible ? "auto" : "none",
      }}>
        <div style={{
          width: "100%", maxWidth: "430px",
          background: "#0b1525",
          borderRadius: "24px 24px 0 0",
          border: "1px solid rgba(79,142,247,0.18)", borderBottom: "none",
          boxShadow: "0 -20px 80px rgba(0,0,0,0.9)",
        }}>
          <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,rgba(79,142,247,0.55),transparent)" }} />
          <div style={{ padding: "14px 18px 12px" }}>
            <SheetHandle />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.16em", color: "var(--c-accent)", textTransform: "uppercase", marginBottom: "4px" }}>Add muscles</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "26px", letterSpacing: "0.04em", color: "#fff", lineHeight: 1 }}>{dayLabel}</div>
              </div>
              <button onClick={close} style={{
                all: "unset", width: "32px", height: "32px", borderRadius: "50%",
                background: "rgba(255,255,255,0.06)", border: "1px solid var(--c-border-hi)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--c-muted)", cursor: "pointer",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px", padding: "0 18px 14px", overflowX: "auto" }}>
            {MG_CATS.map(cat => {
              const active = tab === cat;
              const count = MUSCLE_GROUPS.filter(mg => mg.cat === cat && selected.some(s => s.id === mg.id)).length;
              return (
                <button key={cat} onClick={() => setTab(cat)} style={{
                  all: "unset", display: "flex", alignItems: "center", gap: "5px",
                  padding: "5px 13px", borderRadius: "20px", flexShrink: 0,
                  fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em", cursor: "pointer",
                  background: active ? "rgba(79,142,247,0.18)" : "rgba(255,255,255,0.04)",
                  border: active ? "1px solid rgba(79,142,247,0.45)" : "1px solid var(--c-border)",
                  color: active ? "#93c5fd" : "var(--c-muted)",
                  transition: "all 0.18s",
                  boxShadow: active ? "0 0 12px rgba(79,142,247,0.22)" : "none",
                }}>
                  {cat}
                  {count > 0 && (
                    <span style={{
                      width: "16px", height: "16px", borderRadius: "50%",
                      background: "var(--c-accent)", color: "#fff",
                      fontSize: "9px", fontWeight: 800,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", padding: "0 18px 36px" }}>
            {filtered.map(mg => {
              const sel = selected.some(s => s.id === mg.id);
              return (
                <button key={mg.id} onClick={() => onToggle(mg)} className="press-scale" style={{
                  all: "unset", display: "flex", alignItems: "center", gap: "10px",
                  padding: "12px 13px", borderRadius: "var(--r-md)", cursor: "pointer",
                  background: sel ? `${mg.color}16` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${sel ? mg.color + "55" : "var(--c-border)"}`,
                  boxShadow: sel ? `0 0 16px ${mg.color}20` : "none",
                  transition: "background 0.18s, border 0.18s, box-shadow 0.18s",
                }}>
                  <span style={{ fontSize: "19px", lineHeight: 1, flexShrink: 0 }}>{mg.emoji}</span>
                  <span style={{ fontSize: "12px", fontWeight: 600, flex: 1, lineHeight: 1.2, color: sel ? mg.color : "#4b6280", transition: "color 0.18s" }}>{mg.label}</span>
                  <CheckCircle checked={sel} color={mg.color} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════
   DAY CARD
═══════════════════════════════════════════════════════════ */
const MuscleChip = ({ muscle, onRemove }) => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: "5px",
    padding: "4px 8px 4px 7px", borderRadius: "20px",
    border: `1px solid ${muscle.color}45`,
    background: `${muscle.color}12`,
    animation: "chipPop 0.28s var(--ease-spring)",
  }}>
    <span style={{ fontSize: "11px" }}>{muscle.emoji}</span>
    <span style={{ fontSize: "11px", fontWeight: 600, color: muscle.color }}>{muscle.label}</span>
    <button onClick={e => { e.stopPropagation(); onRemove(); }} style={{
      all: "unset", width: "13px", height: "13px", borderRadius: "50%",
      background: `${muscle.color}25`, display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", color: muscle.color, flexShrink: 0, marginLeft: "1px",
      touchAction: "manipulation",
    }}>
      <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
    </button>
  </div>
);

const DayCard = ({ dayIndex, isWorkout, muscles, onToggle, onMuscleToggle, onOpenPicker }) => {
  const short = DAY_SHORT[dayIndex];
  const day = DAYS[dayIndex];
  return (
    <div style={{
      position: "relative", borderRadius: "var(--r-md)",
      background: isWorkout ? "rgba(79,142,247,0.06)" : "rgba(255,255,255,0.025)",
      border: `1px solid ${isWorkout ? "rgba(79,142,247,0.2)" : "var(--c-border)"}`,
      padding: "12px 13px",
      transition: "background 0.28s, border 0.28s",
    }}>
      {isWorkout && (
        <div style={{
          position: "absolute", top: 0, left: "18%", right: "18%", height: "1px",
          background: "linear-gradient(90deg,transparent,rgba(79,142,247,0.4),transparent)",
          borderRadius: "2px", pointerEvents: "none",
        }} />
      )}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "38px", height: "38px", borderRadius: "var(--r-sm)", flexShrink: 0,
          background: isWorkout ? "rgba(79,142,247,0.12)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${isWorkout ? "rgba(79,142,247,0.25)" : "var(--c-border)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.28s",
        }}>
          <span style={{
            fontFamily: "var(--font-display)", fontSize: "12px", letterSpacing: "0.05em",
            color: isWorkout ? "#60a5fa" : "var(--c-dim)",
            transition: "color 0.28s",
          }}>{short}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: isWorkout ? "#e2e8f0" : "var(--c-muted)", marginBottom: "2px", transition: "color 0.28s" }}>{day}</div>
          <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: isWorkout ? "var(--c-accent)" : "var(--c-dim)", transition: "color 0.28s" }}>
            {isWorkout ? (muscles.length > 0 ? `${muscles.length} muscle${muscles.length > 1 ? "s" : ""}` : "Training day") : "Rest"}
          </div>
        </div>
        {isWorkout && (
          <button onClick={e => { e.stopPropagation(); onOpenPicker(); }} className="press-scale" style={{
            all: "unset", width: "28px", height: "28px", borderRadius: "8px",
            background: "rgba(79,142,247,0.12)", border: "1px solid rgba(79,142,247,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#60a5fa", cursor: "pointer", flexShrink: 0, marginRight: "6px", touchAction: "manipulation",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          </button>
        )}
        <Toggle checked={isWorkout} onChange={onToggle} />
      </div>
      {isWorkout && muscles.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "10px", paddingTop: "9px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {muscles.map(mg => <MuscleChip key={mg.id} muscle={mg} onRemove={() => onMuscleToggle(mg)} />)}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   WORKOUT SPLIT MODAL
═══════════════════════════════════════════════════════════ */
const WorkoutSplitModal = ({ onClose }) => {
  const [visible, setVisible] = useState(false);
  const [pickerDay, setPickerDay] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadState, setLoadState] = useState("loading");
  const [dayState, setDayState] = useState(DAYS.map(() => ({ isWorkout: false, muscles: [] })));

  useEffect(() => { const t = setTimeout(() => setVisible(true), 20); return () => clearTimeout(t); }, []);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/workout/split").then(r => r.json()).then(data => {
      if (cancelled) return;
      if (data.days) setDayState(data.days);
      setLoadState("ready");
    }).catch(() => { if (!cancelled) setLoadState("ready"); });
    return () => { cancelled = true; };
  }, []);

  const handleClose = useCallback(() => { setVisible(false); setTimeout(onClose, 330); }, [onClose]);
  const toggleDay = i => setDayState(prev => { const n = [...prev]; n[i] = { ...n[i], isWorkout: !n[i].isWorkout, muscles: n[i].isWorkout ? [] : n[i].muscles }; return n; });
  const toggleMuscle = (dayIdx, mg) => setDayState(prev => { const n = [...prev]; const d = n[dayIdx]; const exists = d.muscles.some(m => m.id === mg.id); n[dayIdx] = { ...d, muscles: exists ? d.muscles.filter(m => m.id !== mg.id) : [...d.muscles, mg] }; return n; });
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/workout/split", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ days: dayState }) });
      if (!res.ok) throw new Error("save failed");
      setSaving(false); setSaved(true); setTimeout(handleClose, 1500);
    } catch { setSaving(false); }
  };

  const workoutCount = dayState.filter(d => d.isWorkout).length;

  return (
    <>
      <div onClick={handleClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }} />
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 51, display: "flex", justifyContent: "center", transform: visible ? "translateY(0)" : "translateY(100%)", transition: "transform 0.38s var(--ease-out)" }}>
        <div style={{ width: "100%", maxWidth: "430px", background: "#06080f", borderRadius: "26px 26px 0 0", border: "1px solid rgba(79,142,247,0.14)", borderBottom: "none", display: "flex", flexDirection: "column", maxHeight: "92dvh", overflow: "hidden", boxShadow: "0 -24px 100px rgba(0,0,0,0.9)", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: "1px", background: "linear-gradient(90deg,transparent,rgba(79,142,247,0.55),transparent)", pointerEvents: "none" }} />
          <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--c-border)", flexShrink: 0 }}>
            <SheetHandle />
            <div style={{ display: "flex", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--c-accent)", marginBottom: "5px" }}>Weekly Schedule</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "32px", letterSpacing: "0.04em", color: "#fff", lineHeight: 1, marginBottom: "10px" }}>Workout Split</div>
                <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                  {DAYS.map((d, i) => (
                    <div key={i} title={d} style={{ width: "28px", height: "28px", borderRadius: "8px", background: dayState[i].isWorkout ? "var(--c-accent-dim)" : "rgba(255,255,255,0.04)", border: `1px solid ${dayState[i].isWorkout ? "rgba(79,142,247,0.45)" : "var(--c-border)"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s var(--ease-spring)", boxShadow: dayState[i].isWorkout ? "0 0 10px rgba(79,142,247,0.3)" : "none" }}>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "10px", letterSpacing: "0.03em", color: dayState[i].isWorkout ? "#93c5fd" : "var(--c-dim)", transition: "color 0.25s" }}>{DAY_SHORT[i].slice(0, 2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                <button onClick={handleClose} style={{ all: "unset", width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--c-border-hi)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-muted)", cursor: "pointer", touchAction: "manipulation" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
                <div style={{ padding: "4px 10px", borderRadius: "20px", background: workoutCount > 0 ? "rgba(79,142,247,0.12)" : "rgba(255,255,255,0.04)", border: workoutCount > 0 ? "1px solid rgba(79,142,247,0.28)" : "1px solid var(--c-border)", fontSize: "10px", fontWeight: 700, color: workoutCount > 0 ? "#60a5fa" : "var(--c-muted)", transition: "all 0.28s", whiteSpace: "nowrap" }}>
                  {workoutCount === 0 ? "0 active" : `${workoutCount}/7 days`}
                </div>
              </div>
            </div>
          </div>
          <div className="ws-scroll" style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {loadState === "loading" ? DAYS.map((_, i) => (
              <div key={i} style={{ height: "62px", borderRadius: "var(--r-md)", background: "rgba(255,255,255,0.03)", border: "1px solid var(--c-border)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent 30%,rgba(255,255,255,0.04) 50%,transparent 70%)", animation: "shimmer 1.4s ease-in-out infinite" }} />
              </div>
            )) : DAYS.map((_, i) => (
              <DayCard key={i} dayIndex={i} isWorkout={dayState[i].isWorkout} muscles={dayState[i].muscles} onToggle={() => toggleDay(i)} onMuscleToggle={mg => toggleMuscle(i, mg)} onOpenPicker={() => setPickerDay(i)} />
            ))}
            <div style={{ height: "4px" }} />
          </div>
          <div style={{ padding: "13px 16px 28px", borderTop: "1px solid var(--c-border)", flexShrink: 0 }}>
            <button onClick={handleSave} disabled={saving || saved} className={!saving && !saved ? "press-scale" : ""} style={{ all: "unset", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "15px", borderRadius: "var(--r-md)", background: saved ? "linear-gradient(135deg,#16a34a,#166534)" : saving ? "rgba(79,142,247,0.25)" : "linear-gradient(135deg,#4f8ef7,#1d4ed8)", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: saving || saved ? "default" : "pointer", boxSizing: "border-box", transition: "background 0.3s, box-shadow 0.3s", boxShadow: saved ? "0 0 24px rgba(22,163,74,0.4)" : !saving ? "0 0 28px rgba(79,142,247,0.3)" : "none", touchAction: "manipulation", animation: saved ? "successBounce 0.4s var(--ease-spring)" : "none" }}>
              {saved ? (<><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>Split Saved!</>) : saving ? (<><div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Saving…</>) : "Save Workout Split"}
            </button>
          </div>
        </div>
      </div>
      {pickerDay !== null && <MusclePicker dayLabel={DAYS[pickerDay]} selected={dayState[pickerDay].muscles} onToggle={mg => toggleMuscle(pickerDay, mg)} onClose={() => setPickerDay(null)} />}
    </>
  );
};

/* ═══════════════════════════════════════════════════════════
   EXERCISE PICKER
═══════════════════════════════════════════════════════════ */
const ExercisePicker = ({ muscle, selected, onToggle, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");
  const exercises = EXERCISES[muscle.id] || [];
  const filtered = query.trim() ? exercises.filter(e => e.name.toLowerCase().includes(query.toLowerCase())) : exercises;

  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t); }, []);
  const close = useCallback(() => { setVisible(false); setTimeout(onClose, 300); }, [onClose]);

  return (
    <>
      <SheetOverlay visible={visible} onClose={close} zIndex={298} />
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 299, display: "flex", justifyContent: "center", transform: visible ? "translateY(0)" : "translateY(100%)", transition: "transform 0.32s var(--ease-out)", pointerEvents: visible ? "auto" : "none" }}>
        <div style={{ width: "100%", maxWidth: "430px", background: "#0b1525", borderRadius: "24px 24px 0 0", border: "1px solid rgba(79,142,247,0.18)", borderBottom: "none", boxShadow: "0 -20px 80px rgba(0,0,0,0.9)", display: "flex", flexDirection: "column", maxHeight: "74dvh" }}>
          <div style={{ height: "1px", background: `linear-gradient(90deg,transparent,${muscle.color}70,transparent)`, flexShrink: 0 }} />
          <div style={{ padding: "14px 18px 12px", flexShrink: 0 }}>
            <SheetHandle />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "var(--r-sm)", flexShrink: 0, background: `${muscle.color}18`, border: `1px solid ${muscle.color}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>{muscle.emoji}</div>
                <div>
                  <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: muscle.color, marginBottom: "3px" }}>Select exercises</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", letterSpacing: "0.03em", color: "#fff" }}>{muscle.label}</div>
                </div>
              </div>
              <button onClick={close} style={{ all: "unset", width: "30px", height: "30px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--c-border-hi)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-muted)", cursor: "pointer", touchAction: "manipulation" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <div style={{ padding: "0 18px 10px", flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "var(--c-muted)", pointerEvents: "none" }}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search exercises…" style={{ all: "unset", width: "100%", padding: "9px 12px 9px 32px", borderRadius: "var(--r-sm)", fontSize: "12px", fontFamily: "var(--font-body)", background: "rgba(255,255,255,0.05)", border: "1px solid var(--c-border-hi)", color: "#e2e8f0", boxSizing: "border-box", transition: "border 0.2s" }} />
            </div>
          </div>
          <div style={{ height: "1px", background: "var(--c-border)", flexShrink: 0, margin: "0 18px" }} />
          <div className="ws-scroll" style={{ overflowY: "auto", padding: "6px 18px 28px" }}>
            {filtered.length === 0 && <div style={{ padding: "24px 0", textAlign: "center", fontSize: "13px", color: "var(--c-muted)" }}>No exercises found</div>}
            {filtered.map((ex, idx) => {
              const isSel = selected.includes(ex.id);
              return (
                <button key={ex.id} onClick={e => { e.stopPropagation(); onToggle(ex.id); }} style={{ all: "unset", display: "flex", alignItems: "center", gap: "12px", width: "100%", boxSizing: "border-box", padding: "11px 2px", borderBottom: idx < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", cursor: "pointer", touchAction: "manipulation", transition: "opacity 0.12s" }}>
                  <CheckCircle checked={isSel} color={muscle.color} />
                  <span style={{ flex: 1, fontSize: "13px", fontWeight: isSel ? 600 : 400, color: isSel ? "#e2e8f0" : "#5d7288", transition: "color 0.15s, font-weight 0.15s" }}>{ex.name}</span>
                  <Tag label={ex.tag} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════
   PLAN EXERCISE MODAL COMPONENTS
═══════════════════════════════════════════════════════════ */
const ExerciseRow = ({ ex, muscle, onRemove }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "10px", background: `${muscle.color}0d`, border: `1px solid ${muscle.color}22`, animation: "chipPop 0.22s var(--ease-spring)" }}>
    <div style={{ width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0, background: muscle.color, opacity: 0.7 }} />
    <span style={{ flex: 1, fontSize: "12px", fontWeight: 600, color: "#d1d9e8", letterSpacing: "-0.01em" }}>{ex.name}</span>
    <Tag label={ex.tag} />
    <button onClick={e => { e.stopPropagation(); onRemove(); }} style={{ all: "unset", width: "20px", height: "20px", borderRadius: "6px", flexShrink: 0, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.3)", touchAction: "manipulation", transition: "all 0.15s" }}>
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
    </button>
  </div>
);

const MuscleExerciseCard = ({ muscle, selected, onOpenPicker, onRemoveExercise }) => {
  const [expanded, setExpanded] = useState(false);
  const count = selected.length;
  const hasEx = count > 0;
  const prevCount = React.useRef(0);
  useEffect(() => { if (count > 0 && prevCount.current === 0) setExpanded(true); prevCount.current = count; }, [count]);
  useEffect(() => { if (count === 0) setExpanded(false); }, [count]);

  return (
    <div style={{ background: hasEx ? `${muscle.color}07` : "rgba(255,255,255,0.022)", border: `1px solid ${hasEx ? muscle.color + "28" : "var(--c-border)"}`, borderRadius: "var(--r-md)", transition: "border 0.3s, background 0.3s, box-shadow 0.3s", boxShadow: hasEx && expanded ? `0 4px 32px ${muscle.color}12` : "none", position: "relative" }}>
      {hasEx && <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "1px", borderRadius: "0 0 2px 2px", background: `linear-gradient(90deg,transparent,${muscle.color}50,transparent)`, pointerEvents: "none" }} />}
      <div style={{ display: "flex", alignItems: "center", gap: "11px", padding: "13px 14px" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "13px", flexShrink: 0, background: hasEx ? `${muscle.color}1e` : `${muscle.color}0d`, border: `1px solid ${hasEx ? muscle.color + "42" : muscle.color + "16"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "21px", transition: "all 0.3s", boxShadow: hasEx ? `0 0 14px ${muscle.color}20` : "none" }}>{muscle.emoji}</div>
        <button onClick={e => { e.stopPropagation(); if (hasEx) setExpanded(v => !v); }} style={{ all: "unset", flex: 1, cursor: hasEx ? "pointer" : "default", touchAction: "manipulation", minWidth: 0 }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: hasEx ? "#eaf0fb" : "var(--c-muted)", marginBottom: "3px", transition: "color 0.3s" }}>{muscle.label}</div>
          <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: hasEx ? muscle.color : "var(--c-dim)", transition: "color 0.3s" }}>{hasEx ? `${count} exercise${count > 1 ? "s" : ""} · tap to ${expanded ? "hide" : "view"}` : "No exercises yet"}</div>
        </button>
        {hasEx && <div style={{ minWidth: "24px", height: "24px", borderRadius: "12px", padding: "0 7px", background: `${muscle.color}22`, border: `1px solid ${muscle.color}48`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, color: muscle.color, flexShrink: 0 }}>{count}</div>}
        <button onClick={e => { e.stopPropagation(); onOpenPicker(); }} className="press-scale" style={{ all: "unset", width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0, background: hasEx ? `${muscle.color}18` : "rgba(255,255,255,0.05)", border: `1px solid ${hasEx ? muscle.color + "3a" : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: hasEx ? muscle.color : "var(--c-muted)", cursor: "pointer", touchAction: "manipulation", transition: "all 0.2s" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </button>
        {hasEx && <button onClick={e => { e.stopPropagation(); setExpanded(v => !v); }} style={{ all: "unset", width: "26px", height: "26px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: expanded ? "#60a5fa" : "var(--c-muted)", cursor: "pointer", touchAction: "manipulation", transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.26s var(--ease-spring), color 0.2s" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
        </button>}
      </div>
      {expanded && hasEx && (
        <div style={{ borderTop: `1px solid ${muscle.color}18`, margin: "0 14px", paddingTop: "10px", paddingBottom: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: `${muscle.color}70`, marginBottom: "4px", paddingLeft: "2px" }}>Selected · {count}</div>
          {selected.map(exId => { const ex = (EXERCISES[muscle.id] || []).find(e => e.id === exId); if (!ex) return null; return <ExerciseRow key={exId} ex={ex} muscle={muscle} onRemove={() => onRemoveExercise(exId)} />; })}
          <button onClick={e => { e.stopPropagation(); onOpenPicker(); }} className="press-scale" style={{ all: "unset", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "8px 12px", borderRadius: "10px", marginTop: "2px", cursor: "pointer", border: `1px dashed ${muscle.color}30`, color: `${muscle.color}80`, fontSize: "11px", fontWeight: 600, touchAction: "manipulation", transition: "all 0.18s", boxSizing: "border-box" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            Add more exercises
          </button>
        </div>
      )}
    </div>
  );
};

const PlanExerciseModal = ({ onClose }) => {
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadState, setLoadState] = useState("loading");
  const [pickerMuscle, setPickerMuscle] = useState(null);
  const [selections, setSelections] = useState({});

  useEffect(() => { const t = setTimeout(() => setVisible(true), 20); return () => clearTimeout(t); }, []);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/workout/exercises").then(r => r.json()).then(data => { if (cancelled) return; if (data.selections) setSelections(data.selections); setLoadState("ready"); }).catch(() => { if (!cancelled) setLoadState("ready"); });
    return () => { cancelled = true; };
  }, []);

  const handleClose = useCallback(() => { setVisible(false); setTimeout(onClose, 330); }, [onClose]);
  const toggleExercise = (muscleId, exId) => setSelections(prev => { const cur = prev[muscleId] || []; return { ...prev, [muscleId]: cur.includes(exId) ? cur.filter(e => e !== exId) : [...cur, exId] }; });
  const removeExercise = (muscleId, exId) => setSelections(prev => ({ ...prev, [muscleId]: (prev[muscleId] || []).filter(e => e !== exId) }));
  const total = Object.values(selections).reduce((s, a) => s + a.length, 0);
  const musclesWithEx = Object.values(selections).filter(a => a.length > 0).length;

  const handleSave = async () => {
    if (total === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/workout/exercises", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ selections }) });
      if (!res.ok) throw new Error("save failed");
      setSaving(false); setSaved(true); setTimeout(handleClose, 1500);
    } catch { setSaving(false); }
  };

  return (
    <>
      <div onClick={handleClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }} />
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 51, display: "flex", justifyContent: "center", transform: visible ? "translateY(0)" : "translateY(100%)", transition: "transform 0.38s var(--ease-out)" }}>
        <div style={{ width: "100%", maxWidth: "430px", background: "#06080f", borderRadius: "26px 26px 0 0", border: "1px solid rgba(79,142,247,0.14)", borderBottom: "none", display: "flex", flexDirection: "column", maxHeight: "92dvh", overflow: "hidden", boxShadow: "0 -24px 100px rgba(0,0,0,0.9)", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: "1px", background: "linear-gradient(90deg,transparent,rgba(79,142,247,0.55),transparent)", pointerEvents: "none" }} />
          <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--c-border)", flexShrink: 0 }}>
            <SheetHandle />
            <div style={{ display: "flex", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--c-accent)", marginBottom: "5px" }}>Exercise Library</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "32px", letterSpacing: "0.04em", color: "#fff", lineHeight: 1, marginBottom: "10px" }}>Plan Exercise</div>
                <div style={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "20px", background: total > 0 ? "rgba(79,142,247,0.12)" : "rgba(255,255,255,0.04)", border: total > 0 ? "1px solid rgba(79,142,247,0.28)" : "1px solid var(--c-border)", transition: "all 0.28s" }}>
                    <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: total > 0 ? "var(--c-accent)" : "var(--c-dim)", transition: "background 0.28s" }} />
                    <span style={{ fontSize: "10px", fontWeight: 700, color: total > 0 ? "#60a5fa" : "var(--c-muted)", transition: "color 0.28s" }}>{total === 0 ? "No exercises added" : `${total} exercise${total > 1 ? "s" : ""} across ${musclesWithEx} muscle${musclesWithEx > 1 ? "s" : ""}`}</span>
                  </div>
                </div>
              </div>
              <button onClick={handleClose} style={{ all: "unset", width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--c-border-hi)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-muted)", cursor: "pointer", flexShrink: 0, marginTop: "2px", touchAction: "manipulation" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <div className="ws-scroll" style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "9px" }}>
            {loadState === "loading" ? EX_MUSCLES.map(m => (
              <div key={m.id} style={{ height: "72px", borderRadius: "var(--r-md)", background: "rgba(255,255,255,0.03)", border: "1px solid var(--c-border)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent 30%,rgba(255,255,255,0.04) 50%,transparent 70%)", animation: "shimmer 1.4s ease-in-out infinite" }} />
              </div>
            )) : EX_MUSCLES.map(muscle => (
              <MuscleExerciseCard key={muscle.id} muscle={muscle} selected={selections[muscle.id] || []} onOpenPicker={() => setPickerMuscle(muscle)} onRemoveExercise={exId => removeExercise(muscle.id, exId)} />
            ))}
            <div style={{ height: "4px" }} />
          </div>
          <div style={{ padding: "13px 16px 28px", borderTop: "1px solid var(--c-border)", flexShrink: 0 }}>
            <button onClick={handleSave} disabled={saving || saved || total === 0} className={total > 0 && !saving && !saved ? "press-scale" : ""} style={{ all: "unset", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "15px", borderRadius: "var(--r-md)", boxSizing: "border-box", background: saved ? "linear-gradient(135deg,#16a34a,#166534)" : total === 0 ? "rgba(255,255,255,0.04)" : saving ? "rgba(79,142,247,0.25)" : "linear-gradient(135deg,#4f8ef7,#1d4ed8)", border: total === 0 ? "1px solid var(--c-border)" : "1px solid transparent", color: total === 0 ? "var(--c-muted)" : "#fff", fontSize: "14px", fontWeight: 700, cursor: saving || saved || total === 0 ? "default" : "pointer", transition: "background 0.3s, box-shadow 0.3s, color 0.3s", boxShadow: saved ? "0 0 24px rgba(22,163,74,0.4)" : total > 0 && !saving ? "0 0 28px rgba(79,142,247,0.3)" : "none", touchAction: "manipulation", animation: saved ? "successBounce 0.4s var(--ease-spring)" : "none" }}>
              {saved ? (<><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>Exercises Saved!</>) : saving ? (<><div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Saving…</>) : total === 0 ? "Select exercises to save" : `Save ${total} Exercise${total > 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      </div>
      {pickerMuscle && <ExercisePicker muscle={pickerMuscle} selected={selections[pickerMuscle.id] || []} onToggle={exId => toggleExercise(pickerMuscle.id, exId)} onClose={() => setPickerMuscle(null)} />}
    </>
  );
};

/* ═══════════════════════════════════════════════════════════
   BEST WORKOUT PLANS MODAL — PREMIUM
═══════════════════════════════════════════════════════════ */

const PlanDayPill = ({ day, label, color, isRest }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: "7px",
    padding: "6px 10px", borderRadius: "8px",
    background: isRest ? "rgba(255,255,255,0.03)" : `${color}10`,
    border: `1px solid ${isRest ? "rgba(255,255,255,0.06)" : color + "28"}`,
  }}>
    <div style={{
      fontFamily: "var(--font-display)", fontSize: "10px", letterSpacing: "0.06em",
      color: isRest ? "var(--c-dim)" : color, flexShrink: 0, minWidth: "24px",
    }}>{day}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: "11px", fontWeight: 600, color: isRest ? "var(--c-dim)" : "#d1dce8", lineHeight: 1.2, letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
    </div>
  </div>
);

const WorkoutRow = ({ exercise, idx }) => (
  <div style={{
    display: "flex", alignItems: "flex-start", gap: "14px",
    padding: "12px 0",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    animation: `exRowSlide 0.28s ease ${idx * 40}ms both`,
  }}>
    <div style={{
      width: "26px", height: "26px", borderRadius: "8px", flexShrink: 0,
      background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.01))",
      border: "1px solid rgba(255,255,255,0.06)",
      borderTop: "1px solid rgba(255,255,255,0.15)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 6px rgba(0,0,0,0.2)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "11px", fontWeight: 800, color: "#cbd5e1", fontFamily: "var(--font-display)",
      letterSpacing: "0.04em",
    }}>{String(idx + 1).padStart(2, "0")}</div>
    <div style={{ flex: 1, minWidth: 0, paddingTop: "1px" }}>
      <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", marginBottom: "4px", lineHeight: 1.2 }}>{exercise.name}</div>
      <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>{exercise.note}</div>
    </div>
    <div style={{
      flexShrink: 0, fontSize: "12px", fontWeight: 700, letterSpacing: "0.02em",
      color: "#94a3b8", whiteSpace: "nowrap", paddingTop: "2px",
    }}>{exercise.sets}</div>
  </div>
);

const WorkoutSectionCard = ({ workout, accent }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      border: "1px solid rgba(148,163,184,0.08)", borderTop: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "16px", background: "#0a0c10", marginBottom: "8px", overflow: "hidden",
      boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
    }}>
      <button onClick={() => setOpen(v => !v)} style={{
        all: "unset", display: "flex", alignItems: "center", gap: "12px",
        width: "100%", padding: "14px 16px", cursor: "pointer", boxSizing: "border-box",
        touchAction: "manipulation",
      }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: accent, flexShrink: 0, boxShadow: `0 0 10px ${accent}80` }} />
        <div style={{ flex: 1, fontSize: "13px", fontWeight: 700, color: "#f8fafc", letterSpacing: "-0.01em" }}>{workout.label}</div>
        <div style={{ fontSize: "11px", color: "var(--c-muted)", fontWeight: 600, marginRight: "4px" }}>{workout.exercises.length} ex</div>
        <div style={{ color: open ? accent : "var(--c-muted)", transition: "transform 0.22s var(--ease-spring), color 0.18s", transform: open ? "rotate(90deg)" : "rotate(0deg)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
        </div>
      </button>
      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          {workout.exercises.map((ex, i) => <WorkoutRow key={i} exercise={ex} idx={i} />)}
        </div>
      )}
    </div>
  );
};

const PlanDetailCTA = ({ plan, onClose }) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  const handleUsePlan = useCallback(async () => {
    if (saving || saved) return;
    setSaving(true);
    setError(false);
    try {
      const days = plan.schedule.map(s => ({
        label: s.label,
        muscles: s.muscles ? s.muscles.split(" · ").map(m => ({ id: m.toLowerCase().replace(/[^a-z]/g, "_"), label: m, color: s.color, emoji: "" })) : [],
      }));

      const selections = {};
      plan.workouts.forEach(w => {
        const key = w.label.toLowerCase().replace(/[^a-z0-9]/g, "_");
        selections[key] = w.exercises.map(ex => ex.name);
      });

      const [splitRes, exRes] = await Promise.all([
        fetch("/api/workout/split", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ days }) }),
        fetch("/api/workout/exercises", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ selections }) }),
      ]);

      if (!splitRes.ok || !exRes.ok) throw new Error("save failed");

      setSaving(false);
      setSaved(true);
      setTimeout(onClose, 1600);
    } catch {
      setSaving(false);
      setError(true);
      setTimeout(() => setError(false), 2500);
    }
  }, [plan, saving, saved, onClose]);

  return (
    <div style={{ padding: "12px 16px 28px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
      <button
        onClick={handleUsePlan}
        disabled={saving || saved}
        className={!saving && !saved ? "press-scale" : ""}
        style={{
          all: "unset", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          width: "100%", padding: "15px", borderRadius: "var(--r-md)", boxSizing: "border-box",
          background: saved
            ? "linear-gradient(135deg,#16a34a,#166534)"
            : error
              ? "linear-gradient(135deg,#7f1d1d,#450a0a)"
              : saving
                ? `${plan.accent}55`
                : `linear-gradient(135deg, ${plan.accent}cc, ${plan.accent}88)`,
          color: "#fff", fontSize: "14px", fontWeight: 700, letterSpacing: "-0.01em",
          cursor: saving || saved ? "default" : "pointer", touchAction: "manipulation",
          boxShadow: saved
            ? "0 0 28px rgba(22,163,74,0.4)"
            : error
              ? "0 0 20px rgba(239,68,68,0.3)"
              : `0 0 28px ${plan.accent}40`,
          transition: "background 0.3s, box-shadow 0.3s",
          animation: saved ? "successBounce 0.4s var(--ease-spring)" : "none",
        }}
      >
        {saved ? (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
            Plan Saved!
          </>
        ) : saving ? (
          <>
            <div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            Saving…
          </>
        ) : error ? (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
            Sign in to save
          </>
        ) : (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
            Use This Plan
          </>
        )}
      </button>
    </div>
  );
};


const PlanDetailCard = ({ plan, onClose }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t); }, []);
  const close = useCallback(() => { setVisible(false); setTimeout(onClose, 300); }, [onClose]);

  return (
    <>
      <SheetOverlay visible={visible} onClose={close} zIndex={308} />
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 309,
        display: "flex", justifyContent: "center",
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.34s var(--ease-out)",
        pointerEvents: visible ? "auto" : "none",
      }}>
        <div style={{
          width: "100%", maxWidth: "430px",
          background: "#07090f",
          borderRadius: "26px 26px 0 0",
          border: `1px solid ${plan.borderColor}`, borderBottom: "none",
          display: "flex", flexDirection: "column",
          maxHeight: "92dvh", overflow: "hidden",
          boxShadow: `0 -28px 80px rgba(0,0,0,0.95), 0 -2px 40px ${plan.accent}18`,
          position: "relative",
        }}>
          {/* gradient accent at top */}
          <div style={{ height: "1px", background: `linear-gradient(90deg,transparent,${plan.accent}80,transparent)`, flexShrink: 0 }} />

          {/* HEADER */}
          <div style={{ padding: "18px 18px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0, position: "relative" }}>
            <SheetHandle />
            {/* gradient bg */}
            <div style={{ position: "absolute", inset: 0, background: plan.gradient, opacity: 0.35, pointerEvents: "none", borderRadius: "26px 26px 0 0" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{
                  width: "52px", height: "52px", borderRadius: "16px", flexShrink: 0,
                  background: `${plan.accent}18`, border: `1.5px solid ${plan.accent}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "24px", boxShadow: `0 0 24px ${plan.accent}25`,
                }}>{plan.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "4px" }}>
                    <span style={{
                      fontSize: "8px", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase",
                      padding: "2px 8px", borderRadius: "20px",
                      background: `${plan.badgeColor}20`, border: `1px solid ${plan.badgeColor}45`, color: plan.badgeColor,
                    }}>{plan.badge}</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", letterSpacing: "0.04em", color: "#fff", lineHeight: 1, marginBottom: "4px" }}>{plan.name}</div>
                  <div style={{ fontSize: "11px", color: plan.accent, fontWeight: 600, letterSpacing: "0.02em" }}>{plan.tagline}</div>
                </div>
                <button onClick={close} style={{ all: "unset", width: "30px", height: "30px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-muted)", cursor: "pointer", flexShrink: 0, touchAction: "manipulation" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
              {/* stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", marginTop: "16px" }}>
                {[
                  { label: "Days/wk", value: `${plan.days}` },
                  { label: "Level", value: plan.level.split("–")[0] },
                  { label: "Freq", value: plan.freq.replace("per muscle", "").trim() },
                  { label: "Goal", value: plan.goal.split(" · ")[0] },
                ].map((s, i) => (
                  <div key={i} style={{
                    padding: "10px 4px", borderRadius: "12px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(148,163,184,0.08)",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
                  }}>
                    <div style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: `${plan.accent}90` }}>{s.label}</div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#f8fafc", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SCROLLABLE CONTENT */}
          <div className="ws-scroll" style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>

            {/* Weekly Schedule */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: plan.accent, marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="3" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                Weekly Schedule
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
                {plan.schedule.map((s, i) => (
                  <PlanDayPill key={i} day={s.day} label={s.label} color={s.color} isRest={s.label === "Rest"} />
                ))}
              </div>
            </div>

            {/* Key Workouts */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: plan.accent, marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="9" width="2" height="6" rx="1" /><rect x="20" y="9" width="2" height="6" rx="1" /><rect x="5" y="7" width="2" height="10" rx="1" /><rect x="17" y="7" width="2" height="10" rx="1" /><line x1="7" y1="12" x2="17" y2="12" /></svg>
                Key Workouts
              </div>
              {plan.workouts.map((w, i) => (
                <WorkoutSectionCard key={i} workout={w} accent={w.color} />
              ))}
            </div>

            {/* Volume & Recovery */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: plan.accent, marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                Volume & Science
              </div>
              <div style={{ padding: "16px", borderRadius: "16px", background: "#0a0c10", border: "1px solid rgba(148,163,184,0.08)", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
                {[
                  { label: "Weekly Volume", val: plan.volume, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="18" y="3" width="4" height="18" /><rect x="10" y="8" width="4" height="13" /><rect x="2" y="13" width="4" height="8" /></svg> },
                  { label: "Frequency", val: plan.freq, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 2l4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" /></svg> },
                  { label: "Rest Days", val: plan.rest, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg> },
                  { label: "Best For", val: plan.goal, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg> },
                  { label: "Level", val: plan.level, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg> },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "6px", background: "rgba(255,255,255,0.04)", color: plan.accent, flexShrink: 0 }}>
                      {r.icon}
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--c-muted)", fontWeight: 500, flex: 1 }}>{r.label}</span>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#e2e8f0" }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Science Note */}
            <div style={{ padding: "16px", borderRadius: "16px", background: "#0a0c10", border: "1px solid rgba(148,163,184,0.08)", borderTop: "1px solid rgba(255,255,255,0.06)", marginBottom: "16px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--c-muted)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
                Evidence-Based Note
              </div>
              <div style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 400, lineHeight: 1.6 }}>{plan.scienceNote}</div>
            </div>

            <div style={{ height: "8px" }} />
          </div>

          {/* CTA */}
          <PlanDetailCTA plan={plan} onClose={close} />
        </div>
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════
   PLAN CARD (in the list)
═══════════════════════════════════════════════════════════ */
const PlanCard = ({ plan, index, onSelect }) => {
  const dayDots = Array.from({ length: 7 }, (_, i) => {
    const sched = plan.schedule[i];
    const isRest = !sched || sched.label === "Rest";
    return { isRest, color: sched?.color || "#38506e" };
  });

  return (
    <div
      onClick={() => onSelect(plan)}
      className="plan-card-hover"
      style={{
        position: "relative", borderRadius: "18px", cursor: "pointer", overflow: "hidden",
        background: "#08090f",
        border: `1px solid ${plan.borderColor}`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
        animation: `planCardIn 0.45s var(--ease-out) ${index * 60}ms both`,
        flexShrink: 0,
      }}
    >
      {/* gradient bg */}
      <div style={{ position: "absolute", inset: 0, background: plan.gradient, opacity: 0.28, pointerEvents: "none" }} />
      {/* top accent line */}
      <div style={{ position: "absolute", top: 0, left: "12%", right: "12%", height: "1px", background: `linear-gradient(90deg,transparent,${plan.accent}70,transparent)`, pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, padding: "16px 16px 14px" }}>
        {/* TOP ROW */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "11px", marginBottom: "12px" }}>
          <div style={{
            width: "46px", height: "46px", borderRadius: "14px", flexShrink: 0,
            background: `${plan.accent}15`, border: `1.5px solid ${plan.accent}35`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "22px", boxShadow: `0 0 18px ${plan.accent}20`,
          }}>{plan.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px", flexWrap: "wrap" }}>
              <span style={{
                fontSize: "8px", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase",
                padding: "2px 7px", borderRadius: "20px",
                background: `${plan.badgeColor}1a`, border: `1px solid ${plan.badgeColor}40`,
                color: plan.badgeColor, flexShrink: 0,
              }}>{plan.badge}</span>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", letterSpacing: "0.04em", color: "#fff", lineHeight: 1, marginBottom: "2px" }}>{plan.name}</div>
            <div style={{ fontSize: "11px", color: plan.accent, fontWeight: 600, letterSpacing: "0.01em" }}>{plan.tagline}</div>
          </div>
          <div style={{ color: `${plan.accent}60`, flexShrink: 0, marginTop: "2px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
          </div>
        </div>

        {/* STATS CHIPS */}
        <div style={{ display: "flex", gap: "5px", marginBottom: "12px", flexWrap: "wrap" }}>
          {[
            { val: `${plan.days}d / wk` },
            { val: plan.level },
            { val: plan.freq },
          ].map((chip, i) => (
            <div key={i} style={{
              padding: "3px 9px", borderRadius: "20px",
              background: `${plan.accent}0d`, border: `1px solid ${plan.accent}22`,
              fontSize: "10px", fontWeight: 600, color: `${plan.accent}cc`,
              letterSpacing: "0.02em",
            }}>{chip.val}</div>
          ))}
        </div>

        {/* WEEK DOTS */}
        <div style={{ display: "flex", gap: "4px", alignItems: "center", marginBottom: "10px" }}>
          {dayDots.map((dot, i) => (
            <div key={i} style={{
              flex: 1, height: "4px", borderRadius: "2px",
              background: dot.isRest ? "rgba(255,255,255,0.06)" : `${dot.color}55`,
              boxShadow: dot.isRest ? "none" : `0 0 4px ${dot.color}40`,
              transition: "all 0.2s",
            }} />
          ))}
        </div>

        {/* GOAL ROW */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: plan.accent, flexShrink: 0 }} />
          <span style={{ fontSize: "10px", fontWeight: 500, color: "var(--c-muted)" }}>{plan.goal}</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: "10px", fontWeight: 600, color: plan.accent }}>View plan →</span>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   BEST WORKOUT PLANS MODAL
═══════════════════════════════════════════════════════════ */
const BestPlansModal = ({ onClose }) => {
  const [visible, setVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => { const t = setTimeout(() => setVisible(true), 20); return () => clearTimeout(t); }, []);
  const handleClose = useCallback(() => { setVisible(false); setTimeout(onClose, 330); }, [onClose]);

  const FILTERS = ["All", "3–4 Days", "5–6 Days", "Strength", "Hypertrophy"];
  const filtered = WORKOUT_PLANS.filter(p => {
    if (filter === "All") return true;
    if (filter === "3–4 Days") return p.days <= 4;
    if (filter === "5–6 Days") return p.days >= 5;
    if (filter === "Strength") return p.goal.toLowerCase().includes("strength");
    if (filter === "Hypertrophy") return p.goal.toLowerCase().includes("hypertrophy");
    return true;
  });

  return (
    <>
      <div onClick={handleClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }} />

      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 51, display: "flex", justifyContent: "center", transform: visible ? "translateY(0)" : "translateY(100%)", transition: "transform 0.4s var(--ease-out)" }}>
        <div style={{ width: "100%", maxWidth: "430px", background: "#05070d", borderRadius: "28px 28px 0 0", border: "1px solid rgba(91,155,255,0.16)", borderBottom: "none", display: "flex", flexDirection: "column", maxHeight: "94dvh", overflow: "hidden", boxShadow: "0 -32px 120px rgba(0,0,0,0.98), 0 -2px 60px rgba(91,155,255,0.08)", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "1px", background: "linear-gradient(90deg,transparent,rgba(91,155,255,0.7),transparent)", pointerEvents: "none" }} />

          {/* HEADER */}
          <div style={{ padding: "20px 20px 0", flexShrink: 0 }}>
            <SheetHandle />
            <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "6px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--c-accent)", marginBottom: "5px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "14px", height: "1.5px", background: "var(--c-accent)", borderRadius: "2px" }} />
                  Science-Based Splits
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "36px", letterSpacing: "0.04em", color: "#fff", lineHeight: 1, marginBottom: "6px" }}>
                  BEST PLANS
                </div>
                <div style={{ fontSize: "12px", color: "var(--c-muted)", fontWeight: 400, letterSpacing: "0.01em" }}>
                  2× weekly frequency · 10–20 sets/muscle · Evidence-backed
                </div>
              </div>
              <button onClick={handleClose} style={{ all: "unset", width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--c-border-hi)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-muted)", cursor: "pointer", flexShrink: 0, touchAction: "manipulation" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            {/* key stats bar */}
            <div style={{ display: "flex", gap: "0", margin: "12px 0", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
              {[
                { val: "7", label: "Programs", accent: "#5b9bff" },
                { val: "2×", label: "Frequency", accent: "#a78bfa" },
                { val: "100%", label: "Evidence", accent: "#22c55e" },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, padding: "9px 10px", background: `${s.accent}08`, borderRight: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "18px", letterSpacing: "0.04em", color: s.accent, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--c-dim)", marginTop: "2px" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* FILTER PILLS */}
            <div style={{ display: "flex", gap: "5px", paddingBottom: "14px", overflowX: "auto", borderBottom: "1px solid var(--c-border)" }}>
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  all: "unset", padding: "5px 13px", borderRadius: "20px", flexShrink: 0,
                  fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em", cursor: "pointer",
                  background: filter === f ? "rgba(91,155,255,0.18)" : "rgba(255,255,255,0.04)",
                  border: filter === f ? "1px solid rgba(91,155,255,0.45)" : "1px solid var(--c-border)",
                  color: filter === f ? "#93c5fd" : "var(--c-muted)",
                  transition: "all 0.18s",
                  boxShadow: filter === f ? "0 0 12px rgba(91,155,255,0.2)" : "none",
                  touchAction: "manipulation",
                }}>{f}</button>
              ))}
            </div>
          </div>

          {/* PLAN LIST */}
          <div className="ws-scroll" style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {filtered.map((plan, i) => (
              <PlanCard key={plan.id} plan={plan} index={i} onSelect={setSelectedPlan} />
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--c-muted)", fontSize: "13px" }}>No plans match this filter</div>
            )}
            <div style={{ height: "8px" }} />
          </div>
        </div>
      </div>

      {/* PLAN DETAIL CARD */}
      {selectedPlan && <PlanDetailCard plan={selectedPlan} onClose={() => setSelectedPlan(null)} />}
    </>
  );
};

/* ═══════════════════════════════════════════════════════════
   ACTION CARD
═══════════════════════════════════════════════════════════ */
const ActionCard = ({ icon, title, subtitle, delay, mounted, onClick, premium }) => (
  <button
    onClick={onClick}
    className="press-scale"
    style={{
      all: "unset", display: "flex", alignItems: "center", gap: "14px",
      background: premium ? "rgba(91,155,255,0.07)" : "rgba(255,255,255,0.04)",
      border: premium ? "1px solid rgba(91,155,255,0.32)" : "1px solid rgba(79,142,247,0.22)",
      borderRadius: "var(--r-md)", padding: "16px 14px",
      cursor: "pointer", width: "100%", boxSizing: "border-box",
      opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(12px)",
      transition: `opacity 0.5s ease ${delay}ms, transform 0.5s var(--ease-spring) ${delay}ms`,
      position: "relative", overflow: "hidden",
      touchAction: "manipulation",
    }}
  >
    <div style={{ position: "absolute", top: 0, left: "12%", right: "12%", height: "1px", background: premium ? "linear-gradient(90deg,transparent,rgba(91,155,255,0.55),transparent)" : "linear-gradient(90deg,transparent,rgba(79,142,247,0.35),transparent)" }} />
    {premium && (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(105deg,transparent 40%,rgba(91,155,255,0.04) 50%,transparent 60%)", animation: "shimmer 3.5s ease-in-out infinite", pointerEvents: "none" }} />
    )}
    <div style={{
      width: "46px", height: "46px", borderRadius: "13px", flexShrink: 0,
      background: premium ? "rgba(91,155,255,0.15)" : "rgba(79,142,247,0.10)",
      border: premium ? "1px solid rgba(91,155,255,0.35)" : "1px solid rgba(79,142,247,0.22)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#60a5fa",
      boxShadow: premium ? "0 0 18px rgba(91,155,255,0.2)" : "none",
    }}>{icon}</div>
    <div style={{ flex: 1, textAlign: "left" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "3px" }}>
        <div style={{ fontSize: "14px", fontWeight: 600, color: premium ? "#e8eeff" : "#f1f5f9", letterSpacing: "-0.01em" }}>{title}</div>
        {premium && (
          <span style={{ fontSize: "7.5px", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", padding: "2px 6px", borderRadius: "20px", background: "rgba(91,155,255,0.18)", border: "1px solid rgba(91,155,255,0.35)", color: "#93c5fd", flexShrink: 0 }}>PRO</span>
        )}
      </div>
      <div style={{ fontSize: "12px", color: "var(--c-muted)", fontWeight: 400 }}>{subtitle}</div>
    </div>
    <div style={{ color: "rgba(79,142,247,0.55)", flexShrink: 0 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
    </div>
  </button>
);

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function WorkoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [splitOpen, setSplitOpen] = useState(false);
  const [exerciseOpen, setExerciseOpen] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  const [ctaDown, setCtaDown] = useState(false);
  const [isKaiOpen, setIsKaiOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsKaiOpen(true);
    window.addEventListener("twin:open-kai", handler);
    return () => window.removeEventListener("twin:open-kai", handler);
  }, []);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 40); return () => clearTimeout(t); }, []);

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <div className="workout-page" style={{ height: "100dvh", width: "100%", background: "var(--c-bg)", fontFamily: "var(--font-body)", color: "var(--c-text)", display: "flex", justifyContent: "center", overflow: "hidden", position: "relative" }}>
        {/* ambient blobs */}
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "320px", height: "320px", borderRadius: "50%", background: "radial-gradient(circle,rgba(79,142,247,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "100px", left: "-60px", width: "240px", height: "240px", borderRadius: "50%", background: "radial-gradient(circle,rgba(168,85,247,0.05) 0%,transparent 70%)", pointerEvents: "none" }} />
        {/* subtle grid texture */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(79,142,247,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.03) 1px,transparent 1px)", backgroundSize: "48px 48px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 40%,transparent 100%)", WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 40%,transparent 100%)" }} />

        <div style={{ width: "100%", maxWidth: "430px", height: "100dvh", display: "flex", flexDirection: "column", padding: "48px 22px 100px", position: "relative", zIndex: 1 }}>
          {/* HEADER */}
          <div style={{ marginBottom: "28px", opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(14px)", transition: "opacity 0.5s ease 60ms, transform 0.55s var(--ease-out) 60ms" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <div style={{ width: "18px", height: "1.5px", background: "var(--c-accent)", borderRadius: "2px" }} />
              <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--c-accent)" }}>Training</span>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "52px", letterSpacing: "0.04em", color: "#fff", lineHeight: 1, marginBottom: "6px" }}>WORKOUT</div>
            <p style={{ fontSize: "13px", color: "var(--c-muted)", fontWeight: 400, letterSpacing: "0.01em" }}>Build your perfect routine</p>
          </div>

          {/* SECTION LABEL */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "11px", opacity: mounted ? 1 : 0, transition: "opacity 0.4s ease 160ms" }}>
            <span style={{ fontSize: "9px", fontWeight: 700, color: "var(--c-dim)", letterSpacing: "0.16em", textTransform: "uppercase", whiteSpace: "nowrap" }}>Preparation</span>
            <div style={{ flex: 1, height: "1px", background: "var(--c-border)" }} />
          </div>

          {/* ACTION CARDS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
            <ActionCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="3" /><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01" /></svg>}
              title="Plan Workout Split"
              subtitle="Set your weekly training schedule"
              delay={200} mounted={mounted}
              onClick={() => setSplitOpen(true)}
            />
            <ActionCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="9" width="2" height="6" rx="1" /><rect x="20" y="9" width="2" height="6" rx="1" /><rect x="5" y="7" width="2" height="10" rx="1" /><rect x="17" y="7" width="2" height="10" rx="1" /><line x1="7" y1="12" x2="17" y2="12" /></svg>}
              title="Plan Exercise"
              subtitle="Select movements for each muscle"
              delay={290} mounted={mounted}
              onClick={() => setExerciseOpen(true)}
            />
            {/* NEW: BEST WORKOUT PLANS */}
            <ActionCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              }
              title="Best Workout Plans"
              subtitle="7 science-backed splits with full exercise breakdowns"
              delay={375} mounted={mounted}
              onClick={() => setPlansOpen(true)}
              premium
            />
          </div>

          <div style={{ flex: 1 }} />

          {/* CTA */}
          <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(18px)", transition: "opacity 0.6s ease 480ms, transform 0.6s var(--ease-out) 480ms" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ flex: 1, height: "1px", background: "var(--c-border)" }} />
              <span style={{ fontSize: "9px", color: "var(--c-dim)", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600 }}>or jump in</span>
              <div style={{ flex: 1, height: "1px", background: "var(--c-border)" }} />
            </div>
            <button
              onClick={() => router.push("/workout-record")}
              onMouseDown={() => setCtaDown(true)} onMouseUp={() => setCtaDown(false)}
              onMouseLeave={() => setCtaDown(false)} onTouchStart={() => setCtaDown(true)} onTouchEnd={() => setCtaDown(false)}
              style={{ all: "unset", display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", boxSizing: "border-box", background: "rgba(79,142,247,0.13)", border: "1px solid rgba(79,142,247,0.32)", borderRadius: "var(--r-xl)", padding: "20px 20px 20px 24px", cursor: "pointer", overflow: "hidden", position: "relative", transform: ctaDown ? "scale(0.97)" : "scale(1)", transition: "transform 0.15s var(--ease-spring)", boxShadow: "0 0 40px rgba(79,142,247,0.10)", touchAction: "manipulation" }}
            >
              <div style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: "1px", background: "linear-gradient(90deg,transparent,rgba(79,142,247,0.6),transparent)" }} />
              <div style={{ position: "absolute", top: 0, left: "-100%", width: "100%", height: "100%", background: "linear-gradient(105deg,transparent 40%,rgba(79,142,247,0.06) 50%,transparent 60%)", animation: "shimmer 3.5s ease-in-out infinite", pointerEvents: "none" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#60a5fa" }}>Ready to go</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "30px", letterSpacing: "0.04em", color: "#fff", lineHeight: 1 }}>Start Session</span>
              </div>
              <div style={{ width: "54px", height: "54px", borderRadius: "50%", flexShrink: 0, background: "linear-gradient(145deg,#4f8ef7,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 0 22px rgba(79,142,247,0.45)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v14l11-7-11-7z" /></svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      {splitOpen && <WorkoutSplitModal onClose={() => setSplitOpen(false)} />}
      {exerciseOpen && <PlanExerciseModal onClose={() => setExerciseOpen(false)} />}
      {plansOpen && <BestPlansModal onClose={() => setPlansOpen(false)} />}
      <KaiAssistant isOpen={isKaiOpen} onClose={() => setIsKaiOpen(false)} />
    </>
  );
}