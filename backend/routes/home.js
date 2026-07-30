const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

router.get('/', homeController.getCoreHome);
router.get('/trending', homeController.getTrending);
router.get('/live', homeController.getLive);
router.get('/friends', homeController.getFriends);
router.get('/layout', homeController.getLayout);

module.exports = router;
