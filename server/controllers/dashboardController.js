const Room = require('../models/Room');
const Registration = require('../models/Registration');
const Request = require('../models/Request');
const Bill = require('../models/Bill');
const Contract = require('../models/Contract');
const Student = require('../models/Student');

// @route   GET /api/dashboard/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
    try {
        // Run all aggregation queries in parallel for performance
        const [
            totalStudents,
            totalAvailableBeds,
            pendingRegistrations,
            newRequests,
            unpaidInvoicesAgg,
            pendingVerificationCount,
            recentRegistrations,
            recentRequests,
        ] = await Promise.all([
            // Total active residents
            Contract.countDocuments({ status: 'active' }),

            // Total available beds across all rooms
            Room.aggregate([
                { $unwind: '$beds' },
                { $match: { 'beds.status': 'available' } },
                { $count: 'total' },
            ]),

            // Pending registration applications
            Registration.countDocuments({ status: 'pending' }),

            // New (unprocessed) support requests
            Request.countDocuments({ status: 'new' }),

            // Total unpaid debt
            Bill.aggregate([
                { $match: { status: 'unpaid' } },
                { $group: { _id: null, total: { $sum: '$total_amount' } } },
            ]),

            // Invoices awaiting admin verification
            Bill.countDocuments({ status: 'pending_verification' }),

            // 5 most recent registrations
            Registration.find({ status: 'pending' })
                .populate('student_id', 'fullname student_code')
                .sort({ createdAt: -1 })
                .limit(5),

            // 5 most recent new requests
            Request.find({ status: 'new' })
                .populate('student_id', 'fullname student_code')
                .sort({ createdAt: -1 })
                .limit(5),
        ]);

        res.status(200).json({
            success: true,
            data: {
                total_active_residents: totalStudents,
                total_available_beds: totalAvailableBeds[0]?.total || 0,
                pending_registrations: pendingRegistrations,
                new_requests: newRequests,
                total_unpaid_debt: unpaidInvoicesAgg[0]?.total || 0,
                pending_verification_invoices: pendingVerificationCount,
                recent_registrations: recentRegistrations,
                recent_requests: recentRequests,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getDashboardStats };