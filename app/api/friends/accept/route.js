import { getAuth } from "@/lib/auth"
import { headers } from "next/headers"
import { acceptFriendRequest } from "@/lib/friends"

export async function POST(request) {
  const auth = getAuth()
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { senderId } = await request.json()
  if (!senderId) return Response.json({ error: "senderId required" }, { status: 400 })

  await acceptFriendRequest(session.user.id, senderId)
  return Response.json({ success: true })
}
