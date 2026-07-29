const { supabase } = require('../config/db');
const fetch = require('node-fetch');

let appTokenCache = null;
let appTokenExpiresAt = 0;

const getAppToken = async () => {
  if (appTokenCache && Date.now() < appTokenExpiresAt) {
    return appTokenCache;
  }

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
  
  appTokenCache = data.access_token;
  appTokenExpiresAt = Date.now() + (data.expires_in * 1000) - 60000; // cache until 1 min before expiry
  
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

let heroCache = null;
let heroExpiresAt = 0;

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
    if (heroCache && Date.now() < heroExpiresAt) {
      return res.json(heroCache);
    }

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

    const result = items.length > 0 ? items : fallbackHero;
    heroCache = result;
    heroExpiresAt = Date.now() + 1000 * 60 * 15; // Cache for 15 minutes
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching hero recommendations:', error);
    if (heroCache) {
      return res.json(heroCache);
    }
    res.json(fallbackHero);
  }
};

let quickPicksCache = null;
let quickPicksExpiresAt = 0;

const getQuickPicks = async (req, res) => {
  try {
    if (quickPicksCache && Date.now() < quickPicksExpiresAt) {
      return res.json(quickPicksCache);
    }

    const token = await getToken(req);
    if (!token) return res.json([]);

    // Fetch Spotify "Rock Classics" (37i9dQZF1DWXRqgorJj26U) for Quick Picks
    const response = await fetch(`https://api.spotify.com/v1/playlists/37i9dQZF1DWXRqgorJj26U/tracks?limit=8`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!data.items) return res.json([]);
    
    const picks = data.items.map(mapSpotifyTrack).filter(t => t && t.image);
    
    quickPicksCache = picks;
    quickPicksExpiresAt = Date.now() + 1000 * 60 * 15; // Cache for 15 minutes
    
    res.json(picks);
  } catch (error) {
    console.error('Error fetching quick picks:', error);
    if (quickPicksCache) {
      return res.json(quickPicksCache);
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const curatedPlaylists = {
  'made-for-you': [
    { id: 'E07s5ZYygMg', uri: 'E07s5ZYygMg', title: 'Watermelon Sugar', artist: 'Harry Styles', image: 'https://i.ytimg.com/vi/E07s5ZYygMg/hqdefault.jpg', duration: 174, youtubeId: 'E07s5ZYygMg' },
    { id: 'ic8j13piAhQ', uri: 'ic8j13piAhQ', title: 'Cruel Summer', artist: 'Taylor Swift', image: 'https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg', duration: 178, youtubeId: 'ic8j13piAhQ' },
    { id: 'kTJczUoc26U', uri: 'kTJczUoc26U', title: 'Stay', artist: 'The Kid LAROI, Justin Bieber', image: 'https://i.ytimg.com/vi/kTJczUoc26U/hqdefault.jpg', duration: 141, youtubeId: 'kTJczUoc26U' },
    { id: 'gNi_6U5Pm_o', uri: 'gNi_6U5Pm_o', title: 'good 4 u', artist: 'Olivia Rodrigo', image: 'https://i.ytimg.com/vi/gNi_6U5Pm_o/hqdefault.jpg', duration: 178, youtubeId: 'gNi_6U5Pm_o' }
  ],
  'trending-now': [
    { id: '34Na4j8HLjc', uri: '34Na4j8HLjc', title: 'Starboy', artist: 'The Weeknd', image: 'https://i.ytimg.com/vi/34Na4j8HLjc/hqdefault.jpg', duration: 230, youtubeId: '34Na4j8HLjc' },
    { id: '4NRXx6U8ABQ', uri: '4NRXx6U8ABQ', title: 'Blinding Lights', artist: 'The Weeknd', image: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg', duration: 200, youtubeId: '4NRXx6U8ABQ' },
    { id: 'TUVcZfQe-Kw', uri: 'TUVcZfQe-Kw', title: 'Levitating', artist: 'Dua Lipa', image: 'https://i.ytimg.com/vi/TUVcZfQe-Kw/hqdefault.jpg', duration: 203, youtubeId: 'TUVcZfQe-Kw' },
    { id: 'H5v3kku4y6Q', uri: 'H5v3kku4y6Q', title: 'As It Was', artist: 'Harry Styles', image: 'https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg', duration: 167, youtubeId: 'H5v3kku4y6Q' }
  ],
  'new-releases': [
    { id: 'eVli-tstM5E', uri: 'eVli-tstM5E', title: 'Espresso', artist: 'Sabrina Carpenter', image: 'https://i.ytimg.com/vi/eVli-tstM5E/hqdefault.jpg', duration: 175, youtubeId: 'eVli-tstM5E' },
    { id: 'q3zqJs7JUCQ', uri: 'q3zqJs7JUCQ', title: 'Fortnight', artist: 'Taylor Swift', image: 'https://i.ytimg.com/vi/q3zqJs7JUCQ/hqdefault.jpg', duration: 228, youtubeId: 'q3zqJs7JUCQ' },
    { id: 'MB3VkzPIFgw', uri: 'MB3VkzPIFgw', title: 'LUNCH', artist: 'Billie Eilish', image: 'https://i.ytimg.com/vi/MB3VkzPIFgw/hqdefault.jpg', duration: 179, youtubeId: 'MB3VkzPIFgw' },
    { id: '238Z4PeALw0', uri: '238Z4PeALw0', title: 'Texas Hold \'Em', artist: 'Beyoncé', image: 'https://i.ytimg.com/vi/238Z4PeALw0/hqdefault.jpg', duration: 235, youtubeId: '238Z4PeALw0' }
  ],
  'because-ed-sheeran': [
    { id: 'JGwWNGJdvx8', uri: 'JGwWNGJdvx8', title: 'Shape of You', artist: 'Ed Sheeran', image: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg', duration: 233, youtubeId: 'JGwWNGJdvx8' },
    { id: '2Vv-BfVoq4g', uri: '2Vv-BfVoq4g', title: 'Perfect', artist: 'Ed Sheeran', image: 'https://i.ytimg.com/vi/2Vv-BfVoq4g/hqdefault.jpg', duration: 263, youtubeId: '2Vv-BfVoq4g' },
    { id: 'zABLecsR5UE', uri: 'zABLecsR5UE', title: 'Someone You Loved', artist: 'Lewis Capaldi', image: 'https://i.ytimg.com/vi/zABLecsR5UE/hqdefault.jpg', duration: 182, youtubeId: 'zABLecsR5UE' },
    { id: 'RBumHrGUOUCG', uri: 'RBumHrGUOUCG', title: 'Let Her Go', artist: 'Passenger', image: 'https://i.ytimg.com/vi/RBumHrGUOUCG/hqdefault.jpg', duration: 252, youtubeId: 'RBumHrGUOUCG' }
  ],
  'favourite-artists': [
    { id: 'Umqb9KENgpn', uri: 'Umqb9KENgpn', title: 'Tum Hi Ho', artist: 'Arijit Singh', image: 'https://i.ytimg.com/vi/Umqb9KENgpn/hqdefault.jpg', duration: 262, youtubeId: 'Umqb9KENgpn' },
    { id: 'VAdGW7QDJiU', uri: 'VAdGW7QDJiU', title: 'Chaleya', artist: 'Arijit Singh', image: 'https://i.ytimg.com/vi/VAdGW7QDJiU/hqdefault.jpg', duration: 198, youtubeId: 'VAdGW7QDJiU' },
    { id: 'BddP6PYo2gs', uri: 'BddP6PYo2gs', title: 'Kesariya', artist: 'Arijit Singh', image: 'https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg', duration: 268, youtubeId: 'BddP6PYo2gs' },
    { id: 'sK7riqg2mrA', uri: 'sK7riqg2mrA', title: 'Agar Tum Saath Ho', artist: 'Arijit Singh', image: 'https://i.ytimg.com/vi/sK7riqg2mrA/hqdefault.jpg', duration: 341, youtubeId: 'sK7riqg2mrA' }
  ]
};

const getCarouselRecommendations = (req, res) => {
  const type = req.params.type;
  const tracks = curatedPlaylists[type] || curatedPlaylists['trending-now'];
  res.json(tracks);
};

module.exports = {
  getHeroRecommendations,
  getQuickPicks,
  getCarouselRecommendations
};
