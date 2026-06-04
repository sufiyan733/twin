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

export async function GET(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const profile = await db.collection("profiles").findOne({ userId });

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
    } = body;

    const profileData = {
      userId,
      age: Number(age) || 0,
      gender: gender || "",
      weight: Number(weight) || 0,
      height: Number(height) || 0,
      workoutDays: Number(workoutDays) || 0,
      proteinBudget: Number(proteinBudget) || 0,
      trainingField: trainingField || "",
      goalWeight: Number(goalWeight) || 0,
      goalBodyFat: Number(goalBodyFat) || 0,
      goalPeriod: Number(goalPeriod) || 0,
      goalPeriodUnit: goalPeriodUnit || "months",
      updatedAt: new Date(),
    };

    const db = await getDb();
    await db.collection("profiles").updateOne(
      { userId },
      { $set: profileData },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /api/profile error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
