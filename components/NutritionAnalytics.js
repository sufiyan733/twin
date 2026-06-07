"use client";

import React, { useState, useId, useRef, useEffect } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { ChevronDown, Droplet, Flame, Leaf, Dumbbell } from "lucide-react";

const mockData = [
    { date: "JUN 3", Calories: 2150, Protein: 140, Fat: 60, Carbs: 210 },
    { date: "JUN 4", Calories: 2300, Protein: 160, Fat: 70, Carbs: 230 },
    { date: "JUN 5", Calories: 1950, Protein: 120, Fat: 55, Carbs: 180 },
    { date: "JUN 6", Calories: 2400, Protein: 180, Fat: 75, Carbs: 250 },
    { date: "JUN 7", Calories: 2200, Protein: 150, Fat: 65, Carbs: 220 },
];

const METRICS = [
    { id: "Calories", label: "Calories", icon: Droplet, color: "#60a5fa", unit: "kcal" },
    { id: "Protein", label: "Protein", icon: Dumbbell, color: "#10b981", unit: "g" },
    { id: "Fat", label: "Fat", icon: Flame, color: "#f43f5e", unit: "g" },
    { id: "Carbs", label: "Carbs", icon: Leaf, color: "#f59e0b", unit: "g" },
];

function GlowDot({ cx, cy, payload, value, index, activeIndex, fadingIndex, onToggle, unit, color }) {
    if (cx == null || cy == null) return null;
    const isActive = index === activeIndex;
    const isFading = index === fadingIndex;
    const displayValue = Array.isArray(value) ? value[1] : value;

    // Dynamically position tooltip to avoid clipping without relying on massive chart margins
    const isNearTop = cy < 60;
    const tooltipY = isNearTop ? cy + 20 : cy - 60;
    let tooltipX = cx - 45;
    if (index === 0) tooltipX = cx - 10;
    if (index === 4) tooltipX = cx - 80;

    const transformOrigin = isNearTop
        ? (index === 0 ? "top left" : index === 4 ? "top right" : "top center")
        : (index === 0 ? "bottom left" : index === 4 ? "bottom right" : "bottom center");

    return (
        <g
            className="chart-dot"
            style={{
                cursor: "pointer",
                pointerEvents: "all",
                outline: "none",
                userSelect: "none",
                WebkitTapHighlightColor: "transparent"
            }}
            onClick={(e) => {
                e.stopPropagation();
                onToggle(index);
            }}
        >
            <circle cx={cx} cy={cy} r={24} fill="transparent" />
            <circle cx={cx} cy={cy} r={isActive ? 16 : 0} fill="#f1f5f9" opacity={0.15} style={{ transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)" }} />
            <circle cx={cx} cy={cy} r={isActive ? 5 : 3} fill={isActive ? "#0f172a" : "#f1f5f9"} stroke="#f1f5f9" strokeWidth={isActive ? 2 : 0} style={{ transition: "all 0.2s ease" }} />

            {(isActive || isFading) && (
                <foreignObject
                    x={tooltipX}
                    y={tooltipY}
                    width={90}
                    height={54}
                    style={{ overflow: "visible" }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(15,23,42,0.85)",
                            backdropFilter: "blur(12px)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "12px",
                            padding: "8px 12px",
                            boxShadow: "0 20px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.2)",
                            opacity: isActive ? 1 : 0,
                            transform: isActive ? "translateY(0) scale(1)" : `translateY(${isNearTop ? -8 : 8}px) scale(0.95)`,
                            transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
                            transformOrigin: transformOrigin,
                        }}
                    >
                        <span style={{ fontSize: "14px", fontWeight: "700", color: "#f1f5f9", letterSpacing: "0.01em", lineHeight: 1 }}>
                            {displayValue}<span style={{ fontSize: "10px", marginLeft: "2px", color: "#94a3b8", fontWeight: "600" }}>{unit}</span>
                        </span>
                        <span style={{ fontSize: "9px", fontWeight: "600", color: "#94a3b8", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1 }}>
                            {payload?.date}
                        </span>
                    </div>
                </foreignObject>
            )}
        </g>
    );
}

export default function NutritionAnalytics() {
    const [selectedMetric, setSelectedMetric] = useState(METRICS[0]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [activeIndex, setActiveIndex] = useState(null);
    const [fadingIndex, setFadingIndex] = useState(null);
    const timeoutRef = useRef(null);
    const uid = useId();

    const handleToggle = (index) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (activeIndex === index) {
            setFadingIndex(index);
            setActiveIndex(null);
            timeoutRef.current = setTimeout(() => {
                setFadingIndex((current) => (current === index ? null : current));
            }, 300);
        } else {
            setActiveIndex(index);
            setFadingIndex(null);

            timeoutRef.current = setTimeout(() => {
                setFadingIndex(index);
                setActiveIndex(null);
                setTimeout(() => {
                    setFadingIndex((current) => (current === index ? null : current));
                }, 300);
            }, 2000);
        }
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <section
            className="relative shrink-0 overflow-visible rounded-[32px] p-6"
            style={{
                background: "radial-gradient(120% 100% at 50% 100%, rgba(30,41,59,0.5) 0%, rgba(2,6,23,0.95) 100%)",
                border: "1px solid rgba(255,255,255,0.05)",
                boxShadow: "0 24px 48px -12px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.15)",
                backdropFilter: "blur(48px)",
                WebkitBackdropFilter: "blur(48px)"
            }}
            onClick={() => { setActiveIndex(null); setFadingIndex(null); setIsDropdownOpen(false); }}
        >
            {/* Header: Title & Dropdown */}
            <div className="flex items-center justify-between mb-6 relative" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col gap-1">
                    <div className="text-[12px] font-bold tracking-[0.1em] text-white/90 uppercase whitespace-nowrap">
                        NUTRITION ANALYTICS
                    </div>
                    <div className="text-[11px] font-medium text-white/40 tracking-wide">
                        Past 5 days history
                    </div>
                </div>

                <div className="relative z-50">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all active:scale-95 hover:bg-white/10"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    >
                        <selectedMetric.icon size={12} style={{ color: selectedMetric.color }} strokeWidth={2.5} />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">{selectedMetric.label}</span>
                        <ChevronDown size={12} className="text-white/40 ml-0.5" strokeWidth={2.5} />
                    </button>

                    {isDropdownOpen && (
                        <div
                            className="absolute right-0 top-full mt-2 w-[140px] rounded-[20px] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                            style={{
                                background: "rgba(15,23,42,0.85)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                boxShadow: "0 24px 48px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)",
                                backdropFilter: "blur(32px)"
                            }}
                        >
                            {METRICS.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => {
                                        setSelectedMetric(m);
                                        setIsDropdownOpen(false);
                                        setActiveIndex(null);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
                                >
                                    <m.icon size={14} style={{ color: m.color }} />
                                    <span className="text-[11px] font-bold text-white uppercase tracking-wider">{m.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chart */}
            <div className="h-[150px] w-full -ml-1 mt-2" style={{ outline: "none", overflow: "visible" }}>
                <ResponsiveContainer width="100%" height="100%" className="focus:outline-none" style={{ outline: "none", overflow: "visible" }}>
                    <AreaChart
                        data={mockData}
                        margin={{ top: 15, right: 15, left: 0, bottom: 0 }}
                        style={{ outline: "none", overflow: "visible" }}
                    >
                        <defs>
                            <linearGradient id={`fill-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor={selectedMetric.color} stopOpacity={0.3} />
                                <stop offset="60%" stopColor={selectedMetric.color} stopOpacity={0.05} />
                                <stop offset="100%" stopColor={selectedMetric.color} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id={`line-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={selectedMetric.color} stopOpacity={0.3} />
                                <stop offset="20%" stopColor={selectedMetric.color} stopOpacity={1} />
                                <stop offset="80%" stopColor={selectedMetric.color} stopOpacity={1} />
                                <stop offset="100%" stopColor={selectedMetric.color} stopOpacity={0.3} />
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
                            stroke="rgba(255,255,255,0.03)"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="date"
                            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9, fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: "0.06em" }}
                            tickLine={false}
                            axisLine={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }}
                            interval={0}
                            tickMargin={10}
                        />

                        <YAxis
                            tickFormatter={(val) => `${val}${selectedMetric.unit}`}
                            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9, fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: "0.02em" }}
                            tickLine={false}
                            axisLine={false}
                            width={45}
                        />

                        <Tooltip cursor={false} content={() => null} />

                        <Area
                            type="natural"
                            dataKey={selectedMetric.id}
                            stroke={`url(#line-${uid})`}
                            strokeWidth={2.5}
                            fill={`url(#fill-${uid})`}
                            dot={(props) => (
                                <GlowDot
                                    {...props}
                                    activeIndex={activeIndex}
                                    fadingIndex={fadingIndex}
                                    onToggle={handleToggle}
                                    unit={selectedMetric.unit}
                                    color={selectedMetric.color}
                                />
                            )}
                            activeDot={false}
                            filter={`url(#glow-${uid})`}
                            isAnimationActive={true}
                            animationDuration={1500}
                            animationEasing="ease-out"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Global style override to brutally force outline removal on Recharts */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .recharts-wrapper * {
                    outline: none !important;
                }
                .recharts-responsive-container {
                    overflow: visible !important;
                }
                .recharts-wrapper {
                    overflow: visible !important;
                }
                .recharts-tooltip-cursor {
                    display: none;
                }
            `}} />
        </section>
    );
}
