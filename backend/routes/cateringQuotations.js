const express = require("express");
const router = express.Router();
const cateringQuotationController = require("../controllers/cateringQuotationController");
const { protect } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

router.use(protect());

router.get("/", asyncHandler(cateringQuotationController.listing));
router.get("/:id", asyncHandler(cateringQuotationController.get));
router.get("/:id/pdf", asyncHandler(cateringQuotationController.generatePDF));
router.post("/", asyncHandler(cateringQuotationController.create));
router.patch("/:id", asyncHandler(cateringQuotationController.update));
router.delete("/:id", asyncHandler(cateringQuotationController.remove));
router.patch(
  "/:id/update-status",
  asyncHandler(cateringQuotationController.updateStatus)
);

module.exports = router;
