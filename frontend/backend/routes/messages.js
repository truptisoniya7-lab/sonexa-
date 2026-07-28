const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');

router.post('/', messagesController.createMessage);
router.get('/:roomId', messagesController.getMessages);

module.exports = router;
