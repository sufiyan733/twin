import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function GET(req) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: req.headers });
    const currentUserId = session?.user?.id;

    const db = await getDb();
    
    // Fetch current user's profile to get friendIds array
    let currentUserFriendIds = [];
    if (currentUserId) {
      const currentUserProfile = await db.collection("profiles").findOne({ userId: currentUserId });
      currentUserFriendIds = currentUserProfile?.friendIds || [];
    }

    // Fetch users (exclude current user, NO LIMIT)
    const query = currentUserId ? { _id: { $ne: currentUserId } } : {};
    const users = await db.collection("user").find(query).toArray();

    const friendsData = await Promise.all(users.map(async (u) => {
      const uId = u._id?.toString() || u.id;
      const profile = await db.collection("profiles").findOne({ userId: uId });
      const mealDoc = await db.collection("meals").findOne({ userId: uId });
      
      const meals = mealDoc?.meals || [];
      const consumed = meals.reduce((acc, m) => {
        acc.protein += Number(m.protein || 0);
        acc.carbs += Number(m.carbs || 0);
        acc.fats += Number(m.fat || 0);
        acc.calories += Number(m.calories || 0);
        return acc;
      }, { protein: 0, carbs: 0, fats: 0, calories: 0 });

      // Calculate default target macros based on calories if not fully customized
      const calorieTarget = profile?.calorieTarget || 2000;
      const proteinTarget = profile?.proteinBudget || 150;
      
      const isFriend = currentUserFriendIds.includes(uId);

      return {
        id: uId,
        name: u.name || "Unknown User",
        image: u.image,
        isFriend,
        calorieTarget,
        macros: {
          protein: proteinTarget,
          carbs: 200,
          fats: 60
        },
        consumed
      };
    }));

    return NextResponse.json({ friends: friendsData });
  } catch (err) {
    console.error("GET /api/friends error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
