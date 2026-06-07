"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import KaiAssistant from "@/components/KaiAssistant";

// ─────────────────────────────────────────────
// DATA — grouped by equipment type (new order: Machine → Dumbbell → Cable → Barbell → Bodyweight)
// ─────────────────────────────────────────────

const MUSCLES = [
  { id: "chest", label: "Chest", emoji: "🫁", icon: "Chest" },
  { id: "back", label: "Back", emoji: "🔙", icon: "Back" },
  { id: "shoulders", label: "Shoulders", emoji: "💪", icon: "Shoulders" },
  { id: "arms", label: "Arms", emoji: "💪", icon: "Arms" },
  { id: "legs", label: "Legs", emoji: "🦵", icon: "Legs" },
  { id: "core", label: "Core", emoji: "🎯", icon: "Core" },
];

const EQUIPMENT_GROUPS = {
  chest: [
    {
      group: "Machine",
      icon: "MC",
      color: "#8B5CF6",
      exercises: ["Pec Deck Machine", "Chest Press Machine", "Incline Chest Press Machine"],
    },
    {
      group: "Dumbbell",
      icon: "DB",
      color: "#4ECDC4",
      exercises: [
        "Incline Dumbbell Press",
        "Flat Dumbbell Press",
        "Dumbbell Fly",
        "Svend Press",
      ],
    },
    {
      group: "Cable",
      icon: "CA",
      color: "#A855F7",
      exercises: ["Cable Fly (Mid)", "Incline Cable Fly", "Low-to-High Cable Fly", "Cable Crossover"],
    },
    {
      group: "Barbell",
      icon: "BB",
      color: "#FF6B35",
      exercises: [
        "Flat Barbell Bench Press",
        "Incline Barbell Press",
        "Decline Barbell Press",
        "Landmine Press",
      ],
    },
    {
      group: "Bodyweight",
      icon: "BW",
      color: "#F59E0B",
      exercises: [
        "Standard Push-Up",
        "Diamond Push-Up",
        "Decline Push-Up",
        "Wide Push-Up",
        "Archer Push-Up",
      ],
    },
  ],
  back: [
    {
      group: "Machine",
      icon: "MC",
      color: "#8B5CF6",
      exercises: ["Lat Pulldown Machine", "Seated Row Machine", "Back Extension Machine", "T-Bar Row Machine"],
    },
    {
      group: "Dumbbell",
      icon: "DB",
      color: "#4ECDC4",
      exercises: ["Single-Arm Dumbbell Row", "Chest-Supported Row", "Dumbbell Pullover"],
    },
    {
      group: "Cable",
      icon: "CA",
      color: "#A855F7",
      exercises: ["Cable Row", "Straight-Arm Pulldown", "Face Pull", "Cable Pull-Through"],
    },
    {
      group: "Barbell",
      icon: "BB",
      color: "#FF6B35",
      exercises: ["Barbell Bent-Over Row", "Deadlift", "Rack Pull", "T-Bar Row", "Meadows Row"],
    },
    {
      group: "Bodyweight",
      icon: "BW",
      color: "#F59E0B",
      exercises: ["Pull-Up", "Chin-Up", "Bodyweight Row", "Dead Hang", "Back Extension"],
    },
  ],
  shoulders: [
    {
      group: "Machine",
      icon: "MC",
      color: "#8B5CF6",
      exercises: ["Shoulder Press Machine", "Lateral Raise Machine", "Rear Delt Machine"],
    },
    {
      group: "Dumbbell",
      icon: "DB",
      color: "#4ECDC4",
      exercises: [
        "Dumbbell Lateral Raise",
        "Seated Dumbbell Press",
        "Arnold Press",
        "Rear Delt Fly",
        "Front Raise",
        "Plate Front Raise",
      ],
    },
    {
      group: "Cable",
      icon: "CA",
      color: "#A855F7",
      exercises: ["Cable Lateral Raise", "Cable Front Raise", "Face Pull", "Cable Rear Delt Fly"],
    },
    {
      group: "Barbell",
      icon: "BB",
      color: "#FF6B35",
      exercises: ["Barbell Overhead Press", "Upright Row", "Cuban Press"],
    },
    {
      group: "Bodyweight",
      icon: "BW",
      color: "#F59E0B",
      exercises: ["Pike Push-Up", "Handstand Push-Up (Assisted)", "Side Plank Raise", "Wrist Push-Up"],
    },
  ],
  arms: [
    {
      group: "Machine",
      icon: "MC",
      color: "#8B5CF6",
      exercises: ["Preacher Curl Machine", "Tricep Extension Machine", "Bicep Curl Machine"],
    },
    {
      group: "Dumbbell",
      icon: "DB",
      color: "#4ECDC4",
      exercises: [
        "Incline Dumbbell Curl",
        "Hammer Curl",
        "Overhead Tricep Extension",
        "Concentration Curl",
        "Dips (Tricep Focus)",
      ],
    },
    {
      group: "Cable",
      icon: "CA",
      color: "#A855F7",
      exercises: ["Tricep Pushdown (Cable)", "Cable Curl", "Cable Overhead Tricep Extension"],
    },
    {
      group: "Barbell",
      icon: "BB",
      color: "#FF6B35",
      exercises: ["Barbell Curl", "Skull Crusher", "Close-Grip Bench Press", "Reverse Curl"],
    },
    {
      group: "Bodyweight",
      icon: "BW",
      color: "#F59E0B",
      exercises: ["Tricep Dip", "Diamond Push-Up", "Bodyweight Skull Crusher", "Door Frame Curl"],
    },
  ],
  legs: [
    {
      group: "Machine",
      icon: "MC",
      color: "#8B5CF6",
      exercises: ["Leg Press Machine", "Leg Extension Machine", "Leg Curl Machine", "Hack Squat Machine", "Hip Thrust Machine"],
    },
    {
      group: "Dumbbell",
      icon: "DB",
      color: "#4ECDC4",
      exercises: ["Goblet Squat", "Dumbbell Lunges", "Dumbbell Romanian Deadlift", "Dumbbell Calf Raise"],
    },
    {
      group: "Cable",
      icon: "CA",
      color: "#A855F7",
      exercises: ["Cable Pull-Through", "Cable Hip Adduction", "Cable Hip Abduction"],
    },
    {
      group: "Barbell",
      icon: "BB",
      color: "#FF6B35",
      exercises: ["Barbell Back Squat", "Romanian Deadlift", "Bulgarian Split Squat", "Hip Thrust", "Hack Squat"],
    },
    {
      group: "Bodyweight",
      icon: "BW",
      color: "#F59E0B",
      exercises: ["Bodyweight Squat", "Walking Lunge", "Glute Bridge", "Nordic Curl", "Calf Raise", "Step-Up"],
    },
  ],
  core: [
    {
      group: "Machine",
      icon: "MC",
      color: "#8B5CF6",
      exercises: ["Ab Crunch Machine", "Back Extension Machine", "Rotary Torso Machine"],
    },
    {
      group: "Dumbbell",
      icon: "DB",
      color: "#4ECDC4",
      exercises: ["Russian Twist (Weighted)", "Dumbbell Side Bend", "Dumbbell Woodchopper"],
    },
    {
      group: "Cable",
      icon: "CA",
      color: "#A855F7",
      exercises: ["Cable Crunch", "Pallof Press", "Cable Woodchopper", "Cable Reverse Crunch"],
    },
    {
      group: "Barbell",
      icon: "BB",
      color: "#FF6B35",
      exercises: ["Barbell Rollout", "Barbell Russian Twist", "Barbell Good Morning"],
    },
    {
      group: "Bodyweight",
      icon: "BW",
      color: "#F59E0B",
      exercises: [
        "Hanging Leg Raise",
        "Plank",
        "Bicycle Crunch",
        "Toe Touches",
        "Dead Bug",
        "Dragon Flag",
        "Mountain Climber",
        "V-Up",
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const createSet = () => ({ weight: "", reps: "", locked: false });
const createExercise = (name) => ({
  name,
  sets: [createSet(), createSet(), createSet()],
  open: false,
});
const initData = () => {
  const d = {};
  Object.keys(EQUIPMENT_GROUPS).forEach((m) => {
    d[m] = {};
    EQUIPMENT_GROUPS[m].forEach((grp) => {
      d[m][grp.group] = grp.exercises.map(createExercise);
    });
  });
  return d;
};

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

  :root {
    --bg: #06070a;
    --bg2: #06070a;
    --surface: #0a0c10;
    --card: rgba(14, 16, 20, 0.9);
    --card-border: rgba(255,255,255,0.06);
    --glass:      rgba(255,255,255,0.03);
    --a1:         #ffffff;
    --a2:         #ffffff;
    --a3:         #f1f5f9;
    --g1: #ffffff;
    --g2: #cbd5e1;
    --text:       #f0f4ff;
    --text2:      rgba(240,244,255,0.8);
    --text3:      rgba(240,244,255,0.5);
    --text4:      rgba(240,244,255,0.3);
    --rad:        24px;
    --rad-sm:     16px;
    --rad-xs:     12px;
    --mono:       'JetBrains Mono', monospace;
    --display:    'Outfit', sans-serif;
    --body:       'Space Grotesk', sans-serif;
    --shadow-sm:  0 2px 16px rgba(0,0,0,0.6);
    --shadow-card: 0 8px 48px rgba(0,0,0,0.6);
    --shadow-glow: 0 0 80px rgba(255,255,255,0.06);
  }

  html, body {
    background: #020305;
    height: 100%;
    overflow-x: hidden;
    max-width: 100vw;
  }

  body::before {
    content: '';
    position: fixed; inset: 0;
    background: 
      radial-gradient(ellipse at 50% -10%, rgba(255,255,255,0.06) 0%, transparent 60%),
      radial-gradient(circle at 120% 80%, rgba(255,255,255,0.02) 0%, transparent 50%),
      radial-gradient(circle at -20% 80%, rgba(255,255,255,0.02) 0%, transparent 50%);
    z-index: -2;
    pointer-events: none;
  }

  body::after {
    content: '';
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
    z-index: -1;
    pointer-events: none;
    mix-blend-mode: overlay;
  }

  .wl-app {
    background: transparent;
    min-height: 100dvh;
    font-family: var(--body);
    color: var(--text);
    width: 100%;
    max-width: 430px;
    margin: 0 auto;
    position: relative;
    overflow-x: hidden;
    padding-bottom: 100px;
  }

  

  /* ── HEADER ── */
  .wl-header {
    position:sticky;
    top:0;z-index:100;
    padding: 16px 20px 14px;
    background: rgba(8,9,12,0.85);
    backdrop-filter: blur(32px) saturate(1.6);
    -webkit-backdrop-filter: blur(32px) saturate(1.6);
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  .wl-header-row {
    display:flex;
    align-items:center;
    gap:14px;
  }

  .wl-back {
    width:44px;height:44px;flex-shrink:0;
    border-radius:14px;
    background: rgba(255,255,255,0.05);
    border:1px solid rgba(255,255,255,0.08);
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;color:var(--text2);
    transition:all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    backdrop-filter: blur(10px);
  }
  .wl-back:hover { background: rgba(255,255,255,0.1); color:#fff; transform:scale(1.02); }
  .wl-back:active { transform:scale(0.94); }

  .wl-title-block { flex:1;min-width:0; }
  .wl-eyebrow {
    font-family:var(--mono);
    font-size:9px;font-weight:500;
    letter-spacing:4px;
    color:var(--a1);
    text-transform:uppercase;
    margin-bottom:2px;
    opacity:0.9;
    display:flex;align-items:center;gap:6px;
  }
  .wl-eyebrow .eyebrow-dot {
    width:4px;height:4px;border-radius:50%;
    background:var(--g1);
    display:inline-block;
    animation: pulse-dot 2s ease-in-out infinite;
  }
  @keyframes pulse-dot {
    0%,100%{opacity:0.4;transform:scale(1);}
    50%{opacity:1;transform:scale(1.3);}
  }
  .wl-title {
    font-family:var(--display);
    font-size:28px;font-weight:800;
    color:#fff;line-height:1;
    letter-spacing:-0.5px;
    text-shadow: 0 0 60px rgba(255,255,255,0.08);
  }

  .wl-header-actions {
    display:flex;
    align-items:center;
    gap:10px;
    flex-shrink:0;
  }

  .wl-add-exercise-btn {
    padding: 10px 16px;
    border-radius: 99px;
    border: 1.5px solid rgba(255,255,255,0.4);
    background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%);
    backdrop-filter: blur(10px);
    font-family: var(--body);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: var(--a2);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    flex-shrink: 0;
    white-space: nowrap;
    display:flex;align-items:center;gap:4px;
  }
  .wl-add-exercise-btn:hover {
    background: rgba(255,255,255,0.15);
    border-color: var(--a1);
    color: #000;
    transform: translateY(-1px);
    box-shadow: 0 4px 24px rgba(255,255,255,0.12);
  }
  .wl-add-exercise-btn:active { transform: scale(0.96); }
  .wl-add-exercise-btn svg { width:14px;height:14px; }

  .wl-finish-header-btn {
    padding: 10px 20px;
    border-radius: 99px;
    border: none;
    background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
    font-family: var(--body);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: #000;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    box-shadow: 0 4px 20px rgba(255,255,255,0.3);
    flex-shrink: 0;
    backdrop-filter: blur(10px);
    position:relative;
    overflow:hidden;
  }
  .wl-finish-header-btn::before {
    content:'';
    position:absolute;inset:0;
    background:linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
    opacity:0;transition:opacity 0.4s;
  }
  .wl-finish-header-btn:hover::before { opacity:1; }
  .wl-finish-header-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 28px rgba(255,255,255,0.45);
  }
  .wl-finish-header-btn:active { transform: scale(0.96); }
  .wl-finish-header-btn.celebrating {
    background:linear-gradient(135deg, #ffffff, #cbd5e1);
    box-shadow: 0 4px 24px rgba(255,255,255,0.3);
  }

  /* ── PROGRESS BAR ── */
  .wl-progress-wrap {
    padding:0 20px;
    margin-top:6px;
  }
  .wl-progress-bar {
    height:3px;
    background:rgba(255,255,255,0.05);
    position:relative;
    overflow:hidden;
    border-radius:4px;
  }
  .wl-progress-fill {
    height:100%;
    background:linear-gradient(90deg, #ffffff, #94a3b8);
    transition:width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    border-radius:4px;
    box-shadow:0 0 20px rgba(255,255,255,0.2);
    position:relative;
  }
  .wl-progress-fill::after {
    content:'';
    position:absolute;right:0;top:-2px;bottom:-2px;width:20px;
    background:linear-gradient(90deg, transparent, rgba(255,255,255,0.15));
    filter: blur(2px);
  }
  .wl-progress-stats {
    display:flex;justify-content:space-between;
    margin-top:4px;
    font-size:10px;font-weight:500;
    color:var(--text4);
    font-family:var(--mono);
    letter-spacing:0.3px;
  }
  .wl-progress-stats span { color:var(--text3); }

  /* ── MUSCLE RAIL ── */
  .wl-rail-wrap {
    padding:16px 0 6px;
    background: rgba(0,0,0,0.15);
  }
  .wl-rail-label {
    font-size:9px;font-weight:700;
    letter-spacing:3px;
    color:var(--text4);
    text-transform:uppercase;
    margin-bottom:12px;
    padding:0 20px;
  }
  .wl-rail {
    display:flex;
    flex-wrap: wrap;
    gap:8px;
    padding:0 20px 18px;
  }

  .wl-tab {
    flex: 0 0 calc((100% - 16px) / 3);
    display:flex;flex-direction:column;align-items:center;
    padding:14px 4px 10px;
    border-radius:16px;
    border:1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.02);
    backdrop-filter: blur(10px);
    cursor:pointer;
    transition:all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position:relative;
    overflow:hidden;
    min-height: 64px;
  }
  .wl-tab::before {
    content:'';
    position:absolute;inset:0;
    background:linear-gradient(135deg, rgba(255,255,255,0.06), rgba(16,185,129,0.02));
    opacity:0;transition:opacity 0.4s;
  }
  .wl-tab::after {
    content:'';
    position:absolute;bottom:0;left:50%;transform:translateX(-50%);
    width:0;height:3px;border-radius:3px;
    background:linear-gradient(90deg, var(--a1), var(--g1));
    transition:width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  .wl-tab:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); }
  .wl-tab.active {
    border-color: rgba(255,255,255,0.3);
    background: rgba(255,255,255,0.08);
    box-shadow: 0 4px 28px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05);
  }
  .wl-tab.active::before { opacity:1; }
  .wl-tab.active::after { width:28px; }

  .wl-tab-label {
    font-size:12px;font-weight:600;
    color:var(--text3);
    transition:color 0.3s;
    white-space:nowrap;
    position:relative;z-index:1;
  }
  .wl-tab.active .wl-tab-label { color:#fff;font-weight:700; }

  .wl-tab-dot {
    width:5px;height:5px;border-radius:50%;
    background:var(--text4);
    margin-top:6px;
    transition:all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position:relative;z-index:1;
  }
  .wl-tab.active .wl-tab-dot {
    background:var(--a1);
    box-shadow:0 0 16px var(--a1), 0 0 40px rgba(255,255,255,0.1);
    width:6px;height:6px;
  }
  .wl-tab .wl-tab-dot.wl-dot-done {
    background:var(--g1);
    box-shadow:0 0 16px rgba(16,185,129,0.25);
  }

  /* ── GROUPS ── */
  .wl-groups {
    padding: 16px 16px 8px;
    display:flex;flex-direction:column;gap:16px;
  }

  .wl-group {
    background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%);
    background-color: rgba(10,12,16,0.85);
    border-radius: var(--rad-sm);
    border: 1px solid rgba(148,163,184,0.08);
    overflow: hidden;
    transition: all 0.3s ease;
  }
  .wl-group:hover { border-color: rgba(255,255,255,0.12); }

  .wl-group-header {
    display:flex;align-items:center;gap:14px;
    padding:16px 18px 14px;
    cursor:pointer;
    user-select:none;
    -webkit-tap-highlight-color:transparent;
    transition:background 0.2s;
    position:relative;
  }
  .wl-group-header:active { background: rgba(255,255,255,0.02); }

  .wl-group-badge {
    width:36px;height:24px;
    border-radius:8px;
    display:flex;align-items:center;justify-content:center;
    font-family:var(--mono);
    font-size:8px;font-weight:700;
    letter-spacing:0.5px;
    flex-shrink:0;
    backdrop-filter: blur(4px);
  }

  .wl-group-name {
    font-size:13px;font-weight:700;
    letter-spacing:2px;
    text-transform:uppercase;
    color:var(--text2);
    flex:1;
  }

  .wl-group-count {
    font-family:var(--mono);
    font-size:10px;
    color:var(--text3);
    background:rgba(255,255,255,0.04);
    padding:3px 10px;
    border-radius:20px;
    border:1px solid rgba(255,255,255,0.04);
    transition: all 0.3s ease;
  }
  .wl-group-count.has-progress {
    border-color: rgba(16,185,129,0.15);
    color: var(--g2);
    background: rgba(16,185,129,0.05);
  }

  .wl-group-chevron {
    transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    display:flex;align-items:center;justify-content:center;
    color:var(--text4);
    width:24px;height:24px;
    flex-shrink:0;
  }
  .wl-group-chevron.open { transform: rotate(180deg); color:var(--text2); }

  .wl-group-body {
    padding: 0 16px 16px;
    animation: wl-groupSlide 0.3s ease;
  }
  @keyframes wl-groupSlide {
    from{opacity:0;transform:translateY(-8px);}
    to{opacity:1;transform:translateY(0);}
  }

  .wl-exercise-list {
    display:flex;flex-direction:column;gap:8px;
  }

  /* ── EXERCISE CARD ── */
  .wl-ex {
    background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%);
    background-color: rgba(10,12,16,0.85);
    border: 1px solid rgba(148,163,184,0.08);
    border-top: 1px solid rgba(255,255,255,0.12);
    border-radius: var(--rad-sm);
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    box-shadow: 0 8px 24px -6px rgba(0,0,0,0.5);
  }
  .wl-ex:hover { border-color: rgba(255,255,255,0.15); }
  .wl-ex.open {
    background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%);
    background-color: rgba(14,16,20,0.9);
    border-color: rgba(255,255,255,0.2);
    box-shadow: 0 12px 32px -8px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1);
  }
  .wl-ex.all-done {
    border-color: rgba(16,185,129,0.2);
    box-shadow: 0 4px 28px rgba(16,185,129,0.06);
    background: rgba(16,185,129,0.02);
  }

  .wl-ex-header {
    display:flex;align-items:center;gap:14px;
    padding:14px 16px;
    cursor:pointer;
    user-select:none;
    -webkit-tap-highlight-color:transparent;
    transition:background 0.2s;
  }
  .wl-ex-header:active { background: rgba(255,255,255,0.02); }

  .wl-ring {
    position:relative;width:42px;height:42px;flex-shrink:0;
  }
  .wl-ring svg { transform:rotate(-90deg); }
  .wl-ring-track { fill:none;stroke:rgba(255,255,255,0.06);stroke-width:2.5; }
  .wl-ring-fill  { fill:none;stroke-width:2.5;stroke-linecap:round;transition:stroke-dashoffset 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
  .wl-ring-label {
    position:absolute;inset:0;
    display:flex;align-items:center;justify-content:center;
    font-family:var(--mono);
    font-size:10px;font-weight:700;
    color:var(--text3);
    letter-spacing:0.2px;
  }
  .wl-ex.all-done .wl-ring-label { color:var(--g2); }

  .wl-ex-info { flex:1;min-width:0; }
  .wl-ex-name {
    font-size:14px;font-weight:700;
    color:var(--text);
    letter-spacing:-0.2px;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
    line-height:1.3;
    transition:color 0.2s;
  }
  .wl-ex.all-done .wl-ex-name { color:var(--g2); }

  .wl-ex-sub {
    display:flex;align-items:center;gap:8px;
    margin-top:4px;
  }
  .wl-ex-tag {
    font-size:9px;font-weight:700;
    letter-spacing:1px;
    text-transform:uppercase;
    padding:2px 8px;
    border-radius:6px;
    backdrop-filter: blur(4px);
  }
  .wl-sets-count {
    font-family:var(--mono);
    font-size:10px;
    color:var(--text3);
  }

  .wl-chevron {
    width:30px;height:30px;flex-shrink:0;
    border-radius:50%;
    background:rgba(255,255,255,0.03);
    border:1px solid rgba(255,255,255,0.06);
    display:flex;align-items:center;justify-content:center;
    color:var(--text4);
    transition:all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  .wl-ex.open .wl-chevron {
    transform:rotate(180deg);
    background:rgba(255,255,255,0.12);
    border-color:rgba(255,255,255,0.25);
    color:var(--a2);
  }

  /* ── SETS PANEL ── */
  .wl-sets-panel {
    padding:0 16px 16px;
    animation: wl-slide 0.25s ease;
  }
  @keyframes wl-slide {
    from{opacity:0;transform:translateY(-10px);}
    to{opacity:1;transform:translateY(0);}
  }

  .wl-sets-top {
    display:flex;align-items:center;gap:8px;
    padding:12px 0 10px;
    border-top:1px solid rgba(255,255,255,0.05);
    margin-bottom:8px;
  }
  .wl-set-num { width:24px;flex-shrink:0; text-align:center; }
  .wl-col-head {
    flex:1;
    font-size:9px;font-weight:700;
    letter-spacing:2px;
    text-transform:uppercase;
    color:var(--text4);
    text-align:center;
  }
  .wl-col-tick { width:44px;flex-shrink:0; }

  .wl-set-row {
    display:flex;align-items:center;gap:8px;
    margin-bottom:8px;
    transition: all 0.2s ease;
  }
  .wl-set-row:hover .wl-input:not(:disabled) {
    border-color: rgba(255,255,255,0.15);
  }

  .wl-set-num-label {
    font-family:var(--mono);
    font-size:11px;font-weight:600;
    color:var(--text4);
    width:24px;flex-shrink:0;
    text-align:center;
  }

  .wl-input-wrap { flex:1;position:relative; }

  .wl-input {
    width:100%;
    height:48px;
    background:rgba(255,255,255,0.03);
    border:1.5px solid rgba(255,255,255,0.06);
    border-radius:var(--rad-xs);
    padding:0 8px;
    font-family:var(--mono);
    font-size:16px;font-weight:600;
    color:var(--text);
    text-align:center;
    outline:none;
    -moz-appearance:textfield;
    transition:border-color 0.25s, background 0.25s, box-shadow 0.25s;
  }
  .wl-input::-webkit-outer-spin-button,
  .wl-input::-webkit-inner-spin-button{-webkit-appearance:none;}
  .wl-input::placeholder{color:rgba(255,255,255,0.08);font-weight:400;font-size:14px;}
  .wl-input:focus:not(:disabled){
    border-color:var(--a1);
    background:rgba(255,255,255,0.06);
    color:#fff;
    box-shadow:0 0 0 3px rgba(255,255,255,0.08);
  }
  .wl-input.done {
    border-color:rgba(16,185,129,0.25);
    background:rgba(16,185,129,0.04);
    color:var(--g2);
    cursor:default;
  }
  .wl-input.done::placeholder { color:rgba(16,185,129,0.2); }
  .wl-input.err {
    border-color:rgba(239,68,68,0.4);
    animation: wl-shake 0.4s ease;
  }

  @keyframes wl-shake{
    0%,100%{transform:translateX(0);}
    25%{transform:translateX(-5px);}
    75%{transform:translateX(5px);}
  }

  /* ── TICK ── */
  .wl-tick {
    width:44px;height:44px;flex-shrink:0;
    border-radius:12px;
    border:1.5px solid rgba(255,255,255,0.06);
    background:rgba(255,255,255,0.02);
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;
    -webkit-tap-highlight-color:transparent;
    transition:all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    color:var(--text4);
  }
  .wl-tick:hover:not(.wl-tick-done){
    border-color:var(--a2);
    background:rgba(255,255,255,0.06);
    color:var(--a2);
  }
  .wl-tick.wl-tick-done {
    background:var(--g1);
    border-color:var(--g1);
    color:#fff;
    box-shadow:0 0 24px rgba(16,185,129,0.3);
    transform:scale(1.06);
  }
  .wl-tick.wl-tick-done:active { transform:scale(0.96); }

  .wl-add-set {
    width:100%;
    height:44px;
    margin-top:10px;
    border-radius:var(--rad-xs);
    border:1.5px dashed rgba(255,255,255,0.15);
    background:transparent;
    font-family:var(--body);
    font-size:10px;font-weight:700;
    letter-spacing:1.5px;
    text-transform:uppercase;
    color:rgba(255,255,255,0.5);
    cursor:pointer;
    transition:all 0.3s;
    display:flex;align-items:center;justify-content:center;
    gap:6px;
  }
  .wl-add-set:hover{
    background:rgba(255,255,255,0.06);
    border-color:rgba(255,255,255,0.35);
    color:var(--a2);
  }
/* ── ADD EXERCISE MODAL ── */
.wl-modal-overlay {
  position: fixed; inset: 0; z-index: 500;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
  /* Deep obsidian blur with vignette */
  background: radial-gradient(circle at 50% 50%, rgba(6,7,10,0.4) 0%, rgba(0,0,0,0.95) 100%);
  backdrop-filter: blur(32px) saturate(120%);
  -webkit-backdrop-filter: blur(32px) saturate(120%);
  animation: wl-fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.wl-modal-overlay::before {
  content: ""; position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none; z-index: -1;
}
@keyframes wl-fadeIn {
  from { opacity: 0; backdrop-filter: blur(0px); }
  to { opacity: 1; backdrop-filter: blur(32px); }
}

.wl-modal-card {
  position: relative;
  /* Anodized Titanium Background */
  background: linear-gradient(160deg, #15171d 0%, #06070a 100%);
  border-radius: 28px;
  padding: 36px 32px;
  width: 100%;
  max-width: 420px;
  border: none;
  /* Physical Bevel: Inner top highlight, outer dark rim, outer bright hairline */
  box-shadow: 
    inset 0 1px 1px rgba(255,255,255,0.15),
    inset 0 0 40px rgba(255,255,255,0.02),
    0 40px 80px -20px rgba(0,0,0,1),
    0 0 0 1px rgba(255,255,255,0.05);
  animation: wl-modalIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  overflow: hidden;
}

/* Ambient Edge Light */
.wl-modal-card::before {
  content: '';
  position: absolute; top: 0; left: 15%; right: 15%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
  box-shadow: 0 0 24px 3px rgba(255,255,255,0.15);
  z-index: 2;
}

/* Metallic Grain */
.wl-modal-card::after {
  content: ""; position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E");
  pointer-events: none; z-index: 0; mix-blend-mode: overlay;
}

@keyframes wl-modalIn {
  from { opacity: 0; transform: scale(0.92) translateY(24px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.wl-modal-title {
  position: relative; z-index: 1;
  font-family: var(--body);
  font-size: 24px; font-weight: 700;
  margin-bottom: 4px;
  letter-spacing: -0.02em;
  color: #f1f5f9;
}

.wl-modal-sub {
  position: relative; z-index: 1;
  font-size: 14px; color: rgba(255,255,255,0.5);
  margin-bottom: 28px;
}

.wl-modal-label {
  position: relative; z-index: 1;
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.4);
  margin-bottom: 12px;
  display: block;
}

.wl-equipment-grid {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 28px;
  position: relative; z-index: 1;
}

.wl-equip-btn {
  flex: 1;
  min-width: 0;
  padding: 12px 2px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.02);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  font-family: var(--body);
  color: rgba(255,255,255,0.5);
}
.wl-equip-btn:hover {
  background: rgba(255,255,255,0.04);
  color: #ffffff;
  border-color: rgba(255,255,255,0.12);
}
.wl-equip-btn:active {
  transform: scale(0.97);
}
.wl-equip-btn.active {
  border-color: #ffffff;
  background: rgba(255,255,255,0.12);
  color: #ffffff;
  box-shadow: 0 0 20px rgba(255,255,255,0.15);
}
.wl-equip-btn .eq-icon {
  font-size: 16px; font-weight: 600;
}
.wl-equip-btn .eq-label {
  font-size: 9px; font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.wl-modal-input {
  position: relative; z-index: 1;
  width:100%;
  height: 52px;
  background: #06070a;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 0 16px;
  font-family: var(--body);
  font-size: 16px;
  color: #f1f5f9;
  outline: none;
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  margin-bottom: 28px;
}
.wl-modal-input::placeholder { color: rgba(255,255,255,0.3); }
.wl-modal-input:focus {
  border-color: #ffffff;
  box-shadow: 0 0 0 1px #ffffff, 0 0 20px rgba(255,255,255,0.15);
}

.wl-modal-actions {
  display: flex; gap: 12px;
  position: relative; z-index: 1;
}
.wl-modal-btn {
  flex: 1;
  height: 52px;
  border-radius: 12px;
  font-family: var(--body);
  font-size: 15px; font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border: none;
  position: relative;
  overflow: hidden;
}

.wl-modal-btn.cancel {
  background: rgba(255,255,255,0.03);
  color: rgba(255,255,255,0.5);
  border: 1px solid rgba(255,255,255,0.08);
}
.wl-modal-btn.cancel:hover { 
  background: rgba(255,255,255,0.06); 
  color: #ffffff;
  border-color: rgba(255,255,255,0.12);
}
.wl-modal-btn.cancel:active { transform: scale(0.97); }

.wl-modal-btn.add {
  background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
  color: #000;
  box-shadow: 0 4px 20px rgba(255,255,255,0.3);
}
.wl-modal-btn.add:hover:not(:disabled) { 
  transform: translateY(-1px);
  box-shadow: 0 6px 28px rgba(255,255,255,0.45);
}
.wl-modal-btn.add:active { transform: scale(0.97); }
.wl-modal-btn.add:disabled {
  opacity: 0.25;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

  /* ── TOAST ── */
  .wl-toast {
    position:fixed;
    bottom:32px;left:50%;
    transform:translateX(-50%) translateY(20px);
    background:rgba(16,185,129,0.96);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    color:#fff;
    padding:14px 28px;
    border-radius:99px;
    font-family:var(--body);
    font-size:14px;font-weight:700;
    opacity:0;pointer-events:none;
    white-space:nowrap;z-index:300;
    transition:all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    box-shadow:0 8px 32px rgba(16,185,129,0.5);
    border:1px solid rgba(255,255,255,0.1);
  }
  .wl-toast.show{
    opacity:1;
    transform:translateX(-50%) translateY(0);
  }

  /* ── CELEBRATION ── */
  .wl-celebrate-overlay {
    position:fixed;inset:0;z-index:500;
    display:flex;align-items:center;justify-content:center;
    padding:20px;
    background:rgba(3,5,12,0.8);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    animation: wl-fadeIn 0.3s ease;
  }
  .wl-celebrate-card {
    background: var(--surface);
    border:1px solid rgba(255,255,255,0.08);
    border-radius:var(--rad);
    padding:36px 32px;
    text-align:center;
    max-width:320px;
    box-shadow:0 24px 48px rgba(0,0,0,0.6);
    animation: wl-modalIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  .wl-celebrate-card .emoji-big { font-size:56px;margin-bottom:12px;display:block; }
  .wl-celebrate-card .title {
    font-family:var(--display);
    font-size:26px;font-weight:800;
    color:#fff;margin-bottom:6px;
    letter-spacing:-0.3px;
  }
  .wl-celebrate-card .sub {
    color:var(--text2);font-size:14px;
    line-height:1.5;
  }
  .wl-celebrate-card .sub strong { color:#fff;font-weight:700; }

  /* ── CONFETTI ── */
  .wl-confetti {
    position:fixed;top:0;left:0;width:100%;height:100%;
    pointer-events:none;z-index:600;
  }
  .confetti-piece {
    position:absolute;
    width:8px;height:8px;
    border-radius:2px;
    animation: confetti-fall var(--fall-duration) linear forwards;
    animation-delay: var(--delay);
    opacity:0;
  }
  @keyframes confetti-fall {
    0% { transform: translateY(-20px) rotate(0deg) scale(0); opacity:1; }
    100% { transform: translateY(110vh) rotate(720deg) scale(1); opacity:0; }
  }

  /* ── SCROLLBAR ── */
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:4px; }
  ::-webkit-scrollbar-thumb:hover { background:rgba(255,255,255,0.12); }

  /* ── RESPONSIVE ── */
  @media (max-width: 380px) {
    .wl-title { font-size:24px; }
    .wl-tab { flex: 0 0 calc((100% - 8px) / 3); }
    .wl-equipment-grid { grid-template-columns: repeat(3, 1fr); }
  }
`;

// ─────────────────────────────────────────────
// RING COMPONENT
// ─────────────────────────────────────────────
function Ring({ done, total, color }) {
  const R = 17;
  const C = 2 * Math.PI * R;
  const pct = total > 0 ? done / total : 0;
  const offset = C - pct * C;
  const stroke =
    done === total && total > 0 ? "var(--g1)" : color || "var(--a1)";
  const label = done > 0 ? `${done}/${total}` : `${total}`;
  return (
    <div className="wl-ring">
      <svg width="42" height="42" viewBox="0 0 42 42">
        <circle className="wl-ring-track" cx="21" cy="21" r={R} />
        <circle
          className="wl-ring-fill"
          cx="21"
          cy="21"
          r={R}
          stroke={stroke}
          strokeDasharray={C}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="wl-ring-label">{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────
const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path
      d="M2.5 4.5L6 8.5L9.5 4.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const Check = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path
      d="M2.5 8.5L6.5 12.5L13.5 4"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const Circle = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path
      d="M6 1v10M1 6h10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// ─────────────────────────────────────────────
// CONFETTI
// ─────────────────────────────────────────────
function Confetti({ active }) {
  if (!active) return null;
  const colors = ["#ffffff", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#4ECDC4", "#FF6B35", "#A855F7", "#34d399", "#ffffff"];
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 3.5,
    color: colors[i % colors.length],
    size: 6 + Math.random() * 8,
  }));
  return (
    <div className="wl-confetti">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size}px`,
            "--fall-duration": `${p.duration}s`,
            "--delay": `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// ADD EXERCISE MODAL
// ─────────────────────────────────────────────
function AddExerciseModal({ isOpen, onClose, onAdd, currentMuscle }) {
  const [equipment, setEquipment] = useState("Machine");
  const [name, setName] = useState("");

  const equipmentOptions = [
    { id: "Machine", label: "Machine", icon: "MC" },
    { id: "Dumbbell", label: "Dumbbell", icon: "DB" },
    { id: "Cable", label: "Cable", icon: "CA" },
    { id: "Barbell", label: "Barbell", icon: "BB" },
    { id: "Bodyweight", label: "Bodyweight", icon: "BW" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(equipment, name.trim());
    setName("");
    setEquipment("Machine"); // Reset to default
  };

  if (!isOpen) return null;

  return (
    <div className="wl-modal-overlay" onClick={onClose}>
      <div className="wl-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="wl-modal-title">Add Exercise</div>
        <div className="wl-modal-sub">to {currentMuscle?.label || "workout"}</div>

        <form onSubmit={handleSubmit}>
          <label className="wl-modal-label">Equipment</label>
          <div className="wl-equipment-grid">
            {equipmentOptions.map((eq) => (
              <button
                key={eq.id}
                type="button"
                className={`wl-equip-btn ${equipment === eq.id ? "active" : ""}`}
                onClick={() => setEquipment(eq.id)}
              >
                <span className="eq-icon">{eq.icon}</span>
                <span className="eq-label">{eq.label}</span>
              </button>
            ))}
          </div>

          <label className="wl-modal-label">Exercise Name</label>
          <input
            className="wl-modal-input"
            type="text"
            placeholder="e.g. Incline Dumbbell Press"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <div className="wl-modal-actions">
            <button type="button" className="wl-modal-btn cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="wl-modal-btn add"
              disabled={!name.trim()}
            >
              Add Exercise
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function WorkoutLogger() {
  const router = useRouter();
  const [muscle, setMuscle] = useState("chest");
  const [data, setData] = useState(initData);
  const [shakes, setShakes] = useState({});
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [showCelebration, setShowCelebration] = useState(false);
  const [openGroups, setOpenGroups] = useState({});
  const [mounted, setMounted] = useState(false);
  const [isKaiOpen, setIsKaiOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsKaiOpen(true);
    window.addEventListener("twin:open-kai", handler);
    return () => window.removeEventListener("twin:open-kai", handler);
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [saving, setSaving] = useState(false);
  const sessionStartRef = useRef(new Date().toISOString());

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2800);
  };

  // ── STATS ─────────────────────────────────
  const muscleGroups = EQUIPMENT_GROUPS[muscle] || [];
  const allExercises = muscleGroups.flatMap((g) => data[muscle]?.[g.group] || []);
  const totalSets = allExercises.reduce((a, e) => a + e.sets.length, 0);
  const lockedSets = allExercises.reduce((a, e) => a + e.sets.filter((s) => s.locked).length, 0);
  const totalExs = allExercises.length;
  const doneExs = allExercises.filter((e) => e.sets.every((s) => s.locked) && e.sets.length > 0).length;
  const progressPct = totalSets > 0 ? (lockedSets / totalSets) * 100 : 0;
  const currentMuscle = MUSCLES.find((m) => m.id === muscle);

  // ── MUTATIONS ─────────────────────────────
  const toggleOpen = (grp, exIdx) => {
    setData((prev) => {
      const next = { ...prev };
      next[muscle] = { ...next[muscle] };
      next[muscle][grp] = next[muscle][grp].map((ex, i) =>
        i === exIdx ? { ...ex, open: !ex.open } : ex
      );
      return next;
    });
  };

  const updateSet = (grp, exIdx, setIdx, field, val) => {
    setData((prev) => {
      const next = { ...prev };
      next[muscle] = { ...next[muscle] };
      next[muscle][grp] = next[muscle][grp].map((ex, i) => {
        if (i !== exIdx) return ex;
        const sets = ex.sets.map((s, si) =>
          si === setIdx ? { ...s, [field]: val } : s
        );
        return { ...ex, sets };
      });
      return next;
    });
  };

  const toggleTick = (grp, exIdx, setIdx) => {
    const ex = data[muscle]?.[grp]?.[exIdx];
    if (!ex) return;
    const s = ex.sets[setIdx];

    if (s.locked) {
      setData((prev) => {
        const next = { ...prev };
        next[muscle] = { ...next[muscle] };
        next[muscle][grp] = next[muscle][grp].map((e, i) => {
          if (i !== exIdx) return e;
          return {
            ...e,
            sets: e.sets.map((ss, si) =>
              si === setIdx ? { ...ss, locked: false } : ss
            ),
          };
        });
        return next;
      });
      return;
    }

    const bad = {};
    let ok = true;
    if (!s.weight || isNaN(parseFloat(s.weight)) || parseFloat(s.weight) <= 0) {
      bad[`${grp}-${exIdx}-${setIdx}-w`] = true;
      ok = false;
    }
    if (!s.reps || isNaN(parseInt(s.reps)) || parseInt(s.reps) <= 0) {
      bad[`${grp}-${exIdx}-${setIdx}-r`] = true;
      ok = false;
    }
    if (!ok) {
      setShakes(bad);
      setTimeout(() => setShakes({}), 500);
      return;
    }

    setData((prev) => {
      const next = { ...prev };
      next[muscle] = { ...next[muscle] };
      next[muscle][grp] = next[muscle][grp].map((e, i) => {
        if (i !== exIdx) return e;
        return {
          ...e,
          sets: e.sets.map((ss, si) =>
            si === setIdx ? { ...ss, locked: true } : ss
          ),
        };
      });
      return next;
    });
  };

  const addSet = (grp, exIdx) => {
    setData((prev) => {
      const next = { ...prev };
      next[muscle] = { ...next[muscle] };
      next[muscle][grp] = next[muscle][grp].map((e, i) =>
        i === exIdx ? { ...e, sets: [...e.sets, createSet()] } : e
      );
      return next;
    });
  };

  const handleAddExercise = (equipmentType, exerciseName) => {
    setData((prev) => {
      const next = { ...prev };
      next[muscle] = { ...next[muscle] };
      const groupKey = equipmentType;
      if (!next[muscle][groupKey]) {
        next[muscle][groupKey] = [];
      }
      const newEx = createExercise(exerciseName);
      newEx.open = true;
      next[muscle][groupKey] = [...next[muscle][groupKey], newEx];
      return next;
    });
    setModalOpen(false);
    setOpenGroups((prev) => ({
      ...prev,
      [`${muscle}-${equipmentType}`]: true,
    }));
    showToast(`✨ Added "${exerciseName}" to ${equipmentType}`);
  };

  const handleFinish = async () => {
    // Collect all completed exercises across every muscle group
    const completedExercises = [];

    for (const muscleId of Object.keys(EQUIPMENT_GROUPS)) {
      const groups = EQUIPMENT_GROUPS[muscleId] || [];
      for (const grp of groups) {
        const exercises = data[muscleId]?.[grp.group] || [];
        for (const ex of exercises) {
          const lockedSetsForEx = ex.sets.filter((s) => s.locked);
          if (lockedSetsForEx.length === 0) continue;

          completedExercises.push({
            name: ex.name,
            muscle: muscleId,
            equipment: grp.group,
            sets: lockedSetsForEx.map((s) => ({
              weight: s.weight,
              reps: s.reps,
            })),
          });
        }
      }
    }

    if (completedExercises.length === 0) {
      showToast("⚠️ No completed sets to save");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/workout/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          exercises: completedExercises,
          startedAt: sessionStartRef.current,
          date: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save workout");
      }

      const result = await res.json();

      // Success — celebrate
      setCelebrating(true);
      setShowCelebration(true);
      showToast(`🔥 ${result.summary?.totalSets || lockedSets} sets logged!`);

      setTimeout(() => {
        setCelebrating(false);
        setShowCelebration(false);
        router.push("/");
      }, 2800);
    } catch (err) {
      console.error("Failed to save workout:", err);
      showToast(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>
      <div className="wl-app">
        <Confetti active={showCelebration} />

        {/* ── HEADER ── */}
        <header className="wl-header">
          <div className="wl-header-row">
            <button className="wl-back" aria-label="Back" onClick={() => router.back()}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M11 3L6 9l5 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="wl-title-block">
              <div className="wl-eyebrow">
                <span className="eyebrow-dot" />
                {lockedSets > 0 ? `${lockedSets}/${totalSets} sets` : "Start logging"}
              </div>
              <div className="wl-title">{currentMuscle?.label}</div>
            </div>
            <div className="wl-header-actions">
              <button
                className="wl-add-exercise-btn"
                onClick={() => setModalOpen(true)}
                aria-label="Add exercise"
              >
                <PlusIcon /> Add
              </button>
              <button
                className={`wl-finish-header-btn${celebrating ? " celebrating" : ""}`}
                onClick={handleFinish}
                disabled={saving}
              >
                {saving ? "Saving…" : "Finish"}
              </button>
            </div>
          </div>
          <div className="wl-progress-wrap">
            <div className="wl-progress-bar">
              <div className="wl-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </header>

        {/* ── MUSCLE TABS ── */}
        <div className="wl-rail-wrap">
          <div className="wl-rail-label">Select muscle group</div>
          <div className="wl-rail">
            {MUSCLES.map((m) => {
              const muscleExs = (EQUIPMENT_GROUPS[m.id] || []).flatMap(
                (g) => data[m.id]?.[g.group] || []
              );
              const muscleDone = muscleExs.reduce((a, e) => a + e.sets.filter((s) => s.locked).length, 0);
              const hasDone = muscleDone > 0;
              return (
                <button
                  key={m.id}
                  className={`wl-tab ${muscle === m.id ? "active" : ""}`}
                  onClick={() => setMuscle(m.id)}
                >
                  <span className="wl-tab-label">{m.label}</span>
                  <div className={`wl-tab-dot ${hasDone ? "wl-dot-done" : ""}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* ── EXERCISE GROUPS ── */}
        <div className="wl-groups">
          {muscleGroups.map((grp) => {
            const exercises = data[muscle]?.[grp.group] || [];
            const grpDone = exercises.reduce((a, e) => a + e.sets.filter((s) => s.locked).length, 0);
            const grpTotal = exercises.reduce((a, e) => a + e.sets.length, 0);
            const groupKey = `${muscle}-${grp.group}`;
            // Default to closed — user explicitly requested dropdowns closed by default.
            const isOpen = openGroups[groupKey] !== undefined ? openGroups[groupKey] : false;

            return (
              <div className="wl-group" key={grp.group}>
                <div
                  className="wl-group-header"
                  onClick={() =>
                    setOpenGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }))
                  }
                >
                  <div
                    className="wl-group-badge"
                    style={{ background: `${grp.color}18`, color: grp.color }}
                  >
                    {grp.icon}
                  </div>
                  <div className="wl-group-name">{grp.group}</div>
                  <div className={`wl-group-count${grpDone > 0 ? " has-progress" : ""}`}>
                    {grpDone > 0
                      ? `${grpDone}/${grpTotal} sets`
                      : `${exercises.length} ex.`}
                  </div>
                  <div className={`wl-group-chevron ${isOpen ? "open" : ""}`}>
                    <ChevronDown />
                  </div>
                </div>

                {isOpen && (
                  <div className="wl-group-body">
                    <div className="wl-exercise-list">
                      {exercises.map((ex, exIdx) => {
                        const done = ex.sets.filter((s) => s.locked).length;
                        const allDone = done === ex.sets.length && ex.sets.length > 0;
                        return (
                          <div
                            key={ex.name}
                            className={`wl-ex ${ex.open ? "open" : ""} ${allDone ? "all-done" : ""}`}
                          >
                            <div className="wl-ex-header" onClick={() => toggleOpen(grp.group, exIdx)}>
                              <Ring done={done} total={ex.sets.length} color={grp.color} />
                              <div className="wl-ex-info">
                                <div className="wl-ex-name">{ex.name}</div>
                                <div className="wl-ex-sub">
                                  <div
                                    className="wl-ex-tag"
                                    style={{ background: `${grp.color}15`, color: grp.color }}
                                  >
                                    {grp.icon}
                                  </div>
                                  <div className="wl-sets-count">{ex.sets.length} sets</div>
                                </div>
                              </div>
                              <div className="wl-chevron">
                                <ChevronDown />
                              </div>
                            </div>

                            {ex.open && (
                              <div className="wl-sets-panel">
                                <div className="wl-sets-top">
                                  <div className="wl-set-num" />
                                  <div className="wl-col-head">Weight (kg)</div>
                                  <div className="wl-col-head">Reps</div>
                                  <div className="wl-col-tick" />
                                </div>

                                {ex.sets.map((s, setIdx) => {
                                  const wk = `${grp.group}-${exIdx}-${setIdx}-w`;
                                  const rk = `${grp.group}-${exIdx}-${setIdx}-r`;
                                  return (
                                    <div className="wl-set-row" key={setIdx}>
                                      <div className="wl-set-num-label">{setIdx + 1}</div>
                                      <div className="wl-input-wrap">
                                        <input
                                          type="number"
                                          className={`wl-input${s.locked ? " done" : ""}${shakes[wk] ? " err" : ""}`}
                                          placeholder="–"
                                          value={s.weight}
                                          disabled={s.locked}
                                          onChange={(e) =>
                                            updateSet(grp.group, exIdx, setIdx, "weight", e.target.value)
                                          }
                                          inputMode="decimal"
                                        />
                                      </div>
                                      <div className="wl-input-wrap">
                                        <input
                                          type="number"
                                          className={`wl-input${s.locked ? " done" : ""}${shakes[rk] ? " err" : ""}`}
                                          placeholder="–"
                                          value={s.reps}
                                          disabled={s.locked}
                                          onChange={(e) =>
                                            updateSet(grp.group, exIdx, setIdx, "reps", e.target.value)
                                          }
                                          inputMode="numeric"
                                        />
                                      </div>
                                      <button
                                        className={`wl-tick${s.locked ? " wl-tick-done" : ""}`}
                                        onClick={() => toggleTick(grp.group, exIdx, setIdx)}
                                        aria-label={s.locked ? "Unlock set" : "Complete set"}
                                      >
                                        {s.locked ? <Check /> : <Circle />}
                                      </button>
                                    </div>
                                  );
                                })}

                                <button className="wl-add-set" onClick={() => addSet(grp.group, exIdx)}>
                                  <PlusIcon /> Add Set
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── ADD EXERCISE MODAL ── */}
        <AddExerciseModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onAdd={handleAddExercise}
          currentMuscle={currentMuscle}
        />

        {/* ── TOAST ── */}
        <div className={`wl-toast${toast.show ? " show" : ""}`}>{toast.msg}</div>

        {/* ── CELEBRATION OVERLAY ── */}
        {showCelebration && (
          <div className="wl-celebrate-overlay" onClick={() => setShowCelebration(false)}>
            <div className="wl-celebrate-card">
              <span className="emoji-big">🏆</span>
              <div className="title">Workout Complete!</div>
              <div className="sub">
                <strong>{lockedSets}</strong> sets logged across <strong>{doneExs}</strong> exercises
              </div>
            </div>
          </div>
        )}
        <KaiAssistant isOpen={isKaiOpen} onClose={() => setIsKaiOpen(false)} />
      </div>
    </>
  );
}