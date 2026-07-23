const { pool } = require('../config/db');

exports.getCommunities = async (req, res) => {
  try {
    const query = `
      SELECT c.*, u.name as owner_name,
      (SELECT COUNT(*) FROM CommunityMembers cm WHERE cm.community_id = c.id) as member_count
      FROM Communities c
      JOIN Users u ON c.owner_id = u.id
      ORDER BY c.created_at DESC;
    `;
    const result = await pool.query(query);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.createCommunity = async (req, res) => {
  try {
    const { name, description, owner_id } = req.body;

    if (!name || !owner_id) {
      return res.status(400).json({ error: 'name and owner_id are required' });
    }

    // Begin transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const insertCommunityQuery = `
        INSERT INTO Communities (name, description, owner_id)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      const communityResult = await client.query(insertCommunityQuery, [name, description, owner_id]);
      const newCommunity = communityResult.rows[0];

      const insertMemberQuery = `
        INSERT INTO CommunityMembers (community_id, user_id, role)
        VALUES ($1, $2, $3);
      `;
      await client.query(insertMemberQuery, [newCommunity.id, owner_id, 'owner']);
      
      await client.query('COMMIT');
      
      res.status(201).json(newCommunity);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating community:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.joinCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const checkQuery = `SELECT * FROM CommunityMembers WHERE community_id = $1 AND user_id = $2;`;
    const checkResult = await pool.query(checkQuery, [id, user_id]);
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    const insertQuery = `
      INSERT INTO CommunityMembers (community_id, user_id, role)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const insertResult = await pool.query(insertQuery, [id, user_id, 'member']);

    res.status(201).json(insertResult.rows[0]);
  } catch (error) {
    console.error('Error joining community:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getCommunitySongs = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT * FROM CommunitySongs 
      WHERE community_id = $1 
      ORDER BY created_at ASC;
    `;
    const result = await pool.query(query, [id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching community songs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.addCommunitySong = async (req, res) => {
  try {
    const { id } = req.params;
    const { song_uri, song_title, song_artist, song_image, added_by } = req.body;

    const insertQuery = `
      INSERT INTO CommunitySongs (community_id, song_uri, song_title, song_artist, song_image, added_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const insertResult = await pool.query(insertQuery, [id, song_uri, song_title, song_artist, song_image, added_by]);

    res.status(201).json(insertResult.rows[0]);
  } catch (error) {
    console.error('Error adding song to community:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.removeCommunitySong = async (req, res) => {
  try {
    const { id, songId } = req.params;

    const deleteQuery = `
      DELETE FROM CommunitySongs 
      WHERE id = $1 AND community_id = $2
      RETURNING *;
    `;
    const deleteResult = await pool.query(deleteQuery, [songId, id]);

    if (deleteResult.rowCount === 0) {
        return res.status(404).json({ error: 'Song not found in community' });
    }

    res.json({ message: 'Song removed successfully' });
  } catch (error) {
    console.error('Error removing song from community:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
