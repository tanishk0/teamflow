import jwt from "jsonwebtoken";
import User from "../db/User.js";

/**
 * Authentication middleware to check if user is logged in
 * Verifies JWT token from cookies and attaches user info to request
 */
export const requireAuth = async (req, res, next) => {
    try {
        // Get token from cookies
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                message: "Authentication required. Please log in."
            });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by ID from token
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            // Clear invalid token cookie
            res.clearCookie("token");
            return res.status(401).json({
                message: "User not found. Please log in again."
            });
        }

        // Attach user to request object for use in subsequent middleware/routes
        req.user = user;
        req.userId = decoded.userId;

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);

        // Clear invalid token cookie
        res.clearCookie("token");

        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Invalid or expired token. Please log in again."
            });
        }

        return res.status(500).json({
            message: "Authentication error. Please try again."
        });
    }
};