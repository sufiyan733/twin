"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ClipboardList, Target, Plus } from "lucide-react";

/**
 * GoalDropdown
 * Props:
 *  goals        – array of goal objects
 *  activeGoalId – null = Daily Tasks; goal.id = a custom goal
 *  onChange     – (id | null) => void
 *  onAddGoal    – () => void  (opens CreateGoalModal)
 */
export default function GoalDropdown({ goals = [], activeGoalId, onChange, onAddGoal }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const activeGoal = goals.find(g => g.id === activeGoalId) ?? null;
  const label = activeGoal ? activeGoal.name : "Daily Tasks";

  const select = (id) => { onChange(id); setOpen(false); };

  return (
    <div className="relative flex items-center gap-1.5" ref={ref}>
      {/* Dropdown trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        className="relative flex items-center gap-1.5 rounded-[10px] bg-[#0a1535] border border-[#00d0ff]/20 px-2.5 py-1.5 text-[12px] font-semibold text-white hover:border-[#00d0ff]/50 hover:text-[#00d0ff] transition-all max-w-[140px]"
        style={{ transition: "border-color 150ms ease, color 150ms ease" }}
      >
        {activeGoal ? (
          <Target size={12} className="text-[#a855f7] shrink-0" />
        ) : (
          <ClipboardList size={12} className="text-[#00d0ff] shrink-0" />
        )}
        <span className="truncate">{label}</span>
        <ChevronDown
          size={12}
          className="shrink-0 text-white/40"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 200ms cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </button>

      {/* + button */}
      <button
        onClick={onAddGoal}
        className="grid place-items-center h-[30px] w-[30px] rounded-[8px] bg-[#0a1535] border border-[#00d0ff]/20 text-[#00d0ff]/60 hover:text-[#00d0ff] hover:border-[#00d0ff]/50 hover:bg-[#00d0ff]/10 hover:shadow-[0_0_10px_rgba(0,208,255,0.2)] transition-all"
        title="Create new goal"
      >
        <Plus size={13} strokeWidth={2.5} />
      </button>

      {/* Dropdown list */}
      {open && (
        <div
          className="absolute left-3 top-[calc(100%+6px)] z-[300] w-[220px] rounded-[14px] bg-[#030c20] border border-[#00d0ff]/20 shadow-[0_8px_40px_rgba(0,150,255,0.2)] overflow-hidden"
          style={{ animation: "gdOpen 180ms cubic-bezier(0.4,0,0.2,1) both" }}
        >
          <style>{`
            @keyframes gdOpen {
              from { opacity: 0; transform: translateY(-6px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

          {/* Daily Tasks option */}
          <button
            onClick={() => select(null)}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-[12px] font-semibold transition-all ${
              activeGoalId === null
                ? "text-[#00d0ff] bg-[#00d0ff]/10"
                : "text-white/70 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <ClipboardList size={13} className="text-[#00d0ff] shrink-0" />
            Daily Tasks
            {activeGoalId === null && (
              <span className="ml-auto text-[9px] font-bold text-[#00d0ff]/60 bg-[#00d0ff]/10 border border-[#00d0ff]/20 px-1.5 py-0.5 rounded-full">
                Active
              </span>
            )}
          </button>

          {goals.length > 0 && (
            <div className="mx-3 my-1 border-t border-white/5" />
          )}

          {/* Goal entries */}
          {goals.map((goal) => {
            const isActive = activeGoalId === goal.id;
            const elapsed = Math.floor((Date.now() - new Date(goal.startDate)) / 86_400_000);
            const remaining = Math.max(0, goal.days - elapsed);
            return (
              <button
                key={goal.id}
                onClick={() => select(goal.id)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left transition-all ${
                  isActive
                    ? "bg-[#a855f7]/10"
                    : "hover:bg-white/[0.04]"
                }`}
              >
                <Target size={13} className="text-[#a855f7] shrink-0 mt-[1px]" />
                <div className="flex-1 min-w-0">
                  <p className={`text-[12px] font-semibold truncate ${isActive ? "text-[#c084fc]" : "text-white/70"}`}>
                    {goal.name}
                  </p>
                  <p className="text-[9px] text-white/30 mt-0.5">
                    {goal.days}d · {remaining}d left
                  </p>
                </div>
                {isActive && (
                  <span className="text-[9px] font-bold text-[#a855f7]/70 bg-[#a855f7]/10 border border-[#a855f7]/20 px-1.5 py-0.5 rounded-full shrink-0">
                    Active
                  </span>
                )}
              </button>
            );
          })}

          {goals.length === 0 && (
            <p className="px-4 py-3 text-[11px] text-white/25 text-center">
              No goals yet — tap <strong className="text-white/40">+</strong> to create one
            </p>
          )}
        </div>
      )}
    </div>
  );
}
