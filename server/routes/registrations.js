const express = require('express');
const router = express.Router();
const {
    getAllRegistrations, getMyRegistration, submitRegistration,
    approveRegistration, rejectRegistration,
} = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');

router.get('/', protect, roleMiddleware('admin'), getAllRegistrations);
router.get('/my', protect, roleMiddleware('student'), getMyRegistration);
router.post('/', protect, roleMiddleware('student'), submitRegistration);
router.patch('/:id/approve', protect, roleMiddleware('admin'), approveRegistration);
router.patch('/:id/reject', protect, roleMiddleware('admin'), rejectRegistration);

module.exports = router;