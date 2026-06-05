import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

async function getUserId(req) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user?.id ?? null;
}

// GET /api/notes — all notes for the current user, sorted by updatedAt desc
export async function GET(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await getDb();
    const notes = await db
      .collection("notes")
      .find({ userId })
      .sort({ updatedAt: -1 })
      .toArray();

    // Strip MongoDB _id, keep our own id field
    return NextResponse.json({
      notes: notes.map(({ _id, ...n }) => n),
    });
  } catch (err) {
    console.error("GET /api/notes error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/notes — create a new note
export async function POST(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, title, body, starred, createdAt, updatedAt } = await req.json();

    const db = await getDb();
    await db.collection("notes").insertOne({
      userId,
      id,
      title: title || "Untitled",
      body: body || "",
      starred: starred ?? false,
      createdAt: createdAt || new Date().toISOString(),
      updatedAt: updatedAt || new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/notes error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/notes — update an existing note by id
export async function PUT(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, title, body, starred } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const db = await getDb();
    await db.collection("notes").updateOne(
      { userId, id },
      {
        $set: {
          ...(title !== undefined && { title }),
          ...(body !== undefined && { body }),
          ...(starred !== undefined && { starred }),
          updatedAt: new Date().toISOString(),
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /api/notes error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/notes?id=xxx — delete a note by id
export async function DELETE(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const db = await getDb();
    await db.collection("notes").deleteOne({ userId, id });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/notes error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
