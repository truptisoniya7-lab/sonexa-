const express = require('express');
const router = express.Router();
const recommendationsController = require('../controllers/recommendationsController');

// All endpoints in this file will be prefixed with /api/recommendations in index.js

router.get('/hero', recommendationsController.getHeroRecommendations);
router.get('/quick-picks', recommendationsController.getQuickPicks);
router.get('/carousel/:type', recommendationsController.getCarouselRecommendations);

module.exports = router;
