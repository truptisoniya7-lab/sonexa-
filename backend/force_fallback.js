const fs = require('fs');
const path = require('path');

const fallbackPath = path.join(__dirname, 'fallback_data.json');
let fallbackData = require(fallbackPath);

// Find the best quality array of songs (trending songs has good Indian songs)
let bestSongs = fallbackData.find(d => d.query === 'trending songs')?.results;

if (!bestSongs) {
    // fallback to arijit singh if trending is missing
    bestSongs = fallbackData.find(d => d.query === 'arijit singh')?.results;
}

if (bestSongs) {
    // Manually ensure "Made For You", "Moods", etc have these good songs 
    // so Vercel doesn't show random English pop or weird mashups.
    const queriesToFix = [
        "for you mix songs",
        "for you mix",
        "moods songs",
        "moods",
        "recent songs",
        "recent"
    ];
    
    for (const q of queriesToFix) {
        const existing = fallbackData.find(d => d.query === q);
        if (existing) {
            existing.results = bestSongs;
        } else {
            fallbackData.push({ query: q, results: bestSongs });
        }
    }

    fs.writeFileSync(fallbackPath, JSON.stringify(fallbackData, null, 2));
    console.log("Forced all homepage fallback queries to use the best Indian songs!");
} else {
    console.log("Could not find bestSongs to duplicate.");
}
