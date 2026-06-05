import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

async function getUserId(req) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user?.id ?? null;
}

// GET /api/workout/exercises — returns the user's saved exercise selections
export async function GET(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await getDb();
    const doc = await db.collection("workout_exercises").findOne({ userId });

    return NextResponse.json({ selections: doc?.selections ?? null });
  } catch (err) {
    console.error("GET /api/workout/exercises error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/workout/exercises — upsert the user's exercise selections
export async function PUT(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { selections } = await req.json();
    if (!selections || typeof selections !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const db = await getDb();
    await db.collection("workout_exercises").updateOne(
      { userId },
      { $set: { selections, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /api/workout/exercises error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
