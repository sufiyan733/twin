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
    <div className="min-h-screen flex flex-col font-sans relative" style={{ background: "radial-gradient(circle at top, #0f172a 0%, #020617 100%)" }}>
      {/* Header */}
      <header className="flex-none pt-8 pb-3 px-5 border-b border-white/5 bg-[#020617]/70 backdrop-blur-3xl sticky top-0 z-10 flex items-center gap-3">
        <button 
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform hover:bg-white/10 shrink-0"
        >
          <ChevronLeft size={18} className="text-white ml-[-2px]" />
        </button>
        
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-[14px] bg-gradient-to-br from-white/15 to-white/5 flex items-center justify-center overflow-hidden border border-white/10 shadow-lg shrink-0">
            {friend?.image ? (
              <img src={friend.image} alt={friend.name} className="w-full h-full object-cover" />
            ) : (
              <User size={18} className="text-white" />
            )}
          </div>
          <div className="min-w-0 truncate">
            <h1 className="text-white font-display font-semibold text-[16px] leading-tight truncate">
              {friend?.name || "Loading..."}
            </h1>
            <p className="text-[#14b8a6] text-[11px] font-semibold tracking-wide">Online</p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div 
        className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 [&::-webkit-scrollbar]:hidden" 
        style={{ scrollbarWidth: "none" }}
      >
        {messages.map((m, index) => {
          const isMine = m.senderId === currentUserId
          
          return (
            <div key={m._id} className={`flex flex-col max-w-[75%] ${isMine ? "self-end items-end" : "self-start items-start"}`}>
              <div 
                className={`px-4 py-3 ${
                  isMine 
                    ? "bg-gradient-to-br from-[#14b8a6] to-[#0f766e] text-white shadow-lg shadow-teal-900/40 rounded-[20px] rounded-br-[4px] border border-teal-400/20" 
                    : "bg-[#1e293b]/70 text-white rounded-[20px] rounded-bl-[4px] border border-white/10 shadow-xl backdrop-blur-md"
                }`}
                style={{
                  boxShadow: isMine ? "inset 0 1px 1px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.3)" : "inset 0 1px 1px rgba(255,255,255,0.05), 0 4px 12px rgba(0,0,0,0.3)"
                }}
              >
                <p className="text-[15px] leading-relaxed tracking-wide">{m.text}</p>
              </div>
              <span className="text-[10px] text-white/30 font-medium mt-1.5 px-1 tracking-wider">
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
      <footer className="flex-none p-4 pb-8 bg-gradient-to-t from-[#020617] via-[#020617]/90 to-transparent sticky bottom-0 z-10">
        <form 
          onSubmit={handleSend}
          className="relative flex items-center bg-[#0f172a]/80 border border-white/10 rounded-full p-1.5 shadow-2xl backdrop-blur-xl"
        >
          <input 
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none text-white px-4 h-11 focus:outline-none placeholder:text-white/30 text-[15px] tracking-wide"
          />
          <button 
            type="submit"
            disabled={!inputText.trim()}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-[#14b8a6] to-[#0f766e] flex items-center justify-center disabled:opacity-50 disabled:from-white/10 disabled:to-white/5 active:scale-95 transition-all shadow-lg"
          >
            <Send size={18} className="text-white disabled:text-white/30 ml-0.5" />
          </button>
        </form>
      </footer>
    </div>
  )
}
