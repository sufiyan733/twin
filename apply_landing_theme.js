const fs = require('fs');
const file = 'c:/Users/bari2/Desktop/nextjs-app/app/workout-record/page.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Root variables
content = content.replace(/--bg:\s*#020617;/g, '--bg: #000000;');
content = content.replace(/--a1:\s*#ffffff;/g, '--a1: #00d0ff;');
content = content.replace(/--a2:\s*#ffffff;/g, '--a2: #38bdf8;');
content = content.replace(/--g1:\s*#10b981;/g, '--g1: #00d0ff;'); 
content = content.replace(/--g2:\s*#34d399;/g, '--g2: #7dd3fc;');

// 2. The massive background for wl-app
const landingBg = `radial-gradient(circle at 30% 40%, rgba(255,255,255,0.15) 0%, transparent 4%), radial-gradient(circle at 75% 65%, rgba(255,255,255,0.1) 0%, transparent 3%), linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.12) 30.5%, rgba(255,255,255,0.02) 32%, transparent 34%), linear-gradient(245deg, transparent 60%, rgba(255,255,255,0.1) 60.5%, rgba(255,255,255,0.02) 62%, transparent 64%), linear-gradient(170deg, transparent 75%, rgba(255,255,255,0.08) 75.5%, rgba(255,255,255,0.01) 77%, transparent 78%), linear-gradient(35deg, transparent 40%, rgba(255,255,255,0.06) 40.5%, rgba(255,255,255,0.01) 42%, transparent 43%), conic-gradient(from 90deg at 80% 20%, rgba(255,255,255,0.04) 0deg, transparent 45deg, rgba(255,255,255,0.03) 90deg, transparent 135deg), conic-gradient(from -45deg at 10% 80%, rgba(255,255,255,0.04) 0deg, transparent 60deg), conic-gradient(from 180deg at 75% 65%, #111111 0deg, #000000 30deg, #1a1a1a 90deg, #000000 150deg, #111111 200deg, #000000 260deg, #1a1a1a 320deg, transparent 320.1deg), conic-gradient(from 20deg at 30% 40%, #1a1a1a 0deg, #000000 40deg, #0f0f0f 90deg, #000000 150deg, #1c1c1c 200deg, #000000 260deg, #05140b 300deg, #080808 320deg, #1a1a1a 360deg)`;

content = content.replace(/background-image:[\s\S]*?radial-gradient\(ellipse at 80% 100%, rgba\(16,185,129,0\.03\) 0%, transparent 50%\);/g, `background: ${landingBg};`);

// 3. Update the wl-app and html,body to ensure the background takes precedence
content = content.replace(/\.wl-app \{\s*background:\s*var\(--bg\);/g, '.wl-app {\n    /* background is now handled by the massive gradient string */');
content = content.replace(/html, body \{\s*background:\s*var\(--bg\);/g, 'html, body {\n    background: #000000;');

// 4. Update the card gradients (.wl-group, .wl-ex)
const cardBg = `linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 15%, transparent 35%), linear-gradient(180deg, rgba(25,35,50,0.95) 0%, rgba(10,12,15,0.98) 100%)`;

content = content.replace(/\.wl-group \{\s*background:\s*linear-gradient\(180deg, rgba\(255,255,255,0\.03\) 0%, rgba\(255,255,255,0\.01\) 100%\);/g, `.wl-group {\n    background: ${cardBg};`);
content = content.replace(/\.wl-ex \{\s*background:\s*linear-gradient\(135deg, rgba\(255,255,255,0\.06\) 0%, rgba\(255,255,255,0\.01\) 100%\);/g, `.wl-ex {\n    background: ${cardBg};`);

// Update open card background
const cardAltBg = `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 20%, transparent 35%), linear-gradient(180deg, rgba(35,45,60,0.7) 0%, rgba(15,18,22,0.9) 100%)`;
content = content.replace(/\.wl-ex\.open \{\s*background:\s*linear-gradient\(135deg, rgba\(255,255,255,0\.08\) 0%, rgba\(255,255,255,0\.02\) 100%\);/g, `.wl-ex.open {\n    background: ${cardAltBg};`);

// 5. Update header and bottom sheets to match cardBg
content = content.replace(/\.wl-header \{\s*position:sticky;[\s\S]*?border-bottom:/g, `.wl-header {\n    position:sticky;\n    top:0;z-index:100;\n    padding: 16px 20px 14px;\n    background: ${cardBg};\n    backdrop-filter: blur(32px) saturate(1.6);\n    -webkit-backdrop-filter: blur(32px) saturate(1.6);\n    border-bottom:`);

// 6. Update Finish Session button to cyan (#00d0ff)
content = content.replace(/\.wl-finish-header-btn \{\s*color:\s*#000;[\s\S]*?background:\s*linear-gradient\(135deg, #ffffff 0%, #cbd5e1 100%\);/g, `.wl-finish-header-btn {\n    color: #fff;\n    padding: 10px 20px;\n    border-radius: 99px;\n    border: none;\n    background: linear-gradient(135deg, #00d0ff 0%, #0284c7 100%);`);

// Replace Add Exercise button border and color to cyan
content = content.replace(/\.wl-add-exercise-btn\s*\{([^}]*?)color:\s*var\(--a2\);/g, '.wl-add-exercise-btn {$1color: #00d0ff;');
content = content.replace(/\.wl-add-exercise-btn:hover\s*\{([^}]*?)color:\s*#000;/g, '.wl-add-exercise-btn:hover {$1color: #fff;');
content = content.replace(/\.wl-add-exercise-btn:hover \{\s*background:\s*rgba\(255,255,255,0\.15\);\s*border-color:\s*var\(--a1\);/g, '.wl-add-exercise-btn:hover {\n    background: rgba(0,208,255,0.15);\n    border-color: #00d0ff;');

// Replace progress bar from white to cyan
content = content.replace(/background:linear-gradient\(90deg, #ffffff, #10b981, #34d399\);/g, `background:linear-gradient(90deg, #00d0ff, #0284c7);`);

// Replace active tabs to cyan
content = content.replace(/box-shadow:0 0 16px var\(--a1\), 0 0 40px rgba\(255,255,255,0\.1\);/g, `box-shadow:0 0 16px var(--a1), 0 0 40px rgba(0,208,255,0.3);`);
content = content.replace(/box-shadow: 0 4px 28px rgba\(255,255,255,0\.08\)/g, `box-shadow: 0 4px 28px rgba(0,208,255,0.15)`);
content = content.replace(/border-color: rgba\(255,255,255,0\.3\);/g, `border-color: rgba(0,208,255,0.3);`);
content = content.replace(/background: rgba\(255,255,255,0\.08\);/g, `background: rgba(0,208,255,0.08);`);
content = content.replace(/background:linear-gradient\(135deg, rgba\(255,255,255,0\.06\), rgba\(16,185,129,0\.02\)\);/g, `background:linear-gradient(135deg, rgba(0,208,255,0.06), rgba(0,208,255,0.02));`);

// Bottom Sheets
content = content.replace(/linear-gradient\(180deg, rgba\(20,25,35,0\.95\) 0%, rgba\(10,12,15,0\.98\) 100%\)/g, cardBg);


fs.writeFileSync(file, content);
console.log('Landing page vibe applied to workout-record');
