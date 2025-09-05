const Quotation = require('../models/Quotation');
const Product = require('../models/Product');
const Client = require('../models/Client');
const Configuration = require('../models/Configuration');


const getQuotations = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, client } = req.query;
    const userId = req.user._id;


    const query = { user: userId };

    if (search) {
      query.$or = [
        { quotationNo: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    if (client) {
      query.client = client;
    }


    const quotations = await Quotation.find(query)
      .populate('client', 'name businessName email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Quotation.countDocuments(query);

    res.json({
      success: true,
      data: {
        quotations,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / limit),
          total,
          limit: Number(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get quotations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quotations',
      error: error.message
    });
  }
};


const getQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findOne({
      _id: req.params.id,
      user: req.user._id
    })
      .populate('client')
      .populate('items.product', 'name description unit');

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    res.json({
      success: true,
      data: { quotation }
    });
  } catch (error) {
    console.error('Get quotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quotation',
      error: error.message
    });
  }
};


const createQuotation = async (req, res) => {
  try {
    const { client, title, description, items, discountType, discountValue, taxRate, currency, notes, terms } = req.body;


    const clientExists = await Client.findOne({ _id: client, user: req.user._id });
    if (!clientExists) {
      return res.status(400).json({
        success: false,
        message: 'Client not found'
      });
    }


    const processedItems = [];
    for (const item of items) {
      const product = await Product.findOne({ _id: item.product, user: req.user._id });
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      processedItems.push({
        product: item.product,
        description: item.description || product.description,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || product.sellingPrice,
        totalPrice: (item.quantity || 1) * (item.unitPrice || product.sellingPrice)
      });
    }


    const config = await Configuration.findOne({ user: req.user._id });
    const validityDays = config?.quotation?.validity || 30;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validityDays);
    const defaultCurrency = config?.quotation?.currency || 'USD';

    const quotationData = {
      client,
      title,
      description,
      items: processedItems,
      validUntil,
      discountType: discountType || 'percentage',
      discountValue: discountValue || 0,
      taxRate: taxRate || 0,
      currency: currency || 'USD',
      notes,
      terms,
      user: req.user._id
    };

    const quotation = new Quotation(quotationData);
    await quotation.save();


    await quotation.populate([
      { path: 'client', select: 'name businessName email' },
      { path: 'items.product', select: 'name description unit' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Quotation created successfully',
      data: { quotation }
    });
  } catch (error) {
    console.error('Create quotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating quotation',
      error: error.message
    });
  }
};


const updateQuotation = async (req, res) => {
  try {
    const quotationId = req.params.id;
    const { items, discountType, discountValue, taxRate, ...otherUpdates } = req.body;

    const quotation = await Quotation.findOne({
      _id: quotationId,
      user: req.user._id
    });

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }


    if (quotation.status === 'accepted' || quotation.status === 'expired') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update accepted or expired quotations'
      });
    }


    if (items) {
      const processedItems = [];
      for (const item of items) {
        const product = await Product.findOne({ _id: item.product, user: req.user._id });
        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Product not found: ${item.product}`
          });
        }

        processedItems.push({
          product: item.product,
          description: item.description || product.description,
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || product.sellingPrice,
          totalPrice: (item.quantity || 1) * (item.unitPrice || product.sellingPrice)
        });
      }
      quotation.items = processedItems;
    }


    Object.assign(quotation, otherUpdates);

    if (discountType !== undefined) quotation.discountType = discountType;
    if (discountValue !== undefined) quotation.discountValue = discountValue;
    if (taxRate !== undefined) quotation.taxRate = taxRate;

    await quotation.save();


    await quotation.populate([
      { path: 'client', select: 'name businessName email' },
      { path: 'items.product', select: 'name description unit' }
    ]);

    res.json({
      success: true,
      message: 'Quotation updated successfully',
      data: { quotation }
    });
  } catch (error) {
    console.error('Update quotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating quotation',
      error: error.message
    });
  }
};


const deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }


    if (quotation.status === 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete accepted quotations'
      });
    }

    await Quotation.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Quotation deleted successfully'
    });
  } catch (error) {
    console.error('Delete quotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting quotation',
      error: error.message
    });
  }
};


const updateQuotationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const quotation = await Quotation.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status },
      { new: true }
    ).populate([
      { path: 'client', select: 'name businessName email' },
    ]);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    res.json({
      success: true,
      message: 'Quotation status updated successfully',
      data: { quotation }
    });
  } catch (error) {
    console.error('Update quotation status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating quotation status',
      error: error.message
    });
  }
};


const duplicateQuotation = async (req, res) => {
  try {
    const originalQuotation = await Quotation.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!originalQuotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }


    const quotationData = originalQuotation.toObject();
    delete quotationData._id;
    delete quotationData.quotationNo;
    delete quotationData.createdAt;
    delete quotationData.updatedAt;


    quotationData.status = 'draft';
    quotationData.date = new Date();


    const config = await Configuration.findOne({ user: req.user._id });
    const validityDays = config?.quotation?.validity || 30;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validityDays);
    quotationData.validUntil = validUntil;

    const newQuotation = new Quotation(quotationData);
    await newQuotation.save();


    await newQuotation.populate([
      { path: 'client', select: 'name businessName email' },
      { path: 'items.product', select: 'name description unit' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Quotation duplicated successfully',
      data: { quotation: newQuotation }
    });
  } catch (error) {
    console.error('Duplicate quotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error duplicating quotation',
      error: error.message
    });
  }
};


const getQuotationStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Quotation.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalCount = await Quotation.countDocuments({ user: userId });
    const totalValue = await Quotation.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);


    const recentQuotations = await Quotation.find({ user: userId })
      .populate('client', 'name businessName')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('quotationNo title totalAmount status createdAt');

    res.json({
      success: true,
      data: {
        stats: {
          total: totalCount,
          totalValue: totalValue[0]?.total || 0,
          byStatus: stats.reduce((acc, stat) => {
            acc[stat._id] = {
              count: stat.count,
              totalAmount: stat.totalAmount
            };
            return acc;
          }, {})
        },
        recentQuotations
      }
    });
  } catch (error) {
    console.error('Get quotation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quotation statistics',
      error: error.message
    });
  }
};

module.exports = {
  getQuotations,
  getQuotation,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  updateQuotationStatus,
  duplicateQuotation,
  getQuotationStats
};