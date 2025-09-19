const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

const checkPagePermission = (requiredPage) => {
  return (req, res, next) => {
    try {
      if (req.user.role === 'admin') {
        return next();
      }

      const userPages = req.user.accessible_pages || [];
      
      if (!userPages.includes(requiredPage)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. You don't have permission to access ${requiredPage}`
        });
      }

      next();
    } catch (error) {
      console.error('Page permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking page permissions'
      });
    }
  };
};

router.use(authMiddleware);
router.use(checkPagePermission('/products'));

router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;