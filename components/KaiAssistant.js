"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Plus, Send, Mic, Image as ImageIcon, X, Utensils } from "lucide-react";

export default function KaiAssistant({ isOpen, onClose, consumed, calorieTarget, macros, onNutritionUpdate }) {
  const [messages, setMessages] = useState([{ sender: 'kai', text: "Hello! I'm Kai. How can I assist you today?" }]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [nutritionToast, setNutritionToast] = useState(null);
  const [trackFood, setTrackFood] = useState(false);

  const appliedNutritionKeys = useRef(new Set());

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new window.Image();
      img.onload = () => {
        const MAX = 512;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        setAttachedImage(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

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

          setIsLoading(true);
          try {
            const res = await fetch("/api/transcribe", {
              method: "POST",
              body: formData
            });
            const data = await res.json();
            if (res.ok && data.text) {
              setInputValue(prev => prev + (prev ? " " : "") + data.text);
            }
          } catch (err) {
            console.error("Transcription failed", err);
          } finally {
            setIsLoading(false);
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

  const isNewConsumptionReport = (userText) => {
    if (!userText) return false;
    const t = userText.toLowerCase();
    const isQuestion = t.includes("?") ||
      /^(did|do|does|will|can|could|would|was|were|is|are|how|what|why|when|which|who)\b/.test(t.trim());
    if (isQuestion) return false;
    const consumptionKeywords = [
      "ate", "eaten", "eat", "had", "have had", "just had",
      "consumed", "consume", "consuming",
      "drank", "drink", "drunk", "drinking",
      "finished", "just finished", "just ate", "just consumed", "just drank",
      "i had", "i ate", "i consumed", "i drank", "i just",
      "for breakfast", "for lunch", "for dinner", "for snack",
    ];
    return consumptionKeywords.some(kw => t.includes(kw));
  };

  const parseActionBlock = (rawText) => {
    const actionMatch = rawText.match(/<<<ACTION>>>([\s\S]*?)<<<END_ACTION>>>/);
    const cleanText = rawText.replace(/<<<ACTION>>>[\s\S]*?<<<END_ACTION>>>/g, '').trim();
    let action = null;
    if (actionMatch) {
      try { action = JSON.parse(actionMatch[1].trim()); } catch { /* malformed, ignore */ }
    }
    return { cleanText, action };
  };

  const sendMessage = async () => {
    if ((!inputValue.trim() && !attachedImage) || isLoading) return;
    const userMsgKey = (inputValue.trim() + Date.now()).slice(0, 80);
    const newMsg = { sender: "user", text: inputValue, image: attachedImage };
    setMessages(prev => [...prev, newMsg]);
    setInputValue("");
    setAttachedImage(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, newMsg] })
      });
      const data = await res.json();
      if (res.ok) {
        const { cleanText, action } = parseActionBlock(data.text);
        const shouldApply =
          trackFood &&
          action?.type === "UPDATE_NUTRITION" &&
          !appliedNutritionKeys.current.has(userMsgKey) &&
          onNutritionUpdate;

        setMessages(prev => [...prev, { sender: "kai", text: cleanText, nutritionUpdate: shouldApply ? action : null }]);

        if (shouldApply) {
          appliedNutritionKeys.current.add(userMsgKey);
          onNutritionUpdate(action);
          setNutritionToast(`+${action.calories} kcal logged`);
          setTimeout(() => setNutritionToast(null), 3500);
        }
      } else {
        const errMsg = data.error || "Sorry, I ran into an error.";
        setMessages(prev => [...prev, { sender: "kai", text: errMsg }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: "kai", text: "Sorry, network error." }]);
    } finally {
      setIsLoading(false);
      setTrackFood(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-center items-center p-4">
      {/* Backdrop with premium blur */}
      <div
        className="absolute inset-0 animate-in fade-in duration-400"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(6,7,10,0.4) 0%, rgba(0,0,0,0.95) 100%)", backdropFilter: "blur(32px) saturate(120%)", WebkitBackdropFilter: "blur(32px) saturate(120%)" }}
        onClick={onClose}
      />

      {/* Card Modal */}
      <div 
        className="relative w-full max-w-[380px] rounded-[28px] px-6 pt-6 pb-6 animate-in zoom-in-90 fade-in duration-400 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] overflow-hidden"
        style={{ 
          background: "linear-gradient(160deg, #15171d 0%, #06070a 100%)", 
          border: "none",
          boxShadow: "inset 0 1px 1px rgba(255,255,255,0.15), inset 0 0 40px rgba(255,255,255,0.02), 0 40px 80px -20px rgba(0,0,0,1), 0 0 0 1px rgba(255,255,255,0.05)"
        }}
      >
        {/* Ambient Edge Light */}
        <div className="absolute top-0 left-[15%] right-[15%] h-[1px] pointer-events-none z-[2]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)", boxShadow: "0 0 24px 3px rgba(255,255,255,0.15)" }} />
        
        {/* Metallic Grain overlay */}
        <div className="absolute inset-0 pointer-events-none mix-blend-overlay z-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E\")" }} />

        {/* Nutrition Toast */}
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-30 transition-all duration-500 ${nutritionToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'}`}>
          <div 
            className="flex items-center gap-3 backdrop-blur-xl rounded-full px-5 py-2.5"
            style={{
              background: "rgba(6,7,10,0.85)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 10px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)"
            }}
          >
            <span className="text-[#6ee7b7] text-sm">✦</span>
            <span className="text-[13px] font-medium text-[#f1f5f9] tracking-wide">{nutritionToast}</span>
            <span className="text-[10px] text-white/30">· Dashboard updated</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8 relative z-10">
          <div className="flex flex-col">
            <h2 className="text-[24px] font-bold tracking-[-0.02em] leading-none text-[#f1f5f9] mb-1.5">Kai</h2>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <p className="text-[14px] text-white/50 leading-none">AI Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid place-items-center h-9 w-9 rounded-full transition-all active:scale-90"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}
            onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#ffffff"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
          >
            <Plus size={19} className="rotate-45" strokeWidth={1.5} />
          </button>
        </div>

        <div className="relative z-10 flex flex-col h-[560px]">
          {/* Chat Display */}
          <div className="flex-1 flex flex-col gap-4 pb-4 overflow-y-auto pr-1 pl-0.5 custom-scrollbar">
            <div className="flex-1" />

            {messages.map((msg, idx) => (
              msg.sender === "kai" ? (
                <div key={idx} className="flex items-end gap-3 max-w-[90%] animate-in slide-in-from-bottom-2 fade-in duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
                  <div className="shrink-0 grid place-items-center h-7 w-7 rounded-[10px] border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}>
                    <Sparkles size={12} className="text-[#f8fafc]/70" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div 
                      className="rounded-[16px] rounded-bl-[4px] px-4 py-3.5"
                      style={{ 
                        background: "#06070a", 
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: "none"
                      }}
                    >
                      <p className="text-[14.5px] font-normal text-[#f1f5f9] leading-[1.6] whitespace-pre-wrap tracking-wide">
                        {msg.text}
                      </p>
                    </div>
                    {msg.nutritionUpdate && (
                      <div className="flex items-center gap-1.5 px-1">
                        <div className="flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <span className="text-[10px] text-white/50">✦</span>
                          <span className="text-[10px] font-medium text-white/70">
                            +{msg.nutritionUpdate.calories} kcal · {msg.nutritionUpdate.protein}g P · {msg.nutritionUpdate.fat}g F · {msg.nutritionUpdate.carbs}g C
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div key={idx} className="flex items-end self-end gap-2.5 max-w-[85%] animate-in slide-in-from-bottom-2 fade-in duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
                  <div 
                    className="rounded-[16px] rounded-br-[4px] px-4 py-3.5 shadow-lg"
                    style={{ background: "#ffffff" }}
                  >
                    {msg.image && (
                      <img src={msg.image} alt="Upload" className="w-full max-w-[200px] rounded-md mb-2 object-cover border border-black/5" />
                    )}
                    <p className="text-[14.5px] font-medium text-[#020617] leading-[1.6] whitespace-pre-wrap tracking-wide">
                      {msg.text}
                    </p>
                  </div>
                </div>
              )
            ))}
            {isLoading && (
              <div className="flex items-end gap-3 max-w-[90%] animate-in slide-in-from-bottom-2 fade-in duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
                <div className="shrink-0 grid place-items-center h-7 w-7 rounded-[10px] border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}>
                  <Sparkles size={12} className="text-[#f8fafc]/70" />
                </div>
                <div 
                  className="rounded-[16px] rounded-bl-[4px] px-5 py-4 flex items-center gap-1.5"
                  style={{ 
                    background: "#06070a", 
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "none"
                  }}
                >
                  <div className="w-1.5 h-1.5 bg-[#f8fafc]/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-[#f8fafc]/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-[#f8fafc]/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex flex-col gap-6 mt-2 shrink-0">
            {/* Image Preview */}
            {attachedImage && (
              <div className="relative self-start ml-1">
                <img src={attachedImage} alt="Preview" className="h-16 w-16 object-cover rounded-xl border border-white/[0.1] shadow-md" />
                <button
                  onClick={() => setAttachedImage(null)}
                  className="absolute -top-2 -right-2 grid place-items-center h-5 w-5 bg-white/90 rounded-full text-[#0c0c0c] shadow-lg hover:bg-white transition-colors"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </div>
            )}

            {/* Food Log Toggle */}
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-white/40">Mode</label>
              <button
                onClick={() => setTrackFood(v => !v)}
                className="flex items-center justify-between w-full rounded-[16px] px-4 h-[52px] transition-all duration-300"
                style={{
                  background: trackFood ? "rgba(110,231,183,0.12)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${trackFood ? "#ffffff" : "rgba(255,255,255,0.08)"}`,
                  boxShadow: trackFood ? "0 0 20px rgba(110,231,183,0.15)" : "none",
                }}
              >
                <div className="flex items-center gap-3">
                  <Utensils size={16} className={trackFood ? "text-[#f1f5f9]" : "text-white/30"} strokeWidth={1.8} />
                  <span className={`text-[14px] font-medium leading-none ${trackFood ? "text-[#f1f5f9]" : "text-white/40"}`}>
                    Food Log
                  </span>
                </div>
                <div className="flex items-center">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${trackFood ? "text-[#6ee7b7]" : "text-white/20"}`}>
                    {trackFood ? "Active" : "Off"}
                  </span>
                </div>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-white/40">Message Kai</label>
              <div className="relative flex items-center">
                <div className="absolute left-2 flex items-center gap-1 z-10">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="grid place-items-center h-[36px] w-[36px] rounded-[10px] text-white/40 hover:text-white hover:bg-white/[0.05] transition-all"
                  >
                    <ImageIcon size={16} strokeWidth={1.8} />
                  </button>
                  <button
                    onClick={toggleRecording}
                    className={`grid place-items-center h-[36px] w-[36px] rounded-[10px] transition-all ${
                      isRecording ? "text-[#f87171] bg-[#f87171]/10 animate-pulse" : "text-white/40 hover:text-white hover:bg-white/[0.05]"
                    }`}
                  >
                    <Mic size={16} strokeWidth={1.8} />
                  </button>
                </div>

                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={trackFood ? "Tell Kai what you ate..." : "Ask Kai..."}
                  className="w-full h-[52px] rounded-[16px] pl-[96px] pr-14 text-[16px] outline-none transition-all placeholder:text-white/30"
                  style={{ 
                    background: "#06070a",
                    border: `1px solid ${trackFood ? "rgba(110,231,183,0.3)" : "rgba(255,255,255,0.08)"}`,
                    color: "#f1f5f9"
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#ffffff"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = trackFood ? "rgba(110,231,183,0.3)" : "rgba(255,255,255,0.08)"; }}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || (!inputValue.trim() && !attachedImage)}
                  className="absolute right-2 grid place-items-center h-[36px] w-[36px] rounded-[10px] transition-all active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:pointer-events-none"
                  style={{ background: "#ffffff", color: "#000000" }}
                >
                  <Send size={15} className="mr-0.5" strokeWidth={2.2} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.12);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
}