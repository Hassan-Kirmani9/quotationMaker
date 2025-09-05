const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Routes
router.get('/', quotationController.getQuotations);
router.get('/stats', quotationController.getQuotationStats);
router.get('/:id', quotationController.getQuotation);
router.post('/', quotationController.createQuotation);
router.put('/:id', quotationController.updateQuotation);
router.put('/:id/status', quotationController.updateQuotationStatus);
router.post('/:id/duplicate', quotationController.duplicateQuotation);
router.delete('/:id', quotationController.deleteQuotation);

module.exports = router;