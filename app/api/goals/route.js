import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

async function getUserId(req) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user?.id ?? null;
}

// GET /api/goals — returns all custom goals for the logged-in user
export async function GET(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await getDb();
    const doc = await db.collection("goals").findOne({ userId });

    return NextResponse.json({ goals: doc?.goals ?? [] });
  } catch (err) {
    console.error("GET /api/goals error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/goals — upsert the full goals array
export async function PUT(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { goals } = body;

    const db = await getDb();
    await db.collection("goals").updateOne(
      { userId },
      {
        $set: {
          ...(goals !== undefined && { goals }),
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /api/goals error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
