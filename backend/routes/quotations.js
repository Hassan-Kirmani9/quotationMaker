const express = require("express");
const router = express.Router();
const quotationController = require("../controllers/quotationController");
const { protect } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

router.use(protect());

router.get("/", asyncHandler(quotationController.listing));
router.get("/:id", asyncHandler(quotationController.get));
router.post("/", asyncHandler(quotationController.create));
router.patch("/:id", asyncHandler(quotationController.update));
router.delete("/:id", asyncHandler(quotationController.remove));
router.get("/:id/generate-pdf", asyncHandler(quotationController.generatePDF));
router.patch(
  "/:id/update-status",
  asyncHandler(quotationController.updateStatus)
);

module.exports = router;
