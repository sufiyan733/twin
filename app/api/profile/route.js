import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { cookies } from "next/headers";

async function getUserId(req) {
  const auth = getAuth();
  const cookieStore = await cookies();
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  return session?.user?.id ?? null;
}

// ─── Calorie Target Calculation ──────────────────────────────────────────────
// Uses Mifflin-St Jeor BMR × activity multiplier (TDEE).
// Triggered on first save, or when weight / bodyFat changes.
function calculateCalorieTarget({ weight, height, age, gender, workoutDays }) {
  const w = Number(weight) || 0;
  const h = Number(height) || 0;
  const a = Number(age) || 0;
  const d = Number(workoutDays) || 3;

  if (!w || !h || !a) return null; // can't calculate without basics

  let bmr;
  if (gender === "male") {
    bmr = 10 * w + 6.25 * h - 5 * a + 5;
  } else if (gender === "female") {
    bmr = 10 * w + 6.25 * h - 5 * a - 161;
  } else {
    // "other" — average of both formulas
    const maleBmr = 10 * w + 6.25 * h - 5 * a + 5;
    const femaleBmr = 10 * w + 6.25 * h - 5 * a - 161;
    bmr = (maleBmr + femaleBmr) / 2;
  }

  // Activity multiplier based on workout days per week
  let multiplier;
  if (d <= 2) multiplier = 1.375;       // light activity
  else if (d <= 4) multiplier = 1.55;   // moderate activity
  else if (d <= 6) multiplier = 1.725;  // active
  else multiplier = 1.9;                // very active (7 days)

  return Math.round(bmr * multiplier);
}

export async function GET(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    let profile = await db.collection("profiles").findOne({ userId });

    // Auto-fix: if profile exists but calorieTarget was never calculated
    // (e.g. profiles created before this feature), compute and persist it now.
    if (profile && (profile.calorieTarget === null || profile.calorieTarget === undefined)) {
      const calorieTarget = calculateCalorieTarget({
        weight: profile.weight,
        height: profile.height,
        age: profile.age,
        gender: profile.gender,
        workoutDays: profile.workoutDays,
      });
      if (calorieTarget) {
        await db.collection("profiles").updateOne(
          { userId },
          { $set: { calorieTarget } }
        );
        profile = { ...profile, calorieTarget };
      }
    }

    return NextResponse.json({ profile: profile ?? null });
  } catch (err) {
    console.error("GET /api/profile error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      age, gender, weight, height, workoutDays, proteinBudget,
      trainingField, goalWeight, goalBodyFat, goalPeriod, goalPeriodUnit,
      bodyFat, calorieTarget: formCalorieTarget,
    } = body;

    const db = await getDb();

    // Fetch existing profile to check if weight/bodyFat changed
    const existing = await db.collection("profiles").findOne({ userId });

    // Determine if we should recalculate calorie target:
    // - Always recalculate on first save (no existing profile)
    // - Recalculate when weight OR current bodyFat % changes
    const newWeight = Number(weight) || 0;
    const newBodyFat = Number(bodyFat) || 0;
    const shouldRecalculate =
      !existing ||
      newWeight !== (existing.weight || 0) ||
      newBodyFat !== (existing.bodyFat || 0) ||
      existing.calorieTarget === null ||
      existing.calorieTarget === undefined;

    let calorieTarget = existing?.calorieTarget ?? null;
    const manualTarget = Number(formCalorieTarget);

    if (manualTarget && manualTarget !== existing?.calorieTarget) {
      // User explicitly changed the calorie target manually in the UI
      calorieTarget = manualTarget;
    } else if (shouldRecalculate && !manualTarget) {
      // If no manual override is provided, calculate automatically
      calorieTarget = calculateCalorieTarget({ weight, height, age, gender, workoutDays });
    }

    const profileData = {
      userId,
      age: Number(age) || 0,
      gender: gender || "",
      weight: newWeight,
      height: Number(height) || 0,
      workoutDays: Number(workoutDays) || 0,
      proteinBudget: Number(proteinBudget) || 0,
      trainingField: trainingField || "",
      goalWeight: Number(goalWeight) || 0,
      goalBodyFat: Number(goalBodyFat) || 0,
      goalPeriod: Number(goalPeriod) || 0,
      goalPeriodUnit: goalPeriodUnit || "months",
      bodyFat: newBodyFat,
      calorieTarget,
      updatedAt: new Date(),
    };

    await db.collection("profiles").updateOne(
      { userId },
      { $set: profileData },
      { upsert: true }
    );

    return NextResponse.json({ success: true, calorieTarget });
  } catch (err) {
    console.error("PUT /api/profile error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
