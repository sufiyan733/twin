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
  const [trackFood, setTrackFood] = useState(false); // user explicitly enables food logging
  
  // Track which user messages have already had their nutrition applied to prevent duplicates
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

  // Deterministic guard: checks if the USER's own message reports a NEW consumption event.
  // This is the most reliable protection against the AI emitting spurious action blocks.
  const isNewConsumptionReport = (userText) => {
    if (!userText) return false;
    const t = userText.toLowerCase();

    // Must NOT be a question (questions are follow-ups, not new reports)
    const isQuestion = t.includes("?") ||
      /^(did|do|does|will|can|could|would|was|were|is|are|how|what|why|when|which|who)\b/.test(t.trim());
    if (isQuestion) return false;

    // Must contain explicit past-tense or present consumption words
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

  // Parse and strip the hidden action block from AI reply text
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
    // Create a unique key for this specific user message to prevent double-counting
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

        // ONLY apply nutrition if user explicitly toggled "Log Food" for this message
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
      setTrackFood(false); // always reset toggle after send
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

        {/* Nutrition Toast Notification */}
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-30 transition-all duration-500 ${nutritionToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
          <div className="flex items-center gap-2 bg-[#00d0ff]/10 border border-[#00d0ff]/40 backdrop-blur-xl rounded-full px-4 py-2 shadow-[0_0_20px_rgba(0,208,255,0.3)]">
            <span className="text-[#00d0ff] text-sm">📊</span>
            <span className="text-[12px] font-bold text-[#00d0ff] tracking-wide">{nutritionToast}</span>
            <span className="text-[10px] text-white/40">· Dashboard updated</span>
          </div>
        </div>

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

        <div className="relative z-10 flex flex-col h-[550px]">
          {/* Chat Display Area */}
          <div className="flex-1 flex flex-col gap-4 pb-4 overflow-y-auto premium-scrollbar pr-2 pl-1">
            <div className="flex-1" />

            {messages.map((msg, idx) => (
              msg.sender === "kai" ? (
                <div key={idx} className="flex items-end gap-2.5 max-w-[88%] animate-in slide-in-from-bottom-2 fade-in duration-500 ease-out">
                  <div className="shrink-0 grid place-items-center h-7 w-7 rounded-[10px] bg-[#00d0ff]/[0.08] border border-[#00d0ff]/[0.15]">
                    <Sparkles size={12} className="text-[#00d0ff]" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="rounded-[20px] rounded-bl-[6px] bg-[#071330]/50 border border-white/[0.03] px-4 py-3 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                      <p className="text-[14.5px] font-normal text-white/90 leading-[1.6] whitespace-pre-wrap tracking-wide">
                        {msg.text}
                      </p>
                    </div>
                    {msg.nutritionUpdate && (
                      <div className="flex items-center gap-1.5 px-1">
                        <div className="flex items-center gap-1 bg-[#00d0ff]/10 border border-[#00d0ff]/20 rounded-full px-2.5 py-0.5">
                          <span className="text-[10px]">📊</span>
                          <span className="text-[10px] font-semibold text-[#00d0ff]">
                            +{msg.nutritionUpdate.calories} kcal · {msg.nutritionUpdate.protein}g P · {msg.nutritionUpdate.fat}g F · {msg.nutritionUpdate.carbs}g C
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div key={idx} className="flex items-end self-end gap-2.5 max-w-[85%] animate-in slide-in-from-bottom-2 fade-in duration-500 ease-out">
                  <div className="rounded-[20px] rounded-br-[6px] bg-gradient-to-br from-[#00d0ff]/90 to-[#2563eb]/90 px-4 py-3 shadow-[0_8px_20px_rgba(0,208,255,0.25)] border border-white/[0.12]">
                    {msg.image && (
                      <img src={msg.image} alt="Upload" className="w-full max-w-[200px] rounded-md mb-2 object-cover border border-white/10" />
                    )}
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
          <div className="flex flex-col gap-2 mt-2 shrink-0">
            {/* Image Preview */}
            {attachedImage && (
              <div className="relative self-start ml-2">
                <img src={attachedImage} alt="Preview" className="h-16 w-16 object-cover rounded-xl border border-[#00d0ff]/30 shadow-md" />
                <button 
                  onClick={() => setAttachedImage(null)}
                  className="absolute -top-2 -right-2 grid place-items-center h-5 w-5 bg-red-500 rounded-full text-white shadow-lg"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </div>
            )}

            {/* Food Log Toggle Row — always visible above input */}
            <button
              onClick={() => setTrackFood(v => !v)}
              className={`flex items-center justify-between w-full rounded-2xl px-4 py-2.5 border transition-all duration-300 ${
                trackFood
                  ? "bg-emerald-500/15 border-emerald-500/50 shadow-[0_0_16px_rgba(52,211,153,0.15)]"
                  : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`grid place-items-center h-7 w-7 rounded-full transition-all duration-300 ${
                  trackFood ? "bg-emerald-500/25 shadow-[0_0_10px_rgba(52,211,153,0.3)]" : "bg-white/[0.05]"
                }`}>
                  <Utensils size={14} className={trackFood ? "text-emerald-400" : "text-white/40"} strokeWidth={1.8} />
                </div>
                <div className="flex flex-col items-start">
                  <span className={`text-[12px] font-semibold leading-none ${trackFood ? "text-emerald-400" : "text-white/50"}`}>
                    Log Food Intake
                  </span>
                  <span className="text-[10px] text-white/25 mt-0.5 leading-none">
                    {trackFood ? "Next message will update your macros" : "Tap to track what you eat"}
                  </span>
                </div>
              </div>
              {/* Toggle pill */}
              <div className={`relative h-5 w-9 rounded-full transition-all duration-300 ${
                trackFood ? "bg-emerald-500" : "bg-white/10"
              }`}>
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
                  trackFood ? "left-[18px]" : "left-0.5"
                }`} />
              </div>
            </button>

            <div className="relative flex items-center">
              {/* Floating ambient glow behind input */}
              <div className={`absolute inset-0 rounded-full blur-[10px] pointer-events-none transition-all duration-300 ${
                trackFood
                  ? "bg-gradient-to-r from-emerald-500/15 to-emerald-400/10"
                  : "bg-gradient-to-r from-[#00d0ff]/10 to-[#3b82f6]/10"
              }`} />

              <div className="absolute left-1.5 flex items-center gap-0.5 z-10">
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="grid place-items-center h-[34px] w-[34px] rounded-full text-white/50 hover:text-white hover:bg-white/5 transition-all"
                >
                  <ImageIcon size={16} strokeWidth={1.8} />
                </button>
                <button 
                  onClick={toggleRecording}
                  className={`grid place-items-center h-[34px] w-[34px] rounded-full transition-all ${
                    isRecording 
                      ? "text-red-400 bg-red-400/10 animate-pulse" 
                      : "text-white/50 hover:text-white hover:bg-white/5"
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
                className={`relative w-full rounded-full bg-[#050b1a]/60 border pl-[84px] pr-14 py-4 text-[14px] text-white placeholder-white/30 outline-none transition-all backdrop-blur-xl shadow-[inset_0_2px_15px_rgba(0,0,0,0.5)] ${
                  trackFood
                    ? "border-emerald-500/40 focus:border-emerald-400/60"
                    : "border-white/[0.06] focus:border-[#00d0ff]/40 focus:bg-[#050b1a]/80"
                }`}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || (!inputValue.trim() && !attachedImage)}
                className={`absolute right-1.5 grid place-items-center h-[38px] w-[38px] rounded-full text-[#020512] transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none ${
                  trackFood
                    ? "bg-emerald-400 hover:shadow-[0_0_20px_rgba(52,211,153,0.6)] shadow-[0_0_15px_rgba(52,211,153,0.3)] hover:scale-105"
                    : "bg-[#00d0ff] hover:shadow-[0_0_20px_rgba(0,208,255,0.6)] shadow-[0_0_15px_rgba(0,208,255,0.3)] hover:scale-105"
                }`}
              >
                <Send size={16} className="ml-0.5 drop-shadow-sm" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
