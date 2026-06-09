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
  const v = parseInt(hex.replace('#', ''), 16);
  return `${(v >> 16) & 255}, ${(v >> 8) & 255}, ${v & 255}`;
};

const triggerHaptic = (pattern) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (e) { }
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

const CardBox = ({ children, className = "", focusHex = MACRO_COLORS.brand, colSpan = 1, icon: Icon, label, rightElement, isError, errorMsg, onScrub, shakeKey = 0, id, activeInput, setActiveInput }) => {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const activeHex = isError ? MACRO_COLORS.danger : focusHex;
  const rgb = hex2rgb(activeHex);
  const isFaded = activeInput && activeInput !== id;

  return (
    <motion.div
      variants={cardVariants}
      animate={{
        ...(isError && shakeKey > 0 ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { x: 0 }),
        opacity: isFaded ? 0.3 : 1,
        scale: isFaded ? 0.96 : 1
      }}
      transition={isFaded ? { duration: 0.4 } : fastSpring}
      whileTap={{ scale: 0.98, transition: fastSpring }}
      className={`bg-[#121214]/70 rounded-[16px] p-[12px] flex flex-col group relative overflow-hidden ${colSpan === 2 ? 'col-span-2' : ''} ${className} ${onScrub ? 'cursor-ew-resize' : ''}`}
      style={{
        border: isError ? `1px solid rgba(239,68,68,0.3)` : '1px solid rgba(255,255,255,0.04)',
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)'
      }}
      onFocus={() => setActiveInput(id)}
      onPointerDown={(e) => {
        e.stopPropagation();
        if (!activeInput) setActiveInput(id);
        if (onScrub) {
          setIsScrubbing(true);
          onScrub(e, () => setIsScrubbing(false));
        }
      }}
    >
      <motion.div
        animate={{
          opacity: isScrubbing ? 1 : 0,
          boxShadow: isError
            ? `inset 0 0 0 1px rgba(239,68,68,0.5), inset 0 0 20px rgba(239,68,68,0.1)`
            : `inset 0 0 0 1px rgba(${rgb}, 0.5), inset 0 0 20px rgba(${rgb}, 0.1)`
        }}
        transition={springConfig}
        className={`absolute inset-0 pointer-events-none rounded-[16px] ${isError ? '!opacity-100' : 'group-focus-within:opacity-100'}`}
      />

      <div className="relative z-10 w-full h-full flex flex-col justify-center pointer-events-none">
        {(label || rightElement) && (
          <div className="flex justify-between items-center mb-[8px] pointer-events-auto">
            {label && (
              <div className={`flex items-center gap-[6px] transition-all duration-300 ${onScrub ? 'select-none active:opacity-70' : ''}`}>
                {Icon && (
                  <div className={`transition-all duration-300 ${isError ? 'text-[#ef4444]' : 'text-white/40 group-focus-within:text-[var(--focus-color)]'}`} style={{ '--focus-color': activeHex }}>
                    <Icon size={14} strokeWidth={2.5} color="currentColor" />
                  </div>
                )}
                <span className={`text-[11px] font-semibold tracking-wide uppercase transition-colors duration-300 ${isError ? 'text-[#ef4444]' : 'text-white/40 group-focus-within:text-white/80'}`}>
                  {label}
                </span>
              </div>
            )}
            <div className="flex items-center gap-[4px]">
              {isError && errorMsg && (
                <motion.span initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} className="text-[10px] font-semibold tracking-wide text-[#ef4444] uppercase">
                  {errorMsg}
                </motion.span>
              )}
              {rightElement}
            </div>
          </div>
        )}
        {children}
      </div>

      {isFaded && (
        <div
          className="absolute inset-0 z-50 cursor-pointer"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (document.activeElement && typeof document.activeElement.blur === 'function') {
              document.activeElement.blur();
            }
            setActiveInput(null);
          }}
        />
      )}
    </motion.div>
  );
};

export default function OnboardingModal({ isOpen, onComplete }) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [navDir, setNavDir] = useState('forward');
  const [saving, setSaving] = useState(false);
  const [isAnyScrubbing, setIsAnyScrubbing] = useState(false);
  const [activeInput, setActiveInput] = useState(null);

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
  const [bodyFat, setBodyFat] = useState("");
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
        if (p.bodyFat) setBodyFat(p.bodyFat);
        if (p.goalPeriod) setGoalPeriod(p.goalPeriod);
        if (p.goalPeriodUnit) setGoalPeriodUnit(p.goalPeriodUnit);
      }
    } catch (e) { }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const draft = { age, gender, weight, heightUnit, heightCm, heightFt, heightIn, workoutDays, proteinBudget, trainingField, goalWeight, goalBodyFat, bodyFat, goalPeriod, goalPeriodUnit };
    localStorage.setItem('twin_onboarding_draft', JSON.stringify(draft));
  }, [age, gender, weight, heightUnit, heightCm, heightFt, heightIn, workoutDays, proteinBudget, trainingField, goalWeight, goalBodyFat, bodyFat, goalPeriod, goalPeriodUnit, mounted]);

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
    bodyFat: getErr(bodyFat, 3, 60, showErrors),
    goalWeight: getErr(goalWeight, 30, 300, showErrors),
    goalFat: getErr(goalBodyFat, 4, 50, showErrors),
  };

  const hasStep1Err = errs.age || errs.weight || errs.heightCm || errs.heightFt || errs.heightIn || errs.protein || errs.bodyFat;
  const hasStep2Err = errs.goalWeight || errs.goalFat;

  const heightValid = heightUnit === "cm" ? !!heightCm : !!heightFt;
  const step1Valid = !!age && !!gender && !!weight && heightValid && !!proteinBudget && !!bodyFat && !hasStep1Err;
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
          workoutDays, proteinBudget, bodyFat,
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

  const createScrubber = (id, val, setter, min, max, stepAmount = 1) => {
    return (e, onCompleteScrub) => {
      if (e.pointerType === 'mouse' && e.button !== 0) {
        if (onCompleteScrub) onCompleteScrub();
        return;
      }
      e.preventDefault();
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
      setIsAnyScrubbing(true);
      setActiveInput(id);

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
        setIsAnyScrubbing(false);
        setActiveInput(null);
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

  const inputBase = "no-spin w-full bg-transparent text-[28px] leading-none font-semibold tracking-tight outline-none transition-colors duration-300";
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
        className="fixed inset-0 z-[9999] flex items-center justify-center p-[12px] bg-[#010614]/95 selection:bg-[#00d0ff]/30 font-sans"
        onPointerDown={(e) => {
          if (document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
          }
          setActiveInput(null);
        }}
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
            0% { box-shadow: 0 4px 20px rgba(var(--focus-rgb), 0.2), inset 0 0 10px rgba(var(--focus-rgb), 0.1); }
            50% { box-shadow: 0 8px 50px rgba(var(--focus-rgb), 0.6), inset 0 0 30px rgba(var(--focus-rgb), 0.4); }
            100% { box-shadow: 0 4px 20px rgba(var(--focus-rgb), 0.2), inset 0 0 10px rgba(var(--focus-rgb), 0.1); }
          }
          @keyframes morphBg {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>

        {/* Ambient Mesh Background (Optimized) */}
        <motion.div
          animate={{ opacity: step === 2 ? 0.7 : 0.5 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0 pointer-events-none overflow-hidden mix-blend-screen"
        >
          <div
            className="absolute inset-[-50%] bg-[length:100%_100%]"
            style={{
              background: `radial-gradient(circle at 20% 30%, rgba(${hex2rgb(themeColor)}, 0.15) 0%, transparent 60%), radial-gradient(circle at 80% 70%, rgba(${hex2rgb(MACRO_COLORS.protein)}, 0.1) 0%, transparent 60%)`,
            }}
          />
        </motion.div>

        {/* Ambient Noise Overlay (Optimized) */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: isAnyScrubbing ? 0.98 : 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="relative w-full max-w-[340px] bg-[#000000]/90 backdrop-blur-3xl rounded-[32px] p-[24px] shadow-[0_30px_100px_rgba(0,0,0,0.9),_inset_0_1px_1px_rgba(255,255,255,0.08)] mx-auto z-10 overflow-hidden"
          style={{ border: `1px solid rgba(255,255,255,0.08)` }}
        >
          {/* Glass Grain Texture (Optimized) */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
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
                <span className="text-[10px] font-[700] tracking-[0.1em] uppercase text-white/50">
                  Complete your profile
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.h2
                  key={step}
                  initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                  transition={{ duration: 0.2 }}
                  className="text-[32px] font-bold text-white tracking-tight leading-none drop-shadow-sm"
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

                  <CardBox id="age" activeInput={activeInput} setActiveInput={setActiveInput} onScrub={createScrubber('age', age, setAge, 12, 120)} label="Age" icon={User} isError={!!errs.age} errorMsg={errs.age} shakeKey={shakeKey}>
                    <input type="number" value={age} onChange={e => setAge(e.target.value)} onPointerDown={e => e.stopPropagation()} onFocus={() => setActiveInput('age')} onBlur={() => setActiveInput(null)} className={`${getInpClass(errs.age)} pointer-events-auto`} style={{ '--focus-color': MACRO_COLORS.brand }} placeholder="25" />
                  </CardBox>

                  <CardBox id="weight" activeInput={activeInput} setActiveInput={setActiveInput} onScrub={createScrubber('weight', weight, setWeight, 30, 300)} label="Weight" icon={Scale} isError={!!errs.weight} errorMsg={errs.weight} shakeKey={shakeKey}>
                    <div className="flex items-baseline gap-[4px] pointer-events-auto">
                      <input type="number" value={weight} onChange={e => setWeight(e.target.value)} onPointerDown={e => e.stopPropagation()} onFocus={() => setActiveInput('weight')} onBlur={() => setActiveInput(null)} className={getInpClass(errs.weight)} style={{ '--focus-color': MACRO_COLORS.brand }} placeholder="75" />
                      <span className={`text-[13px] font-medium uppercase tracking-widest transition-colors ${errs.weight ? 'text-[#ef4444]' : 'text-white/40'}`}>KG</span>
                    </div>
                  </CardBox>

                  <CardBox id="height" activeInput={activeInput} setActiveInput={setActiveInput} colSpan={2} label="Height" icon={Ruler} isError={!!errs.heightCm || !!errs.heightFt || !!errs.heightIn} errorMsg={errs.heightCm || errs.heightFt || errs.heightIn} shakeKey={shakeKey} rightElement={
                    <div className="flex bg-black/40 rounded-full p-[2px] border border-white/[0.04] shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
                      <button type="button" onClick={() => { triggerHaptic(10); setHeightUnit('ft'); }} className={`relative text-[9.5px] font-[800] tracking-widest px-[10px] py-[4px] rounded-full transition-colors z-10 ${heightUnit === 'ft' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}>
                        {heightUnit === 'ft' && <motion.div layoutId="height-pill" transition={{ type: "spring", stiffness: 400, damping: 30 }} className="absolute inset-0 bg-[#2c2c2e] rounded-full -z-10 shadow-[0_1px_2px_rgba(0,0,0,0.3),_inset_0_1px_1px_rgba(255,255,255,0.08)] border border-white/10" />}
                        FT
                      </button>
                      <button type="button" onClick={() => { triggerHaptic(10); setHeightUnit('cm'); }} className={`relative text-[9.5px] font-[800] tracking-widest px-[10px] py-[4px] rounded-full transition-colors z-10 ${heightUnit === 'cm' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}>
                        {heightUnit === 'cm' && <motion.div layoutId="height-pill" transition={{ type: "spring", stiffness: 400, damping: 30 }} className="absolute inset-0 bg-[#2c2c2e] rounded-full -z-10 shadow-[0_1px_2px_rgba(0,0,0,0.3),_inset_0_1px_1px_rgba(255,255,255,0.08)] border border-white/10" />}
                        CM
                      </button>
                    </div>
                  }>
                    {heightUnit === 'cm' ? (
                      <div className="flex items-baseline gap-[4px] justify-center mt-[4px] pointer-events-auto">
                        <input type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} onPointerDown={e => e.stopPropagation()} onFocus={() => setActiveInput('height')} onBlur={() => setActiveInput(null)} className={`${getInpClass(errs.heightCm)} text-center`} style={{ '--focus-color': MACRO_COLORS.brand }} placeholder="175" />
                        <span className={`text-[13px] font-medium uppercase tracking-widest transition-colors ${errs.heightCm ? 'text-[#ef4444]' : 'text-white/40'}`}>CM</span>
                      </div>
                    ) : (
                      <div className="flex items-baseline justify-center mt-[4px] pointer-events-auto">
                        <input type="number" value={heightFt} onChange={e => setHeightFt(e.target.value)} onPointerDown={e => e.stopPropagation()} onFocus={() => setActiveInput('height')} onBlur={() => setActiveInput(null)} className={`${getInpClass(errs.heightFt)} w-[40px] text-center`} style={{ '--focus-color': MACRO_COLORS.brand }} placeholder="5" />
                        <span className={`text-[20px] font-medium ml-[2px] mr-[8px] transition-colors ${errs.heightFt ? 'text-[#ef4444]' : 'text-white/40'}`}>'</span>
                        <input type="number" value={heightIn} onChange={e => setHeightIn(e.target.value)} onPointerDown={e => e.stopPropagation()} onFocus={() => setActiveInput('height')} onBlur={() => setActiveInput(null)} className={`${getInpClass(errs.heightIn)} w-[44px] text-center`} style={{ '--focus-color': MACRO_COLORS.brand }} placeholder="10" />
                        <span className={`text-[20px] font-medium ml-[2px] transition-colors ${errs.heightIn ? 'text-[#ef4444]' : 'text-white/40'}`}>"</span>
                      </div>
                    )}
                  </CardBox>

                  <CardBox id="protein" activeInput={activeInput} setActiveInput={setActiveInput} focusHex={MACRO_COLORS.protein} onScrub={createScrubber('protein', proteinBudget, setProteinBudget, 30, 400)} label="Protein" icon={Flame} isError={!!errs.protein} errorMsg={errs.protein} shakeKey={shakeKey}>
                    <div className="flex items-baseline gap-[4px] pointer-events-auto">
                      <input type="number" value={proteinBudget} onChange={e => setProteinBudget(e.target.value)} onPointerDown={e => e.stopPropagation()} onFocus={() => setActiveInput('protein')} onBlur={() => setActiveInput(null)} className={getInpClass(errs.protein)} style={{ '--focus-color': MACRO_COLORS.protein }} placeholder="150" />
                      <span className={`text-[13px] font-medium uppercase tracking-widest transition-colors ${errs.protein ? 'text-[#ef4444]' : 'text-white/40'}`}>G</span>
                    </div>
                  </CardBox>

                  <CardBox id="bodyfat" activeInput={activeInput} setActiveInput={setActiveInput} focusHex={MACRO_COLORS.fat} onScrub={createScrubber('bodyfat', bodyFat, setBodyFat, 3, 60)} label="Body Fat" icon={Activity} isError={!!errs.bodyFat} errorMsg={errs.bodyFat} shakeKey={shakeKey}>
                    <div className="flex items-baseline gap-[4px] pointer-events-auto">
                      <input type="number" value={bodyFat} onChange={e => setBodyFat(e.target.value)} onPointerDown={e => e.stopPropagation()} onFocus={() => setActiveInput('bodyfat')} onBlur={() => setActiveInput(null)} className={getInpClass(errs.bodyFat)} style={{ '--focus-color': MACRO_COLORS.fat }} placeholder="15" />
                      <span className={`text-[13px] font-medium uppercase tracking-widest transition-colors ${errs.bodyFat ? 'text-[#ef4444]' : 'text-white/40'}`}>%</span>
                    </div>
                  </CardBox>

                  <CardBox id="gender" activeInput={activeInput} setActiveInput={setActiveInput} colSpan={2} label="Biological Sex" icon={User} isError={showErrors && !gender} shakeKey={shakeKey}>
                    <div className="flex w-full p-[2px] mt-[6px] bg-black/40 rounded-[10px] border border-white/[0.04] shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] pointer-events-auto">
                      {['M', 'F', 'O'].map(g => {
                        const isActive = gender === g.toLowerCase();
                        return (
                          <motion.button key={g} type="button" whileTap={{ scale: 0.9 }} onClick={() => { triggerHaptic(15); setGender(g.toLowerCase()); }}
                            className="relative flex-1 h-[40px] rounded-[8px] text-[14px] font-semibold outline-none z-10 transition-colors duration-300"
                            style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.4)' }}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="gender-pill"
                                transition={springConfig}
                                className="absolute inset-0 bg-[#2c2c2e] rounded-[8px] z-[-1] shadow-[0_1px_2px_rgba(0,0,0,0.3),_inset_0_1px_1px_rgba(255,255,255,0.08)] border border-white/10"
                              />
                            )}
                            <span className="relative z-10">{g === 'M' ? 'Male' : g === 'F' ? 'Female' : 'Other'}</span>
                          </motion.button>
                        )
                      })}
                    </div>
                  </CardBox>

                  <CardBox id="workouts" activeInput={activeInput} setActiveInput={setActiveInput} colSpan={2} label="Workouts / Wk" icon={CalendarDays}>
                    <div className="flex justify-between w-full mt-[12px] relative p-[2px] bg-black/40 rounded-[14px] border border-white/[0.04] shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] pointer-events-auto">
                      {[1, 2, 3, 4, 5, 6, 7].map(d => {
                        const isActive = workoutDays === d;
                        return (
                          <motion.button key={d} type="button" whileTap={{ scale: 0.85 }} onClick={() => { triggerHaptic(15); setWorkoutDays(d); }}
                            className="relative z-10 w-[36px] h-[36px] rounded-[12px] text-[15px] font-semibold flex items-center justify-center outline-none transition-colors duration-300 hover:text-white/70"
                            style={{ 
                              color: isActive ? '#ffffff' : 'rgba(255,255,255,0.4)',
                            }}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="workout-pill"
                                transition={springConfig}
                                className="absolute inset-0 bg-[#2c2c2e] rounded-[12px] z-[-1] shadow-[0_1px_2px_rgba(0,0,0,0.3),_inset_0_1px_1px_rgba(255,255,255,0.08)] border border-white/10"
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
                    color: step1Valid ? '#020617' : 'rgba(255,255,255,0.2)',
                    borderColor: step1Valid ? 'transparent' : (showErrors ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.05)')
                  }}
                  transition={{ duration: 0.3 }}
                  className={`w-full h-[54px] mt-[8px] rounded-[18px] font-semibold text-[17px] tracking-wide flex items-center justify-center gap-[6px] border outline-none shadow-sm transition-shadow ${step1Valid ? 'shadow-[0_4px_20px_rgba(var(--theme-rgb),0.3)]' : ''}`}
                  style={{ '--theme-rgb': hex2rgb(themeColor) }}
                >
                  <span className="relative z-10">Continue</span>
                  <ArrowRight size={18} strokeWidth={2.5} className="relative z-10" />
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
                          background: isActive ? `linear-gradient(135deg, rgba(${hex2rgb(opt.color)},0.15), rgba(${hex2rgb(opt.color)},0.05))` : 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                          borderColor: isActive ? `rgba(${hex2rgb(opt.color)},0.5)` : 'rgba(255,255,255,0.05)',
                        }}
                        transition={springConfig}
                        className={`relative w-full flex items-center p-[12px] rounded-[16px] outline-none border transition-shadow duration-300 ${isActive ? 'shadow-[0_4px_20px_rgba(var(--focus-rgb),0.15)] z-10' : 'shadow-sm'}`}
                        style={{ '--focus-rgb': hex2rgb(opt.color) }}
                      >
                        <motion.span animate={{ scale: isActive ? 1.05 : 1, filter: isActive ? 'grayscale(0%)' : 'grayscale(100%) opacity(60%)' }} className="text-[24px] mr-[14px] relative z-10 transition-all duration-300">{opt.emoji}</motion.span>
                        <div className="flex flex-col text-left relative z-10">
                          <motion.span animate={{ color: isActive ? opt.color : '#ffffff' }} className="text-[16px] font-semibold mb-[2px] leading-tight transition-colors duration-300">{opt.label}</motion.span>
                          <span className="text-[12px] font-medium leading-none text-white/40">{opt.sub}</span>
                        </div>

                        <motion.div
                          animate={{
                            borderColor: isActive ? opt.color : 'rgba(255,255,255,0.1)',
                            background: isActive ? opt.color : 'transparent',
                            scale: isActive ? 1 : 0.9,
                          }}
                          className="ml-auto w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center relative z-10 transition-all duration-300"
                        >
                          {isActive && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={fastSpring} className="w-[8px] h-[8px] rounded-full bg-[#000000]" />}
                        </motion.div>
                      </motion.button>
                    )
                  })}
                </motion.div>

                <div className="grid grid-cols-2 gap-[8px]">
                  <CardBox id="goalweight" activeInput={activeInput} setActiveInput={setActiveInput} onScrub={createScrubber('goalweight', goalWeight, setGoalWeight, 30, 300)} label="Goal Wt" icon={Scale} isError={!!errs.goalWeight} errorMsg={errs.goalWeight} shakeKey={shakeKey}>
                    <div className="flex items-baseline gap-[4px] pointer-events-auto">
                      <input type="number" value={goalWeight} onChange={e => setGoalWeight(e.target.value)} onPointerDown={e => e.stopPropagation()} onFocus={() => setActiveInput('goalweight')} onBlur={() => setActiveInput(null)} className={getInpClass(errs.goalWeight)} style={{ '--focus-color': MACRO_COLORS.brand }} placeholder="70" />
                      <span className={`text-[13px] font-medium uppercase tracking-widest transition-colors ${errs.goalWeight ? 'text-[#ef4444]' : 'text-white/40'}`}>KG</span>
                    </div>
                  </CardBox>

                  <CardBox id="goalbodyfat" activeInput={activeInput} setActiveInput={setActiveInput} focusHex={MACRO_COLORS.fat} onScrub={createScrubber('goalbodyfat', goalBodyFat, setGoalBodyFat, 4, 50)} label="Body Fat" icon={Activity} isError={!!errs.goalFat} errorMsg={errs.goalFat} shakeKey={shakeKey}>
                    <div className="flex items-baseline gap-[4px] pointer-events-auto">
                      <input type="number" value={goalBodyFat} onChange={e => setGoalBodyFat(e.target.value)} onPointerDown={e => e.stopPropagation()} onFocus={() => setActiveInput('goalbodyfat')} onBlur={() => setActiveInput(null)} className={getInpClass(errs.goalFat)} style={{ '--focus-color': MACRO_COLORS.fat }} placeholder="15" />
                      <span className={`text-[13px] font-medium uppercase tracking-widest transition-colors ${errs.goalFat ? 'text-[#ef4444]' : 'text-white/40'}`}>%</span>
                    </div>
                  </CardBox>
                </div>

                <CardBox id="timeline" activeInput={activeInput} setActiveInput={setActiveInput} focusHex={themeColor} colSpan={2} className="!items-center !justify-center !p-[14px] group/timeline relative" label="Timeline" icon={CalendarDays} onScrub={createScrubber('timeline', goalPeriod, setGoalPeriod, currLimit.min, currLimit.max, currLimit.step)}>

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

                        <input
                          type="number" value={goalPeriod}
                          onChange={(e) => {
                            if (e.target.value === "") setGoalPeriod("");
                            else setGoalPeriod(parseInt(e.target.value, 10));
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          onFocus={() => setActiveInput && setActiveInput('timeline')}
                          onBlur={() => {
                            setActiveInput && setActiveInput(null);
                            let val = parseInt(goalPeriod, 10);
                            if (isNaN(val) || val < currLimit.min) val = currLimit.min;
                            if (val > currLimit.max) val = currLimit.max;
                            setGoalPeriod(val);
                          }}
                          className="no-spin w-[70px] bg-transparent text-center text-[36px] font-[800] text-white tabular-nums tracking-tighter leading-none outline-none relative z-10 selection:bg-white/20 transition-colors focus:text-white pointer-events-auto"
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

                <motion.div variants={cardVariants} className="flex gap-[10px] mt-[8px]">
                  <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={() => goToStep(1)}
                    className="w-[54px] h-[54px] shrink-0 rounded-[18px] bg-[#121214] border border-white/5 text-white/50 flex items-center justify-center outline-none shadow-sm transition-colors hover:text-white/80">
                    <ArrowLeft size={22} strokeWidth={2.5} />
                  </motion.button>

                  <motion.button type="button" whileTap={{ scale: 0.96 }} onClick={() => { if (!step2Valid) { setShowErrors(true); setShakeKey(prev => prev + 1); } else { handleFinish(); } }}
                    animate={{
                      backgroundColor: step2Valid && !saving ? themeColor : 'rgba(255,255,255,0.02)',
                      color: step2Valid && !saving ? '#020617' : 'rgba(255,255,255,0.2)',
                      borderColor: step2Valid && !saving ? 'transparent' : (showErrors ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.05)')
                    }}
                    transition={{ duration: 0.3 }}
                    className={`flex-1 h-[54px] rounded-[18px] font-semibold text-[17px] tracking-wide flex items-center justify-center gap-[6px] border outline-none shadow-sm transition-shadow ${step2Valid && !saving ? 'shadow-[0_4px_20px_rgba(var(--theme-rgb),0.3)]' : ''}`}
                    style={{ '--theme-rgb': hex2rgb(themeColor) }}
                  >
                    {saving ? <Loader2 size={22} className="animate-spin text-[#020617] relative z-10" /> : <>
                      <span className="relative z-10">Finish Setup</span>
                      <ChevronRight size={20} strokeWidth={2.5} className="relative z-10" />
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
