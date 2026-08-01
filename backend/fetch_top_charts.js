const fs = require('fs');

const dataPath = './fallback_data.json';
let data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Filter out existing top charts just in case
data = data.filter(d => d.query !== 'top charts');

// Find a good set of songs, e.g., 'trending songs'
const trending = data.find(d => d.query === 'trending songs');
if (trending && trending.results) {
  data.unshift({
    query: 'top charts',
    results: trending.results.map(r => ({ ...r }))
  });
  
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log('Added top charts with ' + trending.results.length + ' songs (copied from trending).');
} else {
  console.log('Could not find trending songs to copy.');
}
