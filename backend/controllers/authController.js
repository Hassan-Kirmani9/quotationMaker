const User = require('../models/User');
const Organization = require('../models/Organization');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const getAllAvailablePages = () => {
  return [
    "/dashboard",
    "/quotations",
    "/clients",
    "/products",
    "/sizes",
    "/configuration"
  ];
};
const getUserAccessiblePages = (user) => {
  if (user.role === 'admin') {
    return getAllAvailablePages();
  }
  
  
  if (!user.accessible_pages || user.accessible_pages.length === 0) {
    return getAllAvailablePages(); 
  }
  
  return user.accessible_pages;
};
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, organization_id, accessible_pages } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    
    let userOrgId = null;
    if (organization_id) {
      const organization = await Organization.findById(organization_id);
      if (!organization || organization.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Invalid or inactive organization'
        });
      }
      userOrgId = organization_id;
    }

    const user = new User({
      name,
      email,
      password,
      role: role || 'user',
      organization_id: userOrgId,
      accessible_pages: accessible_pages || ["/dashboard"]
    });

    await user.save();

    const token = generateToken(user._id);
    const userAccessiblePages = getUserAccessiblePages(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization_id: user.organization_id,
          accessible_pages: userAccessiblePages
        },
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in user registration',
      error: error.message
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    
    let orgInfo = { _id: 'default', name: 'Default Organization' };
    if (user.organization_id) {
      try {
        await user.populate('organization_id');
        if (user.organization_id.status !== 'active') {
          return res.status(400).json({
            success: false,
            message: 'Organization is inactive'
          });
        }
        orgInfo = user.organization_id;
      } catch (err) {
        console.log('Organization populate failed, using default');
      }
    }

    
    const Configuration = require('../models/Configuration');
    let configuration = await Configuration.findOne({ user: user._id });
    
    let currency = 'PKR';
    if (configuration && configuration.business && configuration.business.currency) {
      currency = configuration.business.currency;
    }

    const token = generateToken(user._id);
    const userAccessiblePages = getUserAccessiblePages(user);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization_id: orgInfo._id,
          organization_name: orgInfo.name,
          accessible_pages: userAccessiblePages
        },
        token,
        currency
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in user login',
      error: error.message
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    const userAccessiblePages = getUserAccessiblePages(user);

    let orgInfo = { _id: 'default', name: 'Default Organization' };
    if (user.organization_id && user.organization_id._id) {
      orgInfo = user.organization_id;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          organization_id: orgInfo._id,
          organization_name: orgInfo.name,
          accessible_pages: userAccessiblePages,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
};

const getUserPermissions = async (req, res) => {
  try {
    const user = req.user;
    const userAccessiblePages = getUserAccessiblePages(user);
    const allAvailablePages = getAllAvailablePages();

    let orgInfo = { _id: 'default', name: 'Default Organization' };
    if (user.organization_id && user.organization_id._id) {
      orgInfo = user.organization_id;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization_id: orgInfo._id,
          organization_name: orgInfo.name
        },
        permissions: {
          accessible_pages: userAccessiblePages,
          all_available_pages: allAvailablePages,
          is_admin: user.role === 'admin'
        }
      }
    });
  } catch (error) {
    console.error('Get user permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user permissions',
      error: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user._id;

    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken by another user'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    );

    const userAccessiblePages = getUserAccessiblePages(user);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          accessible_pages: userAccessiblePages
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};


const assignUserToOrganization = async (req, res) => {
  try {
    const { userId, organizationId } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can assign users to organizations'
      });
    }

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { organization_id: organizationId },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User assigned to organization successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Assign user to organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning user to organization',
      error: error.message
    });
  }
};

const updateUserPermissions = async (req, res) => {
  try {
    const { userId, accessible_pages } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update user permissions'
      });
    }

    const allAvailablePages = getAllAvailablePages();
    const validPages = accessible_pages.filter(page => allAvailablePages.includes(page));

    const user = await User.findByIdAndUpdate(
      userId,
      { accessible_pages: validPages },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User permissions updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          accessible_pages: getUserAccessiblePages(user)
        }
      }
    });
  } catch (error) {
    console.error('Update user permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user permissions',
      error: error.message
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view all users'
      });
    }

    const users = await User.find()
      .select('-password')
      .populate('organization_id', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  getUserPermissions,
  updateProfile,
  changePassword,
  assignUserToOrganization,
  updateUserPermissions,
  getAllUsers
};