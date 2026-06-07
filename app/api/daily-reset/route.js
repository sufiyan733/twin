import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

async function getUserId(req) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user?.id ?? null;
}

function parseDate(value) {
  const parsed = value ? new Date(value) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// POST /api/daily-reset — archive meals first, then clear the due daily state.
export async function POST(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const resetAt = parseDate(body.resetAt);
    const date = body.date || formatDate(resetAt);
    const meals = Array.isArray(body.meals) ? body.meals : [];
    const resetTasks = body.resetTasks !== false;
    const resetMeals = body.resetMeals !== false;

    const db = await getDb();

    if (resetMeals && meals.length > 0) {
      await db.collection("meal_history").updateOne(
        { userId, date },
        {
          $set: {
            meals,
            archivedAt: resetAt,
            updatedAt: resetAt,
          },
          $setOnInsert: {
            userId,
            date,
            createdAt: resetAt,
          },
        },
        { upsert: true }
      );
    }

    const writes = [];
    if (resetMeals) {
      writes.push(
        db.collection("meals").updateOne(
          { userId },
          { $set: { meals: [], lastResetAt: resetAt, updatedAt: resetAt } },
          { upsert: true }
        )
      );
    }
    if (resetTasks) {
      writes.push(
        db.collection("tasks").updateOne(
          { userId },
          { $set: { tasks: [], lastResetAt: resetAt, updatedAt: resetAt } },
          { upsert: true }
        )
      );
    }

    await Promise.all(writes);

    return NextResponse.json({ success: true, resetAt: resetAt.toISOString() });
  } catch (err) {
    console.error("POST /api/daily-reset error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
