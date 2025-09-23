const Configuration = require("../models/Configuration");

const get = async (req, res) => {
  let configuration = await Configuration.findOne({ user: req.user._id });
  res.json({ success: true, data: configuration });
};

const update = async (req, res) => {
  let configuration = await Configuration.findOne({ user: req.user._id });

  if (req.body.business && req.body.business.logo) {
    const base64Data = req.body.business.logo.replace(
      /^data:image\/[a-z]+;base64,/,
      ""
    );
    const sizeInBytes = (base64Data.length * 3) / 4;
    if (sizeInBytes > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "Logo image size must be less than 5MB",
      });
    }
  }

  if (!configuration) {
    configuration = new Configuration({
      ...req.body,
      user: req.user._id,
    });
  } else {
    Object.assign(configuration, req.body);
  }

  await configuration.save();

  res.json({
    success: true,
    message: "Configuration updated successfully",
    data: { configuration },
  });
};

const uploadLogo = async (req, res) => {
  const { logoBase64 } = req.body;

  if (!logoBase64) {
    return res.status(400).json({
      success: false,
      message: "No logo data provided",
    });
  }

  if (!logoBase64.startsWith("data:image/")) {
    return res.status(400).json({
      success: false,
      message: "Invalid image format",
    });
  }

  const base64Data = logoBase64.replace(/^data:image\/[a-z]+;base64,/, "");
  const sizeInBytes = (base64Data.length * 3) / 4;
  if (sizeInBytes > 5 * 1024 * 1024) {
    return res.status(400).json({
      success: false,
      message: "Logo image size must be less than 5MB",
    });
  }

  let configuration = await Configuration.findOne({ user: req.user._id });
  configuration.business.logo = logoBase64;
  await configuration.save();

  res.json({
    success: true,
    message: "Logo uploaded successfully",
    logoUrl: logoBase64
  });
};

module.exports = {
  get,
  update,
  uploadLogo,
};
