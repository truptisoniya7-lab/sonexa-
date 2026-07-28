const express = require('express');
const router = express.Router();
const roomsController = require('../controllers/roomsController');

router.get('/', roomsController.getRooms);
router.post('/', roomsController.createRoom);
router.get('/:id', roomsController.getRoom);
router.put('/:id', roomsController.updateRoom);
router.delete('/:id', roomsController.deleteRoom);

router.post('/:id/join', roomsController.joinRoom);

router.get('/:id/queue', roomsController.getQueue);
router.post('/:id/queue', roomsController.addToQueue);
router.delete('/:id/queue/:songId', roomsController.removeFromQueue);

module.exports = router;
