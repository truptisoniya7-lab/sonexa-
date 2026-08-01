const fs = require('fs');

const dataPath = './fallback_data.json';
let data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

console.log("Queries in fallback_data.json:");
data.forEach(d => console.log(`- ${d.query} (${d.results.length} results)`));

// Find duplicates across all categories
let seenIds = new Set();
let duplicates = 0;
data.forEach(d => {
  d.results.forEach(r => {
    if (seenIds.has(r.id)) {
      duplicates++;
    } else {
      seenIds.add(r.id);
    }
  });
});
console.log(`\nTotal duplicate songs across categories: ${duplicates}`);
