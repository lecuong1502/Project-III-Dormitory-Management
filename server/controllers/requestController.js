const Request = require('../models/Request');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const Room = require('../models/Room');
const Contract = require('../models/Contract');

// ─── @route   GET /api/requests ───────────────────────────────
// ─── @access  Private (Admin)
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

// ─── @route   GET /api/requests/my ───────────────────────────
// ─── @access  Private (Student)
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

// ─── @route   POST /api/requests ─────────────────────────────
// ─── @access  Private (Student)
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

// ─── @route   PATCH /api/requests/:id/status ─────────────────
// ─── @access  Private (Admin)
const updateRequestStatus = async (req, res) => {
    try {
        const { status, admin_response, new_room_id, new_bed_id } = req.body;
        const validTransitions = { new: ['processing'], processing: ['completed', 'rejected'] };

        const request = await Request.findById(req.params.id).populate('student_id');
        if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });

        const allowed = validTransitions[request.status];
        if (!allowed || !allowed.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status transition from '${request.status}' to '${status}'.`,
            });
        }

        // ── Xử lý chuyển phòng khi hoàn tất ──────────────────────────
        if (status === 'completed' && request.category === 'room_transfer') {
            if (!new_room_id || !new_bed_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp new_room_id và new_bed_id để chuyển phòng.',
                });
            }

            const student = request.student_id;

            // Lấy contract hiện tại
            const oldContract = await Contract.findById(student.current_contract);
            if (!oldContract) {
                return res.status(400).json({ success: false, message: 'Sinh viên không có hợp đồng hiện tại.' });
            }

            // Lấy phòng cũ → giải phóng giường cũ
            const oldRoom = await Room.findById(oldContract.room_id);
            if (oldRoom) {
                const oldBed = oldRoom.beds.id(oldContract.bed_id);
                if (oldBed) {
                    oldBed.status = 'available';
                    oldBed.student_id = null;
                }
                oldRoom.updateRoomStatus();
                await oldRoom.save();
            }

            // Lấy phòng mới → gán giường mới
            const newRoom = await Room.findById(new_room_id);
            if (!newRoom) {
                return res.status(404).json({ success: false, message: 'Phòng mới không tìm thấy.' });
            }
            const newBed = newRoom.beds.id(new_bed_id);
            if (!newBed || newBed.status !== 'available') {
                return res.status(400).json({ success: false, message: 'Giường mới không còn trống.' });
            }
            newBed.status = 'occupied';
            newBed.student_id = student._id;
            newRoom.updateRoomStatus();
            await newRoom.save();

            // Cập nhật contract cũ → tạo contract mới
            oldContract.status = 'terminated';
            oldContract.end_date = new Date();
            await oldContract.save();

            const newContract = await Contract.create({
                student_id: student._id,
                room_id: newRoom._id,
                bed_id: newBed._id,
                start_date: new Date(),
                status: 'active',
            });

            // Cập nhật student
            await Student.findByIdAndUpdate(student._id, { current_contract: newContract._id });
        }

        // ── Xử lý trả phòng khi hoàn tất ─────────────────────────────
        if (status === 'completed' && request.category === 'checkout') {
            const student = request.student_id;
            const oldContract = await Contract.findById(student.current_contract);

            if (oldContract) {
                // Giải phóng giường
                const oldRoom = await Room.findById(oldContract.room_id);
                if (oldRoom) {
                    const oldBed = oldRoom.beds.id(oldContract.bed_id);
                    if (oldBed) {
                        oldBed.status = 'available';
                        oldBed.student_id = null;
                    }
                    oldRoom.updateRoomStatus();
                    await oldRoom.save();
                }

                oldContract.status = 'terminated';
                oldContract.end_date = new Date();
                await oldContract.save();
            }

            // Xóa contract khỏi student
            await Student.findByIdAndUpdate(student._id, { current_contract: null });
        }

        // ── Cập nhật request ──────────────────────────────────────────
        request.status = status;
        request.admin_response = admin_response || request.admin_response;
        request.processed_by = req.user._id;
        if (status === 'completed' || status === 'rejected') {
            request.resolved_at = new Date();
        }
        await request.save();

        // Thông báo cho sinh viên
        if (status === 'completed' || status === 'rejected') {
            const statusLabel = status === 'completed' ? 'hoàn thành' : 'bị từ chối';
            await Notification.create({
                title: `Yêu cầu hỗ trợ đã được ${statusLabel}`,
                content: `Yêu cầu "${request.category}" của bạn đã được ${statusLabel}. ${admin_response ? 'Phản hồi: ' + admin_response : ''}`,
                student_id: request.student_id._id || request.student_id,
                created_by: req.user._id,
            });
        }

        res.status(200).json({ success: true, message: `Request status updated to '${status}'.`, data: request });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAllRequests, getMyRequests, createRequest, updateRequestStatus };