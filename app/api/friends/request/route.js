import { getAuth } from "@/lib/auth"
import { headers } from "next/headers"
import { sendFriendRequest, getFriendStatus } from "@/lib/friends"

export async function POST(request) {
  const auth = getAuth()
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { receiverId } = await request.json()
  if (!receiverId) return Response.json({ error: "receiverId required" }, { status: 400 })
  if (receiverId === session.user.id) {
    return Response.json({ error: "Cannot add yourself" }, { status: 400 })
  }

  const status = await getFriendStatus(session.user.id, receiverId)
  if (status !== "none") {
    return Response.json({ error: "Request already exists" }, { status: 409 })
  }

  await sendFriendRequest(session.user.id, receiverId)
  return Response.json({ success: true })
}
