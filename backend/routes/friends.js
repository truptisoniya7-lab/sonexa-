const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friendsController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken); // Enforce auth

router.get('/list', friendsController.getFriends);
router.get('/requests', friendsController.getRequests);
router.get('/suggestions', friendsController.getSuggestions);
router.post('/request', friendsController.inviteFriend);
router.post('/accept', friendsController.acceptFriend);
router.post('/decline', friendsController.declineFriend);
router.post('/cancel', friendsController.cancelFriend);
router.delete('/:id', friendsController.removeFriend);

module.exports = router;
