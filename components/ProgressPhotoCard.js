"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, Camera, Trash2 } from "lucide-react";

export default function ProgressPhotoCard() {
  const [photo, setPhoto] = useState(null);
  const fileInputRef = useRef(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("twin_progress_photo_data");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const age = Date.now() - data.timestamp;
        if (age < 7 * 24 * 60 * 60 * 1000) {
          setPhoto(data.photo);
        } else {
          localStorage.removeItem("twin_progress_photo_data");
        }
      } catch (e) {
        // Fallback for old string format
        setPhoto(saved);
        localStorage.setItem("twin_progress_photo_data", JSON.stringify({ photo: saved, timestamp: Date.now() }));
      }
    } else {
      // Check legacy key
      const legacy = localStorage.getItem("twin_progress_photo");
      if (legacy) {
        setPhoto(legacy);
        localStorage.setItem("twin_progress_photo_data", JSON.stringify({ photo: legacy, timestamp: Date.now() }));
        localStorage.removeItem("twin_progress_photo");
      }
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
        localStorage.setItem("twin_progress_photo_data", JSON.stringify({
          photo: reader.result,
          timestamp: Date.now()
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPhoto(null);
    localStorage.removeItem("twin_progress_photo_data");
    localStorage.removeItem("twin_progress_photo");
  };

  return (
    <div
      onClick={() => !photo && fileInputRef.current?.click()}
      className={`relative z-10 w-full rounded-[24px] overflow-hidden transition-all duration-300 ${!photo ? "cursor-pointer press-scale" : ""}`}
      style={{
        background: "linear-gradient(165deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 0 0 1px rgba(255,255,255,0.03)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        minHeight: photo ? "200px" : "140px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {photo ? (
        <>
          <img
            src={photo}
            alt="Progress"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 0,
            }}
          />
          {/* Subtle gradient overlay to make buttons visible */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%)", zIndex: 1, pointerEvents: "none" }} />
          
          <button
            onClick={handleRemove}
            className="absolute top-4 right-4 h-10 w-10 rounded-full flex items-center justify-center press-scale"
            style={{
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#ffffff",
              zIndex: 2,
            }}
          >
            <Trash2 size={18} strokeWidth={2} />
          </button>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", pointerEvents: "none" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "16px",
            background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), inset 0 0 0 1px rgba(255,255,255,0.05)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#34d399"
          }}>
            <Plus size={28} strokeWidth={2} />
          </div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.02em" }}>
            Add Progress Photo
          </div>
        </div>
      )}
    </div>
  );
}
