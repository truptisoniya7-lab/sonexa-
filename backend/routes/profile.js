const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const userResult = await pool.query('SELECT id, email, name, profile_picture, created_at FROM Users WHERE id = $1', [id]);
      const user = userResult.rows[0];
      if (!user) return res.status(404).json({ error: 'User not found' });
      
      const streamingResult = await pool.query('SELECT provider, created_at FROM StreamingAccounts WHERE user_id = $1', [id]);
      
      res.json({
        ...user,
        streaming_accounts: streamingResult.rows
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/:id/spotify', async (req, res) => {
    try {
      const { id } = req.params;
      const { access_token, refresh_token } = req.body;
      
      await pool.query(
        'INSERT INTO StreamingAccounts (user_id, provider, access_token, refresh_token) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, provider) DO UPDATE SET access_token = $5, refresh_token = $6',
        [id, 'spotify', access_token, refresh_token, access_token, refresh_token]
      );
      
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      
      await pool.query(
        'UPDATE Users SET name = $1 WHERE id = $2',
        [name, id]
      );
      
      res.json({ success: true, message: 'Profile updated' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};
