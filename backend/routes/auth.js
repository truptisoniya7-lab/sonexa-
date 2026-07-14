const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// The google login endpoint
router.post('/google', authController.googleLogin);

// Keep the local login endpoint working for non-Google users
router.post('/login', authController.localLogin);

module.exports = router;
