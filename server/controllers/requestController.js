const Request = require('../models/Request');
const Student = require('../models/Student');
const Notification = require('../models/Notification');

// @route   GET /api/requests
// @access  Private (Admin)
const getAllRequests = async (req, res) => {
    try {
        const { status, category } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (category) filter.category = category;

        const requests = await Request.find(filter)
            .populate('student_id', 'fullname student_code email phone')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   GET /api/requests/my
// @access  Private (Student)
const getMyRequests = async (req, res) => {
    try {
        const student = await Student.findById(req.user.student_id);
        if (!student) return res.status(404).json({ success: false, message: 'Student profile not found.' });

        const requests = await Request.find({ student_id: student._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   POST /api/requests
// @access  Private (Student)
const createRequest = async (req, res) => {
    try {
        const student = await Student.findById(req.user.student_id);
        if (!student) return res.status(404).json({ success: false, message: 'Student profile not found.' });
        if (!student.current_contract) {
            return res.status(400).json({ success: false, message: 'You must be residing in the dormitory to submit a request.' });
        }

        const { category, content } = req.body;
        const attachment_url = req.file ? `/uploads/${req.file.filename}` : null;

        const newRequest = await Request.create({
            student_id: student._id,
            category,
            content,
            attachment_url,
            status: 'new',
        });

        res.status(201).json({ success: true, message: 'Request submitted successfully.', data: newRequest });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   PATCH /api/requests/:id/status
// @access  Private (Admin)
const updateRequestStatus = async (req, res) => {
    try {
        const { status, admin_response } = req.body;
        const validTransitions = { new: ['processing'], processing: ['completed', 'rejected'] };

        const request = await Request.findById(req.params.id);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });

        const allowed = validTransitions[request.status];
        if (!allowed || !allowed.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status transition from '${request.status}' to '${status}'.`,
            });
        }

        request.status = status;
        request.admin_response = admin_response || request.admin_response;
        request.processed_by = req.user._id;
        if (status === 'completed' || status === 'rejected') {
            request.resolved_at = new Date();
        }
        await request.save();

        // Notify student when request is resolved
        if (status === 'completed' || status === 'rejected') {
            const statusLabel = status === 'completed' ? 'hoàn thành' : 'bị từ chối';
            await Notification.create({
                title: `Yêu cầu hỗ trợ đã được ${statusLabel}`,
                content: `Yêu cầu "${request.category}" của bạn đã được ${statusLabel}. ${admin_response ? 'Phản hồi: ' + admin_response : ''}`,
                student_id: request.student_id,
                created_by: req.user._id,
            });
        }

        res.status(200).json({ success: true, message: `Request status updated to '${status}'.`, data: request });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAllRequests, getMyRequests, createRequest, updateRequestStatus };