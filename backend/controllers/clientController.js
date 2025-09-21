const Client = require('../models/Client');

const getClients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const tenantId = req.user.tenant_id._id;

    const query = { tenant_id: tenantId };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    const clients = await Client.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Client.countDocuments(query);

    res.json({
      success: true,
      data: {
        clients,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / limit),
          total,
          limit: Number(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching clients',
      error: error.message
    });
  }
};

const getClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      tenant_id: req.user.tenant_id._id
    })

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      data: { client }
    });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching client',
      error: error.message
    });
  }
};

const createClient = async (req, res) => {
  try {
    const clientData = {
      ...req.body,
      user: req.user._id,
      tenant_id: req.user.tenant_id._id,
    };

    const client = new Client(clientData);
    await client.save();

    const populatedClient = await Client.findById(client._id)
      .populate('tenant_id', 'name');

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: { client: populatedClient }
    });
  } catch (error) {
    console.error('Create client error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Client with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating client',
      error: error.message
    });
  }
};

const updateClient = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      {
        _id: req.params.id,
        tenant_id: req.user.tenant_id._id
      },
      {
        ...req.body
      },
      { new: true, runValidators: true }
    )

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      message: 'Client updated successfully',
      data: { client }
    });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating client',
      error: error.message
    });
  }
};

const deleteClient = async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      tenant_id: req.user.tenant_id._id
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const Quotation = require('../models/Quotation');
    const quotationCount = await Quotation.countDocuments({
      client: req.params.id,
      tenant_id: req.user.tenant_id._id
    });

    if (quotationCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete client with associated quotations. Please delete quotations first.'
      });
    }

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting client',
      error: error.message
    });
  }
};

module.exports = {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient
};