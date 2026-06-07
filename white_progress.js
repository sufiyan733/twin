const fs = require('fs');
let content = fs.readFileSync('app/progress/page.js', 'utf8');

// The user wants to replace the green (emerald) with white.

// Replace hex emerald with hex white
content = content.replace(/#6ee7b7/g, '#ffffff');
content = content.replace(/#6ee7b7/gi, '#ffffff');

// Replace rgba emerald with rgba white
content = content.replace(/rgba\(110,\s*231,\s*183,/g, 'rgba(255,255,255,');

fs.writeFileSync('app/progress/page.js', content);
console.log('White color shift complete');
