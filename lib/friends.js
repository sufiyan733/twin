import { getDb } from "./mongodb"

// Get the relationship status between two users
// Returns: "none" | "pending_sent" | "pending_received" | "accepted"
export async function getFriendStatus(currentUserId, otherUserId) {
  const db = await getDb()
  const req = await db.collection("friendRequests").findOne({
    $or: [
      { senderId: currentUserId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: currentUserId },
    ],
  })
  if (!req) return "none"
  if (req.status === "accepted") return "accepted"
  if (req.senderId === currentUserId) return "pending_sent"
  return "pending_received"
}

// Send a friend request
export async function sendFriendRequest(senderId, receiverId) {
  const db = await getDb()
  const now = new Date()
  await db.collection("friendRequests").insertOne({
    senderId,
    receiverId,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  })
}

// Accept a friend request
// Only the receiverId can accept
export async function acceptFriendRequest(currentUserId, senderId) {
  const db = await getDb()
  await db.collection("friendRequests").updateOne(
    { senderId, receiverId: currentUserId, status: "pending" },
    { $set: { status: "accepted", updatedAt: new Date() } }
  )
}

// Get all accepted friends for a user (returns array of the OTHER user's ids)
export async function getAcceptedFriendIds(userId) {
  const db = await getDb()
  const requests = await db.collection("friendRequests").find({
    $or: [{ senderId: userId }, { receiverId: userId }],
    status: "accepted",
  }).toArray()

  return requests.map((r) =>
    r.senderId === userId ? r.receiverId : r.senderId
  )
}

// Get all pending requests RECEIVED by this user (for showing "Accept" UI)
export async function getPendingReceivedRequests(userId) {
  const db = await getDb()
  return db.collection("friendRequests").find({
    receiverId: userId,
    status: "pending",
  }).toArray()
}

// Get all pending requests SENT by this user (for showing "Pending" UI)
export async function getPendingSentRequests(userId) {
  const db = await getDb()
  return db.collection("friendRequests").find({
    senderId: userId,
    status: "pending",
  }).toArray()
}
