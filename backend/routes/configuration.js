const express = require('express');
const router = express.Router();
const configurationController = require('../controllers/configurationController');
const authMiddleware = require('../middleware/authMiddleware');


router.use(authMiddleware);


router.get('/', configurationController.getConfiguration);
router.put('/', configurationController.updateConfiguration);
router.post('/reset', configurationController.resetConfiguration);
router.put('/upload-logo', configurationController.uploadLogo);

module.exports = router;