"use client";

import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import {
  X, Pencil, Save, Loader2, User, Weight, Ruler, Calendar, Zap,
  Target, Clock, Activity, Sparkles, Check, Mail, Shield, AtSign, Flame, LogOut,
} from "lucide-react";

const TRAINING_OPTIONS = [
  { key: "hypertrophy", label: "Hypertrophy", emoji: "💪" },
  { key: "calisthenics", label: "Calisthenics", emoji: "🤸" },
  { key: "powerlifting", label: "Powerlifting", emoji: "🏋️" },
];

const GENDER_OPTIONS = ["male", "female", "other"];


// ── Theme tokens (goal image palette)
const T = {
  bg: "rgba(0, 0, 0, 0.85)",
  card: "linear-gradient(180deg, rgba(28,30,35,0.95) 0%, rgba(12,14,18,0.98) 100%)",
  cardAlt: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
  border: "rgba(255,255,255,0.06)",
  accent: "#ffffff",
  textPrimary: "#ffffff",
  textMuted: "#a1a1aa",
  textFaint: "#52525b",
};

// ─── Client-side calorie calculation (mirrors backend formula) ─────────────
// Used as an instant fallback if the DB value is missing.
function calcCalorieTarget({ weight, height, age, gender, workoutDays }) {
  const w = Number(weight) || 0;
  const h = Number(height) || 0;
  const a = Number(age) || 0;
  const d = Number(workoutDays) || 3;
  if (!w || !h || !a || !gender) return null;

  let bmr;
  if (gender === "male") {
    bmr = 10 * w + 6.25 * h - 5 * a + 5;
  } else if (gender === "female") {
    bmr = 10 * w + 6.25 * h - 5 * a - 161;
  } else {
    bmr = 10 * w + 6.25 * h - 5 * a - 78; // average of male/female
  }
  const multiplier = d <= 2 ? 1.375 : d <= 4 ? 1.55 : d <= 6 ? 1.725 : 1.9;
  return Math.round(bmr * multiplier);
}

// ─── Height unit conversion helpers ───────────────────────────────────────
function cmToFtIn(cm) {
  const totalInches = Math.round(cm / 2.54);
  const ft = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return { ft, inches };
}

function ftInToCm(ft, inches) {
  return Math.round((Number(ft || 0) * 12 + Number(inches || 0)) * 2.54);
}

// ─── Dual-unit Height field ────────────────────────────────────────────────
// View: shows both cm and ft'in" on one tile.
// Edit: two linked inputs — changing either auto-converts the other.
function HeightField({ valueCm, onChangeCm, editing }) {
  const cm = Number(valueCm) || 0;
  const { ft, inches } = cm ? cmToFtIn(cm) : { ft: "", inches: "" };

  // Local ft/in state so we don't snap mid-typing
  const [localFt, setLocalFt] = useState(ft.toString());
  const [localIn, setLocalIn] = useState(inches.toString());

  // Sync local ft/in whenever cm changes from outside (e.g. on load)
  useEffect(() => {
    if (!cm) { setLocalFt(""); setLocalIn(""); return; }
    const { ft: f, inches: i } = cmToFtIn(cm);
    setLocalFt(f.toString());
    setLocalIn(i.toString());
  }, [cm]);

  const handleCmChange = (raw) => {
    onChangeCm(raw);             // cm → parent (source of truth)
    if (raw) {
      const { ft: f, inches: i } = cmToFtIn(Number(raw));
      setLocalFt(f.toString());
      setLocalIn(i.toString());
    } else {
      setLocalFt(""); setLocalIn("");
    }
  };

  const handleFtChange = (raw) => {
    setLocalFt(raw);
    const newCm = ftInToCm(raw, localIn);
    if (newCm > 0) onChangeCm(newCm.toString());
  };

  const handleInChange = (raw) => {
    // clamp 0-11
    const clamped = Math.min(11, Math.max(0, Number(raw) || 0));
    setLocalIn(clamped.toString());
    const newCm = ftInToCm(localFt, clamped);
    if (newCm > 0) onChangeCm(newCm.toString());
  };

  if (editing) {
    return (
      <div className="flex flex-col gap-1.5 col-span-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40 ml-1">Height</span>
        <div className="grid grid-cols-2 gap-2">
          {/* cm input */}
          <div className="flex items-center gap-2 rounded-2xl px-3 py-2.5 focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.15)] transition-all" style={{ background: T.cardAlt, border: `1px solid ${T.border}` }}>
            <Ruler size={14} className="text-white/60 shrink-0" />
            <input
              type="number"
              min={100}
              max={250}
              value={valueCm}
              onChange={(e) => handleCmChange(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none w-0"
              placeholder="cm"
            />
            <span className="text-[11px] font-medium text-white/30 shrink-0">cm</span>
          </div>
          {/* ft + in inputs */}
          <div className="flex items-center gap-1.5 rounded-2xl bg-black/40 border border-white/5 px-3 py-2.5 focus-within:border-white/40 focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.15)] transition-all">
            <Ruler size={14} className="text-white/60 shrink-0" />
            <input
              type="number"
              min={3}
              max={8}
              value={localFt}
              onChange={(e) => handleFtChange(e.target.value)}
              className="w-7 bg-transparent text-sm text-white placeholder-white/20 outline-none text-center"
              placeholder="ft"
            />
            <span className="text-[11px] font-medium text-white/30">ft</span>
            <input
              type="number"
              min={0}
              max={11}
              value={localIn}
              onChange={(e) => handleInChange(e.target.value)}
              className="w-7 bg-transparent text-sm text-white placeholder-white/20 outline-none text-center"
              placeholder="in"
            />
            <span className="text-[11px] font-medium text-white/30">in</span>
          </div>
        </div>
        <p className="text-[9px] text-white/20 ml-1">Editing either unit updates the other automatically</p>
      </div>
    );
  }

  // View mode — single tile showing both units
  const ftInStr = cm ? `${ft}'${inches}"` : null;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40 ml-1">Height</span>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl" style={{ background: T.cardAlt, border: `1px solid ${T.border}` }}>
        <Ruler size={14} className="text-white/40 shrink-0" />
        <span className="flex-1 text-sm font-medium" style={{ color: T.textPrimary }}>
          {cm ? cm : <span className="text-white/30 italic">Not set</span>}
        </span>
        {cm ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-medium text-white/30">cm</span>
            <span className="text-white/10">·</span>
            <span className="text-[11px] font-semibold text-white/60">{ftInStr}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}


function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Avatar & name */}
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-black/40" />
        <div className="space-y-2 flex-1">
          <div className="h-5 w-32 rounded-lg bg-black/40" />
          <div className="h-3.5 w-20 rounded-lg bg-black/40" />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/[0.06]" />

      {/* Personal Info */}
      <div className="space-y-3">
        <div className="h-3 w-20 rounded bg-black/40" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-12 rounded-xl bg-black/40" />
          <div className="h-12 rounded-xl bg-black/40" />
          <div className="h-12 rounded-xl bg-black/40" />
          <div className="h-12 rounded-xl bg-black/40" />
        </div>
      </div>

      <div className="h-px bg-white/[0.06]" />

      {/* Training */}
      <div className="space-y-3">
        <div className="h-3 w-24 rounded bg-black/40" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-12 rounded-xl bg-black/40" />
          <div className="h-12 rounded-xl bg-black/40" />
        </div>
        <div className="h-16 rounded-xl bg-black/40" />
      </div>

      <div className="h-px bg-white/[0.06]" />

      {/* Goals */}
      <div className="space-y-3">
        <div className="h-3 w-16 rounded bg-black/40" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-12 rounded-xl bg-black/40" />
          <div className="h-12 rounded-xl bg-black/40" />
        </div>
        <div className="h-16 rounded-xl bg-black/40" />
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------
// Reusable field component – read‑only display in view mode, input in edit mode
// --------------------------------------------------------------------------------
function FieldDisplay({ icon: Icon, label, value, unit, onChange, type = "text", min, max, editing }) {
  if (editing) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] ml-1" style={{ color: T.textMuted }}>
          {label}
        </span>
        <div className="flex items-center gap-2 rounded-2xl bg-black/40 border border-white/5 px-3 py-2.5 focus-within:border-white/40 focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.15)] transition-all">
          {Icon && <Icon size={14} className="shrink-0" style={{ color: T.accent }} />}
          <input
            autoFocus
            type={type}
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-transparent text-sm placeholder-white/20 outline-none" style={{ color: T.textPrimary }}
            placeholder="—"
          />
          {unit && <span className="text-[11px] font-medium shrink-0" style={{ color: T.textMuted }}>{unit}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] ml-1" style={{ color: T.textMuted }}>
        {label}
      </span>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.02]">
        {Icon && <Icon size={14} className="shrink-0" style={{ color: T.accent }} />}
        <span className="flex-1 text-sm font-medium text-white/90">
          {value || <span className="italic text-white/30">Not set</span>}
        </span>
        {unit && value && <span className="text-[11px] font-medium" style={{ color: T.textMuted }}>{unit}</span>}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------
// Calorie Target Field — Auto-calculated but manually editable
// --------------------------------------------------------------------------------
function CalorieTargetField({ value, onChange, editing }) {
  const hasValue = value && value > 0;

  if (editing) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 ml-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60">
            Daily Calorie Target
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 bg-black/40  px-1.5 py-0.5 rounded-full">
            Manual Override
          </span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl   focus-within:border-white/30 focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.1)] transition-all">
          <Flame size={15} className="text-white/90/60 shrink-0" />
          <input
            type="number"
            min={500}
            max={10000}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none font-bold"
            placeholder="e.g. 2500"
          />
          <span className="text-[11px] font-medium text-white/30 shrink-0">kcal / day</span>
        </div>
        <p className="text-[9px] text-white/25 ml-1">
          Set manually, or leave blank to auto-calculate based on stats
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 ml-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60">
          Daily Calorie Target
        </span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 bg-black/40 border border-white/10 px-1.5 py-0.5 rounded-full">
          Auto
        </span>
      </div>
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white/[0.03] border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.03)]">
        <Flame size={15} className="text-white/60 shrink-0 drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]" />
        {hasValue ? (
          <>
            <span className="flex-1 text-sm font-bold text-white">
              {Number(value).toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-white/40 shrink-0">kcal / day</span>
          </>
        ) : (
          <span className="flex-1 text-sm text-white/20 italic">
            Complete your profile to calculate
          </span>
        )}
      </div>
      <p className="text-[9px] text-white/25 ml-1">
        Recalculates automatically when weight or body fat changes
      </p>
    </div>
  );
}

// --------------------------------------------------------------------------------
// Main Profile Card
// --------------------------------------------------------------------------------
export default function ProfileCard({ isOpen, onClose }) {
  const { data: session } = authClient.useSession();

  // Data & UI states
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [calorieTarget, setCalorieTarget] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authClient.signOut();
      onClose();
      window.location.href = "/";
    } catch (e) {
      console.error(e);
      setLoggingOut(false);
    }
  };

  // Editable form values – independent from profile until save
  const [form, setForm] = useState({
    name: "",
    username: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    bodyFat: "",
    workoutDays: 3,
    proteinBudget: "",
    trainingField: "",
    goalWeight: "",
    goalBodyFat: "",
    goalPeriod: 3,
    goalPeriodUnit: "months",
    calorieTarget: "",
  });

  // Store a snapshot to detect unsaved changes
  const [initialForm, setInitialForm] = useState({ ...form });

  // Fetch profile when card opens
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setShowSuccess(false);
    setSaving(false);
    setIsEditing(false);
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        const p = data.profile;
        const newForm = {
          name: session?.user?.name || "",
          username: session?.user?.username || session?.user?.name?.replace(/\s/g, "").toLowerCase() || "",
          age: p?.age?.toString() || "",
          gender: p?.gender || "",
          weight: p?.weight?.toString() || "",
          height: p?.height?.toString() || "",
          bodyFat: p?.bodyFat?.toString() || "",
          workoutDays: p?.workoutDays || 3,
          proteinBudget: p?.proteinBudget?.toString() || "",
          trainingField: p?.trainingField || "",
          goalWeight: p?.goalWeight?.toString() || "",
          goalBodyFat: p?.goalBodyFat?.toString() || "",
          goalPeriod: p?.goalPeriod || 3,
          goalPeriodUnit: p?.goalPeriodUnit || "months",
          calorieTarget: "", // we populate this below
        };
        setProfile(p);

        // Use DB value if present; otherwise calculate client-side as instant fallback
        let target = p?.calorieTarget ?? null;
        if (!target && p) {
          target = calcCalorieTarget({
            weight: p.weight,
            height: p.height,
            age: p.age,
            gender: p.gender,
            workoutDays: p.workoutDays,
          });
          // Silently persist so next load comes from DB directly
          if (target) {
            fetch("/api/profile", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...newForm, calorieTarget: target }),
            }).catch(() => { });
          }
        }
        setCalorieTarget(target);
        newForm.calorieTarget = target?.toString() || "";
        setForm(newForm);
        setInitialForm(newForm);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen]);

  // Unsaved changes detection
  const hasChanges = useCallback(() => {
    return JSON.stringify(form) !== JSON.stringify(initialForm);
  }, [form, initialForm]);

  // ─── Edit mode toggle ────────────────────────────────────────────
  const handleEdit = () => {
    setInitialForm({ ...form });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (hasChanges()) {
      setShowDiscardDialog(true);
    } else {
      setIsEditing(false);
      setForm({ ...initialForm });
    }
  };

  const confirmDiscard = () => {
    setShowDiscardDialog(false);
    setIsEditing(false);
    setForm({ ...initialForm });
  };

  // ─── Save handler ────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      if (form.name !== initialForm.name || form.username !== initialForm.username) {
        await authClient.updateUser({
          name: form.name,
          username: form.username,
        });
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      // Update displayed calorie target if backend returned a new one
      if (data.calorieTarget !== undefined) {
        setCalorieTarget(data.calorieTarget);
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setIsEditing(false);
        setInitialForm({ ...form });
      }, 1800);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // ─── Close card (with unsaved changes guard) ───────────────────
  const handleClose = () => {
    if (isEditing && hasChanges()) {
      setShowDiscardDialog(true);
      return;
    }
    onClose();
  };

  // ─── Helper: limits for goal timeline slider ──────────────────
  const periodLimits = {
    months: { min: 1, max: 24, step: 1, label: "mos" },
    weeks: { min: 1, max: 52, step: 1, label: "wks" },
    days: { min: 7, max: 365, step: 7, label: "days" },
  };
  const currLimit = periodLimits[form.goalPeriodUnit] || periodLimits.months;

  const initials = session?.user?.name
    ? session.user.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
    : "??";

  const email = session?.user?.email;
  const username = session?.user?.username || session?.user?.name?.replace(/\s/g, "").toLowerCase();

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-[40px] saturate-50 animate-in fade-in duration-300"
        style={{ background: T.bg }}
        onClick={handleClose}
      />

      {/* Premium card – now uses flex column so the save bar never overlaps content */}
      <div className="relative w-full max-w-[400px] h-[85vh] max-h-[750px] rounded-3xl shadow-[0_40px_100px_-10px_rgba(0,0,0,1)] backdrop-blur-[24px] overflow-hidden transition-all duration-500 ease-out animate-in zoom-in-95 fade-in flex flex-col" style={{ background: T.card, border: `1px solid ${T.border}`, borderTop: "1px solid rgba(255,255,255,0.12)" }}>

        {/* Premium Noise Texture Overlay */}
        <div
          className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay opacity-[0.15]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />

        {/* Inner ambient glow */}
        <div className="absolute top-0 left-0 w-full h-44 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

        {/* ================================================================ */}
        {/*  DISCARD CONFIRMATION DIALOG (shown as overlay inside card)      */}
        {/* ================================================================ */}
        {showDiscardDialog && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#020617]/90 backdrop-blur-sm p-6 animate-in fade-in duration-150">
            <div className="w-full max-w-[280px] rounded-2xl p-6 shadow-2xl" style={{ background: T.card, border: `1px solid ${T.border}` }}>
              <p className="text-sm font-semibold text-white mb-1">Discard changes?</p>
              <p className="text-xs text-white/50 mb-5">
                You have unsaved edits. Are you sure you want to discard them?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDiscardDialog(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-black/40 text-white/70 hover:bg-white/10 transition-colors"
                >
                  Keep Editing
                </button>
                <button
                  onClick={confirmDiscard}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/*  SUCCESS OVERLAY (brief checkmark animation after save)         */}
        {/* ================================================================ */}
        {showSuccess && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#020617]/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="flex flex-col items-center gap-2 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <Check size={32} className="text-emerald-400" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-semibold text-emerald-300 tracking-wide">Saved!</span>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/*  CARD HEADER – Avatar, name, contact, edit & close buttons      */}
        {/* ================================================================ */}
        <div className="relative z-10 p-5 pb-2 shrink-0">
          <div className="flex items-start justify-between mb-5">
            {/* Left: Avatar + basic info */}
            <div className="flex items-center gap-4">
              {/* Gradient ring avatar */}
              <div className="relative shrink-0">
                <div className="h-[76px] w-[76px] rounded-full p-[2px]" style={{ background: `linear-gradient(145deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.2) 100%)`, boxShadow: `0 8px 32px rgba(0,0,0,0.8)` }}>
                  <div className="flex items-center justify-center h-full w-full rounded-full bg-[#020617] backdrop-blur-sm">
                    <span className="text-xl font-bold" style={{ color: T.textPrimary }}>{initials}</span>
                  </div>
                </div>
                {/* Status dot (green – indicates active) */}
                <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#020617] shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                {/* Verification badge (mock) */}
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-cyan-500 rounded-full border-2 border-[#020617] flex items-center justify-center shadow-[0_0_8px_rgba(255,255,255,0.6)]">
                  <Shield size={10} className="text-white" strokeWidth={3} />
                </span>
              </div>

              {/* Name, username, email */}
              {isEditing ? (
                <div className="flex flex-col gap-1.5 w-full max-w-[180px]">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="bg-black/40  rounded-lg px-2.5 py-1 text-sm font-semibold text-white outline-none focus:border-white/50 shadow-inner"
                    placeholder="Name"
                  />
                  <div className="relative">
                    <AtSign size={10} className="absolute left-2.5 top-1.5 text-white/70" />
                    <input
                      type="text"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, "") })}
                      className="bg-black/40  rounded-lg pl-6 pr-2.5 py-0.5 text-xs text-white/70 outline-none focus:border-white/50 w-full shadow-inner"
                      placeholder="Username"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-semibold text-white tracking-tight leading-tight">
                    {session?.user?.name || "Profile"}
                  </h2>
                  <p className="text-xs text-white/70 flex items-center gap-1 mt-1 font-medium">
                    <AtSign size={11} /> {username || "—"}
                  </p>
                </div>
              )}
            </div>

            {/* Right: Edit, Logout & Close buttons */}
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={handleClose}
                className="flex items-center justify-center h-9 w-9 rounded-full  border border-white/[0.06] text-white/60 hover:bg-white/10 hover:text-white transition-all active:scale-90"
                aria-label="Close profile"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm transition-all active:scale-95"
                  style={{ background: T.cardAlt, border: `1px solid ${T.border}`, color: T.textPrimary }}
                >
                  <Pencil size={13} /> Edit
                </button>
              )}
              {!isEditing && (
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loggingOut
                    ? <Loader2 size={12} className="animate-spin" />
                    : <LogOut size={12} />}
                  {loggingOut ? "Signing out…" : "Log Out"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/*  SCROLLABLE CONTENT                                              */}
        {/* ================================================================ */}
        <div className="flex-1 overflow-y-auto p-5 pt-0 space-y-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {loading ? (
            <SkeletonLoader />
          ) : (
            <>
              {/* ── Calorie Target ── */}
              <CalorieTargetField
                value={isEditing ? form.calorieTarget : calorieTarget}
                onChange={(v) => setForm({ ...form, calorieTarget: v })}
                editing={isEditing}
              />

              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Section: Personal Information */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-5 w-0.5 rounded-full" style={{ background: T.accent }} />
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/90" style={{ color: T.accent }}>
                    Personal Info
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FieldDisplay
                    label="Age"
                    icon={User}
                    value={form.age}
                    onChange={(v) => setForm({ ...form, age: v })}
                    type="number"
                    min={10}
                    max={100}
                    unit="yrs"
                    editing={isEditing}
                  />
                  {/* Gender selector */}
                  {isEditing ? (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40 ml-1">
                        Gender
                      </span>
                      <div className="flex gap-1.5 h-11">
                        {GENDER_OPTIONS.map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setForm({ ...form, gender: g })}
                            className={`flex-1 rounded-xl text-xs font-semibold border transition-all uppercase ${form.gender === g
                              ? "bg-white/20 border-white/50 text-white/90 shadow-[0_0_12px_rgba(255,255,255,0.2)]"
                              : "bg-white/[0.03] border-white/[0.05] text-white/40 hover:border-white/20"
                              }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40 ml-1">
                        Gender
                      </span>
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.02]">
                        <User size={14} className="text-white/40 shrink-0" />
                        <span className="flex-1 text-sm font-medium text-white/90 capitalize">
                          {form.gender || <span className="text-white/30 italic">Not set</span>}
                        </span>
                      </div>
                    </div>
                  )}
                  <FieldDisplay
                    label="Weight"
                    icon={Weight}
                    value={form.weight}
                    onChange={(v) => setForm({ ...form, weight: v })}
                    type="number"
                    min={30}
                    max={300}
                    unit="kg"
                    editing={isEditing}
                  />
                  <HeightField
                    valueCm={form.height}
                    onChangeCm={(v) => setForm({ ...form, height: v })}
                    editing={isEditing}
                  />
                  {/* Current Body Fat % */}
                  <FieldDisplay
                    label="Body Fat %"
                    icon={Activity}
                    value={form.bodyFat}
                    onChange={(v) => setForm({ ...form, bodyFat: v })}
                    type="number"
                    min={3}
                    max={60}
                    unit="%"
                    editing={isEditing}
                  />
                </div>
              </section>

              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Section: Training & Nutrition */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-5 w-0.5 rounded-full" style={{ background: T.accent }} />
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/90" style={{ color: T.accent }}>
                    Training & Nutrition
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <FieldDisplay
                    label="Workout Days/wk"
                    icon={Calendar}
                    value={form.workoutDays.toString()}
                    onChange={(v) => setForm({ ...form, workoutDays: Number(v) })}
                    type="number"
                    min={1}
                    max={7}
                    unit="days"
                    editing={isEditing}
                  />
                  <FieldDisplay
                    label="Protein Budget"
                    icon={Zap}
                    value={form.proteinBudget}
                    onChange={(v) => setForm({ ...form, proteinBudget: v })}
                    type="number"
                    min={30}
                    max={500}
                    unit="g/day"
                    editing={isEditing}
                  />
                </div>
                {/* Training Focus */}
                {isEditing ? (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40 ml-1">
                      Focus
                    </span>
                    <div className="flex gap-2">
                      {TRAINING_OPTIONS.map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setForm({ ...form, trainingField: opt.key })}
                          className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border transition-all ${form.trainingField === opt.key
                            ? "bg-white/15 border-white/50 shadow-[0_0_16px_rgba(255,255,255,0.15)]"
                            : " border-white/[0.04] hover:border-white/20"
                            }`}
                        >
                          <span className="text-xl">{opt.emoji}</span>
                          <span className={`text-[10px] font-bold ${form.trainingField === opt.key ? "text-white/90" : "text-white/40"}`}>
                            {opt.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.02]">
                    <Sparkles size={14} className="text-white/40 shrink-0" />
                    <span className="flex-1 text-sm font-medium text-white/90">
                      {form.trainingField
                        ? TRAINING_OPTIONS.find((o) => o.key === form.trainingField)?.label
                        : <span className="text-white/30 italic">Not set</span>}
                    </span>
                  </div>
                )}
              </section>

              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Section: Goals */}
              <section className="pb-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-5 w-0.5 rounded-full" style={{ background: T.accent }} />
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/90" style={{ color: T.accent }}>
                    Goals
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <FieldDisplay
                    label="Goal Weight"
                    icon={Target}
                    value={form.goalWeight}
                    onChange={(v) => setForm({ ...form, goalWeight: v })}
                    type="number"
                    min={30}
                    max={300}
                    unit="kg"
                    editing={isEditing}
                  />
                  <FieldDisplay
                    label="Goal Body Fat"
                    icon={Activity}
                    value={form.goalBodyFat}
                    onChange={(v) => setForm({ ...form, goalBodyFat: v })}
                    type="number"
                    min={5}
                    max={50}
                    unit="%"
                    editing={isEditing}
                  />
                </div>

                {/* Goal Timeline */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40 ml-1">
                    Timeline
                  </span>
                  {isEditing ? (
                    <>
                      {/* Unit selector */}
                      <div className="flex rounded-xl overflow-hidden  w-fit">
                        {["months", "weeks", "days"].map((u) => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => {
                              setForm((prev) => {
                                const newUnit = u;
                                let newPeriod = prev.goalPeriod;
                                if (u === "months") newPeriod = Math.min(24, Math.max(1, newPeriod));
                                if (u === "weeks") newPeriod = Math.min(52, Math.max(1, newPeriod));
                                if (u === "days") newPeriod = Math.min(365, Math.max(7, newPeriod));
                                return { ...prev, goalPeriodUnit: u, goalPeriod: newPeriod };
                              });
                            }}
                            className={`px-3 py-1.5 text-[11px] font-bold capitalize transition-colors ${form.goalPeriodUnit === u
                              ? "bg-cyan-500 text-[#020617]"
                              : " text-white/40 hover:text-white/60"
                              }`}
                          >
                            {u}
                          </button>
                        ))}
                      </div>

                      {/* Slider with custom thumb */}
                      <div className="px-1">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-white/90 w-8 text-right">{form.goalPeriod}</span>
                          <div className="relative flex-1 h-1.5">
                            <input
                              type="range"
                              min={currLimit.min}
                              max={currLimit.max}
                              step={currLimit.step}
                              value={form.goalPeriod}
                              onChange={(e) => setForm({ ...form, goalPeriod: Number(e.target.value) })}
                              className="absolute inset-0 w-full h-1.5 rounded-full appearance-none cursor-pointer"
                              style={{
                                background: `linear-gradient(to right, #00d0ff ${((form.goalPeriod - currLimit.min) / (currLimit.max - currLimit.min)) * 100}%, rgba(255,255,255,0.05) ${((form.goalPeriod - currLimit.min) / (currLimit.max - currLimit.min)) * 100}%)`,
                              }}
                            />
                            {/* Custom thumb representation (CSS hack) – works via browser default but added glow */}
                            <style jsx>{`
                              input[type="range"]::-webkit-slider-thumb {
                                -webkit-appearance: none;
                                appearance: none;
                                width: 18px;
                                height: 18px;
                                border-radius: 50%;
                                background: #00d0ff;
                                cursor: pointer;
                                box-shadow: 0 0 20px rgba(0, 208, 255, 0.5);
                                border: 2px solid #020617;
                              }
                              input[type="range"]::-moz-range-thumb {
                                width: 18px;
                                height: 18px;
                                border-radius: 50%;
                                background: #00d0ff;
                                cursor: pointer;
                                box-shadow: 0 0 20px rgba(0, 208, 255, 0.5);
                                border: 2px solid #020617;
                              }
                            `}</style>
                          </div>
                          <span className="text-xs font-medium text-white/30 w-10">{currLimit.label}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-white/25 mt-2 px-1">
                          <span>{currLimit.min}</span>
                          <span>{currLimit.max}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.02]">
                      <Clock size={14} className="text-white/40 shrink-0" />
                      <span className="text-sm font-medium text-white/90">
                        {form.goalPeriod} {currLimit.label}
                      </span>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>

        {/* ================================================================ */}
        {/*  STICKY SAVE BAR – slides in from bottom, never overlays content */}
        {/* ================================================================ */}
        <div
          className={`shrink-0 p-4 backdrop-blur-xl rounded-b-3xl transition-all duration-500 ease-out ${isEditing
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none absolute bottom-0 w-full"
            }`}
          style={{ background: T.card, borderTop: `1px solid ${T.border}` }}
        >
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2.5 text-sm font-semibold rounded-2xl shadow-lg transition-all active:scale-[0.97]"
              style={{ background: T.cardAlt, border: `1px solid ${T.border}`, color: T.textPrimary }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold rounded-2xl transition-all active:scale-[0.97] ${saving
                ? "cursor-wait opacity-50"
                : "shadow-lg"
                }`}
              style={{
                background: saving ? T.cardAlt : T.accent,
                color: saving ? T.textPrimary : "#000000",
                boxShadow: saving ? undefined : `0 0 25px ${T.accent}80`
              }}
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}