const express = require("express");
const router = express.Router();
const sizeController = require("../controllers/sizeController");
const { protect } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

router.use(protect());

router.get("/", asyncHandler(sizeController.listing));
router.post("/", asyncHandler(sizeController.create));
router.get("/dropdown", asyncHandler(sizeController.dropdown))
router.get("/:id", asyncHandler(sizeController.get));
router.patch("/:id", asyncHandler(sizeController.update));
router.delete("/:id", asyncHandler(sizeController.remove));

module.exports = router;
