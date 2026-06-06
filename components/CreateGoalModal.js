"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  X, Plus, Trash2, Target,
  Dumbbell, Droplet, Book, Leaf, Pill, Zap, Heart, Flame, ClipboardList,
} from "lucide-react";

const AVAILABLE_ICONS = [
  { name: "Dumbbell",  component: Dumbbell,      color: "#60a5fa" },
  { name: "Droplet",   component: Droplet,        color: "#60a5fa" },
  { name: "Book",      component: Book,           color: "#10b981" },
  { name: "Leaf",      component: Leaf,           color: "#00d0ff" },
  { name: "Pill",      component: Pill,           color: "#f472b6" },
  { name: "Zap",       component: Zap,            color: "#fbbf24" },
  { name: "Heart",     component: Heart,          color: "#f87171" },
  { name: "Flame",     component: Flame,          color: "#fb923c" },
  { name: "List",      component: ClipboardList,  color: "#00d0ff" },
];

const UNITS = [
  { label: "Days",   value: "days",   mult: 1 },
  { label: "Weeks",  value: "weeks",  mult: 7 },
  { label: "Months", value: "months", mult: 30 },
  { label: "Year",   value: "year",   mult: 365 },
];

function randomIcon() {
  return AVAILABLE_ICONS[Math.floor(Math.random() * AVAILABLE_ICONS.length)].component;
}

function computeDays(value, unit) {
  const v = parseInt(value, 10);
  if (!v || v < 1) return 0;
  return v * (UNITS.find(u => u.value === unit)?.mult ?? 1);
}

function durationLabel(value, unit) {
  const v = parseInt(value, 10);
  if (!v || v < 1) return null;
  const days = computeDays(value, unit);
  if (unit === "days") return `${days} day${days !== 1 ? "s" : ""}`;
  const u = UNITS.find(x => x.value === unit);
  return `${v} ${u.label} · ${days} days`;
}

// ── Animated appear/disappear ──────────────────────────────────────────────────
function AnimatedTask({ children, style }) {
  return (
    <div
      style={{
        animation: "cgmRow 220ms cubic-bezier(0.4,0,0.2,1) both",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function CreateGoalModal({ isOpen, onClose, onSave }) {
  const [visible, setVisible]       = useState(false);
  const [goalName, setGoalName]     = useState("");
  const [durValue, setDurValue]     = useState("");
  const [durUnit, setDurUnit]       = useState("days");
  const [tasks, setTasks]           = useState([]);
  const [saving, setSaving]         = useState(false);
  const nameRef = useRef(null);

  // Fade-in on open
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
      setTimeout(() => nameRef.current?.focus(), 120);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  const effectiveDays = computeDays(durValue, durUnit);
  const label = durationLabel(durValue, durUnit);
  const canSave = goalName.trim().length > 0 && effectiveDays > 0;

  const addTask = useCallback(() => {
    setTasks(prev => [
      ...prev,
      { id: Date.now(), title: "", icon: randomIcon(), value: "", checked: false },
    ]);
  }, []);

  const updateTask = useCallback((id, patch) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  }, []);

  const removeTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);

    const serialisedTasks = tasks
      .filter(t => t.title.trim())
      .map(t => ({
        ...t,
        title: t.title.trim(),
        value: t.value.trim() || "0 / 1",
        icon: typeof t.icon === "function"
          ? (t.icon.displayName || t.icon.name || "ClipboardList")
          : (t.icon ?? "ClipboardList"),
      }));

    await onSave({
      id: Date.now(),
      name: goalName.trim(),
      days: effectiveDays,
      startDate: new Date().toISOString(),
      tasks: serialisedTasks,
    });

    setSaving(false);
    // reset
    setGoalName("");
    setDurValue("");
    setDurUnit("days");
    setTasks([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes cgmBackdrop {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes cgmCard {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes cgmRow {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Backdrop — full overlay, click-outside closes */}
      <div
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        className="absolute inset-0 z-[200] flex items-center justify-center p-4"
        style={{
          backgroundColor: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          animation: "cgmBackdrop 220ms ease both",
        }}
      >
        {/* Card */}
        <div
          className="w-full max-w-[360px] flex flex-col rounded-[24px] bg-[#111111] border border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden"
          style={{ animation: "cgmCard 260ms cubic-bezier(0.34,1.56,0.64,1) both", maxHeight: "88dvh" }}
        >
          {/* ── Top gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00d0ff]/40 to-transparent pointer-events-none" />

          {/* ── Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center h-9 w-9 rounded-[12px] bg-white/[0.04] border border-white/10 shadow-inner">
                <Target size={17} className="text-[#00d0ff] drop-shadow-[0_0_6px_#00d0ff]" />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-white tracking-wide leading-tight">Create Goal</h2>
                <p className="text-[10px] text-white/30 mt-0.5">Custom duration · Your tasks</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="grid place-items-center h-8 w-8 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-90"
            >
              <X size={15} strokeWidth={1.8} />
            </button>
          </div>

          {/* ── Scrollable body */}
          <div className="flex-1 overflow-y-auto px-5 py-2 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

            {/* Goal Name */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35 mb-1.5 block">
                Goal Name
              </label>
              <input
                ref={nameRef}
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                placeholder="e.g. 30-Day Fitness Challenge"
                className="w-full rounded-[12px] bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[#00d0ff]/60 focus:bg-white/[0.06] transition-all"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35 mb-2 block">
                Duration
              </label>

              {/* Number + unit tabs on same row */}
              <div className="flex items-center gap-2">
                {/* Number */}
                <input
                  type="number"
                  min="1"
                  max="9999"
                  value={durValue}
                  onChange={(e) => setDurValue(e.target.value)}
                  placeholder="0"
                  className="w-[80px] shrink-0 rounded-[12px] bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[#00d0ff]/60 focus:bg-white/[0.06] transition-all text-center tabular-nums"
                />

                {/* Unit pill tabs */}
                <div className="flex flex-1 gap-1.5">
                  {UNITS.map((u) => {
                    const active = durUnit === u.value;
                    return (
                      <button
                        key={u.value}
                        onClick={() => setDurUnit(u.value)}
                        className={`flex-1 py-2 rounded-[10px] text-[11px] font-bold border transition-all ${
                          active
                            ? "bg-[#00d0ff]/15 border-[#00d0ff]/50 text-[#00d0ff] shadow-[0_0_10px_rgba(0,208,255,0.2)]"
                            : "bg-white/[0.03] border-white/10 text-white/40 hover:border-white/25 hover:text-white/70"
                        }`}
                      >
                        {u.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Summary */}
              {label && (
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00d0ff] shadow-[0_0_5px_#00d0ff]" />
                  <span className="text-[11px] font-semibold text-[#00d0ff]/70">{label}</span>
                </div>
              )}
            </div>

            {/* Tasks */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                  Tasks
                </label>
                {tasks.length > 0 && (
                  <span className="text-[10px] text-white/20">{tasks.length} task{tasks.length !== 1 ? "s" : ""}</span>
                )}
              </div>

              {/* Task rows */}
              <div className="space-y-2">
                {tasks.map((task, i) => {
                  const Icon = typeof task.icon === "function" ? task.icon : ClipboardList;
                  return (
                    <AnimatedTask key={task.id} style={{ animationDelay: `${i * 25}ms` }}>
                      <div className="flex items-center gap-2 rounded-[12px] bg-[#1a1a1a] border border-white/10 px-3 py-2.5 group hover:border-white/20 transition-all">
                        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-[8px] bg-white/[0.04] border border-white/10">
                          <Icon size={13} className="text-[#00d0ff]" />
                        </div>
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) => updateTask(task.id, { title: e.target.value })}
                          className="flex-1 bg-transparent text-[13px] text-white outline-none placeholder-white/25 min-w-0"
                          placeholder="Task name…"
                          autoFocus={i === tasks.length - 1}
                        />
                        <input
                          type="text"
                          value={task.value}
                          onChange={(e) => updateTask(task.id, { value: e.target.value })}
                          className="w-14 bg-transparent text-[11px] text-white/35 outline-none text-right placeholder-white/20 focus:text-white/60 transition-colors"
                          placeholder="0 / 1"
                        />
                        <button
                          onClick={() => removeTask(task.id)}
                          className="ml-0.5 shrink-0 text-red-400/40 hover:text-red-400 transition-colors active:scale-90"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </AnimatedTask>
                  );
                })}
              </div>

              {/* Add task button */}
              <button
                onClick={addTask}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-[12px] border border-dashed border-[#00d0ff]/25 text-[#00d0ff]/60 hover:border-[#00d0ff]/55 hover:text-[#00d0ff] hover:bg-[#00d0ff]/[0.05] text-[12px] font-semibold transition-all active:scale-[0.98]"
              >
                <Plus size={13} strokeWidth={2.5} />
                Add Task
              </button>
            </div>

            {/* Bottom spacer */}
            <div className="h-1" />
          </div>

          {/* ── Footer */}
          <div className="shrink-0 px-5 pt-3 pb-5 border-t border-white/5 bg-[#111111]">
            <div className="flex gap-2.5">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-[12px] text-[13px] font-semibold text-white/50 bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.08] hover:text-white/80 transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!canSave || saving}
                className="flex-2 flex-grow-[2] py-3 rounded-[12px] text-[13px] font-bold text-[#000000] bg-[#fafafa] shadow-[0_0_20px_rgba(250,250,250,0.2)] hover:shadow-[0_0_30px_rgba(250,250,250,0.4)] disabled:opacity-35 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {saving ? "Saving…" : label ? `Create · ${label}` : "Create Goal"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
