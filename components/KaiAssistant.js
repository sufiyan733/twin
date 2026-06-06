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
        className="absolute inset-0 bg-[#000000]/80 backdrop-blur-[20px] animate-in fade-in duration-400"
        onClick={onClose}
      />

      {/* Card Modal */}
      <div className="relative w-full max-w-[380px] rounded-[36px] bg-[#0c0c0c] border border-white/[0.06] px-6 pt-6 pb-6 shadow-[0_30px_120px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.03)_inset] animate-in zoom-in-90 fade-in duration-400 ease-out">

        {/* Subtle radial glow */}
        <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[280px] h-[280px] bg-white/[0.03] blur-[100px] rounded-full pointer-events-none" />

        {/* Nutrition Toast */}
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-30 transition-all duration-500 ${nutritionToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'}`}>
          <div className="flex items-center gap-3 bg-[#1a1a1a] border border-white/[0.08] backdrop-blur-xl rounded-full px-5 py-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
            <span className="text-white/60 text-sm">✦</span>
            <span className="text-[13px] font-medium text-white/90 tracking-wide">{nutritionToast}</span>
            <span className="text-[10px] text-white/30">· Dashboard updated</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="relative grid place-items-center h-[40px] w-[40px] rounded-[14px] bg-white/[0.04] border border-white/[0.08] shadow-[0_0_30px_rgba(255,255,255,0.03)]">
              <Sparkles size={18} className="text-white/90" strokeWidth={1.5} />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white border-2 border-[#0c0c0c]"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <h2 className="text-[19px] font-semibold text-white tracking-tight leading-none">Kai</h2>
              <p className="text-[10px] font-medium text-white/30 tracking-[0.15em] mt-1.5 leading-none">AI ASSISTANT</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid place-items-center h-9 w-9 rounded-full bg-white/[0.03] border border-white/[0.05] text-white/40 hover:bg-white/10 hover:text-white transition-all active:scale-90"
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
                <div key={idx} className="flex items-end gap-3 max-w-[90%] animate-in slide-in-from-bottom-2 fade-in duration-500 ease-out">
                  <div className="shrink-0 grid place-items-center h-7 w-7 rounded-[10px] bg-white/[0.05] border border-white/[0.06]">
                    <Sparkles size={12} className="text-white/70" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="rounded-[20px] rounded-bl-[6px] bg-[#161616] border border-white/[0.04] px-4 py-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                      <p className="text-[14.5px] font-normal text-white/85 leading-[1.6] whitespace-pre-wrap tracking-wide">
                        {msg.text}
                      </p>
                    </div>
                    {msg.nutritionUpdate && (
                      <div className="flex items-center gap-1.5 px-1">
                        <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.06] rounded-full px-3 py-1">
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
                <div key={idx} className="flex items-end self-end gap-2.5 max-w-[85%] animate-in slide-in-from-bottom-2 fade-in duration-500 ease-out">
                  <div className="rounded-[20px] rounded-br-[6px] bg-white px-4 py-3.5 shadow-[0_8px_30px_rgba(255,255,255,0.1)]">
                    {msg.image && (
                      <img src={msg.image} alt="Upload" className="w-full max-w-[200px] rounded-md mb-2 object-cover border border-black/5" />
                    )}
                    <p className="text-[14.5px] font-medium text-[#0c0c0c] leading-[1.6] whitespace-pre-wrap tracking-wide">
                      {msg.text}
                    </p>
                  </div>
                </div>
              )
            ))}
            {isLoading && (
              <div className="flex items-end gap-3 max-w-[90%] animate-in slide-in-from-bottom-2 fade-in duration-500 ease-out">
                <div className="shrink-0 grid place-items-center h-7 w-7 rounded-[10px] bg-white/[0.05] border border-white/[0.06]">
                  <Sparkles size={12} className="text-white/70" />
                </div>
                <div className="rounded-[20px] rounded-bl-[6px] bg-[#161616] border border-white/[0.04] px-5 py-4 flex items-center gap-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex flex-col gap-2.5 mt-2 shrink-0">
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
            <button
              onClick={() => setTrackFood(v => !v)}
              className={`flex items-center justify-between w-full rounded-2xl px-4 py-2.5 border transition-all duration-300 ${trackFood
                  ? "bg-white/[0.06] border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                  : "bg-white/[0.02] border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.03]"
                }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`grid place-items-center h-7 w-7 rounded-full transition-all duration-300 ${trackFood ? "bg-white/20" : "bg-white/[0.04]"
                  }`}>
                  <Utensils size={14} className={trackFood ? "text-white" : "text-white/30"} strokeWidth={1.8} />
                </div>
                <div className="flex flex-col items-start">
                  <span className={`text-[12px] font-medium leading-none ${trackFood ? "text-white" : "text-white/40"}`}>
                    Log Food Intake
                  </span>
                  <span className="text-[10px] text-white/20 mt-0.5 leading-none">
                    {trackFood ? "Next message will update your macros" : "Tap to track what you eat"}
                  </span>
                </div>
              </div>
              <div className={`relative h-5 w-9 rounded-full transition-all duration-300 ${trackFood ? "bg-white" : "bg-white/10"
                }`}>
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-[#0c0c0c] shadow-sm transition-all duration-300 ${trackFood ? "left-[18px]" : "left-0.5"
                  }`} />
              </div>
            </button>

            <div className="relative flex items-center">
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
                  className="grid place-items-center h-[36px] w-[36px] rounded-full text-white/40 hover:text-white hover:bg-white/[0.05] transition-all"
                >
                  <ImageIcon size={16} strokeWidth={1.8} />
                </button>
                <button
                  onClick={toggleRecording}
                  className={`grid place-items-center h-[36px] w-[36px] rounded-full transition-all ${isRecording
                      ? "text-white bg-white/10 animate-pulse"
                      : "text-white/40 hover:text-white hover:bg-white/[0.05]"
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
                className={`relative w-full rounded-full bg-[#141414] border pl-[88px] pr-14 py-3.5 text-[14px] text-white placeholder-white/20 outline-none transition-all shadow-[inset_0_2px_20px_rgba(0,0,0,0.4)] ${trackFood
                    ? "border-white/20 focus:border-white/30"
                    : "border-white/[0.05] focus:border-white/15 focus:bg-[#181818]"
                  }`}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || (!inputValue.trim() && !attachedImage)}
                className="absolute right-1.5 grid place-items-center h-[38px] w-[38px] rounded-full bg-white text-[#0c0c0c] transition-all active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:pointer-events-none hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:scale-105"
              >
                <Send size={15} className="ml-0.5" strokeWidth={2.2} />
              </button>
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