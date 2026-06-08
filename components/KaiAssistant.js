"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Sparkles, Plus, Send, Mic, Image as ImageIcon, X, Utensils } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useKai } from "@/lib/hooks/useKai";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';

const TypewriterMarkdown = ({ content, animateInit, onType }) => {
  const [displayedText, setDisplayedText] = useState(animateInit ? "" : content);
  const [isTyping, setIsTyping] = useState(animateInit && content.length > 0);

  useEffect(() => {
    if (!animateInit) {
      setDisplayedText(content);
      setIsTyping(false);
      return;
    }

    if (displayedText.length >= content.length) {
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    const interval = setInterval(() => {
      setDisplayedText((prev) => {
        // Slower generation: 1 character per 16ms (approx 60 chars/sec)
        const nextLen = prev.length + 1; 
        if (nextLen >= content.length) {
          clearInterval(interval);
          setIsTyping(false);
          if (onType) requestAnimationFrame(onType);
          return content;
        }
        if (onType && nextLen % 2 === 0) requestAnimationFrame(onType);
        return content.substring(0, nextLen);
      });
    }, 16);

    return () => clearInterval(interval);
  }, [content, animateInit]);

  return (
    <div className={isTyping ? "typing-active" : ""}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 last:mb-0" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 last:mb-0" {...props} />,
          li: ({node, ...props}) => <li className="mb-1" {...props} />,
          strong: ({node, ...props}) => <strong className="font-semibold text-white" {...props} />,
          table: ({node, ...props}) => <table className="w-full text-[13px] border-collapse my-3" {...props} />,
          thead: ({node, ...props}) => <thead className="border-b border-white/10" {...props} />,
          th: ({node, ...props}) => <th className="text-left font-semibold uppercase tracking-[0.05em] text-white/50 pb-2 pr-4" {...props} />,
          td: ({node, ...props}) => <td className="text-white/80 py-2 pr-4 border-b border-white/5" {...props} />,
          tr: ({node, ...props}) => <tr className="hover:bg-white/[0.02] transition-colors" {...props} />,
          code: ({node, inline, children, ...props}) => {
            if (children && children[0] === 'ᑢ') {
              return <span className="inline-cursor" />;
            }
            return <code className="bg-white/10 rounded px-1.5 py-0.5 text-[13px] font-mono text-[#6ee7b7]" {...props}>{children}</code>;
          },
        }}
      >
        {displayedText + (isTyping ? " `ᑢ`" : "")}
      </ReactMarkdown>
    </div>
  );
};

export default function KaiAssistant({ isOpen, onClose, consumed, calorieTarget, macros, onNutritionUpdate }) {
  const { data: session } = authClient.useSession();
  const userName = session?.user?.name?.split(" ")[0] || "there";

  const { messages: kaiMessages, loading: isLoading, error: kaiError, sendMessage: kaiSendMessage } = useKai();
  
  const displayMessages = [
    { role: 'assistant', content: `${userName} wassup` },
    ...kaiMessages
  ];

  const [inputValue, setInputValue] = useState("");
  const [transcribing, setTranscribing] = useState(false);
  const [attachedImage, setAttachedImage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [nutritionToast, setNutritionToast] = useState(null);
  const [trackFood, setTrackFood] = useState(false);

  const appliedNutritionKeys = useRef(new Set());

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      if (!inputValue) {
        textareaRef.current.style.height = '56px';
      } else {
        textareaRef.current.style.height = '56px';
        textareaRef.current.style.height = Math.min(Math.max(textareaRef.current.scrollHeight, 56), 168) + 'px';
      }
    }
  }, [inputValue]);

  const scrollContainerRef = useRef(null);
  const userScrolledUpRef = useRef(false);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // If the user scrolls up more than 40px from the bottom, lock auto-scroll
    userScrolledUpRef.current = scrollHeight - scrollTop - clientHeight > 40;
  };

  const scrollToBottom = (behavior = "auto") => {
    if (!userScrolledUpRef.current && scrollContainerRef.current) {
      if (behavior === "smooth") {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: "smooth"
        });
      } else {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom("smooth");
  }, [kaiMessages, isLoading, isOpen]);

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

          setTranscribing(true);
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
            setTranscribing(false);
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

  const executeSend = async (textToSend) => {
    if ((!textToSend.trim() && !attachedImage) || isLoading) return;
    const finalText = attachedImage ? `${textToSend} [image attached]`.trim() : textToSend;
    userScrolledUpRef.current = false; // Reset user scroll lock on new send
    kaiSendMessage(finalText);
    setInputValue("");
    setAttachedImage(null);
  };

  const [pendingMessage, setPendingMessage] = useState(null);

  const sendMessage = async () => {
    if ((!inputValue.trim() && !attachedImage) || isLoading || transcribing) return;

    const t = inputValue.toLowerCase();
    const hasWeight = /\b\d+(\.\d+)?\s*(g|gram|grams|kg|kilo|kilos|oz|lbs|ml)\b/.test(t) || /\b\d+\s*(pieces|piece|serving|servings|katori|cup|cups|tbsp|tsp|glass|bowl)\b/.test(t);
    const hasRawOrCooked = t.includes("raw") || t.includes("cooked") || t.includes("boiled") || t.includes("fried") || t.includes("grilled") || t.includes("baked") || t.includes("roasted") || t.includes("steamed");

    if (isNewConsumptionReport(t) && hasWeight && !hasRawOrCooked) {
      setPendingMessage(inputValue);
      return;
    }

    executeSend(inputValue);
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="absolute inset-0 z-[99999] flex flex-col justify-center items-center p-4">
      {/* Backdrop with ultra-premium blur */}
      <div
        className="absolute inset-0 animate-in fade-in duration-500"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(6,7,10,0.6) 0%, rgba(0,0,0,0.98) 100%)", backdropFilter: "blur(40px) saturate(150%)", WebkitBackdropFilter: "blur(40px) saturate(150%)" }}
        onClick={onClose}
      />

      {/* Card Modal */}
      <div 
        className="relative w-full max-w-[380px] rounded-[32px] px-6 pt-6 pb-6 animate-in zoom-in-90 fade-in duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] overflow-hidden"
        style={{ 
          background: "linear-gradient(160deg, rgba(21,23,29,0.9) 0%, rgba(6,7,10,0.95) 100%)", 
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.04)",
          boxShadow: "inset 0 1px 1px rgba(255,255,255,0.15), inset 0 0 40px rgba(255,255,255,0.02), 0 40px 80px -20px rgba(0,0,0,1), 0 0 0 1px rgba(255,255,255,0.05), 0 0 40px rgba(255,255,255,0.03)"
        }}
      >
        {/* Ultra-Premium Edge Bloom */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] pointer-events-none z-[2]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)", boxShadow: "0 1px 25px 2px rgba(255,255,255,0.15)" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[1px] pointer-events-none z-[2]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)", boxShadow: "0 1px 15px 1px rgba(255,255,255,0.25)" }} />
        
        {/* Metallic Grain overlay */}
        <div className="absolute inset-0 pointer-events-none mix-blend-overlay z-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E\")" }} />

        {/* Nutrition Toast */}
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-30 transition-all duration-500 ${nutritionToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'}`}>
          <div 
            className="flex items-center gap-3 backdrop-blur-xl rounded-full px-5 py-2.5"
            style={{
              background: "rgba(6,7,10,0.85)",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: "0 10px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 20px rgba(255,255,255,0.05)"
            }}
          >
            <span className="text-white text-sm" style={{ textShadow: "0 0 10px rgba(255,255,255,0.5)" }}>✦</span>
            <span className="text-[13px] font-medium text-[#f1f5f9] tracking-wide">{nutritionToast}</span>
            <span className="text-[10px] text-white/30">· Dashboard updated</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8 relative z-10">
          <div className="flex flex-col">
            <h2 className="text-[26px] font-bold tracking-[-0.03em] leading-none text-white mb-1.5" style={{ textShadow: "0 2px 10px rgba(255,255,255,0.1)" }}>Kai</h2>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-30" style={{ boxShadow: "0 0 10px 1px rgba(255,255,255,0.3)" }}></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" style={{ boxShadow: "0 0 6px 1px rgba(255,255,255,0.5)" }}></span>
              </span>
              <p className="text-[14px] text-white/60 leading-none font-medium tracking-wide">AI Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid place-items-center h-9 w-9 rounded-full transition-all active:scale-[0.97]"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}
            onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#ffffff"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
          >
            <Plus size={19} className="rotate-45" strokeWidth={1.5} />
          </button>
        </div>

        <div className="relative z-10 flex flex-col h-[560px]">
          {pendingMessage && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm rounded-[32px] animate-in fade-in duration-200">
              <div className="w-full bg-[#0d1426] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 text-white">
                  <Utensils size={18} className="text-amber-400" />
                  <h3 className="font-semibold text-[15px] tracking-wide">Raw or Cooked?</h3>
                </div>
                <p className="text-[13px] text-white/70 leading-relaxed font-light">
                  You entered a weight but didn't specify if it's raw or cooked. Macros differ significantly!
                </p>
                <div className="flex gap-3 mt-2">
                  <button 
                    onClick={() => {
                      const finalMsg = pendingMessage + " (raw)";
                      setPendingMessage(null);
                      executeSend(finalMsg);
                    }}
                    className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[13px] font-medium border border-white/10 transition-colors active:scale-95"
                  >
                    Raw
                  </button>
                  <button 
                    onClick={() => {
                      const finalMsg = pendingMessage + " (cooked)";
                      setPendingMessage(null);
                      executeSend(finalMsg);
                    }}
                    className="flex-1 py-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[13px] font-medium border border-amber-500/20 transition-colors active:scale-95"
                  >
                    Cooked
                  </button>
                </div>
                <button 
                  onClick={() => setPendingMessage(null)}
                  className="mt-1 text-[12px] text-white/40 hover:text-white/70 py-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {/* Chat Display */}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 flex flex-col gap-4 pb-4 overflow-y-auto pr-1 pl-0.5 custom-scrollbar"
          >
            <div className="flex-1" />

            {displayMessages.map((msg, idx) => (
              msg.role === "assistant" ? (
                <div key={idx} className="flex items-end gap-3 max-w-[90%] animate-in slide-in-from-bottom-2 fade-in duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
                  <div className="shrink-0 grid place-items-center h-7 w-7 rounded-full" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.05)" }}>
                    <Sparkles size={12} className="text-white" />
                  </div>
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div 
                      className="rounded-[20px] rounded-bl-[8px] px-4 py-3.5"
                      style={{ 
                        background: "linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)", 
                        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.08), 0 4px 15px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.03)",
                        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)"
                      }}
                    >
                      <div className="text-[15px] font-normal text-[#f8fafc] leading-[1.6] break-words tracking-[0.01em]">
                        <TypewriterMarkdown 
                          content={msg.content} 
                          animateInit={idx === displayMessages.length - 1 && idx > 0} 
                          onType={() => scrollToBottom("auto")}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={idx} className="flex items-end self-end gap-2.5 max-w-[85%] min-w-0 animate-in slide-in-from-bottom-2 fade-in duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
                  <div 
                    className="rounded-[20px] rounded-br-[8px] px-4 py-3.5 min-w-0"
                    style={{ background: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)", boxShadow: "0 4px 15px rgba(255,255,255,0.05), inset 0 1px 1px rgba(255,255,255,1)" }}
                  >
                    <p className="text-[15px] font-medium text-[#0f172a] leading-[1.6] whitespace-pre-wrap break-words tracking-[0.01em]">
                      {msg.content}
                    </p>
                  </div>
                </div>
              )
            ))}
            {kaiError && (
              <div className="text-red-400 text-[13px] text-center my-2 animate-in fade-in">{kaiError}</div>
            )}
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
          <div className="flex flex-col mt-2 shrink-0">
            {/* Image Preview */}
            {attachedImage && (
              <div className="relative self-start ml-1 mb-4">
                <img src={attachedImage} alt="Preview" className="h-16 w-16 object-cover rounded-xl border border-white/[0.1] shadow-md" />
                <button
                  onClick={() => setAttachedImage(null)}
                  className="absolute -top-2 -right-2 grid place-items-center h-5 w-5 bg-white/90 rounded-full text-[#0c0c0c] shadow-lg hover:bg-white transition-colors"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-[11px] font-semibold tracking-[0.1em] uppercase text-white/30">Message Kai</label>
                
                {/* Ultra-Compact Mode Pill */}
                <button
                  onClick={() => setTrackFood(v => !v)}
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-all duration-300 active:scale-[0.94]"
                  style={{
                    background: trackFood ? "rgba(255,255,255,0.08)" : "transparent",
                    boxShadow: trackFood ? "inset 0 1px 1px rgba(255,255,255,0.15), 0 0 12px rgba(255,255,255,0.08), 0 0 0 1px rgba(255,255,255,0.15)" : "0 0 0 1px rgba(255,255,255,0.04)",
                  }}
                >
                  <Utensils size={12} className={trackFood ? "text-white" : "text-white/40"} strokeWidth={trackFood ? 2.5 : 2} style={{ filter: trackFood ? "drop-shadow(0 0 4px rgba(255,255,255,0.6))" : "none" }} />
                  <span className={`text-[11px] font-semibold leading-none tracking-[0.04em] ${trackFood ? "text-white" : "text-white/40"}`} style={{ textShadow: trackFood ? "0 0 6px rgba(255,255,255,0.5)" : "none", marginTop: "1px" }}>
                    {trackFood ? "Log Mode" : "Food Log"}
                  </span>
                </button>
              </div>
              <div className="relative flex items-end">
                <div className="absolute left-2 bottom-[10px] flex items-center gap-1 z-10">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="grid place-items-center h-[36px] w-[36px] rounded-[10px] text-white/40 hover:text-white hover:bg-white/[0.05] transition-all active:scale-[0.97]"
                  >
                    <ImageIcon size={16} strokeWidth={1.8} />
                  </button>
                  <button
                    onClick={toggleRecording}
                    className={`grid place-items-center h-[36px] w-[36px] rounded-[10px] transition-all active:scale-[0.97] ${
                      isRecording ? "text-[#f87171] bg-[#f87171]/10 animate-pulse" : "text-white/40 hover:text-white hover:bg-white/[0.05]"
                    }`}
                  >
                    <Mic size={16} strokeWidth={1.8} />
                  </button>
                </div>

                  <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={trackFood ? "Tell Kai what you ate..." : "Ask Kai..."}
                  className="w-full rounded-[20px] pl-[96px] pr-14 py-[16px] text-[16px] outline-none transition-all duration-100 placeholder:text-white/40 resize-none overflow-y-auto custom-scrollbar"
                  style={{ 
                    height: "56px",
                    background: "rgba(0,0,0,0.3)",
                    color: "#ffffff",
                    boxShadow: trackFood ? "inset 0 2px 6px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.15), 0 0 20px rgba(255,255,255,0.05)" : "inset 0 2px 6px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)"
                  }}
                  onFocus={(e) => { e.currentTarget.style.boxShadow = trackFood ? "inset 0 2px 6px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.3), 0 0 25px rgba(255,255,255,0.1)" : "inset 0 2px 6px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.2), 0 0 15px rgba(255,255,255,0.05)"; }}
                  onBlur={(e) => { e.currentTarget.style.boxShadow = trackFood ? "inset 0 2px 6px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.15), 0 0 20px rgba(255,255,255,0.05)" : "inset 0 2px 6px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)"; }}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || transcribing || (!inputValue.trim() && !attachedImage)}
                  className="absolute right-2.5 bottom-[8px] grid place-items-center h-[40px] w-[40px] rounded-[14px] transition-all duration-300 active:scale-[0.92] disabled:opacity-20 disabled:scale-100 disabled:pointer-events-none group"
                  style={{ background: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)", color: "#020617", boxShadow: (isLoading || transcribing || (!inputValue.trim() && !attachedImage)) ? "none" : "0 6px 16px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.15)" }}
                >
                  <Send size={16} className={`mr-0.5 transition-transform duration-300 ${(isLoading || transcribing || (!inputValue.trim() && !attachedImage)) ? "" : "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"}`} strokeWidth={2.5} />
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
        .typing-active {
          position: relative;
          -webkit-mask-image: linear-gradient(-60deg, rgba(0,0,0,1) 30%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,1) 70%);
          -webkit-mask-size: 250% 100%;
          animation: text-super-shimmer 2s infinite linear;
          text-shadow: 0 0 12px rgba(110,231,183,0.35); /* Hot-off-the-press text glow */
        }
        @keyframes text-super-shimmer {
          0% { -webkit-mask-position: 250% 0; }
          100% { -webkit-mask-position: -250% 0; }
        }
        .inline-cursor {
          display: inline-block;
          width: 5px;
          height: 18px;
          margin-left: 6px;
          border-radius: 10px;
          background: #ffffff; /* Bright white hot center */
          vertical-align: middle;
          transform-origin: center;
          animation: cursor-super-pulse 0.6s cubic-bezier(0.25, 1, 0.5, 1) infinite alternate;
        }
        @keyframes cursor-super-pulse {
          0% { 
            transform: scaleY(0.8) scaleX(0.8); 
            opacity: 0.8; 
            box-shadow: 0 0 10px #6ee7b7, 0 0 20px #6ee7b7; 
          }
          100% { 
            transform: scaleY(1.2) scaleX(1.3); 
            opacity: 1; 
            box-shadow: 0 0 20px #6ee7b7, 0 0 40px #6ee7b7, 0 0 60px rgba(110,231,183,0.8); 
          }
        }
      `}</style>
    </div>,
    document.body
  );
}