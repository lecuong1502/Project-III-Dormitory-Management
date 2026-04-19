const Contract = require('../models/Contract');
const Room = require('../models/Room');
const Bill = require('../models/Bill');
const ElectricityWater = require('../models/ElectricityWater');
const Notification = require('../models/Notification');

/**
 * Generates monthly invoices for all active residents.
 * Called by the admin via POST /api/billing/generate
 *
 * @param {string} month - Format "YYYY-MM", e.g. "2026-03"
 * @param {ObjectId} adminId - The admin account performing the action
 * @returns {Promise<{ count: number, invoices: Array }>} - 
 */
const generateMonthlyInvoices = async (month, adminId) => {
    // Fetch all active contracts with room info
    const activeContracts = await Contract.find({ status: 'active' })
        .populate({ path: 'room_id', populate: { path: 'building_id' } })
        .populate('student_id');

    if (activeContracts.length === 0) {
        return { count: 0, invoices: [] };
    }

    const invoices = [];
    const notifications = [];

    for (const contract of activeContracts) {
        const room = contract.room_id;
        const student = contract.student_id;

        if (!room || !student) continue;

        // Skip if invoice for this student/month already exists
        const existing = await Bill.findOne({ student_id: student._id, month });
        if (existing) continue;

        // Base room fee
        const room_fee = room.price_per_month || 0;

        // Look up electricity/water reading for this room/month
        const utilityRecord = await ElectricityWater.findOne({ room_id: room._id, month });
        let electricity_fee = 0;
        let water_fee = 0;

        if (utilityRecord) {
            const electricity_used = utilityRecord.electricity_curr - utilityRecord.electricity_prev;
            const water_used = utilityRecord.water_curr - utilityRecord.water_prev;
            // Split utility cost equally among occupied beds in the room
            const occupiedBeds = room.beds.filter((b) => b.status === 'occupied').length || 1;
            electricity_fee = Math.round((electricity_used * utilityRecord.electricity_unit_price) / occupiedBeds);
            water_fee = Math.round((water_used * utilityRecord.water_unit_price) / occupiedBeds);
        }

        const service_fee = 50000; // Fixed monthly service/sanitation fee (VND)
        const total_amount = room_fee + electricity_fee + water_fee + service_fee;

        const invoice = await Bill.create({
            student_id: student._id,
            room_id: room._id,
            month,
            room_fee,
            electricity_fee,
            water_fee,
            service_fee,
            total_amount,
            status: 'unpaid',
        });

        invoices.push(invoice);

        // Queue notification for student
        notifications.push({
            title: `Hóa đơn tháng ${month}`,
            content: `Hóa đơn tháng ${month} của bạn đã được tạo. Tổng tiền: ${total_amount.toLocaleString('vi-VN')} VNĐ. Vui lòng thanh toán đúng hạn.`,
            student_id: student._id,
            created_by: adminId,
        });
    }

    // Bulk insert notifications
    if (notifications.length > 0) {
        await Notification.insertMany(notifications);
    }

    return { count: invoices.length, invoices };
};

module.exports = generateMonthlyInvoices;