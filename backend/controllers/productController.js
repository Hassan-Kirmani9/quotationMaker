const Product = require("../models/Product");
const Quotation = require("../models/Quotation");

const listing = async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;

  const query = { user: req.user._id };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const products = await Product.find(query)
    .populate("size", "name")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Product.countDocuments(query);

  res.json({
    success: true,
    data: {
      products,
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
  const product = await Product.findById(req.params.id).populate(
    "size",
    "name"
  );

  res.json({
    success: true,
    data: product,
  });
};

const create = async (req, res) => {
  const product = new Product({
    ...req.body,
    user: req.user._id,
    tenant: req.user.tenant,
  });
  await product.save();

  res.status(201).json({
    success: true,
    message: "Product created successfully",
  });
};

const update = async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, { ...req.body });

  res.json({
    success: true,
    message: "Product updated successfully",
  });
};

const remove = async (req, res) => {
  const quotationItemsCount = await Quotation.countDocuments({
    "items.product": req.params.id,
  });

  if (quotationItemsCount > 0) {
    return res.status(400).json({
      success: false,
      message:
        "Cannot delete product used in quotations. Please remove from quotations first.",
    });
  }

  await Product.delete({ _id: req.params.id });

  res.json({
    success: true,
    message: "Product deleted successfully",
  });
};

module.exports = {
  listing,
  get,
  create,
  update,
  remove,
};
