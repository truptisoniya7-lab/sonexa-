const HomeService = require('../services/HomeService');
const LiveRoomService = require('../services/LiveRoomService');
const PlaylistService = require('../services/PlaylistService');

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
        endpoint: '/api/music/discover?category=for you mix',
        motionPreset: 'level-3',
        caching: { strategy: 'stale-while-revalidate', ttl: 3600 }
      },
      {
        id: 'trending',
        type: 'COVER_FLOW',
        title: 'Trending Playlists',
        endpoint: '/api/home/trending',
        motionPreset: 'level-2',
        caching: { strategy: 'stale-while-revalidate', ttl: 7200 }
      },
      {
        id: 'moods',
        type: 'MASONRY',
        title: 'Mood Mixes',
        endpoint: '/api/music/discover?section=Mood Mixes',
        motionPreset: 'level-3',
        caching: { strategy: 'stale-while-revalidate', ttl: 86400 }
      },
      {
        id: 'sai-abhyankar',
        type: 'CAROUSEL',
        title: 'Sai Abhyankar',
        endpoint: '/api/music/discover?section=Sai Abhyankar',
        motionPreset: 'level-3',
        caching: { strategy: 'stale-while-revalidate', ttl: 3600 }
      },
      {
        id: 'anirudh',
        type: 'CAROUSEL',
        title: 'Anirudh',
        endpoint: '/api/music/discover?section=Anirudh Ravichander',
        motionPreset: 'level-3',
        caching: { strategy: 'stale-while-revalidate', ttl: 3600 }
      },
      {
        id: 'bollywood',
        type: 'CAROUSEL',
        title: 'Bollywood Hits',
        endpoint: '/api/music/discover?section=Bollywood',
        motionPreset: 'level-3',
        caching: { strategy: 'stale-while-revalidate', ttl: 3600 }
      },
      {
        id: 'babushan',
        type: 'CAROUSEL',
        title: 'Babushan Hits',
        endpoint: '/api/music/discover?section=Babushan',
        motionPreset: 'level-3',
        caching: { strategy: 'stale-while-revalidate', ttl: 3600 }
      },
      {
        id: 'anubhav',
        type: 'CAROUSEL',
        title: 'Anubhav Hits',
        endpoint: '/api/music/discover?section=Anubhav',
        motionPreset: 'level-3',
        caching: { strategy: 'stale-while-revalidate', ttl: 3600 }
      },
      {
        id: 'tamil-songs',
        type: 'CAROUSEL',
        title: 'Tamil Hits',
        endpoint: '/api/music/discover?section=Tamil Songs',
        motionPreset: 'level-3',
        caching: { strategy: 'stale-while-revalidate', ttl: 3600 }
      },
      {
        id: 'vijay',
        type: 'CAROUSEL',
        title: 'Vijay Thalapathy',
        endpoint: '/api/music/discover?section=Vijay Thalapathy',
        motionPreset: 'level-3',
        caching: { strategy: 'stale-while-revalidate', ttl: 3600 }
      },
      {
        id: 'recently-played',
        type: 'INFINITE_CAROUSEL',
        title: 'Recently Played',
        endpoint: '/api/music/discover?category=recent',
        motionPreset: 'level-3',
        caching: { strategy: 'cache-first', ttl: 1800 }
      }
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
