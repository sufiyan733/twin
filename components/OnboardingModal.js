"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ArrowLeft, Loader2, Minus, Plus, User, Scale, Ruler, Flame, Activity, CalendarDays, Target } from "lucide-react";

const TRAINING_OPTIONS = [
  { key: "hypertrophy", label: "Hypertrophy", sub: "Physique Building", emoji: "💪" },
  { key: "calisthenics", label: "Calisthenics", sub: "Bodyweight Mastery", emoji: "🤸" },
  { key: "powerlifting", label: "Powerlifting", sub: "Raw Strength", emoji: "🏋️" },
];

const MACRO_COLORS = {
  protein: "#2dd4bf", 
  fat: "#f87171",     
  brand: "#38bdf8",   
  danger: "#ef4444"
};

const hex2rgb = (hex) => {
  const v = parseInt(hex.replace('#',''), 16);
  return `${(v >> 16) & 255}, ${(v >> 8) & 255}, ${v & 255}`;
};

// Reusable animated Card Box with spatial routing & Figma-style scrubbers
const CardBox = ({ children, delay = 0, className = "", focusHex = MACRO_COLORS.brand, colSpan = 1, icon: Icon, label, rightElement, isError, errorMsg, navDir = 'up', onScrub }) => {
  const activeHex = isError ? MACRO_COLORS.danger : focusHex;
  const rgb = hex2rgb(activeHex);
  const animName = navDir === 'up' ? 'slideUp' : navDir === 'forward' ? 'slideForward' : 'slideBackward';
  
  return (
    <div 
      className={`opacity-0 bg-[#0a1525] rounded-[16px] p-[10px] flex flex-col transition-all duration-[250ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group relative ${colSpan === 2 ? 'col-span-2' : ''} ${className}`}
      style={{ 
        animation: `${animName} 280ms cubic-bezier(0.25,0.46,0.45,0.94) forwards`,
        animationDelay: `${delay}ms`,
        border: isError ? `1px solid rgba(239,68,68,0.2)` : '1px solid rgba(56,189,248,0.06)', 
        borderTop: isError ? `1px solid rgba(239,68,68,0.3)` : '1px solid rgba(255,255,255,0.05)'
      }}
    >
      <div 
        className={`absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none rounded-[16px] ${isError ? '!opacity-100' : 'group-focus-within:opacity-100'}`} 
        style={{ boxShadow: isError ? `inset 0 0 0 1px rgba(239,68,68, 0.4), inset 0 0 16px rgba(239,68,68, 0.05)` : `inset 0 0 0 1px rgba(${rgb}, 0.3)` }} 
      />
      
      <div className="relative z-10 w-full h-full flex flex-col justify-center">
        {(label || rightElement) && (
          <div className="flex justify-between items-center mb-[4px]">
            {label && (
              <div 
                className={`flex items-center gap-[4px] transition-all duration-200 ${onScrub ? 'cursor-ew-resize select-none rounded-[6px] px-[6px] py-[2px] -ml-[6px] hover:bg-[var(--focus-color)] hover:bg-opacity-10 active:scale-[0.97]' : ''}`}
                style={{ '--focus-color': activeHex }}
                onPointerDown={onScrub}
                title={onScrub ? "Drag left/right to scrub" : ""}
              >
                {Icon && (
                  <div className={`transition-opacity duration-300 ${isError ? 'opacity-100 text-[#ef4444]' : 'opacity-40 group-focus-within:opacity-100 text-[var(--focus-color)]'}`} style={{ '--focus-color': activeHex }}>
                    <Icon size={12} strokeWidth={2.5} color="currentColor" />
                  </div>
                )}
                <span 
                  className={`text-[11px] font-[600] tracking-[0.08em] uppercase transition-colors duration-300 ${isError ? 'text-[#ef4444]' : 'text-[#7a90a8] group-focus-within:text-[var(--focus-color)]'}`}
                  style={{ '--focus-color': activeHex }}
                >
                  {label}
                </span>
              </div>
            )}
            <div className="flex items-center gap-[6px]">
               {isError && errorMsg && (
                 <span className="text-[8.5px] font-[700] tracking-widest text-[#ef4444] uppercase animate-in fade-in slide-in-from-right-2">
                   {errorMsg}
                 </span>
               )}
               {rightElement}
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default function OnboardingModal({ isOpen, onComplete }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [step, setStep] = useState(1);
  const [navDir, setNavDir] = useState('up'); 
  const [saving, setSaving] = useState(false);

  const goToStep = (newStep) => {
    setNavDir(newStep > step ? 'forward' : 'backward');
    setStep(newStep);
  };

  // Step 1
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState("");
  const [heightUnit, setHeightUnit] = useState("ft");
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [workoutDays, setWorkoutDays] = useState(3);
  const [proteinBudget, setProteinBudget] = useState("");

  // Step 2
  const [trainingField, setTrainingField] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [goalBodyFat, setGoalBodyFat] = useState("");
  const [goalPeriod, setGoalPeriod] = useState(3);
  const [goalPeriodUnit, setGoalPeriodUnit] = useState("months");

  useEffect(() => {
    if (isOpen) document.body.classList.add("hide-nav");
    else document.body.classList.remove("hide-nav");
    return () => document.body.classList.remove("hide-nav");
  }, [isOpen]);

  const periodLimits = {
    months: { min: 1, max: 24, step: 1, label: "mos" },
    weeks: { min: 1, max: 52, step: 1, label: "wks" },
    days: { min: 7, max: 365, step: 7, label: "days" }
  };
  const currLimit = periodLimits[goalPeriodUnit] || periodLimits.months;

  const getErr = (val, min, max) => {
    if (val === "") return null;
    const num = parseInt(val, 10);
    if (isNaN(num)) return "Invalid";
    if (num < min) return `Min ${min}`;
    if (num > max) return `Max ${max}`;
    return null;
  };

  const errs = {
    age: getErr(age, 12, 120),
    weight: getErr(weight, 30, 300),
    heightCm: heightUnit === 'cm' ? getErr(heightCm, 100, 250) : null,
    heightFt: heightUnit === 'ft' ? getErr(heightFt, 3, 8) : null,
    heightIn: heightUnit === 'ft' ? getErr(heightIn, 0, 11) : null,
    protein: getErr(proteinBudget, 30, 400),
    goalWeight: getErr(goalWeight, 30, 300),
    goalFat: getErr(goalBodyFat, 4, 50),
  };

  const hasStep1Err = errs.age || errs.weight || errs.heightCm || errs.heightFt || errs.heightIn || errs.protein;
  const hasStep2Err = errs.goalWeight || errs.goalFat;

  const heightValid = heightUnit === "cm" ? !!heightCm : !!heightFt;
  const step1Valid = !!age && !!gender && !!weight && heightValid && !!proteinBudget && !hasStep1Err;
  const step2Valid = !!trainingField && !!goalWeight && !!goalBodyFat && !hasStep2Err && (parseInt(goalPeriod) >= currLimit.min);

  const [step1Pulse, setStep1Pulse] = useState(false);
  useEffect(() => {
    if (step1Valid) {
      setStep1Pulse(true);
      const t = setTimeout(() => setStep1Pulse(false), 400);
      return () => clearTimeout(t);
    }
  }, [step1Valid]);

  const [step2Pulse, setStep2Pulse] = useState(false);
  useEffect(() => {
    if (step2Valid) {
      setStep2Pulse(true);
      const t = setTimeout(() => setStep2Pulse(false), 400);
      return () => clearTimeout(t);
    }
  }, [step2Valid]);

  const handleFinish = async () => {
    if (!step2Valid || saving) return;
    setSaving(true);
    try {
      const heightInCm = heightUnit === "cm"
        ? Number(heightCm)
        : Math.round(Number(heightFt) * 30.48 + Number(heightIn || 0) * 2.54);

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age, gender, weight, height: heightInCm,
          workoutDays, proteinBudget,
          trainingField, goalWeight, goalBodyFat, goalPeriod, goalPeriodUnit
        }),
      });
      if (res.ok) onComplete();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        if (step === 1 && step1Valid) goToStep(2);
        else if (step === 2 && step2Valid) handleFinish();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, step1Valid, step2Valid]);

  const createScrubber = (val, setter, min, max, stepAmount = 1) => {
    return (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return; 
      e.preventDefault();
      
      let lastX = e.clientX;
      let currentVal = parseFloat(val) || min;
      let accumulatedDelta = 0;
      
      document.body.style.cursor = 'ew-resize';
      
      const onMove = (moveEvent) => {
        const deltaX = moveEvent.clientX - lastX;
        lastX = moveEvent.clientX;
        accumulatedDelta += deltaX;
        
        if (Math.abs(accumulatedDelta) >= 2) {
          const steps = Math.trunc(accumulatedDelta / 2);
          accumulatedDelta -= steps * 2; 
          
          currentVal += steps * stepAmount;
          if (currentVal < min) currentVal = min;
          if (currentVal > max) currentVal = max;
          
          setter(String(currentVal));
        }
      };
      
      const onUp = () => {
        document.body.style.cursor = '';
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      };
      
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    };
  };

  if (!isOpen || !mounted) return null;

  const inputBase = "no-spin w-full bg-transparent text-[16px] font-[600] tracking-tight outline-none transition-colors";
  const getInpClass = (err) => `${inputBase} ${err ? 'text-[#ef4444] placeholder:text-[#ef4444]/40' : 'text-[#e8edf5] placeholder:text-[#3d5068] focus:text-[var(--focus-color)]'}`;

  const timelineAtMin = parseInt(goalPeriod) <= currLimit.min;
  const timelineAtMax = parseInt(goalPeriod) >= currLimit.max;

  const animName = navDir === 'up' ? 'slideUp' : navDir === 'forward' ? 'slideForward' : 'slideBackward';

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-[12px] bg-[#060d1a]/90 backdrop-blur-2xl selection:bg-[#38bdf8]/30 font-sans">
      
      <style>{`
        .no-spin::-webkit-inner-spin-button,
        .no-spin::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .no-spin {
          -moz-appearance: textfield;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideForward {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideBackward {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes modalEnter {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes completionPulse {
          0% { transform: scale(1); box-shadow: 0 0 20px rgba(56,189,248,0.14), 0 0 40px rgba(56,189,248,0.07); }
          50% { transform: scale(1.03); box-shadow: 0 0 30px rgba(56,189,248,0.4), 0 0 60px rgba(56,189,248,0.2); }
          100% { transform: scale(1); box-shadow: 0 0 20px rgba(56,189,248,0.14), 0 0 40px rgba(56,189,248,0.07); }
        }
        .animate-completion-pulse {
          animation: completionPulse 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards !important;
        }
      `}</style>

      <div 
        className="relative w-full max-w-[340px] bg-[#0d1b2e] rounded-[28px] p-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.5)] mx-auto overflow-hidden opacity-0"
        style={{ 
          animation: 'modalEnter 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
          border: '1px solid rgba(56,189,248,0.06)', 
          borderTop: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#060d1a]">
          <div className="h-full bg-gradient-to-r from-[#2dd4bf] via-[#38bdf8] to-[#38bdf8] transition-all duration-[800ms] ease-out relative" style={{ width: step === 1 ? '50%' : '100%' }}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[24px] h-[4px] bg-white rounded-full blur-[2px] opacity-60" />
          </div>
        </div>

        <div className="flex justify-between items-end mb-[16px] px-[4px] mt-[8px]">
          <div>
            <div className="flex items-center gap-[6px] mb-[4px]">
               <div className="w-[10px] h-[10px] rounded-full border-[2px] border-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.3)]" />
               <span className="text-[11px] font-[700] tracking-widest uppercase text-[#38bdf8]">Twin OS</span>
            </div>
            <h2 
              key={step}
              className="text-[24px] font-[700] text-[#e8edf5] tracking-tight leading-none opacity-0"
              style={{ animation: `${animName} 280ms cubic-bezier(0.25,0.46,0.45,0.94) forwards` }}
            >
              {step === 1 ? "Profile" : "Goals"}
            </h2>
          </div>
          <div className="text-[11px] font-[600] tracking-widest text-[#7a90a8] border border-[#38bdf8]/[0.06] px-[10px] py-[4px] rounded-full uppercase">
            Step {step}/2
          </div>
        </div>

        {step === 1 && (
          <div className="w-full">
            <div className="grid grid-cols-2 gap-[8px] mb-[16px]">
              
              <CardBox delay={0} navDir={navDir} label="Age" icon={User} isError={!!errs.age} errorMsg={errs.age} onScrub={createScrubber(age, setAge, 12, 120)}>
                <input type="number" value={age} onChange={e=>setAge(e.target.value)} 
                  className={getInpClass(errs.age)} style={{'--focus-color': MACRO_COLORS.brand}} placeholder="25" />
              </CardBox>

              <CardBox delay={40} navDir={navDir} label="Weight" icon={Scale} isError={!!errs.weight} errorMsg={errs.weight} onScrub={createScrubber(weight, setWeight, 30, 300)}>
                <div className="flex items-baseline gap-[4px]">
                  <input type="number" value={weight} onChange={e=>setWeight(e.target.value)} 
                    className={getInpClass(errs.weight)} style={{'--focus-color': MACRO_COLORS.brand}} placeholder="75" />
                  <span className={`text-[11px] font-[700] transition-colors ${errs.weight ? 'text-[#ef4444]' : 'text-[#3d5068]'}`}>KG</span>
                </div>
              </CardBox>

              <CardBox delay={80} navDir={navDir} label="Height" icon={Ruler} isError={!!errs.heightCm || !!errs.heightFt || !!errs.heightIn} errorMsg={errs.heightCm || errs.heightFt || errs.heightIn} rightElement={
                <button onClick={()=>setHeightUnit(heightUnit==='ft'?'cm':'ft')} className={`text-[11px] font-[700] tracking-widest text-[#7a90a8] hover:text-[#e8edf5] bg-[#060d1a] border px-[8px] py-[2px] rounded-full transition-colors active:scale-95 ${(errs.heightCm || errs.heightFt || errs.heightIn) ? 'border-[#ef4444]/30 text-[#ef4444]' : 'border-[#38bdf8]/[0.06]'}`}>{heightUnit.toUpperCase()}</button>
              }>
                {heightUnit === 'cm' ? (
                  <div className="flex items-baseline gap-[4px]">
                    <input type="number" value={heightCm} onChange={e=>setHeightCm(e.target.value)} 
                      className={getInpClass(errs.heightCm)} style={{'--focus-color': MACRO_COLORS.brand}} placeholder="175" />
                    <span className={`text-[11px] font-[700] transition-colors ${errs.heightCm ? 'text-[#ef4444]' : 'text-[#3d5068]'}`}>CM</span>
                  </div>
                ) : (
                  <div className="flex items-baseline">
                    <input type="number" value={heightFt} onChange={e=>setHeightFt(e.target.value)} 
                      className={`${getInpClass(errs.heightFt)} w-[24px] text-center`} style={{'--focus-color': MACRO_COLORS.brand}} placeholder="5" />
                    <span className={`text-[16px] font-[600] ml-[2px] mr-[4px] transition-colors ${errs.heightFt ? 'text-[#ef4444]' : 'text-[#3d5068]'}`}>'</span>
                    <input type="number" value={heightIn} onChange={e=>setHeightIn(e.target.value)} 
                      className={`${getInpClass(errs.heightIn)} w-[28px] text-center`} style={{'--focus-color': MACRO_COLORS.brand}} placeholder="10" />
                    <span className={`text-[16px] font-[600] ml-[2px] transition-colors ${errs.heightIn ? 'text-[#ef4444]' : 'text-[#3d5068]'}`}>"</span>
                  </div>
                )}
              </CardBox>

              <CardBox delay={120} navDir={navDir} focusHex={MACRO_COLORS.protein} label="Protein" icon={Flame} isError={!!errs.protein} errorMsg={errs.protein} onScrub={createScrubber(proteinBudget, setProteinBudget, 30, 400)}>
                <div className="flex items-baseline gap-[4px]">
                  <input type="number" value={proteinBudget} onChange={e=>setProteinBudget(e.target.value)} 
                    className={getInpClass(errs.protein)} style={{'--focus-color': MACRO_COLORS.protein}} placeholder="150" />
                  <span className={`text-[11px] font-[700] transition-colors ${errs.protein ? 'text-[#ef4444]' : 'text-[#3d5068]'}`}>RS</span>
                </div>
              </CardBox>

              <CardBox delay={160} navDir={navDir} colSpan={2} className="!p-[4px]">
                 <div className="flex w-full p-[4px] bg-[#060d1a] rounded-[12px] border border-[#38bdf8]/[0.06] shadow-inner">
                   {['M','F','O'].map(g => (
                     <button key={g} type="button" onClick={() => setGender(g.toLowerCase())}
                       className={`flex-1 h-[32px] rounded-[10px] text-[14px] font-[600] transition-all duration-[250ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] active:duration-100 active:scale-[0.96] ${
                         gender === g.toLowerCase() 
                           ? 'bg-[#38bdf8] text-[#060d1a] shadow-sm' 
                           : 'text-[#7a90a8] hover:text-[#e8edf5]'
                       }`}>
                       {g === 'M' ? 'Male' : g === 'F' ? 'Female' : 'Other'}
                     </button>
                   ))}
                 </div>
              </CardBox>

              <CardBox delay={200} navDir={navDir} colSpan={2} label="Workouts / Wk" icon={CalendarDays}>
                <div className="flex justify-between w-full px-[4px] mt-[4px] relative">
                  <div className="absolute top-1/2 left-[14px] right-[14px] h-[3px] -translate-y-1/2 bg-[#060d1a] border border-[#38bdf8]/[0.06] rounded-full z-0" />
                  
                  {[1,2,3,4,5,6,7].map(d => (
                    <button key={d} type="button" onClick={() => setWorkoutDays(d)}
                      className={`relative z-10 w-[32px] h-[32px] rounded-full text-[14px] font-[600] flex items-center justify-center transition-all duration-[250ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] active:duration-100 active:scale-[0.95] ${
                        workoutDays === d 
                          ? 'bg-[#38bdf8] text-[#060d1a] shadow-sm scale-110' 
                          : 'bg-[#060d1a] border border-[#38bdf8]/[0.08] text-[#7a90a8] hover:text-[#e8edf5] hover:border-[#38bdf8]/30 hover:bg-[#0a1525]'
                      }`}>
                      {d}
                    </button>
                  ))}
                </div>
              </CardBox>

            </div>

            <button type="button" onClick={() => goToStep(2)} disabled={!step1Valid}
              className={`group w-full h-[48px] rounded-[16px] bg-[#38bdf8] text-[#060d1a] font-[700] text-[15px] tracking-wide flex items-center justify-center gap-[8px] active:scale-[0.97] active:duration-100 transition-all duration-[250ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] shadow-[0_0_20px_rgba(56,189,248,0.14),_0_0_40px_rgba(56,189,248,0.07)] disabled:bg-[#0a1525] disabled:text-[#3d5068] disabled:border disabled:border-[#38bdf8]/[0.06] disabled:shadow-none disabled:active:scale-100 disabled:cursor-not-allowed opacity-0 relative overflow-hidden outline-none ${step1Pulse ? 'animate-completion-pulse' : ''}`}
              style={{ animation: `${animName} 280ms cubic-bezier(0.25,0.46,0.45,0.94) forwards`, animationDelay: `240ms` }}
            >
              <div className="absolute inset-0 rounded-[16px] pointer-events-none border-t border-white/40 mix-blend-overlay" />
              <span className="relative z-10">Continue</span>
              <ArrowRight size={20} strokeWidth={2.5} className="relative z-10 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="w-full">
            
            <div className="flex flex-col gap-[6px] mb-[16px]">
              <div className="flex items-center gap-[6px] px-[8px] opacity-0" style={{ animation: `${animName} 280ms cubic-bezier(0.25,0.46,0.45,0.94) forwards`, animationDelay: `0ms` }}>
                <Target size={12} className="text-[#38bdf8] opacity-60" />
                <span className="text-[11px] font-[600] tracking-[0.08em] uppercase text-[#7a90a8]">Focus</span>
              </div>
              
              {TRAINING_OPTIONS.map((opt, i) => (
                <button key={opt.key} type="button" onClick={() => setTrainingField(opt.key)}
                  className="relative w-full flex items-center p-[8px] pl-[12px] rounded-[16px] transition-all duration-[250ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] active:duration-100 active:scale-[0.98] outline-none opacity-0 group"
                  style={{
                    animation: `${animName} 280ms cubic-bezier(0.25,0.46,0.45,0.94) forwards`,
                    animationDelay: `${40 + (i * 40)}ms`,
                    backgroundColor: trainingField === opt.key ? 'rgba(56,189,248,0.06)' : '#0a1525',
                    border: '1px solid ' + (trainingField === opt.key ? 'rgba(56,189,248,0.3)' : 'rgba(56,189,248,0.06)'),
                    borderTop: trainingField === opt.key ? '1px solid rgba(56,189,248,0.3)' : '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <span className="text-[20px] mr-[12px] drop-shadow-md">{opt.emoji}</span>
                  <div className="flex flex-col text-left">
                    <span className={`text-[14px] font-[600] mb-[2px] leading-none transition-colors ${trainingField === opt.key ? 'text-[#38bdf8]' : 'text-[#e8edf5]'}`}>{opt.label}</span>
                    <span className="text-[11px] font-[500] leading-none text-[#7a90a8]">{opt.sub}</span>
                  </div>
                  
                  <div className={`ml-auto w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-all duration-300 ${
                    trainingField === opt.key ? 'border-[#38bdf8] bg-[#38bdf8]/10 scale-110' : 'border-[#3d5068]'
                  }`}>
                     {trainingField === opt.key && <div className="w-[8px] h-[8px] rounded-full bg-[#38bdf8] animate-in zoom-in duration-200" />}
                  </div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-[8px] mb-[16px]">
              <CardBox delay={160} navDir={navDir} label="Goal Wt" icon={Scale} isError={!!errs.goalWeight} errorMsg={errs.goalWeight} onScrub={createScrubber(goalWeight, setGoalWeight, 30, 300)}>
                <div className="flex items-baseline gap-[4px]">
                  <input type="number" value={goalWeight} onChange={e=>setGoalWeight(e.target.value)} 
                    className={getInpClass(errs.goalWeight)} style={{'--focus-color': MACRO_COLORS.brand}} placeholder="70" />
                  <span className={`text-[11px] font-[700] transition-colors ${errs.goalWeight ? 'text-[#ef4444]' : 'text-[#3d5068]'}`}>KG</span>
                </div>
              </CardBox>

              <CardBox delay={200} navDir={navDir} focusHex={MACRO_COLORS.fat} label="Body Fat" icon={Activity} isError={!!errs.goalFat} errorMsg={errs.goalFat} onScrub={createScrubber(goalBodyFat, setGoalBodyFat, 4, 50)}>
                <div className="flex items-baseline gap-[4px]">
                  <input type="number" value={goalBodyFat} onChange={e=>setGoalBodyFat(e.target.value)} 
                    className={getInpClass(errs.goalFat)} style={{'--focus-color': MACRO_COLORS.fat}} placeholder="15" />
                  <span className={`text-[11px] font-[700] transition-colors ${errs.goalFat ? 'text-[#ef4444]' : 'text-[#3d5068]'}`}>%</span>
                </div>
              </CardBox>
            </div>

            <CardBox delay={240} navDir={navDir} colSpan={2} className="!items-center !justify-center !p-[12px] group/timeline focus-within:!bg-[#38bdf8]/[0.02] relative overflow-hidden" label="Timeline" icon={CalendarDays} onScrub={createScrubber(goalPeriod, setGoalPeriod, currLimit.min, currLimit.max, currLimit.step)}>
              
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.03)_0%,_transparent_70%)] pointer-events-none opacity-0 group-focus-within/timeline:opacity-100 transition-opacity duration-[800ms]" />
              
              <div className="flex items-center justify-between w-full px-[4px] mt-[4px] relative z-10">
                <button type="button" disabled={timelineAtMin} onClick={() => {
                  const p = parseInt(goalPeriod) || 0;
                  setGoalPeriod(Math.max(currLimit.min, p - currLimit.step));
                }} 
                  className={`w-[32px] h-[32px] shrink-0 rounded-full bg-[#060d1a] border flex items-center justify-center transition-all outline-none ${timelineAtMin ? 'border-[#38bdf8]/[0.03] text-[#3d5068] cursor-not-allowed opacity-50' : 'border-[#38bdf8]/[0.08] text-[#7a90a8] hover:text-[#e8edf5] hover:bg-[#0a1525] hover:border-[#38bdf8]/30 active:scale-[0.90] active:duration-100'}`}>
                  <Minus size={16} strokeWidth={2.5} />
                </button>
                
                <div className="flex flex-col items-center group relative cursor-text">
                  
                  <div className="relative flex items-center justify-center w-[84px] h-[84px] rounded-full transition-all duration-500">
                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                      <circle cx="42" cy="42" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="3" fill="none" />
                      <circle 
                        cx="42" cy="42" r="40" 
                        stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" 
                        strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * ((goalPeriod || 0) / currLimit.max))} 
                        className="transition-all duration-[600ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]" 
                      />
                    </svg>
                    
                    <input 
                      type="number"
                      value={goalPeriod}
                      onChange={(e) => {
                        if (e.target.value === "") setGoalPeriod("");
                        else setGoalPeriod(parseInt(e.target.value, 10));
                      }}
                      onBlur={() => {
                        let val = parseInt(goalPeriod, 10);
                        if (isNaN(val) || val < currLimit.min) val = currLimit.min;
                        if (val > currLimit.max) val = currLimit.max;
                        setGoalPeriod(val);
                      }}
                      className="no-spin w-[70px] bg-transparent text-center text-[36px] font-[700] text-[#e8edf5] tabular-nums tracking-tighter leading-none outline-none transition-all duration-300 relative z-10" 
                    />
                  </div>
                  
                  <div className="flex gap-[4px] mt-[10px] bg-[#060d1a] p-[3px] rounded-[8px] border border-[#38bdf8]/[0.06] shadow-inner">
                    {['months', 'weeks', 'days'].map(u => (
                      <button key={u} type="button" onClick={() => {
                        setGoalPeriodUnit(u);
                        if (u === "months") setGoalPeriod(3);
                        if (u === "weeks") setGoalPeriod(12);
                        if (u === "days") setGoalPeriod(30);
                      }} className={`text-[9px] font-[700] tracking-widest uppercase px-[6px] py-[3px] rounded-[4px] transition-all duration-[250ms] active:scale-[0.95] ${
                        goalPeriodUnit === u ? 'bg-[#38bdf8] text-[#060d1a] shadow-sm' : 'text-[#7a90a8] hover:text-[#e8edf5]'
                      }`}>{u}</button>
                    ))}
                  </div>
                </div>
                
                <button type="button" disabled={timelineAtMax} onClick={() => {
                  const p = parseInt(goalPeriod) || 0;
                  setGoalPeriod(Math.min(currLimit.max, p + currLimit.step));
                }} 
                  className={`w-[32px] h-[32px] shrink-0 rounded-full bg-[#060d1a] border flex items-center justify-center transition-all outline-none ${timelineAtMax ? 'border-[#38bdf8]/[0.03] text-[#3d5068] cursor-not-allowed opacity-50' : 'border-[#38bdf8]/[0.08] text-[#7a90a8] hover:text-[#e8edf5] hover:bg-[#0a1525] hover:border-[#38bdf8]/30 active:scale-[0.90] active:duration-100'}`}>
                  <Plus size={16} strokeWidth={2.5} />
                </button>
              </div>
            </CardBox>

            <div className="flex gap-[10px] opacity-0 mt-[12px]" style={{ animation: `${animName} 280ms cubic-bezier(0.25,0.46,0.45,0.94) forwards`, animationDelay: `260ms` }}>
              <button type="button" onClick={()=>goToStep(1)} 
                className="w-[48px] h-[48px] shrink-0 rounded-[14px] bg-[#0a1525] border border-[#38bdf8]/[0.06] text-[#7a90a8] flex items-center justify-center active:scale-[0.90] active:duration-100 transition-all duration-[250ms] hover:text-[#e8edf5] hover:border-[#38bdf8]/30 hover:bg-[#0d1b2e] outline-none">
                <ArrowLeft size={20} strokeWidth={2.5} className="transition-transform group-hover:-translate-x-1" />
              </button>
              
              <button type="button" onClick={handleFinish} disabled={!step2Valid || saving}
                className={`group flex-1 h-[48px] rounded-[14px] bg-[#38bdf8] text-[#060d1a] font-[700] text-[15px] tracking-wide flex items-center justify-center gap-[8px] active:scale-[0.97] active:duration-100 transition-all duration-[250ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] shadow-[0_0_20px_rgba(56,189,248,0.14),_0_0_40px_rgba(56,189,248,0.07)] disabled:bg-[#0a1525] disabled:text-[#3d5068] disabled:border disabled:border-[#38bdf8]/[0.06] disabled:shadow-none disabled:active:scale-100 disabled:cursor-not-allowed outline-none relative overflow-hidden ${step2Pulse ? 'animate-completion-pulse' : ''}`}
              >
                <div className="absolute inset-0 rounded-[14px] pointer-events-none border-t border-white/40 mix-blend-overlay" />
                
                {saving ? <Loader2 size={20} className="animate-spin text-[#060d1a] relative z-10" /> : <>
                  <span className="relative z-10">Finish Setup</span>
                  <ArrowRight size={20} strokeWidth={2.5} className="relative z-10 transition-transform group-hover:translate-x-1" />
                </>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
