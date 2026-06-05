"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const BODY_PARTS = [
    { id: "chest",     label: "CHEST" },
    { id: "back",      label: "BACK" },
    { id: "shoulders", label: "SHOULDERS" },
    { id: "arms",      label: "ARMS" },
    { id: "legs",      label: "LEGS" },
    { id: "core",      label: "CORE" },
];

// ─── CUSTOM DOT ──────────────────────────────────────────────────────────────

function GlowDot({ cx, cy, payload, index, activeIndex, onToggle, fadingIndex }) {
    if (cx == null || cy == null) return null;
    const isActive = activeIndex === index;
    const isFading = fadingIndex === index;
    return (
        <g>
            <circle cx={cx} cy={cy} r={10} fill="none" stroke="#1a6fff" strokeOpacity={isActive ? 0.35 : 0.18} strokeWidth={5} />
            <circle cx={cx} cy={cy} r={6}  fill="none" stroke="#3d8fff" strokeOpacity={isActive ? 0.6 : 0.35} strokeWidth={2} />
            <circle cx={cx} cy={cy} r={4}  fill={isActive ? "#2f8bff" : "#1a6fff"} stroke="#7dc8ff" strokeWidth={1.5} />

            {(isActive || isFading) && (
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
                            opacity: isFading && !isActive ? 0 : 1,
                            transition: "opacity 0.4s ease",
                        }}
                    >
                        <div style={{ color: "#7dc8ff", fontSize: "11px" }}>{payload?.weight} KG</div>
                        <div style={{ color: "#c0e8ff", fontSize: "10px" }}>{payload?.reps} REPS</div>
                    </div>
                </foreignObject>
            )}

            <circle
                cx={cx} cy={cy} r={18}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onClick={(e) => { e.stopPropagation(); onToggle(index); }}
            />
        </g>
    );
}

// ─── CHART ───────────────────────────────────────────────────────────────────

function AnalyticsChart({ title, icon, subtitle, yLabel, data, btnLabel, loading }) {
    const uid = title.replace(/\s+/g, "-");
    const [activeIndex, setActiveIndex] = useState(null);
    const [fadingIndex, setFadingIndex] = useState(null);
    const timeoutRef = useRef(null);
    const fadeRef = useRef(null);

    function handleToggle(index) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (fadeRef.current) clearTimeout(fadeRef.current);

        if (activeIndex === index) {
            setActiveIndex(null);
            setFadingIndex(null);
            return;
        }

        setActiveIndex(index);
        setFadingIndex(null);

        timeoutRef.current = setTimeout(() => {
            setFadingIndex(index);
            setActiveIndex(null);
            fadeRef.current = setTimeout(() => setFadingIndex(null), 400);
        }, 1000);
    }

    useEffect(() => () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (fadeRef.current) clearTimeout(fadeRef.current);
    }, []);

    return (
        <div className="chart-card" onClick={() => { setActiveIndex(null); setFadingIndex(null); }}>
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

            <div className="y-label">{yLabel}</div>

            {loading ? (
                <div className="chart-skeleton">
                    <div className="skel-line" style={{ width: "100%", height: "100%" }} />
                </div>
            ) : !data || data.length === 0 ? (
                <div className="chart-empty">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(29,106,255,0.3)" strokeWidth="1.5">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                    <span>No data yet</span>
                </div>
            ) : (
                <div style={{ flex: 1, minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 22, right: 10, left: 0, bottom: 16 }}>
                            <defs>
                                <linearGradient id={`lg-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%"   stopColor="#1a6fff" stopOpacity={0.8} />
                                    <stop offset="60%"  stopColor="#2f8bff" stopOpacity={1} />
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
                                        fadingIndex={fadingIndex}
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
            )}
        </div>
    );
}

// ─── BODY PART CARD ──────────────────────────────────────────────────────────

function BodyPartCard({ part, active, onClick, hasData }) {
    return (
        <button
            className={`body-card ${active ? "body-card--active" : ""} ${!hasData ? "body-card--empty" : ""}`}
            onClick={() => onClick(part.id)}
            aria-label={part.label}
        >
            <div className="body-img-wrap">
                <img
                    src={`/${part.id}.png`}
                    alt={part.label}
                    className="body-img"
                    onError={(e) => { e.currentTarget.style.opacity = "0.15"; }}
                />
                {active && <div className="body-img-glow" />}
            </div>
            <span className="body-label">{part.label}</span>
            {!hasData && <span className="body-no-data">—</span>}
            {active && <div className="body-underline" />}
        </button>
    );
}

// ─── EXERCISE DROPDOWN ───────────────────────────────────────────────────────

function ExerciseDropdown({ exercises, selected, onSelect, loading }) {
    const [open, setOpen] = useState(false);

    // Close when exercises list changes (bodypart switched)
    useEffect(() => setOpen(false), [exercises]);

    if (loading) {
        return (
            <div className="exercise-wrap">
                <div className="exercise-btn exercise-btn--skel">
                    <div className="skel-text" style={{ width: 140, height: 16 }} />
                </div>
            </div>
        );
    }

    if (!exercises || exercises.length === 0) {
        return (
            <div className="exercise-wrap">
                <div className="exercise-btn exercise-btn--disabled">
                    <div className="exercise-left">
                        <div className="exercise-icon-box">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3d6a9a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6.5 6.5h11M6.5 17.5h11M3 12h18M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3" />
                            </svg>
                        </div>
                        <div className="exercise-text">
                            <span className="exercise-sub">NO DATA</span>
                            <span className="exercise-name" style={{ color: "var(--text-muted)", fontSize: 14 }}>Log a workout first</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────

function EmptyState() {
    return (
        <div className="empty-state">
            <div className="empty-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(29,106,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
            </div>
            <div className="empty-title">No workouts logged yet</div>
            <div className="empty-sub">Complete a workout session to see your progress charts here.</div>
        </div>
    );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function PerformancePage() {
    const [activePart, setActivePart]         = useState("chest");
    const [selectedExercise, setSelectedExercise] = useState(null);

    // catalog: { chest: [...], back: [...], ... }
    const [catalog, setCatalog]       = useState(null);
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [catalogError, setCatalogError]     = useState(false);

    // analytics: { pr: [...], avg: [...] }
    const [analytics, setAnalytics]       = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    // ── Fetch catalog on mount ──────────────────────────────────────────────
    useEffect(() => {
        setCatalogLoading(true);
        setCatalogError(false);
        fetch("/api/progress/catalog", { credentials: "include" })
            .then((r) => {
                if (!r.ok) throw new Error("Failed");
                return r.json();
            })
            .then((data) => {
                setCatalog(data.catalog);
                // Pick a default part that has data
                const firstWithData = BODY_PARTS.find((p) => (data.catalog[p.id] || []).length > 0);
                if (firstWithData) {
                    setActivePart(firstWithData.id);
                    setSelectedExercise(data.catalog[firstWithData.id][0]);
                }
            })
            .catch(() => setCatalogError(true))
            .finally(() => setCatalogLoading(false));
    }, []);

    // ── When bodypart changes, pick first exercise in that part ────────────
    function handlePartChange(partId) {
        setActivePart(partId);
        const exercises = catalog?.[partId] ?? [];
        setSelectedExercise(exercises.length > 0 ? exercises[0] : null);
    }

    // ── Fetch analytics whenever exercise changes ───────────────────────────
    useEffect(() => {
        if (!selectedExercise) {
            setAnalytics(null);
            return;
        }
        setAnalyticsLoading(true);
        fetch(`/api/progress/analytics?exercise=${encodeURIComponent(selectedExercise)}`, { credentials: "include" })
            .then((r) => r.json())
            .then((data) => setAnalytics(data))
            .catch(() => setAnalytics(null))
            .finally(() => setAnalyticsLoading(false));
    }, [selectedExercise]);

    const exercises = catalog?.[activePart] ?? [];
    const hasAnyData = catalog ? BODY_PARTS.some((p) => (catalog[p.id] || []).length > 0) : false;

    return (
        <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;600;700;900&display=swap" rel="stylesheet" />
            <style>{`

        style { display: none !important; }

        .progress-page {
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

          background: var(--bg);
          color: var(--text);
          font-family: var(--font-ui);
          -webkit-font-smoothing: antialiased;
        }

        .progress-page * {
          outline: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }

        /* ── PAGE ─────────────── */
        .progress-page.page {
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

        .body-card--empty { opacity: 0.45; }
        .body-card--empty .body-label { color: var(--text-muted); }

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

        .body-no-data {
          font-family: var(--font-ui);
          font-size: 7px;
          color: var(--text-muted);
          opacity: 0.5;
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

        .exercise-btn--disabled {
          cursor: default;
          opacity: 0.6;
        }

        .exercise-btn--skel {
          height: 52px;
          cursor: default;
        }

        .exercise-btn:not(.exercise-btn--disabled):not(.exercise-btn--skel):hover {
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
          max-height: 220px;
          overflow-y: auto;
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

        .chart-card:last-child { margin-bottom: 6px; }

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

        /* ── SKELETON ─────────── */
        .skel-line {
          border-radius: 6px;
          background: linear-gradient(90deg, rgba(29,106,255,0.05) 25%, rgba(29,106,255,0.12) 50%, rgba(29,106,255,0.05) 75%);
          background-size: 200% 100%;
          animation: skel-shimmer 1.6s ease-in-out infinite;
        }

        @keyframes skel-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .skel-text {
          height: 12px;
          border-radius: 4px;
          background: linear-gradient(90deg, rgba(29,106,255,0.05) 25%, rgba(29,106,255,0.12) 50%, rgba(29,106,255,0.05) 75%);
          background-size: 200% 100%;
          animation: skel-shimmer 1.6s ease-in-out infinite;
        }

        .chart-skeleton {
          flex: 1 1 0;
          min-height: 0;
          padding: 8px 4px 12px 0;
          display: flex;
          align-items: stretch;
        }

        /* ── EMPTY / NO DATA ──── */
        .chart-empty {
          flex: 1 1 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: var(--text-muted);
          font-family: var(--font-display);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          opacity: 0.7;
        }

        /* ── GLOBAL EMPTY STATE ─ */
        .empty-state {
          flex: 1 1 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 24px 32px;
          text-align: center;
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          background: rgba(29,106,255,0.06);
          border: 1px solid rgba(29,106,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-title {
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: var(--text);
        }

        .empty-sub {
          font-family: var(--font-ui);
          font-size: 13px;
          font-weight: 500;
          color: var(--text-muted);
          line-height: 1.5;
          max-width: 260px;
        }

        /* ── ERROR ────────────── */
        .error-banner {
          margin: 8px 10px;
          padding: 10px 14px;
          background: rgba(248,113,113,0.07);
          border: 1px solid rgba(248,113,113,0.2);
          border-radius: 10px;
          font-family: var(--font-ui);
          font-size: 12px;
          font-weight: 600;
          color: #f87171;
          text-align: center;
          flex-shrink: 0;
        }

        /* recharts */
        .recharts-cartesian-axis-tick-value { user-select: none; }
        .recharts-wrapper, .recharts-surface { overflow: visible; outline: none !important; }
        .recharts-surface:focus, .recharts-wrapper:focus { outline: none !important; }
      `}</style>

            <div className="page progress-page">
                {/* BODY PARTS */}
                <div className="body-scroller">
                    {BODY_PARTS.map((part) => (
                        <BodyPartCard
                            key={part.id}
                            part={part}
                            active={activePart === part.id}
                            onClick={handlePartChange}
                            hasData={(catalog?.[part.id] ?? []).length > 0}
                        />
                    ))}
                </div>

                {/* ERROR */}
                {catalogError && (
                    <div className="error-banner">
                        Could not load your exercise history. Check your connection and try refreshing.
                    </div>
                )}

                {/* EXERCISE DROPDOWN */}
                <ExerciseDropdown
                    exercises={exercises}
                    selected={selectedExercise}
                    onSelect={setSelectedExercise}
                    loading={catalogLoading}
                />

                {/* CHARTS or EMPTY STATE */}
                <div className="charts-area">
                    {!catalogLoading && !catalogError && !hasAnyData ? (
                        <EmptyState />
                    ) : (
                        <>
                            <AnalyticsChart
                                title="PR ANALYTICS"
                                icon="👑"
                                subtitle="Best performance at each date"
                                yLabel="WEIGHT (KG)"
                                btnLabel="WEIGHT OVER TIME"
                                data={analytics?.pr ?? null}
                                loading={analyticsLoading || catalogLoading}
                            />
                            <AnalyticsChart
                                title="AVG ANALYTICS"
                                icon="🎯"
                                subtitle="Average weight lifted at each date"
                                yLabel="AVG WEIGHT (KG)"
                                btnLabel="WEIGHT OVER TIME"
                                data={analytics?.avg ?? null}
                                loading={analyticsLoading || catalogLoading}
                            />
                        </>
                    )}
                </div>
            </div>
        </>
    );
}