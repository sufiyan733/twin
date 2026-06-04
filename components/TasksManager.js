"use client";

import React, { useState } from "react";
import { 
  X, Plus, Trash2, Check, Circle, Dumbbell, Droplet, 
  Book, Leaf, Pill, Zap, Heart, ClipboardList, Flame, 
  ChevronDown, ChevronUp
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

export default function TasksManager({ isOpen, onClose, tasks, setTasks }) {
  const [expandedTaskId, setExpandedTaskId] = useState(null);

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

  const renderIconSelector = (task) => {
    return (
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
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-[90%] h-[90%] max-h-[800px] flex flex-col rounded-[24px] bg-[#030818] border border-[#00d0ff]/30 shadow-[0_0_50px_rgba(0,150,255,0.15)] overflow-hidden">
        {/* Header */}
      <div className="flex items-center justify-between p-5 pb-3 border-b border-white/5 bg-[#030818]">
        <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
          <ClipboardList className="text-[#00d0ff]" size={20} />
          Tasks Manager
        </h2>
        <button
          onClick={onClose}
          className="flex items-center justify-center h-9 w-9 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/60 hover:bg-white/10 hover:text-white transition-all active:scale-90"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center text-white/30 text-sm mt-10">
            No tasks yet. Add one below.
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="rounded-[16px] border border-[#00d0ff]/20 bg-[#07112c]/60 overflow-hidden transition-all">
              {/* Task Header (Summary) */}
              <div 
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
              >
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#0a1535] border border-[#00d0ff]/20 shadow-inner">
                  {task.icon && <task.icon size={16} className="text-[#00d0ff] drop-shadow-[0_0_5px_rgba(0,208,255,0.5)]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">{task.title}</h3>
                  <p className="text-[10px] text-white/40 truncate">{task.desc}</p>
                </div>
                <div className="text-[#00d0ff] opacity-60">
                  {expandedTaskId === task.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {/* Task Edit Form (Expanded) */}
              {expandedTaskId === task.id && (
                <div className="p-4 pt-0 border-t border-white/5 space-y-4 mt-2">
                  
                  {/* Title & Desc */}
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

                  {/* Icon Selection */}
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40 ml-1 block">Icon</label>
                    {renderIconSelector(task)}
                  </div>

                  {/* Delete Button */}
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
