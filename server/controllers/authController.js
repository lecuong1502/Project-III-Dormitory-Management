const jwt = require('jsonwebtoken');
const Account = require('../models/Account');
const Student = require('../models/Student');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { student_code, fullname, email, password, date_of_birth, gender, phone } = req.body;

        // Check uniqueness
        const existingAccount = await Account.findOne({ username: email });
        if (existingAccount) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        }
        const existingStudent = await Student.findOne({ $or: [{ student_code }, { email }] });
        if (existingStudent) {
            return res.status(400).json({ success: false, message: 'Student code or email is already registered.' });
        }

        // Create student profile
        const student = await Student.create({ student_code, fullname, email, date_of_birth, gender, phone });

        // Create account linked to student
        const account = await Account.create({
            username: email,
            password,
            role: 'student',
            student_id: student._id,
        });

        const token = generateToken(account._id);

        res.status(201).json({
            success: true,
            message: 'Account registered successfully.',
            token,
            user: {
                id: account._id,
                username: account.username,
                role: account.role,
                student_id: student._id,
                fullname: student.fullname,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Please provide username and password.' });
        }

        // Find account and explicitly select password
        const account = await Account.findOne({ username }).select('+password');
        if (!account) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        // Check lock status
        if (account.status === 'locked') {
            return res.status(403).json({ success: false, message: 'Your account has been locked. Please contact admin.' });
        }

        // Verify password
        const isMatch = await account.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        // Fetch student profile if student role
        let studentProfile = null;
        if (account.role === 'student' && account.student_id) {
            studentProfile = await Student.findById(account.student_id).select('-__v');
        }

        const token = generateToken(account._id);

        res.status(200).json({
            success: true,
            message: 'Login successful.',
            token,
            user: {
                id: account._id,
                username: account.username,
                role: account.role,
                student: studentProfile,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const account = await Account.findById(req.user._id);
        let studentProfile = null;
        if (account.role === 'student' && account.student_id) {
            studentProfile = await Student.findById(account.student_id)
                .populate({
                    path: 'current_contract',
                    populate: { path: 'room_id', populate: { path: 'building_id' } },
                });
        }
        res.status(200).json({ success: true, data: { account, student: studentProfile } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   PATCH /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { old_password, new_password } = req.body;
        const account = await Account.findById(req.user._id).select('+password');

        const isMatch = await account.comparePassword(old_password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Old password is incorrect.' });
        }

        account.password = new_password;
        await account.save();

        res.status(200).json({ success: true, message: 'Password changed successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { register, login, getMe, changePassword };