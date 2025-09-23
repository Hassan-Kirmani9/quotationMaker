const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

const verifyToken = (token) => {
  try {
    const access_token = token.replace("Bearer ", "");
    decoded = jwt.verify(access_token, process.env.JWT_SECRET);
    return decoded;
  } catch {
    return false;
  }
};

const getAllAvailablePages = () => {
  return [
    "dashboard",
    "quotations",
    "/catering-quotations",
    "clients",
    "products",
    "sizes",
    "configuration",
  ];
};

const generateUserPermissions = async (id, role) => {
  if (role === "admin") {
    return getAllAvailablePages().map(page => `/${page}`); // Add slash prefix for all
  }

  const user = await User.findById(id).populate("tenant", "configs");

  const userPermissions = user.permissions || [];
  const tenantPermissions = user.tenant?.configs?.permissions || [];

  const allPermissions = [...userPermissions, ...tenantPermissions];

  const normalizedPermissions = allPermissions.map(permission => {
    return permission.startsWith('/') ? permission : `/${permission}`;
  });

  return [...new Set(normalizedPermissions)];
};
module.exports = {
  generateToken,
  generateUserPermissions,
  verifyToken,
};
