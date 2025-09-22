const Client = require("../models/Client");
const Quotation = require("../models/Quotation");

const listing = async (req, res) => {
  const { page = 1, limit = 50, search } = req.query;

  const query = { user: req.user._id };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { businessName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { city: { $regex: search, $options: "i" } },
    ];
  }

  const clients = await Client.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const total = await Client.countDocuments(query);

  res.json({
    success: true,
    data: {
      clients,
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
  const client = await Client.findById(req.params.id);
  res.json({ success: true, data: client });
};

const create = async (req, res) => {
  const clientData = {
    ...req.body,
    user: req.user._id,
    tenant: req.user.tenant,
  };

  const client = new Client(clientData);
  await client.save();

  res.json({ success: true, message: "Client created successfully" });
};

const update = async (req, res) => {
  await Client.findByIdAndUpdate(req.params.id, {
    ...req.body,
  });

  res.json({ success: true, message: "Client updated successfully" });
};

const remove = async (req, res) => {
  const quotationCount = await Quotation.countDocuments({
    client: req.params.id,
  });

  if (quotationCount > 0) {
    return res.status(400).json({
      success: false,
      message:
        "Cannot delete client with associated quotations. Please delete quotations first.",
    });
  }

  await Client.delete({ _id: req.params.id });

  res.json({
    success: true,
    message: "Client deleted successfully",
  });
};

module.exports = {
  listing,
  get,
  create,
  update,
  remove,
};
