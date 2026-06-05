"use client";

import { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// ─── DATA ─────────────────────────────────────────────────────────────────────
// X-axis = date labels, Y-axis = weight (kg), label = reps at that session

const bodyParts = [
    { id: "chest", label: "CHEST" },
    { id: "back", label: "BACK" },
    { id: "shoulders", label: "SHOULDERS" },
    { id: "arms", label: "ARMS" },
    { id: "legs", label: "LEGS" },
    { id: "core", label: "CORE" },
];

const exercisesByPart = {
    chest: ["Bench Press", "Incline Press", "Cable Fly", "Dips"],
    back: ["Deadlift", "Pull-Up", "Barbell Row", "Lat Pulldown"],
    shoulders: ["Overhead Press", "Lateral Raise", "Face Pull", "Shrug"],
    arms: ["Barbell Curl", "Tricep Dip", "Hammer Curl", "Skull Crusher"],
    legs: ["Squat", "Leg Press", "Romanian Deadlift", "Leg Curl"],
    core: ["Plank", "Hanging Knee Raise", "Cable Crunch", "Ab Wheel"],
};

const analyticsData = {
    "Bench Press": {
        pr: [
            { date: "APR 10", weight: 100, reps: 8 },
            { date: "APR 24", weight: 120, reps: 8 },
            { date: "MAY 08", weight: 140, reps: 6 },
            { date: "MAY 22", weight: 160, reps: 5 },
            { date: "JUN 05", weight: 175, reps: 3 },
            { date: "JUN 19", weight: 185, reps: 2 },
        ],
        avg: [
            { date: "APR 10", weight: 80, reps: 10 },
            { date: "APR 24", weight: 95, reps: 10 },
            { date: "MAY 08", weight: 110, reps: 9 },
            { date: "MAY 22", weight: 125, reps: 8 },
            { date: "JUN 05", weight: 135, reps: 7 },
            { date: "JUN 19", weight: 145, reps: 6 },
        ],
    },
};

function generateData(seed) {
    const dates = ["APR 10", "APR 24", "MAY 08", "MAY 22", "JUN 05", "JUN 19"];
    const pr = dates.map((d, i) => ({ date: d, weight: 80 + i * 18 + seed, reps: 10 - i }));
    const avg = dates.map((d, i) => ({ date: d, weight: 65 + i * 15 + seed, reps: 12 - i }));
    return { pr, avg };
}

function getAnalytics(exercise) {
    return analyticsData[exercise] || generateData(exercise.length % 10);
}

// ─── CUSTOM DOT ───────────────────────────────────────────────────────────────

function GlowDot({ cx, cy, payload, index, activeIndex, onToggle }) {
    if (cx == null || cy == null) return null;
    const isActive = activeIndex === index;
    return (
        <g>
            {/* outer pulse ring */}
            <circle cx={cx} cy={cy} r={10} fill="none" stroke="#1a6fff" strokeOpacity={isActive ? 0.35 : 0.18} strokeWidth={5} />
            {/* mid ring */}
            <circle cx={cx} cy={cy} r={6} fill="none" stroke="#3d8fff" strokeOpacity={isActive ? 0.6 : 0.35} strokeWidth={2} />
            {/* solid dot */}
            <circle cx={cx} cy={cy} r={4} fill={isActive ? "#2f8bff" : "#1a6fff"} stroke="#7dc8ff" strokeWidth={1.5} />
            {/* label pill — only when tapped */}
            {isActive && (
                <foreignObject x={cx - 40} y={cy - 52} width={82} height={44}>
                    <div
                        xmlns="http://www.w3.org/1999/xhtml"
                        style={{
                            background: "rgba(4,16,42,0.97)",
                            border: "1px solid rgba(29,106,255,0.55)",
                            borderRadius: "7px",
                            color: "#ffffff",
                            fontSize: "10.5px",
                            fontWeight: 700,
                            textAlign: "center",
                            padding: "4px 6px 3px",
                            letterSpacing: "0.04em",
                            fontFamily: "'Rajdhani', sans-serif",
                            lineHeight: 1.25,
                        }}
                    >
                        <div style={{ color: "#7dc8ff", fontSize: "11px" }}>{payload?.weight} KG</div>
                        <div style={{ color: "#c0e8ff", fontSize: "10px" }}>{payload?.reps} REPS</div>
                    </div>
                </foreignObject>
            )}
            {/* invisible large tap target */}
            <circle
                cx={cx} cy={cy} r={18}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onClick={(e) => { e.stopPropagation(); onToggle(index); }}
            />
        </g>
    );
}

// ─── CHART ────────────────────────────────────────────────────────────────────

function AnalyticsChart({ title, icon, subtitle, yLabel, data, btnLabel }) {
    const uid = title.replace(/\s+/g, "-");
    const [activeIndex, setActiveIndex] = useState(null);

    function handleToggle(index) {
        setActiveIndex((prev) => (prev === index ? null : index));
    }

    return (
        <div className="chart-card" onClick={() => setActiveIndex(null)}>
            {/* header */}
            <div className="chart-header" onClick={(e) => e.stopPropagation()}>
                <div className="chart-title-group">
                    <span className="chart-icon">{icon}</span>
                    <div>
                        <div className="chart-title">{title}</div>
                        <div className="chart-subtitle">{subtitle}</div>
                    </div>
                </div>
                <button className="reps-btn">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                        <polyline points="17 6 23 6 23 12" />
                    </svg>
                    {btnLabel}
                </button>
            </div>

            {/* y-axis label outside chart */}
            <div className="y-label">{yLabel}</div>

            {/* chart */}
            <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 22, right: 10, left: 0, bottom: 16 }}>
                        <defs>
                            <linearGradient id={`lg-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#1a6fff" stopOpacity={0.8} />
                                <stop offset="60%" stopColor="#2f8bff" stopOpacity={1} />
                                <stop offset="100%" stopColor="#1a6fff" stopOpacity={0.9} />
                            </linearGradient>
                            <filter id={`glow-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
                                <feGaussianBlur stdDeviation="4" result="blur" />
                                <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        <CartesianGrid
                            strokeDasharray="2 4"
                            stroke="rgba(29,106,255,0.10)"
                            vertical={true}
                            horizontal={true}
                        />

                        <XAxis
                            dataKey="date"
                            tick={{ fill: "#3d6a9a", fontSize: 10, fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, letterSpacing: "0.02em" }}
                            tickLine={false}
                            axisLine={{ stroke: "rgba(29,106,255,0.15)", strokeWidth: 1 }}
                            interval={0}
                        />

                        <YAxis
                            dataKey="weight"
                            tick={{ fill: "#3d6a9a", fontSize: 10, fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 }}
                            tickLine={false}
                            axisLine={false}
                            width={32}
                        />

                        <Tooltip active={false} content={() => null} />

                        <Line
                            type="monotoneX"
                            dataKey="weight"
                            stroke={`url(#lg-${uid})`}
                            strokeWidth={2.8}
                            dot={(props) => (
                                <GlowDot
                                    {...props}
                                    activeIndex={activeIndex}
                                    onToggle={handleToggle}
                                />
                            )}
                            activeDot={false}
                            filter={`url(#glow-${uid})`}
                            isAnimationActive={true}
                            animationDuration={1000}
                            animationEasing="ease-out"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ─── BODY PART CARD ───────────────────────────────────────────────────────────

function BodyPartCard({ part, active, onClick }) {
    return (
        <button
            className={`body-card ${active ? "body-card--active" : ""}`}
            onClick={() => onClick(part.id)}
            aria-label={part.label}
        >
            <div className="body-img-wrap">
                <img
                    src={`/${part.id}.png`}
                    alt={part.label}
                    className="body-img"
                    onError={(e) => { e.currentTarget.style.opacity = "0.2"; }}
                />
                {active && <div className="body-img-glow" />}
            </div>
            <span className="body-label">{part.label}</span>
            {active && <div className="body-underline" />}
        </button>
    );
}

// ─── EXERCISE DROPDOWN ────────────────────────────────────────────────────────

function ExerciseDropdown({ exercises, selected, onSelect }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="exercise-wrap">
            <button className="exercise-btn" onClick={() => setOpen((o) => !o)}>
                <div className="exercise-left">
                    <div className="exercise-icon-box">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2f8bff"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6.5 6.5h11M6.5 17.5h11M3 12h18M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3" />
                        </svg>
                    </div>
                    <div className="exercise-text">
                        <span className="exercise-sub">EXERCISE</span>
                        <span className="exercise-name">{selected}</span>
                    </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3d6a9a"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease", flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
            {open && (
                <div className="exercise-dropdown">
                    {exercises.map((ex) => (
                        <button
                            key={ex}
                            className={`exercise-option ${ex === selected ? "exercise-option--active" : ""}`}
                            onClick={() => { onSelect(ex); setOpen(false); }}
                        >
                            {ex}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function PerformancePage() {
    const [activePart, setActivePart] = useState("chest");
    const [selectedExercise, setSelectedExercise] = useState("Bench Press");

    function handlePartChange(partId) {
        setActivePart(partId);
        setSelectedExercise(exercisesByPart[partId][0]);
    }

    const analytics = getAnalytics(selectedExercise);

    return (
        <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;600;700;900&display=swap" rel="stylesheet" />
            <style>{`

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        style { display: none !important; }

        :root {
          --bg:           #030d1a;
          --surface:      #061422;
          --surface-2:    #091c30;
          --border:       rgba(29,106,255,0.18);
          --border-hi:    rgba(29,106,255,0.5);
          --cyan:         #2f8bff;
          --cyan-dim:     rgba(29,106,255,0.5);
          --cyan-label:   #7dc8ff;
          --text:         #e8f4ff;
          --text-muted:   #3d6a9a;
          --font-ui:      'Rajdhani', sans-serif;
          --font-display: 'Orbitron', sans-serif;
        }

        html, body {
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-ui);
          height: 100dvh;
          max-height: 100dvh;
          overflow: hidden;
          -webkit-font-smoothing: antialiased;
        }

        /* ── PAGE ─────────────── */
        .page {
          width: 100vw;
          max-width: 100vw;
          height: 100dvh;
          max-height: 100dvh;
          display: flex;
          flex-direction: column;
          background: var(--bg);
          overflow: hidden;
          position: relative;
          padding-top: env(safe-area-inset-top, 0px);
        }

        /* ── BODY SCROLLER ────── */
        .body-scroller {
          display: flex;
          gap: 5px;
          padding: 6px 10px 6px;
          flex-shrink: 0;
          position: relative;
          z-index: 5;
        }

        .body-card {
          flex: 1 1 0;
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 5px 3px 5px;
          border-radius: 11px;
          background: var(--surface);
          border: 1px solid var(--border);
          cursor: pointer;
          position: relative;
          transition: border-color 0.25s, background 0.25s;
          overflow: hidden;
        }

        .body-card--active {
          border-color: var(--cyan);
          background: rgba(29,106,255,0.08);
        }

        .body-card--active .body-label { color: var(--cyan-label); }

        .body-img-wrap {
          position: relative;
          width: 100%;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .body-img {
          width: auto;
          height: 36px;
          max-width: 100%;
          object-fit: contain;
          filter: brightness(0.55) saturate(0.35);
          transition: filter 0.3s;
        }

        .body-card--active .body-img {
          filter: brightness(1.1) saturate(1.2) drop-shadow(0 0 8px rgba(29,106,255,0.8));
        }

        .body-img-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, rgba(29,106,255,0.18) 0%, transparent 70%);
          pointer-events: none;
        }

        .body-label {
          font-family: var(--font-display);
          font-size: 6.5px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          transition: color 0.25s;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .body-underline {
          position: absolute;
          bottom: 0; left: 8px; right: 8px;
          height: 2px;
          background: var(--cyan);
          border-radius: 2px 2px 0 0;
        }

        /* ── EXERCISE ─────────── */
        .exercise-wrap {
          margin: 0 10px 5px;
          position: relative;
          z-index: 20;
          flex-shrink: 0;
        }

        .exercise-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 7px 13px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 11px;
          cursor: pointer;
          color: var(--text);
          transition: border-color 0.2s, background 0.2s;
        }

        .exercise-btn:hover {
          border-color: var(--border-hi);
          background: var(--surface-2);
        }

        .exercise-left {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .exercise-icon-box {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(29,106,255,0.10);
          border: 1px solid rgba(29,106,255,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .exercise-text {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .exercise-sub {
          font-family: var(--font-display);
          font-size: 7.5px;
          font-weight: 700;
          color: var(--cyan);
          letter-spacing: 0.12em;
        }

        .exercise-name {
          font-family: var(--font-ui);
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
          line-height: 1.1;
        }

        .exercise-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0; right: 0;
          background: var(--surface-2);
          border: 1px solid var(--border-hi);
          border-radius: 11px;
          overflow: hidden;
          z-index: 100;
          box-shadow: 0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(29,106,255,0.08);
          animation: dropIn 0.16s ease;
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-5px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .exercise-option {
          width: 100%;
          padding: 11px 16px;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(29,106,255,0.07);
          color: var(--text-muted);
          font-family: var(--font-ui);
          font-size: 15px;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }

        .exercise-option:last-child { border-bottom: none; }
        .exercise-option:hover { background: rgba(29,106,255,0.08); color: var(--text); }
        .exercise-option--active { color: var(--cyan); background: rgba(29,106,255,0.07); }

        /* ── CHARTS AREA ──────── */
        .charts-area {
          flex: 1 1 0;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding-bottom: 80px;
        }

        /* ── CHART CARD ───────── */
        .chart-card {
          margin: 0 10px 5px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 13px;
          padding: 7px 10px 2px 6px;
          position: relative;
          z-index: 5;
          overflow: hidden;
          flex: 1 1 0;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }

        .chart-card:last-child {
          margin-bottom: 6px;
        }

        .chart-card::before {
          content: '';
          position: absolute;
          top: 0; left: 18px; right: 18px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--cyan-dim), transparent);
        }

        .chart-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 0;
          flex-shrink: 0;
          padding: 0 2px;
        }

        .chart-title-group {
          display: flex;
          align-items: flex-start;
          gap: 7px;
        }

        .chart-icon { font-size: 16px; line-height: 1.2; flex-shrink: 0; }

        .chart-title {
          font-family: var(--font-display);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--text);
          line-height: 1.2;
        }

        .chart-subtitle {
          font-family: var(--font-ui);
          font-size: 10px;
          font-weight: 500;
          color: var(--text-muted);
          letter-spacing: 0.01em;
          margin-top: 1px;
        }

        .reps-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 9px;
          background: rgba(29,106,255,0.10);
          border: 1px solid rgba(29,106,255,0.28);
          border-radius: 7px;
          color: var(--cyan);
          font-family: var(--font-display);
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.07em;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .reps-btn:hover {
          background: rgba(29,106,255,0.18);
          border-color: var(--cyan);
        }

        .y-label {
          font-family: var(--font-display);
          font-size: 8px;
          font-weight: 700;
          color: var(--cyan);
          letter-spacing: 0.10em;
          padding: 1px 0 0 36px;
          flex-shrink: 0;
        }

        /* recharts */
        .recharts-cartesian-axis-tick-value { user-select: none; }
        .recharts-wrapper .recharts-surface { overflow: visible; }
      `}</style>

            <div className="page">
                {/* BODY PARTS */}
                <div className="body-scroller">
                    {bodyParts.map((part) => (
                        <BodyPartCard
                            key={part.id}
                            part={part}
                            active={activePart === part.id}
                            onClick={handlePartChange}
                        />
                    ))}
                </div>

                {/* EXERCISE */}
                <ExerciseDropdown
                    exercises={exercisesByPart[activePart]}
                    selected={selectedExercise}
                    onSelect={setSelectedExercise}
                />

                {/* CHARTS */}
                <div className="charts-area">
                    <AnalyticsChart
                        title="PR ANALYTICS"
                        icon="👑"
                        subtitle="Best performance at each date"
                        yLabel="WEIGHT (KG)"
                        btnLabel="WEIGHT OVER TIME"
                        data={analytics.pr}
                    />
                    <AnalyticsChart
                        title="AVG ANALYTICS"
                        icon="🎯"
                        subtitle="Average weight lifted at each date"
                        yLabel="AVG WEIGHT (KG)"
                        btnLabel="WEIGHT OVER TIME"
                        data={analytics.avg}
                    />
                </div>
            </div>
        </>
    );
}