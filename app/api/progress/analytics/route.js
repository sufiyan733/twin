import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

async function getUserId(req) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user?.id ?? null;
}

// Format a date string (YYYY-MM-DD) → short display label e.g. "APR 10"
function formatDateLabel(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d
    .toLocaleDateString("en-US", { month: "short", day: "numeric" })
    .toUpperCase();
}

// GET /api/progress/analytics?exercise=Flat+Barbell+Bench+Press
// Returns PR and AVG weight series over time for a specific exercise.
// PR series  = best single-set weight per session date
// AVG series = average weight across all sets per session date
export async function GET(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const exerciseName = searchParams.get("exercise");

    if (!exerciseName || exerciseName.trim() === "") {
      return NextResponse.json({ error: "exercise query param required" }, { status: 400 });
    }

    const db = await getDb();

    // Aggregate sessions containing the requested exercise
    const pipeline = [
      // 1. Only sessions belonging to this user that include the exercise
      {
        $match: {
          userId,
          "exercises.name": exerciseName,
        },
      },
      // 2. Keep only the date and the exercises array
      {
        $project: {
          date: 1,
          exercises: {
            $filter: {
              input: "$exercises",
              as: "ex",
              cond: { $eq: ["$$ex.name", exerciseName] },
            },
          },
        },
      },
      // 3. Unwind to one doc per matching exercise entry (usually 1 per session)
      { $unwind: "$exercises" },
      // 4. Unwind the sets so we can compute per-set stats
      { $unwind: "$exercises.sets" },
      // 5. Group by date — compute best (PR) and avg weight
      {
        $group: {
          _id: "$date",
          prWeight: { $max: "$exercises.sets.weight" },
          prReps: { $first: "$exercises.sets.reps" }, // reps at best weight (approx)
          avgWeight: { $avg: "$exercises.sets.weight" },
          avgReps: { $avg: "$exercises.sets.reps" },
          totalSets: { $sum: 1 },
        },
      },
      // 6. Sort chronologically
      { $sort: { _id: 1 } },
      // 7. Limit to the 20 most recent unique session dates
      { $limit: 20 },
    ];

    const rows = await db.collection("workout_sessions").aggregate(pipeline).toArray();

    // Find the reps that correspond to the PR weight for each date using a second pass
    // (We need a richer approach: for the PR date, pick the set with max weight and grab its reps)
    const prRepsPipeline = [
      {
        $match: {
          userId,
          "exercises.name": exerciseName,
        },
      },
      { $project: { date: 1, exercises: { $filter: { input: "$exercises", as: "ex", cond: { $eq: ["$$ex.name", exerciseName] } } } } },
      { $unwind: "$exercises" },
      { $unwind: "$exercises.sets" },
      {
        $group: {
          _id: { date: "$date", weight: "$exercises.sets.weight" },
          reps: { $first: "$exercises.sets.reps" },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          prWeight: { $max: "$_id.weight" },
          allSets: { $push: { weight: "$_id.weight", reps: "$reps" } },
        },
      },
    ];

    const prRows = await db.collection("workout_sessions").aggregate(prRepsPipeline).toArray();
    const prRepsMap = {};
    for (const row of prRows) {
      const match = row.allSets.find((s) => s.weight === row.prWeight);
      prRepsMap[row._id] = { weight: row.prWeight, reps: match?.reps ?? 0 };
    }

    // Build the two series
    const pr = rows.map((r) => ({
      date: formatDateLabel(r._id),
      weight: Math.round(prRepsMap[r._id]?.weight ?? r.prWeight),
      reps: Math.round(prRepsMap[r._id]?.reps ?? r.prReps),
    }));

    const avg = rows.map((r) => ({
      date: formatDateLabel(r._id),
      weight: Math.round(r.avgWeight * 10) / 10,
      reps: Math.round(r.avgReps),
    }));

    return NextResponse.json({ pr, avg });
  } catch (err) {
    console.error("GET /api/progress/analytics error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
