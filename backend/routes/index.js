  const express = require('express');
  const router = express.Router();


  const authRoutes = require('./auth');
  const clientRoutes = require('./clients');
  const productRoutes = require('./products');
  const configurationRoutes = require('./configuration');
  const quotationRoutes = require('./quotations');
  const sizeRoutes = require('./size');
  const organizationRoutes = require('./organization');

  router.use('/auth', authRoutes);
  router.use('/clients', clientRoutes);
  router.use('/products', productRoutes);
  router.use('/configuration', configurationRoutes);
  router.use('/quotations', quotationRoutes);
  router.use('/sizes', sizeRoutes);
  router.use('/organizations', organizationRoutes);


  router.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Quotation Maker API',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        clients: '/api/clients',
        products: '/api/products',
        configuration: '/api/configuration',
        quotations: '/api/quotations',
        sizes: '/api/sizes'
      }
    });
  });

  module.exports = router;