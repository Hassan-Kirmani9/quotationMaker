const Size = require('../models/Size');


const getSizes = async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const userId = req.user._id;

    const query = { user: userId };
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const sizes = await Size.find(query)
      .sort({ name: 1 }) 
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Size.countDocuments(query);

    res.json({
      success: true,
      data: {
        sizes,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / limit),
          total,
          limit: Number(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get sizes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sizes',
      error: error.message
    });
  }
};


const getAllSizes = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const sizes = await Size.find({ user: userId })
      .sort({ name: 1 })
      .select('_id name')
      .exec();

    res.json({
      success: true,
      data: { sizes }
    });
  } catch (error) {
    console.error('Get all sizes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sizes',
      error: error.message
    });
  }
};


const getSize = async (req, res) => {
  try {
    const size = await Size.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!size) {
      return res.status(404).json({
        success: false,
        message: 'Size not found'
      });
    }

    res.json({
      success: true,
      data: { size }
    });
  } catch (error) {
    console.error('Get size error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching size',
      error: error.message
    });
  }
};


const createSize = async (req, res) => {
  try {
    const sizeData = {
      ...req.body,
      user: req.user._id
    };

    const size = new Size(sizeData);
    await size.save();

    res.status(201).json({
      success: true,
      message: 'Size created successfully',
      data: { size }
    });
  } catch (error) {
    console.error('Create size error:', error);
    
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Size name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating size',
      error: error.message
    });
  }
};


const updateSize = async (req, res) => {
  try {
    const size = await Size.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!size) {
      return res.status(404).json({
        success: false,
        message: 'Size not found'
      });
    }

    res.json({
      success: true,
      message: 'Size updated successfully',
      data: { size }
    });
  } catch (error) {
    console.error('Update size error:', error);
    
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Size name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating size',
      error: error.message
    });
  }
};


const deleteSize = async (req, res) => {
  try {
    const size = await Size.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!size) {
      return res.status(404).json({
        success: false,
        message: 'Size not found'
      });
    }

    res.json({
      success: true,
      message: 'Size deleted successfully'
    });
  } catch (error) {
    console.error('Delete size error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting size',
      error: error.message
    });
  }
};

module.exports = {
  getSizes,
  getAllSizes,
  getSize,
  createSize,
  updateSize,
  deleteSize
};