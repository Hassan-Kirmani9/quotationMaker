const Quotation = require("../models/Quotation");
const Configuration = require("../models/Configuration");
const generatePDFBuffer = require("../utils/pdfGenerator");

const listing = async (req, res) => {
  const { page = 1, limit = 10, search, status, client } = req.query;

  const query = { user: req.user._id };

  if (search) {
    query.$or = [
      { quotationNo: { $regex: search, $options: "i" } },
      { title: { $regex: search, $options: "i" } },
    ];
  }

  if (status) query.status = status;
  if (client) query.client = client;

  const quotations = await Quotation.find(query)
    .populate("client", "name")
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Quotation.countDocuments(query);

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
  const quotation = await Quotation.findById(req.params.id).populate("client");

  res.json({
    success: true,
    data: quotation,
  });
};

const create = async (req, res) => {
  const {
    client,
    title,
    description,
    items,
    discountValue,
    taxRate,
    currency,
  } = req.body;

  const processedItems = [];
  for (const item of items) {
    const quantity = item.quantity || 1;
    const unitPrice = item.unitPrice;
    const itemDiscountValue = item.discountValue || 0;
    const itemDiscountType = item.discountType || "percentage";

    const subtotalBeforeDiscount = quantity * unitPrice;
    const itemDiscountAmount =
      itemDiscountType === "percentage"
        ? (subtotalBeforeDiscount * itemDiscountValue) / 100
        : itemDiscountValue;
    const totalPrice = subtotalBeforeDiscount - itemDiscountAmount;

    processedItems.push({
      product: item.product,
      quantity,
      unitPrice,
      discountType: itemDiscountType,
      discountValue: itemDiscountValue,
      discountAmount: itemDiscountAmount,
      totalPrice,
    });
  }

  const config = await Configuration.findOne({ user: req.user._id });
  const validityDays = config?.quotation?.validity;
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + validityDays);
  const defaultCurrency = config?.quotation?.currency;

  const quotationData = {
    client,
    title,
    description,
    items: processedItems,
    validUntil,
    discountType: "percentage",
    discountValue: discountValue || 0,
    taxRate: taxRate || 0,
    currency: currency || defaultCurrency,
    user: req.user._id,
    tenant: req.user.tenant,
  };

  const quotation = new Quotation(quotationData);
  await quotation.save();

  res.status(201).json({
    success: true,
    message: "Quotation created successfully",
  });
};

const update = async (req, res) => {
  const { items, discountValue, taxRate, ...otherUpdates } = req.body;

  const quotation = await Quotation.findById(req.params.id);

  if (items) {
    const processedItems = [];
    for (const item of items) {
      processedItems.push({
        product: item.product,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice,
        totalPrice: (item.quantity || 1) * item.unitPrice,
      });
    }
    quotation.items = processedItems;
  }

  Object.assign(quotation, otherUpdates);

  quotation.discountType = "percentage";
  if (discountValue !== undefined) quotation.discountValue = discountValue;
  if (taxRate !== undefined) quotation.taxRate = taxRate;

  await quotation.save();

  res.json({
    success: true,
    message: "Quotation updated successfully",
  });
};

const remove = async (req, res) => {
  await Quotation.delete({ _id: req.params.id });

  res.json({
    success: true,
    message: "Quotation deleted successfully",
  });
};

const updateStatus = async (req, res) => {
  const { status } = req.body;

  await Quotation.findByIdAndUpdate(req.params.id, {
    status,
  });

  res.json({
    success: true,
    message: `Successfully converted to ${status}`,
  });
};

const generatePDF = async (req, res) => {
  const quotation = await Quotation.findById(req.params.id)
    .populate("client")
    .populate({
      path: "items.product",
      select: "name unit size",
      populate: { path: "size", select: "name" },
    });

  const configuration = await Configuration.findOne({ user: req.user._id });
  const pdfBuffer = await generatePDFBuffer(quotation, configuration);

  const displayNumber =
    quotation.status === "invoice"
      ? quotation.quotationNo.replace(/^QUO-/, "INV-")
      : quotation.quotationNo;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${displayNumber}.pdf"`
  );
  res.send(pdfBuffer);
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
