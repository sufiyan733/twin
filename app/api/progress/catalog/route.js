import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

const BODY_PARTS = ["chest", "back", "shoulders", "arms", "legs", "core"];

async function getUserId(req) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user?.id ?? null;
}

// GET /api/progress/catalog
// Returns the user's exercise catalog — all exercises they've ever logged, grouped by bodypart.
// Shape: { chest: [...], back: [...], shoulders: [...], arms: [...], legs: [...], core: [...] }
export async function GET(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const doc = await db.collection("user_exercise_catalog").findOne({ userId });

    // Normalise: always return all 6 bodypart keys, even if empty
    const catalog = {};
    for (const part of BODY_PARTS) {
      catalog[part] = doc?.exercises?.[part] ?? [];
    }

    return NextResponse.json({ catalog });
  } catch (err) {
    console.error("GET /api/progress/catalog error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
