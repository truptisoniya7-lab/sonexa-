const { pool } = require('../config/db');
const ytSearch = require('yt-search');
const fetch = require('node-fetch'); // Make sure to use node-fetch or native fetch in Node 18+

const sanitizeTitle = (title) => {
  return title
    .replace(/\s*[\[\(\{](official.*|lyric.*|audio|video|hd|4k|music video|visualizer)[\]\)\}]\s*/gi, '')
    .replace(/\s*\|\s*.*$/g, '')
    .replace(/\s*\-?\s*official.*$/gi, '')
    .trim();
};

const login = async (req, res) => {
  const userId = req.query.userId || '1';
  
  const scope = 'user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing streaming';
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID || '',
    scope: scope,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI || '',
    state: userId
  });
  
  const authorizeUrl = \`https://accounts.spotify.com/authorize?\${params.toString()}\`;
  
  res.json({ url: authorizeUrl });
};

const callback = async (req, res) => {
  try {
    const { code, state } = req.body;
    const userId = state;
    
    const clientId = process.env.SPOTIFY_CLIENT_ID || '';
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI || '';
    
    const basicAuth = Buffer.from(\`\${clientId}:\${clientSecret}\`).toString('base64');
    
    const bodyParams = new URLSearchParams({
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });
    
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': \`Basic \${basicAuth}\`
      },
      body: bodyParams.toString()
    });
    
    if (!tokenResponse.ok) {
      return res.status(tokenResponse.status).json({ error: 'Failed to fetch token' });
    }
    
    const tokenData = await tokenResponse.json();
    
    await pool.query(
      \`INSERT INTO StreamingAccounts (user_id, platform, access_token, refresh_token) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (user_id, platform) 
       DO UPDATE SET access_token = EXCLUDED.access_token, refresh_token = EXCLUDED.refresh_token\`,
      [userId, 'spotify', tokenData.access_token, tokenData.refresh_token]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error in spotify callback:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const search = async (req, res) => {
  const q = req.query.q;
  
  if (!q) {
    return res.json([]);
  }
  
  try {
    const result = await ytSearch(q);
    const topResults = result.videos.slice(0, 5).map((item) => ({
      id: item.videoId,
      uri: item.videoId,
      title: sanitizeTitle(item.title),
      artist: item.author.name,
      image: item.thumbnail,
      duration: item.timestamp,
      popularity: item.views
    }));
    
    res.json(topResults);
  } catch (error) {
    console.error('Error in spotify search:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const trending = async (req, res) => {
  try {
    const result = await ytSearch('top hits global playlist');
    const topResults = result.videos.slice(0, 5).map((item) => ({
      id: item.videoId,
      uri: item.videoId,
      title: sanitizeTitle(item.title),
      artist: item.author.name,
      image: item.thumbnail,
      duration: item.timestamp,
      popularity: item.views
    }));
    
    res.json(topResults);
  } catch (error) {
    console.error('Error in spotify trending:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  login,
  callback,
  search,
  trending
};
