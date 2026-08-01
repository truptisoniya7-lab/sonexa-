const fs = require('fs');

const dataPath = './fallback_data.json';
let data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// 1. Collect all unique songs
const uniqueSongsMap = new Map();
data.forEach(d => {
  d.results.forEach(r => {
    if (!uniqueSongsMap.has(r.id)) {
      uniqueSongsMap.set(r.id, r);
    }
  });
});

const allUniqueSongs = Array.from(uniqueSongsMap.values());
console.log(`Total unique songs: ${allUniqueSongs.length}`);

// First, de-duplicate queries in data to avoid having two "trending songs" entries
const uniqueQueries = [];
const seenQueries = new Set();
for (let d of data) {
  if (!seenQueries.has(d.query)) {
    seenQueries.add(d.query);
    uniqueQueries.push(d);
  }
}
data = uniqueQueries;

const discoverQueries = [
  'trending songs',
  'recommended songs based on history',
  'songs similar to recently played',
  'new release songs',
  'top trending artists',
  'top charts'
];

let songIndex = 0;

// Assign strictly to discover queries first to guarantee 100% no overlap
data.forEach(d => {
  if (discoverQueries.includes(d.query)) {
    const newResults = [];
    for (let i = 0; i < 10; i++) {
      newResults.push({ ...allUniqueSongs[songIndex % allUniqueSongs.length] });
      songIndex++;
    }
    d.results = newResults;
  }
});

// Assign to the rest
data.forEach(d => {
  if (!discoverQueries.includes(d.query)) {
    const newResults = [];
    for (let i = 0; i < 10; i++) {
      newResults.push({ ...allUniqueSongs[songIndex % allUniqueSongs.length] });
      songIndex++;
    }
    d.results = newResults;
  }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Successfully redistributed unique songs to all categories.');

// Verify no duplicates across the main discover categories
let discoverSeen = new Set();
let discoverDups = 0;
data.forEach(d => {
  if (discoverQueries.includes(d.query)) {
    d.results.forEach(r => {
      if (discoverSeen.has(r.id)) discoverDups++;
      discoverSeen.add(r.id);
    });
  }
});
console.log(`Duplicates in Discover page sections: ${discoverDups}`);
