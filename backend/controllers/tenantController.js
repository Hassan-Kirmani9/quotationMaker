const Tenant = require("../models/Tenant");

const createTenant = async (req, res) => {
  try {
    const { name } = req.body;

    const tenant = new Tenant({
      name,
    });

    await tenant.save();

    res.status(201).json({
      success: true,
      message: "Tenant created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating tenant",
      error: error?.message || error || "Server Error",
    });
  }
};

module.exports = {
  createTenant,
};
