import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

async function getUserId(req) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user?.id ?? null;
}

// GET /api/tasks — returns tasks + settings for the logged-in user
export async function GET(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await getDb();
    const doc = await db.collection("tasks").findOne({ userId });

    return NextResponse.json({
      tasks: doc?.tasks ?? [],
      resetTime: doc?.resetTime ?? "00:00",     // default midnight
      lastResetAt: doc?.lastResetAt ?? null,
    });
  } catch (err) {
    console.error("GET /api/tasks error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/tasks — save tasks list + optional resetTime setting
export async function PUT(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { tasks, resetTime, lastResetAt } = body;

    const db = await getDb();
    await db.collection("tasks").updateOne(
      { userId },
      {
        $set: {
          ...(tasks !== undefined && { tasks }),
          ...(resetTime !== undefined && { resetTime }),
          ...(lastResetAt !== undefined && { lastResetAt }),
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /api/tasks error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/tasks/archive — called BEFORE reset, saves today's snapshot to history
export async function POST(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { tasks, date } = body;

    const db = await getDb();

    // Save a daily snapshot
    await db.collection("task_history").insertOne({
      userId,
      date: date ?? new Date().toISOString().split("T")[0],
      tasks,
      archivedAt: new Date(),
    });

    // Reset all tasks to unchecked in main tasks collection
    const existing = await db.collection("tasks").findOne({ userId });
    if (existing?.tasks) {
      const resetTasks = existing.tasks.map((t) => ({ ...t, checked: false }));
      await db.collection("tasks").updateOne(
        { userId },
        { $set: { tasks: resetTasks, lastResetAt: new Date() } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/tasks (archive) error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
