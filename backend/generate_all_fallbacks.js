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

// Shuffle function
function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

const sections = [
  "Trending Songs",
  "Recommended Songs Based on History",
  "Songs similar to recently played",
  "New Release Songs",
  "Top Trending Artists",
  "Top Charts"
];

const genres = [
  "All",
  "Pop",
  "Bollywood",
  "Hip-Hop",
  "Rock",
  "EDM",
  "Lo-fi"
];

const newFallbackData = [];
const itemsPerSection = 15;

genres.forEach(genre => {
  // Shuffle songs for this genre view so different genres look different
  const shuffledSongs = shuffle([...allUniqueSongs]);
  let songIndex = 0;

  sections.forEach(section => {
    let searchStr = section;
    if (genre !== "All") {
      searchStr = `${searchStr} ${genre}`;
    }
    const cacheKey = searchStr.trim().toLowerCase();

    const results = [];
    for (let i = 0; i < itemsPerSection; i++) {
      results.push({ ...shuffledSongs[songIndex % shuffledSongs.length] });
      songIndex++;
    }

    newFallbackData.push({
      query: cacheKey,
      results: results
    });
  });
});

// Also keep any other existing queries that aren't covered by the matrix (just in case)
const newQuerySet = new Set(newFallbackData.map(d => d.query));
data.forEach(d => {
  if (!newQuerySet.has(d.query)) {
    newFallbackData.push(d);
  }
});

fs.writeFileSync(dataPath, JSON.stringify(newFallbackData, null, 2));
console.log(`Successfully generated combinations. Total queries: ${newFallbackData.length}`);
