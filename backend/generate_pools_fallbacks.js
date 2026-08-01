const fs = require('fs');
const ytSearch = require('yt-search');

const sanitizeTitle = (title) => {
  return title
    .replace(/\[.*?\]|\(.*?\)|ft\..*|feat\..*|official video|music video|lyric video|audio|remix|4k|hd|music/gi, '')
    .trim()
    .toLowerCase();
};

const mapYoutubeTrack = (item) => {
  if (!item) return null;
  return {
    id: item.videoId,
    uri: item.videoId,
    title: item.title,
    artist: item.author.name,
    image: item.thumbnail,
    duration: item.seconds,
    youtubeId: item.videoId
  };
};

const sections = [
  "Trending Songs",
  "Recommended Songs Based on History",
  "Songs similar to recently played",
  "New Release Songs",
  "Top Trending Artists",
  "Top Charts"
];

// Use specific popular artists to guarantee individual music videos are fetched instead of compilation videos
const genreQueries = {
  "All": ["Ariana Grande", "Arijit Singh", "Drake", "Ed Sheeran", "The Weeknd", "Taylor Swift", "Post Malone", "Dua Lipa", "Imagine Dragons"],
  "Pop": ["Taylor Swift", "Ariana Grande", "Dua Lipa", "Ed Sheeran", "Justin Bieber", "Katy Perry", "Maroon 5", "Bruno Mars"],
  "Bollywood": ["Arijit Singh", "Shreya Ghoshal", "Neha Kakkar", "Badshah", "Atif Aslam", "Sonu Nigam", "Jubin Nautiyal", "Pritam"],
  "Hip-Hop": ["Drake", "Kendrick Lamar", "Eminem", "Travis Scott", "J. Cole", "Kanye West", "Future", "21 Savage"],
  "Rock": ["Imagine Dragons", "Coldplay", "Linkin Park", "Nirvana", "Red Hot Chili Peppers", "Foo Fighters", "Arctic Monkeys", "Green Day"],
  "EDM": ["Martin Garrix", "Calvin Harris", "David Guetta", "Avicii", "Marshmello", "Tiësto", "Zedd", "The Chainsmokers"],
  "Lo-fi": ["Kupla", "Jinsang", "idealism", "bsd.u", "eevee", "jhfly", "tomppabeats", "potsu"]
};

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

async function main() {
  const newFallbackData = [];

  for (const [genre, queries] of Object.entries(genreQueries)) {
    console.log(`\nBuilding pool for genre: ${genre}`);
    const pool = [];
    const seenIds = new Set();
    const seenTitles = new Set();
    
    // Fetch songs for this genre
    for (const q of queries) {
      try {
        const result = await ytSearch(`${q} song`);
        if (result && result.videos) {
          const songs = result.videos.filter(video => {
              const t = video.title.toLowerCase();
              return video.seconds >= 60 &&
              video.seconds <= 480 && // Extended to 8 mins for some rock/edm tracks
              !t.includes("live") &&
              !t.includes("mix") &&
              !t.includes("playlist") &&
              !t.includes("hours") &&
              !t.includes("jukebox") &&
              !t.includes("mashup") &&
              !t.includes("compilation") &&
              !t.includes("non stop") &&
              !t.includes("nonstop") &&
              !t.includes("medley");
          });
          
          let mapped = songs.map(mapYoutubeTrack).filter(t => t.image);
          
          for (let track of mapped) {
            const cleanTitle = sanitizeTitle(track.title);
            if (!seenIds.has(track.id) && !seenTitles.has(cleanTitle)) {
              seenIds.add(track.id);
              seenTitles.add(cleanTitle);
              pool.push(track);
            }
          }
        }
      } catch (err) {
        // Suppress errors to keep output clean
      }
      await delay(200);
    }
    
    console.log(`  -> Gathered ${pool.length} unique songs for ${genre}`);
    const shuffledPool = shuffle([...pool]);
    
    // Distribute to sections
    let songIndex = 0;
    for (const section of sections) {
      let searchStr = section;
      if (genre !== "All") {
        searchStr = `${searchStr} ${genre}`;
      }
      
      let cacheKey = searchStr.trim().toLowerCase();
      if (section === "Recommended Songs Based on History" && genre === "All") cacheKey = "recommended songs based on history";
      if (section === "Recommended Songs Based on History" && genre !== "All") cacheKey = `recommended songs based on history ${genre.toLowerCase()}`;
      
      const results = [];
      // We want to fill 20 slots. If the pool is small, we skip to avoid dupes, 
      // but ideally we just take 20. If pool < 20, we just take what we have to prevent duplicating within the same section.
      const numToTake = Math.min(20, shuffledPool.length);
      
      for (let i = 0; i < numToTake; i++) {
        if (shuffledPool.length > 0) {
          results.push({ ...shuffledPool[songIndex % shuffledPool.length] });
          songIndex++;
        }
      }
      
      newFallbackData.push({
        query: cacheKey,
        results: results
      });
    }
  }

  // Preserve other queries not touched
  try {
    const oldData = JSON.parse(fs.readFileSync('./fallback_data.json', 'utf-8'));
    const newQuerySet = new Set(newFallbackData.map(d => d.query));
    
    oldData.forEach(d => {
      if (!newQuerySet.has(d.query) && !d.query.includes('songs similar to') && !d.query.includes('recommended songs')) {
        newFallbackData.push(d);
      }
    });
  } catch(e) {}

  fs.writeFileSync('./fallback_data.json', JSON.stringify(newFallbackData, null, 2));
  console.log(`\nSuccessfully generated artist-based pools. Total queries: ${newFallbackData.length}`);
}

main().catch(console.error);
