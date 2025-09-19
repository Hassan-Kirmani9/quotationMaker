const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const authMiddleware = require('../middleware/authMiddleware');

const checkAdminRole = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
};

router.post('/', authMiddleware, checkAdminRole, organizationController.createOrganization);
router.get('/', authMiddleware, checkAdminRole, organizationController.getOrganizations);
router.get('/:id', authMiddleware, checkAdminRole, organizationController.getOrganizationById);
router.put('/:id', authMiddleware, checkAdminRole, organizationController.updateOrganization);
router.delete('/:id', authMiddleware, checkAdminRole, organizationController.deleteOrganization);
router.get('/:id/users', authMiddleware, checkAdminRole, organizationController.getOrganizationUsers);

module.exports = router;