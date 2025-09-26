const User = require("../models/User");
const { verifyToken } = require("../utils/auth");

const protect = (roles = []) => async (req, res, next) => {
    try {
      let tokenString = null;
      
      const authHeader = req.header("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        tokenString = authHeader;
      } 
      else if (req.query.token) {
        tokenString = `Bearer ${req.query.token}`;
      }
      
      if (!tokenString) {
        return res.status(401).json({
          success: false,
          message: "Access denied. No token provided.",
        });
      }

      let decoded = verifyToken(tokenString);
      if (decoded == false) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired token.",
        });
      }

      const user = await User.findById(decoded.userId).select(
        "role isActive tenant"
      );
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
