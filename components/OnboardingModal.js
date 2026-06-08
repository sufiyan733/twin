"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Loader2, Minus, Plus, User, Scale, Ruler, Flame, Activity, CalendarDays, Target, ChevronRight } from "lucide-react";

const TRAINING_OPTIONS = [
  { key: "hypertrophy", label: "Hypertrophy", sub: "Physique Building", emoji: "💪", color: "#2dd4bf" },
  { key: "calisthenics", label: "Calisthenics", sub: "Bodyweight Mastery", emoji: "🤸", color: "#fbbf24" },
  { key: "powerlifting", label: "Powerlifting", sub: "Raw Strength", emoji: "🏋️", color: "#f87171" },
];

const MACRO_COLORS = {
  protein: "#2dd4bf", 
  fat: "#f87171",     
  brand: "#00d0ff",   
  danger: "#ef4444"
};

const hex2rgb = (hex) => {
  const v = parseInt(hex.replace('#',''), 16);
  return `${(v >> 16) & 255}, ${(v >> 8) & 255}, ${v & 255}`;
};

const triggerHaptic = (pattern) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (e) {}
  }
};

const springConfig = { type: "spring", stiffness: 400, damping: 30 };
const fastSpring = { type: "spring", stiffness: 500, damping: 35 };

const stepVariants = {
  enter: (dir) => ({
    x: dir === 'forward' ? 30 : -30,
    opacity: 0,
    filter: 'blur(8px)',
    scale: 0.96
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
    scale: 1,
    transition: { ...springConfig, staggerChildren: 0.05, delayChildren: 0.05 }
  },
  exit: (dir) => ({
    x: dir === 'forward' ? -30 : 30,
    opacity: 0,
    filter: 'blur(8px)',
    scale: 0.96,
    transition: { duration: 0.2, ease: "easeIn" }
  })
};

const cardVariants = {
  enter: { y: 15, opacity: 0, scale: 0.97 },
  center: { y: 0, opacity: 1, scale: 1, transition: springConfig }
};

const CardBox = ({ children, className = "", focusHex = MACRO_COLORS.brand, colSpan = 1, icon: Icon, label, rightElement, isError, errorMsg, onScrub, shakeKey = 0 }) => {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const activeHex = isError ? MACRO_COLORS.danger : focusHex;
  const rgb = hex2rgb(activeHex);
  
  return (
    <motion.div 
      variants={cardVariants}
      animate={isError && shakeKey > 0 ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
      whileTap={{ scale: 0.98, transition: fastSpring }}
      className={`bg-[#050b1a]/80 backdrop-blur-3xl rounded-[16px] p-[10px] flex flex-col group relative overflow-hidden ${colSpan === 2 ? 'col-span-2' : ''} ${className}`}
      style={{ 
        border: isError ? `1px solid rgba(239,68,68,0.4)` : '1px solid rgba(255,255,255,0.06)',
        boxShadow: isError ? 'inset 0 1px 1px rgba(255,255,255,0.05), 0 8px 30px rgba(239,68,68,0.15)' : 'inset 0 1px 1px rgba(255,255,255,0.05), 0 8px 30px rgba(0,0,0,0.4)'
      }}
    >
      <motion.div 
        animate={{ 
          opacity: isScrubbing ? 1 : 0, 
          boxShadow: isError 
            ? `inset 0 0 0 1px rgba(239,68,68,0.8), inset 0 0 40px rgba(239,68,68,0.2)` 
            : `inset 0 0 0 1px rgba(${rgb}, 0.6), inset 0 0 40px rgba(${rgb}, 0.2)`
        }}
        transition={springConfig}
        className={`absolute inset-0 pointer-events-none rounded-[16px] ${isError ? '!opacity-100' : 'group-focus-within:opacity-100 group-active:opacity-100'}`} 
        style={{ boxShadow: isError ? `inset 0 0 0 1px rgba(239,68,68, 0.4), inset 0 0 20px rgba(239,68,68, 0.08)` : `inset 0 0 0 1px rgba(${rgb}, 0.3), inset 0 0 20px rgba(${rgb}, 0.05)` }} 
      />
      
      <div className="absolute inset-0 opacity-0 group-focus-within:opacity-100 group-active:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-[16px]">
        <div className="absolute top-0 bottom-0 left-[-100%] w-[100%] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg]" style={{ animation: 'shimmerSweep 3s infinite' }} />
      </div>
      
      <div className="relative z-10 w-full h-full flex flex-col justify-center">
        {(label || rightElement) && (
          <div className="flex justify-between items-center mb-[4px]">
            {label && (
              <div 
                className={`flex items-center gap-[4px] transition-all duration-300 ${onScrub ? 'cursor-ew-resize select-none rounded-[6px] px-[6px] py-[2px] -ml-[6px] active:bg-[var(--focus-color)] active:bg-opacity-15 group/scrub' : ''}`}
                style={{ '--focus-color': activeHex }}
                onPointerDown={(e) => {
                  if (onScrub) {
                    setIsScrubbing(true);
                    onScrub(e, () => setIsScrubbing(false));
                  }
                }}
              >
                {Icon && (
                  <motion.div animate={{ color: isScrubbing ? activeHex : undefined }} className={`transition-all duration-300 ${isError ? 'opacity-100 text-[#ef4444]' : 'opacity-40 group-focus-within:opacity-100 group-focus-within:scale-110 group-active/scrub:opacity-100 group-active/scrub:scale-110 group-active/scrub:drop-shadow-[0_0_8px_currentColor] text-[var(--focus-color)]'}`} style={{ '--focus-color': activeHex }}>
                    <Icon size={12} strokeWidth={2.5} color="currentColor" />
                  </motion.div>
                )}
                <span 
                  className={`text-[9.5px] font-[800] tracking-widest uppercase transition-colors duration-300 ${isError ? 'text-[#ef4444]' : 'text-white/30 group-focus-within:text-[var(--focus-color)] group-active/scrub:text-[var(--focus-color)]'}`}
                  style={{ '--focus-color': activeHex }}
                >
                  {label}
                </span>
              </div>
            )}
            <div className="flex items-center gap-[4px]">
               {isError && errorMsg && (
                 <motion.span initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} className="text-[8.5px] font-[700] tracking-widest text-[#ef4444] uppercase">
                   {errorMsg}
                 </motion.span>
               )}
               {rightElement}
            </div>
          </div>
        )}
        {children}
      </div>
    </motion.div>
  );
};

export default function OnboardingModal({ isOpen, onComplete }) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [navDir, setNavDir] = useState('forward'); 
  const [saving, setSaving] = useState(false);

  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState("");
  const [heightUnit, setHeightUnit] = useState("ft");
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [workoutDays, setWorkoutDays] = useState(3);
  const [proteinBudget, setProteinBudget] = useState("");
  const [trainingField, setTrainingField] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [goalBodyFat, setGoalBodyFat] = useState("");
  const [goalPeriod, setGoalPeriod] = useState(3);
  const [goalPeriodUnit, setGoalPeriodUnit] = useState("months");

  const [showErrors, setShowErrors] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('twin_onboarding_draft');
      if (saved) {
        const p = JSON.parse(saved);
        if (p.age) setAge(p.age);
        if (p.gender) setGender(p.gender);
        if (p.weight) setWeight(p.weight);
        if (p.heightUnit) setHeightUnit(p.heightUnit);
        if (p.heightCm) setHeightCm(p.heightCm);
        if (p.heightFt) setHeightFt(p.heightFt);
        if (p.heightIn) setHeightIn(p.heightIn);
        if (p.workoutDays) setWorkoutDays(p.workoutDays);
        if (p.proteinBudget) setProteinBudget(p.proteinBudget);
        if (p.trainingField) setTrainingField(p.trainingField);
        if (p.goalWeight) setGoalWeight(p.goalWeight);
        if (p.goalBodyFat) setGoalBodyFat(p.goalBodyFat);
        if (p.goalPeriod) setGoalPeriod(p.goalPeriod);
        if (p.goalPeriodUnit) setGoalPeriodUnit(p.goalPeriodUnit);
      }
    } catch(e) {}
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const draft = { age, gender, weight, heightUnit, heightCm, heightFt, heightIn, workoutDays, proteinBudget, trainingField, goalWeight, goalBodyFat, goalPeriod, goalPeriodUnit };
    localStorage.setItem('twin_onboarding_draft', JSON.stringify(draft));
  }, [age, gender, weight, heightUnit, heightCm, heightFt, heightIn, workoutDays, proteinBudget, trainingField, goalWeight, goalBodyFat, goalPeriod, goalPeriodUnit, mounted]);

  const goToStep = (newStep) => {
    triggerHaptic(30);
    if (newStep === 2 && !goalWeight && weight) setGoalWeight(weight);
    setNavDir(newStep > step ? 'forward' : 'backward');
    setStep(newStep);
  };

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

  const getErr = (val, min, max, checkEmpty) => {
    if (val === "") return checkEmpty ? "Required" : null;
    const num = parseFloat(val);
    if (isNaN(num)) return "Invalid";
    if (num < min) return `Min ${min}`;
    if (num > max) return `Max ${max}`;
    return null;
  };

  const errs = {
    age: getErr(age, 12, 120, showErrors),
    weight: getErr(weight, 30, 300, showErrors),
    heightCm: heightUnit === 'cm' ? getErr(heightCm, 100, 250, showErrors) : null,
    heightFt: heightUnit === 'ft' ? getErr(heightFt, 3, 8, showErrors) : null,
    heightIn: heightUnit === 'ft' ? getErr(heightIn, 0, 11, showErrors) : null,
    protein: getErr(proteinBudget, 30, 400, showErrors),
    goalWeight: getErr(goalWeight, 30, 300, showErrors),
    goalFat: getErr(goalBodyFat, 4, 50, showErrors),
  };

  const hasStep1Err = errs.age || errs.weight || errs.heightCm || errs.heightFt || errs.heightIn || errs.protein;
  const hasStep2Err = errs.goalWeight || errs.goalFat;

  const heightValid = heightUnit === "cm" ? !!heightCm : !!heightFt;
  const step1Valid = !!age && !!gender && !!weight && heightValid && !!proteinBudget && !errs.age && !errs.weight && !errs.heightCm && !errs.heightFt && !errs.heightIn && !errs.protein;
  const step2Valid = !!trainingField && !!goalWeight && !!goalBodyFat && !errs.goalWeight && !errs.goalFat && (parseInt(goalPeriod) >= currLimit.min);

  const handleNextStep = () => {
    if (!step1Valid) {
      triggerHaptic([50, 50, 50]);
      setShowErrors(true);
      setShakeKey(k => k + 1);
      return;
    }
    setShowErrors(false);
    goToStep(2);
  };

  const handleFinish = async () => {
    if (!step2Valid) {
      triggerHaptic([50, 50, 50]);
      setShowErrors(true);
      setShakeKey(k => k + 1);
      return;
    }
    if (saving) return;
    triggerHaptic([30, 50, 80]); 
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
      if (res.ok) {
        localStorage.removeItem('twin_onboarding_draft');
        onComplete();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const createScrubber = (val, setter, min, max, stepAmount = 1) => {
    return (e, onCompleteScrub) => {
      if (e.pointerType === 'mouse' && e.button !== 0) {
        if (onCompleteScrub) onCompleteScrub();
        return; 
      }
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
          
          const finalVal = Math.round(currentVal * 10) / 10;
          if (String(finalVal) !== val) {
             triggerHaptic(5); 
             setter(String(finalVal));
          }
        }
      };
      
      const onUp = () => {
        document.body.style.cursor = '';
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        if (onCompleteScrub) onCompleteScrub();
      };
      
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    };
  };

  if (!isOpen || !mounted) return null;

  const inputBase = "no-spin w-full bg-transparent text-[20px] font-[800] tracking-tight outline-none transition-colors";
  const getInpClass = (err) => `${inputBase} ${err ? 'text-[#ef4444] placeholder:text-[#ef4444]/40 caret-[#ef4444]' : 'text-white placeholder:text-white/20 focus:text-[var(--focus-color)] caret-[var(--focus-color)]'}`;

  const timelineAtMin = parseInt(goalPeriod) <= currLimit.min;
  const timelineAtMax = parseInt(goalPeriod) >= currLimit.max;

  const selectedFocus = TRAINING_OPTIONS.find(o => o.key === trainingField);
  const themeColor = selectedFocus ? selectedFocus.color : MACRO_COLORS.brand;

  return createPortal(
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-[12px] bg-[#010614]/90 backdrop-blur-[40px] selection:bg-[#00d0ff]/30 font-sans"
      >
        <style>{`
          .no-spin::-webkit-inner-spin-button,
          .no-spin::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
          .no-spin { -moz-appearance: textfield; }
          @keyframes shimmerSweep {
            0% { transform: translateX(-100%) skewX(-15deg); }
            100% { transform: translateX(200%) skewX(-15deg); }
          }
          @keyframes spinSlow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes spinSlowReverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          @keyframes breathe {
            0% { box-shadow: 0 4px 20px rgba(var(--focus-rgb), 0.15), inset 0 1px 1px rgba(255,255,255,0.05); }
            50% { box-shadow: 0 4px 35px rgba(var(--focus-rgb), 0.4), inset 0 1px 1px rgba(255,255,255,0.1); }
            100% { box-shadow: 0 4px 20px rgba(var(--focus-rgb), 0.15), inset 0 1px 1px rgba(255,255,255,0.05); }
          }
          @keyframes morphBg {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>

        {/* Ambient Animated Mesh Background */}
        <motion.div 
          animate={{ opacity: step === 2 ? 0.7 : 0.5 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0 pointer-events-none overflow-hidden mix-blend-screen"
        >
           <div 
             className="absolute inset-[-50%] bg-[length:200%_200%]" 
             style={{ 
               background: `radial-gradient(circle at 30% 30%, rgba(${hex2rgb(themeColor)}, 0.15) 0%, transparent 40%), radial-gradient(circle at 70% 70%, rgba(${hex2rgb(MACRO_COLORS.protein)}, 0.1) 0%, transparent 40%)`,
               filter: 'blur(60px)', 
               animation: 'morphBg 15s ease infinite, spinSlow 40s linear infinite' 
             }} 
           />
        </motion.div>

        {/* Cinematic Noise Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

        <motion.div 
          initial={{ scale: 0.9, y: 30, opacity: 0, filter: 'blur(10px)' }}
          animate={{ scale: 1, y: 0, opacity: 1, filter: 'blur(0px)' }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="relative w-full max-w-[340px] bg-[#020512]/95 backdrop-blur-[60px] rounded-[24px] p-[16px] shadow-[0_30px_100px_rgba(0,0,0,0.9),_inset_0_1px_1px_rgba(255,255,255,0.08)] mx-auto z-10"
          style={{ border: `1px solid rgba(${hex2rgb(themeColor)},0.15)` }}
        >
          {/* Top Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent overflow-hidden rounded-t-[24px]">
            <motion.div 
              animate={{ width: step === 1 ? '50%' : '100%', background: `linear-gradient(90deg, transparent, ${themeColor}, ${themeColor})`, boxShadow: `0 0 20px ${themeColor}, 0 0 10px ${themeColor} inset` }}
              transition={springConfig}
              className="h-full relative" 
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[40px] h-[4px] bg-white rounded-full blur-[2px] opacity-100 drop-shadow-[0_0_12px_white]" />
            </motion.div>
          </div>

          <div className="flex justify-between items-end mb-[16px] mt-[4px]">
            <div>
              <div className="flex items-center gap-[6px] mb-[4px]">
                 <motion.div 
                   animate={{ borderColor: themeColor }}
                   className="flex items-center justify-center w-[12px] h-[12px] rounded-full border-[2px] shadow-[0_0_15px_rgba(0,0,0,0.8)]"
                 >
                   <motion.div animate={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }} className="w-[4px] h-[4px] rounded-full animate-pulse" />
                 </motion.div>
                 <motion.span 
                   animate={{ backgroundImage: `linear-gradient(to right, white, ${themeColor})` }}
                   className="text-[10px] font-[800] tracking-[0.15em] uppercase bg-clip-text text-transparent bg-gradient-to-r"
                 >
                   Twin OS
                 </motion.span>
              </div>
              <AnimatePresence mode="wait">
                <motion.h2 
                  key={step}
                  initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                  transition={{ duration: 0.2 }}
                  className="text-[26px] font-[800] text-white tracking-tight leading-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
                >
                  {step === 1 ? "Profile" : "Goals"}
                </motion.h2>
              </AnimatePresence>
            </div>
            <div className="text-[9.5px] font-[800] tracking-[0.1em] text-white/50 bg-white/[0.03] border border-white/10 px-[10px] py-[4px] rounded-full uppercase shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),_0_2px_4px_rgba(0,0,0,0.2)]">
              Step {step}/2
            </div>
          </div>

          <AnimatePresence mode="wait" custom={navDir}>
            {step === 1 ? (
              <motion.div 
                key="step1" custom={navDir} variants={stepVariants} initial="enter" animate="center" exit="exit"
                className="w-full flex flex-col gap-[16px]"
              >
                <div className="grid grid-cols-2 gap-[8px]">
                  
                  <CardBox onScrub={createScrubber(age, setAge, 12, 120)} label="Age" icon={User} isError={!!errs.age} errorMsg={errs.age} shakeKey={shakeKey}>
                    <input type="number" value={age} onChange={e=>setAge(e.target.value)} className={getInpClass(errs.age)} style={{'--focus-color': MACRO_COLORS.brand}} placeholder="25" />
                  </CardBox>

                  <CardBox onScrub={createScrubber(weight, setWeight, 30, 300)} label="Weight" icon={Scale} isError={!!errs.weight} errorMsg={errs.weight} shakeKey={shakeKey}>
                    <div className="flex items-baseline gap-[4px]">
                      <input type="number" value={weight} onChange={e=>setWeight(e.target.value)} className={getInpClass(errs.weight)} style={{'--focus-color': MACRO_COLORS.brand}} placeholder="75" />
                      <span className={`text-[11px] font-[800] transition-colors ${errs.weight ? 'text-[#ef4444]' : 'text-white/40'}`}>KG</span>
                    </div>
                  </CardBox>

                  <CardBox label="Height" icon={Ruler} isError={!!errs.heightCm || !!errs.heightFt || !!errs.heightIn} errorMsg={errs.heightCm || errs.heightFt || errs.heightIn} shakeKey={shakeKey} rightElement={
                    <motion.button whileTap={{ scale: 0.9 }} onClick={()=>{ triggerHaptic(10); setHeightUnit(heightUnit==='ft'?'cm':'ft'); }} className={`text-[9.5px] font-[800] tracking-widest text-white/50 bg-[#030818] border px-[8px] py-[2px] rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#00d0ff] ${(errs.heightCm || errs.heightFt || errs.heightIn) ? 'border-[#ef4444]/40 text-[#ef4444]' : 'border-white/10'} shadow-inner`}>{heightUnit.toUpperCase()}</motion.button>
                  }>
                    {heightUnit === 'cm' ? (
                      <div className="flex items-baseline gap-[4px]">
                        <input type="number" value={heightCm} onChange={e=>setHeightCm(e.target.value)} className={getInpClass(errs.heightCm)} style={{'--focus-color': MACRO_COLORS.brand}} placeholder="175" />
                        <span className={`text-[11px] font-[800] transition-colors ${errs.heightCm ? 'text-[#ef4444]' : 'text-white/40'}`}>CM</span>
                      </div>
                    ) : (
                      <div className="flex items-baseline">
                        <input type="number" value={heightFt} onChange={e=>setHeightFt(e.target.value)} className={`${getInpClass(errs.heightFt)} w-[24px] text-center`} style={{'--focus-color': MACRO_COLORS.brand}} placeholder="5" />
                        <span className={`text-[16px] font-[600] ml-[2px] mr-[4px] transition-colors ${errs.heightFt ? 'text-[#ef4444]' : 'text-white/40'}`}>'</span>
                        <input type="number" value={heightIn} onChange={e=>setHeightIn(e.target.value)} className={`${getInpClass(errs.heightIn)} w-[28px] text-center`} style={{'--focus-color': MACRO_COLORS.brand}} placeholder="10" />
                        <span className={`text-[16px] font-[600] ml-[2px] transition-colors ${errs.heightIn ? 'text-[#ef4444]' : 'text-white/40'}`}>"</span>
                      </div>
                    )}
                  </CardBox>

                  <CardBox focusHex={MACRO_COLORS.protein} onScrub={createScrubber(proteinBudget, setProteinBudget, 30, 400)} label="Protein" icon={Flame} isError={!!errs.protein} errorMsg={errs.protein} shakeKey={shakeKey}>
                    <div className="flex items-baseline gap-[4px]">
                      <input type="number" value={proteinBudget} onChange={e=>setProteinBudget(e.target.value)} className={getInpClass(errs.protein)} style={{'--focus-color': MACRO_COLORS.protein}} placeholder="150" />
                      <span className={`text-[11px] font-[800] transition-colors ${errs.protein ? 'text-[#ef4444]' : 'text-white/40'}`}>G</span>
                    </div>
                  </CardBox>

                  <CardBox colSpan={2} className="!p-[4px]" isError={showErrors && !gender} shakeKey={shakeKey}>
                     <div className="flex w-full p-[4px] bg-black/50 rounded-[12px] border border-white/[0.04] shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] relative">
                       {['M','F','O'].map(g => {
                         const isActive = gender === g.toLowerCase();
                         return (
                           <motion.button key={g} type="button" whileTap={{ scale: 0.95 }} onClick={() => { triggerHaptic(15); setGender(g.toLowerCase()); }}
                             animate={{ color: isActive ? '#020617' : 'rgba(255,255,255,0.4)' }}
                             transition={fastSpring}
                             className="relative flex-1 h-[36px] rounded-[8px] text-[13px] font-[700] outline-none z-10"
                           >
                             {isActive && (
                               <motion.div 
                                 layoutId="gender-pill"
                                 transition={springConfig}
                                 className="absolute inset-0 rounded-[8px] z-[-1] shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
                                 style={{ background: `linear-gradient(135deg, ${themeColor}, rgba(${hex2rgb(themeColor)}, 0.8))` }}
                               />
                             )}
                             {g === 'M' ? 'Male' : g === 'F' ? 'Female' : 'Other'}
                           </motion.button>
                         )
                       })}
                     </div>
                  </CardBox>

                  <CardBox colSpan={2} label="Workouts / Wk" icon={CalendarDays}>
                    <div className="flex justify-between w-full px-[4px] mt-[4px] relative">
                      <div className="absolute top-1/2 left-[12px] right-[12px] h-[2px] -translate-y-1/2 bg-white/[0.03] rounded-full z-0" />
                      {[1,2,3,4,5,6,7].map(d => {
                        const isActive = workoutDays === d;
                        return (
                          <motion.button key={d} type="button" whileTap={{ scale: 0.9 }} onClick={() => { triggerHaptic(15); setWorkoutDays(d); }}
                            animate={{
                              scale: isActive ? 1.1 : 1,
                              color: isActive ? '#020617' : 'rgba(255,255,255,0.4)',
                              borderColor: isActive ? `transparent` : 'rgba(255,255,255,0.05)',
                            }}
                            transition={springConfig}
                            className="relative z-10 w-[34px] h-[34px] rounded-full text-[14px] font-[700] flex items-center justify-center outline-none border bg-[#050b1a]"
                          >
                            {isActive && (
                               <motion.div 
                                 layoutId="workout-pill"
                                 transition={springConfig}
                                 className="absolute inset-[-1px] rounded-full z-[-1] shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
                                 style={{ background: `linear-gradient(135deg, ${themeColor}, rgba(${hex2rgb(themeColor)}, 0.8))` }}
                               />
                             )}
                            <span className="relative z-10">{d}</span>
                          </motion.button>
                        )
                      })}
                    </div>
                  </CardBox>

                </div>

                <motion.button variants={cardVariants} type="button" whileTap={{ scale: 0.96 }} onClick={handleNextStep}
                  animate={{
                    backgroundColor: step1Valid ? themeColor : 'rgba(255,255,255,0.02)',
                    boxShadow: step1Valid ? `0 0 40px rgba(${hex2rgb(themeColor)},0.5), inset 0 2px 2px rgba(255,255,255,0.5)` : 'none',
                    color: step1Valid ? '#020617' : 'rgba(255,255,255,0.2)',
                    borderColor: step1Valid ? 'transparent' : (showErrors ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.05)')
                  }}
                  transition={{ duration: 0.3 }}
                  className={`group w-full h-[48px] rounded-[14px] font-[800] text-[16px] tracking-wide flex items-center justify-center gap-[6px] border outline-none relative overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.3)]`}
                >
                  {step1Valid && <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay w-[200%] h-full bg-gradient-to-r from-transparent via-white to-transparent" style={{ animation: 'shimmerSweep 2s infinite ease-in-out' }} />}
                  <motion.span animate={{ scale: step1Valid ? [1, 1.05, 1] : 1 }} transition={{ duration: 0.3 }} className="relative z-10 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]">Continue</motion.span>
                  <ArrowRight size={18} strokeWidth={3} className={`relative z-10 transition-transform duration-300 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)] ${step1Valid ? 'group-hover:translate-x-1' : ''}`} />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div 
                key="step2" custom={navDir} variants={stepVariants} initial="enter" animate="center" exit="exit"
                className="w-full flex flex-col gap-[16px]"
              >
                <motion.div variants={cardVariants} className="flex flex-col gap-[8px]">
                  <div className="flex items-center gap-[4px] px-[6px]">
                    <motion.div animate={{ color: themeColor }}><Target size={12} className="opacity-80 drop-shadow-[0_0_8px_currentColor]" /></motion.div>
                    <span className="text-[10px] font-[800] tracking-[0.1em] uppercase text-white/50">Focus</span>
                  </div>
                  
                  {TRAINING_OPTIONS.map((opt) => {
                    const isActive = trainingField === opt.key;
                    return (
                      <motion.button key={opt.key} type="button" whileTap={{ scale: 0.97 }} onClick={() => { triggerHaptic(20); setTrainingField(opt.key); }}
                        animate={{
                          background: isActive ? `linear-gradient(135deg, rgba(${hex2rgb(opt.color)},0.15), rgba(${hex2rgb(opt.color)},0.05))` : 'linear-gradient(135deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2))',
                          borderColor: isActive ? `rgba(${hex2rgb(opt.color)},0.6)` : 'rgba(255,255,255,0.03)',
                        }}
                        transition={springConfig}
                        style={{ '--focus-rgb': hex2rgb(opt.color) }}
                        className={`relative w-full flex items-center p-[10px] pl-[12px] rounded-[14px] outline-none group overflow-hidden border ${isActive ? 'animate-[breathe_3s_infinite_ease-in-out] z-10' : 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.02),_0_4px_15px_rgba(0,0,0,0.2)]'}`}
                      >
                        {isActive && (
                           <div className="absolute top-0 bottom-0 left-[-100%] w-[100%] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg]" style={{ animation: 'shimmerSweep 4s infinite' }} />
                        )}
                        <motion.span animate={{ scale: isActive ? 1.1 : 1, filter: isActive ? 'grayscale(0%)' : 'grayscale(30%)' }} className="text-[22px] mr-[12px] drop-shadow-lg relative z-10">{opt.emoji}</motion.span>
                        <div className="flex flex-col text-left relative z-10">
                          <motion.span animate={{ color: isActive ? opt.color : '#ffffff' }} className="text-[15px] font-[800] mb-[1px] leading-tight drop-shadow-[0_0_8px_currentColor]">{opt.label}</motion.span>
                          <span className="text-[11px] font-[600] leading-none text-white/40">{opt.sub}</span>
                        </div>
                        
                        <motion.div 
                          animate={{ 
                            borderColor: isActive ? opt.color : 'rgba(255,255,255,0.1)',
                            background: isActive ? `linear-gradient(135deg, rgba(${hex2rgb(opt.color)},0.4), rgba(${hex2rgb(opt.color)},0.1))` : 'transparent',
                            scale: isActive ? 1.1 : 1,
                            boxShadow: isActive ? `0 0 20px ${opt.color}` : 'none'
                          }}
                          className="ml-auto w-[20px] h-[20px] rounded-full border-[2px] flex items-center justify-center shadow-inner relative z-10"
                        >
                           {isActive && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={fastSpring} className="w-[8px] h-[8px] rounded-full shadow-md" style={{ backgroundColor: opt.color, boxShadow: `0 0 10px ${opt.color}` }} />}
                        </motion.div>
                      </motion.button>
                    )
                  })}
                </motion.div>

                <div className="grid grid-cols-2 gap-[8px]">
                  <CardBox onScrub={createScrubber(goalWeight, setGoalWeight, 30, 300)} label="Goal Wt" icon={Scale} isError={!!errs.goalWeight} errorMsg={errs.goalWeight} shakeKey={shakeKey}>
                    <div className="flex items-baseline gap-[4px]">
                      <input type="number" value={goalWeight} onChange={e=>setGoalWeight(e.target.value)} className={getInpClass(errs.goalWeight)} style={{'--focus-color': MACRO_COLORS.brand}} placeholder="70" />
                      <span className={`text-[11px] font-[800] transition-colors ${errs.goalWeight ? 'text-[#ef4444]' : 'text-white/40'}`}>KG</span>
                    </div>
                  </CardBox>

                  <CardBox focusHex={MACRO_COLORS.fat} onScrub={createScrubber(goalBodyFat, setGoalBodyFat, 4, 50)} label="Body Fat" icon={Activity} isError={!!errs.goalFat} errorMsg={errs.goalFat} shakeKey={shakeKey}>
                    <div className="flex items-baseline gap-[4px]">
                      <input type="number" value={goalBodyFat} onChange={e=>setGoalBodyFat(e.target.value)} className={getInpClass(errs.goalFat)} style={{'--focus-color': MACRO_COLORS.fat}} placeholder="15" />
                      <span className={`text-[11px] font-[800] transition-colors ${errs.goalFat ? 'text-[#ef4444]' : 'text-white/40'}`}>%</span>
                    </div>
                  </CardBox>
                </div>

                <CardBox focusHex={themeColor} colSpan={2} className="!items-center !justify-center !p-[14px] group/timeline relative" label="Timeline" icon={CalendarDays} onScrub={createScrubber(goalPeriod, setGoalPeriod, currLimit.min, currLimit.max, currLimit.step)}>
                  
                  <motion.div animate={{ background: `radial-gradient(circle at center, rgba(${hex2rgb(themeColor)},0.15) 0%, transparent 60%)` }} className="absolute inset-0 pointer-events-none opacity-0 group-focus-within/timeline:opacity-100 transition-opacity duration-700" />
                  
                  <div className="flex items-center justify-between w-full px-[4px] mt-[6px] relative z-10">
                    <motion.button type="button" whileTap={!timelineAtMin ? { scale: 0.85 } : {}} disabled={timelineAtMin} onClick={() => {
                      const p = parseInt(goalPeriod) || 0;
                      setGoalPeriod(Math.max(currLimit.min, p - currLimit.step));
                      triggerHaptic(15);
                    }} 
                      animate={{
                        borderColor: timelineAtMin ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)',
                        color: timelineAtMin ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)'
                      }}
                      className="w-[44px] h-[44px] shrink-0 rounded-full bg-[#050b1a] border flex items-center justify-center outline-none shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
                      <Minus size={20} strokeWidth={2.5} />
                    </motion.button>
                    
                    <div className="flex flex-col items-center group relative cursor-ew-resize">
                      
                      <motion.div whileTap={{ scale: 0.95 }} className="relative flex items-center justify-center w-[84px] h-[84px] rounded-full">
                        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                          <circle cx="42" cy="42" r="38" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="none" />
                          <circle cx="42" cy="42" r="38" stroke="rgba(0,0,0,0.4)" strokeWidth="6" fill="none" className="blur-[2px]" />
                          
                          {/* Inner Tech Ring */}
                          <circle cx="42" cy="42" r="30" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="2 4" fill="none" className="origin-center" style={{ animation: 'spinSlowReverse 20s infinite linear' }} />
                          
                          <motion.circle 
                            cx="42" cy="42" r="38" strokeWidth="6" fill="none" strokeLinecap="round" 
                            animate={{ 
                              strokeDasharray: "238.76", 
                              strokeDashoffset: 238.76 - (238.76 * ((goalPeriod || 0) / currLimit.max)),
                              stroke: themeColor,
                              color: themeColor
                            }}
                            transition={springConfig}
                          />
                        </svg>
                        
                        <motion.input 
                          key={goalPeriod}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          type="number" value={goalPeriod}
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
                          className="no-spin w-[70px] bg-transparent text-center text-[36px] font-[800] text-white tabular-nums tracking-tighter leading-none outline-none relative z-10 pointer-events-none selection:bg-transparent" 
                        />
                      </motion.div>
                      
                      <div className="flex gap-[4px] mt-[12px] bg-black/40 p-[4px] rounded-[8px] border border-white/[0.04] shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] transition-colors duration-500 relative">
                        {['months', 'weeks', 'days'].map(u => {
                          const isActive = goalPeriodUnit === u;
                          return (
                            <motion.button key={u} type="button" whileTap={{ scale: 0.9 }} onClick={(e) => {
                              e.stopPropagation(); triggerHaptic(10); setGoalPeriodUnit(u);
                              if (u === "months") setGoalPeriod(3);
                              if (u === "weeks") setGoalPeriod(12);
                              if (u === "days") setGoalPeriod(30);
                            }} 
                              animate={{ color: isActive ? '#020617' : 'rgba(255,255,255,0.4)' }}
                              className="relative text-[9.5px] font-[800] tracking-widest uppercase px-[8px] py-[4px] rounded-[6px] outline-none z-10"
                            >
                              {isActive && (
                                <motion.div 
                                  layoutId="period-pill"
                                  transition={springConfig}
                                  className="absolute inset-0 rounded-[6px] z-[-1] shadow-[0_0_15px_rgba(var(--theme-rgb),0.5),_inset_0_1px_1px_rgba(255,255,255,0.5)]"
                                  style={{ background: `linear-gradient(135deg, ${themeColor}, rgba(${hex2rgb(themeColor)},0.8))`, '--theme-rgb': hex2rgb(themeColor) }}
                                />
                              )}
                              <span className="relative z-10">{u}</span>
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                    
                    <motion.button type="button" whileTap={!timelineAtMax ? { scale: 0.85 } : {}} disabled={timelineAtMax} onClick={() => {
                      const p = parseInt(goalPeriod) || 0;
                      setGoalPeriod(Math.min(currLimit.max, p + currLimit.step));
                      triggerHaptic(15);
                    }} 
                      animate={{
                        borderColor: timelineAtMax ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)',
                        color: timelineAtMax ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)'
                      }}
                      className="w-[44px] h-[44px] shrink-0 rounded-full bg-[#050b1a] border flex items-center justify-center outline-none shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
                      <Plus size={20} strokeWidth={2.5} />
                    </motion.button>
                  </div>
                </CardBox>

                <motion.div variants={cardVariants} className="flex gap-[10px]">
                  <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={()=>goToStep(1)} 
                    className="w-[48px] h-[48px] shrink-0 rounded-[14px] bg-white/[0.02] border border-white/10 text-white/50 flex items-center justify-center outline-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),_0_4px_15px_rgba(0,0,0,0.2)]">
                    <ArrowLeft size={20} strokeWidth={2.5} />
                  </motion.button>
                  
                  <motion.button type="button" whileTap={{ scale: 0.96 }} onClick={() => { if (!step2Valid) { setShowErrors(true); setShakeKey(prev => prev + 1); } else { handleFinish(); } }}
                    animate={{
                      backgroundColor: step2Valid && !saving ? themeColor : 'rgba(255,255,255,0.02)',
                      boxShadow: step2Valid && !saving ? `0 0 40px rgba(${hex2rgb(themeColor)},0.5), inset 0 2px 2px rgba(255,255,255,0.5)` : 'none',
                      color: step2Valid && !saving ? '#020617' : 'rgba(255,255,255,0.2)',
                      borderColor: step2Valid && !saving ? 'transparent' : (showErrors ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.05)')
                    }}
                    transition={{ duration: 0.3 }}
                    className={`group flex-1 h-[48px] rounded-[14px] font-[800] text-[16px] tracking-wide flex items-center justify-center gap-[6px] border outline-none relative overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.3)]`}
                  >
                    {step2Valid && !saving && <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay w-[200%] h-full bg-gradient-to-r from-transparent via-white to-transparent" style={{ animation: 'shimmerSweep 2s infinite ease-in-out' }} />}
                    
                    {saving ? <Loader2 size={20} className="animate-spin text-[#020617] relative z-10" /> : <>
                      <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]">Finish Setup</span>
                      <ChevronRight size={22} strokeWidth={3} className={`relative z-10 transition-transform duration-300 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)] ${step2Valid ? 'group-hover:translate-x-1' : ''}`} />
                    </>}
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
