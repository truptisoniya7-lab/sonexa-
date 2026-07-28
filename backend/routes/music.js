const express = require('express');
const router = express.Router();
const musicController = require('../controllers/musicController');

router.get('/search', musicController.search);
router.get('/genres', musicController.genres);

module.exports = (pool) => {
  return router;
};
