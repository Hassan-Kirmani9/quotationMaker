const Configuration = require('../models/Configuration');


const getConfiguration = async (req, res) => {
  try {
    let configuration = await Configuration.findOne({ user: req.user._id });

    if (!configuration) {

      configuration = new Configuration({
        user: req.user._id,
        quotation: {
          validity: 30,
          prefix: 'QUO'
        }
      });
      await configuration.save();
    }

    res.json({
      success: true,
      data: { configuration }
    });
  } catch (error) {
    console.error('Get configuration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching configuration',
      error: error.message
    });
  }
};


const updateConfiguration = async (req, res) => {
  try {
    let configuration = await Configuration.findOne({ user: req.user._id });


    if (req.body.business && req.body.business.logo) {
      const base64Data = req.body.business.logo.replace(/^data:image\/[a-z]+;base64,/, '');
      const sizeInBytes = (base64Data.length * 3) / 4;
      if (sizeInBytes > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'Logo image size must be less than 5MB'
        });
      }
    }

    if (!configuration) {

      configuration = new Configuration({
        ...req.body,
        user: req.user._id
      });
    } else {

      Object.assign(configuration, req.body);
    }

    await configuration.save();

    res.json({
      success: true,
      message: 'Configuration updated successfully',
      data: { configuration }
    });
  } catch (error) {
    console.error('Update configuration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating configuration',
      error: error.message
    });
  }
};


const resetConfiguration = async (req, res) => {
  try {
    const configuration = await Configuration.findOneAndUpdate(
      { user: req.user._id },
      {
        bank: {
          name: '',
          accountName: '',
          accountNumber: '',
        },
        business: {
          name: '',
          address: '',
          mobileNum: '',
          businessNum: '',
          email: '',
          web: '',
          logo: '',
          taxId: ''
        },
        quotation: {
          validity: 30,
          terms: '',
          prefix: 'QUO'
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Configuration reset to defaults',
      data: { configuration }
    });
  } catch (error) {
    console.error('Reset configuration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting configuration',
      error: error.message
    });
  }
};

const uploadLogo = async (req, res) => {
  try {
    const { logoBase64 } = req.body;

    if (!logoBase64) {
      return res.status(400).json({
        success: false,
        message: 'No logo data provided'
      });
    }

    if (!logoBase64.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image format'
      });
    }

    const base64Data = logoBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const sizeInBytes = (base64Data.length * 3) / 4;
    if (sizeInBytes > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Logo image size must be less than 5MB'
      });
    }

    let configuration = await Configuration.findOne({ user: req.user._id });

    if (!configuration) {
      configuration = new Configuration({
        user: req.user._id,
        business: { logo: logoBase64 },
        quotation: {
          validity: 30,
          prefix: 'QUO'
        }
      });
    } else {
      if (!configuration.business) {
        configuration.business = {};
      }
      configuration.business.logo = logoBase64;
    }

    await configuration.save();

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      logoUrl: logoBase64
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading logo',
      error: error.message
    });
  }
};

module.exports = {
  getConfiguration,
  updateConfiguration,
  resetConfiguration,
  uploadLogo
};
