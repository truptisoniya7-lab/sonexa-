const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // GET /messages/:roomId - Get all messages for a room
  router.get('/:roomId', async (req, res) => {
    try {
      const { roomId } = req.params;
      const messagesResult = await pool.query(`
        SELECT m.*, u.name as user_name 
        FROM Messages m
        JOIN Users u ON m.user_id = u.id
        WHERE m.room_id = $1
        ORDER BY m.created_at ASC
      `, [roomId]);
      res.json(messagesResult.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /messages - Send a new message
  router.post('/', async (req, res) => {
    try {
      const { room_id, user_id, content, type } = req.body;
      if (!room_id || !user_id || !content) {
        return res.status(400).json({ error: 'room_id, user_id, and content are required' });
      }

      const result = await pool.query(
        `INSERT INTO Messages (room_id, user_id, content, type) VALUES ($1, $2, $3, $4) RETURNING id`,
        [room_id, user_id, content, type || 'text']
      );

      const newMessageResult = await pool.query(`
        SELECT m.*, u.name as user_name 
        FROM Messages m
        JOIN Users u ON m.user_id = u.id
        WHERE m.id = $1
      `, [result.rows[0].id]);

      res.status(201).json(newMessageResult.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
