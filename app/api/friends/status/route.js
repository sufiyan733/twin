import { getAuth } from "@/lib/auth"
import { headers } from "next/headers"
import { getPendingReceivedRequests, getPendingSentRequests, getAcceptedFriendIds } from "@/lib/friends"

export async function GET() {
  const auth = getAuth()
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const [received, sent, acceptedIds] = await Promise.all([
    getPendingReceivedRequests(session.user.id),
    getPendingSentRequests(session.user.id),
    getAcceptedFriendIds(session.user.id),
  ])

  return Response.json({
    pendingReceived: received.map((r) => r.senderId),
    pendingSent: sent.map((r) => r.receiverId),
    accepted: acceptedIds,
  })
}
