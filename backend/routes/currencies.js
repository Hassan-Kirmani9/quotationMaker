const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/currencyController');
const authMiddleware = require('../middleware/authMiddleware');


router.use(authMiddleware);


router.get('/', currencyController.getCurrencies);
router.get('/:id', currencyController.getCurrency);
router.post('/', currencyController.createCurrency);
router.put('/:id', currencyController.updateCurrency);
router.put('/:id/set-default', currencyController.setDefaultCurrency);
router.delete('/:id', currencyController.deleteCurrency);

module.exports = router;