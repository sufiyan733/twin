const fs = require('fs');
let content = fs.readFileSync('app/progress/page.js', 'utf8');

// The ONLY thing we change is the cyan/blue branding -> emerald branding.
// We DO NOT touch the backgrounds, the fonts, or the box-shadows, as those provided the depth the user loved.

// Replace hex cyan with hex emerald
content = content.replace(/#00d0ff/g, '#6ee7b7');
content = content.replace(/#00d0ff/gi, '#6ee7b7');

// Replace rgba cyan with rgba emerald
content = content.replace(/rgba\(0,\s*208,\s*255,/g, 'rgba(110,231,183,');

// Replace CSS variables names (optional, but keeps code clean)
content = content.replace(/--cyan:/g, '--emerald:');
content = content.replace(/--cyan-dim:/g, '--emerald-dim:');
content = content.replace(/--cyan-label:/g, '--emerald-label:');
content = content.replace(/var\(--cyan\)/g, 'var(--emerald)');
content = content.replace(/var\(--cyan-dim\)/g, 'var(--emerald-dim)');
content = content.replace(/var\(--cyan-label\)/g, 'var(--emerald-label)');

// Slightly bump unreadable micro-fonts, but keep the sci-fi fonts
content = content.replace(/font-size: 6\.5px;/g, 'font-size: 8px;');
content = content.replace(/font-size: 7\.5px;/g, 'font-size: 8.5px;');

fs.writeFileSync('app/progress/page.js', content);
console.log('Precision color upgrade complete');
