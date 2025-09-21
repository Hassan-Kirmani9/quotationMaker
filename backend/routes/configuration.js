const express = require("express");
const router = express.Router();
const configurationController = require("../controllers/configurationController");
const { protect } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

router.use(protect());

router.get("/", asyncHandler(configurationController.get));
router.patch("/", asyncHandler(configurationController.update));
router.patch("/upload-logo", asyncHandler(configurationController.uploadLogo));

module.exports = router;
