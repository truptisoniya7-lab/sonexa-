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
    
    // Dynamic mock data based on query to match exactly what localhost generated
    const query = q.toLowerCase();
    
    try {
      const fallbackData = require('../fallback_data.json');
      // Find the exact match for the query (e.g. "top hits", "trending songs")
      const exactMatch = fallbackData.find(d => d.query === query);
      
      if (exactMatch && exactMatch.results && exactMatch.results.length > 0) {
        return res.json(exactMatch.results);
      }
      
      // If the query doesn't match our exact pre-generated fallbacks,
      // try to find one that includes the word or just default to top hits
      const partialMatch = fallbackData.find(d => query.includes(d.query) || d.query.includes(query));
      if (partialMatch && partialMatch.results && partialMatch.results.length > 0) {
        return res.json(partialMatch.results);
      }

      // Default to "top hits" if completely unknown query
      return res.json(fallbackData[0].results);
    } catch (fallbackError) {
      console.error('Failed to load fallback_data.json', fallbackError);
      return res.json([]);
    }
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
