const jwt = require("jsonwebtoken");
const { User } = require("../models/Models");

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1]; 

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access token required.",
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET 
        );

        const user = await User.findByPk(decoded.userId);

        if (!user || !user.isActive) {
            return res.status(403).json({
                success: false,
                message: "User not found or inactive.",
            });
        }

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            isHead: decoded.role == "HEAD",
            departmentId: decoded.departmentId,
        };

        next();
    } catch (err) {
        console.error("Token authentication error:", err);

        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token has expired.",
            });
        }

        return res.status(403).json({
            success: false,
            message: "Invalid token.",
        });
    }
};

const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Insufficient permissions.",
            });
        }

        next();
    };
};

const requireSelfOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required.",
        });
    }

    const targetUserId = req.params.id || req.params.userId;
    if (req.user.role === "ADMIN" || req.user.userId === parseInt(targetUserId)) {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: "Access denied.",
    });
};

const requireDepartmentOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required.",
        });
    }

    const targetDepartmentId = req.params.departmentId || req.body.departmentId;
    if (
        req.user.role === "ADMIN" ||
        req.user.departmentId === parseInt(targetDepartmentId)
    ) {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: "Access denied.",
    });
};

module.exports = {
    authenticateToken,
    requireRole,
    requireSelfOrAdmin,
    requireDepartmentOrAdmin,
};