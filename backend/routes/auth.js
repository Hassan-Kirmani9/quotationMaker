const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

router.post("/register", asyncHandler(authController.registerUser));
router.post("/login", asyncHandler(authController.loginUser));
router.get("/me", protect(), asyncHandler(authController.me));
router.patch("/profile", protect(), asyncHandler(authController.updateProfile));
router.patch("/change-password", protect(), asyncHandler(authController.changePassword));

module.exports = router;
