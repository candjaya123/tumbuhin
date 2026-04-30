import fs from 'fs';
import path from 'path';

const dir = 'src/app';

function walk(directory) {
  let results = [];
  const list = fs.readdirSync(directory);
  list.forEach(function(file) {
    file = directory + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(dir);

const replacements = [
  { from: /emerald-600/g, to: 'primary' },
  { from: /emerald-700/g, to: 'primary/90' },
  { from: /emerald-500/g, to: 'primary/80' },
  { from: /emerald-400/g, to: 'primary/60' },
  { from: /emerald-200/g, to: 'primary/30' },
  { from: /emerald-100/g, to: 'primary/20' },
  { from: /emerald-50/g, to: 'primary/10' },
  { from: /emerald-800/g, to: 'primary/90 text-primary-foreground' },
  { from: /emerald-900\/50/g, to: 'primary-foreground/50' },
  { from: /emerald-900/g, to: 'primary-foreground' },
  { from: /text-white/g, to: 'text-primary-foreground' }, // be careful with text-white on primary
  { from: /bg-slate-900/g, to: 'bg-secondary' },
  { from: /text-slate-900/g, to: 'text-foreground' },
  { from: /bg-slate-50/g, to: 'bg-background' },
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  replacements.forEach(r => {
    content = content.replace(r.from, r.to);
  });
  
  // Specific fix for text-white inside bg-primary
  content = content.replace(/bg-primary(.*?)text-white/g, 'bg-primary$1text-primary-foreground');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
