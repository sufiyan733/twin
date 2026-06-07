const fs = require('fs');
let code = fs.readFileSync('components/ProfileCard.js', 'utf8');

const T_OBJ = `
// ── Theme tokens (goal image palette)
const T = {
  bg: \`radial-gradient(circle at 30% 40%, rgba(255,255,255,0.15) 0%, transparent 4%), radial-gradient(circle at 75% 65%, rgba(255,255,255,0.1) 0%, transparent 3%), linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.12) 30.5%, rgba(255,255,255,0.02) 32%, transparent 34%), linear-gradient(245deg, transparent 60%, rgba(255,255,255,0.1) 60.5%, rgba(255,255,255,0.02) 62%, transparent 64%), linear-gradient(170deg, transparent 75%, rgba(255,255,255,0.08) 75.5%, rgba(255,255,255,0.01) 77%, transparent 78%), linear-gradient(35deg, transparent 40%, rgba(255,255,255,0.06) 40.5%, rgba(255,255,255,0.01) 42%, transparent 43%), conic-gradient(from 90deg at 80% 20%, rgba(255,255,255,0.04) 0deg, transparent 45deg, rgba(255,255,255,0.03) 90deg, transparent 135deg), conic-gradient(from -45deg at 10% 80%, rgba(255,255,255,0.04) 0deg, transparent 60deg), conic-gradient(from 180deg at 75% 65%, #111111 0deg, #000000 30deg, #1a1a1a 90deg, #000000 150deg, #111111 200deg, #000000 260deg, #1a1a1a 320deg, transparent 320.1deg), conic-gradient(from 20deg at 30% 40%, #1a1a1a 0deg, #000000 40deg, #0f0f0f 90deg, #000000 150deg, #1c1c1c 200deg, #000000 260deg, #05140b 300deg, #080808 320deg, #1a1a1a 360deg)\`,
  card: \`linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 10%, transparent 35%), linear-gradient(180deg, rgba(45,55,70,0.95) 0%, rgba(10,12,15,0.98) 100%)\`,
  cardAlt: \`linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 15%, transparent 35%), linear-gradient(180deg, rgba(50,60,75,0.7) 0%, rgba(15,18,22,0.9) 100%)\`,
  border: "rgba(255,255,255,0.4)",
  accent: "#00d0ff",
  textPrimary: "#ffffff",
  textMuted: "#999999",
  textFaint: "#555555",
};
`;

code = code.replace(
  'const GENDER_OPTIONS = ["male", "female", "other"];',
  `const GENDER_OPTIONS = ["male", "female", "other"];\n\n${T_OBJ}`
);

function replaceAll(str, find, replace) {
  return str.split(find).join(replace);
}

// Global replacements
code = replaceAll(code, 'bg-[#020617]/70', '');
code = replaceAll(code, 'border border-white/[0.08]', '');
code = replaceAll(code, 'border border-white/10', '');
code = replaceAll(code, 'border border-white/[0.04]', '');
code = replaceAll(code, 'bg-white/[0.02]', '');
code = replaceAll(code, 'bg-white/[0.04]', '');

// Main card
code = code.replace(
  '<div className="relative w-full max-w-[400px] h-[85vh] max-h-[750px] rounded-3xl   shadow-2xl shadow-black/30 backdrop-blur-3xl overflow-hidden transition-all duration-500 ease-out animate-in zoom-in-95 fade-in flex flex-col">',
  '<div className="relative w-full max-w-[400px] h-[85vh] max-h-[750px] rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-[24px] overflow-hidden transition-all duration-500 ease-out animate-in zoom-in-95 fade-in flex flex-col" style={{ background: T.card, border: `1px solid ${T.border}`, borderTop: "1px solid rgba(255,255,255,0.06)" }}>'
);

// Backdrop
code = code.replace(
  '<div\n        className="absolute inset-0 bg-[#010614]/80 backdrop-blur-2xl animate-in fade-in duration-300"\n        onClick={handleClose}\n      />',
  '<div\n        className="absolute inset-0 backdrop-blur-2xl animate-in fade-in duration-300"\n        style={{ background: T.bg }}\n        onClick={handleClose}\n      />'
);

// Discard Dialog
code = code.replace(
  '<div className="w-full max-w-[280px] rounded-2xl bg-[#0a1128]  p-6 shadow-2xl">',
  '<div className="w-full max-w-[280px] rounded-2xl p-6 shadow-2xl" style={{ background: T.card, border: `1px solid ${T.border}` }}>'
);

// Section Headers
code = replaceAll(code, '<div className="h-5 w-0.5 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500" />', '<div className="h-5 w-0.5 rounded-full" style={{ background: T.accent }} />');
code = replaceAll(code, '<h3 className="text-xs font-bold uppercase tracking-[0.15em] text-cyan-400/80">', '<h3 className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: T.accent }}>');

// Avatar
code = code.replace(
  '<div className="h-[76px] w-[76px] rounded-full bg-gradient-to-br from-cyan-400/50 via-indigo-500/30 to-cyan-400/50 p-[2px] shadow-[0_0_25px_rgba(0,208,255,0.25)]">',
  '<div className="h-[76px] w-[76px] rounded-full p-[2px]" style={{ background: `linear-gradient(135deg, ${T.accent}80, rgba(255,255,255,0.1), ${T.accent}80)`, boxShadow: `0 0 25px ${T.accent}40` }}>'
);
code = code.replace(
  '<span className="text-xl font-bold text-white">{initials}</span>',
  '<span className="text-xl font-bold" style={{ color: T.textPrimary }}>{initials}</span>'
);
code = replaceAll(code, 'className="text-cyan-400/70', 'style={{ color: T.accent }} className="');

// Edit Button & Close Button
code = code.replace(
  '<button\n                onClick={handleClose}\n                className="flex items-center justify-center h-9 w-9 rounded-full   text-white/60 hover:bg-white/10 hover:text-white transition-all active:scale-90"\n                aria-label="Close profile"\n              >',
  '<button\n                onClick={handleClose}\n                className="flex items-center justify-center h-9 w-9 rounded-full shadow-lg transition-transform active:scale-[0.97]"\n                style={{ background: T.cardAlt, border: `1px solid ${T.border}`, color: T.textPrimary }}\n                aria-label="Close profile"\n              >'
);
code = code.replace(
  '<button\n                  onClick={handleEdit}\n                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full bg-white/[0.06]  text-white/70 backdrop-blur-sm hover:bg-white/10 hover:border-cyan-400/30 hover:text-cyan-300 transition-all active:scale-95"\n                >',
  '<button\n                  onClick={handleEdit}\n                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm transition-all active:scale-95"\n                  style={{ background: T.cardAlt, border: `1px solid ${T.border}`, color: T.textPrimary }}\n                >'
);

// Save Bar
code = code.replace(
  'className={`shrink-0 p-4 backdrop-blur-xl bg-[#020617]/85 border-t  rounded-b-3xl transition-all duration-500 ease-out ${isEditing',
  'className={`shrink-0 p-4 backdrop-blur-xl rounded-b-3xl transition-all duration-500 ease-out ${isEditing`}\n          style={{ background: T.card, borderTop: `1px solid ${T.border}` }}'
);
code = code.replace(
  '<button\n              onClick={handleCancelEdit}\n              className="px-4 py-2.5 text-sm font-semibold rounded-2xl bg-white/5 text-white/70 hover:bg-white/10 transition-colors active:scale-95"\n            >',
  '<button\n              onClick={handleCancelEdit}\n              className="px-4 py-2.5 text-sm font-semibold rounded-2xl shadow-lg transition-all active:scale-[0.97]"\n              style={{ background: T.cardAlt, border: `1px solid ${T.border}`, color: T.textPrimary }}\n            >'
);

// FieldDisplay Editing
code = code.replace(
  '<span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40 ml-1">\n          {label}\n        </span>',
  '<span className="text-[10px] font-semibold uppercase tracking-[0.12em] ml-1" style={{ color: T.textMuted }}>\n          {label}\n        </span>'
);
code = code.replace(
  '<div className="flex items-center gap-2 rounded-2xl   px-3 py-2.5 focus-within:border-cyan-400/40 focus-within:shadow-[0_0_0_3px_rgba(0,208,255,0.12)] transition-all">',
  '<div className="flex items-center gap-2 rounded-2xl px-3 py-2.5 focus-within:shadow-[0_0_0_3px_rgba(0,208,255,0.12)] transition-all" style={{ background: T.cardAlt, border: `1px solid ${T.border}` }}>'
);
code = code.replace(
  '{Icon && <Icon size={14} className="text-cyan-400/60 shrink-0" />}',
  '{Icon && <Icon size={14} className="shrink-0" style={{ color: T.accent }} />}'
);
code = code.replace(
  'className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"',
  'className="flex-1 bg-transparent text-sm placeholder-white/20 outline-none" style={{ color: T.textPrimary }}'
);
code = code.replace(
  '{unit && <span className="text-[11px] font-medium text-white/30 shrink-0">{unit}</span>}',
  '{unit && <span className="text-[11px] font-medium shrink-0" style={{ color: T.textMuted }}>{unit}</span>}'
);

// FieldDisplay View Mode
code = code.replace(
  '<span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40 ml-1">\n        {label}\n      </span>',
  '<span className="text-[10px] font-semibold uppercase tracking-[0.12em] ml-1" style={{ color: T.textMuted }}>\n        {label}\n      </span>'
);
code = code.replace(
  '<div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl  ">',
  '<div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl" style={{ background: T.cardAlt, border: `1px solid ${T.border}` }}>'
);
code = code.replace(
  '{Icon && <Icon size={14} className="text-cyan-400/40 shrink-0" />}',
  '{Icon && <Icon size={14} className="shrink-0" style={{ color: T.accent }} />}'
);
code = code.replace(
  '<span className="flex-1 text-sm font-medium text-white/90">',
  '<span className="flex-1 text-sm font-medium" style={{ color: T.textPrimary }}>'
);
code = code.replace(
  '{value || <span className="text-white/20 italic">Not set</span>}',
  '{value || <span className="italic" style={{ color: T.textFaint }}>Not set</span>}'
);
code = code.replace(
  '{unit && value && <span className="text-[11px] font-medium text-white/30">{unit}</span>}',
  '{unit && value && <span className="text-[11px] font-medium" style={{ color: T.textMuted }}>{unit}</span>}'
);

fs.writeFileSync('components/ProfileCard.js', code);
console.log("Replaced successfully!");
