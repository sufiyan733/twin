const fs = require('fs');
const file = 'c:/Users/bari2/Desktop/nextjs-app/components/ProfileCard.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Redefine T tokens for absolute black / titanium premium vibe
const newTheme = `const T = {
  bg: "rgba(0, 0, 0, 0.85)",
  card: "linear-gradient(180deg, rgba(20,20,20,0.95) 0%, rgba(5,5,5,0.98) 100%)",
  cardAlt: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
  border: "rgba(255,255,255,0.06)",
  accent: "#ffffff",
  textPrimary: "#ffffff",
  textMuted: "#a1a1aa",
  textFaint: "#52525b",
};`;

content = content.replace(/const T = \{[\s\S]*?textFaint:\s*".*?",\s*\};\s*/, newTheme + '\n\n');

// 2. Turn the calorie section from amber to pure sleek silver/white
content = content.replace(/text-amber-[34]00\/70/g, 'text-white/60');
content = content.replace(/bg-amber-[4]00\/10/g, 'bg-white/5');
content = content.replace(/border-amber-[4]00\/20/g, 'border-white/10');
content = content.replace(/text-amber-[4]00\/50/g, 'text-white/40');
content = content.replace(/text-amber-300/g, 'text-white');
content = content.replace(/bg-amber-[4]00\/\[0\.05\]/g, 'bg-white/[0.03]');
content = content.replace(/shadow-\[0_0_20px_rgba\(251,191,36,0\.08\)\]/g, 'shadow-[0_0_20px_rgba(255,255,255,0.03)]');
content = content.replace(/drop-shadow-\[0_0_6px_rgba\(251,191,36,0\.5\)\]/g, 'drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]');
content = content.replace(/focus-within:border-amber-[4]00\/40/g, 'focus-within:border-white/30');
content = content.replace(/focus-within:shadow-\[0_0_0_3px_rgba\(251,191,36,0\.12\)\]/g, 'focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.1)]');
content = content.replace(/text-amber-[4]00/g, 'text-white/90');

// 3. Make card shadow much deeper and more premium
content = content.replace(/shadow-\[0_20px_40px_-10px_rgba\(0,0,0,0\.6\)\]/g, 'shadow-[0_40px_100px_-10px_rgba(0,0,0,1)]');

// 4. Enhance the top border highlight of the card
content = content.replace(/borderTop: "1px solid rgba\(255,255,255,0\.06\)"/g, 'borderTop: "1px solid rgba(255,255,255,0.12)"');

// 5. Simplify the gradient ring of the avatar to look like polished metal
content = content.replace(/linear-gradient\(135deg, rgba\(255,255,255,0\.4\), rgba\(255,255,255,0\.05\), rgba\(255,255,255,0\.4\)\)/g, 'linear-gradient(145deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.2) 100%)');
content = content.replace(/boxShadow: `0 0 25px rgba\(255,255,255,0\.15\)`/g, 'boxShadow: `0 8px 32px rgba(0,0,0,0.8)`');

// 6. Make input backgrounds deep black
content = content.replace(/bg-white\/5/g, 'bg-black/40'); // For inputs

// 7. Make the backdrop completely blur and desaturate behind the card
content = content.replace(/className="absolute inset-0 backdrop-blur-2xl animate-in fade-in duration-300"/g, 'className="absolute inset-0 backdrop-blur-[40px] saturate-50 animate-in fade-in duration-300"');

fs.writeFileSync(file, content);
console.log("ProfileCard ULTRA metallic theme applied");
