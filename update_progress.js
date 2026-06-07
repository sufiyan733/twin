const fs = require('fs');
let content = fs.readFileSync('app/progress/page.js', 'utf8');

// 1. Replace fonts
content = content.replace(/Rajdhani/g, 'Inter');
content = content.replace(/Orbitron/g, 'Inter');
content = content.replace(/family=Inter:wght@400;500;600;700&family=Inter:wght@400;600;700;900/g, 'family=Inter:wght@400;500;600;700;800');

// 2. Replace colors
content = content.replace(/#00d0ff/g, '#6ee7b7');
content = content.replace(/rgba\(0,208,255,/g, 'rgba(110,231,183,');
content = content.replace(/--cyan:/g, '--emerald:');
content = content.replace(/--cyan-dim:/g, '--emerald-dim:');
content = content.replace(/--cyan-label:/g, '--emerald-label:');
content = content.replace(/var\(--cyan\)/g, 'var(--emerald)');
content = content.replace(/var\(--cyan-dim\)/g, 'var(--emerald-dim)');
content = content.replace(/var\(--cyan-label\)/g, 'var(--emerald-label)');

// 3. Fix the massive background string
content = content.replace(/background:\s*radial-gradient\([^;]+;/g, 'background: #020617;');

// 4. Typography sizing fixes
content = content.replace(/font-size: 6\.5px;/g, 'font-size: 10px;');
content = content.replace(/font-size: 7\.5px;/g, 'font-size: 10px;');
content = content.replace(/font-size: 8px;/g, 'font-size: 10px;');
content = content.replace(/font-size: 8\.5px;/g, 'font-size: 10px;');
content = content.replace(/font-size: 11px;/g, 'font-size: 13px;'); // Chart title

// 5. Card styling (Premium Linear/Apple style)
content = content.replace(/box-shadow: 0 10px 20px -5px rgba\(0,0,0,0\.5\);/g, 'box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);');
content = content.replace(/border-color: var\(--emerald-dim\);/g, 'border-color: rgba(110,231,183,0.20);');

// Body Image Filter: instead of bright cyan glow, use an emerald treatment
content = content.replace(/filter: brightness\(1\.1\) saturate\(1\.2\) drop-shadow\(0 0 8px rgba\(110,231,183,0\.5\)\);/g, 'filter: brightness(1.2) sepia(1) hue-rotate(110deg) saturate(3) drop-shadow(0 0 6px rgba(110,231,183,0.3));');
content = content.replace(/filter: brightness\(0\.55\) saturate\(0\.35\);/g, 'filter: brightness(0.6) sepia(1) hue-rotate(180deg) saturate(0.2);');

// Active background in cards
content = content.replace(/box-shadow: inset 0 1px 0 rgba\(110,231,183,0\.2\), 0 10px 20px -5px rgba\(0,0,0,0\.5\);/g, 'box-shadow: 0 0 20px rgba(110,231,183,0.1), inset 0 1px 0 rgba(255,255,255,0.05);');

fs.writeFileSync('app/progress/page.js', content);
console.log('Update complete');
