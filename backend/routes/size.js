const express = require('express');
const router = express.Router();
const {
    getSizes,
    getAllSizes,
    getSize,
    createSize,
    updateSize,
    deleteSize
} = require('../controllers/sizeController');
const auth = require('../middleware/authMiddleware');


router.use(auth);


router.get('/', getSizes);


router.get('/all', getAllSizes);


router.get('/:id', getSize);


router.post('/', createSize);


router.put('/:id', updateSize);


router.delete('/:id', deleteSize);

module.exports = router;