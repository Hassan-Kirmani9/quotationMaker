const express = require("express");
const router = express.Router();
const quotationController = require("../controllers/quotationController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect());

router.get("/", quotationController.getQuotations);
router.get("/stats", quotationController.getQuotationStats);
router.get("/:id", quotationController.getQuotation);
router.post("/", quotationController.createQuotation);
router.put("/:id", quotationController.updateQuotation);
router.put("/:id/status", quotationController.updateQuotationStatus);
router.post("/:id/duplicate", quotationController.duplicateQuotation);
router.delete("/:id", quotationController.deleteQuotation);
router.get("/:id/pdf", quotationController.generateQuotationPDF);

module.exports = router;
