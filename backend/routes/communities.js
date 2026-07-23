const express = require('express');
const router = express.Router();
const communitiesController = require('../controllers/communitiesController');

router.get('/', communitiesController.getCommunities);
router.post('/', communitiesController.createCommunity);
router.post('/:id/join', communitiesController.joinCommunity);
router.get('/:id/songs', communitiesController.getCommunitySongs);
router.post('/:id/songs', communitiesController.addCommunitySong);
router.delete('/:id/songs/:songId', communitiesController.removeCommunitySong);

module.exports = router;
