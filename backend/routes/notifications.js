const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // GET /notifications/:userId - Get all notifications for a user
  router.get('/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const notifications = await db.all(`
        SELECT * FROM Notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
      `, [userId]);
      res.json(notifications);
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

      const result = await db.run(
        `INSERT INTO Notifications (user_id, type, message) VALUES (?, ?, ?)`,
        [user_id, type, message]
      );

      const newNotif = await db.get(`SELECT * FROM Notifications WHERE id = ?`, [result.lastID]);
      res.status(201).json(newNotif);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT /notifications/:id/read - Mark notification as read
  router.put('/:id/read', async (req, res) => {
    try {
      const { id } = req.params;
      await db.run(`UPDATE Notifications SET is_read = 1 WHERE id = ?`, [id]);
      res.json({ message: 'Notification marked as read' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
