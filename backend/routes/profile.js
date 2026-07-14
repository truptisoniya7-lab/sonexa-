const express = require('express');
const router = express.Router();

module.exports = (db) => {
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const user = await db.get('SELECT id, email, name, created_at FROM Users WHERE id = ?', [id]);
      if (!user) return res.status(404).json({ error: 'User not found' });
      
      const streaming = await db.all('SELECT provider, created_at FROM StreamingAccounts WHERE user_id = ?', [id]);
      
      res.json({
        ...user,
        streaming_accounts: streaming
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
      
      await db.run(
        'INSERT INTO StreamingAccounts (user_id, provider, access_token, refresh_token) VALUES (?, ?, ?, ?) ON CONFLICT (user_id, provider) DO UPDATE SET access_token = ?, refresh_token = ?',
        [id, 'spotify', access_token, refresh_token, access_token, refresh_token]
      );
      
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};
