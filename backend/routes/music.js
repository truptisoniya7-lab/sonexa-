const express = require('express');
const router = express.Router();
const musicController = require('../controllers/musicController');

router.get('/search', musicController.search);
router.get('/genres', musicController.genres);
router.get('/discover', musicController.discover);

module.exports = (pool) => {
  return router;
};
