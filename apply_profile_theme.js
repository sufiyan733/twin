const fs = require('fs');
const file = 'c:/Users/bari2/Desktop/nextjs-app/components/ProfileCard.js';
let content = fs.readFileSync(file, 'utf8');

// Replace the Theme tokens
const newTheme = `const T = {
  bg: "rgba(6, 7, 10, 0.85)",
  card: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%), rgba(14, 16, 20, 0.95)",
  cardAlt: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%), rgba(10, 12, 16, 0.95)",
  border: "rgba(255,255,255,0.08)",
  accent: "#ffffff",
  textPrimary: "#f8fafc",
  textMuted: "#94a3b8",
  textFaint: "#475569",
};`;

content = content.replace(/const T = \{[\s\S]*?textFaint:\s*"#475569",\s*\};\s*/, newTheme + '\n\n');

// Replace specific cyan color classes
content = content.replace(/text-cyan-[43]00\/(\d+)/g, 'text-white/$1');
content = content.replace(/text-cyan-[43]00/g, 'text-white/90');
content = content.replace(/border-cyan-[43]00\/(\d+)/g, 'border-white/$1');
content = content.replace(/border-cyan-[43]00/g, 'border-white/40');
content = content.replace(/bg-cyan-[54]00\/(\d+)/g, 'bg-white/$1');
content = content.replace(/rgba\(0,208,255,([0-9.]+)\)/g, 'rgba(255,255,255,$1)');

// Replace indigo classes
content = content.replace(/text-indigo-[43]00\/(\d+)/g, 'text-white/$1');
content = content.replace(/text-indigo-[43]00/g, 'text-white/80');

// Replace emerald classes
content = content.replace(/text-emerald-[43]00\/(\d+)/g, 'text-emerald-400/$1'); // Keep emerald for success states, but maybe soften it
// Wait, keep emerald as is, it's for success/online indicator

// Fix background of card container, removing the huge blue/cyan gradients
content = content.replace(/bg-gradient-to-b from-cyan-500\/8 to-transparent/g, 'bg-gradient-to-b from-white/5 to-transparent');

// Fix avatar ring
content = content.replace(/linear-gradient\(135deg, \$\{T\.accent\}80, rgba\(255,255,255,0\.1\), \$\{T\.accent\}80\)/g, 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.05), rgba(255,255,255,0.4))');
content = content.replace(/boxShadow: `0 0 25px \$\{T\.accent\}40`/g, 'boxShadow: `0 0 25px rgba(255,255,255,0.15)`');

// Update FieldDisplay active shadow
content = content.replace(/focus-within:shadow-\[0_0_0_3px_rgba\(255,255,255,0\.12\)\]/g, 'focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.15)]');

fs.writeFileSync(file, content);
console.log("ProfileCard metallic theme applied");
