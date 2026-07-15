const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // GET /communities - List all communities
  router.get('/', async (req, res) => {
    try {
      const communitiesResult = await pool.query(`
        SELECT c.*, u.name as owner_name,
        (SELECT COUNT(*) FROM CommunityMembers cm WHERE cm.community_id = c.id) as member_count
        FROM Communities c
        JOIN Users u ON c.owner_id = u.id
        ORDER BY c.created_at DESC
      `);
      res.json(communitiesResult.rows);
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

      const result = await pool.query(
        `INSERT INTO Communities (name, description, owner_id) VALUES ($1, $2, $3) RETURNING id`,
        [name, description, owner_id]
      );

      // Add owner as a member
      await pool.query(
        `INSERT INTO CommunityMembers (community_id, user_id, role) VALUES ($1, $2, 'owner')`,
        [result.rows[0].id, owner_id]
      );

      const newCommunityResult = await pool.query(`SELECT * FROM Communities WHERE id = $1`, [result.rows[0].id]);
      res.status(201).json(newCommunityResult.rows[0]);
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
      const existingResult = await pool.query(
        `SELECT * FROM CommunityMembers WHERE community_id = $1 AND user_id = $2`,
        [id, user_id]
      );
      const existing = existingResult.rows[0];

      if (existing) {
        return res.status(400).json({ error: 'User already in community' });
      }

      await pool.query(
        `INSERT INTO CommunityMembers (community_id, user_id, role) VALUES ($1, $2, 'member')`,
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
      const songsResult = await pool.query('SELECT * FROM CommunitySongs WHERE community_id = $1 ORDER BY created_at ASC', [id]);
      res.json(songsResult.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /communities/:id/songs - Add to community playlist
  router.post('/:id/songs', async (req, res) => {
    try {
      const { id } = req.params;
      const { song_uri, song_title, song_artist, song_image, added_by } = req.body;

      const result = await pool.query(
        'INSERT INTO CommunitySongs (community_id, song_uri, song_title, song_artist, song_image, added_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [id, song_uri, song_title, song_artist, song_image, added_by]
      );
      
      const newSongResult = await pool.query('SELECT * FROM CommunitySongs WHERE id = $1', [result.rows[0].id]);
      res.status(201).json(newSongResult.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE /communities/:id/songs/:songId - Remove from community playlist
  router.delete('/:id/songs/:songId', async (req, res) => {
    try {
      const { id, songId } = req.params;
      await pool.query('DELETE FROM CommunitySongs WHERE id = $1 AND community_id = $2', [songId, id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
