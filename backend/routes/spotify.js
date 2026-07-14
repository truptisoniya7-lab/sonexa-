const express = require('express');
const router = express.Router();
const axios = require('axios');
const querystring = require('querystring');
const ytSearch = require('yt-search');

module.exports = (db) => {
  router.get('/login', (req, res) => {
    const scope = 'user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing streaming';
    const userId = req.query.userId || 1; 

    res.json({
      url: 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
          response_type: 'code',
          client_id: process.env.SPOTIFY_CLIENT_ID,
          scope: scope,
          redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
          state: userId
        })
    });
  });

  router.post('/callback', async (req, res) => {
    const code = req.body.code;
    const userId = req.body.state; 

    try {
      const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', 
        querystring.stringify({
          code: code,
          redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
          grant_type: 'authorization_code'
        }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + (Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))
        }
      });

      const { access_token, refresh_token } = tokenResponse.data;

      await db.run(
        'INSERT INTO StreamingAccounts (user_id, provider, access_token, refresh_token) VALUES (?, ?, ?, ?) ON CONFLICT (user_id, provider) DO UPDATE SET access_token = ?, refresh_token = ?',
        [userId, 'spotify', access_token, refresh_token, access_token, refresh_token]
      );

      res.json({ success: true });
    } catch (error) {
      console.error('Error in Spotify callback:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'Failed to authenticate with Spotify' });
    }
  });

  router.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.json([]);

    const sanitizeTitle = (title) => {
      return title
        .replace(/\s*[\[\(\{](official.*|lyric.*|audio|video|hd|4k|music video|visualizer)[\]\)\}]\s*/gi, '')
        .replace(/\s*\|\s*.*$/g, '') // remove anything after a pipe
        .replace(/\s*\-?\s*official.*$/gi, '') 
        .trim();
    };

    try {
      // Use YouTube Search to get full-length tracks for free!
      const searchResponse = await ytSearch(query);
      const videos = searchResponse.videos.slice(0, 5); // top 5

      const tracks = videos.map((item) => ({
        id: item.videoId,
        uri: item.videoId, // The URI is the YouTube Video ID
        title: sanitizeTitle(item.title),
        artist: item.author.name,
        image: item.thumbnail
      }));

      res.json(tracks);
    } catch (error) {
      console.error('Error searching YouTube:', error.message);
      res.status(500).json({ error: 'Failed to search for songs' });
    }
  });

  return router;
};
