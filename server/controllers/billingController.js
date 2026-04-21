const Bill = require('../models/Bill');
const Student = require('../models/Student');
const Contract = require('../models/Contract');
const Room = require('../models/Room');
const Notification = require('../models/Notification');
const generateMonthlyInvoices = require('../utils/generateInvoices');

// ─── @route   GET /api/billing/invoices ──────────────────────
// ─── @access  Private (Admin)
const getAllInvoices = async (req, res) => {
    try {
        const { status, month } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (month) filter.month = month;

        const invoices = await Bill.find(filter)
            .populate('student_id', 'fullname student_code email')
            .populate('room_id', 'room_number building_id')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: invoices.length, data: invoices });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── @route   GET /api/billing/invoices/my ───────────────────
// ─── @access  Private (Student)
const getMyInvoices = async (req, res) => {
    try {
        const student = await Student.findById(req.user.student_id);
        if (!student) return res.status(404).json({ success: false, message: 'Student profile not found.' });

        const invoices = await Bill.find({ student_id: student._id })
            .populate('room_id', 'room_number building_id')
            .sort({ month: -1 });

        res.status(200).json({ success: true, data: invoices });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── @route   POST /api/billing/generate ─────────────────────
// ─── @access  Private (Admin)
const generateInvoices = async (req, res) => {
    try {
        const { month } = req.body; // e.g. "2026-03"
        if (!month) return res.status(400).json({ success: false, message: 'Month is required (format: YYYY-MM).' });

        const result = await generateMonthlyInvoices(month, req.user._id);
        res.status(201).json({ success: true, message: `Generated ${result.count} invoices for ${month}.`, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── @route   PATCH /api/billing/:id/submit-proof ────────────
// ─── @access  Private (Student)
const submitPaymentProof = async (req, res) => {
    try {
        const invoice = await Bill.findById(req.params.id);
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });

        // Ensure the invoice belongs to the student
        const student = await Student.findById(req.user.student_id);
        if (!invoice.student_id.equals(student._id)) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        if (invoice.status === 'paid') {
            return res.status(400).json({ success: false, message: 'This invoice is already paid.' });
        }

        const proofUrl = req.file ? `/uploads/${req.file.filename}` : req.body.payment_proof_url;
        if (!proofUrl) return res.status(400).json({ success: false, message: 'Payment proof is required.' });

        invoice.payment_proof_url = proofUrl;
        invoice.status = 'pending_verification';
        await invoice.save();

        res.status(200).json({ success: true, message: 'Payment proof submitted. Awaiting admin confirmation.', data: invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── @route   PATCH /api/billing/:id/confirm ─────────────────
// ─── @access  Private (Admin)
const confirmPayment = async (req, res) => {
    try {
        const invoice = await Bill.findById(req.params.id);
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });
        if (invoice.status !== 'pending_verification') {
            return res.status(400).json({ success: false, message: 'Invoice is not pending verification.' });
        }

        invoice.status = 'paid';
        invoice.paid_at = new Date();
        invoice.confirmed_by = req.user._id;
        await invoice.save();

        await Notification.create({
            title: 'Thanh toán đã được xác nhận',
            content: `Hóa đơn tháng ${invoice.month} của bạn đã được xác nhận thanh toán thành công.`,
            student_id: invoice.student_id,
            created_by: req.user._id,
        });

        res.status(200).json({ success: true, message: 'Payment confirmed.', data: invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── @route   PATCH /api/billing/:id/reject ──────────────────
// ─── @access  Private (Admin)
const rejectPayment = async (req, res) => {
    try {
        const { rejection_reason } = req.body;
        const invoice = await Bill.findById(req.params.id);
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });

        invoice.status = 'unpaid';
        invoice.rejection_reason = rejection_reason || 'Payment proof invalid.';
        invoice.payment_proof_url = null;
        await invoice.save();

        await Notification.create({
            title: 'Minh chứng thanh toán bị từ chối',
            content: `Minh chứng thanh toán hóa đơn tháng ${invoice.month} bị từ chối. Lý do: ${invoice.rejection_reason}. Vui lòng nộp lại.`,
            student_id: invoice.student_id,
            created_by: req.user._id,
        });

        res.status(200).json({ success: true, message: 'Payment rejected. Student notified.', data: invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAllInvoices, getMyInvoices, generateInvoices, submitPaymentProof, confirmPayment, rejectPayment };
