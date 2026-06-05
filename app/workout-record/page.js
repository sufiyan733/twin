// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";

// // ─────────────────────────────────────────────
// // DATA — grouped by equipment type
// // ─────────────────────────────────────────────

// const MUSCLES = [
//   { id: "chest", label: "Chest", emoji: "🫁" },
//   { id: "back", label: "Back", emoji: "🔙" },
//   { id: "shoulders", label: "Shoulders", emoji: "💪" },
//   { id: "arms", label: "Arms", emoji: "💪" },
//   { id: "legs", label: "Legs", emoji: "🦵" },
//   { id: "core", label: "Core", emoji: "🎯" },
// ];

// const EQUIPMENT_GROUPS = {
//   chest: [
//     {
//       group: "Barbell",
//       icon: "BB",
//       color: "#FF6B35",
//       exercises: [
//         "Flat Barbell Bench Press",
//         "Incline Barbell Press",
//         "Decline Barbell Press",
//         "Landmine Press",
//       ],
//     },
//     {
//       group: "Dumbbell",
//       icon: "DB",
//       color: "#4ECDC4",
//       exercises: [
//         "Incline Dumbbell Press",
//         "Flat Dumbbell Press",
//         "Dumbbell Fly",
//         "Svend Press",
//       ],
//     },
//     {
//       group: "Cable / Machine",
//       icon: "CA",
//       color: "#A855F7",
//       exercises: [
//         "Cable Fly (Mid)",
//         "Incline Cable Fly",
//         "Low-to-High Cable Fly",
//         "Pec Deck Machine",
//         "Chest Dip",
//         "Push Up",
//       ],
//     },
//   ],
//   back: [
//     {
//       group: "Barbell",
//       icon: "BB",
//       color: "#FF6B35",
//       exercises: [
//         "Barbell Bent-Over Row",
//         "Deadlift",
//         "Rack Pull",
//         "T-Bar Row",
//         "Meadows Row",
//       ],
//     },
//     {
//       group: "Dumbbell",
//       icon: "DB",
//       color: "#4ECDC4",
//       exercises: [
//         "Single-Arm Dumbbell Row",
//         "Chest-Supported Row",
//       ],
//     },
//     {
//       group: "Cable / Machine",
//       icon: "CA",
//       color: "#A855F7",
//       exercises: [
//         "Lat Pulldown",
//         "Seated Cable Row",
//         "Straight-Arm Pulldown",
//         "Face Pull",
//         "Pull Up / Chin Up",
//       ],
//     },
//   ],
//   shoulders: [
//     {
//       group: "Barbell",
//       icon: "BB",
//       color: "#FF6B35",
//       exercises: [
//         "Barbell Overhead Press",
//         "Upright Row",
//         "Cuban Press",
//       ],
//     },
//     {
//       group: "Dumbbell",
//       icon: "DB",
//       color: "#4ECDC4",
//       exercises: [
//         "Dumbbell Lateral Raise",
//         "Seated Dumbbell Press",
//         "Arnold Press",
//         "Rear Delt Fly",
//         "Front Raise",
//         "Plate Front Raise",
//       ],
//     },
//     {
//       group: "Cable / Machine",
//       icon: "CA",
//       color: "#A855F7",
//       exercises: [
//         "Cable Lateral Raise",
//         "Machine Shoulder Press",
//         "Face Pull",
//       ],
//     },
//   ],
//   arms: [
//     {
//       group: "Barbell",
//       icon: "BB",
//       color: "#FF6B35",
//       exercises: [
//         "Barbell Curl",
//         "Skull Crusher",
//         "Close-Grip Bench Press",
//         "Reverse Curl",
//       ],
//     },
//     {
//       group: "Dumbbell",
//       icon: "DB",
//       color: "#4ECDC4",
//       exercises: [
//         "Incline Dumbbell Curl",
//         "Hammer Curl",
//         "Overhead Tricep Extension",
//         "Concentration Curl",
//         "Dips (Tricep Focus)",
//       ],
//     },
//     {
//       group: "Cable / Machine",
//       icon: "CA",
//       color: "#A855F7",
//       exercises: [
//         "Tricep Pushdown (Cable)",
//         "Cable Curl",
//         "Preacher Curl",
//       ],
//     },
//   ],
//   legs: [
//     {
//       group: "All Exercises",
//       icon: "ALL",
//       color: "#F59E0B",
//       exercises: [
//         "Barbell Back Squat",
//         "Romanian Deadlift",
//         "Leg Press",
//         "Bulgarian Split Squat",
//         "Hip Thrust",
//         "Hack Squat",
//         "Leg Curl (Lying)",
//         "Leg Extension",
//         "Lunges",
//         "Calf Raise (Standing)",
//         "Nordic Curl",
//         "Goblet Squat",
//       ],
//     },
//   ],
//   core: [
//     {
//       group: "Weighted",
//       icon: "WT",
//       color: "#FF6B35",
//       exercises: [
//         "Cable Crunch",
//         "Decline Weighted Crunch",
//         "Pallof Press",
//         "Russian Twist",
//         "Ab Wheel Rollout",
//       ],
//     },
//     {
//       group: "Bodyweight",
//       icon: "BW",
//       color: "#4ECDC4",
//       exercises: [
//         "Hanging Leg Raise",
//         "Plank",
//         "Bicycle Crunch",
//         "Toe Touches",
//         "Dead Bug",
//         "Dragon Flag",
//         "Mountain Climber",
//       ],
//     },
//   ],
// };

// // ─────────────────────────────────────────────
// // HELPERS
// // ─────────────────────────────────────────────

// const createSet = () => ({ weight: "", reps: "", locked: false });
// const createExercise = (name) => ({ name, sets: [createSet(), createSet(), createSet()], open: false });
// const initData = () => {
//   const d = {};
//   Object.keys(EQUIPMENT_GROUPS).forEach((m) => {
//     d[m] = {};
//     EQUIPMENT_GROUPS[m].forEach((grp) => {
//       d[m][grp.group] = grp.exercises.map(createExercise);
//     });
//   });
//   return d;
// };

// // ─────────────────────────────────────────────
// // STYLES
// // ─────────────────────────────────────────────

// const CSS = `
//   @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

//   *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

//   :root {
//     --bg:         #05070f;
//     --bg2:        #080c18;
//     --surface:    #0c1020;
//     --card:       #0f1426;
//     --card2:      #131929;
//     --line:       rgba(255,255,255,0.06);
//     --line2:      rgba(255,255,255,0.1);
//     --line3:      rgba(255,255,255,0.18);
//     --a1:         #3b82f6;
//     --a2:         #60a5fa;
//     --a3:         #93c5fd;
//     --g1:         #10b981;
//     --g2:         #34d399;
//     --o1:         #f59e0b;
//     --r1:         #ef4444;
//     --text:       #f0f4ff;
//     --text2:      rgba(240,244,255,0.65);
//     --text3:      rgba(240,244,255,0.35);
//     --mono:       'JetBrains Mono', monospace;
//     --display:    'Outfit', sans-serif;
//     --body:       'Space Grotesk', sans-serif;
//     --rad:        20px;
//     --rad-sm:     12px;
//     --rad-xs:     8px;
//   }

//   html,body { background: var(--bg); height: 100%; }

//   .wl-app {
//     background: var(--bg);
//     min-height: 100dvh;
//     font-family: var(--body);
//     color: var(--text);
//     max-width: 430px;
//     margin: 0 auto;
//     position: relative;
//     overflow-x: hidden;
//     padding-bottom: 100px;
//   }

//   /* ── SCANLINES OVERLAY ── */
//   .wl-app::before {
//     content:'';
//     position:fixed;
//     inset:0;
//     background: repeating-linear-gradient(
//       0deg,
//       transparent,
//       transparent 2px,
//       rgba(0,0,0,0.03) 2px,
//       rgba(0,0,0,0.03) 4px
//     );
//     pointer-events:none;
//     z-index:998;
//   }

//   /* ── AMBIENT GLOWS ── */
//   .wl-glow {
//     position:fixed;
//     border-radius:50%;
//     pointer-events:none;
//     z-index:0;
//     transition: all 1.2s ease;
//   }
//   .wl-glow-1 {
//     width:500px;height:500px;
//     background:radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%);
//     top:-150px;left:-150px;
//   }
//   .wl-glow-2 {
//     width:400px;height:400px;
//     background:radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%);
//     bottom:0;right:-100px;
//   }

//   /* ── HEADER ── */
//   .wl-header {
//     position:sticky;
//     top:0;z-index:50;
//     padding: 16px 20px 14px;
//     background: rgba(5,7,15,0.88);
//     backdrop-filter: blur(24px) saturate(1.4);
//     -webkit-backdrop-filter: blur(24px) saturate(1.4);
//     border-bottom: 1px solid var(--line);
//   }

//   .wl-header-row {
//     display:flex;
//     align-items:center;
//     gap:14px;
//   }

//   .wl-back {
//     width:44px;height:44px;flex-shrink:0;
//     border-radius:12px;
//     background:var(--card);
//     border:1px solid var(--line2);
//     display:flex;align-items:center;justify-content:center;
//     cursor:pointer;color:var(--text2);
//     transition:all 0.2s;
//   }
//   .wl-back:hover { background:var(--card2); color:var(--text); }
//   .wl-back:active { transform:scale(0.92); }

//   .wl-title-block { flex:1;min-width:0; }
//   .wl-eyebrow {
//     font-family:var(--mono);
//     font-size:9px;font-weight:500;
//     letter-spacing:3.5px;
//     color:var(--a1);
//     text-transform:uppercase;
//     margin-bottom:2px;
//   }
//   .wl-title {
//     font-family:var(--display);
//     font-size:26px;font-weight:800;
//     color:#fff;line-height:1;
//     letter-spacing:-0.8px;
//   }

//   /* ── FINISH HEADER BTN ── */
//   .wl-finish-header-btn {
//     padding: 8px 18px;
//     border-radius: 99px;
//     border: none;
//     background: linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%);
//     font-family: var(--body);
//     font-size: 12px;
//     font-weight: 700;
//     letter-spacing: 0.5px;
//     text-transform: uppercase;
//     color: #fff;
//     cursor: pointer;
//     transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
//     box-shadow: 0 4px 12px rgba(59,130,246,0.3);
//     flex-shrink: 0;
//   }
//   .wl-finish-header-btn:hover { opacity: 0.92; box-shadow: 0 6px 16px rgba(59,130,246,0.4); }
//   .wl-finish-header-btn:active { transform: scale(0.95); }
//   .wl-finish-header-btn.celebrating {
//     background: linear-gradient(135deg,#10b981,#059669);
//     box-shadow: 0 4px 12px rgba(16,185,129,0.35);
//     animation: wl-celebrate 0.5s ease;
//   }

//   /* ── PROGRESS BAR ── */
//   .wl-progress-bar {
//     height:2px;
//     background:var(--line);
//     position:relative;
//     overflow:hidden;
//   }
//   .wl-progress-fill {
//     height:100%;
//     background:linear-gradient(90deg,var(--a1),var(--g1));
//     transition:width 0.6s cubic-bezier(.4,0,.2,1);
//     border-radius:1px;
//   }

//   /* ── MUSCLE RAIL ── */
//   .wl-rail-wrap {
//     padding:14px 0 0;
//   }
//   .wl-rail-label {
//     font-size:9px;font-weight:700;
//     letter-spacing:2.5px;
//     color:var(--text3);
//     text-transform:uppercase;
//     margin-bottom:8px;
//     padding:0 20px;
//   }
//   .wl-rail {
//     display:flex;
//     gap:6px;
//     overflow-x:auto;
//     scrollbar-width:none;
//     padding:0 20px 14px;
//   }
//   .wl-rail::-webkit-scrollbar{display:none;}

//   .wl-tab {
//     flex-shrink:0;
//     display:flex;flex-direction:column;align-items:center;
//     padding:10px 16px 8px;
//     border-radius:16px;
//     border:1.5px solid var(--line2);
//     background:var(--card);
//     cursor:pointer;
//     transition:all 0.22s ease;
//     position:relative;
//     overflow:hidden;
//     min-width:72px;
//   }
//   .wl-tab-label {
//     font-family:var(--body);
//     font-size:12px;font-weight:600;
//     color:var(--text3);
//     transition:color 0.22s;
//     white-space:nowrap;
//     position:relative;z-index:1;
//   }
//   .wl-tab-dot {
//     width:4px;height:4px;border-radius:50%;
//     background:var(--text3);
//     margin-top:5px;
//     transition:all 0.22s;
//     position:relative;z-index:1;
//   }
//   .wl-tab::before {
//     content:'';position:absolute;inset:0;
//     background:linear-gradient(135deg, var(--a1), #1d4ed8);
//     opacity:0;transition:opacity 0.22s;
//   }
//   .wl-tab:hover .wl-tab-label { color:var(--text2); }
//   .wl-tab.active {
//     border-color:var(--a1);
//     box-shadow:0 0 0 1px rgba(59,130,246,0.2), 0 4px 24px rgba(59,130,246,0.15);
//   }
//   .wl-tab.active::before { opacity:1; }
//   .wl-tab.active .wl-tab-label { color:#fff;font-weight:700; }
//   .wl-tab.active .wl-tab-dot { background:rgba(255,255,255,0.5); }

//   /* ── DIVIDER ── */
//   .wl-divider { height:1px;background:var(--line);margin:0; }

//   /* ── EQUIPMENT GROUP ── */
//   .wl-groups {
//     padding: 16px 16px 0;
//     display:flex;flex-direction:column;gap:20px;
//   }

//   .wl-group {}

//   .wl-group-header {
//     display:flex;align-items:center;gap:10px;
//     padding:0 4px 10px;
//   }

//   .wl-group-badge {
//     width:32px;height:20px;
//     border-radius:6px;
//     display:flex;align-items:center;justify-content:center;
//     font-family:var(--mono);
//     font-size:8px;font-weight:700;
//     letter-spacing:0.5px;
//     flex-shrink:0;
//   }

//   .wl-group-name {
//     font-size:11px;font-weight:700;
//     letter-spacing:2px;
//     text-transform:uppercase;
//     color:var(--text3);
//     flex:1;
//   }

//   .wl-group-count {
//     font-family:var(--mono);
//     font-size:11px;
//     color:var(--text3);
//   }

//   .wl-exercise-list {
//     display:flex;flex-direction:column;gap:6px;
//   }

//   /* ── EXERCISE CARD ── */
//   .wl-ex {
//     background:var(--card);
//     border:1.5px solid var(--line);
//     border-radius:var(--rad);
//     overflow:hidden;
//     transition:border-color 0.25s, box-shadow 0.25s, transform 0.15s;
//   }
//   .wl-ex:active { transform:scale(0.995); }
//   .wl-ex.open {
//     border-color:rgba(59,130,246,0.35);
//     box-shadow:0 2px 24px rgba(59,130,246,0.08),
//                0 0 0 1px rgba(59,130,246,0.1);
//   }
//   .wl-ex.all-done {
//     border-color:rgba(16,185,129,0.35);
//     box-shadow:0 2px 20px rgba(16,185,129,0.07);
//   }

//   .wl-ex-header {
//     display:flex;align-items:center;gap:12px;
//     padding:14px 14px;
//     cursor:pointer;
//     user-select:none;
//     -webkit-tap-highlight-color:transparent;
//   }

//   /* ring */
//   .wl-ring {
//     position:relative;width:36px;height:36px;flex-shrink:0;
//   }
//   .wl-ring svg { transform:rotate(-90deg); }
//   .wl-ring-track { fill:none;stroke:rgba(255,255,255,0.06);stroke-width:2.5; }
//   .wl-ring-fill  { fill:none;stroke-width:2.5;stroke-linecap:round;transition:stroke-dashoffset 0.5s ease; }
//   .wl-ring-label {
//     position:absolute;inset:0;
//     display:flex;align-items:center;justify-content:center;
//     font-family:var(--mono);
//     font-size:9px;font-weight:600;
//     color:var(--text3);
//   }

//   .wl-ex-info { flex:1;min-width:0; }
//   .wl-ex-name {
//     font-size:13.5px;font-weight:700;
//     color:var(--text);
//     letter-spacing:-0.2px;
//     white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
//     line-height:1.3;
//   }
//   .wl-ex-sub {
//     display:flex;align-items:center;gap:6px;
//     margin-top:3px;
//   }
//   .wl-ex-tag {
//     font-size:9.5px;font-weight:700;
//     letter-spacing:1.2px;
//     text-transform:uppercase;
//     padding:2px 7px;
//     border-radius:4px;
//   }
//   .wl-sets-count {
//     font-family:var(--mono);
//     font-size:10px;
//     color:var(--text3);
//   }

//   .wl-chevron {
//     width:28px;height:28px;flex-shrink:0;
//     border-radius:50%;
//     background:rgba(255,255,255,0.04);
//     border:1px solid var(--line2);
//     display:flex;align-items:center;justify-content:center;
//     color:var(--text3);
//     transition:all 0.25s;
//   }
//   .wl-ex.open .wl-chevron {
//     transform:rotate(180deg);
//     background:rgba(59,130,246,0.12);
//     border-color:rgba(59,130,246,0.3);
//     color:var(--a2);
//   }

//   /* ── SETS PANEL ── */
//   .wl-sets-panel {
//     padding:0 14px 16px;
//     animation: wl-slide 0.2s ease;
//   }
//   @keyframes wl-slide {
//     from{opacity:0;transform:translateY(-8px);}
//     to  {opacity:1;transform:translateY(0);}
//   }

//   .wl-sets-top {
//     display:flex;align-items:center;gap:8px;
//     padding:10px 0 10px;
//     border-top:1px solid var(--line);
//     margin-bottom:4px;
//   }
//   .wl-set-num {
//     font-family:var(--mono);
//     font-size:9px;font-weight:700;
//     letter-spacing:2px;
//     text-transform:uppercase;
//     color:var(--text3);
//     width:20px;flex-shrink:0;
//   }
//   .wl-col-head {
//     flex:1;
//     font-size:9px;font-weight:700;
//     letter-spacing:2px;
//     text-transform:uppercase;
//     color:var(--text3);
//     text-align:center;
//   }
//   .wl-col-tick { width:40px;flex-shrink:0; }

//   .wl-set-row {
//     display:flex;align-items:center;gap:8px;
//     margin-bottom:6px;
//   }

//   .wl-set-num-label {
//     font-family:var(--mono);
//     font-size:10px;font-weight:600;
//     color:var(--text3);
//     width:20px;flex-shrink:0;
//     text-align:center;
//   }

//   .wl-input-wrap { flex:1;position:relative; }

//   .wl-input {
//     width:100%;
//     height:52px;
//     background:rgba(255,255,255,0.04);
//     border:1.5px solid var(--line2);
//     border-radius:var(--rad-xs);
//     padding:10px 8px;
//     font-family:var(--mono);
//     font-size:16px;font-weight:600;
//     color:var(--text);
//     text-align:center;
//     outline:none;
//     -moz-appearance:textfield;
//     transition:border-color 0.2s,background 0.2s,color 0.2s;
//   }
//   .wl-input::-webkit-outer-spin-button,
//   .wl-input::-webkit-inner-spin-button{-webkit-appearance:none;}
//   .wl-input::placeholder{color:rgba(255,255,255,0.15);}
//   .wl-input:focus:not(:disabled){
//     border-color:var(--a1);
//     background:rgba(59,130,246,0.07);
//     color:#fff;
//   }
//   .wl-input:disabled,.wl-input.done{
//     border-color:rgba(16,185,129,0.3);
//     background:rgba(16,185,129,0.06);
//     color:var(--g2);
//     cursor:default;
//   }
//   .wl-input.err{
//     border-color:rgba(239,68,68,0.5);
//     animation: wl-shake 0.35s;
//   }
//   @keyframes wl-shake{
//     0%,100%{transform:translateX(0);}
//     25%{transform:translateX(-4px);}
//     75%{transform:translateX(4px);}
//   }

//   /* ── TICK ── */
//   .wl-tick {
//     width:44px;height:44px;flex-shrink:0;
//     border-radius:10px;
//     border:1.5px solid var(--line2);
//     background:rgba(255,255,255,0.03);
//     display:flex;align-items:center;justify-content:center;
//     cursor:pointer;
//     -webkit-tap-highlight-color:transparent;
//     transition:all 0.22s cubic-bezier(.34,1.56,.64,1);
//     color:var(--text3);
//   }
//   .wl-tick:hover:not(.wl-tick-done){
//     border-color:var(--a2);
//     color:var(--a2);
//     background:rgba(59,130,246,0.07);
//   }
//   .wl-tick.wl-tick-done {
//     background:var(--g1);
//     border-color:var(--g1);
//     color:#fff;
//     box-shadow:0 0 20px rgba(16,185,129,0.35);
//     transform:scale(1.06);
//   }
//   .wl-tick.wl-tick-done:hover{transform:scale(1.02);}

//   .wl-add-set {
//     width:100%;
//     min-height:44px;
//     margin-top:10px;
//     padding:9px;
//     border-radius:var(--rad-xs);
//     border:1.5px dashed rgba(59,130,246,0.2);
//     background:transparent;
//     font-family:var(--body);
//     font-size:11px;font-weight:700;
//     letter-spacing:1.5px;
//     text-transform:uppercase;
//     color:rgba(59,130,246,0.6);
//     cursor:pointer;
//     transition:all 0.2s;
//   }
//   .wl-add-set:hover{
//     background:rgba(59,130,246,0.06);
//     border-color:rgba(59,130,246,0.4);
//     color:var(--a2);
//   }



//   /* ── TOAST ── */
//   .wl-toast {
//     position:fixed;
//     top: 88px;left:50%;
//     transform:translateX(-50%) translateY(-20px);
//     background:var(--g1);
//     color:#fff;
//     padding:11px 22px;
//     border-radius:99px;
//     font-family:var(--body);
//     font-size:13px;font-weight:700;
//     opacity:0;pointer-events:none;
//     white-space:nowrap;z-index:300;
//     transition:all 0.4s cubic-bezier(.34,1.56,.64,1);
//     box-shadow:0 4px 24px rgba(16,185,129,0.4);
//   }
//   .wl-toast.show{
//     opacity:1;
//     transform:translateX(-50%) translateY(0);
//   }

//   /* ── EMPTY ── */
//   .wl-empty{
//     padding:48px 24px;
//     text-align:center;
//     color:var(--text3);
//     font-size:13px;
//     font-style:italic;
//   }

//   /* scrollbar hide for groups area */
//   .wl-groups-scroll{
//     overflow-y:auto;
//     scrollbar-width:none;
//   }
//   .wl-groups-scroll::-webkit-scrollbar{display:none;}
// `;

// // ─────────────────────────────────────────────
// // RING COMPONENT
// // ─────────────────────────────────────────────
// function Ring({ done, total, color }) {
//   const R = 14;
//   const C = 2 * Math.PI * R;
//   const pct = total > 0 ? done / total : 0;
//   const offset = C - pct * C;
//   const stroke = done === total && total > 0 ? "var(--g1)" : (color || "var(--a1)");
//   const label = done > 0 ? `${done}/${total}` : `${total}`;
//   return (
//     <div className="wl-ring">
//       <svg width="36" height="36" viewBox="0 0 36 36">
//         <circle className="wl-ring-track" cx="18" cy="18" r={R} />
//         <circle
//           className="wl-ring-fill"
//           cx="18" cy="18" r={R}
//           stroke={stroke}
//           strokeDasharray={C}
//           strokeDashoffset={offset}
//         />
//       </svg>
//       <div className="wl-ring-label">{label}</div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────
// // ICONS
// // ─────────────────────────────────────────────
// const ChevronDown = () => (
//   <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
//     <path d="M2.5 4.5L6.5 8.5L10.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//   </svg>
// );
// const Check = () => (
//   <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
//     <path d="M2.5 8L6 11.5L12.5 3.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
//   </svg>
// );
// const Circle = () => (
//   <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
//     <circle cx="7.5" cy="7.5" r="4.5" stroke="currentColor" strokeWidth="1.8" />
//   </svg>
// );
// const PlusIcon = () => (
//   <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
//     <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
//   </svg>
// );

// // ─────────────────────────────────────────────
// // MAIN
// // ─────────────────────────────────────────────
// export default function WorkoutLogger() {
//   const router = useRouter();
//   const [muscle, setMuscle] = useState("chest");
//   const [data, setData] = useState(initData);
//   const [shakes, setShakes] = useState({});
//   const [toast, setToast] = useState({ show: false, msg: "" });
//   const [celebrating, setCelebrating] = useState(false);

//   const showToast = (msg) => {
//     setToast({ show: true, msg });
//     setTimeout(() => setToast({ show: false, msg: "" }), 2400);
//   };

//   // ── STATS ─────────────────────────────────
//   const muscleGroups = EQUIPMENT_GROUPS[muscle] || [];
//   const allExercises = muscleGroups.flatMap((g) => data[muscle]?.[g.group] || []);
//   const totalSets = allExercises.reduce((a, e) => a + e.sets.length, 0);
//   const lockedSets = allExercises.reduce((a, e) => a + e.sets.filter((s) => s.locked).length, 0);
//   const totalExs = allExercises.length;
//   const doneExs = allExercises.filter((e) => e.sets.every((s) => s.locked) && e.sets.length > 0).length;
//   const progressPct = totalSets > 0 ? (lockedSets / totalSets) * 100 : 0;

//   const currentMuscle = MUSCLES.find((m) => m.id === muscle);

//   // ── MUTATIONS ─────────────────────────────
//   const toggleOpen = (grp, exIdx) => {
//     setData((prev) => {
//       const next = { ...prev };
//       next[muscle] = { ...next[muscle] };
//       next[muscle][grp] = next[muscle][grp].map((ex, i) =>
//         i === exIdx ? { ...ex, open: !ex.open } : ex
//       );
//       return next;
//     });
//   };

//   const updateSet = (grp, exIdx, setIdx, field, val) => {
//     setData((prev) => {
//       const next = { ...prev };
//       next[muscle] = { ...next[muscle] };
//       next[muscle][grp] = next[muscle][grp].map((ex, i) => {
//         if (i !== exIdx) return ex;
//         const sets = ex.sets.map((s, si) =>
//           si === setIdx ? { ...s, [field]: val } : s
//         );
//         return { ...ex, sets };
//       });
//       return next;
//     });
//   };

//   const toggleTick = (grp, exIdx, setIdx) => {
//     const ex = data[muscle]?.[grp]?.[exIdx];
//     if (!ex) return;
//     const s = ex.sets[setIdx];

//     if (s.locked) {
//       setData((prev) => {
//         const next = { ...prev };
//         next[muscle] = { ...next[muscle] };
//         next[muscle][grp] = next[muscle][grp].map((e, i) => {
//           if (i !== exIdx) return e;
//           return {
//             ...e, sets: e.sets.map((ss, si) =>
//               si === setIdx ? { ...ss, locked: false } : ss
//             )
//           };
//         });
//         return next;
//       });
//       return;
//     }

//     const bad = {};
//     let ok = true;
//     if (!s.weight || isNaN(parseFloat(s.weight)) || parseFloat(s.weight) <= 0) {
//       bad[`${grp}-${exIdx}-${setIdx}-w`] = true; ok = false;
//     }
//     if (!s.reps || isNaN(parseInt(s.reps)) || parseInt(s.reps) <= 0) {
//       bad[`${grp}-${exIdx}-${setIdx}-r`] = true; ok = false;
//     }
//     if (!ok) { setShakes(bad); setTimeout(() => setShakes({}), 450); return; }

//     setData((prev) => {
//       const next = { ...prev };
//       next[muscle] = { ...next[muscle] };
//       next[muscle][grp] = next[muscle][grp].map((e, i) => {
//         if (i !== exIdx) return e;
//         return {
//           ...e, sets: e.sets.map((ss, si) =>
//             si === setIdx ? { ...ss, locked: true } : ss
//           )
//         };
//       });
//       return next;
//     });
//   };

//   const addSet = (grp, exIdx) => {
//     setData((prev) => {
//       const next = { ...prev };
//       next[muscle] = { ...next[muscle] };
//       next[muscle][grp] = next[muscle][grp].map((e, i) =>
//         i === exIdx ? { ...e, sets: [...e.sets, createSet()] } : e
//       );
//       return next;
//     });
//   };

//   const handleFinish = () => {
//     setCelebrating(true);
//     showToast(`🔥 ${lockedSets} sets logged — Crushing it!`);
//     setTimeout(() => setCelebrating(false), 600);
//   };

//   // ─────────────────────────────────────────────
//   return (
//     <>
//       <style>{CSS}</style>
//       <div className="wl-app">
//         <div className="wl-glow wl-glow-1" />
//         <div className="wl-glow wl-glow-2" />

//         {/* ── HEADER ── */}
//         <header className="wl-header">
//           <div className="wl-header-row">
//             <button className="wl-back" aria-label="Back" onClick={() => router.back()}>
//               <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//                 <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//               </svg>
//             </button>
//             <div className="wl-title-block">
//               <div className="wl-eyebrow">Log Workout {lockedSets > 0 && `• ${lockedSets} sets`}</div>
//               <div className="wl-title">{currentMuscle?.label}</div>
//             </div>
//             <button
//               className={`wl-finish-header-btn${celebrating ? " celebrating" : ""}`}
//               onClick={handleFinish}
//             >
//               Finish
//             </button>
//           </div>
//         </header>

//         {/* PROGRESS */}
//         <div className="wl-progress-bar">
//           <div className="wl-progress-fill" style={{ width: `${progressPct}%` }} />
//         </div>

//         {/* ── MUSCLE TABS ── */}
//         <div className="wl-rail-wrap">
//           <div className="wl-rail-label">Body Part</div>
//           <div className="wl-rail">
//             {MUSCLES.map((m) => (
//               <button
//                 key={m.id}
//                 className={`wl-tab ${muscle === m.id ? "active" : ""}`}
//                 onClick={() => setMuscle(m.id)}
//               >
//                 <span className="wl-tab-label">{m.label}</span>
//                 <div className="wl-tab-dot" />
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className="wl-divider" />

//         {/* ── EXERCISE GROUPS ── */}
//         <div className="wl-groups">
//           {muscleGroups.map((grp) => {
//             const exercises = data[muscle]?.[grp.group] || [];
//             const grpDone = exercises.reduce((a, e) => a + e.sets.filter((s) => s.locked).length, 0);
//             const grpTotal = exercises.reduce((a, e) => a + e.sets.length, 0);
//             return (
//               <div className="wl-group" key={grp.group}>
//                 {/* Group Header */}
//                 <div className="wl-group-header">
//                   <div
//                     className="wl-group-badge"
//                     style={{ background: `${grp.color}22`, color: grp.color }}
//                   >
//                     {grp.icon}
//                   </div>
//                   <div className="wl-group-name">{grp.group}</div>
//                   <div className="wl-group-count">
//                     {grpDone > 0 ? `${grpDone}/${grpTotal} sets` : `${exercises.length} exercises`}
//                   </div>
//                 </div>

//                 {/* Exercise Cards */}
//                 <div className="wl-exercise-list">
//                   {exercises.map((ex, exIdx) => {
//                     const done = ex.sets.filter((s) => s.locked).length;
//                     const allDone = done === ex.sets.length && ex.sets.length > 0;
//                     return (
//                       <div
//                         key={ex.name}
//                         className={`wl-ex ${ex.open ? "open" : ""} ${allDone ? "all-done" : ""}`}
//                       >
//                         {/* CARD HEADER */}
//                         <div className="wl-ex-header" onClick={() => toggleOpen(grp.group, exIdx)}>
//                           <Ring done={done} total={ex.sets.length} color={grp.color} />
//                           <div className="wl-ex-info">
//                             <div className="wl-ex-name">{ex.name}</div>
//                             <div className="wl-ex-sub">
//                               <div
//                                 className="wl-ex-tag"
//                                 style={{ background: `${grp.color}18`, color: grp.color }}
//                               >
//                                 {grp.icon}
//                               </div>
//                               <div className="wl-sets-count">{ex.sets.length} sets</div>
//                             </div>
//                           </div>
//                           <div className="wl-chevron">
//                             <ChevronDown />
//                           </div>
//                         </div>

//                         {/* SETS PANEL */}
//                         {ex.open && (
//                           <div className="wl-sets-panel">
//                             {/* column headers */}
//                             <div className="wl-sets-top">
//                               <div className="wl-set-num" />
//                               <div className="wl-col-head">Weight (kg)</div>
//                               <div className="wl-col-head">Reps</div>
//                               <div className="wl-col-tick" />
//                             </div>

//                             {ex.sets.map((s, setIdx) => {
//                               const wk = `${grp.group}-${exIdx}-${setIdx}-w`;
//                               const rk = `${grp.group}-${exIdx}-${setIdx}-r`;
//                               return (
//                                 <div className="wl-set-row" key={setIdx}>
//                                   <div className="wl-set-num-label">{setIdx + 1}</div>
//                                   {/* weight */}
//                                   <div className="wl-input-wrap">
//                                     <input
//                                       type="number"
//                                       className={`wl-input${s.locked ? " done" : ""}${shakes[wk] ? " err" : ""}`}
//                                       placeholder="–"
//                                       value={s.weight}
//                                       disabled={s.locked}
//                                       onChange={(e) => updateSet(grp.group, exIdx, setIdx, "weight", e.target.value)}
//                                       inputMode="decimal"
//                                     />
//                                   </div>
//                                   {/* reps */}
//                                   <div className="wl-input-wrap">
//                                     <input
//                                       type="number"
//                                       className={`wl-input${s.locked ? " done" : ""}${shakes[rk] ? " err" : ""}`}
//                                       placeholder="–"
//                                       value={s.reps}
//                                       disabled={s.locked}
//                                       onChange={(e) => updateSet(grp.group, exIdx, setIdx, "reps", e.target.value)}
//                                       inputMode="numeric"
//                                     />
//                                   </div>
//                                   {/* tick */}
//                                   <button
//                                     className={`wl-tick${s.locked ? " wl-tick-done" : ""}`}
//                                     onClick={() => toggleTick(grp.group, exIdx, setIdx)}
//                                     aria-label={s.locked ? "Unlock set" : "Complete set"}
//                                   >
//                                     {s.locked ? <Check /> : <Circle />}
//                                   </button>
//                                 </div>
//                               );
//                             })}

//                             <button className="wl-add-set" onClick={() => addSet(grp.group, exIdx)}>
//                               + Add Set
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             );
//           })}
//         </div>



//         {/* ── TOAST ── */}
//         <div className={`wl-toast${toast.show ? " show" : ""}`}>{toast.msg}</div>
//       </div>
//     </>
//   );
// }

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────
// DATA — grouped by equipment type
// ─────────────────────────────────────────────

const MUSCLES = [
  { id: "chest", label: "Chest", emoji: "🫁" },
  { id: "back", label: "Back", emoji: "🔙" },
  { id: "shoulders", label: "Shoulders", emoji: "💪" },
  { id: "arms", label: "Arms", emoji: "💪" },
  { id: "legs", label: "Legs", emoji: "🦵" },
  { id: "core", label: "Core", emoji: "🎯" },
];

const EQUIPMENT_GROUPS = {
  chest: [
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
      group: "Cable / Machine",
      icon: "CA",
      color: "#A855F7",
      exercises: [
        "Cable Fly (Mid)",
        "Incline Cable Fly",
        "Low-to-High Cable Fly",
        "Pec Deck Machine",
        "Chest Dip",
        "Push Up",
      ],
    },
  ],
  back: [
    {
      group: "Barbell",
      icon: "BB",
      color: "#FF6B35",
      exercises: [
        "Barbell Bent-Over Row",
        "Deadlift",
        "Rack Pull",
        "T-Bar Row",
        "Meadows Row",
      ],
    },
    {
      group: "Dumbbell",
      icon: "DB",
      color: "#4ECDC4",
      exercises: [
        "Single-Arm Dumbbell Row",
        "Chest-Supported Row",
      ],
    },
    {
      group: "Cable / Machine",
      icon: "CA",
      color: "#A855F7",
      exercises: [
        "Lat Pulldown",
        "Seated Cable Row",
        "Straight-Arm Pulldown",
        "Face Pull",
        "Pull Up / Chin Up",
      ],
    },
  ],
  shoulders: [
    {
      group: "Barbell",
      icon: "BB",
      color: "#FF6B35",
      exercises: [
        "Barbell Overhead Press",
        "Upright Row",
        "Cuban Press",
      ],
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
      group: "Cable / Machine",
      icon: "CA",
      color: "#A855F7",
      exercises: [
        "Cable Lateral Raise",
        "Machine Shoulder Press",
        "Face Pull",
      ],
    },
  ],
  arms: [
    {
      group: "Barbell",
      icon: "BB",
      color: "#FF6B35",
      exercises: [
        "Barbell Curl",
        "Skull Crusher",
        "Close-Grip Bench Press",
        "Reverse Curl",
      ],
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
      group: "Cable / Machine",
      icon: "CA",
      color: "#A855F7",
      exercises: [
        "Tricep Pushdown (Cable)",
        "Cable Curl",
        "Preacher Curl",
      ],
    },
  ],
  legs: [
    {
      group: "All Exercises",
      icon: "ALL",
      color: "#F59E0B",
      exercises: [
        "Barbell Back Squat",
        "Romanian Deadlift",
        "Leg Press",
        "Bulgarian Split Squat",
        "Hip Thrust",
        "Hack Squat",
        "Leg Curl (Lying)",
        "Leg Extension",
        "Lunges",
        "Calf Raise (Standing)",
        "Nordic Curl",
        "Goblet Squat",
      ],
    },
  ],
  core: [
    {
      group: "Weighted",
      icon: "WT",
      color: "#FF6B35",
      exercises: [
        "Cable Crunch",
        "Decline Weighted Crunch",
        "Pallof Press",
        "Russian Twist",
        "Ab Wheel Rollout",
      ],
    },
    {
      group: "Bodyweight",
      icon: "BW",
      color: "#4ECDC4",
      exercises: [
        "Hanging Leg Raise",
        "Plank",
        "Bicycle Crunch",
        "Toe Touches",
        "Dead Bug",
        "Dragon Flag",
        "Mountain Climber",
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const createSet = () => ({ weight: "", reps: "", locked: false });
const createExercise = (name) => ({ name, sets: [createSet(), createSet(), createSet()], open: false });
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
    --bg:         #03050c;
    --bg2:        #060a16;
    --surface:    #0b0f1e;
    --card:       rgba(15, 20, 38, 0.8);
    --card-border: rgba(255,255,255,0.06);
    --glass:      rgba(255,255,255,0.03);
    --a1:         #3b82f6;
    --a2:         #60a5fa;
    --g1:         #10b981;
    --g2:         #34d399;
    --text:       #f0f4ff;
    --text2:      rgba(240,244,255,0.65);
    --text3:      rgba(240,244,255,0.35);
    --rad:        22px;
    --rad-sm:     14px;
    --rad-xs:     10px;
    --mono:       'JetBrains Mono', monospace;
    --display:    'Outfit', sans-serif;
    --body:       'Space Grotesk', sans-serif;
    --shadow-sm:  0 2px 8px rgba(0,0,0,0.4);
    --shadow-card: 0 8px 32px rgba(0,0,0,0.4);
  }

  html, body { background: var(--bg); height: 100%; }

  .wl-app {
    background: var(--bg);
    min-height: 100dvh;
    font-family: var(--body);
    color: var(--text);
    max-width: 430px;
    margin: 0 auto;
    position: relative;
    overflow-x: hidden;
    padding-bottom: 20px;
    background-image: radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.06) 0%, transparent 60%);
  }

  .wl-app::before {
    content:'';
    position:fixed;
    inset:0;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px);
    pointer-events:none;
    z-index:998;
    opacity:0.7;
  }

  /* ── HEADER ── */
  .wl-header {
    position:sticky;
    top:0;z-index:100;
    padding: 20px 20px 16px;
    background: rgba(3,5,12,0.9);
    backdrop-filter: blur(30px) saturate(1.6);
    -webkit-backdrop-filter: blur(30px) saturate(1.6);
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }

  .wl-header-row {
    display:flex;
    align-items:center;
    gap:16px;
  }

  .wl-back {
    width:48px;height:48px;flex-shrink:0;
    border-radius:14px;
    background: rgba(255,255,255,0.05);
    border:1px solid rgba(255,255,255,0.1);
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;color:var(--text2);
    transition:all 0.25s;
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
    margin-bottom:4px;
  }
  .wl-title {
    font-family:var(--display);
    font-size:28px;font-weight:800;
    color:#fff;line-height:1;
    letter-spacing:-1px;
  }

  .wl-finish-header-btn {
    padding: 12px 22px;
    border-radius: 99px;
    border: none;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    font-family: var(--body);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #fff;
    cursor: pointer;
    transition: all 0.25s;
    box-shadow: 0 4px 14px rgba(59,130,246,0.35);
    flex-shrink: 0;
    backdrop-filter: blur(10px);
  }
  .wl-finish-header-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(59,130,246,0.5);
  }
  .wl-finish-header-btn:active { transform: scale(0.96); }
  .wl-finish-header-btn.celebrating {
    background: linear-gradient(135deg,#10b981,#059669);
    box-shadow: 0 4px 18px rgba(16,185,129,0.45);
  }

  /* ── PROGRESS BAR ── */
  .wl-progress-bar {
    height:2px;
    background:rgba(255,255,255,0.05);
    position:relative;
    overflow:hidden;
  }
  .wl-progress-fill {
    height:100%;
    background:linear-gradient(90deg, #3b82f6, #10b981);
    transition:width 0.5s cubic-bezier(0.4,0,0.2,1);
    border-radius:0 2px 2px 0;
    box-shadow:0 0 12px rgba(59,130,246,0.3);
  }

  /* ── MUSCLE RAIL ── */
  .wl-rail-wrap {
    padding:16px 0 0;
    background: rgba(0,0,0,0.1);
  }
  .wl-rail-label {
    font-size:9px;font-weight:700;
    letter-spacing:3px;
    color:var(--text3);
    text-transform:uppercase;
    margin-bottom:12px;
    padding:0 20px;
  }
  .wl-rail {
    display:flex;
    gap:8px;
    overflow-x:auto;
    scrollbar-width:none;
    padding:0 20px 18px;
  }
  .wl-rail::-webkit-scrollbar{display:none;}

  .wl-tab {
    flex-shrink:0;
    display:flex;flex-direction:column;align-items:center;
    padding:12px 18px 10px;
    border-radius:18px;
    border:1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.02);
    backdrop-filter: blur(10px);
    cursor:pointer;
    transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);
    position:relative;
    overflow:hidden;
    min-width:80px;
  }
  .wl-tab::after {
    content:'';
    position:absolute;bottom:0;left:50%;transform:translateX(-50%);
    width:0;height:3px;border-radius:3px;
    background:var(--a1);
    transition:width 0.35s ease;
  }
  .wl-tab:hover { background: rgba(255,255,255,0.05); }
  .wl-tab.active {
    border-color: rgba(59,130,246,0.4);
    background: rgba(59,130,246,0.08);
    box-shadow: 0 4px 24px rgba(59,130,246,0.15);
  }
  .wl-tab.active::after { width:24px; }
  .wl-tab-label {
    font-size:13px;font-weight:600;
    color:var(--text3);
    transition:color 0.3s;
    white-space:nowrap;
    position:relative;z-index:1;
  }
  .wl-tab.active .wl-tab-label { color:#fff;font-weight:700; }
  .wl-tab-dot {
    width:6px;height:6px;border-radius:50%;
    background:var(--text3);
    margin-top:6px;
    transition:all 0.3s;
    position:relative;z-index:1;
  }
  .wl-tab.active .wl-tab-dot { background:var(--a1); box-shadow:0 0 8px var(--a1); }

  /* ── GROUPS ── */
  .wl-groups {
    padding: 20px 16px;
    display:flex;flex-direction:column;gap:24px;
  }

  .wl-group-header {
    display:flex;align-items:center;gap:12px;
    margin-bottom:12px;
    padding-left:4px;
  }
  .wl-group-badge {
    width:36px;height:24px;
    border-radius:8px;
    display:flex;align-items:center;justify-content:center;
    font-family:var(--mono);
    font-size:9px;font-weight:700;
    letter-spacing:0.5px;
    flex-shrink:0;
  }
  .wl-group-name {
    font-size:12px;font-weight:700;
    letter-spacing:2.5px;
    text-transform:uppercase;
    color:var(--text2);
    flex:1;
  }
  .wl-group-count {
    font-family:var(--mono);
    font-size:11px;
    color:var(--text3);
    background:rgba(255,255,255,0.04);
    padding:4px 10px;
    border-radius:20px;
  }

  .wl-exercise-list {
    display:flex;flex-direction:column;gap:8px;
  }

  /* ── EXERCISE CARD ── */
  .wl-ex {
    background: var(--card);
    border:1px solid var(--card-border);
    border-radius:var(--rad);
    overflow:hidden;
    transition:all 0.3s cubic-bezier(0.25,0.1,0.25,1), box-shadow 0.4s;
    backdrop-filter: blur(20px);
    box-shadow: var(--shadow-sm);
  }
  .wl-ex.open {
    border-color: rgba(59,130,246,0.2);
    box-shadow: 0 8px 32px rgba(59,130,246,0.12);
  }
  .wl-ex.all-done {
    border-color: rgba(16,185,129,0.3);
    box-shadow: 0 4px 24px rgba(16,185,129,0.12);
    background: rgba(16,185,129,0.03);
  }

  .wl-ex-header {
    display:flex;align-items:center;gap:14px;
    padding:16px 16px;
    cursor:pointer;
    user-select:none;
    -webkit-tap-highlight-color:transparent;
    transition:background 0.2s;
  }
  .wl-ex-header:active { background: rgba(255,255,255,0.02); }

  .wl-ring {
    position:relative;width:40px;height:40px;flex-shrink:0;
  }
  .wl-ring svg { transform:rotate(-90deg); }
  .wl-ring-track { fill:none;stroke:rgba(255,255,255,0.08);stroke-width:3; }
  .wl-ring-fill  { fill:none;stroke-width:3;stroke-linecap:round;transition:stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1); }
  .wl-ring-label {
    position:absolute;inset:0;
    display:flex;align-items:center;justify-content:center;
    font-family:var(--mono);
    font-size:10px;font-weight:700;
    color:var(--text3);
  }

  .wl-ex-info { flex:1;min-width:0; }
  .wl-ex-name {
    font-size:14px;font-weight:700;
    color:var(--text);
    letter-spacing:-0.3px;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
    line-height:1.3;
  }
  .wl-ex-sub {
    display:flex;align-items:center;gap:8px;
    margin-top:4px;
  }
  .wl-ex-tag {
    font-size:9px;font-weight:700;
    letter-spacing:1px;
    text-transform:uppercase;
    padding:3px 8px;
    border-radius:6px;
  }
  .wl-sets-count {
    font-family:var(--mono);
    font-size:10px;
    color:var(--text3);
  }

  .wl-chevron {
    width:32px;height:32px;flex-shrink:0;
    border-radius:50%;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.08);
    display:flex;align-items:center;justify-content:center;
    color:var(--text3);
    transition:all 0.3s ease;
  }
  .wl-ex.open .wl-chevron {
    transform:rotate(180deg);
    background:rgba(59,130,246,0.15);
    border-color:rgba(59,130,246,0.4);
    color:var(--a2);
  }

  /* ── SETS PANEL ── */
  .wl-sets-panel {
    padding:0 16px 18px;
    animation: wl-slide 0.25s ease;
  }
  @keyframes wl-slide {
    from{opacity:0;transform:translateY(-12px);}
    to  {opacity:1;transform:translateY(0);}
  }

  .wl-sets-top {
    display:flex;align-items:center;gap:8px;
    padding:12px 0 10px;
    border-top:1px solid rgba(255,255,255,0.06);
    margin-bottom:8px;
  }
  .wl-set-num { width:24px;flex-shrink:0; text-align:center; }
  .wl-col-head {
    flex:1;
    font-size:9px;font-weight:700;
    letter-spacing:2px;
    text-transform:uppercase;
    color:var(--text3);
    text-align:center;
  }
  .wl-col-tick { width:44px;flex-shrink:0; }

  .wl-set-row {
    display:flex;align-items:center;gap:8px;
    margin-bottom:8px;
  }

  .wl-set-num-label {
    font-family:var(--mono);
    font-size:11px;font-weight:600;
    color:var(--text3);
    width:24px;flex-shrink:0;
    text-align:center;
  }

  .wl-input-wrap { flex:1;position:relative; }

  .wl-input {
    width:100%;
    height:52px;
    background:rgba(255,255,255,0.04);
    border:1.5px solid rgba(255,255,255,0.1);
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
  .wl-input::placeholder{color:rgba(255,255,255,0.15);}
  .wl-input:focus:not(:disabled){
    border-color:var(--a1);
    background:rgba(59,130,246,0.08);
    color:#fff;
    box-shadow:0 0 0 3px rgba(59,130,246,0.15);
  }
  .wl-input.done {
    border-color:rgba(16,185,129,0.3);
    background:rgba(16,185,129,0.06);
    color:var(--g2);
    cursor:default;
  }
  .wl-input.err {
    border-color:rgba(239,68,68,0.5);
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
    border:1.5px solid rgba(255,255,255,0.1);
    background:rgba(255,255,255,0.03);
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;
    -webkit-tap-highlight-color:transparent;
    transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);
    color:var(--text3);
  }
  .wl-tick:hover:not(.wl-tick-done){
    border-color:var(--a2);
    background:rgba(59,130,246,0.08);
    color:var(--a2);
  }
  .wl-tick.wl-tick-done {
    background:var(--g1);
    border-color:var(--g1);
    color:#fff;
    box-shadow:0 0 24px rgba(16,185,129,0.45);
    transform:scale(1.08);
  }
  .wl-tick.wl-tick-done:active { transform:scale(0.96); }

  .wl-add-set {
    width:100%;
    height:48px;
    margin-top:12px;
    border-radius:var(--rad-xs);
    border:1.5px dashed rgba(59,130,246,0.25);
    background:transparent;
    font-family:var(--body);
    font-size:11px;font-weight:700;
    letter-spacing:1.5px;
    text-transform:uppercase;
    color:rgba(59,130,246,0.7);
    cursor:pointer;
    transition:all 0.3s;
    display:flex;align-items:center;justify-content:center;
    gap:6px;
  }
  .wl-add-set:hover{
    background:rgba(59,130,246,0.08);
    border-color:var(--a1);
    color:var(--a1);
  }

  /* ── TOAST ── */
  .wl-toast {
    position:fixed;
    bottom:32px;left:50%;
    transform:translateX(-50%) translateY(20px);
    background:rgba(16,185,129,0.95);
    backdrop-filter: blur(16px);
    color:#fff;
    padding:14px 28px;
    border-radius:99px;
    font-family:var(--body);
    font-size:14px;font-weight:700;
    opacity:0;pointer-events:none;
    white-space:nowrap;z-index:300;
    transition:all 0.5s cubic-bezier(0.34,1.56,0.64,1);
    box-shadow:0 8px 32px rgba(16,185,129,0.5);
  }
  .wl-toast.show{
    opacity:1;
    transform:translateX(-50%) translateY(0);
  }

  /* ── CELEBRATION OVERLAY ── */
  .wl-celebrate-overlay {
    position:fixed;inset:0;background:rgba(0,0,0,0.7);
    backdrop-filter: blur(10px);
    z-index:500;
    display:flex;align-items:center;justify-content:center;
    animation: wl-fadeIn 0.3s ease;
  }
  .wl-celebrate-card {
    background:var(--surface);
    border:1px solid rgba(255,255,255,0.1);
    border-radius:var(--rad);
    padding:32px 24px;
    text-align:center;
    max-width:280px;
    box-shadow:0 24px 48px rgba(0,0,0,0.6);
    animation: wl-pop 0.4s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes wl-pop {
    0%{transform:scale(0.8);opacity:0;}
    100%{transform:scale(1);opacity:1;}
  }
  @keyframes wl-fadeIn {
    from{opacity:0;}
    to{opacity:1;}
  }

  .wl-confetti {
    position:fixed;top:0;left:0;width:100%;height:100%;
    pointer-events:none;z-index:600;
  }
  .confetti-piece {
    position:absolute;
    width:10px;height:10px;
    border-radius:2px;
    animation: confetti-fall var(--fall-duration) linear forwards;
    animation-delay: var(--delay);
    opacity:0;
  }
  @keyframes confetti-fall {
    0% { transform: translateY(-20px) rotate(0deg); opacity:1; }
    100% { transform: translateY(110vh) rotate(720deg); opacity:0; }
  }
`;

// ─────────────────────────────────────────────
// RING COMPONENT
// ─────────────────────────────────────────────
function Ring({ done, total, color }) {
  const R = 16;
  const C = 2 * Math.PI * R;
  const pct = total > 0 ? done / total : 0;
  const offset = C - pct * C;
  const stroke = done === total && total > 0 ? "var(--g1)" : (color || "var(--a1)");
  const label = done > 0 ? `${done}/${total}` : `${total}`;
  return (
    <div className="wl-ring">
      <svg width="40" height="40" viewBox="0 0 40 40">
        <circle className="wl-ring-track" cx="20" cy="20" r={R} />
        <circle
          className="wl-ring-fill"
          cx="20" cy="20" r={R}
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
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Check = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2.5 8.5L6.5 12.5L13.5 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Circle = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ─────────────────────────────────────────────
// CELEBRATION CONFETTI
// ─────────────────────────────────────────────
function Confetti({ active }) {
  if (!active) return null;
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 3,
    color: colors[i % colors.length],
    size: 6 + Math.random() * 8,
  }));
  return (
    <div className="wl-confetti">
      {pieces.map(p => (
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
// MAIN APP
// ─────────────────────────────────────────────
export default function WorkoutLogger() {
  const router = useRouter();
  const [muscle, setMuscle] = useState("chest");
  const [data, setData] = useState(initData);
  const [shakes, setShakes] = useState({});
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [celebrating, setCelebrating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

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
            ...e, sets: e.sets.map((ss, si) =>
              si === setIdx ? { ...ss, locked: false } : ss
            )
          };
        });
        return next;
      });
      return;
    }

    const bad = {};
    let ok = true;
    if (!s.weight || isNaN(parseFloat(s.weight)) || parseFloat(s.weight) <= 0) {
      bad[`${grp}-${exIdx}-${setIdx}-w`] = true; ok = false;
    }
    if (!s.reps || isNaN(parseInt(s.reps)) || parseInt(s.reps) <= 0) {
      bad[`${grp}-${exIdx}-${setIdx}-r`] = true; ok = false;
    }
    if (!ok) { setShakes(bad); setTimeout(() => setShakes({}), 500); return; }

    setData((prev) => {
      const next = { ...prev };
      next[muscle] = { ...next[muscle] };
      next[muscle][grp] = next[muscle][grp].map((e, i) => {
        if (i !== exIdx) return e;
        return {
          ...e, sets: e.sets.map((ss, si) =>
            si === setIdx ? { ...ss, locked: true } : ss
          )
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

  const handleFinish = () => {
    setCelebrating(true);
    setShowCelebration(true);
    showToast(`🔥 ${lockedSets} sets smashed!`);
    setTimeout(() => {
      setCelebrating(false);
      setShowCelebration(false);
    }, 2500);
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
                <path d="M11 3L6 9l5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="wl-title-block">
              <div className="wl-eyebrow">
                {currentMuscle?.emoji} {lockedSets > 0 ? `${lockedSets}/${totalSets} sets` : "Start logging"}
              </div>
              <div className="wl-title">{currentMuscle?.label}</div>
            </div>
            <button
              className={`wl-finish-header-btn${celebrating ? " celebrating" : ""}`}
              onClick={handleFinish}
            >
              Finish
            </button>
          </div>
        </header>

        <div className="wl-progress-bar">
          <div className="wl-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>

        {/* ── MUSCLE TABS ── */}
        <div className="wl-rail-wrap">
          <div className="wl-rail-label">Select muscle group</div>
          <div className="wl-rail">
            {MUSCLES.map((m) => {
              const muscleExs = (EQUIPMENT_GROUPS[m.id] || []).flatMap(g => data[m.id]?.[g.group] || []);
              const muscleDone = muscleExs.reduce((a, e) => a + e.sets.filter(s => s.locked).length, 0);
              return (
                <button
                  key={m.id}
                  className={`wl-tab ${muscle === m.id ? "active" : ""}`}
                  onClick={() => setMuscle(m.id)}
                >
                  <span className="wl-tab-label">{m.label}</span>
                  {muscle === m.id && muscleDone > 0 && (
                    <span className="wl-tab-dot" />
                  )}
                  {muscle !== m.id && (
                    <div className="wl-tab-dot" />
                  )}
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
            return (
              <div key={grp.group}>
                <div className="wl-group-header">
                  <div
                    className="wl-group-badge"
                    style={{ background: `${grp.color}22`, color: grp.color }}
                  >
                    {grp.icon}
                  </div>
                  <div className="wl-group-name">{grp.group}</div>
                  <div className="wl-group-count">
                    {grpDone > 0 ? `${grpDone}/${grpTotal} sets` : `${exercises.length} ex.`}
                  </div>
                </div>

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
                                style={{ background: `${grp.color}18`, color: grp.color }}
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
                                      onChange={(e) => updateSet(grp.group, exIdx, setIdx, "weight", e.target.value)}
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
                                      onChange={(e) => updateSet(grp.group, exIdx, setIdx, "reps", e.target.value)}
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
            );
          })}
        </div>

        {/* ── TOAST ── */}
        <div className={`wl-toast${toast.show ? " show" : ""}`}>{toast.msg}</div>

        {/* ── CELEBRATION MODAL (optional overlay) ── */}
        {showCelebration && (
          <div className="wl-celebrate-overlay" onClick={() => setShowCelebration(false)}>
            <div className="wl-celebrate-card">
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Workout complete!</div>
              <div style={{ color: 'var(--text2)', fontSize: 14 }}>
                {lockedSets} sets logged across {doneExs} exercises
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}