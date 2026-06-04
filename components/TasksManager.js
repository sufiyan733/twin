"use client";

import React, { useState } from "react";
import { 
  X, Plus, Trash2, Check, Circle, Dumbbell, Droplet, 
  Book, Leaf, Pill, Zap, Heart, ClipboardList, Flame, 
  ChevronDown, ChevronUp, Clock, RotateCcw
} from "lucide-react";

const AVAILABLE_ICONS = [
  { name: "Dumbbell", component: Dumbbell, color: "#60a5fa" },
  { name: "Droplet", component: Droplet, color: "#60a5fa" },
  { name: "Book", component: Book, color: "#10b981" },
  { name: "Leaf", component: Leaf, color: "#a855f7" },
  { name: "Pill", component: Pill, color: "#f472b6" },
  { name: "Zap", component: Zap, color: "#fbbf24" },
  { name: "Heart", component: Heart, color: "#f87171" },
  { name: "Flame", component: Flame, color: "#fb923c" },
  { name: "List", component: ClipboardList, color: "#00d0ff" },
];

function formatTime12h(time24) {
  if (!time24) return "12:00 AM";
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function parseTime(input) {
  const normalized = input.toLowerCase().trim().replace(/[^a-z0-9:]/g, '');
  if (!normalized) return null;
  let h, m, ampm;
  
  if (normalized.includes(':')) {
    const parts = normalized.split(':');
    h = parseInt(parts[0], 10);
    const mPart = parts[1].replace(/[a-z]/g, '');
    m = parseInt(mPart || 0, 10);
    ampm = normalized.includes('pm') ? 'pm' : normalized.includes('am') ? 'am' : null;
  } else {
    ampm = normalized.includes('pm') ? 'pm' : normalized.includes('am') ? 'am' : null;
    const digits = normalized.replace(/[a-z]/g, '');
    if (digits.length <= 2) {
      h = parseInt(digits || 0, 10);
      m = 0;
    } else if (digits.length === 3) {
      h = parseInt(digits.substring(0, 1), 10);
      m = parseInt(digits.substring(1), 10);
    } else {
      h = parseInt(digits.substring(0, 2), 10);
      m = parseInt(digits.substring(2, 4), 10);
    }
  }

  if (isNaN(h) || isNaN(m)) return null;

  if (ampm === "pm" && h < 12) h += 12;
  if (ampm === "am" && h === 12) h = 0;
  
  if (h > 23 || m > 59) return null;
  
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function TasksManager({ isOpen, onClose, tasks, setTasks, resetTime, onResetTimeChange }) {
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeInput, setTimeInput] = useState("");

  if (!isOpen) return null;

  const updateTask = (id, updates) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addNewTask = () => {
    const newTask = {
      id: Date.now(),
      title: "New Task",
      desc: "Task description",
      icon: ClipboardList,
      value: "0 / 1",
      checked: false,
    };
    setTasks([...tasks, newTask]);
    setExpandedTaskId(newTask.id);
  };

  const renderIconSelector = (task) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {AVAILABLE_ICONS.map((iconObj, idx) => {
        const IconComp = iconObj.component;
        const isSelected = task.icon === IconComp;
        return (
          <button
            key={idx}
            onClick={() => updateTask(task.id, { icon: IconComp })}
            className={`p-2 rounded-xl border transition-all ${
              isSelected
                ? "bg-[#00d0ff]/20 border-[#00d0ff]/50 shadow-[0_0_10px_rgba(0,208,255,0.3)]"
                : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05]"
            }`}
          >
            <IconComp size={16} color={iconObj.color} className={isSelected ? "drop-shadow-[0_0_5px_currentColor]" : ""} />
          </button>
        );
      })}
    </div>
  );

  const completedCount = tasks.filter(t => t.checked).length;

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-[95%] h-[95%] max-h-[800px] flex flex-col rounded-[24px] bg-[#030818] border border-[#00d0ff]/30 shadow-[0_0_50px_rgba(0,150,255,0.15)] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/5 bg-[#030818] shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <ClipboardList className="text-[#00d0ff]" size={20} />
              Tasks Manager
            </h2>
            {tasks.length > 0 && (
              <p className="text-[10px] text-white/30 mt-0.5">
                {completedCount} / {tasks.length} completed today
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-9 w-9 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/60 hover:bg-white/10 hover:text-white transition-all active:scale-90"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Daily Reset Time Section */}
        <div className="px-5 py-4 border-b border-white/5 bg-[#020b1e] shrink-0 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <RotateCcw size={14} className="text-[#00d0ff]" />
              <p className="text-sm font-semibold text-white tracking-wide">Daily Reset Time</p>
            </div>
            <p className="text-[10px] text-white/40">Tasks auto-reset to empty at this time</p>
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
                  if (parsed) {
                    onResetTimeChange(parsed);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.target.blur();
                  }
                }}
                className="w-full bg-white/[0.04] border border-[#00d0ff]/50 rounded-xl px-3 py-2 text-sm text-[#00d0ff] font-bold outline-none shadow-[0_0_15px_rgba(0,208,255,0.2)] transition-all text-center"
                placeholder="e.g. 10:30 PM"
              />
            ) : (
              <button
                onClick={() => {
                  setTimeInput(formatTime12h(resetTime));
                  setIsEditingTime(true);
                }}
                className="w-full group relative bg-white/[0.04] border border-white/10 hover:border-[#00d0ff]/40 rounded-xl px-3 py-2 text-sm text-white hover:text-[#00d0ff] font-bold transition-all text-center flex items-center justify-center gap-1.5"
              >
                <Clock size={14} className="text-[#00d0ff] group-hover:scale-110 transition-transform" />
                {formatTime12h(resetTime)}
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-transparent group-hover:ring-[#00d0ff]/30 transition-all pointer-events-none" />
              </button>
            )}
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-white/20">
              <ClipboardList size={28} strokeWidth={1.2} />
              <p className="text-sm">No tasks yet. Add one below.</p>
            </div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className={`rounded-[16px] border ${task.checked ? 'border-[#00d0ff]/10 opacity-60' : 'border-[#00d0ff]/20'} bg-[#07112c]/60 overflow-hidden transition-all`}>
                {/* Task Summary Row */}
                <div
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                >
                  <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#0a1535] border border-[#00d0ff]/20 shadow-inner ${task.checked ? 'opacity-50' : ''}`}>
                    {task.icon && <task.icon size={16} className="text-[#00d0ff] drop-shadow-[0_0_5px_rgba(0,208,255,0.5)]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-semibold truncate ${task.checked ? 'text-white/40 line-through decoration-[#00d0ff]/60' : 'text-white'}`}>
                      {task.title}
                    </h3>
                    <p className="text-[10px] text-white/40 truncate">{task.desc}</p>
                  </div>
                  {task.checked && (
                    <span className="text-[9px] font-bold text-[#00d0ff]/70 bg-[#00d0ff]/10 border border-[#00d0ff]/20 px-2 py-0.5 rounded-full shrink-0">Done</span>
                  )}
                  <div className="text-[#00d0ff] opacity-60 shrink-0">
                    {expandedTaskId === task.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {/* Expanded Edit Form */}
                {expandedTaskId === task.id && (
                  <div className="p-4 pt-0 border-t border-white/5 space-y-4 mt-2">
                    <div className="grid grid-cols-1 gap-3 mt-4">
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40 ml-1 mb-1 block">Title</label>
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) => updateTask(task.id, { title: e.target.value })}
                          className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-[#00d0ff]/50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40 ml-1 mb-1 block">Description</label>
                        <input
                          type="text"
                          value={task.desc}
                          onChange={(e) => updateTask(task.id, { desc: e.target.value })}
                          className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-[#00d0ff]/50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40 ml-1 mb-1 block">Right Corner Value</label>
                        <input
                          type="text"
                          value={task.value}
                          onChange={(e) => updateTask(task.id, { value: e.target.value })}
                          className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-[#00d0ff]/50 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40 ml-1 block">Icon</label>
                      {renderIconSelector(task)}
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all text-xs font-semibold"
                      >
                        <Trash2 size={14} />
                        Delete Task
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          <button
            onClick={addNewTask}
            className="w-full flex items-center justify-center gap-2 py-3 mt-4 rounded-xl border border-dashed border-[#00d0ff]/40 text-[#00d0ff] hover:bg-[#00d0ff]/10 transition-all text-sm font-semibold"
          >
            <Plus size={16} />
            Add New Task
          </button>
        </div>
      </div>
    </div>
  );
}
