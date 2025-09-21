const User = require("../models/User");
const { generateToken, generateUserPermissions } = require("../utils/auth");

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const user = new User({
    name,
    email,
    password,
  });

  await user.save();

  res.status(201).json({
    success: true,
    message: "User registered successfully",
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  if (!user.isActive) {
    return res.status(400).json({
      success: false,
      message: "Account is inactive",
    });
  }

  const token = generateToken(user._id);

  res.json({
    success: true,
    message: "Login successful",
    data: {
      id: user._id,
      email: user.email,
      token,
    },
  });
};

const me = async (req, res) => {
  const user = req.user;
  const permissions = await generateUserPermissions(user.id, user.role);

  const dbUser = await User.findById(user.id).populate("tenant");
  dbUser["permissions"] = permissions;

  res.json({
    success: true,
    data: dbUser,
    message: "User data fetched successfully",
  });
};

const updateProfile = async (req, res) => {
  const { name } = req.body;

  await User.findByIdAndUpdate(req.user._id, { name });

  res.json({
    success: true,
    message: "Profile updated successfully",
  });
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      message: "New password must be different from current password",
    });
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: "Password changed successfully",
  });
};

module.exports = {
  registerUser,
  loginUser,
  me,
  updateProfile,
  changePassword,
};
