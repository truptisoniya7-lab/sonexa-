const ytSearch = require('yt-search');
const { supabase } = require('../config/db');

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

const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

const getCachedSearch = async (queryKey) => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('search_cache')
      .select('results, updated_at')
      .eq('query_key', queryKey)
      .single();
    if (error || !data) return null;
    
    const age = Date.now() - new Date(data.updated_at).getTime();
    if (age > CACHE_TTL) return null;

    return data.results;
  } catch (err) {
    console.error('Supabase get error:', err);
    return null;
  }
};

const setCachedSearch = async (queryKey, results) => {
  if (!supabase) return;
  try {
    await supabase
      .from('search_cache')
      .upsert({
        query_key: queryKey,
        results: results,
        updated_at: new Date().toISOString()
      }, { onConflict: 'query_key' });
  } catch (err) {
    console.error('Supabase set error:', err);
  }
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

// In-memory locks for concurrent requests
const activeSearches = new Map();

const search = async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json([]);
  
  const cacheKey = q.toLowerCase();
  
  // 1. Check Supabase DB Cache
  const dbCache = await getCachedSearch(cacheKey);
  if (dbCache) {
    return res.json(dbCache);
  }

  // 2. Prevent concurrent identical live searches
  if (activeSearches.has(cacheKey)) {
    try {
      const results = await activeSearches.get(cacheKey);
      return res.json(results);
    } catch (e) {}
  }
  
  const searchPromise = (async () => {
    const results = await performLiveSearch(q);
    if (results && results.length > 0) {
      await setCachedSearch(cacheKey, results);
    }
    return results;
  })();

  activeSearches.set(cacheKey, searchPromise);

  try {
    const topResults = await searchPromise;
    res.json(topResults);
  } catch (error) {
    console.error('Error in music search (likely Vercel IP block):', error);
    try {
      const fallbackData = require('../fallback_data.json');
      const exactMatch = fallbackData.find(d => d.query === cacheKey);
      if (exactMatch && exactMatch.results && exactMatch.results.length > 0) {
        return res.json(exactMatch.results);
      }
      const partialMatch = fallbackData.find(d => cacheKey.includes(d.query) || d.query.includes(cacheKey));
      if (partialMatch && partialMatch.results && partialMatch.results.length > 0) {
        return res.json(partialMatch.results);
      }
      return res.json(fallbackData[0].results);
    } catch (fallbackError) {
      return res.json([]);
    }
  } finally {
    activeSearches.delete(cacheKey);
  }
};

const discover = async (req, res) => {
  const { language, genre, section } = req.query;
  
  let searchStr = "";
  
  if (section) {
    searchStr = section;
    if (language && language !== 'All') searchStr = `${language} ${searchStr}`;
    if (genre && genre !== 'All') searchStr = `${searchStr} ${genre}`;
  } else {
    if (language && language !== 'All') searchStr += `${language} `;
    if (genre && genre !== 'All') searchStr += `${genre} `;
    searchStr += "songs";
  }
  
  const cacheKey = searchStr.trim().toLowerCase();
  if (!cacheKey) return res.json([]);
  
  const dbCache = await getCachedSearch(cacheKey);
  if (dbCache) {
    return res.json(dbCache);
  }

  if (activeSearches.has(cacheKey)) {
    try {
      const results = await activeSearches.get(cacheKey);
      return res.json(results);
    } catch (e) {}
  }

  const searchPromise = (async () => {
    const results = await performLiveSearch(searchStr);
    if (results && results.length > 0) {
      await setCachedSearch(cacheKey, results);
    }
    return results;
  })();

  activeSearches.set(cacheKey, searchPromise);

  try {
    const results = await searchPromise;
    res.json(results);
  } catch (error) {
    console.error(`Discover error for [${cacheKey}]:`, error);
    try {
      const fallbackData = require('../fallback_data.json');
      return res.json(fallbackData[0]?.results || []);
    } catch (e) {
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
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  search,
  discover,
  genres
};
