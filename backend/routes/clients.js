const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect());

router.get("/", clientController.listing);
router.get("/:id", clientController.get);
router.post("/", clientController.create);
router.patch("/:id", clientController.update);
router.delete("/:id", clientController.remove);

module.exports = router;
