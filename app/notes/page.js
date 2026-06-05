"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    Menu, Search, X, Plus, Trash2, Settings, FileText,
    Clock, BookOpen, Hash, Star, Feather, Home, User,
} from "lucide-react";

/* ─── utilities ─── */
const generateId = () => Math.random().toString(36).slice(2, 10);

const formatDate = (date) => {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const wordCount = (text) =>
    text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

const readingTime = (text) => {
    const mins = Math.ceil(wordCount(text) / 200);
    return mins < 1 ? "< 1 min" : `${mins} min`;
};

const excerpt = (text, len = 60) => {
    const clean = text.replace(/\n+/g, " ").trim();
    return clean.length > len ? clean.slice(0, len) + "…" : clean || "No content";
};


/* ─── main component ─── */
export default function NotesApp() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [titleValue, setTitleValue] = useState("");
    const [bodyValue, setBodyValue] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const bodyRef = useRef(null);
    const titleRef = useRef(null);
    const saveTimer = useRef(null);
    const drawerRef = useRef(null);

    const activeNote = notes.find((n) => n.id === activeId) ?? null;

    // ── Load notes from DB on mount ──
    useEffect(() => {
        fetch("/api/notes", { credentials: "include" })
            .then((r) => r.json())
            .then((data) => { setNotes(data.notes ?? []); setLoading(false); })
            .catch((err) => { console.error(err); setLoading(false); });
    }, []);

    useEffect(() => {
        if (activeNote) {
            setTitleValue(activeNote.title);
            setBodyValue(activeNote.body);
        } else {
            setTitleValue("");
            setBodyValue("");
        }
    }, [activeId]);

    useEffect(() => {
        if (bodyRef.current) {
            bodyRef.current.style.height = "auto";
            bodyRef.current.style.height = bodyRef.current.scrollHeight + "px";
        }
    }, [bodyValue]);

    // ── Debounced save to DB ──
    const scheduleSave = useCallback(
        (title, body) => {
            if (!activeId) return;
            clearTimeout(saveTimer.current);
            setSaving(true);
            setSaved(false);
            saveTimer.current = setTimeout(async () => {
                const finalTitle = title || "Untitled";
                const now = new Date().toISOString();
                setNotes((prev) =>
                    prev.map((n) =>
                        n.id === activeId
                            ? { ...n, title: finalTitle, body, updatedAt: now }
                            : n
                    )
                );
                await fetch("/api/notes", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ id: activeId, title: finalTitle, body }),
                }).catch(console.error);
                setSaving(false);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }, 700);
        },
        [activeId]
    );

    const handleTitleChange = (e) => { setTitleValue(e.target.value); scheduleSave(e.target.value, bodyValue); };
    const handleBodyChange = (e) => { setBodyValue(e.target.value); scheduleSave(titleValue, e.target.value); };

    // ── Create note ──
    const createNote = async () => {
        const now = new Date().toISOString();
        const note = { id: generateId(), title: "Untitled", body: "", createdAt: now, updatedAt: now, starred: false };
        setNotes((prev) => [note, ...prev]);
        setActiveId(note.id);
        setDrawerOpen(false);
        setTimeout(() => titleRef.current?.focus(), 80);
        await fetch("/api/notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(note),
        }).catch(console.error);
    };

    // ── Delete note ──
    const deleteNote = async (id) => {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        if (activeId === id) setActiveId(null);
        setDeleteConfirm(null);
        await fetch(`/api/notes?id=${id}`, { method: "DELETE", credentials: "include" }).catch(console.error);
    };

    // ── Toggle star ──
    const toggleStar = async (id) => {
        const note = notes.find((n) => n.id === id);
        if (!note) return;
        const newStarred = !note.starred;
        setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, starred: newStarred } : n)));
        await fetch("/api/notes", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ id, starred: newStarred }),
        }).catch(console.error);
    };

    useEffect(() => {
        const handler = (e) => {
            if (drawerOpen && drawerRef.current && !drawerRef.current.contains(e.target))
                setDrawerOpen(false);
        };
        document.addEventListener("mousedown", handler);
        document.addEventListener("touchstart", handler);
        return () => {
            document.removeEventListener("mousedown", handler);
            document.removeEventListener("touchstart", handler);
        };
    }, [drawerOpen]);

    const filteredNotes = notes.filter(
        (n) =>
            n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.body.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const starredNotes = filteredNotes.filter((n) => n.starred);
    const unstarredNotes = filteredNotes.filter((n) => !n.starred);

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400&family=Barlow+Condensed:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          /* ── Navy-blue training palette (extracted from reference) ── */
          --bg-deep:       #080c14;
          --bg-base:       #0a0f1e;
          --bg-surface:    #0d1426;
          --bg-card:       #101829;
          --bg-card-hover: #131d30;
          --bg-elevated:   #162035;

          --blue-vivid:    #3b8cf8;
          --blue-bright:   #60a5fa;
          --blue-glow:     #2563eb;
          --blue-dim:      rgba(59,140,248,0.12);
          --blue-border:   rgba(59,140,248,0.22);
          --blue-strong:   rgba(59,140,248,0.35);

          --border-faint:  rgba(255,255,255,0.05);
          --border-subtle: rgba(255,255,255,0.08);
          --border-mid:    rgba(59,140,248,0.15);
          --border-active: rgba(59,140,248,0.40);

          --text-primary:  #e8edf8;
          --text-secondary:#8fa3c0;
          --text-muted:    #3d5070;
          --text-accent:   #60a5fa;
          --text-label:    #3b8cf8;

          --radius-sm:  8px;
          --radius-md:  12px;
          --radius-lg:  16px;
          --radius-xl:  20px;
          --radius-2xl: 26px;
          --radius-full: 9999px;

          --shadow-card: 0 2px 12px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04);
          --shadow-glow: 0 0 24px rgba(59,140,248,0.18);
          --shadow-lg:   0 8px 32px rgba(0,0,0,0.5);

          --font-display: 'Barlow Condensed', 'Arial Narrow', sans-serif;
          --font-body:    'Barlow', system-ui, sans-serif;
          --font-mono:    'JetBrains Mono', monospace;

          --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
          --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
          --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
        }

        html, body { height: 100%; overflow: hidden; background: var(--bg-deep); }
        body {
          font-family: var(--font-body);
          color: var(--text-primary);
          -webkit-font-smoothing: antialiased;
        }

        ::selection { background: rgba(59,140,248,0.25); color: var(--text-accent); }
        ::-webkit-scrollbar { width: 0; }
        textarea, input { font-family: inherit; color: inherit; background: transparent; border: none; outline: none; resize: none; -webkit-tap-highlight-color: transparent; }
        button { cursor: pointer; font-family: var(--font-body); -webkit-tap-highlight-color: transparent; }

        /* ── Drawer overlay ── */
        .drawer-overlay {
          position: fixed; inset: 0;
          background: rgba(4, 7, 18, 0.72);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 40; opacity: 0; pointer-events: none;
          transition: opacity 0.32s var(--ease-smooth);
        }
        .drawer-overlay.open { opacity: 1; pointer-events: all; }

        /* ── Drawer panel ── */
        .drawer-panel {
          position: fixed; top: 0; left: 0; bottom: 0;
          width: min(82vw, 300px);
          background: linear-gradient(180deg,
            rgba(10,15,30,0.98) 0%,
            rgba(9,13,26,0.99) 60%,
            rgba(8,11,22,1) 100%
          );
          border-right: 1px solid rgba(59,140,248,0.18);
          z-index: 50;
          transform: translateX(-100%);
          transition: transform 0.38s var(--ease-out);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow:
            6px 0 48px rgba(0,0,0,0.7),
            1px 0 0 rgba(59,140,248,0.08),
            inset -1px 0 0 rgba(255,255,255,0.03);
        }
        .drawer-panel.open { transform: translateX(0); }

        /* scanline texture overlay */
        .drawer-panel::before {
          content: '';
          position: absolute; inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.08) 2px,
            rgba(0,0,0,0.08) 4px
          );
          pointer-events: none;
          z-index: 0;
        }

        /* top edge glow */
        .drawer-panel::after {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(59,140,248,0.5) 40%,
            rgba(96,165,250,0.3) 70%,
            transparent 100%
          );
          z-index: 2;
        }

        /* drawer scroll area */
        .drawer-scroll {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          position: relative;
          z-index: 1;
          padding-bottom: 72px;
        }
        .drawer-scroll::-webkit-scrollbar { width: 2px; }
        .drawer-scroll::-webkit-scrollbar-track { background: transparent; }
        .drawer-scroll::-webkit-scrollbar-thumb {
          background: rgba(59,140,248,0.2);
          border-radius: 2px;
        }

        /* ── Drawer header ── */
        .drawer-header {
          position: relative;
          z-index: 1;
          padding: 52px 18px 20px;
          border-bottom: 1px solid rgba(59,140,248,0.10);
          background: linear-gradient(180deg,
            rgba(37,99,235,0.07) 0%,
            transparent 100%
          );
          overflow: hidden;
          flex-shrink: 0;
        }
        .drawer-header::before {
          content: '';
          position: absolute;
          top: -60px; left: -40px;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 65%);
          pointer-events: none;
        }

        /* ── Profile card ── */
        .profile-card {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
          padding: 12px 14px;
          border-radius: var(--radius-lg);
          background: rgba(59,140,248,0.06);
          border: 1px solid rgba(59,140,248,0.12);
          position: relative;
          overflow: hidden;
        }
        .profile-card::after {
          content: '';
          position: absolute;
          top: 0; right: 0;
          width: 60px; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(59,140,248,0.04));
          pointer-events: none;
        }

        .avatar-ring {
          width: 42px; height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(37,99,235,0.5), rgba(59,140,248,0.2));
          border: 1.5px solid rgba(59,140,248,0.40);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 0 14px rgba(59,140,248,0.25), inset 0 1px 0 rgba(255,255,255,0.08);
          animation: pulse-ring 3s ease-out infinite;
        }

        /* ── New note button ── */
        .new-note-btn {
          width: 100%;
          padding: 11px 16px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, rgba(37,99,235,0.30) 0%, rgba(59,140,248,0.16) 100%);
          border: 1px solid rgba(59,140,248,0.28);
          color: var(--blue-bright);
          font-family: var(--font-body);
          font-size: 13px; font-weight: 700;
          letter-spacing: 0.10em; text-transform: uppercase;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          position: relative; overflow: hidden;
          transition: all 0.2s var(--ease-smooth);
          box-shadow: 0 2px 12px rgba(37,99,235,0.15), inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .new-note-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%);
          pointer-events: none;
        }
        .new-note-btn:hover {
          background: linear-gradient(135deg, rgba(37,99,235,0.48) 0%, rgba(59,140,248,0.28) 100%);
          border-color: rgba(59,140,248,0.50);
          box-shadow: 0 0 20px rgba(59,140,248,0.28), 0 2px 12px rgba(0,0,0,0.3);
          transform: translateY(-1px);
        }
        .new-note-btn:active { transform: scale(0.97) translateY(0); }

        /* ── Section label ── */
        .section-label {
          font-family: var(--font-mono);
          font-size: 9px; font-weight: 500;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(59,140,248,0.55);
          padding: 20px 18px 8px;
          display: flex; align-items: center; gap: 8px;
          position: relative; z-index: 1;
        }
        .section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(59,140,248,0.15), transparent);
        }

        /* ── Note list items ── */
        .note-item {
          position: relative;
          padding: 13px 14px 13px 18px;
          margin: 0 10px 4px;
          border-radius: var(--radius-md);
          cursor: pointer;
          border: 1px solid transparent;
          transition: background 0.18s var(--ease-smooth), border-color 0.18s, transform 0.15s var(--ease-spring);
          overflow: hidden;
          z-index: 1;
        }
        /* left accent bar */
        .note-item::before {
          content: '';
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 2px;
          border-radius: 0 2px 2px 0;
          background: rgba(59,140,248,0.0);
          transition: background 0.2s, top 0.2s, bottom 0.2s;
        }
        .note-item:hover {
          background: rgba(59,140,248,0.07);
          border-color: rgba(59,140,248,0.12);
          transform: translateX(2px);
        }
        .note-item:hover::before {
          background: rgba(59,140,248,0.35);
          top: 25%; bottom: 25%;
        }
        .note-item.active {
          background: linear-gradient(135deg, rgba(37,99,235,0.14) 0%, rgba(59,140,248,0.07) 100%);
          border-color: rgba(59,140,248,0.28);
          transform: translateX(3px);
          box-shadow: inset 0 0 16px rgba(37,99,235,0.05), 0 2px 8px rgba(0,0,0,0.2);
        }
        .note-item.active::before {
          background: linear-gradient(180deg, #60a5fa, #3b8cf8);
          top: 15%; bottom: 15%;
          box-shadow: 0 0 8px rgba(59,140,248,0.6);
        }

        /* shimmer on active */
        .note-item.active::after {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%);
          pointer-events: none;
        }

        .note-item .del-btn {
          position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
          opacity: 0; padding: 6px; border-radius: 8px;
          background: none; border: none; color: rgba(180,80,70,0.6);
          transition: opacity 0.15s, background 0.15s, color 0.15s, transform 0.15s;
        }
        .note-item:hover .del-btn { opacity: 1; }
        .note-item .del-btn:hover {
          background: rgba(220,60,60,0.14);
          color: #ef4444;
          transform: translateY(-50%) scale(1.1);
        }

        /* ── Drawer settings footer ── */
        .drawer-footer {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 16px 20px;
          background: linear-gradient(180deg, rgba(8,11,22,0.6) 0%, rgba(8,11,22,1) 30%);
          border-top: 1px solid rgba(59,140,248,0.15);
          z-index: 2;
          backdrop-filter: blur(8px);
        }
        .settings-btn {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 14px 16px;
          border-radius: var(--radius-md);
          background: rgba(59,140,248,0.05);
          border: 1px solid rgba(59,140,248,0.15);
          color: var(--blue-bright);
          font-family: var(--font-body);
          font-size: 13px; font-weight: 600;
          letter-spacing: 0.05em; text-transform: uppercase;
          transition: all 0.2s var(--ease-spring);
        }
        .settings-btn:hover {
          background: rgba(59,140,248,0.12);
          border-color: rgba(59,140,248,0.3);
          box-shadow: 0 4px 12px rgba(59,140,248,0.15);
          transform: translateY(-2px);
        }
        .settings-btn:active {
          transform: translateY(1px) scale(0.98);
        }

        .separator {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(59,140,248,0.10), transparent);
          margin: 6px 16px;
        }

        /* ── Icon button ── */
        .icon-btn {
          width: 38px; height: 38px; border-radius: var(--radius-md);
          background: transparent; border: none;
          color: var(--text-secondary);
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, color 0.15s, transform 0.15s var(--ease-spring);
        }
        .icon-btn:hover { background: rgba(59,140,248,0.10); color: var(--text-accent); }
        .icon-btn:active { transform: scale(0.88); }

        /* ── Home button ── */
        .home-btn {
          width: 38px; height: 38px; border-radius: var(--radius-md);
          background: rgba(59,140,248,0.08);
          border: 1px solid var(--blue-border);
          color: var(--blue-bright);
          display: flex; align-items: center; justify-content: center;
          text-decoration: none;
          transition: background 0.15s, transform 0.15s var(--ease-spring), box-shadow 0.15s;
        }
        .home-btn:hover {
          background: rgba(59,140,248,0.16);
          box-shadow: 0 0 12px rgba(59,140,248,0.25);
          transform: scale(1.06);
        }
        .home-btn:active { transform: scale(0.90); }

        /* ── FAB ── */
        .fab {
          position: fixed;
          bottom: max(28px, env(safe-area-inset-bottom, 28px));
          right: 22px;
          width: 54px; height: 54px;
          border-radius: var(--radius-full);
          border: 1px solid var(--blue-strong);
          background: linear-gradient(135deg, rgba(37,99,235,0.35) 0%, rgba(59,140,248,0.20) 100%);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 0 28px rgba(59,140,248,0.25), 0 4px 20px rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center;
          color: var(--blue-bright);
          z-index: 30;
          transition: transform 0.2s var(--ease-spring), box-shadow 0.2s, background 0.2s;
        }
        .fab:hover { background: linear-gradient(135deg, rgba(37,99,235,0.50) 0%, rgba(59,140,248,0.35) 100%); transform: scale(1.06); box-shadow: 0 0 36px rgba(59,140,248,0.35), 0 6px 24px rgba(0,0,0,0.5); }
        .fab:active { transform: scale(0.88); }

        /* ── Search bar ── */
        .search-bar {
          position: fixed; top: 0; left: 0; right: 0; height: 62px;
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border-mid);
          display: flex; align-items: center; padding: 0 14px; gap: 10px;
          z-index: 35;
          transform: translateY(-100%);
          transition: transform 0.26s var(--ease-out);
        }
        .search-bar.open { transform: translateY(0); }

        /* ── Section label ── */
        .section-label {
          font-family: var(--font-display);
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--text-label);
          padding: 18px 20px 7px;
        }

        .separator { height: 1px; background: var(--border-faint); margin: 6px 16px; }

        /* ── Note editor ── */
        .note-title {
          width: 100%;
          font-family: var(--font-display);
          font-size: 30px; font-weight: 700;
          line-height: 1.2;
          color: var(--text-primary);
          letter-spacing: 0.2px;
        }
        .note-title::placeholder { color: var(--text-muted); }

        .note-body {
          width: 100%;
          font-family: var(--font-body);
          font-size: 15.5px; font-weight: 300;
          line-height: 1.76;
          color: rgba(232,237,248,0.78);
          letter-spacing: 0.01em;
          min-height: 180px;
        }
        .note-body::placeholder { color: var(--text-muted); }

        /* ── Animations ── */
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fade-up 0.38s var(--ease-out) both; }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-9px); }
        }
        .float { animation: float 3.6s ease-in-out infinite; }

        @keyframes pulse-ring {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59,140,248,0.3); }
          70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(59,140,248,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59,140,248,0); }
        }

        @keyframes blink-dot {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 1; }
        }
        .blink-dot { animation: blink-dot 1s ease-in-out infinite; }

        @keyframes saved-flash {
          0% { opacity: 0; transform: translateY(3px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        .saved-flash { animation: saved-flash 2s var(--ease-out) forwards; }

        /* ── Confirm sheet ── */
        .confirm-overlay {
          position: fixed; inset: 0;
          background: rgba(4,7,18,0.80);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 60;
          display: flex; align-items: flex-end;
          padding-bottom: max(20px, env(safe-area-inset-bottom, 20px));
          opacity: 0; pointer-events: none;
          transition: opacity 0.25s;
        }
        .confirm-overlay.open { opacity: 1; pointer-events: all; }
        .confirm-sheet {
          width: 100%;
          background: var(--bg-elevated);
          border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
          border-top: 1px solid var(--border-mid);
          padding: 24px 20px 16px;
          transform: translateY(20px);
          transition: transform 0.3s var(--ease-out);
        }
        .confirm-overlay.open .confirm-sheet { transform: translateY(0); }

        /* ── Card ── */
        .menu-card {
          display: flex; align-items: center;
          padding: 15px 16px; gap: 14px;
          border-radius: var(--radius-lg);
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          box-shadow: var(--shadow-card);
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, transform 0.15s var(--ease-spring);
          text-decoration: none;
        }
        .menu-card:hover { background: var(--bg-card-hover); border-color: var(--blue-border); transform: translateY(-1px); }
        .menu-card:active { transform: scale(0.98); }

        .card-icon {
          width: 44px; height: 44px; border-radius: var(--radius-md);
          background: rgba(59,140,248,0.12);
          border: 1px solid rgba(59,140,248,0.20);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          color: var(--blue-bright);
        }

        /* ── Gradient mesh bg ── */
        .mesh-bg {
          position: absolute; inset: 0; pointer-events: none; overflow: hidden; border-radius: inherit;
        }
        .mesh-bg::before {
          content: ''; position: absolute;
          top: -40%; left: -20%; width: 80%; height: 80%;
          background: radial-gradient(ellipse, rgba(37,99,235,0.10) 0%, transparent 70%);
        }
        .mesh-bg::after {
          content: ''; position: absolute;
          bottom: -30%; right: -10%; width: 60%; height: 60%;
          background: radial-gradient(ellipse, rgba(59,140,248,0.07) 0%, transparent 70%);
        }
      `}</style>

            {/* root shell */}
            <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: "var(--bg-deep)", overflow: "hidden", position: "relative" }}>

                {/* ambient glow orbs */}
                <div style={{ position: "fixed", top: "-15%", left: "-10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
                <div style={{ position: "fixed", bottom: "20%", right: "-15%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,140,248,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

                {/* ── Drawer Overlay ── */}
                <div className={`drawer-overlay ${drawerOpen ? "open" : ""}`} onClick={() => setDrawerOpen(false)} />

                {/* ── Sidebar Drawer ── */}
                <aside ref={drawerRef} className={`drawer-panel ${drawerOpen ? "open" : ""}`}>

                    {/* ── Header ── */}
                    <div className="drawer-header">
                        {/* profile card */}
                        <div className="profile-card">
                            <div className="avatar-ring">
                                <User size={17} color="var(--blue-bright)" strokeWidth={1.5} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: "0.04em", color: "var(--text-primary)", lineHeight: 1 }}>
                                    My Notes
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5 }}>
                                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.6)", flexShrink: 0 }} />
                                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em" }}>
                                        {notes.length} {notes.length === 1 ? "note" : "notes"}
                                    </span>
                                </div>
                            </div>
                            {/* mini badge */}
                            <div style={{ padding: "3px 8px", borderRadius: "var(--radius-full)", background: "rgba(59,140,248,0.12)", border: "1px solid rgba(59,140,248,0.20)", fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--blue-bright)", letterSpacing: "0.08em", flexShrink: 0 }}>
                                PRO
                            </div>
                        </div>

                        {/* new note button */}
                        <button className="new-note-btn" onClick={createNote}>
                            <Plus size={14} strokeWidth={2.5} />
                            New Note
                        </button>
                    </div>

                    {/* ── Notes list ── */}
                    <div className="drawer-scroll">
                        {notes.length === 0 ? (
                            <div style={{ padding: "48px 20px", textAlign: "center" }}>
                                <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "rgba(59,140,248,0.06)", border: "1px solid rgba(59,140,248,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                                    <FileText size={18} color="var(--text-muted)" strokeWidth={1.5} />
                                </div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 300, lineHeight: 1.6 }}>No notes yet.<br />Create your first one.</div>
                            </div>
                        ) : (
                            <>
                                {starredNotes.length > 0 && (
                                    <>
                                        <div className="section-label">Starred</div>
                                        {starredNotes.map((n) => (
                                            <DrawerItem key={n.id} note={n} active={activeId === n.id}
                                                onSelect={() => { setActiveId(n.id); setDrawerOpen(false); }}
                                                onDelete={() => setDeleteConfirm(n.id)} />
                                        ))}
                                        {unstarredNotes.length > 0 && <div className="separator" />}
                                    </>
                                )}
                                {unstarredNotes.length > 0 && (
                                    <>
                                        <div className="section-label">{starredNotes.length > 0 ? "All Notes" : "Notes"}</div>
                                        {unstarredNotes.map((n) => (
                                            <DrawerItem key={n.id} note={n} active={activeId === n.id}
                                                onSelect={() => { setActiveId(n.id); setDrawerOpen(false); }}
                                                onDelete={() => setDeleteConfirm(n.id)} />
                                        ))}
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    {/* ── Footer ── */}
                    <div className="drawer-footer">
                        <Link href="/" style={{ textDecoration: 'none', display: 'block' }}>
                            <button className="settings-btn">
                                <Home size={16} strokeWidth={2} />
                                Dashboard
                            </button>
                        </Link>
                    </div>

                </aside>

                {/* ── Top Navigation Bar ── */}
                <header style={{ height: 62, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px 0 8px", borderBottom: "1px solid var(--border-mid)", background: "var(--bg-surface)", position: "relative", zIndex: 20, backdropFilter: "blur(16px)" }}>
                    {/* Left: Hamburger + Home */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button className="icon-btn" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
                            <Menu size={19} strokeWidth={1.5} />
                        </button>
                        <Link href="/" className="home-btn" aria-label="Go to home">
                            <Home size={16} strokeWidth={1.8} />
                        </Link>
                    </div>

                    {/* Center: App name */}
                    <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "none" }}>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--text-primary)", lineHeight: 1 }}>
                            Notes
                        </span>
                        {saving && (
                            <span style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                                <span className="blink-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--blue-bright)", display: "inline-block" }} />
                                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>saving</span>
                            </span>
                        )}
                        {saved && !saving && (
                            <span className="saved-flash" style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-label)", marginTop: 3, letterSpacing: "0.1em", textTransform: "uppercase" }}>✓ saved</span>
                        )}
                    </div>

                    {/* Right: Search */}
                    <button className="icon-btn" onClick={() => setSearchOpen((v) => !v)} aria-label="Toggle search">
                        {searchOpen ? <X size={19} strokeWidth={1.5} /> : <Search size={19} strokeWidth={1.5} />}
                    </button>
                </header>

                {/* ── Search Bar ── */}
                <div className={`search-bar ${searchOpen ? "open" : ""}`}>
                    <Search size={15} color="var(--text-muted)" strokeWidth={1.5} style={{ flexShrink: 0 }} />
                    <input
                        autoFocus={searchOpen}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search notes…"
                        style={{ flex: 1, fontSize: 15, fontWeight: 300, color: "var(--text-primary)", letterSpacing: "0.01em" }}
                    />
                    {searchQuery && (
                        <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => setSearchQuery("")}>
                            <X size={13} />
                        </button>
                    )}
                </div>

                {/* ── Main Content ── */}
                <main style={{ flex: 1, overflowY: "auto", paddingBottom: "env(safe-area-inset-bottom, 0px)", background: "var(--bg-deep)", position: "relative", zIndex: 1 }}>
                    {activeNote ? (
                        /* ── Note Editor ── */
                        <div className="fade-up" style={{ padding: "24px 20px 120px" }}>
                            {/* meta + actions */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--blue-vivid)", flexShrink: 0 }} />
                                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                        {formatDate(activeNote.updatedAt)}
                                    </span>
                                </div>
                                <div style={{ display: "flex", gap: 4 }}>
                                    <button className="icon-btn" onClick={() => toggleStar(activeNote.id)} style={{ width: 32, height: 32, color: activeNote.starred ? "#facc15" : "var(--text-muted)" }}>
                                        <Star size={14} fill={activeNote.starred ? "currentColor" : "none"} strokeWidth={1.5} />
                                    </button>
                                    <button className="icon-btn" onClick={() => setDeleteConfirm(activeNote.id)} style={{ width: 32, height: 32 }}>
                                        <Trash2 size={14} strokeWidth={1.5} />
                                    </button>
                                </div>
                            </div>

                            {/* title */}
                            <input ref={titleRef} className="note-title" value={titleValue} onChange={handleTitleChange} placeholder="Untitled" />

                            {/* stats bar */}
                            <div style={{ display: "flex", gap: 14, marginTop: 14, marginBottom: 22, paddingTop: 12, paddingBottom: 12, borderTop: "1px solid var(--border-faint)", borderBottom: "1px solid var(--border-faint)" }}>
                                <StatChip icon={<Hash size={10} />} label={`${wordCount(bodyValue)} words`} />
                                <StatChip icon={<Clock size={10} />} label={readingTime(bodyValue)} />
                                <StatChip icon={<BookOpen size={10} />} label={new Date(activeNote.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} />
                            </div>

                            {/* body */}
                            <textarea ref={bodyRef} className="note-body" value={bodyValue} onChange={handleBodyChange} placeholder="Start writing…" rows={1} style={{ overflow: "hidden" }} />
                        </div>
                    ) : (
                        <EmptyState hasNotes={notes.length > 0} searchActive={searchQuery.length > 0} onCreate={createNote} />
                    )}
                </main>

                {/* ── FAB ── */}
                {!activeNote && (
                    <button className="fab" onClick={createNote} aria-label="New note">
                        <Feather size={22} strokeWidth={1.5} />
                    </button>
                )}

                {/* ── Delete Confirm Sheet ── */}
                <div className={`confirm-overlay ${deleteConfirm ? "open" : ""}`}>
                    <div className="confirm-sheet">
                        <div style={{ textAlign: "center", marginBottom: 22 }}>
                            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(220,60,60,0.10)", border: "1px solid rgba(220,60,60,0.22)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                                <Trash2 size={20} color="#d85040" strokeWidth={1.5} />
                            </div>
                            <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "var(--font-display)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6, color: "var(--text-primary)" }}>Delete Note?</div>
                            <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.5 }}>This action cannot be undone.</div>
                        </div>
                        <button onClick={() => deleteNote(deleteConfirm)} style={{ width: "100%", padding: "13px", borderRadius: "var(--radius-md)", background: "rgba(220,60,60,0.14)", border: "1px solid rgba(220,60,60,0.25)", color: "#e06050", fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10, transition: "background 0.15s" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(220,60,60,0.24)"}
                            onMouseLeave={e => e.currentTarget.style.background = "rgba(220,60,60,0.14)"}
                        >Delete</button>
                        <button onClick={() => setDeleteConfirm(null)} style={{ width: "100%", padding: "13px", borderRadius: "var(--radius-md)", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", fontSize: 14, fontWeight: 500, transition: "background 0.15s" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
                            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                        >Cancel</button>
                    </div>
                </div>

            </div>
        </>
    );
}

/* ── Drawer Note Item ── */
function DrawerItem({ note, active, onSelect, onDelete }) {
    return (
        <div className={`note-item ${active ? "active" : ""}`} onClick={onSelect}>
            <div style={{ paddingRight: 26 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    {note.starred && <Star size={9} fill="#facc15" color="#facc15" />}
                    <span style={{ fontSize: 13, fontWeight: 600, color: active ? "var(--text-accent)" : "var(--text-primary)", letterSpacing: "0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "93%" }}>
                        {note.title}
                    </span>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 300, lineHeight: 1.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {excerpt(note.body, 46)}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--text-muted)", marginTop: 4, opacity: 0.6, letterSpacing: "0.04em" }}>
                    {formatDate(note.updatedAt)}
                </div>
            </div>
            <button className="del-btn" onClick={(e) => { e.stopPropagation(); onDelete(); }} aria-label="Delete">
                <Trash2 size={12} strokeWidth={1.5} />
            </button>
        </div>
    );
}

/* ── Stat Chip ── */
function StatChip({ icon, label }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-muted)" }}>
            {icon}
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.05em" }}>{label}</span>
        </div>
    );
}

/* ── Empty State ── */
function EmptyState({ hasNotes, searchActive, onCreate }) {
    if (searchActive) {
        return (
            <div className="fade-up" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "calc(100dvh - 124px)", padding: "40px 32px", textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: "var(--radius-lg)", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                    <Search size={24} color="var(--text-muted)" strokeWidth={1.5} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 8 }}>No results</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 300 }}>Try a different search term</div>
            </div>
        );
    }

    if (hasNotes) {
        return (
            <div className="fade-up" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "calc(100dvh - 124px)", padding: "40px 32px", textAlign: "center" }}>
                <div className="float" style={{ marginBottom: 24, width: 76, height: 76, borderRadius: "var(--radius-xl)", background: "var(--blue-dim)", border: "1px solid var(--blue-border)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-glow)" }}>
                    <FileText size={32} color="var(--blue-bright)" strokeWidth={1.2} />
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-primary)", marginBottom: 10 }}>Select a Note</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 300, lineHeight: 1.7, maxWidth: 240 }}>
                    Pick from the sidebar or start something new
                </div>
            </div>
        );
    }

    return (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "calc(100dvh - 124px)", padding: "40px 28px", textAlign: "center", position: "relative" }}>
            {/* custom SVG illustration */}
            <div className="float" style={{ marginBottom: 32 }}>
                <svg width="130" height="130" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="rgba(59,140,248,0.12)" />
                            <stop offset="100%" stopColor="rgba(59,140,248,0)" />
                        </radialGradient>
                        <linearGradient id="pageGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="rgba(59,140,248,0.18)" />
                            <stop offset="100%" stopColor="rgba(37,99,235,0.06)" />
                        </linearGradient>
                    </defs>
                    <circle cx="65" cy="65" r="62" fill="url(#bgGlow)" />
                    {/* stacked pages */}
                    <rect x="44" y="48" width="46" height="56" rx="6" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                    <rect x="38" y="42" width="46" height="56" rx="6" fill="rgba(59,140,248,0.05)" stroke="rgba(59,140,248,0.12)" strokeWidth="1" />
                    <rect x="32" y="36" width="46" height="56" rx="6" fill="url(#pageGrad)" stroke="rgba(59,140,248,0.28)" strokeWidth="1" />
                    {/* lines */}
                    <line x1="41" y1="50" x2="69" y2="50" stroke="rgba(59,140,248,0.50)" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="41" y1="60" x2="65" y2="60" stroke="rgba(255,255,255,0.10)" strokeWidth="1" strokeLinecap="round" />
                    <line x1="41" y1="69" x2="68" y2="69" stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeLinecap="round" />
                    <line x1="41" y1="78" x2="59" y2="78" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeLinecap="round" />
                    {/* pen */}
                    <path d="M78 24 C83 18, 93 19, 96 25 C91 33, 82 39, 76 50 L73 46 C78 37, 83 28, 78 24Z" fill="rgba(59,140,248,0.22)" stroke="rgba(96,165,250,0.60)" strokeWidth="1" />
                    <line x1="76" y1="50" x2="70" y2="68" stroke="rgba(96,165,250,0.45)" strokeWidth="1.2" strokeLinecap="round" />
                    {/* sparkle */}
                    <circle cx="99" cy="44" r="3" fill="rgba(96,165,250,0.6)" />
                    <circle cx="28" cy="76" r="2" fill="rgba(59,140,248,0.4)" />
                    <circle cx="105" cy="72" r="1.5" fill="rgba(96,165,250,0.3)" />
                </svg>
            </div>

            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--text-primary)", marginBottom: 12, lineHeight: 1.1 }}>
                Ready to<br />
                <span style={{ background: "linear-gradient(90deg, #3b8cf8, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Write?</span>
            </div>
            <div style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 300, lineHeight: 1.72, maxWidth: 260, marginBottom: 36 }}>
                Capture ideas, track goals, build your thoughts — all in one place.
            </div>

            {/* CTA */}
            <button onClick={onCreate} style={{ display: "flex", alignItems: "center", gap: 9, padding: "13px 28px", borderRadius: "var(--radius-full)", background: "linear-gradient(135deg, rgba(37,99,235,0.35) 0%, rgba(59,140,248,0.20) 100%)", border: "1px solid var(--blue-border)", color: "var(--blue-bright)", fontSize: 13, fontWeight: 700, fontFamily: "var(--font-body)", letterSpacing: "0.10em", textTransform: "uppercase", boxShadow: "0 0 24px rgba(59,140,248,0.20)", transition: "all 0.2s var(--ease-spring)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(37,99,235,0.55) 0%, rgba(59,140,248,0.35) 100%)"; e.currentTarget.style.boxShadow = "0 0 36px rgba(59,140,248,0.35)"; e.currentTarget.style.transform = "scale(1.04)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(37,99,235,0.35) 0%, rgba(59,140,248,0.20) 100%)"; e.currentTarget.style.boxShadow = "0 0 24px rgba(59,140,248,0.20)"; e.currentTarget.style.transform = "scale(1)"; }}
                onMouseDown={e => e.currentTarget.style.transform = "scale(0.95)"}
                onMouseUp={e => e.currentTarget.style.transform = "scale(1.04)"}
            >
                <Feather size={14} strokeWidth={2} />
                Create First Note
            </button>

            {/* ambient */}
            <div style={{ position: "absolute", bottom: 80, left: "5%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 60, right: "5%", width: 140, height: 140, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,140,248,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
        </div>
    );
}