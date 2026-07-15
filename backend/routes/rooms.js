const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Create a new room
  router.post('/', async (req, res) => {
    try {
      const { name, host_id, isPublic } = req.body;
      const is_public = isPublic ? true : false;
      
      const result = await pool.query(
        'INSERT INTO Rooms (name, host_id, is_public) VALUES ($1, $2, $3) RETURNING id',
        [name, host_id, is_public]
      );
      
      const roomResult = await pool.query('SELECT * FROM Rooms WHERE id = $1', [result.rows[0].id]);
      const room = roomResult.rows[0];
      
      // Add host to RoomMembers
      await pool.query('INSERT INTO RoomMembers (room_id, user_id) VALUES ($1, $2)', [room.id, host_id]);

      res.json(room);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get all active rooms (for dashboard)
  router.get('/', async (req, res) => {
    try {
      const roomsResult = await pool.query('SELECT r.id, r.name, r.is_public, r.host_id, u.name as host_name FROM Rooms r JOIN Users u ON r.host_id = u.id ORDER BY r.created_at DESC');
      res.json(roomsResult.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get specific room details
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const roomResult = await pool.query('SELECT * FROM Rooms WHERE id = $1', [id]);
      const room = roomResult.rows[0];
      if (!room) return res.status(404).json({ error: 'Room not found' });

      const membersResult = await pool.query('SELECT u.id, u.name FROM RoomMembers rm JOIN Users u ON rm.user_id = u.id WHERE rm.room_id = $1', [id]);
      
      res.json({ ...room, members: membersResult.rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Join room
  router.post('/:id/join', async (req, res) => {
    try {
      const { id } = req.params;
      const { user_id } = req.body;

      await pool.query('INSERT INTO RoomMembers (room_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, user_id]);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get room queue
  router.get('/:id/queue', async (req, res) => {
    try {
      const { id } = req.params;
      const queueResult = await pool.query('SELECT * FROM Queue WHERE room_id = $1 ORDER BY created_at ASC', [id]);
      res.json(queueResult.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Add to queue
  router.post('/:id/queue', async (req, res) => {
    try {
      const { id } = req.params;
      const { song_uri, song_title, song_artist, song_image, added_by } = req.body;

      const result = await pool.query(
        'INSERT INTO Queue (room_id, song_uri, song_title, song_artist, song_image, added_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [id, song_uri, song_title, song_artist, song_image, added_by]
      );
      
      const newSongResult = await pool.query('SELECT * FROM Queue WHERE id = $1', [result.rows[0].id]);
      res.json(newSongResult.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Remove from queue
  router.delete('/:id/queue/:songId', async (req, res) => {
    try {
      const { id, songId } = req.params;
      await pool.query('DELETE FROM Queue WHERE id = $1 AND room_id = $2', [songId, id]);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update room name
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      await pool.query('UPDATE Rooms SET name = $1 WHERE id = $2', [name, id]);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete room
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM Rooms WHERE id = $1', [id]);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};
