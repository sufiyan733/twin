"use client"

import { io } from "socket.io-client"

let socket

export function getSocket() {
  if (typeof window === "undefined") return null

  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_APP_URL || "", {
      autoConnect: false,
      transports: ["polling", "websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
  }

  return socket
}
