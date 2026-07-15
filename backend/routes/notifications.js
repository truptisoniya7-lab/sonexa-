const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // GET /notifications/:userId - Get all notifications for a user
  router.get('/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const notificationsResult = await pool.query(`
        SELECT * FROM Notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
      `, [userId]);
      res.json(notificationsResult.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /notifications - Create a new notification
  router.post('/', async (req, res) => {
    try {
      const { user_id, type, message } = req.body;
      if (!user_id || !type || !message) {
        return res.status(400).json({ error: 'user_id, type, and message are required' });
      }

      const result = await pool.query(
        `INSERT INTO Notifications (user_id, type, message) VALUES ($1, $2, $3) RETURNING id`,
        [user_id, type, message]
      );

      const newNotifResult = await pool.query(`SELECT * FROM Notifications WHERE id = $1`, [result.rows[0].id]);
      res.status(201).json(newNotifResult.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT /notifications/:id/read - Mark notification as read
  router.put('/:id/read', async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query(`UPDATE Notifications SET is_read = true WHERE id = $1`, [id]);
      res.json({ message: 'Notification marked as read' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
