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
    <div className="h-full flex-1 w-full flex flex-col font-sans relative overflow-hidden bg-black selection:bg-[#38bdf8]/30">
      
      <header className="flex-none pt-4 pb-2 px-2 bg-[#0a0a0a]/85 backdrop-blur-[50px] border-b border-white/[0.08] sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center active:opacity-50 transition-opacity shrink-0"
          >
            <ChevronLeft size={30} className="text-[#0B84FF]" strokeWidth={2.5} />
          </button>
          
          <div className="flex items-center gap-2 min-w-0 ml-1">
            <div className="w-8 h-8 rounded-full bg-[#1c1c1e] flex items-center justify-center overflow-hidden shrink-0 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
              {friend?.image ? (
                <img src={friend.image} alt={friend.name} className="w-full h-full object-cover" />
              ) : (
                <User size={18} className="text-white/50" />
              )}
            </div>
            <h1 className="text-[#FFFFFF] font-semibold text-[17px] tracking-tight truncate">
              {friend?.name || "Loading..."}
            </h1>
          </div>
        </div>
        
        {/* Placeholder for trailing actions like FaceTime/Call icons */}
        <div className="w-10 h-10" />
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
            
            // Adjust borders for consecutive messages (iOS style grouping)
            const roundedClasses = isMine 
              ? `rounded-[20px] ${isNextMine ? 'rounded-br-[5px]' : 'rounded-br-[20px]'} ${isPrevMine ? 'rounded-tr-[5px]' : 'rounded-tr-[20px]'}`
              : `rounded-[20px] ${isNextMine ? 'rounded-bl-[5px]' : 'rounded-bl-[20px]'} ${isPrevMine ? 'rounded-tl-[5px]' : 'rounded-tl-[20px]'}`;
              
            // Add margin bottom if the next message is from someone else (to separate groups)
            const marginBottom = isNextMine ? "mb-[2px]" : "mb-3";

            return (
              <motion.div
                key={m.id || idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`flex flex-col max-w-[75%] ${isMine ? "self-end items-end" : "self-start items-start"} ${marginBottom}`}
              >
                <div 
                  className={`px-[16px] py-[8px] max-w-full ${roundedClasses} ${
                    isMine 
                      ? "bg-gradient-to-br from-[#148EFF] to-[#007AFF] text-white shadow-sm" 
                      : "bg-[#262628] text-[#e8edf5]"
                  }`}
                >
                  <p className="text-[16px] leading-[21px] tracking-[-0.3px] whitespace-pre-wrap break-words">{m.text}</p>
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
      <footer className="fixed bottom-0 left-0 right-0 px-3 py-2 pb-6 bg-[#0a0a0a]/95 backdrop-blur-3xl border-t border-white/[0.08] z-20">
        <form 
          onSubmit={handleSend}
          className="relative flex items-center gap-2"
        >
          {/* Mic Button on the Left */}
          <button
            type="button"
            onClick={toggleRecording}
            disabled={isTranscribing}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${
              isRecording 
                ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse" 
                : "bg-transparent text-[#7a90a8] hover:bg-white/5 active:scale-95"
            }`}
          >
            {isTranscribing ? (
              <Loader2 size={18} className="animate-spin text-white" />
            ) : (
              <Mic size={18} strokeWidth={isRecording ? 2.5 : 2} />
            )}
          </button>

          {/* Input Pill */}
          <div className={`flex-1 flex items-center bg-[#1c1c1e] rounded-full p-[3px] pl-4 border ${isRecording ? 'border-red-500/30 bg-red-500/5' : 'border-white/[0.06] shadow-inner'} transition-all duration-300`}>
            <input 
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder={isRecording ? "Listening..." : "iMessage"}
              className={`flex-1 bg-transparent border-none h-[32px] focus:outline-none text-[16px] tracking-tight leading-none ${isRecording ? 'text-red-400 placeholder:text-red-400/70' : 'text-[#e8edf5] placeholder:text-[#7a90a8]'}`}
              disabled={isRecording || isTranscribing}
            />
            
            {/* Send Button on the Right */}
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="w-[30px] h-[30px] rounded-full bg-[#0B84FF] flex items-center justify-center disabled:opacity-0 disabled:scale-50 active:scale-90 transition-all duration-300 shrink-0 ml-2 mr-1"
            >
              <ArrowUp size={18} className="text-white" strokeWidth={2.5} />
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
