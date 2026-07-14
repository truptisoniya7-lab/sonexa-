const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // GET /communities - List all communities
  router.get('/', async (req, res) => {
    try {
      const communities = await db.all(`
        SELECT c.*, u.name as owner_name,
        (SELECT COUNT(*) FROM CommunityMembers cm WHERE cm.community_id = c.id) as member_count
        FROM Communities c
        JOIN Users u ON c.owner_id = u.id
        ORDER BY c.created_at DESC
      `);
      res.json(communities);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /communities - Create a new community
  router.post('/', async (req, res) => {
    try {
      const { name, description, owner_id } = req.body;
      if (!name || !owner_id) {
        return res.status(400).json({ error: 'name and owner_id are required' });
      }

      const result = await db.run(
        `INSERT INTO Communities (name, description, owner_id) VALUES (?, ?, ?)`,
        [name, description, owner_id]
      );

      // Add owner as a member
      await db.run(
        `INSERT INTO CommunityMembers (community_id, user_id, role) VALUES (?, ?, 'owner')`,
        [result.lastID, owner_id]
      );

      const newCommunity = await db.get(`SELECT * FROM Communities WHERE id = ?`, [result.lastID]);
      res.status(201).json(newCommunity);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /communities/:id/join - Join a community
  router.post('/:id/join', async (req, res) => {
    try {
      const { id } = req.params;
      const { user_id } = req.body;
      if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
      }

      // Check if already joined
      const existing = await db.get(
        `SELECT * FROM CommunityMembers WHERE community_id = ? AND user_id = ?`,
        [id, user_id]
      );

      if (existing) {
        return res.status(400).json({ error: 'User already in community' });
      }

      await db.run(
        `INSERT INTO CommunityMembers (community_id, user_id, role) VALUES (?, ?, 'member')`,
        [id, user_id]
      );

      res.json({ message: 'Joined community successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /communities/:id/songs - Get community playlist
  router.get('/:id/songs', async (req, res) => {
    try {
      const { id } = req.params;
      const songs = await db.all('SELECT * FROM CommunitySongs WHERE community_id = ? ORDER BY created_at ASC', [id]);
      res.json(songs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /communities/:id/songs - Add to community playlist
  router.post('/:id/songs', async (req, res) => {
    try {
      const { id } = req.params;
      const { song_uri, song_title, song_artist, song_image, added_by } = req.body;

      const result = await db.run(
        'INSERT INTO CommunitySongs (community_id, song_uri, song_title, song_artist, song_image, added_by) VALUES (?, ?, ?, ?, ?, ?)',
        [id, song_uri, song_title, song_artist, song_image, added_by]
      );
      
      const newSong = await db.get('SELECT * FROM CommunitySongs WHERE id = ?', [result.lastID]);
      res.status(201).json(newSong);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE /communities/:id/songs/:songId - Remove from community playlist
  router.delete('/:id/songs/:songId', async (req, res) => {
    try {
      const { id, songId } = req.params;
      await db.run('DELETE FROM CommunitySongs WHERE id = ? AND community_id = ?', [songId, id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
