import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

async function getUserId(req) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user?.id ?? null;
}

// ── Helpers ──────────────────────────────────────────────

function computeExerciseStats(sets) {
  let totalVolume = 0;
  let bestVolume = 0;
  let bestSet = null;
  let totalWeight = 0;
  let totalReps = 0;

  for (const s of sets) {
    const vol = s.weight * s.reps;
    totalVolume += vol;
    totalWeight += s.weight;
    totalReps += s.reps;

    if (vol > bestVolume) {
      bestVolume = vol;
      bestSet = { weight: s.weight, reps: s.reps };
    }
  }

  const count = sets.length;
  const avgSet = {
    weight: Math.round((totalWeight / count) * 100) / 100,
    reps: Math.round((totalReps / count) * 100) / 100,
  };

  return { totalVolume, bestSet, avgSet };
}

// ── POST /api/workout/sessions ───────────────────────────
// Save a completed workout session
export async function POST(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { exercises, startedAt, date } = body;

    // Validate payload
    if (!Array.isArray(exercises) || exercises.length === 0) {
      return NextResponse.json(
        { error: "No completed exercises to save" },
        { status: 400 }
      );
    }

    // Process and validate each exercise server-side
    const processedExercises = [];
    let sessionTotalVolume = 0;
    let sessionTotalSets = 0;
    const musclesWorked = new Set();

    for (const ex of exercises) {
      if (!ex.name || !Array.isArray(ex.sets) || ex.sets.length === 0) {
        continue;
      }

      // Parse and validate sets
      const validSets = [];
      for (let i = 0; i < ex.sets.length; i++) {
        const s = ex.sets[i];
        const weight = parseFloat(s.weight);
        const reps = parseInt(s.reps, 10);

        if (isNaN(weight) || weight <= 0 || isNaN(reps) || reps <= 0) {
          continue;
        }

        validSets.push({
          setNumber: i + 1,
          weight,
          reps,
        });
      }

      if (validSets.length === 0) continue;

      const stats = computeExerciseStats(validSets);

      processedExercises.push({
        name: String(ex.name),
        muscle: String(ex.muscle || "unknown"),
        equipment: String(ex.equipment || "unknown"),
        sets: validSets,
        totalVolume: stats.totalVolume,
        bestSet: stats.bestSet,
        avgSet: stats.avgSet,
      });

      sessionTotalVolume += stats.totalVolume;
      sessionTotalSets += validSets.length;
      if (ex.muscle) musclesWorked.add(ex.muscle);
    }

    if (processedExercises.length === 0) {
      return NextResponse.json(
        { error: "No valid exercises with completed sets" },
        { status: 400 }
      );
    }

    const now = new Date();
    const sessionStarted = startedAt ? new Date(startedAt) : now;
    const durationMs = now.getTime() - sessionStarted.getTime();

    const session = {
      userId,
      date: date || new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now),
      startedAt: sessionStarted,
      finishedAt: now,
      durationMs: Math.max(0, durationMs),
      exercises: processedExercises,
      summary: {
        totalExercises: processedExercises.length,
        totalSets: sessionTotalSets,
        totalVolume: sessionTotalVolume,
        musclesWorked: [...musclesWorked],
      },
      createdAt: now,
    };

    const db = await getDb();
    const result = await db.collection("workout_sessions").insertOne(session);

    // ── Update per-user exercise catalog (efficient O(1) lookup for /progress) ──
    // Group new exercise names by muscle and add them to the catalog set.
    const catalogSetOps = {};
    for (const ex of processedExercises) {
      const muscle = ex.muscle || "unknown";
      if (!catalogSetOps[`exercises.${muscle}`]) {
        catalogSetOps[`exercises.${muscle}`] = { $each: [] };
      }
      catalogSetOps[`exercises.${muscle}`].$each.push(ex.name);
    }
    if (Object.keys(catalogSetOps).length > 0) {
      await db.collection("user_exercise_catalog").updateOne(
        { userId },
        { $addToSet: catalogSetOps, $set: { updatedAt: now } },
        { upsert: true }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: result.insertedId,
      summary: session.summary,
    });

  } catch (err) {
    console.error("POST /api/workout/sessions error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── GET /api/workout/sessions ────────────────────────────
// Fetch user's workout history for analytics/progress
export async function GET(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);
    const from = searchParams.get("from"); // YYYY-MM-DD
    const to = searchParams.get("to");     // YYYY-MM-DD

    const query = { userId };
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = from;
      if (to) query.date.$lte = to;
    }

    const db = await getDb();
    const sessions = await db
      .collection("workout_sessions")
      .find(query)
      .sort({ finishedAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({ sessions });
  } catch (err) {
    console.error("GET /api/workout/sessions error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
