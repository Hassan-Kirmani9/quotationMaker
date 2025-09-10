const Product = require('../models/Product');

const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const userId = req.user._id;

    const query = { user: userId };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .populate('size', 'name') 
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / limit),
          total,
          limit: Number(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    }).populate('size', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

const createProduct = async (req, res) => {
  try {
    
    const Size = require('../models/Size');
    const size = await Size.findById(req.body.size);
    
    if (!size) {
      return res.status(400).json({
        success: false,
        message: 'Invalid size selected'
      });
    }

    const productData = {
      ...req.body,
      user: req.user._id,
      description: `${req.body.name} - ${size.name}` 
    };

    const product = new Product(productData);
    await product.save();

    
    await product.populate('size', 'name');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    
    let updateData = { ...req.body };
    
    if (req.body.size) {
      const Size = require('../models/Size');
      const size = await Size.findById(req.body.size);
      
      if (!size) {
        return res.status(400).json({
          success: false,
          message: 'Invalid size selected'
        });
      }
      
      
      updateData.description = `${req.body.name} - ${size.name}`;
    } else if (req.body.name) {
      
      const currentProduct = await Product.findOne({ _id: req.params.id, user: req.user._id }).populate('size');
      if (currentProduct) {
        updateData.description = `${req.body.name} - ${currentProduct.size.name}`;
      }
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    ).populate('size', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};