"use client";

import { useState } from "react";
import {
  ArrowRight, ArrowLeft, Loader2, User, Weight,
  Ruler, Calendar, Zap, Target, Sparkles, Activity
} from "lucide-react";

const TRAINING_OPTIONS = [
  { key: "hypertrophy", label: "Hypertrophy", sub: "Physique Building", emoji: "💪" },
  { key: "calisthenics", label: "Calisthenics", sub: "Bodyweight Mastery", emoji: "🤸" },
  { key: "powerlifting", label: "Powerlifting", sub: "Raw Strength", emoji: "🏋️" },
];

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

function FieldLabel({ children }) {
  return (
    <label className="block text-[10px] font-bold text-white/40 tracking-widest uppercase mb-1.5">
      {children}
    </label>
  );
}

function NumInput({ icon: Icon, unit, ...props }) {
  return (
    <div className="flex items-center gap-1.5 rounded-[11px] bg-[#07112c] border border-[#00d0ff]/15 px-2.5 py-1.5 focus-within:border-[#00d0ff]/50 focus-within:shadow-[0_0_16px_rgba(0,208,255,0.12)] transition-all duration-300">
      {Icon && <Icon size={12} className="text-[#00d0ff]/50 shrink-0" />}
      <input
        {...props}
        type="number"
        className="flex-1 min-w-0 bg-transparent text-[13px] text-white placeholder:text-white/20 outline-none"
      />
      {unit && <span className="text-[9px] text-white/30 shrink-0">{unit}</span>}
    </div>
  );
}

export default function OnboardingModal({ isOpen, onComplete }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState("");
  const [heightUnit, setHeightUnit] = useState("cm"); // "cm" | "ft"
  const [heightCm, setHeightCm] = useState("");       // used when unit = cm
  const [heightFt, setHeightFt] = useState("");       // feet part
  const [heightIn, setHeightIn] = useState("");       // inches part
  const [workoutDays, setWorkoutDays] = useState(3);
  const [proteinBudget, setProteinBudget] = useState("");

  // Step 2
  const [trainingField, setTrainingField] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [goalBodyFat, setGoalBodyFat] = useState("");
  const [goalPeriod, setGoalPeriod] = useState(3);
  const [goalPeriodUnit, setGoalPeriodUnit] = useState("months");

  if (!isOpen) return null;

  const periodLimits = {
    months: { min: 1, max: 24, step: 1, label: "mos" },
    weeks: { min: 1, max: 52, step: 1, label: "wks" },
    days: { min: 7, max: 365, step: 7, label: "days" }
  };
  const currLimit = periodLimits[goalPeriodUnit] || periodLimits.months;

  // Height validity depends on active unit
  const heightValid = heightUnit === "cm" ? !!heightCm : !!heightFt;
  const step1Valid = age && gender && weight && heightValid && proteinBudget;
  const step2Valid = trainingField && goalWeight;

  const handleFinish = async () => {
    if (!step2Valid || saving) return;
    setSaving(true);
    try {
      // Always store height in cm
      const heightInCm = heightUnit === "cm"
        ? Number(heightCm)
        : Math.round(Number(heightFt) * 30.48 + Number(heightIn || 0) * 2.54);

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age, gender, weight, height: heightInCm,
          workoutDays, proteinBudget,
          trainingField, goalWeight, goalBodyFat, goalPeriod, goalPeriodUnit,
        }),
      });
      if (res.ok) {
        onComplete();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    /* Full-screen mandatory overlay — no backdrop click to dismiss */
    <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
      {/* Blurred dark backdrop — NOT clickable to close */}
      <div className="absolute inset-0 bg-[#010614]/85 backdrop-blur-[16px]" />

      {/* Animated glow orbs */}
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-48 w-48 rounded-full bg-[#00d0ff]/8 blur-[80px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-[#fafafa]/5 blur-[80px]" />

      {/* Modal card */}
      <div className="relative w-full max-w-[340px] rounded-[24px] border border-white/[0.09] bg-[#020512]/95 px-5 pt-5 pb-4 shadow-[0_24px_90px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[40px] animate-in zoom-in-95 fade-in duration-500 ease-out">

        {/* Top glow stripe */}
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#00d0ff]/14 to-transparent blur-[40px] pointer-events-none rounded-t-[24px]" />

        {/* Header */}
        <div className="text-center mb-3.5 relative z-10">
          <div className="inline-flex items-center justify-center h-[38px] w-[38px] rounded-[12px] bg-[#fafafa]/10 border border-[#fafafa]/20 shadow-[0_0_24px_rgba(250,250,250,0.15)] mb-2">
            <Sparkles size={18} className="text-[#00d0ff] drop-shadow-[0_0_8px_#00d0ff]" />
          </div>
          <h2 className="text-[17px] font-bold tracking-tight text-white mb-0.5">
            {step === 1 ? "Set up your profile" : "Define your goals"}
          </h2>
          <p className="text-[11px] text-white/35 leading-snug">
            {step === 1
              ? "Help Kai personalize your experience"
              : "What are you training towards?"}
          </p>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-1.5 mb-4 relative z-10">
          <div className={`h-1 rounded-full transition-all duration-500 ${step === 1 ? "w-6 bg-[#00d0ff] shadow-[0_0_8px_#00d0ff]" : "w-4 bg-white/15"}`} />
          <div className={`h-1 rounded-full transition-all duration-500 ${step === 2 ? "w-6 bg-[#00d0ff] shadow-[0_0_8px_#00d0ff]" : "w-4 bg-white/15"}`} />
        </div>

        {/* ──── STEP 1 ──── */}
        {step === 1 && (
          <div className="relative z-10 space-y-2.5 animate-in fade-in slide-in-from-right-4 duration-300">

            {/* Age + Gender */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <FieldLabel>Age</FieldLabel>
                <NumInput icon={User} placeholder="25" min={10} max={100} unit="yrs"
                  value={age} onChange={e => setAge(e.target.value)} />
              </div>
              <div>
                <FieldLabel>Gender</FieldLabel>
                <div className="flex gap-1 h-[28px]">
                  {GENDER_OPTIONS.map(g => (
                    <button key={g.value} type="button" onClick={() => setGender(g.value)}
                      className={`flex-1 rounded-[8px] text-[10px] font-bold border transition-all duration-200 ${
                        gender === g.value
                          ? "bg-[#00d0ff]/20 border-[#00d0ff]/60 text-[#00d0ff] shadow-[0_0_10px_rgba(0,208,255,0.25)]"
                          : "bg-[#07112c] border-[#00d0ff]/10 text-white/35 hover:text-white/60 hover:border-[#00d0ff]/25"
                      }`}>
                      {g.label[0]}
                    </button>
                  ))}
                </div>
                {gender && <p className="text-[9px] text-white/25 mt-0.5 capitalize">{gender}</p>}
              </div>
            </div>

            {/* Weight + Height */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <FieldLabel>Weight</FieldLabel>
                <NumInput icon={Weight} placeholder="75" min={30} max={300} unit="kg"
                  value={weight} onChange={e => setWeight(e.target.value)} />
              </div>
              <div>
                {/* Height label + cm/ft toggle */}
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Height</label>
                  <div className="flex rounded-[6px] overflow-hidden border border-[#00d0ff]/15 w-[70px]">
                    {["cm", "ft"].map(u => (
                      <button key={u} type="button" onClick={() => setHeightUnit(u)}
                        className={`flex-1 py-0.5 text-[9px] font-bold transition-all duration-200 text-center ${
                          heightUnit === u
                            ? "bg-[#00d0ff] text-[#020617]"
                            : "bg-[#07112c] text-white/35 hover:text-white/60 hover:bg-[#00d0ff]/5"
                        }`}>
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                {heightUnit === "cm" ? (
                  <NumInput icon={Ruler} placeholder="175" min={100} max={250} unit="cm"
                    value={heightCm} onChange={e => setHeightCm(e.target.value)} />
                ) : (
                  <div className="flex gap-1.5 h-[30px]">
                    <div className="flex items-center gap-1 flex-1 rounded-[11px] bg-[#07112c] border border-[#00d0ff]/15 px-2 focus-within:border-[#00d0ff]/50 focus-within:shadow-[0_0_12px_rgba(0,208,255,0.12)] transition-all">
                      <Ruler size={11} className="text-[#00d0ff]/50 shrink-0" />
                      <input type="number" min={3} max={8} placeholder="5" value={heightFt}
                        onChange={e => setHeightFt(e.target.value)}
                        className="w-full bg-transparent text-[12px] text-white placeholder:text-white/20 outline-none" />
                      <span className="text-[9px] text-white/30">ft</span>
                    </div>
                    <div className="flex items-center gap-1 w-[46px] rounded-[11px] bg-[#07112c] border border-[#00d0ff]/15 px-2 focus-within:border-[#00d0ff]/50 transition-all">
                      <input type="number" min={0} max={11} placeholder="0" value={heightIn}
                        onChange={e => setHeightIn(e.target.value)}
                        className="w-full bg-transparent text-[12px] text-white placeholder:text-white/20 outline-none" />
                      <span className="text-[9px] text-white/30">in</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Workout Days */}
            <div>
              <FieldLabel>Workout Days / Week</FieldLabel>
              <div className="flex gap-1">
                {[1,2,3,4,5,6,7].map(d => (
                  <button key={d} type="button" onClick={() => setWorkoutDays(d)}
                    className={`flex-1 py-1.5 rounded-[8px] text-[11px] font-bold border transition-all duration-200 ${
                      workoutDays === d
                        ? "bg-[#00d0ff]/20 border-[#00d0ff]/60 text-[#00d0ff] shadow-[0_0_8px_rgba(0,208,255,0.2)]"
                        : "bg-[#07112c] border-[#00d0ff]/08 text-white/30 hover:text-white/55"
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Protein Budget */}
            <div>
              <FieldLabel>Daily Protein Budget</FieldLabel>
              <NumInput icon={Zap} placeholder="150" min={30} max={500}
                value={proteinBudget} onChange={e => setProteinBudget(e.target.value)} />
            </div>

            {/* Next */}
            <button type="button" onClick={() => setStep(2)} disabled={!step1Valid}
              className="w-full flex items-center justify-center gap-2 rounded-[11px] bg-[#00d0ff] text-[#020617] text-[13px] font-bold py-2.5 mt-1 shadow-[0_0_18px_rgba(0,208,255,0.35)] hover:shadow-[0_0_24px_rgba(0,208,255,0.6)] transition-all duration-300 active:scale-[0.98] disabled:opacity-35 disabled:cursor-not-allowed disabled:shadow-none">
              Continue <ArrowRight size={14} />
            </button>

            <p className="text-center text-[9px] text-white/20 mt-1">
              Required to personalise your experience
            </p>
          </div>
        )}

        {/* ──── STEP 2 ──── */}
        {step === 2 && (
          <div className="relative z-10 space-y-2.5 animate-in fade-in slide-in-from-right-4 duration-300">

            {/* Training Focus */}
            <div>
              <FieldLabel>Training Focus</FieldLabel>
              <div className="flex flex-col gap-1.5">
                {TRAINING_OPTIONS.map(opt => (
                  <button key={opt.key} type="button" onClick={() => setTrainingField(opt.key)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-[11px] border transition-all duration-200 text-left ${
                      trainingField === opt.key
                        ? "bg-[#00d0ff]/14 border-[#00d0ff]/55 shadow-[0_0_18px_rgba(0,208,255,0.18)]"
                        : "bg-[#07112c] border-[#00d0ff]/08 hover:border-[#00d0ff]/28 hover:shadow-[0_0_16px_rgba(0,208,255,0.08)]"
                    }`}>
                    <span className="text-[18px] leading-none">{opt.emoji}</span>
                    <div className="flex-1">
                      <p className={`text-[12px] font-semibold transition-colors ${trainingField === opt.key ? "text-[#00d0ff]" : "text-white/75"}`}>
                        {opt.label}
                      </p>
                      <p className="text-[9px] text-white/30">{opt.sub}</p>
                    </div>
                    <div className={`h-3 w-3 rounded-full border-[1.5px] transition-all shrink-0 ${
                      trainingField === opt.key ? "border-[#00d0ff] bg-[#00d0ff] shadow-[0_0_6px_#00d0ff]" : "border-white/18"
                    }`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Goal Weight and Body Fat */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <FieldLabel>Goal Weight</FieldLabel>
                <NumInput icon={Target} placeholder="70" min={30} max={300} unit="kg"
                  value={goalWeight} onChange={e => setGoalWeight(e.target.value)} />
              </div>
              <div>
                <FieldLabel>Goal Body Fat</FieldLabel>
                <NumInput icon={Activity} placeholder="15" min={5} max={50} unit="%"
                  value={goalBodyFat} onChange={e => setGoalBodyFat(e.target.value)} />
              </div>
            </div>

            {/* Timeline */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <FieldLabel>Timeline</FieldLabel>
                <div className="flex rounded-[6px] overflow-hidden border border-[#00d0ff]/15 w-[120px]">
                  {["months", "weeks", "days"].map(u => (
                    <button key={u} type="button" onClick={() => {
                      setGoalPeriodUnit(u);
                      if (u === "months") setGoalPeriod(3);
                      if (u === "weeks") setGoalPeriod(12);
                      if (u === "days") setGoalPeriod(30);
                    }}
                      className={`flex-1 py-0.5 text-[8.5px] font-bold transition-all duration-200 capitalize text-center ${
                        goalPeriodUnit === u
                          ? "bg-[#00d0ff] text-[#020617]"
                          : "bg-[#07112c] text-white/35 hover:text-white/60 hover:bg-[#00d0ff]/5"
                      }`}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-center gap-1 rounded-[11px] bg-[#07112c] border border-[#00d0ff]/15 px-3 py-1.5 w-fit mx-auto min-w-[80px]">
                  <span className="text-[14px] font-bold text-[#00d0ff]">{goalPeriod}</span>
                  <span className="text-[9px] text-white/35">{currLimit.label}</span>
                </div>
                
                <input type="range" min={currLimit.min} max={currLimit.max} step={currLimit.step} value={goalPeriod}
                  onChange={e => setGoalPeriod(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right,#00d0ff ${((goalPeriod-currLimit.min)/(currLimit.max-currLimit.min))*100}%,#07112c ${((goalPeriod-currLimit.min)/(currLimit.max-currLimit.min))*100}%)` }}
                />
                <div className="flex justify-between text-[8px] text-white/20">
                  <span>{currLimit.min} {currLimit.label}</span>
                  <span>{currLimit.max} {currLimit.label}</span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setStep(1)}
                className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-[11px] bg-white/[0.04] border border-white/[0.06] text-white/55 text-[12px] font-semibold hover:bg-white/[0.08] transition-all active:scale-95">
                <ArrowLeft size={13} />
              </button>
              <button type="button" onClick={handleFinish} disabled={!step2Valid || saving}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-[11px] bg-[#00d0ff] text-[#020617] text-[13px] font-bold py-2.5 shadow-[0_0_18px_rgba(0,208,255,0.35)] hover:shadow-[0_0_24px_rgba(0,208,255,0.6)] transition-all duration-300 active:scale-[0.98] disabled:opacity-35 disabled:cursor-not-allowed disabled:shadow-none">
                {saving
                  ? <Loader2 size={16} className="animate-spin" />
                  : <><Sparkles size={13} /> Let&#39;s Go!</>
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
