/**
 * Role-based access control middleware.
 * Usage: roleMiddleware('admin') or roleMiddleware('admin', 'student')
 */
const roleMiddleware = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role(s): [${roles.join(', ')}]. Your role: ${req.user.role}.`,
            });
        }
        next();
    };
};

module.exports = { roleMiddleware };