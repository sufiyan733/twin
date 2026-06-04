import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

async function getUserId(req) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user?.id ?? null;
}

// GET /api/tasks/history — returns past daily logs for this user
export async function GET(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await getDb();
    const history = await db
      .collection("task_history")
      .find({ userId })
      .sort({ archivedAt: -1 })
      .limit(30) // last 30 days
      .toArray();

    return NextResponse.json({ history });
  } catch (err) {
    console.error("GET /api/tasks/history error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
