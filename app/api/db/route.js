import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = await getDb();
    const result = await db.command({ ping: 1 });

    return Response.json({
      connected: result.ok === 1,
      db: db.databaseName,
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);

    return Response.json(
      {
        connected: false,
        error: "MongoDB connection failed.",
      },
      { status: 500 }
    );
  }
}
