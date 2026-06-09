"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { getSocket } from "@/lib/socket"
import { ChevronLeft, Send, ArrowUp, User, Sparkles, Mic, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  
  const scrollRef = useRef(null)
  const messagesEndRef = useRef(null)
  const socketRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

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

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append("file", audioBlob, "recording.webm");

          setIsTranscribing(true);
          try {
            const res = await fetch("/api/transcribe", {
              method: "POST",
              body: formData
            });
            const data = await res.json();
            if (res.ok && data.text) {
              setInputText(prev => prev + (prev ? " " : "") + data.text);
            }
          } catch (err) {
            console.error("Transcription failed", err);
          } finally {
            setIsTranscribing(false);
          }

          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing microphone", err);
      }
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value)
    
    if (socketRef.current && roomId && currentUserId) {
      socketRef.current.emit("typing:start", { roomId, userId: currentUserId })
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit("typing:stop", { roomId, userId: currentUserId })
      }, 2000)
    }
  };

  if (isPending || !currentUserId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-full flex-1 w-full flex flex-col font-sans relative overflow-hidden bg-[#02040A] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#111827] via-[#02040A] to-black selection:bg-blue-500/30">
      
      {/* Premium Glass Header */}
      <header className="flex-none pt-4 pb-3 px-3 bg-[#02040A]/50 backdrop-blur-2xl border-b border-white/[0.04] sticky top-0 z-20 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 active:bg-white/10 transition-colors shrink-0"
          >
            <ChevronLeft size={28} className="text-white/90" strokeWidth={2.5} />
          </button>
          
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-[38px] h-[38px] rounded-full p-[2px] bg-gradient-to-br from-white/20 to-white/0 shrink-0 shadow-lg shadow-black/20">
              <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                {friend?.image ? (
                  <img src={friend.image} alt={friend.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={18} className="text-white/50" />
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-[11px] h-[11px] bg-emerald-400 border-2 border-[#02040A] rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <h1 className="text-white font-semibold text-[16px] leading-tight tracking-tight truncate drop-shadow-sm">
                {friend?.name || "Loading..."}
              </h1>
              <p className="text-emerald-400/90 text-[12px] font-medium tracking-tight mt-[1px]">Active now</p>
            </div>
          </div>
        </div>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 pb-[60px] flex flex-col gap-[3px] [&::-webkit-scrollbar]:hidden relative z-10" 
        style={{ scrollbarWidth: "none", overscrollBehavior: "contain" }}
      >
        <AnimatePresence initial={false}>
          {messages.map((m, idx) => {
            const isMine = m.senderId === session?.user?.id;
            const isNextMine = messages[idx + 1]?.senderId === m.senderId;
            const isPrevMine = messages[idx - 1]?.senderId === m.senderId;
            
            // Adjust borders for consecutive messages
            const roundedClasses = isMine 
              ? `rounded-[22px] ${isNextMine ? 'rounded-br-[4px]' : 'rounded-br-[22px]'} ${isPrevMine ? 'rounded-tr-[4px]' : 'rounded-tr-[22px]'}`
              : `rounded-[22px] ${isNextMine ? 'rounded-bl-[4px]' : 'rounded-bl-[22px]'} ${isPrevMine ? 'rounded-tl-[4px]' : 'rounded-tl-[22px]'}`;
              
            const marginBottom = isNextMine ? "mb-[2px]" : "mb-5";

            return (
              <motion.div
                key={m.id || idx}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className={`flex flex-col max-w-[80%] ${isMine ? "self-end items-end" : "self-start items-start"} ${marginBottom}`}
              >
                <div 
                  className={`px-[18px] py-[10px] max-w-full ${roundedClasses} ${
                    isMine 
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_4px_16px_-4px_rgba(59,130,246,0.4)] border border-blue-400/20" 
                      : "bg-white/[0.06] backdrop-blur-xl border border-white/[0.05] text-[#f1f5f9] shadow-[0_4px_16px_-4px_rgba(0,0,0,0.2)]"
                  }`}
                >
                  <p className="text-[15px] leading-[22px] tracking-wide whitespace-pre-wrap break-words font-normal">{m.text}</p>
                </div>
                {/* Timestamps hidden by default inside bubbles in true iOS, keeping clean */}
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        <AnimatePresence>
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="self-start items-start flex flex-col max-w-[80%] mb-1"
            >
              <div className="px-4 py-3.5 rounded-[20px] bg-[#262628] rounded-tl-[4px] flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms", animationDuration: "1s" }} />
                <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms", animationDuration: "1s" }} />
                <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms", animationDuration: "1s" }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-2" />
      </div>
      {/* Input Area */}
      <footer className="fixed bottom-0 left-0 right-0 px-4 py-3 pb-8 bg-[#02040A]/50 backdrop-blur-3xl border-t border-white/[0.04] z-20">
        <form 
          onSubmit={handleSend}
          className="relative flex items-center gap-3"
        >
          {/* Mic Button */}
          <button
            type="button"
            onClick={toggleRecording}
            disabled={isTranscribing}
            className={`w-[42px] h-[42px] rounded-full flex items-center justify-center transition-all duration-300 shrink-0 border ${
              isRecording 
                ? "bg-red-500/20 border-red-500/40 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse" 
                : "bg-white/[0.03] border-white/[0.06] text-white/50 hover:bg-white/[0.08] hover:text-white active:scale-95 shadow-sm"
            }`}
          >
            {isTranscribing ? (
              <Loader2 size={20} className="animate-spin text-white" />
            ) : (
              <Mic size={20} strokeWidth={isRecording ? 2.5 : 2} />
            )}
          </button>

          {/* Premium Glass Input Pill */}
          <div className={`flex-1 flex items-center rounded-full p-[4px] pl-5 border ${isRecording ? 'border-red-500/30 bg-red-500/5' : 'bg-white/[0.04] border-white/[0.08] focus-within:border-white/20 focus-within:bg-white/[0.07]'} backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] transition-all duration-300`}>
            <input 
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder={isRecording ? "Listening..." : "Type a message..."}
              className={`flex-1 bg-transparent border-none h-[40px] focus:outline-none text-[15px] font-medium tracking-wide ${isRecording ? 'text-red-400 placeholder:text-red-400/50' : 'text-white placeholder:text-white/30'}`}
              disabled={isRecording || isTranscribing}
            />
            
            {/* Send Button */}
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="w-[40px] h-[40px] rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_2px_12px_rgba(59,130,246,0.5)] flex items-center justify-center disabled:opacity-0 disabled:scale-50 active:scale-90 transition-all duration-300 shrink-0 ml-2"
            >
              <ArrowUp size={20} className="text-white drop-shadow-md" strokeWidth={2.5} />
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
