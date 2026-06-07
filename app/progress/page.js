"use client";

import { useState, useEffect, useRef } from "react";
import KaiAssistant from "@/components/KaiAssistant";
import {
    AreaChart,
    Area,
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
            {/* Ambient Pulse */}
            <circle cx={cx} cy={cy} r={isActive ? 14 : 0} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={4} style={{ transition: "all 0.3s ease" }} />
            {/* Main Dot */}
            <circle cx={cx} cy={cy} r={isActive ? 5 : 2.5} fill={isActive ? "#020617" : "#ffffff"} stroke="#ffffff" strokeWidth={isActive ? 2.5 : 0} style={{ transition: "all 0.2s ease" }} />

            {(isActive || isFading) && (
                <foreignObject x={cx - 45} y={cy - 60} width={90} height={48}>
                    <div
                        xmlns="http://www.w3.org/1999/xhtml"
                        style={{
                            background: "rgba(2, 6, 23, 0.65)",
                            backdropFilter: "blur(12px)",
                            WebkitBackdropFilter: "blur(12px)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderTop: "1px solid rgba(255,255,255,0.25)",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                            borderRadius: "10px",
                            color: "#ffffff",
                            textAlign: "center",
                            padding: "6px 0",
                            opacity: isFading && !isActive ? 0 : 1,
                            transition: "opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "1px"
                        }}
                    >
                        <div style={{ color: "#ffffff", fontFamily: "'Rajdhani', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.02em", lineHeight: 1 }}>
                            {payload?.weight} <span style={{fontSize: "9px", color: "rgba(255,255,255,0.5)"}}>KG</span>
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Inter', sans-serif", fontSize: "8.5px", fontWeight: 600, letterSpacing: "0.08em", lineHeight: 1 }}>
                            {payload?.reps} REPS
                        </div>
                    </div>
                </foreignObject>
            )}

            <circle
                cx={cx} cy={cy} r={24}
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
                    <div>
                        <div className="chart-title">{title} <span className="chart-y-inline">• {yLabel}</span></div>
                        <div className="chart-subtitle">{subtitle}</div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="chart-skeleton">
                    <div className="skel-line" style={{ width: "100%", height: "100%" }} />
                </div>
            ) : !data || data.length === 0 ? (
                <div className="chart-empty">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                    <span>No data yet</span>
                </div>
            ) : (
                <div style={{ flex: 1, minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 26, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id={`fill-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%"   stopColor="#ffffff" stopOpacity={0.15} />
                                    <stop offset="60%"  stopColor="#ffffff" stopOpacity={0.03} />
                                    <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id={`line-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%"   stopColor="#ffffff" stopOpacity={0.3} />
                                    <stop offset="20%"  stopColor="#ffffff" stopOpacity={1} />
                                    <stop offset="80%"  stopColor="#ffffff" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#ffffff" stopOpacity={0.3} />
                                </linearGradient>
                                <filter id={`glow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                                    <feMerge>
                                        <feMergeNode in="blur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.04)"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="date"
                                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9, fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: "0.04em" }}
                                tickLine={false}
                                axisLine={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }}
                                interval={0}
                                tickMargin={8}
                            />

                            <YAxis
                                dataKey="weight"
                                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9, fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: "0.02em" }}
                                tickLine={false}
                                axisLine={false}
                                width={36}
                            />

                            <Tooltip active={false} content={() => null} />

                            <Area
                                type="natural"
                                dataKey="weight"
                                stroke={`url(#line-${uid})`}
                                strokeWidth={2.5}
                                fill={`url(#fill-${uid})`}
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
                                animationDuration={1200}
                                animationEasing="ease-out"
                            />
                        </AreaChart>
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
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6.5 6.5h11M6.5 17.5h11M3 12h18M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3" />
                        </svg>
                    </div>
                    <div className="exercise-text">
                        <span className="exercise-sub">EXERCISE</span>
                        <span className="exercise-name">{selected}</span>
                    </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8"
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
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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

    const [isKaiOpen, setIsKaiOpen] = useState(false);

    useEffect(() => {
        const handler = () => setIsKaiOpen(true);
        window.addEventListener("twin:open-kai", handler);
        return () => window.removeEventListener("twin:open-kai", handler);
    }, []);

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
          --surface:      linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 15%, transparent 35%), linear-gradient(180deg, rgba(25,35,50,0.95) 0%, rgba(10,12,15,0.98) 100%);
          --surface-2:    linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 20%, transparent 35%), linear-gradient(180deg, rgba(35,45,60,0.7) 0%, rgba(15,18,22,0.9) 100%);
          --border:       rgba(255,255,255,0.12);
          --border-hi:    rgba(255,255,255,0.25);
          --border-top:   rgba(255,255,255,0.06);
          --emerald:         #ffffff;
          --emerald-dim:     rgba(255,255,255,0.15);
          --emerald-label:   #ffffff;
          --text:         #f8fafc;
          --text-muted:   #94a3b8;
          --font-ui:      'Rajdhani', sans-serif;
          --font-display: 'Orbitron', sans-serif;

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
          background: radial-gradient(circle at 30% 40%, rgba(255,255,255,0.15) 0%, transparent 4%), radial-gradient(circle at 75% 65%, rgba(255,255,255,0.1) 0%, transparent 3%), linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.12) 30.5%, rgba(255,255,255,0.02) 32%, transparent 34%), linear-gradient(245deg, transparent 60%, rgba(255,255,255,0.1) 60.5%, rgba(255,255,255,0.02) 62%, transparent 64%), linear-gradient(170deg, transparent 75%, rgba(255,255,255,0.08) 75.5%, rgba(255,255,255,0.01) 77%, transparent 78%), linear-gradient(35deg, transparent 40%, rgba(255,255,255,0.06) 40.5%, rgba(255,255,255,0.01) 42%, transparent 43%), conic-gradient(from 90deg at 80% 20%, rgba(255,255,255,0.04) 0deg, transparent 45deg, rgba(255,255,255,0.03) 90deg, transparent 135deg), conic-gradient(from -45deg at 10% 80%, rgba(255,255,255,0.04) 0deg, transparent 60deg), conic-gradient(from 180deg at 75% 65%, #111111 0deg, #000000 30deg, #1a1a1a 90deg, #000000 150deg, #111111 200deg, #000000 260deg, #1a1a1a 320deg, transparent 320.1deg), conic-gradient(from 20deg at 30% 40%, #1a1a1a 0deg, #000000 40deg, #0f0f0f 90deg, #000000 150deg, #1c1c1c 200deg, #000000 260deg, #05140b 300deg, #080808 320deg, #1a1a1a 360deg);
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
          gap: 0;
          padding: 2px;
          border-radius: 9px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-top: 1px solid var(--border-top);
          box-shadow: 0 8px 16px -5px rgba(0,0,0,0.5);
          cursor: pointer;
          position: relative;
          transition: border-color 0.25s, background 0.25s;
          overflow: hidden;
        }

        .body-card--active {
          border-color: var(--emerald-dim);
          background: var(--surface-2);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 10px 20px -5px rgba(0,0,0,0.5);
        }

        .body-card--empty { opacity: 0.45; }
        .body-card--empty .body-label { color: var(--text-muted); }

        .body-card--active .body-label { color: var(--emerald-label); }

        .body-img-wrap {
          position: relative;
          width: 100%;
          height: auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .body-img {
          width: 100%;
          height: auto;
          max-width: 100%;
          object-fit: contain;
          filter: brightness(0.55) saturate(0.35);
          transition: filter 0.3s;
        }

        .body-card--active .body-img {
          filter: brightness(1.1) saturate(1.2) drop-shadow(0 0 8px rgba(255,255,255,0.5));
        }

        .body-img-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .body-label {
          font-family: var(--font-display);
          font-size: 8px;
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
          background: var(--emerald);
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
          border-top: 1px solid var(--border-top);
          box-shadow: 0 10px 20px -5px rgba(0,0,0,0.5);
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
          background: var(--emerald-dim);
          border: 1px solid var(--border-hi);
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
          font-size: 8.5px;
          font-weight: 700;
          color: var(--emerald);
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
          box-shadow: 0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px var(--surface-2);
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
          border-bottom: 1px solid var(--emerald-dim);
          color: var(--text-muted);
          font-family: var(--font-ui);
          font-size: 15px;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }

        .exercise-option:last-child { border-bottom: none; }
        .exercise-option:hover { background: var(--surface-2); color: var(--text); }
        .exercise-option--active { color: var(--emerald); background: var(--emerald-dim); }

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
          border-top: 1px solid var(--border-top);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.6);
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
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
        }

        .chart-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
          flex-shrink: 0;
          padding: 8px 6px 0;
        }

        .chart-title-group {
          display: flex;
          align-items: flex-start;
          gap: 7px;
        }

        .chart-title {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #ffffff;
          line-height: 1.2;
        }

        .chart-y-inline {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 600;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.02em;
        }

        .chart-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 500;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.01em;
          margin-top: 3px;
        }

        /* ── SKELETON ─────────── */
        .skel-line {
          border-radius: 6px;
          background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.05) 75%);
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
          background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.05) 75%);
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
          background: var(--emerald-dim);
          border: 1px solid rgba(255,255,255,0.06);
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
            <KaiAssistant isOpen={isKaiOpen} onClose={() => setIsKaiOpen(false)} />
        </>
    );
}