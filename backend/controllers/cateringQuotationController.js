const CateringQuotation = require("../models/CateringQuotation");
const Configuration = require("../models/Configuration");
const {generateCateringPDFBuffer} = require("../utils/cateringPdfGenerator");

const listing = async (req, res) => {
  const { page = 1, limit = 10, status, client } = req.query;

  const query = { user: req.user._id };

  if (status) query.status = status;
  if (client) query.client = client;

  const quotations = await CateringQuotation.find(query)
    .populate("client", "name")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await CateringQuotation.countDocuments(query);

  res.json({
    success: true,
    data: {
      quotations,
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
  const quotation = await CateringQuotation.findById(req.params.id).populate(
    "client"
  );

  if (!quotation) {
    return res.status(404).json({
      success: false,
      message: "Catering Quotation not found",
    });
  }

  res.json({
    success: true,
    data: quotation,
  });
};

const create = async (req, res) => {
  const { client, menu, extras, others, costing, status } = req.body;

  const quotationData = {
    client,
    menu,
    extras,
    others,
    costing,
    user: req.user._id,
    tenant: req.user.tenant,
  };

  const quotation = new CateringQuotation(quotationData);
  await quotation.save();

  res.status(201).json({
    success: true,
    message: "Catering Quotation created successfully",
  });
};

const update = async (req, res) => {
  const quotation = await CateringQuotation.findById(req.params.id);

  Object.assign(quotation, req.body);
  await quotation.save();

  res.json({
    success: true,
    message: "CateringQuotation updated successfully",
  });
};

const remove = async (req, res) => {
  await CateringQuotation.delete({ _id: req.params.id });

  res.json({
    success: true,
    message: "CateringQuotation deleted successfully",
  });
};

const updateStatus = async (req, res) => {
  const { status } = req.body;

  await CateringQuotation.findByIdAndUpdate(req.params.id, {
    status,
  });

  res.json({
    success: true,
    message: `Successfully converted to ${status}`,
  });
};

const generatePDF = async (req, res) => {
  try {
    
    const quotation = await CateringQuotation.findById(req.params.id).populate("client");
    
    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Catering Quotation not found",
      });
    }


    const configuration = await Configuration.findOne({ user: req.user._id });

    const pdfBuffer = await generateCateringPDFBuffer(quotation, configuration);

    const displayNumber = `CQ-${quotation._id.toString().slice(-8).toUpperCase()}`;
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${displayNumber}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to generate PDF",
      error: error.message
    });
  }
};

module.exports = {
  listing,
  get,
  create,
  update,
  remove,
  updateStatus,
  generatePDF,
};