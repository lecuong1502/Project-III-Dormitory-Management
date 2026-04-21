const express = require('express');
const router = express.Router();
const {
    getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom,
    updateBedStatus, getAllBuildings, createBuilding,
} = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');

// Buildings
router.get('/buildings', protect, roleMiddleware('admin'), getAllBuildings);
router.post('/buildings', protect, roleMiddleware('admin'), createBuilding);

// Rooms
router.get('/', protect, roleMiddleware('admin'), getAllRooms);
router.post('/', protect, roleMiddleware('admin'), createRoom);
router.get('/:id', protect, getRoomById);
router.patch('/:id', protect, roleMiddleware('admin'), updateRoom);
router.delete('/:id', protect, roleMiddleware('admin'), deleteRoom);

// Bed management
router.patch('/:id/beds/:bedId', protect, roleMiddleware('admin'), updateBedStatus);

module.exports = router;
