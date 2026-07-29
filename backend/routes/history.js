const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

router.post('/', historyController.addHistory);
router.get('/recent/:userId', historyController.getRecentHistory);

module.exports = (pool) => {
  return router;
};
