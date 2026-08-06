const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

// Provide backward compatibility for existing /history POST
router.post('/', historyController.addHistory);

// New unified endpoints
router.post('/sync', historyController.syncProgress);
router.post('/merge', historyController.mergeHistory);

router.get('/recent/:userId', historyController.getRecentHistory);
router.get('/stats/:userId', historyController.getStats);

module.exports = () => router;
