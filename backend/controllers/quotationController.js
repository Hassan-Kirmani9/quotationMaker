const Quotation = require("../models/Quotation");
const Configuration = require("../models/Configuration");
const { generatePDFBuffer } = require("../utils/pdfGenerator");

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
    .select("-items")
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
  const quotation = await Quotation.findById(req.params.id)
    .populate("client")
    .select("-items");

  res.json({
    success: true,
    data: quotation,
  });
};

const getQuotationItems = async (req, res) => {
  const quotation = await Quotation.findById(req.params.id)
    .populate({
      path: "items.product",
      select: "name unit size",
      populate: { path: "size", select: "name" },
    })
    .select("items");

  if (!quotation) {
    return res.status(404).json({
      success: false,
      message: "Quotation not found",
    });
  }

  res.json({
    success: true,
    data: quotation.items,
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
    date,
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
  const defaultCurrency = config?.quotation?.currency;
  const subtotal = processedItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountAmount = (subtotal * (discountValue || 0)) / 100;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * (taxRate || 0)) / 100;
  const totalAmount = afterDiscount + taxAmount;

  const quotationData = {
    client,
    title,
    description,
    date: date || new Date(),
    items: processedItems,
    validUntil: req.body.validUntil,
    discountType: "percentage",
    discountValue: discountValue || 0,
    taxRate: taxRate || 0,
    currency: currency || defaultCurrency,
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
    user: req.user._id,
    tenant: req.user.tenant,
  };

  if (!req.body.validUntil) {
    return res.status(400).json({
      success: false,
      message: "Valid until date is required"
    });
  }

  const validUntilDate = new Date(req.body.validUntil);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (validUntilDate < today) {
    return res.status(400).json({
      success: false,
      message: "Valid until date cannot be in the past"
    });
  }

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
      const quantity = item.quantity || 1;
      const unitPrice = item.unitPrice;
      const itemDiscountValue = item.discountValue || 0;

      const subtotalBeforeDiscount = quantity * unitPrice;
      const itemDiscountAmount = (subtotalBeforeDiscount * itemDiscountValue) / 100;
      const totalPrice = subtotalBeforeDiscount - itemDiscountAmount;

      processedItems.push({
        product: item.product,
        quantity,
        unitPrice,
        discountValue: itemDiscountValue,
        discountAmount: itemDiscountAmount,
        totalPrice,
      });
    }

    const subtotal = processedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const discountAmount = (subtotal * (discountValue || 0)) / 100;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * (taxRate || 0)) / 100;
    const totalAmount = afterDiscount + taxAmount;

    quotation.items = processedItems;
    quotation.subtotal = subtotal;
    quotation.discountAmount = discountAmount;
    quotation.taxAmount = taxAmount;
    quotation.totalAmount = totalAmount;
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
      ? (quotation.quotationNo || "").replace(/^QUO-/, "INV-")
      : (quotation.quotationNo || "QUOTATION");
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
  getQuotationItems,
  create,
  update,
  remove,
  updateStatus,
  generatePDF,
};
