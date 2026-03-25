const fs = require('fs');
const path = require('path');

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.jsx') || p.endsWith('.js')) {
      let c = fs.readFileSync(p, 'utf8');
      let o = c;
      c = c.replace(/dark:text-slate-400/g, 'dark:text-slate-300');
      c = c.replace(/text-slate-400/g, 'text-slate-500');
      c = c.replace(/text-amber-500/g, 'text-amber-600');
      c = c.replace(/text-emerald-500/g, 'text-emerald-600');
      c = c.replace(/aria-label="Hero section"/g, 'role="region" aria-label="Hero section"');
      if (c !== o) {
        fs.writeFileSync(p, c);
        console.log('Fixed ' + p);
      }
    }
  }
}
walk('./src');
