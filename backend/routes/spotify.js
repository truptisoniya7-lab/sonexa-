const express = require('express');
const router = express.Router();
const spotifyController = require('../controllers/spotifyController');

router.get('/login', spotifyController.login);
router.post('/callback', spotifyController.callback);
router.get('/search', spotifyController.search);
router.get('/trending', spotifyController.trending);

module.exports = (pool) => {
  return router;
};
