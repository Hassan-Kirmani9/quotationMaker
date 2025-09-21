const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect =
  (roles = []) =>
  async (req, res, next) => {
    try {
      const authHeader = req.header("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Access denied. No token provided.",
        });
      }

      const token = authHeader.replace("Bearer ", "");
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired token.",
        });
      }

      const user = await User.findById(decoded.userId).select("role isActive tenant");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found.",
        });
      }

      if (user.isActive === false) {
        return res.status(401).json({
          success: false,
          message: "Account is inactive.",
        });
      }

      if (roles) {
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
          return res.status(403).json({
            success: false,
            message: "Access denied. Insufficient role.",
          });
        }
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error in authentication.",
        error: error?.message || "Server Error",
      });
    }
  };

module.exports = { protect };
