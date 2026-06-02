"use client";

import React, { useState } from "react";
import {
  Bell,
  Book,
  Check,
  ChevronDown,
  Circle,
  Dumbbell,
  Flame,
  Heart,
  Home,
  Leaf,
  Menu,
  Pill,
  Plus,
  Send,
  Sparkles,
  User,
  Zap,
  Droplet,
  ClipboardList
} from "lucide-react";

export default function Page() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Morning Workout",
      desc: "30 min Strength Training",
      icon: Dumbbell,
      accent: "text-[#ff5e5e]",
      bg: "bg-[#112a46]",
      iconColor: "text-[#60a5fa]",
      value: "350 kcal",
      checked: true,
      valIcon: Flame
    },
    {
      id: 2,
      title: "Drink 2L Water",
      desc: "Stay Hydrated",
      icon: Droplet,
      accent: "text-[#60a5fa]",
      bg: "bg-[#0b284a]",
      iconColor: "text-[#60a5fa]",
      value: "2 / 2 Liters",
      checked: true,
    },
    {
      id: 3,
      title: "Read 20 Pages",
      desc: "Self Growth",
      icon: Book,
      accent: "text-[#10b981]",
      bg: "bg-[#063328]",
      iconColor: "text-[#10b981]",
      value: "0 / 20 Pages",
      checked: false,
    },
    {
      id: 4,
      title: "Meditate",
      desc: "10 min Mindfulness",
      icon: Leaf,
      accent: "text-[#a855f7]",
      bg: "bg-[#2d1b4e]",
      iconColor: "text-[#a855f7]",
      value: "0 / 10 min",
      checked: false,
    },
    {
      id: 5,
      title: "Take Vitamins",
      desc: "Health First",
      icon: Pill,
      accent: "text-[#fbbf24]",
      bg: "bg-[#3f2c1b]",
      iconColor: "text-[#fbbf24]",
      value: "1 / 1 Done",
      checked: true,
    },
  ]);

  const [query, setQuery] = useState("");

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
  };

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-[#020617] font-sans text-white">
      <div className="relative mx-auto flex h-[100dvh] w-full max-w-[400px] flex-col overflow-hidden bg-[#010614] shadow-[0_0_50px_rgba(0,10,40,0.5)]">

        {/* Background Gradients & Effects */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.15),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(14,165,233,0.1),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:20px_20px]" />

        {/* Header */}
        <header className="relative z-10 flex shrink-0 items-center justify-between px-5 pt-4 pb-1.5">
          <button type="button" className="text-white/80 hover:text-white transition-colors">
            <Menu size={24} strokeWidth={1.5} />
          </button>

          <button type="button" className="relative text-white/80 hover:text-white transition-colors">
            <Bell size={22} strokeWidth={1.5} />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#00d0ff] shadow-[0_0_8px_#00d0ff]" />
          </button>
        </header>
        
        <div className="relative z-10 px-5 pb-3 shrink-0">
          <p className="text-[13px] font-medium text-[#00d0ff] mb-0.5">Good morning,</p>
          <h1 className="text-[28px] font-bold leading-tight text-white tracking-wide mb-0.5">
            Alex Johnson
          </h1>
          <p className="text-[12px] text-white/60 flex items-center gap-1.5">
            Discipline today, <span className="text-[#3b82f6] font-medium">freedom</span> tomorrow. 
            <Zap size={12} className="text-[#3b82f6] fill-[#3b82f6]" />
          </p>
        </div>

        {/* Scrollable Content */}
        <main className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-24 no-scrollbar space-y-4">

          {/* Calorie Intake Card */}
          <section className="relative overflow-hidden rounded-[20px] border border-[#1e3a8a]/40 bg-[#060b1e]/80 p-4 shadow-[0_4px_30px_rgba(29,78,216,0.15)] backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a]/20 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-[#00d0ff] fill-[#00d0ff]" />
                <h2 className="text-[15px] font-semibold text-white">Calorie Intake</h2>
              </div>
              <button className="flex items-center gap-1 rounded-full bg-white/[0.05] px-2.5 py-1 text-[12px] text-white/80 border border-white/10 hover:bg-white/10 transition-colors">
                Today <ChevronDown size={14} />
              </button>
            </div>

            <div className="flex items-center justify-between relative z-10">
              {/* Circular Progress Ring */}
              <div className="relative flex h-[140px] w-[140px] shrink-0 items-center justify-center -ml-2">
                <svg className="h-full w-full -rotate-90 transform drop-shadow-[0_0_15px_rgba(0,208,255,0.4)]" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00d0ff" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none" stroke="url(#ringGrad)"
                    strokeWidth="8" strokeLinecap="round" strokeDasharray="264" strokeDashoffset="60"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-1">
                  <span className="text-[26px] font-bold leading-none tracking-tight">1,850</span>
                  <span className="text-[10px] text-white/40 mb-1">/ 2,400 kcal</span>
                  <span className="text-[10px] font-medium text-[#3b82f6]">550 kcal left</span>
                </div>
              </div>

              {/* Macro Bars */}
              <div className="flex flex-1 flex-col justify-center gap-3.5 pl-3">

                <div>
                  <div className="mb-1.5 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-white/90">
                      <div className="text-[#3b82f6]">
                        <Dumbbell size={12} className="fill-[#3b82f6]/20" />
                      </div>
                      Protein
                    </div>
                    <span className="font-semibold text-white">120g <span className="text-white/40 font-normal">/ 150g</span></span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#1e3a8a]/30 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#3b82f6] shadow-[0_0_10px_#3b82f6]" style={{ width: '80%' }} />
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-white/90">
                      <div className="text-[#a855f7]">
                        <Droplet size={12} className="fill-[#a855f7]/20" />
                      </div>
                      Fats
                    </div>
                    <span className="font-semibold text-white">60g <span className="text-white/40 font-normal">/ 80g</span></span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#1e3a8a]/30 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] shadow-[0_0_10px_#a855f7]" style={{ width: '75%' }} />
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-white/90">
                      <div className="text-[#10b981]">
                        <Leaf size={12} className="fill-[#10b981]/20" />
                      </div>
                      Carbs
                    </div>
                    <span className="font-semibold text-white">210g <span className="text-white/40 font-normal">/ 300g</span></span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#1e3a8a]/30 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#10b981] to-[#34d399] shadow-[0_0_10px_#10b981]" style={{ width: '70%' }} />
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-white/90">
                      <div className="text-[#3b82f6]">
                        <Flame size={12} className="fill-[#3b82f6]/20" />
                      </div>
                      Calories
                    </div>
                    <span className="font-semibold text-white">1850 <span className="text-white/40 font-normal">/ 2400 kcal</span></span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#1e3a8a]/30 overflow-hidden">
                    <div className="h-full rounded-full bg-[#3b82f6] shadow-[0_0_10px_#3b82f6]" style={{ width: '77%' }} />
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Daily Tasks Card */}
          <section className="relative overflow-hidden rounded-[20px] border border-[#1e3a8a]/40 bg-[#060b1e]/80 p-4 shadow-[0_4px_30px_rgba(29,78,216,0.15)] backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#1e3a8a]/10 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <ClipboardList size={18} className="text-[#60a5fa]" />
                <h2 className="text-[15px] font-semibold text-white">Daily Tasks</h2>
              </div>
              <button className="text-[13px] font-medium text-[#3b82f6] hover:text-[#60a5fa] transition-colors flex items-center gap-1">
                <Plus size={14} /> Add Task
              </button>
            </div>

            <div className="flex flex-col gap-2.5 relative z-10">
              {tasks.map(task => (
                <div key={task.id} className="group relative flex items-center gap-3 rounded-[16px] bg-[#0c142c]/60 p-3 transition-colors hover:bg-[#111a36]/80 border border-white/[0.03]">

                  <button
                    onClick={() => toggleTask(task.id)}
                    className="relative shrink-0 grid place-items-center h-6 w-6 ml-1"
                  >
                    {task.checked ? (
                      <div className="grid place-items-center h-[22px] w-[22px] rounded-full bg-[#3b82f6]/20 border border-[#3b82f6] text-[#3b82f6] shadow-[0_0_12px_rgba(59,130,246,0.6)]">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    ) : (
                      <Circle size={22} className="text-white/20" strokeWidth={1.5} />
                    )}
                  </button>

                  <div className={`grid h-[40px] w-[40px] shrink-0 place-items-center rounded-[12px] ${task.bg} ${task.iconColor}`}>
                    <task.icon size={20} strokeWidth={1.5} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-medium text-white/90 truncate mb-0.5">{task.title}</h3>
                    <p className="text-[11px] text-white/40 truncate">{task.desc}</p>
                  </div>

                  <div className={`shrink-0 flex items-center gap-1 text-[12px] font-medium ${task.accent}`}>
                    {task.valIcon && <task.valIcon size={12} className="fill-current" />}
                    {task.value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* AI Assistant Card */}
          <section className="relative overflow-hidden rounded-[20px] border border-[#1e3a8a]/40 bg-[#060b1e]/80 p-4 shadow-[0_4px_30px_rgba(29,78,216,0.15)] backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a8a]/20 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#00d0ff]" />
                <h2 className="text-[15px] font-semibold text-white">AI Assistant</h2>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#10b981]">
                <span className="h-2 w-2 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
                Online
              </div>
            </div>

            <div className="relative z-10">
              <div className="mb-4 inline-block rounded-[16px] rounded-tl-sm bg-[#0d1b42] px-4 py-3 text-[13px] font-medium text-white/90 border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                Hi Alex! How can I help you today?
              </div>

              <div className="relative flex items-center rounded-full border border-white/10 bg-[#040914] p-1 shadow-inner">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full bg-transparent px-4 py-2.5 text-[13px] text-white outline-none placeholder:text-white/30"
                />
                <button className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-[#2563eb] text-white shadow-[0_0_15px_rgba(37,99,235,0.6)] hover:bg-[#1d4ed8] transition-colors">
                  <Send size={16} className="ml-0.5" />
                </button>
              </div>
            </div>
          </section>

        </main>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 left-0 right-0 z-20 flex h-[85px] items-start justify-between bg-[#030716]/95 px-6 pt-4 backdrop-blur-xl border-t border-[#1e3a8a]/30">
          {[
            { label: 'Home', icon: Home, active: true },
            { label: 'Tasks', icon: Check, isBox: true },
            { label: 'Diary', icon: ClipboardList },
            { label: 'Fitness', icon: Heart },
            { label: 'Profile', icon: User },
          ].map((item, idx) => (
            <button key={idx} className="group relative flex flex-col items-center gap-1">
              {item.active ? (
                <>
                  <item.icon size={24} className="text-[#3b82f6] fill-[#3b82f6] drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                  <span className="text-[10px] font-medium text-[#3b82f6]">{item.label}</span>
                  <div className="absolute -bottom-3 left-1/2 h-1 w-8 -translate-x-1/2 rounded-t-full bg-[#3b82f6] shadow-[0_0_8px_#3b82f6]" />
                </>
              ) : (
                <>
                  {item.isBox ? (
                    <div className="grid place-items-center text-white/40 h-6 w-6 border-[1.5px] border-white/40 rounded-[6px]">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  ) : (
                    <item.icon size={24} className="text-white/40" strokeWidth={1.8} />
                  )}
                  <span className="text-[10px] font-medium text-white/40">{item.label}</span>
                </>
              )}
            </button>
          ))}
        </nav>

      </div>
    </div>
  );
}
