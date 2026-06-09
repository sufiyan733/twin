"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { getSocket } from "@/lib/socket"
import { ChevronLeft, Send, User } from "lucide-react"

export default function ChatPage({ params }) {
  const unwrappedParams = React.use(params)
  const friendId = unwrappedParams.friendId

  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const currentUserId = session?.user?.id

  const [friend, setFriend] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  
  const messagesEndRef = useRef(null)
  const socketRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const roomId = currentUserId ? [currentUserId, friendId].sort().join("_") : null

  // Fetch friend basic info (for header)
  useEffect(() => {
    fetch("/api/friends")
      .then(r => r.json())
      .then(d => {
        if (d.friends) {
          const f = d.friends.find(u => u.id === friendId)
          if (f) setFriend(f)
        }
      })
      .catch(console.error)
  }, [friendId])

  // Load chat history
  useEffect(() => {
    if (!roomId) return
    fetch(`/api/messages?roomId=${roomId}`)
      .then(r => r.json())
      .then(d => {
        if (d.messages) setMessages(d.messages)
      })
      .catch(console.error)
  }, [roomId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // Socket setup
  useEffect(() => {
    if (!currentUserId || !roomId) return

    const socket = getSocket()
    if (!socket) return

    socketRef.current = socket
    
    // Auto-connect if not already
    if (!socket.connected) socket.connect()

    socket.emit("user:register", currentUserId)
    socket.emit("room:join", roomId)

    const handleReceive = (msg) => {
      setMessages(prev => [...prev, msg])
    }

    const handleTypingStart = ({ userId }) => {
      if (userId === friendId) setIsTyping(true)
    }

    const handleTypingStop = ({ userId }) => {
      if (userId === friendId) setIsTyping(false)
    }

    socket.on("message:receive", handleReceive)
    socket.on("typing:start", handleTypingStart)
    socket.on("typing:stop", handleTypingStop)

    return () => {
      socket.off("message:receive", handleReceive)
      socket.off("typing:start", handleTypingStart)
      socket.off("typing:stop", handleTypingStop)
    }
  }, [currentUserId, roomId, friendId])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputText.trim() || !currentUserId || !roomId) return

    const textToSend = inputText.trim()
    setInputText("")

    // Optimistic UI could go here, but since we persist to DB first, we do it in order:
    // 1. Persist to REST API
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, receiverId: friendId, text: textToSend })
      })
      const { message } = await res.json()

      if (message) {
        // 2. Add locally
        setMessages(prev => [...prev, message])
        
        // 3. Broadcast to socket
        socketRef.current?.emit("message:send", { roomId, message })
        socketRef.current?.emit("typing:stop", { roomId, userId: currentUserId })
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleInputChange = (e) => {
    setInputText(e.target.value)
    
    if (socketRef.current && roomId && currentUserId) {
      socketRef.current.emit("typing:start", { roomId, userId: currentUserId })
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit("typing:stop", { roomId, userId: currentUserId })
      }, 2000)
    }
  }

  if (isPending || !currentUserId) {
    return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white/50">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col font-sans">
      {/* Header */}
      <header className="flex-none pt-12 pb-4 px-6 border-b border-white/10 bg-[#0f172a]/50 backdrop-blur-xl sticky top-0 z-10 flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform hover:bg-white/10"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/15 to-white/5 flex items-center justify-center overflow-hidden border border-white/10 shadow-lg">
            {friend?.image ? (
              <img src={friend.image} alt={friend.name} className="w-full h-full object-cover" />
            ) : (
              <User size={20} className="text-white" />
            )}
          </div>
          <div>
            <h1 className="text-white font-display font-semibold text-lg leading-tight">
              {friend?.name || "Loading..."}
            </h1>
            <p className="text-white/40 text-xs font-medium">Friend</p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map((m) => {
          const isMine = m.senderId === currentUserId
          return (
            <div key={m._id} className={`flex flex-col max-w-[80%] ${isMine ? "self-end items-end" : "self-start items-start"}`}>
              <div 
                className={`px-4 py-2.5 rounded-2xl ${
                  isMine 
                    ? "bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/20 rounded-tr-sm" 
                    : "bg-white/10 text-white rounded-tl-sm border border-white/5 shadow-xl backdrop-blur-md"
                }`}
              >
                <p className="text-[15px] leading-relaxed">{m.text}</p>
              </div>
              <span className="text-[10px] text-white/30 font-medium mt-1 px-1">
                {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          )
        })}
        {isTyping && (
          <div className="self-start items-start flex flex-col max-w-[80%]">
             <div className="px-4 py-3 rounded-2xl bg-white/10 rounded-tl-sm border border-white/5 backdrop-blur-md flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <footer className="flex-none p-4 pb-8 bg-gradient-to-t from-[#020617] to-transparent sticky bottom-0">
        <form 
          onSubmit={handleSend}
          className="relative flex items-center bg-black/40 border border-white/10 rounded-2xl p-1 shadow-2xl backdrop-blur-xl"
        >
          <input 
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none text-white px-4 h-11 focus:outline-none placeholder:text-white/30 text-[15px]"
          />
          <button 
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center disabled:opacity-50 disabled:bg-white/5 active:scale-95 transition-all mr-0.5 border border-teal-500/30"
          >
            <Send size={18} className="text-teal-400 disabled:text-white/30" />
          </button>
        </form>
      </footer>
    </div>
  )
}
