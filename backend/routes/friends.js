const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  router.post('/invite', async (req, res) => {
    try {
      const { user_id, friend_email } = req.body;
      
      const friendResult = await pool.query('SELECT id FROM Users WHERE email = $1', [friend_email]);
      const friend = friendResult.rows[0];
      if (!friend) return res.status(404).json({ error: 'User not found' });
      
      const friend_id = friend.id;
      if (user_id === friend_id) return res.status(400).json({ error: 'Cannot invite yourself' });

      await pool.query(
        'INSERT INTO Friendships (user_id1, user_id2, status) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [user_id, friend_id, 'pending']
      );
      
      res.json({ success: true, message: 'Invitation sent' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const friendsResult = await pool.query(`
        SELECT u.id, u.email, u.name, f.status 
        FROM Friendships f
        JOIN Users u ON (f.user_id1 = u.id OR f.user_id2 = u.id)
        WHERE (f.user_id1 = $1 OR f.user_id2 = $2) AND u.id != $3
      `, [id, id, id]);
      
      res.json(friendsResult.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};
