const Registration = require('../models/Registration');
const Room = require('../models/Room');
const Student = require('../models/Student');
const Contract = require('../models/Contract');
const Notification = require('../models/Notification');

// @route   GET /api/registrations
// @access  Private (Admin)
const getAllRegistrations = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const registrations = await Registration.find(filter)
            .populate('student_id', 'fullname student_code email phone')
            .populate('assigned_room_id', 'room_number building_id')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: registrations.length, data: registrations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   GET /api/registrations/my
// @access  Private (Student)
const getMyRegistration = async (req, res) => {
    try {
        const student = await Student.findById(req.user.student_id);
        if (!student) return res.status(404).json({ success: false, message: 'Student profile not found.' });

        const registration = await Registration.findOne({ student_id: student._id })
            .populate('assigned_room_id', 'room_number building_id room_type')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: registration });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   POST /api/registrations
// @access  Private (Student)
const submitRegistration = async (req, res) => {
    try {
        const student = await Student.findById(req.user.student_id);
        if (!student) return res.status(404).json({ success: false, message: 'Student profile not found.' });

        // Check if student already has an active pending application
        const existing = await Registration.findOne({ student_id: student._id, status: 'pending' });
        if (existing) {
            return res.status(400).json({ success: false, message: 'You already have a pending registration. Please wait for review.' });
        }

        // Check if student is already residing
        if (student.current_contract) {
            return res.status(400).json({ success: false, message: 'You are already residing in the dormitory.' });
        }

        const { desired_room_type, desired_building, content } = req.body;
        const registration = await Registration.create({
            student_id: student._id,
            desired_room_type,
            desired_building,
            content,
            status: 'pending',
        });

        res.status(201).json({ success: true, message: 'Registration submitted successfully. Please wait for review.', data: registration });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   PATCH /api/registrations/:id/approve
// @access  Private (Admin)
const approveRegistration = async (req, res) => {
    try {
        const { room_id, bed_id } = req.body;

        const registration = await Registration.findById(req.params.id).populate('student_id');
        if (!registration) return res.status(404).json({ success: false, message: 'Registration not found.' });
        if (registration.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'This registration has already been processed.' });
        }

        // Validate room and bed
        const room = await Room.findById(room_id);
        if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });

        const bed = room.beds.id(bed_id);
        if (!bed || bed.status !== 'available') {
            return res.status(400).json({ success: false, message: 'Selected bed is not available.' });
        }

        // Assign bed to student
        bed.status = 'occupied';
        bed.student_id = registration.student_id._id;
        room.updateRoomStatus();
        await room.save();

        // Create contract
        const contract = await Contract.create({
            student_id: registration.student_id._id,
            room_id: room._id,
            bed_id: bed._id,
            start_date: new Date(),
            status: 'active',
        });

        // Update student's current contract
        await Student.findByIdAndUpdate(registration.student_id._id, { current_contract: contract._id });

        // Update registration
        registration.status = 'approved';
        registration.assigned_room_id = room._id;
        registration.assigned_bed_id = bed._id;
        registration.reviewed_by = req.user._id;
        registration.reviewed_at = new Date();
        await registration.save();

        // Send notification to student
        await Notification.create({
            title: 'Đơn đăng ký đã được duyệt',
            content: `Đơn đăng ký nội trú của bạn đã được duyệt. Phòng: ${room.room_number}, Giường: ${bed.bed_number}.`,
            student_id: registration.student_id._id,
            created_by: req.user._id,
        });

        res.status(200).json({ success: true, message: 'Registration approved and room assigned.', data: registration });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   PATCH /api/registrations/:id/reject
// @access  Private (Admin)
const rejectRegistration = async (req, res) => {
    try {
        const { rejection_reason } = req.body;

        const registration = await Registration.findById(req.params.id);
        if (!registration) return res.status(404).json({ success: false, message: 'Registration not found.' });
        if (registration.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'This registration has already been processed.' });
        }

        registration.status = 'rejected';
        registration.rejection_reason = rejection_reason || 'No reason provided.';
        registration.reviewed_by = req.user._id;
        registration.reviewed_at = new Date();
        await registration.save();

        // Send notification to student
        await Notification.create({
            title: 'Đơn đăng ký bị từ chối',
            content: `Đơn đăng ký nội trú của bạn đã bị từ chối. Lý do: ${registration.rejection_reason}`,
            student_id: registration.student_id,
            created_by: req.user._id,
        });

        res.status(200).json({ success: true, message: 'Registration rejected.', data: registration });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAllRegistrations, getMyRegistration, submitRegistration, approveRegistration, rejectRegistration };