const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

router.use(protect());

router.get("/", asyncHandler(productController.listing));
router.get("/:id", asyncHandler(productController.get));
router.post("/", asyncHandler(productController.create));
router.patch("/:id", asyncHandler(productController.update));
router.delete("/:id", asyncHandler(productController.remove));

module.exports = router;
