const fs = require('fs');
const file = 'c:/Users/bari2/Desktop/nextjs-app/app/workout-record/page.js';
let content = fs.readFileSync(file, 'utf8');

// The new metallic background
const metallicBg = `radial-gradient(circle at 15% 0%, #23272e 0%, #090a0c 100%)`;
const cardMetallicBg = `linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)`;
const cardActiveMetallicBg = `linear-gradient(145deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 100%)`;

// 1. Root variables
content = content.replace(/--bg:\s*#000000;/g, '--bg: #090a0c;');
content = content.replace(/--a1:\s*#00d0ff;/g, '--a1: #ffffff;');
content = content.replace(/--a2:\s*#38bdf8;/g, '--a2: #e2e8f0;');
content = content.replace(/--g1:\s*#00d0ff;/g, '--g1: #ffffff;'); 
content = content.replace(/--g2:\s*#7dd3fc;/g, '--g2: #cbd5e1;');

// 2. Replace the massive background for wl-app and html,body
content = content.replace(/html, body \{\s*background:\s*#000000;/g, `html, body {\n    background: ${metallicBg};`);

// For .wl-app, remove the previous massive string entirely and set it to transparent because body handles it
content = content.replace(/\/\* background is now handled by the massive gradient string \*\/[\s\S]*?background:\s*radial-gradient[\s\S]*?360deg\);/g, 'background: transparent;');

// 3. Update the card gradients (.wl-group, .wl-ex)
content = content.replace(/\.wl-group \{\s*background:\s*linear-gradient\(135deg, rgba\(255,255,255,0\.12\) 0%, rgba\(255,255,255,0\.03\) 15%, transparent 35%\), linear-gradient\(180deg, rgba\(25,35,50,0\.95\) 0%, rgba\(10,12,15,0\.98\) 100%\);/g, `.wl-group {\n    background: ${cardMetallicBg};\n    background-color: rgba(10,11,14,0.7);`);
content = content.replace(/\.wl-ex \{\s*background:\s*linear-gradient\(135deg, rgba\(255,255,255,0\.12\) 0%, rgba\(255,255,255,0\.03\) 15%, transparent 35%\), linear-gradient\(180deg, rgba\(25,35,50,0\.95\) 0%, rgba\(10,12,15,0\.98\) 100%\);/g, `.wl-ex {\n    background: ${cardMetallicBg};\n    background-color: rgba(10,11,14,0.7);`);

content = content.replace(/\.wl-ex\.open \{\s*background:\s*linear-gradient\(135deg, rgba\(255,255,255,0\.08\) 0%, rgba\(255,255,255,0\.02\) 20%, transparent 35%\), linear-gradient\(180deg, rgba\(35,45,60,0\.7\) 0%, rgba\(15,18,22,0\.9\) 100%\);/g, `.wl-ex.open {\n    background: ${cardActiveMetallicBg};\n    background-color: rgba(15,17,21,0.8);`);

// 4. Update header and bottom sheets to match cardBg
content = content.replace(/\.wl-header \{\s*position:sticky;\s*top:0;z-index:100;\s*padding: 16px 20px 14px;\s*background:\s*linear-gradient\(135deg, rgba\(255,255,255,0\.12\) 0%, rgba\(255,255,255,0\.03\) 15%, transparent 35%\), linear-gradient\(180deg, rgba\(25,35,50,0\.95\) 0%, rgba\(10,12,15,0\.98\) 100%\);/g, `.wl-header {\n    position:sticky;\n    top:0;z-index:100;\n    padding: 16px 20px 14px;\n    background: rgba(10,11,14,0.85);`);

// 5. Update Finish Session button to metallic silver
content = content.replace(/\.wl-finish-header-btn \{\s*color:\s*#fff;\s*padding:\s*10px 20px;\s*border-radius:\s*99px;\s*border:\s*none;\s*background:\s*linear-gradient\(135deg, #00d0ff 0%, #0284c7 100%\);/g, `.wl-finish-header-btn {\n    color: #000;\n    padding: 10px 20px;\n    border-radius: 99px;\n    border: none;\n    background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);\n    box-shadow: 0 4px 14px rgba(255,255,255,0.15);`);

content = content.replace(/\.wl-add-exercise-btn \{([^}]*?)color:\s*#00d0ff;/g, '.wl-add-exercise-btn {$1color: #ffffff;');
content = content.replace(/\.wl-add-exercise-btn:hover \{\s*background:\s*rgba\(0,208,255,0\.15\);\s*border-color:\s*#00d0ff;/g, '.wl-add-exercise-btn:hover {\n    background: rgba(255,255,255,0.15);\n    border-color: #ffffff;');

content = content.replace(/background:linear-gradient\(90deg, #00d0ff, #0284c7\);/g, `background:linear-gradient(90deg, #ffffff, #94a3b8);`);
content = content.replace(/box-shadow:0 0 16px var\(--a1\), 0 0 40px rgba\(0,208,255,0\.3\);/g, `box-shadow:0 0 16px var(--a1), 0 0 40px rgba(255,255,255,0.15);`);
content = content.replace(/box-shadow: 0 4px 28px rgba\(0,208,255,0\.15\)/g, `box-shadow: 0 4px 28px rgba(255,255,255,0.10)`);
content = content.replace(/border-color: rgba\(0,208,255,0\.3\);/g, `border-color: rgba(255,255,255,0.2);`);
content = content.replace(/background: rgba\(0,208,255,0\.08\);/g, `background: rgba(255,255,255,0.08);`);
content = content.replace(/background:linear-gradient\(135deg, rgba\(0,208,255,0\.06\), rgba\(0,208,255,0\.02\)\);/g, `background:linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));`);

// Bottom Sheets - wait the previous replace might have missed it or we can just replace everything that matches
content = content.replace(/background:\s*linear-gradient\(135deg, rgba\(255,255,255,0\.12\) 0%, rgba\(255,255,255,0\.03\) 15%, transparent 35%\), linear-gradient\(180deg, rgba\(25,35,50,0\.95\) 0%, rgba\(10,12,15,0\.98\) 100%\)/g, `background: rgba(10,11,14,0.95)`);

// Also fix the shadows for a metallic feel
content = content.replace(/box-shadow:\s*0 12px 32px rgba\(0,0,0,0\.4\);/g, `box-shadow: 0 12px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1);`);

fs.writeFileSync(file, content);
console.log('Metallic premium theme applied to workout-record');
