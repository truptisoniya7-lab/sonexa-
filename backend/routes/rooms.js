const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Create a new room
  router.post('/', async (req, res) => {
    try {
      const { name, host_id, isPublic } = req.body;
      const is_public = isPublic ? 1 : 0;
      
      const result = await db.run(
        'INSERT INTO Rooms (name, host_id, is_public) VALUES (?, ?, ?)',
        [name, host_id, is_public]
      );
      
      const room = await db.get('SELECT * FROM Rooms WHERE id = ?', [result.lastID]);
      
      // Add host to RoomMembers
      await db.run('INSERT INTO RoomMembers (room_id, user_id) VALUES (?, ?)', [room.id, host_id]);

      res.json(room);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get all active rooms (for dashboard)
  router.get('/', async (req, res) => {
    try {
      const rooms = await db.all('SELECT r.id, r.name, r.is_public, r.host_id, u.name as host_name FROM Rooms r JOIN Users u ON r.host_id = u.id ORDER BY r.created_at DESC');
      res.json(rooms);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get specific room details
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const room = await db.get('SELECT * FROM Rooms WHERE id = ?', [id]);
      if (!room) return res.status(404).json({ error: 'Room not found' });

      const members = await db.all('SELECT u.id, u.name FROM RoomMembers rm JOIN Users u ON rm.user_id = u.id WHERE rm.room_id = ?', [id]);
      
      res.json({ ...room, members });
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

      await db.run('INSERT INTO RoomMembers (room_id, user_id) VALUES (?, ?) ON CONFLICT DO NOTHING', [id, user_id]);
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
      const queue = await db.all('SELECT * FROM Queue WHERE room_id = ? ORDER BY created_at ASC', [id]);
      res.json(queue);
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

      const result = await db.run(
        'INSERT INTO Queue (room_id, song_uri, song_title, song_artist, song_image, added_by) VALUES (?, ?, ?, ?, ?, ?)',
        [id, song_uri, song_title, song_artist, song_image, added_by]
      );
      
      const newSong = await db.get('SELECT * FROM Queue WHERE id = ?', [result.lastID]);
      res.json(newSong);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Remove from queue
  router.delete('/:id/queue/:songId', async (req, res) => {
    try {
      const { id, songId } = req.params;
      await db.run('DELETE FROM Queue WHERE id = ? AND room_id = ?', [songId, id]);
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
      await db.run('UPDATE Rooms SET name = ? WHERE id = ?', [name, id]);
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
      await db.run('DELETE FROM Rooms WHERE id = ?', [id]);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};
