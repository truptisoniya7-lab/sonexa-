const ytSearch = require('yt-search');

const sanitizeTitle = (title) => {
  return title
    .replace(/\[.*?\]|\(.*?\)|ft\..*|feat\..*|official video|music video|lyric video|audio|remix/gi, '')
    .trim();
};

const mapYoutubeTrack = (item) => {
  if (!item) return null;
  return {
    id: item.videoId,
    uri: item.videoId, // Treat videoId as the unique URI
    title: sanitizeTitle(item.title),
    artist: item.author.name,
    image: item.thumbnail,
    duration: item.seconds, // timestamp is usually a string like "3:45", seconds is numeric
    youtubeId: item.videoId
  };
};

const cache = new Map();
const activeSearches = new Map();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

const search = async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json([]);
  
  const cacheKey = q.toLowerCase();
  
  if (cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (Date.now() - cachedData.timestamp < CACHE_TTL) {
      return res.json(cachedData.results);
    }
  }

  if (activeSearches.has(cacheKey)) {
    try {
      const results = await activeSearches.get(cacheKey);
      return res.json(results);
    } catch (e) {
      // Ignore and try again below
    }
  }
  
  const searchPromise = (async () => {
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
    
    const topResults = songs.slice(0, 10).map(mapYoutubeTrack).filter(t => t.image);
    
    cache.set(cacheKey, {
      timestamp: Date.now(),
      results: topResults
    });
    
    return topResults;
  })();

  activeSearches.set(cacheKey, searchPromise);

  try {
    const topResults = await searchPromise;
    res.json(topResults);
  } catch (error) {
    console.error('Error in music search (likely Vercel IP block):', error);
    // Fallback to mock data if YouTube blocks the Vercel datacenter IP
    res.json([
      {
        "id": "sMQ0Eh1JNyk",
        "uri": "sMQ0Eh1JNyk",
        "title": "Fell For You - Shubh",
        "artist": "Sick Vibe",
        "image": "https://i.ytimg.com/vi/sMQ0Eh1JNyk/hq720.jpg",
        "duration": 200,
        "youtubeId": "sMQ0Eh1JNyk"
      },
      {
        "id": "vidD46DKOFI",
        "uri": "vidD46DKOFI",
        "title": "Fell For You Mashup | Harshal Music",
        "artist": "Harshal Music",
        "image": "https://i.ytimg.com/vi/vidD46DKOFI/hq720.jpg",
        "duration": 455,
        "youtubeId": "vidD46DKOFI"
      },
      {
        "id": "RQUuqbzQVsY",
        "uri": "RQUuqbzQVsY",
        "title": "KHAID - FOR YOU",
        "artist": "Khaid",
        "image": "https://i.ytimg.com/vi/RQUuqbzQVsY/hq720.jpg",
        "duration": 180,
        "youtubeId": "RQUuqbzQVsY"
      },
      {
        "id": "YQ-qToZUybM",
        "uri": "YQ-qToZUybM",
        "title": "Liam Payne, Rita Ora - For You",
        "artist": "FiftyShadesVEVO",
        "image": "https://i.ytimg.com/vi/YQ-qToZUybM/hq720.jpg",
        "duration": 249,
        "youtubeId": "YQ-qToZUybM"
      }
    ]);
  } finally {
    activeSearches.delete(cacheKey);
  }
};

const genres = async (req, res) => {
  try {
    const genreList = [
      { id: 'g1', name: 'Pop', color: 'bg-pink-500' },
      { id: 'g2', name: 'Bollywood', color: 'bg-orange-500' },
      { id: 'g3', name: 'Hip-Hop', color: 'bg-blue-500' },
      { id: 'g4', name: 'Rock', color: 'bg-red-500' },
      { id: 'g5', name: 'EDM', color: 'bg-indigo-500' },
      { id: 'g6', name: 'Lo-fi', color: 'bg-purple-500' }
    ];
    res.json(genreList);
  } catch (error) {
    console.error('Error in music genres:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  search,
  genres
};
