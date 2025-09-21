const express = require("express");
const router = express.Router();
const tenantController = require("../controllers/tenantController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect("admin"), tenantController.createTenant);

module.exports = router;
