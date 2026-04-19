const express = require('express');
const router = express.Router();
const {
    getAllInvoices, getMyInvoices, generateInvoices,
    submitPaymentProof, confirmPayment, rejectPayment,
} = require('../controllers/billingController');
const { protect } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/invoices', protect, roleMiddleware('admin'), getAllInvoices);
router.get('/invoices/my', protect, roleMiddleware('student'), getMyInvoices);
router.post('/generate', protect, roleMiddleware('admin'), generateInvoices);
router.patch('/:id/submit-proof', protect, roleMiddleware('student'), upload.single('payment_proof'), submitPaymentProof);
router.patch('/:id/confirm', protect, roleMiddleware('admin'), confirmPayment);
router.patch('/:id/reject', protect, roleMiddleware('admin'), rejectPayment);

module.exports = router;
