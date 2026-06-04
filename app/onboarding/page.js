"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  ArrowRight, ArrowLeft, Loader2, User, Weight,
  Ruler, Calendar, Zap, Target, Clock, Dumbbell, Sparkles
} from "lucide-react";

const TRAINING_OPTIONS = [
  { key: "hypertrophy", label: "Hypertrophy", sub: "Physique Building", emoji: "💪" },
  { key: "calisthenics", label: "Calisthenics", sub: "Bodyweight Mastery", emoji: "🤸" },
  { key: "powerlifting", label: "Powerlifting", sub: "Raw Strength", emoji: "🏋️" },
];

const GENDER_OPTIONS = ["Male", "Female", "Other"];

function FieldLabel({ children }) {
  return (
    <label className="block text-[10px] font-bold text-white/40 tracking-widest uppercase mb-1.5">
      {children}
    </label>
  );
}

function StyledInput({ icon: Icon, ...props }) {
  return (
    <div className="flex items-center gap-2.5 rounded-[14px] bg-[#07112c] border border-[#00d0ff]/15 px-4 py-3 focus-within:border-[#00d0ff]/50 focus-within:shadow-[0_0_20px_rgba(0,208,255,0.12)] transition-all duration-300">
      {Icon && <Icon size={15} className="text-[#00d0ff]/60 shrink-0" />}
      <input
        {...props}
        className="flex-1 bg-transparent text-[14px] text-white placeholder:text-white/20 outline-none"
      />
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [step, setStep] = useState(1); // 1 or 2
  const [saving, setSaving] = useState(false);
  const [animDir, setAnimDir] = useState("forward"); // for slide direction

  // Step 1 fields
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [workoutDays, setWorkoutDays] = useState(3);
  const [proteinBudget, setProteinBudget] = useState("");

  // Step 2 fields
  const [trainingField, setTrainingField] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [goalPeriod, setGoalPeriod] = useState(12);

  // Auth guard — if no session, go to login
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
    if (!age || !gender || !weight || !height || !proteinBudget) return;
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
          age, gender, weight, height, workoutDays, proteinBudget,
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

  return (
    <div className="relative h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden bg-[#010614]">
      {/* Background radials */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.18),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(0,208,255,0.1),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative w-full max-w-[380px] px-4 flex flex-col">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-[52px] w-[52px] rounded-[18px] bg-[#030818] border border-[#00d0ff]/30 shadow-[0_0_30px_rgba(0,208,255,0.25)] mb-3 mx-auto">
            <Sparkles size={24} className="text-[#00d0ff] drop-shadow-[0_0_8px_#00d0ff]" />
          </div>
          <h1 className="text-[22px] font-bold tracking-tight text-white mb-1">
            {step === 1 ? "Tell us about you" : "Set your goals"}
          </h1>
          <p className="text-[12px] text-white/40">
            {step === 1 ? "So Kai can personalize your experience" : "What are you training for?"}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 1 ? "w-8 bg-[#00d0ff] shadow-[0_0_8px_#00d0ff]" : "w-4 bg-white/20"}`} />
          <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 2 ? "w-8 bg-[#00d0ff] shadow-[0_0_8px_#00d0ff]" : "w-4 bg-white/20"}`} />
        </div>

        {/* Card */}
        <div className="relative overflow-hidden rounded-[24px] border border-[#00d0ff]/20 bg-[#030818] p-5 shadow-[0_0_50px_rgba(0,150,255,0.12)] backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,208,255,0.07),transparent_65%)] pointer-events-none" />

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="relative z-10 space-y-3">

              {/* Age + Gender row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Age</FieldLabel>
                  <StyledInput
                    icon={User}
                    type="number"
                    min={10}
                    max={100}
                    placeholder="25"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel>Gender</FieldLabel>
                  <div className="flex gap-1">
                    {GENDER_OPTIONS.map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g.toLowerCase())}
                        className={`flex-1 py-2.5 rounded-[12px] text-[11px] font-semibold transition-all duration-200 border ${
                          gender === g.toLowerCase()
                            ? "bg-[#00d0ff]/20 border-[#00d0ff]/60 text-[#00d0ff] shadow-[0_0_12px_rgba(0,208,255,0.3)]"
                            : "bg-[#07112c] border-[#00d0ff]/10 text-white/40 hover:text-white/70"
                        }`}
                      >
                        {g[0]}
                      </button>
                    ))}
                  </div>
                  {gender && (
                    <p className="text-[10px] text-white/30 mt-1 capitalize">{gender}</p>
                  )}
                </div>
              </div>

              {/* Weight + Height row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Weight (kg)</FieldLabel>
                  <StyledInput
                    icon={Weight}
                    type="number"
                    min={30}
                    max={300}
                    placeholder="75"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel>Height (cm)</FieldLabel>
                  <StyledInput
                    icon={Ruler}
                    type="number"
                    min={100}
                    max={250}
                    placeholder="175"
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                  />
                </div>
              </div>

              {/* Workout Days */}
              <div>
                <FieldLabel>Workout Days / Week</FieldLabel>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setWorkoutDays(d)}
                      className={`flex-1 py-2.5 rounded-[10px] text-[12px] font-bold transition-all duration-200 border ${
                        workoutDays === d
                          ? "bg-[#00d0ff]/20 border-[#00d0ff]/60 text-[#00d0ff] shadow-[0_0_10px_rgba(0,208,255,0.25)]"
                          : "bg-[#07112c] border-[#00d0ff]/10 text-white/35 hover:text-white/60"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Protein Budget */}
              <div>
                <FieldLabel>Daily Protein Budget (g)</FieldLabel>
                <StyledInput
                  icon={Zap}
                  type="number"
                  min={30}
                  max={500}
                  placeholder="150"
                  value={proteinBudget}
                  onChange={e => setProteinBudget(e.target.value)}
                />
              </div>

              {/* Next button */}
              <button
                type="button"
                onClick={goNext}
                disabled={!step1Valid}
                className="w-full flex items-center justify-center gap-2 rounded-[14px] bg-[#00d0ff] text-[#020617] text-[14px] font-bold py-3.5 mt-1 shadow-[0_0_25px_rgba(0,208,255,0.4)] hover:shadow-[0_0_35px_rgba(0,208,255,0.65)] transition-all duration-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                Next <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="relative z-10 space-y-4">

              {/* Training Field */}
              <div>
                <FieldLabel>Training Focus</FieldLabel>
                <div className="flex flex-col gap-2">
                  {TRAINING_OPTIONS.map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setTrainingField(opt.key)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-[14px] border transition-all duration-200 text-left ${
                        trainingField === opt.key
                          ? "bg-[#00d0ff]/15 border-[#00d0ff]/60 shadow-[0_0_20px_rgba(0,208,255,0.2)]"
                          : "bg-[#07112c] border-[#00d0ff]/10 hover:border-[#00d0ff]/30"
                      }`}
                    >
                      <span className="text-[22px] leading-none">{opt.emoji}</span>
                      <div>
                        <p className={`text-[13px] font-semibold transition-colors ${trainingField === opt.key ? "text-[#00d0ff]" : "text-white/80"}`}>
                          {opt.label}
                        </p>
                        <p className="text-[10px] text-white/35">{opt.sub}</p>
                      </div>
                      <div className={`ml-auto h-4 w-4 rounded-full border-2 transition-all ${
                        trainingField === opt.key ? "border-[#00d0ff] bg-[#00d0ff] shadow-[0_0_8px_#00d0ff]" : "border-white/20"
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal Weight + Period row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Goal Weight (kg)</FieldLabel>
                  <StyledInput
                    icon={Target}
                    type="number"
                    min={30}
                    max={300}
                    placeholder="70"
                    value={goalWeight}
                    onChange={e => setGoalWeight(e.target.value)}
                  />
                </div>
                <div>
                  <FieldLabel>Time Period</FieldLabel>
                  <div className="rounded-[14px] bg-[#07112c] border border-[#00d0ff]/15 px-4 py-3 text-center focus-within:border-[#00d0ff]/50 transition-all">
                    <span className="text-[18px] font-bold text-[#00d0ff]">{goalPeriod}</span>
                    <span className="text-[11px] text-white/40 ml-1">wks</span>
                  </div>
                </div>
              </div>

              {/* Period slider */}
              <div>
                <input
                  type="range"
                  min={4}
                  max={52}
                  step={2}
                  value={goalPeriod}
                  onChange={e => setGoalPeriod(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #00d0ff ${((goalPeriod - 4) / 48) * 100}%, #07112c ${((goalPeriod - 4) / 48) * 100}%)`
                  }}
                />
                <div className="flex justify-between text-[10px] text-white/25 mt-1">
                  <span>4 wks</span>
                  <span>52 wks</span>
                </div>
              </div>

              {/* Buttons row */}
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={goBack}
                  className="flex items-center justify-center gap-1 px-4 py-3 rounded-[14px] bg-white/[0.04] border border-white/[0.06] text-white/60 text-[13px] font-semibold hover:bg-white/[0.08] transition-all"
                >
                  <ArrowLeft size={15} /> Back
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={!step2Valid || saving}
                  className="flex-1 flex items-center justify-center gap-2 rounded-[14px] bg-[#00d0ff] text-[#020617] text-[14px] font-bold py-3 shadow-[0_0_25px_rgba(0,208,255,0.4)] hover:shadow-[0_0_35px_rgba(0,208,255,0.65)] transition-all duration-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <><Sparkles size={15} /> Let's Go!</>}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-white/15 mt-5">
          Twin — Your Personal Wellness Companion
        </p>
      </div>
    </div>
  );
}
