const HomeService = require('../services/HomeService');
const LiveRoomService = require('../services/LiveRoomService');
const PlaylistService = require('../services/PlaylistService');
const { supabase } = require('../config/db');

const getCoreHome = async (req, res) => {
  try {
    const userId = req.cookies.user_id || '1'; // Defaulting to 1 for demo
    const data = await HomeService.getCoreHomeData(userId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTrending = async (req, res) => {
  try {
    const playlists = await PlaylistService.getTrendingPlaylists();
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLive = async (req, res) => {
  try {
    const rooms = await LiveRoomService.getLiveRooms();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFriends = async (req, res) => {
  try {
    const activity = await LiveRoomService.getFriendsActivity();
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLayout = async (req, res) => {
  try {
    const userId = req.cookies?.user_id || req.headers['x-user-id'] || '1'; // Default to 1 for demo

    // Base Static Layout (Cold Start)
    let dynamicArtistSections = [
      { id: 'bollywood', title: 'Bollywood Hits', search: 'Bollywood' },
      { id: 'babushan', title: 'Babushan Hits', search: 'Babushan' },
      { id: 'anubhav', title: 'Anubhav Hits', search: 'Anubhav' },
      { id: 'tamil-songs', title: 'Tamil Hits', search: 'Tamil Songs' },
      { id: 'vijay', title: 'Vijay Thalapathy', search: 'Vijay Thalapathy' }
    ];

    let madeForYouEndpoint = '/api/music/discover?section=hindi bollywood romantic songs';

    // Personalization Logic: Override static artists with user's top artists if history exists
    let continueListeningRow = null;

    if (supabase) {
      const { data: history } = await supabase
        .from('play_history')
        .select('*, tracks(artist)')
        .eq('user_id', userId)
        .order('played_at', { ascending: false })
        .limit(50);
        
      if (history && history.length > 0) {
        // Continue Listening check
        const continueSongs = history.filter(h => h.progress > 0.10 && !h.completed);
        if (continueSongs.length > 0) {
          continueListeningRow = {
            id: 'continue-listening',
            type: 'INFINITE_CAROUSEL', // Or regular CAROUSEL
            title: 'Continue Listening',
            endpoint: `/api/history/recent/${userId}?filter=continue`, 
            motionPreset: 'level-1',
            caching: { strategy: 'cache-first', ttl: 0 }
          };
        }

        const counts = {};
        history.forEach(h => {
          const artist = h.tracks?.artist;
          if (artist) {
            counts[artist] = (counts[artist] || 0) + 1;
          }
        });
        
        const topArtists = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(e => e[0])
          .filter(a => a && a.trim() !== '' && a !== 'Unknown');

        // Personalization override has been disabled to keep static hit sections
      }
    }

    const layout = [
      {
        id: 'hero',
        type: 'HERO',
        endpoint: null,
        motionPreset: 'level-1',
        caching: { strategy: 'cache-first', ttl: 0 }
      },
      {
        id: 'made-for-you',
        type: 'CAROUSEL',
        title: 'Made For You',
        endpoint: madeForYouEndpoint,
        motionPreset: 'level-3',
        caching: { strategy: 'stale-while-revalidate', ttl: 3600 }
      },
      {
        id: 'trending',
        type: 'COVER_FLOW',
        title: 'Trending in India',
        endpoint: '/api/home/trending',
        motionPreset: 'level-2',
        caching: { strategy: 'stale-while-revalidate', ttl: 7200 }
      },
      {
        id: 'global-trending-songs',
        type: 'CAROUSEL',
        title: 'Global Trending Songs',
        endpoint: '/api/music/discover?section=trending songs',
        motionPreset: 'level-1',
        caching: { strategy: 'stale-while-revalidate', ttl: 3600 }
      },
      {
        id: 'mood-mixes',
        type: 'CAROUSEL',
        title: 'Your Mood Mixes',
        endpoint: `/api/music/discover?section=mood mixes`,
        motionPreset: 'level-1',
        caching: { strategy: 'stale-while-revalidate', ttl: 86400 }
      },
      {
        id: 'albums-you-will-like',
        type: 'CAROUSEL',
        title: 'Albums You\'ll Like',
        endpoint: `/api/music/discover?section=Top Bollywood Hit Songs`,
        motionPreset: 'level-3',
        caching: { strategy: 'stale-while-revalidate', ttl: 86400 }
      },
      ...dynamicArtistSections.map((section) => ({
        id: section.id,
        type: 'CAROUSEL',
        title: section.title,
        endpoint: `/api/music/discover?section=${encodeURIComponent(section.search)}`,
        motionPreset: 'level-3',
        caching: { strategy: 'stale-while-revalidate', ttl: 3600 }
      }))
    ];

    res.json({ layout });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCoreHome,
  getTrending,
  getLive,
  getFriends,
  getLayout
};
