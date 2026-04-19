const Room = require('../models/Room');
const Building = require('../models/Building');

// @route   GET /api/rooms
// @access  Private (Admin)
const getAllRooms = async (req, res) => {
    try {
        const { building_id, status, room_type } = req.query;
        const filter = {};
        if (building_id) filter.building_id = building_id;
        if (status) filter.status = status;
        if (room_type) filter.room_type = room_type;

        const rooms = await Room.find(filter)
            .populate('building_id', 'name address')
            .sort({ room_number: 1 });

        res.status(200).json({ success: true, count: rooms.length, data: rooms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   GET /api/rooms/:id
// @access  Private
const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id)
            .populate('building_id', 'name address')
            .populate('beds.student_id', 'fullname student_code');

        if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });

        res.status(200).json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   POST /api/rooms
// @access  Private (Admin)
const createRoom = async (req, res) => {
    try {
        const { room_number, building_id, room_type, price_per_month } = req.body;

        // Verify building exists
        const building = await Building.findById(building_id);
        if (!building) return res.status(404).json({ success: false, message: 'Building not found.' });

        // Auto-generate beds based on room type
        const capacityMap = { '4-person': 4, '6-person': 6, '8-person': 8 };
        const capacity = capacityMap[room_type] || 4;
        const beds = Array.from({ length: capacity }, (_, i) => ({
            bed_number: `B${String(i + 1).padStart(2, '0')}`,
            status: 'available',
            student_id: null,
        }));

        const room = await Room.create({ room_number, building_id, room_type, price_per_month, beds });

        // Update building total_rooms count
        await Building.findByIdAndUpdate(building_id, { $inc: { total_rooms: 1 } });

        res.status(201).json({ success: true, message: 'Room created successfully.', data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   PATCH /api/rooms/:id
// @access  Private (Admin)
const updateRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });
        res.status(200).json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   DELETE /api/rooms/:id
// @access  Private (Admin)
const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });

        const hasOccupied = room.beds.some((b) => b.status === 'occupied');
        if (hasOccupied) {
            return res.status(400).json({ success: false, message: 'Cannot delete a room with students currently residing.' });
        }

        await room.deleteOne();
        await Building.findByIdAndUpdate(room.building_id, { $inc: { total_rooms: -1 } });

        res.status(200).json({ success: true, message: 'Room deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   PATCH /api/rooms/:id/beds/:bedId
// @access  Private (Admin)
const updateBedStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });

        const bed = room.beds.id(req.params.bedId);
        if (!bed) return res.status(404).json({ success: false, message: 'Bed not found.' });

        if (bed.status === 'occupied' && status === 'maintenance') {
            return res.status(400).json({
                success: false,
                message: 'Cannot set bed to maintenance while a student is using it. Please arrange a room transfer first.',
            });
        }

        bed.status = status;
        room.updateRoomStatus();
        await room.save();

        res.status(200).json({ success: true, message: 'Bed status updated.', data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   GET /api/rooms/buildings
// access  Private (Admin)
const getAllBuildings = async (req, res) => {
    try {
        const buildings = await Building.find().sort({ name: 1 });
        res.status(200).json({ success: true, data: buildings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   POST /api/rooms/buildings
// @access  Private (Admin)
const createBuilding = async (req, res) => {
    try {
        const building = await Building.create(req.body);
        res.status(201).json({ success: true, data: building });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom, updateBedStatus, getAllBuildings, createBuilding };