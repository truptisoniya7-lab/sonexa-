const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friendsController');

router.get('/:id', friendsController.getFriends);
router.post('/invite', friendsController.inviteFriend);

module.exports = (pool) => {
  return router;
};
