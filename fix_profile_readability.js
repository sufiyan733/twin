const fs = require('fs');
const file = 'c:/Users/bari2/Desktop/nextjs-app/components/ProfileCard.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Lighten the card slightly so it contrasts against the black background
content = content.replace(/card: "linear-gradient\(180deg, rgba\(20,20,20,0\.95\) 0%, rgba\(5,5,5,0\.98\) 100%\)"/g, 'card: "linear-gradient(180deg, rgba(28,30,35,0.95) 0%, rgba(12,14,18,0.98) 100%)"');

// 2. Fix FieldDisplay edit mode (line ~243)
content = content.replace(/className="flex items-center gap-2 rounded-2xl   px-3 py-2\.5 focus-within:border-white\/40 focus-within:shadow-\[0_0_0_3px_rgba\(255,255,255,0\.15\)\] transition-all"/g, 'className="flex items-center gap-2 rounded-2xl bg-black/40 border border-white/5 px-3 py-2.5 focus-within:border-white/40 focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.15)] transition-all"');

// 3. Fix FieldDisplay view mode (line ~266)
content = content.replace(/className="flex items-center gap-2 px-3 py-2\.5 rounded-2xl  "/g, 'className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.02]"');

// 4. Fix Gender selector view mode (line ~763)
content = content.replace(/className="flex items-center gap-2 px-3 py-2\.5 rounded-2xl  "/g, 'className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.02]"');

// 5. Fix HeightField edit ft/in (line ~129)
content = content.replace(/className="flex items-center gap-1\.5 rounded-2xl   px-3 py-2\.5 focus-within:border-white\/40/g, 'className="flex items-center gap-1.5 rounded-2xl bg-black/40 border border-white/5 px-3 py-2.5 focus-within:border-white/40');

// 6. Make section headers brighter
content = content.replace(/text-xs font-bold uppercase tracking-\[0\.15em\]/g, 'text-[11px] font-bold uppercase tracking-[0.2em] text-white/90');

// 7. Make "Not set" text brighter
content = content.replace(/className="italic" style=\{\{ color: T\.textFaint \}\}/g, 'className="italic text-white/30"');
content = content.replace(/className="text-white\/20 italic"/g, 'className="text-white/30 italic"');

fs.writeFileSync(file, content);
console.log("ProfileCard readability fixed");
