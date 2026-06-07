"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import {
  X, Plus, Trash2,
  Dumbbell, Droplet,
  Book, Leaf, Pill, Zap, Heart, ClipboardList, Flame,
  ChevronDown, Clock, RotateCcw, Target
} from "lucide-react";

const AVAILABLE_ICONS = [
  { name: "Dumbbell",  component: Dumbbell,      color: "#60a5fa" },
  { name: "Droplet",   component: Droplet,       color: "#60a5fa" },
  { name: "Book",      component: Book,          color: "#10b981" },
  { name: "Leaf",      component: Leaf,          color: "#00d0ff" },
  { name: "Pill",      component: Pill,          color: "#f472b6" },
  { name: "Zap",       component: Zap,           color: "#fbbf24" },
  { name: "Heart",     component: Heart,         color: "#f87171" },
  { name: "Flame",     component: Flame,         color: "#fb923c" },
  { name: "List",      component: ClipboardList, color: "#00d0ff" },
];

// Icon name → component lookup (mirrors page.js ICON_MAP)
const ICON_MAP = {
  Dumbbell, Droplet, Book, Leaf, Pill, Zap, Heart, Flame,
  ClipboardList, List: ClipboardList,
};

/** Safely resolve a task icon — handles string keys, functions, and Lucide objects */
function resolveIcon(icon) {
  if (!icon) return ClipboardList;
  if (typeof icon === "string") return ICON_MAP[icon] ?? ClipboardList;
  if (typeof icon === "function") return icon;
  if (typeof icon === "object" && typeof icon.render === "function") return icon;
  return ClipboardList;
}

function formatTime12h(time24) {
  if (!time24) return "12:00 AM";
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function parseTime(input) {
  const normalized = input.toLowerCase().trim().replace(/[^a-z0-9:]/g, "");
  if (!normalized) return null;
  let h, m, ampm;
  if (normalized.includes(":")) {
    const parts = normalized.split(":");
    h = parseInt(parts[0], 10);
    const mPart = parts[1].replace(/[a-z]/g, "");
    m = parseInt(mPart || 0, 10);
    ampm = normalized.includes("pm") ? "pm" : normalized.includes("am") ? "am" : null;
  } else {
    ampm = normalized.includes("pm") ? "pm" : normalized.includes("am") ? "am" : null;
    const digits = normalized.replace(/[a-z]/g, "");
    if (digits.length <= 2)       { h = parseInt(digits || 0, 10); m = 0; }
    else if (digits.length === 3) { h = parseInt(digits.substring(0, 1), 10); m = parseInt(digits.substring(1), 10); }
    else                          { h = parseInt(digits.substring(0, 2), 10); m = parseInt(digits.substring(2, 4), 10); }
  }
  if (isNaN(h) || isNaN(m)) return null;
  if (ampm === "pm" && h < 12) h += 12;
  if (ampm === "am" && h === 12) h = 0;
  if (h > 23 || m > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ── Animated expand panel ─────────────────────────────────────────────────────
// Key fix: ref is on the INNER div so scrollHeight is always the content height,
// not the clipped outer height. This makes open/close silky smooth.
function ExpandPanel({ open, children }) {
  const innerRef = useRef(null);
  const outerRef = useRef(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    if (open) {
      // Animate to exact content height then release to "auto" so dynamic content
      // inside (e.g., typing) can resize naturally without re-measuring.
      const targetH = inner.scrollHeight;
      outer.style.height = `${targetH}px`;

      const onEnd = () => {
        if (outerRef.current) outerRef.current.style.height = "auto";
      };
      outer.addEventListener("transitionend", onEnd, { once: true });
      return () => outer.removeEventListener("transitionend", onEnd);
    } else {
      // Snapshot the current rendered height then collapse to 0.
      // This is critical: setting height→height first forces a reflow so the
      // transition fires instead of jumping straight to 0.
      const current = outer.offsetHeight;
      outer.style.height = `${current}px`;
      // Double-rAF so the browser has committed the height before we animate to 0.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (outerRef.current) outerRef.current.style.height = "0px";
        });
      });
    }
  }, [open]);

  return (
    <div
      ref={outerRef}
      style={{
        height: 0,
        overflow: "hidden",
        transition: "height 280ms cubic-bezier(0.4,0,0.2,1)",
        willChange: "height",
      }}
    >
      <div ref={innerRef}>
        {children}
      </div>
    </div>
  );
}

// ── Individual task row — memoized so sibling edits don't re-render it ─────────
const TaskRow = memo(function TaskRow({ task, index, isExpanded, onToggleExpand, onUpdate, onDelete }) {
  return (
    <div
      className={`rounded-[16px] border bg-gradient-to-b from-[#222224] to-[#161618] border border-white/[0.04] overflow-hidden ${
        task.checked ? "border-white/10 opacity-60" : "border-white/10 hover:border-white/20"
      } ${isExpanded ? "shadow-[0_0_25px_rgba(0,208,255,0.08)]" : ""}`}
      style={{
        animation: `tmFadeSlideUp 280ms ${index * 35}ms both ease-out`,
        transition: "border-color 200ms ease, box-shadow 200ms ease, opacity 200ms ease",
        willChange: "transform, opacity",
      }}
    >
      {/* Summary row */}
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/[0.02] select-none"
        style={{ transition: "background 120ms ease" }}
        onClick={onToggleExpand}
      >
        <div
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/[0.04] border border-white/10 shadow-inner ${
            task.checked ? "opacity-50 scale-90" : "scale-100"
          }`}
          style={{ transition: "opacity 200ms ease, transform 200ms ease" }}
        >
          {(() => { const Icon = resolveIcon(task.icon); return <Icon size={16} className="text-[#00d0ff] drop-shadow-[0_0_5px_rgba(0,208,255,0.5)]" />; })()}
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={`text-sm font-semibold truncate ${
              task.checked ? "text-white/40 line-through decoration-[#00d0ff]/60" : "text-white"
            }`}
            style={{ transition: "color 200ms ease" }}
          >
            {task.title}
          </h3>
          <p className="text-[10px] text-white/40 truncate">{task.desc}</p>
        </div>

        {task.checked && (
          <span className="text-[9px] font-bold text-[#00d0ff]/70 bg-[#00d0ff]/10 border border-[#00d0ff]/20 px-2 py-0.5 rounded-full shrink-0">
            Done
          </span>
        )}

        <div
          className="text-white/60 shrink-0"
          style={{
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 280ms cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <ChevronDown size={18} />
        </div>
      </div>

      {/* Expand panel */}
      <ExpandPanel open={isExpanded}>
        <div className="p-4 pt-0 border-t border-white/5 space-y-4 mt-2">
          <div className="grid grid-cols-1 gap-3 mt-4">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40 ml-1 mb-1 block">Title</label>
              <input
                type="text"
                value={task.title}
                onChange={(e) => onUpdate(task.id, { title: e.target.value })}
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-[#00d0ff]/50"
                style={{ transition: "border-color 150ms ease" }}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40 ml-1 mb-1 block">Target</label>
              <input
                type="text"
                value={task.value}
                onChange={(e) => onUpdate(task.id, { value: e.target.value })}
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-[#00d0ff]/50"
                style={{ transition: "border-color 150ms ease" }}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onDelete(task.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 text-xs font-semibold"
              style={{ transition: "background 150ms ease, color 150ms ease" }}
            >
              <Trash2 size={14} />
              Delete Task
            </button>
          </div>
        </div>
      </ExpandPanel>
    </div>
  );
});

// ── Main component ─────────────────────────────────────────────────────────────
export default function TasksManager({
  isOpen, onClose, tasks, setTasks, resetTime, onResetTimeChange,
  goals = [], setGoals, activeGoalId, setActiveGoalId,
}) {
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeInput, setTimeInput] = useState("");
  const [visible, setVisible] = useState(false);
  // selectedTab: null = Daily Tasks, number = goal id
  const [selectedTab, setSelectedTab] = useState(null);

  // Fade-in / slide-up on open
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Sync selectedTab with activeGoalId from parent whenever modal opens
  useEffect(() => {
    if (isOpen) setSelectedTab(activeGoalId ?? null);
  }, [isOpen, activeGoalId]);

  // Stable callbacks — these must never change identity so memoized TaskRow skips re-renders
  const updateTask = useCallback((id, updates) => {
    if (selectedTab != null) {
      // update inside a goal
      setGoals(prev => prev.map(g =>
        g.id === selectedTab
          ? { ...g, tasks: g.tasks.map(t => t.id === id ? { ...t, ...updates } : t) }
          : g
      ));
    } else {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    }
  }, [setTasks, setGoals, selectedTab]);

  const deleteTask = useCallback((id) => {
    if (selectedTab != null) {
      setGoals(prev => prev.map(g =>
        g.id === selectedTab ? { ...g, tasks: g.tasks.filter(t => t.id !== id) } : g
      ));
    } else {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  }, [setTasks, setGoals, selectedTab]);

  const addNewTask = useCallback(() => {
    const randomIcon = AVAILABLE_ICONS[Math.floor(Math.random() * AVAILABLE_ICONS.length)].component;
    const newTask = {
      id: Date.now(),
      title: "New Task",
      icon: randomIcon,
      value: "0 / 1",
      checked: false,
    };
    if (selectedTab != null) {
      setGoals(prev => prev.map(g =>
        g.id === selectedTab ? { ...g, tasks: [...(g.tasks ?? []), newTask] } : g
      ));
    } else {
      setTasks(prev => [...prev, newTask]);
    }
    setExpandedTaskId(newTask.id);
  }, [setTasks, setGoals, selectedTab]);

  const deleteGoal = useCallback((goalId) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
    if (activeGoalId === goalId) setActiveGoalId?.(null);
    setSelectedTab(null);
  }, [setGoals, activeGoalId, setActiveGoalId]);

  const handleToggleExpand = useCallback((id) => {
    setExpandedTaskId(prev => prev === id ? null : id);
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!isOpen || !mounted) return null;

  // Determine active task list
  const activeGoal = goals.find(g => g.id === selectedTab) ?? null;
  const activeTasks = activeGoal ? (activeGoal.tasks ?? []) : tasks;
  const completedCount = activeTasks.filter(t => t.checked).length;
  const accentColor = activeGoal ? "#00d0ff" : "#00d0ff";
  const accentGlow = activeGoal ? "rgba(0,208,255,0.3)" : "rgba(0,208,255,0.3)";

  return createPortal(
    <>
      {/* Keyframes — hoisted outside render tree so they're never re-injected */}
      <style>{`
        @keyframes tmFadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes tmOverlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6"
        style={{
          backgroundColor: visible ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          opacity: visible ? 1 : 0,
          transition: "opacity 260ms ease",
          willChange: "opacity",
        }}
      >
        <div
          className="w-full max-w-[420px] h-[85vh] max-h-[800px] flex flex-col rounded-[24px] bg-[#000000] bg-gradient-to-b from-[#18181a] to-[#0e0e10] border border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(14px)",
            transition: "opacity 260ms cubic-bezier(0.4,0,0.2,1), transform 260ms cubic-bezier(0.4,0,0.2,1)",
            willChange: "transform, opacity",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/5 bg-[#000000] bg-gradient-to-b from-[#18181a] to-[#0e0e10] shrink-0">
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <ClipboardList className="text-[#00d0ff]" size={20} />
                Tasks Manager
              </h2>
              {activeTasks.length > 0 && (
                <p className="text-[10px] text-white/30 mt-0.5">
                  {completedCount} / {activeTasks.length} completed
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center h-9 w-9 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/60 hover:bg-white/10 hover:text-white active:scale-90"
              style={{ transition: "background 150ms ease, color 150ms ease, transform 100ms ease" }}
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Goal Tabs */}
          <div className="px-4 pt-3 pb-0 shrink-0 border-b border-white/5">
            <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-none">
              {/* Daily Tasks tab */}
              <button
                onClick={() => setSelectedTab(null)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[11px] font-semibold whitespace-nowrap border transition-all ${
                  selectedTab === null
                    ? "bg-[#00d0ff]/15 border-[#00d0ff]/40 text-[#00d0ff] shadow-[0_0_10px_rgba(0,208,255,0.2)]"
                    : "bg-white/[0.03] border-white/10 text-white/50 hover:border-white/25 hover:text-white/80"
                }`}
              >
                <ClipboardList size={11} />
                Daily
              </button>

              {/* Goal tabs */}
              {goals.map((goal) => {
                const isActive = selectedTab === goal.id;
                const elapsed = Math.floor((Date.now() - new Date(goal.startDate)) / 86_400_000);
                const remaining = Math.max(0, goal.days - elapsed);
                return (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedTab(goal.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[11px] font-semibold whitespace-nowrap border transition-all ${
                      isActive
                        ? "bg-[#00d0ff]/15 border-[#00d0ff]/40 text-[#00d0ff] shadow-[0_0_10px_rgba(0,208,255,0.2)]"
                        : "bg-white/[0.03] border-white/10 text-white/50 hover:border-white/25 hover:text-white/80"
                    }`}
                  >
                    <Target size={11} />
                    <span className="max-w-[80px] truncate">{goal.name}</span>
                    <span className={`text-[9px] ${ isActive ? "text-[#00d0ff]/70" : "text-white/25" }`}>
                      {remaining}d
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Reset Time — only shown on Daily tab */}
          {selectedTab === null && (
            <div className="px-5 py-4 border-b border-white/5 bg-[#000000] bg-gradient-to-b from-[#18181a] to-[#0e0e10] shrink-0 flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <RotateCcw size={14} className="text-[#00d0ff]" />
                <p className="text-sm font-semibold text-white tracking-wide">Daily Reset Time</p>
              </div>
              <p className="text-[10px] text-white/40">Tasks &amp; meals auto-reset at this time</p>
            </div>

            <div className="relative min-w-[130px]">
              {isEditingTime ? (
                <input
                  type="text"
                  autoFocus
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                  onBlur={() => {
                    setIsEditingTime(false);
                    const parsed = parseTime(timeInput);
                    if (parsed) onResetTimeChange(parsed);
                  }}
                  onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                  className="w-full bg-white/[0.04] border border-[#00d0ff]/50 rounded-xl px-3 py-2 text-sm text-[#00d0ff] font-bold outline-none shadow-[0_0_15px_rgba(0,208,255,0.2)] text-center"
                  style={{ transition: "border-color 150ms ease, box-shadow 150ms ease" }}
                  placeholder="e.g. 10:30 PM"
                />
              ) : (
                <button
                  onClick={() => { setTimeInput(formatTime12h(resetTime)); setIsEditingTime(true); }}
                  className="w-full group relative bg-white/[0.04] border border-white/10 hover:border-[#00d0ff]/40 rounded-xl px-3 py-2 text-sm text-white hover:text-[#00d0ff] font-bold text-center flex items-center justify-center gap-1.5"
                  style={{ transition: "border-color 150ms ease, color 150ms ease" }}
                >
                  <Clock size={14} className="text-[#00d0ff]" style={{ transition: "transform 150ms ease" }} />
                  {formatTime12h(resetTime)}
                </button>
              )}
            </div>
          </div>
          )}

          {/* Goal info bar — shown when a goal tab is active */}
          {selectedTab !== null && (() => {
            const g = goals.find(x => x.id === selectedTab);
            if (!g) return null;
            const elapsed = Math.floor((Date.now() - new Date(g.startDate)) / 86_400_000);
            const remaining = Math.max(0, g.days - elapsed);
            return (
              <div className="px-5 py-3 border-b border-white/5 bg-[#000000] bg-gradient-to-b from-[#18181a] to-[#0e0e10] shrink-0 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#00d0ff]">{g.name}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{g.days} day goal · {remaining} days remaining</p>
                </div>
                <button
                  onClick={() => deleteGoal(g.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-red-500/10 text-red-400/70 hover:bg-red-500/20 hover:text-red-400 text-[11px] font-semibold border border-red-500/10 transition-all"
                >
                  <Trash2 size={12} />
                  Delete Goal
                </button>
              </div>
            );
          })()}

          {/* Task List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {activeTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2 text-white/20">
                <ClipboardList size={28} strokeWidth={1.2} />
                <p className="text-sm">{activeGoal ? "No tasks yet. Add one below." : "No tasks yet. Add one below."}</p>
              </div>
            ) : (
              activeTasks.map((task, i) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  index={i}
                  isExpanded={expandedTaskId === task.id}
                  onToggleExpand={() => handleToggleExpand(task.id)}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                />
              ))
            )}

            <button
              onClick={addNewTask}
              className="w-full flex items-center justify-center gap-2 py-3 mt-4 rounded-xl border border-dashed text-sm font-semibold transition-all active:scale-[0.98]"
              style={{
                borderColor: `${accentColor}66`,
                color: accentColor,
                transition: "background 150ms ease, border-color 150ms ease, transform 100ms ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${accentColor}18`; e.currentTarget.style.borderColor = `${accentColor}99`; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = `${accentColor}66`; }}
            >
              <Plus size={16} />
              Add New Task
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
