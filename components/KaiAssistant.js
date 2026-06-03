"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Plus, Send } from "lucide-react";

export default function KaiAssistant({ isOpen, onClose }) {
  const [messages, setMessages] = useState([{ sender: 'kai', text: "Hello! I'm Kai. How can I assist you today?" }]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    const newMsg = { sender: "user", text: inputValue };
    setMessages(prev => [...prev, newMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, newMsg] })
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { sender: "kai", text: data.text }]);
      } else {
        setMessages(prev => [...prev, { sender: "kai", text: "Sorry, I ran into an error." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: "kai", text: "Sorry, network error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-center items-center p-4">
      {/* Click away to close Backdrop */}
      <div className="absolute inset-0 bg-[#010614]/70 backdrop-blur-[12px] animate-in fade-in duration-300" onClick={onClose} />

      {/* Popup Card Modal */}
      <div className="relative w-full max-w-[360px] rounded-[32px] border border-white/[0.08] bg-[#020512]/90 px-5 pt-6 pb-6 shadow-[0_20px_80px_rgba(0,0,0,0.8),inset_0_1px_40px_rgba(255,255,255,0.05)] backdrop-blur-[40px] animate-in zoom-in-95 fade-in duration-300 ease-out">

        {/* Premium Inner Glow */}
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-[#00d0ff]/15 to-transparent blur-[60px] pointer-events-none rounded-t-[32px]" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="relative grid place-items-center h-[38px] w-[38px] rounded-[14px] bg-gradient-to-br from-[#00d0ff]/20 to-[#3b82f6]/10 border border-[#00d0ff]/20 shadow-[0_0_20px_rgba(0,208,255,0.15)]">
              <Sparkles size={18} className="text-[#00d0ff]" strokeWidth={1.5} />
              {/* Glowing status dot on the icon */}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d0ff] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00d0ff] border-2 border-[#020512]"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <h2 className="text-[18px] font-semibold text-white tracking-tight leading-none">Kai</h2>
              <p className="text-[11px] font-medium text-[#00d0ff]/80 tracking-[0.1em] mt-1.5 leading-none">AI ASSISTANT</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid place-items-center h-8 w-8 rounded-full bg-white/[0.04] border border-white/[0.05] text-white/50 hover:bg-white/10 hover:text-white transition-all active:scale-90"
          >
            <Plus size={18} className="rotate-45" strokeWidth={1.5} />
          </button>
        </div>

        <div className="relative z-10 flex flex-col h-[400px]">
          {/* Chat Display Area */}
          <div className="flex-1 flex flex-col gap-4 pb-4 overflow-y-auto premium-scrollbar pr-2 pl-1">
            <div className="flex-1" />

            {messages.map((msg, idx) => (
              msg.sender === "kai" ? (
                <div key={idx} className="flex items-end gap-2.5 max-w-[88%] animate-in slide-in-from-bottom-2 fade-in duration-500 ease-out">
                  <div className="shrink-0 grid place-items-center h-7 w-7 rounded-[10px] bg-[#00d0ff]/[0.08] border border-[#00d0ff]/[0.15]">
                    <Sparkles size={12} className="text-[#00d0ff]" />
                  </div>
                  <div className="rounded-[20px] rounded-bl-[6px] bg-[#071330]/50 border border-white/[0.03] px-4 py-3 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                    <p className="text-[14.5px] font-normal text-white/90 leading-[1.6] whitespace-pre-wrap tracking-wide">
                      {msg.text}
                    </p>
                  </div>
                </div>
              ) : (
                <div key={idx} className="flex items-end self-end gap-2.5 max-w-[85%] animate-in slide-in-from-bottom-2 fade-in duration-500 ease-out">
                  <div className="rounded-[20px] rounded-br-[6px] bg-gradient-to-br from-[#00d0ff]/90 to-[#2563eb]/90 px-4 py-3 shadow-[0_8px_20px_rgba(0,208,255,0.25)] border border-white/[0.12]">
                    <p className="text-[14.5px] font-medium text-white leading-[1.6] whitespace-pre-wrap tracking-wide drop-shadow-sm">
                      {msg.text}
                    </p>
                  </div>
                </div>
              )
            ))}
            {isLoading && (
              <div className="flex items-end gap-2.5 max-w-[88%] animate-in slide-in-from-bottom-2 fade-in duration-500 ease-out">
                <div className="shrink-0 grid place-items-center h-7 w-7 rounded-[10px] bg-[#00d0ff]/[0.08] border border-[#00d0ff]/[0.15]">
                  <Sparkles size={12} className="text-[#00d0ff]" />
                </div>
                <div className="rounded-[20px] rounded-bl-[6px] bg-[#071330]/50 border border-white/[0.03] px-5 py-4 backdrop-blur-xl flex items-center gap-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                  <div className="w-1.5 h-1.5 bg-[#00d0ff]/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-[#00d0ff]/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-[#00d0ff]/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="relative flex items-center mt-2 shrink-0">
            {/* Floating ambient glow behind input */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#00d0ff]/10 to-[#3b82f6]/10 rounded-full blur-[10px] pointer-events-none" />

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask Kai..."
              className="relative w-full rounded-full bg-[#050b1a]/60 border border-white/[0.06] pl-5 pr-14 py-4 text-[14px] text-white placeholder-white/30 outline-none focus:border-[#00d0ff]/40 focus:bg-[#050b1a]/80 transition-all backdrop-blur-xl shadow-[inset_0_2px_15px_rgba(0,0,0,0.5)]"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="absolute right-1.5 grid place-items-center h-[38px] w-[38px] rounded-full bg-[#00d0ff] text-[#020512] hover:shadow-[0_0_20px_rgba(0,208,255,0.6)] hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,208,255,0.3)] active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none"
            >
              <Send size={16} className="ml-0.5 drop-shadow-sm" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
