"use client"

import { useState } from "react"

export function FriendActionButton({ userId, initialStatus, onViewProfile }) {
  // initialStatus: "none" | "pending_sent" | "pending_received" | "accepted"
  const [status, setStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(false)

  async function handleAddFriend(e) {
    e.stopPropagation()
    setLoading(true)
    try {
      await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: userId }),
      })
      setStatus("pending_sent")
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAccept(e) {
    e.stopPropagation()
    setLoading(true)
    try {
      await fetch("/api/friends/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: userId }),
      })
      setStatus("accepted")
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const baseStyle = {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.04em",
    color: "#ffffff",
    padding: "4px 10px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.05)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
    position: "relative",
    zIndex: 1,
    transition: "colors 0.2s"
  }

  if (status === "accepted") {
    return (
      <div 
        className="group-hover:bg-white/10" 
        style={{ ...baseStyle, background: "rgba(255,255,255,0.06)" }}
        onClick={(e) => { e.stopPropagation(); onViewProfile(); }}
      >
        View Profile
      </div>
    )
  }
  
  if (status === "pending_sent") {
    return (
      <div 
        style={{ ...baseStyle, background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.5)" }}
      >
        Pending
      </div>
    )
  }
  
  if (status === "pending_received") {
    return (
      <button 
        onClick={handleAccept} 
        disabled={loading}
        className="active:scale-95"
        style={{ ...baseStyle, background: "rgba(16, 185, 129, 0.2)", color: "#10b981", borderColor: "rgba(16, 185, 129, 0.3)" }}
      >
        {loading ? "..." : "Accept"}
      </button>
    )
  }

  // none
  return (
    <button 
      onClick={handleAddFriend} 
      disabled={loading}
      className="group-hover:bg-white/10 active:scale-95"
      style={{ ...baseStyle, background: "rgba(255,255,255,0.06)" }}
    >
      {loading ? "..." : "Add Friend"}
    </button>
  )
}
