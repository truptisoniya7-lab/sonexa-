const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'controllers');
const files = fs.readdirSync(dir);
files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf-8');
  const matches = [...content.matchAll(/\.from\(['"]([^'"]+)['"]\)/g)];
  if (matches.length > 0) {
    console.log(f, matches.map(m => m[1]).join(', '));
  }
});
