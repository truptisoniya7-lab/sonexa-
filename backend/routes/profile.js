const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/:id', profileController.getProfile);
router.put('/:id', authenticateToken, profileController.updateProfile);

module.exports = router;
