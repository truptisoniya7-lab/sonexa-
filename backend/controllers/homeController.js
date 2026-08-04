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

    let madeForYouEndpoint = '/api/music/discover?section=recommended songs based on history';

    // Personalization Logic: Override static artists with user's top artists if history exists
    if (supabase) {
      const { data: history } = await supabase
        .from('listening_history')
        .select('song_artist')
        .eq('user_id', userId)
        .order('played_at', { ascending: false })
        .limit(50);
        
      if (history && history.length > 0) {
        const counts = {};
        history.forEach(h => {
          if (h.song_artist) {
            counts[h.song_artist] = (counts[h.song_artist] || 0) + 1;
          }
        });
        
        const topArtists = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(e => e[0])
          .filter(a => a && a.trim() !== '' && a !== 'Unknown');

        // Replace as many static sections as we have top artists (up to 5)
        for (let i = 0; i < Math.min(topArtists.length, 5); i++) {
          const artist = topArtists[i];
          if (i === 0) {
            // Use top artist for "Made For You"
            madeForYouEndpoint = `/api/music/discover?section=${encodeURIComponent(artist + ' mix')}`;
          }
          dynamicArtistSections[i] = {
            id: `personalized-artist-${i}`,
            title: `Because You Listened To ${artist}`,
            search: artist
          };
        }
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
      // Because You Played This (first dynamic artist)
      ...(dynamicArtistSections[0] ? [{
        id: 'because-you-played',
        type: 'CAROUSEL',
        title: `Because You Played ${dynamicArtistSections[0].search}`,
        endpoint: `/api/music/discover?section=${encodeURIComponent(dynamicArtistSections[0].search + ' songs')}`,
        motionPreset: 'level-3',
        caching: { strategy: 'stale-while-revalidate', ttl: 3600 }
      }] : []),
      // Similar Artists (second dynamic artist)
      ...(dynamicArtistSections[1] ? [{
        id: 'similar-artists',
        type: 'CAROUSEL',
        title: `Similar to ${dynamicArtistSections[1].search}`,
        endpoint: `/api/music/discover?section=${encodeURIComponent(dynamicArtistSections[1].search + ' hit songs')}`,
        motionPreset: 'level-3',
        caching: { strategy: 'stale-while-revalidate', ttl: 3600 }
      }] : []),
      {
        id: 'trending',
        type: 'COVER_FLOW',
        title: 'Trending in India',
        endpoint: '/api/home/trending',
        motionPreset: 'level-2',
        caching: { strategy: 'stale-while-revalidate', ttl: 7200 }
      },
      {
        id: 'the-pulse',
        type: 'BENTO_GRID',
        title: 'The Pulse',
        endpoint: null,
        motionPreset: 'level-1',
        caching: { strategy: 'cache-first', ttl: 0 }
      },
      {
        id: 'mood-mixes',
        type: 'CAROUSEL',
        title: 'Your Mood Mixes',
        endpoint: `/api/music/discover?section=${encodeURIComponent((dynamicArtistSections[0]?.search || 'Bollywood') + ' mood mix songs')}`,
        motionPreset: 'level-1',
        caching: { strategy: 'stale-while-revalidate', ttl: 86400 }
      },
      {
        id: 'recently-played',
        type: 'INFINITE_CAROUSEL',
        title: 'Recently Played',
        endpoint: `/api/history/recent/${userId}`,
        motionPreset: 'level-3',
        caching: { strategy: 'cache-first', ttl: 0 }
      },
      {
        id: 'albums-you-will-like',
        type: 'CAROUSEL',
        title: 'Albums You\'ll Like',
        endpoint: `/api/music/discover?section=Trending Albums`,
        motionPreset: 'level-3',
        caching: { strategy: 'stale-while-revalidate', ttl: 86400 }
      },
      // Additional dynamic sections for depth
      ...dynamicArtistSections.slice(2).map((section) => ({
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
