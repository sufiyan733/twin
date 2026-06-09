import { getDb } from "./mongodb"

export async function saveMessage({ roomId, senderId, receiverId, text }) {
  const db = await getDb()
  const now = new Date()
  
  const message = {
    roomId,
    senderId,
    receiverId,
    text,
    createdAt: now,
    readAt: null
  }
  
  const result = await db.collection("messages").insertOne(message)
  return { ...message, _id: result.insertedId.toString() }
}

export async function getMessages({ roomId, limit = 50, before }) {
  const db = await getDb()
  
  const query = { roomId }
  if (before) {
    query.createdAt = { $lt: before }
  }
  
  const messages = await db.collection("messages")
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
    
  return messages.reverse().map(m => ({ ...m, _id: m._id.toString() }))
}

export async function markRead({ roomId, userId }) {
  const db = await getDb()
  const now = new Date()
  
  await db.collection("messages").updateMany(
    { roomId, receiverId: userId, readAt: null },
    { $set: { readAt: now } }
  )
}
