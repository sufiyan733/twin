"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  ArrowRight, ArrowLeft, Loader2, User, Weight,
  Ruler, Calendar, Zap, Target, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TRAINING_OPTIONS = [
  { key: "hypertrophy", label: "Hypertrophy", sub: "Physique Building", emoji: "💪" },
  { key: "calisthenics", label: "Calisthenics", sub: "Bodyweight Mastery", emoji: "🤸" },
  { key: "powerlifting", label: "Powerlifting", sub: "Raw Strength", emoji: "🏋️" },
];

const GENDER_OPTIONS = ["Male", "Female", "Other"];

function DataBox({ label, value, onChange, placeholder, unit, icon: Icon, type = "number" }) {
  return (
    <div className="relative rounded-[16px] bg-[#07112c]/50 border border-white/[0.05] p-3 focus-within:border-[#00d0ff]/40 focus-within:bg-[#07112c] transition-all group overflow-hidden">
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon size={12} className="text-white/30 group-focus-within:text-[#00d0ff]/70 transition-colors" />}
        <label className="text-[10px] font-bold text-white/40 tracking-widest uppercase">{label}</label>
      </div>
      <div className="flex items-end justify-between">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent text-[20px] font-bold text-white outline-none placeholder:text-white/10"
        />
        {unit && <span className="text-[10px] font-bold text-white/30 mb-1 ml-2">{unit}</span>}
      </div>
      <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#00d0ff]/0 via-[#00d0ff] to-[#00d0ff]/0 w-full translate-y-full group-focus-within:translate-y-0 transition-transform duration-300" />
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [animDir, setAnimDir] = useState("forward");

  // Step 1 fields
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [workoutDays, setWorkoutDays] = useState(3);
  const [proteinBudget, setProteinBudget] = useState("");

  // Step 2 fields
  const [trainingField, setTrainingField] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [goalPeriod, setGoalPeriod] = useState(8);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [session, isPending, router]);

  if (isPending || !session) {
    return (
      <div className="h-[100dvh] w-full flex items-center justify-center bg-[#020617]">
        <Loader2 className="text-[#00d0ff] animate-spin" size={32} />
      </div>
    );
  }

  const goNext = () => {
    if (!age || !weight || !height || !proteinBudget) return;
    setAnimDir("forward");
    setStep(2);
  };

  const goBack = () => {
    setAnimDir("backward");
    setStep(1);
  };

  const handleFinish = async () => {
    if (!trainingField || !goalWeight) return;
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age, gender, weight, height, bodyFat, workoutDays, proteinBudget,
          trainingField, goalWeight, goalPeriod,
        }),
      });
      router.replace("/");
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  };

  const step1Valid = age && gender && weight && height && proteinBudget;
  const step2Valid = trainingField && goalWeight;

  const slideVariants = {
    enter: (direction) => ({
      x: direction === "forward" ? 40 : -40,
      opacity: 0,
      filter: "blur(4px)",
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction === "forward" ? -40 : 40,
      opacity: 0,
      filter: "blur(4px)",
    }),
  };

  return (
    <div className="relative h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden bg-[#010614]">
      {/* Background radials */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.18),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(0,208,255,0.1),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative w-full max-w-[380px] px-4 flex flex-col z-10">
        
        {/* Main Card container */}
        <div className="relative overflow-hidden rounded-[24px] border border-[#00d0ff]/20 bg-[#030818] shadow-[0_0_50px_rgba(0,150,255,0.12)] backdrop-blur-xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[1px] bg-gradient-to-r from-transparent via-[#00d0ff] to-transparent shadow-[0_0_15px_#00d0ff]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,208,255,0.07),transparent_65%)] pointer-events-none" />

          <div className="p-5 relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full border border-[#00d0ff] flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-[#00d0ff] shadow-[0_0_8px_#00d0ff]" />
                  </div>
                  <span className="text-[10px] font-bold text-[#00d0ff] tracking-widest uppercase">Twin OS</span>
                </div>
                <h2 className="text-[28px] font-bold text-white leading-tight">
                  {step === 1 ? "Profile" : "Goals"}
                </h2>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10">
                <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase">
                  Step {step}/2
                </span>
              </div>
            </div>

            <div className="relative min-h-[420px]">
              <AnimatePresence custom={animDir} mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    custom={animDir}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className="absolute inset-0 space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <DataBox label="Age" value={age} onChange={e => setAge(e.target.value)} icon={User} placeholder="22" />
                      <DataBox label="Weight" value={weight} onChange={e => setWeight(e.target.value)} unit="KG" icon={Weight} placeholder="78" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <DataBox label="Height" value={height} onChange={e => setHeight(e.target.value)} unit="CM" icon={Ruler} placeholder="175" />
                      <DataBox label="Protein" value={proteinBudget} onChange={e => setProteinBudget(e.target.value)} unit="G" icon={Zap} placeholder="211" />
                    </div>

                    <div className="relative flex p-1 rounded-[16px] bg-[#07112c]/50 border border-white/[0.05]">
                      {GENDER_OPTIONS.map(g => {
                        const isActive = gender === g.toLowerCase();
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setGender(g.toLowerCase())}
                            className={`relative flex-1 py-3 text-[13px] font-bold z-10 transition-colors ${isActive ? "text-[#020617]" : "text-white/50 hover:text-white/80"}`}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="gender-active"
                                className="absolute inset-0 bg-[#38bdf8] rounded-[12px] shadow-[0_0_15px_rgba(56,189,248,0.4)]"
                                initial={false}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                              />
                            )}
                            <span className="relative z-20">{g}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-4 rounded-[16px] bg-[#07112c]/50 border border-white/[0.05]">
                      <div className="flex items-center gap-1.5 mb-4">
                        <Calendar size={12} className="text-white/30" />
                        <label className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Workouts / Wk</label>
                      </div>
                      <div className="flex justify-between gap-1">
                        {[1, 2, 3, 4, 5, 6, 7].map(d => {
                          const isActive = workoutDays === d;
                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setWorkoutDays(d)}
                              className={`relative w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold transition-all ${
                                isActive ? "text-[#020617]" : "text-white/40 bg-[#030818]/50 border border-white/[0.05] hover:bg-white/[0.05]"
                              }`}
                            >
                              {isActive && (
                                <motion.div
                                  layoutId="workout-active"
                                  className="absolute inset-0 bg-[#38bdf8] rounded-full shadow-[0_0_15px_rgba(56,189,248,0.4)]"
                                  initial={false}
                                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                              )}
                              <span className="relative z-20">{d}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={goNext}
                      disabled={!step1Valid}
                      className="w-full flex items-center justify-center gap-2 rounded-[16px] bg-[#38bdf8] text-[#020617] text-[15px] font-bold py-4 mt-2 shadow-[0_0_30px_rgba(56,189,248,0.3)] hover:shadow-[0_0_40px_rgba(56,189,248,0.5)] transition-all duration-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      Continue <ArrowRight size={18} />
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    custom={animDir}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className="absolute inset-0 space-y-4"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-3">
                        <Target size={12} className="text-[#38bdf8]" />
                        <label className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Focus</label>
                      </div>
                      <div className="flex flex-col gap-2.5">
                        {TRAINING_OPTIONS.map(opt => {
                          const isActive = trainingField === opt.key;
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => setTrainingField(opt.key)}
                              className={`relative overflow-hidden flex items-center gap-4 p-4 rounded-[16px] border transition-all duration-300 text-left ${
                                isActive
                                  ? "bg-gradient-to-r from-[#00d0ff]/10 to-transparent border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.15)]"
                                  : "bg-[#07112c]/50 border-white/[0.05] hover:border-white/10 hover:bg-white/[0.02]"
                              }`}
                            >
                              <div className="text-[24px] relative z-10 drop-shadow-md">{opt.emoji}</div>
                              <div className="flex-1 relative z-10">
                                <h3 className={`text-[15px] font-bold transition-colors ${isActive ? "text-yellow-500" : "text-white"}`}>
                                  {opt.label}
                                </h3>
                                <p className="text-[12px] text-white/40 font-medium">{opt.sub}</p>
                              </div>
                              <div className={`relative z-10 w-5 h-5 rounded-full border-[2px] flex items-center justify-center transition-all ${
                                isActive ? "border-yellow-500" : "border-white/20"
                              }`}>
                                {isActive && <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.8)]" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <DataBox label="Goal Wt" value={goalWeight} onChange={e => setGoalWeight(e.target.value)} unit="KG" icon={Weight} placeholder="78" />
                      <DataBox label="Body Fat" value={bodyFat} onChange={e => setBodyFat(e.target.value)} unit="%" icon={Activity} placeholder="15" />
                    </div>

                    <div className="mt-4 p-5 rounded-[16px] bg-[#07112c]/50 border border-white/[0.05]">
                      <div className="flex items-center gap-1.5 mb-4">
                        <Calendar size={12} className="text-white/30" />
                        <label className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Timeline</label>
                      </div>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setGoalPeriod(p => Math.max(4, p - 2))}
                          className="w-10 h-10 rounded-full bg-[#030818] border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 active:scale-95 transition-all"
                        >
                          <span className="text-xl font-light">-</span>
                        </button>
                        
                        <div className="relative w-24 h-24 rounded-full flex items-center justify-center">
                          <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="48" cy="48" r="46" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none" />
                            <circle cx="48" cy="48" r="46" stroke="#fbbf24" strokeWidth="4" fill="none"
                              strokeDasharray="289" strokeDashoffset={289 - (289 * (goalPeriod / 52))} 
                              strokeLinecap="round"
                              className="transition-all duration-500 ease-out"
                            />
                          </svg>
                          <div className="flex flex-col items-center">
                            <span className="text-[32px] font-bold text-white leading-none">{goalPeriod}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setGoalPeriod(p => Math.min(52, p + 2))}
                          className="w-10 h-10 rounded-full bg-[#030818] border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 active:scale-95 transition-all"
                        >
                          <span className="text-xl font-light">+</span>
                        </button>
                      </div>
                      
                      <div className="flex justify-center gap-1.5 mt-4">
                         {["MONTHS", "WEEKS", "DAYS"].map((t, i) => (
                           <div key={t} className={`px-2.5 py-1 rounded-md text-[9px] font-bold tracking-widest ${i === 0 ? "bg-[#fbbf24] text-[#020617]" : "text-white/40"}`}>
                             {t}
                           </div>
                         ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={goBack}
                        className="w-14 flex items-center justify-center rounded-[16px] bg-white/[0.03] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05] transition-all active:scale-95"
                      >
                        <ArrowLeft size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={handleFinish}
                        disabled={!step2Valid || saving}
                        className="flex-1 flex items-center justify-center gap-2 rounded-[16px] bg-white/[0.03] border border-white/[0.05] text-white/40 text-[15px] font-bold py-4 transition-all duration-300 hover:text-white hover:bg-white/[0.08] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {saving ? <Loader2 size={20} className="animate-spin" /> : <>Finish Setup <ArrowRight size={18} /></>}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

