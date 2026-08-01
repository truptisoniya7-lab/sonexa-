const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken); // Enforce auth on all users routes

router.get('/search', usersController.searchUsers);

module.exports = router;
