const { supabase } = require('../config/db');
const fetch = require('node-fetch');

const getAppToken = async () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID || '';
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basicAuth}`
    },
    body: 'grant_type=client_credentials'
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data.access_token;
};

const getToken = async (req) => {
  if (req.cookies && req.cookies.spotify_access_token) return req.cookies.spotify_access_token;
  return await getAppToken();
};

const mapSpotifyTrack = (item) => {
  if (!item) return null;
  const track = item.track || item;
  return {
    id: track.id,
    uri: track.uri,
    title: track.name,
    artist: track.artists?.map(a => a.name).join(', ') || 'Unknown Artist',
    image: track.album?.images?.[0]?.url || '',
    duration: track.duration_ms / 1000,
  };
};

const getHeroRecommendations = async (req, res) => {
  const fallbackHero = [
    {
      id: `hero-fallback-1`,
      type: 'TrendingPlaylist',
      title: 'Top Hits 2026',
      subtitle: `Featuring The Weeknd`,
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800&h=800',
      actionLabel: 'Listen Now',
      uri: 'spotify:playlist:37i9dQZEVXbMDoHDwVN2tF'
    },
    {
      id: `hero-fallback-2`,
      type: 'NewAlbum',
      title: 'Midnight Vibes',
      subtitle: `Featuring Chill Beats`,
      image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=800&h=800',
      actionLabel: 'Play Album',
      uri: 'spotify:playlist:37i9dQZF1DWXRqgorJj26U'
    }
  ];

  try {
    const token = await getToken(req);
    if (!token) return res.json(fallbackHero);

    // Fetch Spotify "Global Top 50" (37i9dQZEVXbMDoHDwVN2tF)
    const response = await fetch(`https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF/tracks?limit=4`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) return res.json(fallbackHero);
    
    const data = await response.json();
    if (!data.items) return res.json(fallbackHero);
    
    const items = data.items.map(mapSpotifyTrack).filter(t => t && t.image).map((item, index) => {
      const types = ['TrendingPlaylist', 'EditorialPlaylist', 'NewAlbum', 'FriendListeningParty'];
      const actions = ['Listen Now', 'Play Mix', 'Play Album', 'Join Session'];
      return {
        id: `hero-${item.id}`,
        type: types[index % types.length],
        title: item.title,
        subtitle: `Featuring ${item.artist}`,
        image: item.image,
        actionLabel: actions[index % actions.length],
        uri: item.uri
      };
    });

    res.json(items.length > 0 ? items : fallbackHero);
  } catch (error) {
    console.error('Error fetching hero recommendations:', error);
    res.json(fallbackHero);
  }
};

const getQuickPicks = async (req, res) => {
  try {
    const token = await getToken(req);
    if (!token) return res.json([]);

    // Fetch Spotify "Rock Classics" (37i9dQZF1DWXRqgorJj26U) for Quick Picks
    const response = await fetch(`https://api.spotify.com/v1/playlists/37i9dQZF1DWXRqgorJj26U/tracks?limit=8`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!data.items) return res.json([]);
    
    const picks = data.items.map(mapSpotifyTrack).filter(t => t && t.image);
    res.json(picks);
  } catch (error) {
    console.error('Error fetching quick picks:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getHeroRecommendations,
  getQuickPicks
};
