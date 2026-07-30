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
  "thomas songs",
  "for you mix songs",
  "moods songs",
  "recent songs",
  "trending songs",
  "pop songs",
  "arijit singh"
];

async function generateFallback() {
  const fallbackData = [];
  console.log('Generating fallback data...');
  
  for (const query of queries) {
    console.log(`Searching for: ${query}`);
    try {
      const results = await performLiveSearch(query);
      if (results.length > 0) {
        fallbackData.push({
          query: query.toLowerCase(),
          results: results
        });
        console.log(`✅ Found ${results.length} results for "${query}"`);
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
