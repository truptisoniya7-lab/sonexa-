const { supabase } = require('../config/db');
const fetch = require('node-fetch');

const MOCK_TRACKS = [
  { id: '1', uri: 'spotify:track:1', title: 'Mock Song 1', artist: 'Mock Artist A', image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80', duration: 180, progress: 40, lastListened: '2 hours ago' },
  { id: '2', uri: 'spotify:track:2', title: 'Mock Song 2', artist: 'Mock Artist B', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80', duration: 200, progress: 10, lastListened: 'Yesterday' },
  { id: '3', uri: 'spotify:track:3', title: 'Mock Song 3', artist: 'Mock Artist C', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&q=80', duration: 240, progress: 90, lastListened: '2 days ago' },
  { id: '4', uri: 'spotify:track:4', title: 'Mock Song 4', artist: 'Mock Artist D', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80', duration: 190, progress: 0, lastListened: '3 days ago' },
  { id: '5', uri: 'spotify:track:5', title: 'Mock Song 5', artist: 'Mock Artist E', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80', duration: 210, progress: 0, lastListened: '1 week ago' },
];


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
  
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.warn('Spotify API returned non-JSON:', await response.text().catch(()=>''));
      return res.json(MOCK_TRACKS);
    }
  
  return data.access_token;
};

const getToken = async (req) => {
  if (req.cookies && req.cookies.spotify_access_token) return req.cookies.spotify_access_token;
  return await getAppToken();
};

const getRecentHistory = async (req, res) => {
  try {
    const token = await getToken(req);
    if (!token) return res.json(MOCK_TRACKS);

    // Fetch Spotify "Chill Tracks" (37i9dQZF1DX4WYpdVIPx1t) for Recent History mock
    const response = await fetch(`https://api.spotify.com/v1/playlists/37i9dQZF1DX4WYpdVIPx1t/tracks?limit=5`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.warn('Spotify API returned non-JSON:', await response.text().catch(()=>''));
      return res.json(MOCK_TRACKS);
    }
  
    if (!data.items) return res.json(MOCK_TRACKS);
    
    const validResults = data.items.map(item => item.track).filter(t => t && t.album?.images?.[0]?.url);
    if (validResults.length === 0) return res.json(MOCK_TRACKS);
    
    const recentTracks = validResults.map((track, i) => ({
      id: track.id,
      title: track.name,
      image: track.album.images[0].url,
      artist: track.artists?.map(a => a.name).join(', ') || 'Unknown',
      progress: Math.floor(Math.random() * 100),
      lastListened: `${i + 1} hours ago`,
      uri: track.uri
    }));

    res.json(recentTracks);
  } catch (error) {
    console.error('Error fetching recent history:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getRecentHistory
};
