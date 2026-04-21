const jwt = require('jsonwebtoken');
const Account = require('../models/Account');

const protect = async (req, res, next) => {
    try {
        // 1. Get token from header
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
        }

        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Check if account still exists and is active
        const account = await Account.findById(decoded.id);
        if (!account) {
            return res.status(401).json({ success: false, message: 'Account no longer exists.' });
        }
        if (account.status === 'locked') {
            return res.status(403).json({ success: false, message: 'Your account has been locked. Please contact admin.' });
        }

        // 4. Attach account to request
        req.user = account;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};

module.exports = { protect };