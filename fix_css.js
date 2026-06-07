const fs = require('fs');
const file = 'c:/Users/bari2/Desktop/nextjs-app/app/workout-record/page.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /\/\/ ─────────────────────────────────────────────\s*\/\/ STYLES\s*\/\/ ─────────────────────────────────────────────[\s\S]*?(--display:    'Outfit', sans-serif;)/;

const fixedStyles = `// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const CSS = \`
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

  :root {
    --bg: #090a0c;
    --bg2: #0f1115;
    --surface: #14171c;
    --card: rgba(20, 22, 26, 0.9);
    --card-border: rgba(255,255,255,0.06);
    --glass:      rgba(255,255,255,0.03);
    --a1: #ffffff;
    --a2: #e2e8f0;
    --a3:         #f1f5f9;
    --g1: #ffffff;
    --g2: #cbd5e1;
    --text:       #f0f4ff;
    --text2:      rgba(240,244,255,0.8);
    --text3:      rgba(240,244,255,0.5);
    --text4:      rgba(240,244,255,0.3);
    --rad:        24px;
    --rad-sm:     16px;
    --rad-xs:     12px;
    --mono:       'JetBrains Mono', monospace;
    $1`;

content = content.replace(regex, fixedStyles);

fs.writeFileSync(file, content);
