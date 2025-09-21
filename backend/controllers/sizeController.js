const Size = require("../models/Size");

const getSizes = async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const userId = req.user._id;

    const query = { user: userId };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const sizes = await Size.find(query)
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Size.countDocuments(query);

    res.json({
      success: true,
      data: {
        sizes,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / limit),
          total,
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching sizes",
      error: error?.message || "Server Error",
    });
  }
};

const getAllSizes = async (req, res) => {
  try {
    const sizes = await Size.find({ user: req.user._id }).sort({ name: 1 });

    res.json({
      success: true,
      data: sizes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching sizes",
      error: error?.message || "Server Error",
    });
  }
};

const getSize = async (req, res) => {
  try {
    const size = await Size.findById(req.params.id);

    res.json({
      success: true,
      data: size,
    });
  } catch (error) {
    console.error("Get size error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching size",
      error: error.message,
    });
  }
};

const createSize = async (req, res) => {
  try {
    const size = new Size({
      name: req.body["name"],
      user: req.user._id,
      tenant: req.user.tenant,
    });
    await size.save();

    res.status(201).json({
      success: true,
      message: "Size created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating size",
      error: error?.message || "Server Error",
    });
  }
};

const updateSize = async (req, res) => {
  try {
    await Size.findByIdAndUpdate(req.user.id, req.body);

    res.json({
      success: true,
      message: "Size updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating size",
      error: error?.message || "Server Error",
    });
  }
};

const deleteSize = async (req, res) => {
  try {
    await Size.findByIdAndDelete(req.user.id);

    res.json({
      success: true,
      message: "Size deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting size",
      error: error?.message || "Server Error",
    });
  }
};

module.exports = {
  getSizes,
  getAllSizes,
  getSize,
  createSize,
  updateSize,
  deleteSize,
};
