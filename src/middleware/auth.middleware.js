const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

/**
 *  - Authentication Middleware
 *  - Verify JWT token and set userId in request object
 */
async function authMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            message: "Unauthorized, token is missing",
            status: "failed",
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                message: "Unauthorized, user not found",
                status: "failed",
            });
        }

        req.user = user;
        return next();
      
    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized, token is invalid",
            status: "failed",
        });
    }
}

module.exports = {authMiddleware};
