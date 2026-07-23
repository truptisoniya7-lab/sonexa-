const { pool } = require('../config/db');

exports.createNotification = async (req, res) => {
  try {
    const { user_id, type, message } = req.body;

    if (!user_id || !type || !message) {
      return res.status(400).json({ error: 'user_id, type, and message are required' });
    }

    const insertQuery = `
      INSERT INTO Notifications (user_id, type, message)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const insertResult = await pool.query(insertQuery, [user_id, type, message]);

    res.status(201).json(insertResult.rows[0]);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const updateQuery = `
      UPDATE Notifications 
      SET is_read = true 
      WHERE id = $1
      RETURNING *;
    `;
    const updateResult = await pool.query(updateQuery, [id]);

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
