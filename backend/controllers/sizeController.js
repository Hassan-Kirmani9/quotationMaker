const Size = require("../models/Size");

const listing = async (req, res) => {
  const { page = 1, limit = 50, search } = req.query;

  const query = { user: req.user._id };

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
};

const get = async (req, res) => {
  const size = await Size.findById(req.params.id);

  res.json({
    success: true,
    data: size,
  });
};

const create = async (req, res) => {
  const size = new Size({
    name: req.body.name,
    user: req.user._id,
    tenant: req.user.tenant,
  });
  await size.save();

  res.status(201).json({
    success: true,
    message: "Size created successfully",
  });
};

const update = async (req, res) => {
  await Size.findByIdAndUpdate(req.params.id, req.body);

  res.json({
    success: true,
    message: "Size updated successfully",
  });
};

const remove = async (req, res) => {
  await Size.delete({ _id: req.params.id });

  res.json({
    success: true,
    message: "Size deleted successfully",
  });
};

module.exports = {
  listing,
  get,
  create,
  update,
  remove,
};
