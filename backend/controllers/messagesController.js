const { pool } = require('../config/db');

exports.createMessage = async (req, res) => {
  try {
    const { room_id, user_id, content, type } = req.body;

    if (!room_id || !user_id || !content) {
      return res.status(400).json({ error: 'room_id, user_id, and content are required' });
    }

    const insertQuery = `
      INSERT INTO Messages (room_id, user_id, content, type)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;
    const insertResult = await pool.query(insertQuery, [room_id, user_id, content, type || 'text']);
    const newMessageId = insertResult.rows[0].id;

    const selectQuery = `
      SELECT m.*, u.name as user_name 
      FROM Messages m 
      JOIN Users u ON m.user_id = u.id 
      WHERE m.id = $1;
    `;
    const selectResult = await pool.query(selectQuery, [newMessageId]);

    res.status(201).json(selectResult.rows[0]);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;

    const query = `
      SELECT m.*, u.name as user_name 
      FROM Messages m 
      JOIN Users u ON m.user_id = u.id 
      WHERE m.room_id = $1 
      ORDER BY m.created_at ASC;
    `;
    const result = await pool.query(query, [roomId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
