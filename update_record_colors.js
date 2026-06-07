const fs = require('fs');
const file = 'c:/Users/bari2/Desktop/nextjs-app/app/workout-record/page.js';
let content = fs.readFileSync(file, 'utf8');

// Replace blues with white/silver
content = content.replace(/#3b82f6/gi, '#ffffff');
content = content.replace(/#60a5fa/gi, '#ffffff');
content = content.replace(/#93c5fd/gi, '#f1f5f9');
content = content.replace(/#2563eb/gi, '#e2e8f0');
content = content.replace(/#1d4ed8/gi, '#cbd5e1');
content = content.replace(/rgba\(59,\s*130,\s*246,/g, 'rgba(255,255,255,');

// Replace easing
content = content.replace(/cubic-bezier\(\.34,1\.56,\.64,1\)/g, 'cubic-bezier(0.25, 0.46, 0.45, 0.94)');
content = content.replace(/cubic-bezier\(0\.34,1\.56,0\.64,1\)/g, 'cubic-bezier(0.25, 0.46, 0.45, 0.94)');
content = content.replace(/cubic-bezier\(0\.4,0,0\.2,1\)/g, 'cubic-bezier(0.25, 0.46, 0.45, 0.94)');
content = content.replace(/cubic-bezier\(\.25,\.1,\.25,1\)/g, 'cubic-bezier(0.25, 0.46, 0.45, 0.94)');
content = content.replace(/cubic-bezier\(0\.25,0\.1,0\.25,1\)/g, 'cubic-bezier(0.25, 0.46, 0.45, 0.94)');

// Replace bg colors
content = content.replace(/--bg:\s*#03050c;/g, '--bg: #020617;');
content = content.replace(/--bg2:\s*#060a16;/g, '--bg2: #020617;');
content = content.replace(/--surface:\s*#0b0f1e;/g, '--surface: #0f172a;');
content = content.replace(/--card:\s*rgba\(15,\s*20,\s*38,\s*0\.9\);/g, '--card: rgba(15, 23, 42, 0.9);');

// The finish button uses white text right now. If its background becomes white/silver, text must be black.
content = content.replace(/\.wl-finish-header-btn\s*\{([^}]*?)color:\s*#fff;/g, '.wl-finish-header-btn {$1color: #000;');

// Make the Add Exercise Button premium
content = content.replace(/\.wl-add-exercise-btn:hover\s*\{([^}]*?)color:\s*#fff;/g, '.wl-add-exercise-btn:hover {$1color: #000;');
content = content.replace(/\.wl-add-exercise-btn\s*\{([^}]*?)background:\s*rgba\(255,255,255,0\.06\);/g, '.wl-add-exercise-btn {$1background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%);');

// Update hardcoded #3b82f6 or 60a5fa in JSX components
content = content.replace(/color:\s*isDone\s*\?\s*"#fff"\s*:\s*"#60a5fa"/g, 'color: isDone ? "#000" : "#ffffff"');

fs.writeFileSync(file, content);
console.log('Theme updated');
