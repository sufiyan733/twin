import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

async function getUserId(req) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user?.id ?? null;
}

// GET /api/meals — returns current meals for the logged-in user
export async function GET(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await getDb();
    const doc = await db.collection("meals").findOne({ userId });

    return NextResponse.json({
      meals: doc?.meals ?? [],
      lastResetAt: doc?.lastResetAt ?? null,
    });
  } catch (err) {
    console.error("GET /api/meals error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/meals — save current meals list and/or lastResetAt
export async function PUT(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { meals, lastResetAt } = body;

    const db = await getDb();
    await db.collection("meals").updateOne(
      { userId },
      {
        $set: {
          ...(meals !== undefined && { meals }),
          ...(lastResetAt !== undefined && { lastResetAt }),
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /api/meals error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/meals — archive today's meals snapshot before reset
export async function POST(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { meals, date } = body;

    const db = await getDb();

    // Archive the daily snapshot
    await db.collection("meal_history").insertOne({
      userId,
      date: date ?? new Date().toISOString().split("T")[0],
      meals,
      archivedAt: new Date(),
    });

    // Reset the live meals list to empty
    await db.collection("meals").updateOne(
      { userId },
      { $set: { meals: [], lastResetAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/meals (archive) error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
