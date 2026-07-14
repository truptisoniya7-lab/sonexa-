const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // GET /messages/:roomId - Get all messages for a room
  router.get('/:roomId', async (req, res) => {
    try {
      const { roomId } = req.params;
      const messages = await db.all(`
        SELECT m.*, u.name as user_name 
        FROM Messages m
        JOIN Users u ON m.user_id = u.id
        WHERE m.room_id = ?
        ORDER BY m.created_at ASC
      `, [roomId]);
      res.json(messages);
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

      const result = await db.run(
        `INSERT INTO Messages (room_id, user_id, content, type) VALUES (?, ?, ?, ?)`,
        [room_id, user_id, content, type || 'text']
      );

      const newMessage = await db.get(`
        SELECT m.*, u.name as user_name 
        FROM Messages m
        JOIN Users u ON m.user_id = u.id
        WHERE m.id = ?
      `, [result.lastID]);

      res.status(201).json(newMessage);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
