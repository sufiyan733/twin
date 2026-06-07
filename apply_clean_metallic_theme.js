const fs = require('fs');
const file = 'c:/Users/bari2/Desktop/nextjs-app/app/workout-record/page.js';
let content = fs.readFileSync(file, 'utf8');

const metallicBg = `radial-gradient(circle at 15% 0%, #1c1f26 0%, #06070a 100%)`;
const cardMetallicBg = `linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)`;
const cardActiveMetallicBg = `linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%)`;
const solidCard = `rgba(10,12,16,0.85)`;

// 1. Root variables
content = content.replace(/--bg:\s*#020617;/g, '--bg: #06070a;');
content = content.replace(/--bg2:\s*#020617;/g, '--bg2: #06070a;');
content = content.replace(/--surface:\s*#0f172a;/g, '--surface: #0a0c10;');
content = content.replace(/--card:\s*rgba\(15, 23, 42, 0\.9\);/g, '--card: rgba(14, 16, 20, 0.9);');
content = content.replace(/--g1:\s*#10b981;/g, '--g1: #ffffff;');
content = content.replace(/--g2:\s*#34d399;/g, '--g2: #cbd5e1;');

// 2. Body background
content = content.replace(/html, body \{\s*background:\s*var\(--bg\);/g, `html, body {\n    background: ${metallicBg};`);

// 3. Remove grid overlay and app background
content = content.replace(/\.wl-app \{\s*background:\s*var\(--bg\);[\s\S]*?rgba\(16,185,129,0\.03\) 0%, transparent 50%\);\s*\}/g, '.wl-app {\n    background: transparent;\n    min-height: 100dvh;\n    font-family: var(--body);\n    color: var(--text);\n    width: 100%;\n    max-width: 430px;\n    margin: 0 auto;\n    position: relative;\n    overflow-x: hidden;\n    padding-bottom: 100px;\n  }');

content = content.replace(/\.wl-app::before \{[\s\S]*?z-index:998;\s*\}/g, '');

// 4. Update the card gradients
content = content.replace(/\.wl-group \{\s*background:\s*linear-gradient\(180deg, rgba\(255,255,255,0\.03\) 0%, rgba\(255,255,255,0\.01\) 100%\);/g, `.wl-group {\n    background: ${cardMetallicBg};\n    background-color: ${solidCard};`);
content = content.replace(/\.wl-ex \{\s*background:\s*linear-gradient\(135deg, rgba\(255,255,255,0\.06\) 0%, rgba\(255,255,255,0\.01\) 100%\);/g, `.wl-ex {\n    background: ${cardMetallicBg};\n    background-color: ${solidCard};`);
content = content.replace(/\.wl-ex\.open \{\s*background:\s*linear-gradient\(135deg, rgba\(255,255,255,0\.08\) 0%, rgba\(255,255,255,0\.02\) 100%\);/g, `.wl-ex.open {\n    background: ${cardActiveMetallicBg};\n    background-color: rgba(14,16,20,0.9);`);

// 5. Update header
content = content.replace(/\.wl-header \{\s*position:sticky;[\s\S]*?border-bottom: 1px solid rgba\(255,255,255,0\.04\);\s*\}/g, `.wl-header {\n    position:sticky;\n    top:0;z-index:100;\n    padding: 16px 20px 14px;\n    background: rgba(8,9,12,0.85);\n    backdrop-filter: blur(32px) saturate(1.6);\n    -webkit-backdrop-filter: blur(32px) saturate(1.6);\n    border-bottom: 1px solid rgba(255,255,255,0.08);\n  }`);

// 6. Update Finish Session button to silver metallic
content = content.replace(/\.wl-finish-header-btn \{\s*color:\s*#000;[\s\S]*?background:\s*linear-gradient\(135deg, #ffffff 0%, #cbd5e1 100%\);/g, `.wl-finish-header-btn {\n    color: #000;\n    padding: 10px 20px;\n    border-radius: 99px;\n    border: none;\n    background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);\n    box-shadow: 0 4px 14px rgba(255,255,255,0.2);`);

// 7. Update Add button
content = content.replace(/\.wl-add-exercise-btn \{([^}]*?)border:\s*1\.5px solid rgba\(255,255,255,0\.25\);/g, `.wl-add-exercise-btn {$1border: 1.5px solid rgba(255,255,255,0.4);`);

// 8. Bottom Sheet backgrounds
content = content.replace(/linear-gradient\(180deg, rgba\(20,25,35,0\.95\) 0%, rgba\(10,12,15,0\.98\) 100%\)/g, `rgba(10,12,16,0.95)`);

// 9. Shadows
content = content.replace(/box-shadow: 0 12px 32px rgba\(0,0,0,0\.4\);/g, `box-shadow: 0 16px 48px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1);`);

// Progress bar
content = content.replace(/background:linear-gradient\(90deg, #ffffff, #10b981, #34d399\);/g, `background:linear-gradient(90deg, #ffffff, #94a3b8);`);
content = content.replace(/background: linear-gradient\(135deg,#10b981,#059669\);/g, `background:linear-gradient(135deg, #ffffff, #cbd5e1);`);
content = content.replace(/box-shadow: 0 4px 24px rgba\(16,185,129,0\.4\);/g, `box-shadow: 0 4px 24px rgba(255,255,255,0.3);`);

fs.writeFileSync(file, content);
console.log('Metallic premium theme applied cleanly to workout-record');
