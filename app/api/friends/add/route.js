import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function POST(req) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: req.headers });
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { friendId } = await req.json();

    if (!friendId) {
      return NextResponse.json({ error: "Friend ID required" }, { status: 400 });
    }

    const db = await getDb();

    // Add friendId to current user's friendIds array
    await db.collection("profiles").updateOne(
      { userId: currentUserId },
      { $addToSet: { friendIds: friendId } },
      { upsert: true }
    );

    // Add current user's ID to friend's friendIds array (mutual friendship)
    await db.collection("profiles").updateOne(
      { userId: friendId },
      { $addToSet: { friendIds: currentUserId } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/friends/add error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
