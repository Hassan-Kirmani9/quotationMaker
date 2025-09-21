const Tenant = require("../models/Tenant");

const createTenant = async (req, res) => {
  const { name } = req.body;

  const tenant = new Tenant({
    name,
  });

  await tenant.save();

  res.status(201).json({
    success: true,
    message: "Tenant created successfully",
  });
};

module.exports = {
  createTenant,
};
