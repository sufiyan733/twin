import { getAuth } from "@/lib/auth"
import { getMessages, saveMessage } from "@/lib/chat"
import { headers } from "next/headers"

export async function GET(request) {
  const auth = getAuth()
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const roomId = searchParams.get("roomId")
  const before = searchParams.get("before")

  if (!roomId) return Response.json({ error: "roomId required" }, { status: 400 })

  const messages = await getMessages({ roomId, before: before ? new Date(before) : undefined })
  return Response.json({ messages })
}

export async function POST(request) {
  const auth = getAuth()
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { roomId, receiverId, text } = await request.json()
  
  if (!roomId || !receiverId || !text) {
    return Response.json({ error: "roomId, receiverId, and text required" }, { status: 400 })
  }
  
  const message = await saveMessage({
    roomId,
    senderId: session.user.id,
    receiverId,
    text,
  })
  
  return Response.json({ message })
}
