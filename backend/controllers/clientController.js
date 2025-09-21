const Client = require("../models/Client");
const Quotation = require("../models/Quotation");

const listing = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching clients",
      error: error?.message || "Server Error",
    });
  }
};

const get = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    res.json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching client",
      error: error?.message || "Server Error",
    });
  }
};

const create = async (req, res) => {
  try {
    const clientData = {
      ...req.body,
      user: req.user._id,
      tenant: req.user.tenant,
    };

    const client = new Client(clientData);
    await client.save();

    res.json({ success: true, message: "Client created successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating client",
      error: error?.message || "Server Error",
    });
  }
};

const update = async (req, res) => {
  try {
    await Client.findByIdAndUpdate(req.params.id, {
      ...req.body,
    });

    res.json({ success: true, message: "Client updated successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating client",
      error: error?.message || "Server Error",
    });
  }
};

const remove = async (req, res) => {
  try {
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

    await Client.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting client",
      error: error?.message || "Server Error",
    });
  }
};

module.exports = {
  listing,
  get,
  create,
  update,
  remove,
};
