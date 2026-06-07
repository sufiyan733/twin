const fs = require('fs');
let code = fs.readFileSync('app/progress/page.js', 'utf8');

function replaceAll(str, find, replace) {
  return str.split(find).join(replace);
}

// 1. CSS Variables
code = code.replace(
`        .progress-page {
          --bg:           #030d1a;
          --surface:      #061422;
          --surface-2:    #091c30;
          --border:       rgba(29,106,255,0.18);
          --border-hi:    rgba(29,106,255,0.5);
          --cyan:         #2f8bff;
          --cyan-dim:     rgba(29,106,255,0.5);
          --cyan-label:   #7dc8ff;
          --text:         #e8f4ff;
          --text-muted:   #3d6a9a;
          --font-ui:      'Rajdhani', sans-serif;
          --font-display: 'Orbitron', sans-serif;

          background: var(--bg);
          color: var(--text);
          font-family: var(--font-ui);
          -webkit-font-smoothing: antialiased;
        }`,
`        .progress-page {
          --surface:      linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 15%, transparent 35%), linear-gradient(180deg, rgba(25,35,50,0.95) 0%, rgba(10,12,15,0.98) 100%);
          --surface-2:    linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 20%, transparent 35%), linear-gradient(180deg, rgba(35,45,60,0.7) 0%, rgba(15,18,22,0.9) 100%);
          --border:       rgba(255,255,255,0.12);
          --border-hi:    rgba(255,255,255,0.25);
          --border-top:   rgba(255,255,255,0.06);
          --cyan:         #00d0ff;
          --cyan-dim:     rgba(0,208,255,0.15);
          --cyan-label:   #00d0ff;
          --text:         #f8fafc;
          --text-muted:   #94a3b8;
          --font-ui:      'Rajdhani', sans-serif;
          --font-display: 'Orbitron', sans-serif;

          color: var(--text);
          font-family: var(--font-ui);
          -webkit-font-smoothing: antialiased;
        }`
);

// 2. Page background
code = code.replace(
  'background: var(--bg);',
  'background: radial-gradient(circle at 30% 40%, rgba(255,255,255,0.15) 0%, transparent 4%), radial-gradient(circle at 75% 65%, rgba(255,255,255,0.1) 0%, transparent 3%), linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.12) 30.5%, rgba(255,255,255,0.02) 32%, transparent 34%), linear-gradient(245deg, transparent 60%, rgba(255,255,255,0.1) 60.5%, rgba(255,255,255,0.02) 62%, transparent 64%), linear-gradient(170deg, transparent 75%, rgba(255,255,255,0.08) 75.5%, rgba(255,255,255,0.01) 77%, transparent 78%), linear-gradient(35deg, transparent 40%, rgba(255,255,255,0.06) 40.5%, rgba(255,255,255,0.01) 42%, transparent 43%), conic-gradient(from 90deg at 80% 20%, rgba(255,255,255,0.04) 0deg, transparent 45deg, rgba(255,255,255,0.03) 90deg, transparent 135deg), conic-gradient(from -45deg at 10% 80%, rgba(255,255,255,0.04) 0deg, transparent 60deg), conic-gradient(from 180deg at 75% 65%, #111111 0deg, #000000 30deg, #1a1a1a 90deg, #000000 150deg, #111111 200deg, #000000 260deg, #1a1a1a 320deg, transparent 320.1deg), conic-gradient(from 20deg at 30% 40%, #1a1a1a 0deg, #000000 40deg, #0f0f0f 90deg, #000000 150deg, #1c1c1c 200deg, #000000 260deg, #05140b 300deg, #080808 320deg, #1a1a1a 360deg);'
);

// 3. Update Cards to have premium shadow and top border
code = replaceAll(code, 'border: 1px solid var(--border);', 'border: 1px solid var(--border);\n          border-top: 1px solid var(--border-top);\n          box-shadow: 0 10px 20px -5px rgba(0,0,0,0.5);');

code = code.replace(
`        .chart-card {
          margin: 0 10px 5px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-top: 1px solid var(--border-top);
          box-shadow: 0 10px 20px -5px rgba(0,0,0,0.5);
          border-radius: 13px;
          padding: 7px 10px 2px 6px;
          position: relative;
          z-index: 5;
          overflow: hidden;
          flex: 1 1 0;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }`,
`        .chart-card {
          margin: 0 10px 5px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-top: 1px solid var(--border-top);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.6);
          border-radius: 13px;
          padding: 7px 10px 2px 6px;
          position: relative;
          z-index: 5;
          overflow: hidden;
          flex: 1 1 0;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }`
);

// Body Card active
code = code.replace(
`        .body-card--active {
          border-color: var(--cyan);
          background: rgba(29,106,255,0.08);
        }`,
`        .body-card--active {
          border-color: var(--cyan-dim);
          background: var(--surface-2);
          box-shadow: inset 0 1px 0 rgba(0,208,255,0.2), 0 10px 20px -5px rgba(0,0,0,0.5);
        }`
);

// Hardcoded colors replacements
code = replaceAll(code, 'rgba(29,106,255,0.18)', 'rgba(0,208,255,0.15)');
code = replaceAll(code, 'rgba(29,106,255,0.8)', 'rgba(0,208,255,0.5)');
code = replaceAll(code, 'rgba(29,106,255,0.10)', 'var(--cyan-dim)');
code = replaceAll(code, 'rgba(29,106,255,0.25)', 'var(--border-hi)');
code = replaceAll(code, 'rgba(29,106,255,0.07)', 'var(--cyan-dim)');
code = replaceAll(code, 'rgba(29,106,255,0.08)', 'var(--surface-2)');
code = replaceAll(code, 'rgba(29,106,255,0.28)', 'var(--border-hi)');
code = replaceAll(code, 'rgba(29,106,255,0.05)', 'rgba(0,208,255,0.05)');
code = replaceAll(code, 'rgba(29,106,255,0.12)', 'rgba(0,208,255,0.12)');
code = replaceAll(code, 'rgba(29,106,255,0.3)', 'var(--text-muted)');
code = replaceAll(code, 'rgba(29,106,255,0.4)', 'var(--text-muted)');
code = replaceAll(code, 'rgba(29,106,255,0.06)', 'var(--cyan-dim)');
code = replaceAll(code, 'rgba(29,106,255,0.15)', 'rgba(255,255,255,0.06)');
code = replaceAll(code, 'rgba(29,106,255,0.55)', 'rgba(0,208,255,0.5)');

code = replaceAll(code, '#1a6fff', '#00d0ff');
code = replaceAll(code, '#3d8fff', '#00d0ff');
code = replaceAll(code, '#2f8bff', '#00d0ff');
code = replaceAll(code, '#7dc8ff', '#00d0ff');
code = replaceAll(code, '#c0e8ff', '#f8fafc');
code = replaceAll(code, '#3d6a9a', '#94a3b8');

code = replaceAll(code, 'rgba(4,16,42,0.97)', 'rgba(10,12,15,0.97)');

fs.writeFileSync('app/progress/page.js', code);
console.log('Progress page styled.');
