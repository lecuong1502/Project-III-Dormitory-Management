const express = require('express');
const router = express.Router();
const { getAllRequests, getMyRequests, createRequest, updateRequestStatus } = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', protect, roleMiddleware('admin'), getAllRequests);
router.get('/my', protect, roleMiddleware('student'), getMyRequests);
router.post('/', protect, roleMiddleware('student'), upload.single('attachment'), createRequest);
router.patch('/:id/status', protect, roleMiddleware('admin'), updateRequestStatus);

module.exports = router;
