const fs = require('fs');
const path = require('path');
const dir = './controllers';

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.js')) {
    const p = path.join(dir, file);
    let content = fs.readFileSync(p, 'utf8');
    let newContent = content.replace(/\.from\(['"]([A-Za-z]+)['"]\)/g, (match, p1) => {
      return `.from('${p1.toLowerCase()}')`;
    });
    
    if (content !== newContent) {
      fs.writeFileSync(p, newContent);
      console.log('Updated ' + file);
    }
  }
});
