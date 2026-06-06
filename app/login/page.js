"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { User, Lock, ArrowRight, UserPlus, LogIn, Loader2, Eye, EyeOff } from "lucide-react";

// ── Theme tokens (Premium Black Theme)
const T = {
  bg: `radial-gradient(circle at 30% 40%, rgba(255,255,255,0.15) 0%, transparent 4%), radial-gradient(circle at 75% 65%, rgba(255,255,255,0.1) 0%, transparent 3%), linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.12) 30.5%, rgba(255,255,255,0.02) 32%, transparent 34%), linear-gradient(245deg, transparent 60%, rgba(255,255,255,0.1) 60.5%, rgba(255,255,255,0.02) 62%, transparent 64%), linear-gradient(170deg, transparent 75%, rgba(255,255,255,0.08) 75.5%, rgba(255,255,255,0.01) 77%, transparent 78%), linear-gradient(35deg, transparent 40%, rgba(255,255,255,0.06) 40.5%, rgba(255,255,255,0.01) 42%, transparent 43%), conic-gradient(from 90deg at 80% 20%, rgba(255,255,255,0.04) 0deg, transparent 45deg, rgba(255,255,255,0.03) 90deg, transparent 135deg), conic-gradient(from -45deg at 10% 80%, rgba(255,255,255,0.04) 0deg, transparent 60deg), conic-gradient(from 180deg at 75% 65%, #111111 0deg, #000000 30deg, #1a1a1a 90deg, #000000 150deg, #111111 200deg, #000000 260deg, #1a1a1a 320deg, transparent 320.1deg), conic-gradient(from 20deg at 30% 40%, #1a1a1a 0deg, #000000 40deg, #0f0f0f 90deg, #000000 150deg, #1c1c1c 200deg, #000000 260deg, #05140b 300deg, #080808 320deg, #1a1a1a 360deg)`,
  card: "linear-gradient(180deg, #0f0f0f 0%, #050505 100%)",
  cardAlt: "#111111",
  border: "rgba(255,255,255,0.08)",
  accent: "#ffffff",
  textPrimary: "#ffffff",
  textMuted: "#888888",
  textFaint: "#444444",
};

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (!isPending && session) {
      router.replace("/");
    }
  }, [session, isPending, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Please enter your display name.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    if (mode === "signup") {
      const { error: err } = await authClient.signUp.email({
        email: `${username.toLowerCase()}@twin.app`, // dummy email — username is the real identifier
        password,
        name: name.trim(),
        username: username.toLowerCase().trim(),
      });
      if (err) {
        setError(
          err.code === "USER_ALREADY_EXISTS"
            ? "That username is already taken. Try another."
            : err.message || "Sign up failed. Please try again."
        );
        setLoading(false);
        return;
      }
    } else {
      const { error: err } = await authClient.signIn.username({
        username: username.toLowerCase().trim(),
        password,
      });
      if (err) {
        setError(
          err.code === "INVALID_EMAIL_OR_PASSWORD"
            ? "Incorrect username or password."
            : err.message || "Sign in failed. Please try again."
        );
        setLoading(false);
        return;
      }
    }

    router.replace("/");
  };

  const switchMode = () => {
    setMode(m => m === "signin" ? "signup" : "signin");
    setError("");
    setUsername("");
    setPassword("");
    setName("");
  };

  if (isPending) {
    return (
      <div className="h-[100dvh] w-full flex items-center justify-center" style={{ background: T.bg }}>
        <Loader2 className="animate-spin" size={32} style={{ color: T.accent }} />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full overflow-hidden font-sans text-white flex items-center justify-center selection:bg-emerald-500/30" style={{ background: T.bg }}>
      <div className="relative w-full max-w-[360px] mx-4 z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center justify-center h-[56px] w-[56px] rounded-2xl mb-4 mx-auto shadow-lg"
            style={{ background: T.cardAlt, border: `1px solid ${T.border}` }}
          >
            {mode === "signin"
              ? <LogIn size={26} style={{ color: T.accent }} />
              : <UserPlus size={26} style={{ color: T.accent }} />
            }
          </div>
          <h1 className="text-[24px] font-bold tracking-tight mb-1" style={{ color: T.textPrimary }}>
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-[13px]" style={{ color: T.textMuted }}>
            {mode === "signin" ? "Sign in to your Twin account" : "Set up your personal Twin profile"}
          </p>
        </div>

        {/* Card */}
        <div 
          className="relative overflow-hidden rounded-3xl p-6"
          style={{
            background: T.card,
            border: `1px solid ${T.border}`,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 20px 40px -10px rgba(0,0,0,0.6)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)"
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.04),transparent_65%)] pointer-events-none" />

          <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
            
            {/* Display Name (sign up only) */}
            {mode === "signup" && (
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: T.textMuted }}>
                  Display Name
                </label>
                <div 
                  className="flex items-center gap-2.5 rounded-2xl px-4 py-3 transition-all duration-300 shadow-sm"
                  style={{ background: T.cardAlt, border: `1px solid ${T.border}` }}
                >
                  <UserPlus size={15} className="shrink-0" style={{ color: T.textMuted }} />
                  <input
                    id="name-input"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Alex Johnson"
                    className="flex-1 bg-transparent text-[14px] outline-none"
                    style={{ color: T.textPrimary }}
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: T.textMuted }}>
                Username
              </label>
              <div 
                className="flex items-center gap-2.5 rounded-2xl px-4 py-3 transition-all duration-300 shadow-sm"
                style={{ background: T.cardAlt, border: `1px solid ${T.border}` }}
              >
                <User size={15} className="shrink-0" style={{ color: T.textMuted }} />
                <span className="text-[13px]" style={{ color: T.textFaint }}>@</span>
                <input
                  id="username-input"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                  placeholder="yourname"
                  className="flex-1 bg-transparent text-[14px] outline-none"
                  style={{ color: T.textPrimary }}
                  autoFocus={mode === "signin"}
                  autoComplete="username"
                  maxLength={20}
                />
              </div>
              {mode === "signup" && (
                <p className="text-[10px] mt-1 ml-1" style={{ color: T.textFaint }}>Letters, numbers and underscores only</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: T.textMuted }}>
                Password
              </label>
              <div 
                className="flex items-center gap-2.5 rounded-2xl px-4 py-3 transition-all duration-300 shadow-sm"
                style={{ background: T.cardAlt, border: `1px solid ${T.border}` }}
              >
                <Lock size={15} className="shrink-0" style={{ color: T.textMuted }} />
                <input
                  id="password-input"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-[14px] outline-none"
                  style={{ color: T.textPrimary }}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="transition-colors shrink-0"
                  style={{ color: T.textMuted }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {mode === "signup" && (
                <p className="text-[10px] mt-1 ml-1" style={{ color: T.textFaint }}>Minimum 8 characters</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <p className="text-[12px] text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              id="submit-btn"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl text-[14px] font-bold py-3.5 mt-4 shadow-lg transition-transform active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: T.accent, color: "#000000" }}
            >
              {loading
                ? <Loader2 size={18} className="animate-spin" />
                : mode === "signin"
                  ? <><LogIn size={16} /> Sign In</>
                  : <><UserPlus size={16} /> Create Account</>
              }
            </button>
          </form>

          {/* Switch mode */}
          <div className="relative z-10 text-center mt-5">
            <span className="text-[12px]" style={{ color: T.textMuted }}>
              {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              id="switch-mode-btn"
              type="button"
              onClick={switchMode}
              className="text-[12px] font-semibold transition-colors"
              style={{ color: T.accent }}
            >
              {mode === "signin" ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] mt-6" style={{ color: T.textFaint }}>
          Twin — Your Personal Wellness Companion
        </p>
      </div>
    </div>
  );
}
