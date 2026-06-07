const fs = require('fs');
const file = 'c:/Users/bari2/Desktop/nextjs-app/components/ProfileCard.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Rewrite the T tokens to match AGENTS.md exactly
const newTheme = `const T = {
  bg: "#020617",
  card: "linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(2,6,23,0.98) 100%)",
  cardAlt: "rgba(30,41,59,0.5)",
  input: "#0a1628",
  border: "rgba(148,163,184,0.08)",
  borderTop: "rgba(255,255,255,0.06)",
  accent: "#6ee7b7",
  accentHover: "#34d399",
  textPrimary: "#f1f5f9",
  textMuted: "#94a3b8",
  textFaint: "#475569",
};`;

content = content.replace(/const T = \{[\s\S]*?textFaint:\s*".*?",\s*\};\s*/, newTheme + '\n\n');

// 2. Fix the Card wrapper to use the exact shadows and borders from AGENTS.md
content = content.replace(/className="relative w-full max-w-\[400px\][^"]*" style=\{\{ background: T\.card, border: `1px solid \$\{T\.border\}`[^}]*\}\}/, 'className="relative w-full max-w-[400px] h-[85vh] max-h-[750px] rounded-[24px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] backdrop-blur-[24px] overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] animate-in zoom-in-95 fade-in flex flex-col" style={{ background: T.card, border: `1px solid ${T.border}`, borderTop: `1px solid ${T.borderTop}` }}');

// 3. Brand Glow (One source per screen: let's put it behind the avatar or top of card)
content = content.replace(/<div className="absolute top-0 left-0 w-full h-44 bg-gradient-to-b from-white\/5 to-transparent pointer-events-none" \/>/g, '<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-44 bg-gradient-to-b from-[#6ee7b7]/10 to-transparent pointer-events-none opacity-50" style={{ boxShadow: "0 0 40px rgba(110,231,183,0.08)" }} />');

// 4. Update the noise overlay to be much subtler so it doesn't wash out the dark slate
content = content.replace(/opacity-\[0\.15\]/g, 'opacity-[0.05]');

// 5. Update Calorie Target Field (Hero Metric)
content = content.replace(/text-white\/60/g, 'text-[#94a3b8]');
content = content.replace(/bg-white\/5/g, 'bg-[#1e293b]/50');
content = content.replace(/border-white\/10/g, 'border-[#94a3b8]/10');
content = content.replace(/text-white\/40/g, 'text-[#94a3b8]');
content = content.replace(/text-white/g, 'text-[#f1f5f9]');
content = content.replace(/bg-white\/\[0\.03\]/g, 'bg-[#0a1628]/80');
content = content.replace(/shadow-\[0_0_20px_rgba\(255,255,255,0\.03\)\]/g, 'shadow-[0_0_20px_rgba(110,231,183,0.15),0_0_40px_rgba(110,231,183,0.08)]');
content = content.replace(/drop-shadow-\[0_0_6px_rgba\(255,255,255,0\.3\)\]/g, 'drop-shadow-[0_0_8px_rgba(110,231,183,0.6)]');
content = content.replace(/text-white\/90/g, 'text-[#f1f5f9]');
content = content.replace(/text-[#f1f5f9]\/90/g, 'text-[#f1f5f9]');

// Fix Calorie text color specifically back to Emerald
content = content.replace(/<span className="flex-1 text-sm font-bold text-\[#f1f5f9\]">/g, '<span className="flex-1 text-[24px] font-bold text-[#6ee7b7] tracking-tight tabular-nums drop-shadow-[0_0_12px_rgba(110,231,183,0.4)]">');

// 6. Fix FieldDisplay to use the exact slate/emerald tokens
content = content.replace(/className="flex items-center gap-2 rounded-2xl bg-black\/40 border border-white\/5 px-3 py-2\.5 focus-within:border-white\/40 focus-within:shadow-\[0_0_0_3px_rgba\(255,255,255,0\.15\)\] transition-all"/g, 'className="flex items-center gap-2 rounded-xl bg-[#0a1628] border border-[rgba(148,163,184,0.12)] px-3 py-2.5 focus-within:border-[#6ee7b7]/50 focus-within:shadow-[0_0_0_3px_rgba(110,231,183,0.15)] transition-all duration-200"');

content = content.replace(/className="flex items-center gap-2 px-3 py-2\.5 rounded-2xl bg-white\/\[0\.04\] border border-white\/\[0\.02\]"/g, 'className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[rgba(30,41,59,0.4)] border border-[rgba(148,163,184,0.08)] transition-all duration-200 active:scale-[0.99] active:bg-[rgba(30,41,59,0.6)]"');

// 7. Change buttons/icons to use Emerald accent and press states
content = content.replace(/text-cyan-400/g, 'text-[#6ee7b7]');
content = content.replace(/border-cyan-400/g, 'border-[#6ee7b7]');
content = content.replace(/bg-cyan-500/g, 'bg-[#6ee7b7]');

// Update Avatar Ring
content = content.replace(/linear-gradient\(145deg, rgba\(255,255,255,0\.5\) 0%, rgba\(255,255,255,0\.05\) 40%, rgba\(255,255,255,0\.2\) 100%\)/g, 'linear-gradient(135deg, #6ee7b7 0%, rgba(110,231,183,0.2) 50%, #34d399 100%)');
content = content.replace(/boxShadow: `0 8px 32px rgba\(0,0,0,0\.8\)`/g, 'boxShadow: `0 0 20px rgba(110,231,183,0.15), 0 0 40px rgba(110,231,183,0.08)`');

// Update section headers
content = content.replace(/text-\[11px\] font-bold uppercase tracking-\[0\.2em\] text-\[#f1f5f9\]/g, 'text-[11px] font-bold uppercase tracking-[0.08em] text-[#94a3b8]');

// Height field
content = content.replace(/className="flex items-center gap-1\.5 rounded-2xl bg-black\/40 border border-white\/5 px-3 py-2\.5 focus-within:border-white\/40/g, 'className="flex items-center gap-1.5 rounded-xl bg-[#0a1628] border border-[rgba(148,163,184,0.12)] px-3 py-2.5 focus-within:border-[#6ee7b7]/50');

// Focus within shadows
content = content.replace(/focus-within:shadow-\[0_0_0_3px_rgba\(0,208,255,0\.12\)\]/g, 'focus-within:shadow-[0_0_0_3px_rgba(110,231,183,0.15)]');

fs.writeFileSync(file, content);
console.log("AGENTS.md premium emerald theme applied");
