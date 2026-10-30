const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "skillbridge_secret_123";

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            if (!token || token === "undefined" || token === "null") {
                return res.status(401).json({
                    success: false,
                    message: "Authentication token missing or invalid. Please log in.",
                });
            }

            const decoded = jwt.verify(token, JWT_SECRET);
            if (!decoded || !decoded.id) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid session token. Please log in again.",
                });
            }

            if (mongoose.Types.ObjectId.isValid(decoded.id)) {
                req.user = await User.findById(decoded.id).select("-password");
            }

            if (!req.user && decoded.email) {
                req.user = await User.findOne({ email: decoded.email.toLowerCase().trim() }).select("-password");
            }

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "User account not found. Please log in again.",
                });
            }

            if (req.user.isSuspended) {
                return res.status(403).json({
                    success: false,
                    message: "Your account has been suspended by an administrator. Please contact support.",
                });
            }

            next();
        } catch (error) {
            console.warn("Auth Middleware Verification Failed:", error.message);
            return res.status(401).json({
                success: false,
                message: "Your session has expired or is invalid. Please log in again.",
            });
        }
    } else {
        return res.status(401).json({
            success: false,
            message: "Not authorized. Please log in to perform this action.",
        });
    }
};

// Middleware to restrict to admin role only
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
    });
};

const optionalAuth = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            if (token && token !== "undefined" && token !== "null") {
                const decoded = jwt.verify(token, JWT_SECRET);
                if (decoded && decoded.id && mongoose.Types.ObjectId.isValid(decoded.id)) {
                    req.user = await User.findById(decoded.id).select("-password");
                }
                if (!req.user && decoded?.email) {
                    req.user = await User.findOne({ email: decoded.email.toLowerCase().trim() }).select("-password");
                }
            }
        } catch (error) {
            // Ignore error and continue as guest
        }
    }
    next();
};

module.exports = { protect, adminOnly, optionalAuth };

