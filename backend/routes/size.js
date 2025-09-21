const express = require("express");
const router = express.Router();
const {
  getSizes,
  getAllSizes,
  getSize,
  createSize,
  updateSize,
  deleteSize,
} = require("../controllers/sizeController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect());

router.get("/", getSizes);
router.get("/all", getAllSizes);
router.get("/:id", getSize);
router.post("/", createSize);
router.patch("/:id", updateSize);
router.delete("/:id", deleteSize);

module.exports = router;
