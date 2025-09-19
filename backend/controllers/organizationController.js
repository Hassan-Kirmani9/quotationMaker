const Organization = require('../models/Organization');
const User = require('../models/User');

const createOrganization = async (req, res) => {
  try {
    const {
      name,
      description,
      contactEmail,
      contactPhone,
      address,
      settings
    } = req.body;

    const existingOrg = await Organization.findOne({ name });
    if (existingOrg) {
      return res.status(400).json({
        success: false,
        message: 'Organization with this name already exists'
      });
    }

    const defaultSettings = {
      allowUserRegistration: false,
      defaultUserPages: ["/dashboard"]
    };

    const organization = new Organization({
      name,
      description,
      contactEmail,
      contactPhone,
      address,
      settings: { ...defaultSettings, ...settings }
    });

    await organization.save();

    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: {
        organization
      }
    });
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating organization',
      error: error.message
    });
  }
};

const getOrganizations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const organizations = await Organization.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Organization.countDocuments(filter);

    res.json({
      success: true,
      data: {
        organizations,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_records: total,
          per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching organizations',
      error: error.message
    });
  }
};

const getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    const userCount = await User.countDocuments({ 
      organization_id: id,
      isActive: true 
    });

    res.json({
      success: true,
      data: {
        organization,
        user_count: userCount
      }
    });
  } catch (error) {
    console.error('Get organization by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching organization',
      error: error.message
    });
  }
};

const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      contactEmail,
      contactPhone,
      address,
      settings,
      status
    } = req.body;

    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    if (name && name !== organization.name) {
      const existingOrg = await Organization.findOne({ 
        name, 
        _id: { $ne: id } 
      });
      if (existingOrg) {
        return res.status(400).json({
          success: false,
          message: 'Organization with this name already exists'
        });
      }
    }

    const updatedOrganization = await Organization.findByIdAndUpdate(
      id,
      {
        name,
        description,
        contactEmail,
        contactPhone,
        address,
        settings,
        status
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Organization updated successfully',
      data: {
        organization: updatedOrganization
      }
    });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating organization',
      error: error.message
    });
  }
};

const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    const userCount = await User.countDocuments({ organization_id: id });
    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete organization with active users. Please transfer or deactivate users first.'
      });
    }

    await Organization.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Organization deleted successfully'
    });
  } catch (error) {
    console.error('Delete organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting organization',
      error: error.message
    });
  }
};

const getOrganizationUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, role, isActive } = req.query;

    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    const filter = { organization_id: id };
    if (role) {
      filter.role = role;
    }
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        organization: {
          id: organization._id,
          name: organization.name
        },
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_records: total,
          per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get organization users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching organization users',
      error: error.message
    });
  }
};

module.exports = {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  getOrganizationUsers
};