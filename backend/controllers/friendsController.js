const { pool } = require('../config/db');

const getFriends = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT u.id, u.email, u.name, f.status 
      FROM Friendships f
      JOIN Users u ON (f.user_id1 = u.id OR f.user_id2 = u.id)
      WHERE (f.user_id1 = $1 OR f.user_id2 = $2) AND u.id != $3
    `;
    
    const result = await pool.query(query, [id, id, id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const inviteFriend = async (req, res) => {
  const { userId1, userId2 } = req.body;
  
  if (!userId1 || !userId2) {
    return res.status(400).json({ error: 'userId1 and userId2 are required' });
  }

  try {
    const checkQuery = \`
      SELECT * FROM Friendships 
      WHERE (user_id1 = $1 AND user_id2 = $2) 
         OR (user_id1 = $2 AND user_id2 = $1)
    \`;
    const existing = await pool.query(checkQuery, [userId1, userId2]);
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Friend request already sent or users are already friends' });
    }
    
    const insertQuery = \`
      INSERT INTO Friendships (user_id1, user_id2, status) 
      VALUES ($1, $2, 'pending') 
      RETURNING *
    \`;
    
    const result = await pool.query(insertQuery, [userId1, userId2]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getFriends,
  inviteFriend
};
