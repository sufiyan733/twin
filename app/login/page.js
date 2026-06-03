"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { User, Lock, ArrowRight, UserPlus, LogIn, Loader2, Eye, EyeOff } from "lucide-react";

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
      <div className="h-[100dvh] w-full flex items-center justify-center bg-[#020617]">
        <Loader2 className="text-[#00d0ff] animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-[#020617] font-sans text-white flex items-center justify-center">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.2),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(0,208,255,0.12),transparent_50%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative w-full max-w-[360px] mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-[56px] w-[56px] rounded-[18px] bg-[#030818] border border-[#00d0ff]/30 shadow-[0_0_30px_rgba(0,208,255,0.3)] mb-4 mx-auto">
            {mode === "signin"
              ? <LogIn size={26} className="text-[#00d0ff] drop-shadow-[0_0_8px_#00d0ff]" />
              : <UserPlus size={26} className="text-[#00d0ff] drop-shadow-[0_0_8px_#00d0ff]" />
            }
          </div>
          <h1 className="text-[24px] font-bold tracking-tight text-white mb-1">
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-[13px] text-white/40">
            {mode === "signin" ? "Sign in to your Twin account" : "Set up your personal Twin profile"}
          </p>
        </div>

        {/* Card */}
        <div className="relative overflow-hidden rounded-[24px] border border-[#00d0ff]/20 bg-[#030818] p-6 shadow-[0_0_50px_rgba(0,150,255,0.15)] backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,208,255,0.08),transparent_65%)] pointer-events-none" />

          <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
            
            {/* Display Name (sign up only) */}
            {mode === "signup" && (
              <div>
                <label className="block text-[10px] font-bold text-white/40 tracking-widest uppercase mb-1.5">
                  Display Name
                </label>
                <div className="flex items-center gap-2.5 rounded-[14px] bg-[#07112c] border border-[#00d0ff]/15 px-4 py-3 focus-within:border-[#00d0ff]/50 focus-within:shadow-[0_0_20px_rgba(0,208,255,0.12)] transition-all duration-300">
                  <UserPlus size={15} className="text-[#00d0ff]/60 shrink-0" />
                  <input
                    id="name-input"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Alex Johnson"
                    className="flex-1 bg-transparent text-[14px] text-white placeholder:text-white/20 outline-none"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-[10px] font-bold text-white/40 tracking-widest uppercase mb-1.5">
                Username
              </label>
              <div className="flex items-center gap-2.5 rounded-[14px] bg-[#07112c] border border-[#00d0ff]/15 px-4 py-3 focus-within:border-[#00d0ff]/50 focus-within:shadow-[0_0_20px_rgba(0,208,255,0.12)] transition-all duration-300">
                <User size={15} className="text-[#00d0ff]/60 shrink-0" />
                <span className="text-[13px] text-white/30">@</span>
                <input
                  id="username-input"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                  placeholder="yourname"
                  className="flex-1 bg-transparent text-[14px] text-white placeholder:text-white/20 outline-none"
                  autoFocus={mode === "signin"}
                  autoComplete="username"
                  maxLength={20}
                />
              </div>
              {mode === "signup" && (
                <p className="text-[10px] text-white/25 mt-1 ml-1">Letters, numbers and underscores only</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold text-white/40 tracking-widest uppercase mb-1.5">
                Password
              </label>
              <div className="flex items-center gap-2.5 rounded-[14px] bg-[#07112c] border border-[#00d0ff]/15 px-4 py-3 focus-within:border-[#00d0ff]/50 focus-within:shadow-[0_0_20px_rgba(0,208,255,0.12)] transition-all duration-300">
                <Lock size={15} className="text-[#00d0ff]/60 shrink-0" />
                <input
                  id="password-input"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-[14px] text-white placeholder:text-white/20 outline-none"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="text-white/25 hover:text-white/60 transition-colors shrink-0"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {mode === "signup" && (
                <p className="text-[10px] text-white/25 mt-1 ml-1">Minimum 8 characters</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <p className="text-[12px] text-red-400 bg-red-400/10 border border-red-400/20 rounded-[10px] px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              id="submit-btn"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-[14px] bg-[#00d0ff] text-[#020617] text-[14px] font-bold py-3.5 mt-2 shadow-[0_0_25px_rgba(0,208,255,0.4)] hover:shadow-[0_0_35px_rgba(0,208,255,0.65)] transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
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
            <span className="text-[12px] text-white/30">
              {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              id="switch-mode-btn"
              type="button"
              onClick={switchMode}
              className="text-[12px] font-semibold text-[#00d0ff] hover:text-white transition-colors drop-shadow-[0_0_6px_rgba(0,208,255,0.5)]"
            >
              {mode === "signin" ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-white/15 mt-6">
          Twin — Your Personal Wellness Companion
        </p>
      </div>
    </div>
  );
}
