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
  "Recommended Songs",
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

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const newFallbackData = [];

  for (const genre of genres) {
    const seenIds = new Set();
    const seenTitles = new Set();
    
    for (const section of sections) {
      let searchStr = section;
      if (genre !== "All") {
        searchStr = `${searchStr} ${genre}`;
      }
      
      const cacheKey = searchStr.trim().toLowerCase();
      
      let queryForSearch = searchStr;
      if (genre === 'All') {
        queryForSearch = `Top hit ${searchStr}`;
      }
      
      console.log(`Searching for: ${queryForSearch}...`);
      let results = [];
      try {
        const result = await ytSearch(queryForSearch); 
        if (result && result.videos) {
          const songs = result.videos.filter(video => {
              const t = video.title.toLowerCase();
              return video.seconds >= 60 &&
              video.seconds <= 400 && 
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
          
          let uniqueMapped = [];
          for (let track of mapped) {
            const cleanTitle = sanitizeTitle(track.title);
            if (!seenIds.has(track.id) && !seenTitles.has(cleanTitle)) {
              seenIds.add(track.id);
              seenTitles.add(cleanTitle);
              uniqueMapped.push(track);
            }
          }
          
          results = uniqueMapped.slice(0, 20);
        }
      } catch (err) {
        console.error(`Error searching for ${queryForSearch}:`, err);
      }
      
      newFallbackData.push({
        query: cacheKey,
        results: results
      });
      
      await delay(500);
    }
  }

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
  console.log(`Successfully generated accurate combinations. Total queries: ${newFallbackData.length}`);
}

main().catch(console.error);
