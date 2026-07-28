const express = require('express');
const router = express.Router();
const meController = require('../controllers/meController');

router.get('/recent', meController.getRecentHistory);

module.exports = router;
