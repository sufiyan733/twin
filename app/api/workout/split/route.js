import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

async function getUserId(req) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user?.id ?? null;
}

// GET /api/workout/split — returns the user's saved weekly split
export async function GET(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await getDb();
    const doc = await db.collection("workout_split").findOne({ userId });

    return NextResponse.json({ days: doc?.days ?? null });
  } catch (err) {
    console.error("GET /api/workout/split error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/workout/split — upsert the user's weekly split
export async function PUT(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { days } = await req.json();
    if (!Array.isArray(days) || days.length !== 7) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const db = await getDb();
    await db.collection("workout_split").updateOne(
      { userId },
      { $set: { days, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /api/workout/split error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
