const ytSearch = require('yt-search');
const fs = require('fs');
const path = require('path');

const sanitizeTitle = (title) => {
  return title
    .replace(/\[.*?\]|\(.*?\)|ft\..*|feat\..*|official video|music video|lyric video|audio|remix/gi, '')
    .trim();
};

const mapYoutubeTrack = (item) => {
  if (!item) return null;
  return {
    id: item.videoId,
    uri: item.videoId,
    title: sanitizeTitle(item.title),
    artist: item.author.name,
    image: item.thumbnail,
    duration: item.seconds,
    youtubeId: item.videoId
  };
};

const performLiveSearch = async (q) => {
    const result = await ytSearch(q);
    if (!result.videos) return [];
    
    const songs = result.videos.filter(video =>
        video.seconds >= 60 &&
        video.seconds <= 600 &&
        !video.title.toLowerCase().includes("live") &&
        !video.title.toLowerCase().includes("mix") &&
        !video.title.toLowerCase().includes("playlist") &&
        !video.title.toLowerCase().includes("hours")
    );
    
    return songs.slice(0, 10).map(mapYoutubeTrack).filter(t => t.image);
};

const queries = [
  "sai abhyankar songs",
  "anirudh ravichander songs",
  "bollywood songs",
  "top hindi songs",
  "hindi moods songs",
  "hindi recent songs",
  "hindi trending songs",
  "hindi pop songs",
  "arijit singh",
  "Trending Songs",
  "Trending India Songs",
  "New Release Songs",
  "Popular Album Playlists",
  "Top Trending Artists",
  "Tamil Hits Songs",
  "Telugu Trending Hits",
  "Punjabi Hit Songs",
  "Bollywood Hit Songs",
  "Recommended Songs Based on History",
  "Songs similar to recently played"
];

  async function generateFallback() {
  const fallbackData = [];
  console.log('Generating fallback data...');
  
  let reliableHindiSongs = [];

  for (const query of queries) {
    console.log(`Searching for: ${query}`);
    try {
      let liveSearchQuery = query;
      let cacheKey = query.replace('hindi ', '').toLowerCase();
      if (query === 'top hindi songs') {
          cacheKey = 'for you mix songs';
      }

      let results = await performLiveSearch(liveSearchQuery);
      
      // If we got good results, save them to use as a backup for failing queries
      if (results.length >= 8 && reliableHindiSongs.length === 0) {
          reliableHindiSongs = results;
      }

      // If YouTube returns garbage (less than 5 results) for generic queries, copy the reliable results!
      if (results.length < 5 && reliableHindiSongs.length > 0) {
          console.log(`⚠️ Low results for ${query}, copying reliable Hindi songs...`);
          results = reliableHindiSongs.map(r => ({...r})); // Clone the array
      }

      if (results.length > 0) {
        fallbackData.push({
          query: cacheKey,
          results: results
        });
        console.log(`✅ Found ${results.length} results for "${query}" -> caching as "${cacheKey}"`);
      } else {
        console.log(`❌ No results for "${query}"`);
      }
    } catch (e) {
      console.error(`❌ Error searching for "${query}":`, e.message);
    }
  }

  const outputPath = path.join(__dirname, 'fallback_data.json');
  fs.writeFileSync(outputPath, JSON.stringify(fallbackData, null, 2));
  console.log(`\n🎉 Successfully updated ${outputPath} with ${fallbackData.length} queries.`);
}

generateFallback();
