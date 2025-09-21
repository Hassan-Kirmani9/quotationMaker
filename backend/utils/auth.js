const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

const getAllAvailablePages = () => {
  return [
    "dashboard",
    "quotations1",
    "clients",
    "products",
    "sizes",
    "configuration",
  ];
};

const generateUserPermissions = async (id, role) => {
  if (role === "admin") {
    return getAllAvailablePages();
  }

  const user = await User.findById(id).populate("tenant", "configs");

  const pages = user.permissions.concat(user.tenant.configs?.permissions || []);
  return pages;
};

module.exports = {
  generateToken,
  generateUserPermissions,
};
