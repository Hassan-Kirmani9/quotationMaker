const PDFDocument = require("pdfkit");

const formatCurrency = (amount, currency = "PKR") => {
  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    PKR: "PKR",
    AED: "د.إ",
    CAD: "C$",
    AUD: "A$",
    JPY: "¥",
    INR: "₹",
    CHF: "Fr",
    SAR: "﷼",
  };
  const symbol = currencySymbols[currency] || currency;
  const numAmount = parseFloat(amount) || 0;
  return `${symbol} ${numAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const generatePDFBuffer = (quotation, configuration) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // Header
    doc
      .fontSize(22)
      .text(configuration?.business?.name || "Business Name", {
        align: "left",
      });
    doc.fontSize(16).text(quotation.status.toUpperCase(), { align: "right" });
    doc.moveDown();

    // Client Info
    doc.fontSize(12).text(`Bill To: ${quotation.client?.name || "N/A"}`);
    if (quotation.client?.address)
      doc.text(`Address: ${quotation.client.address}`);
    if (quotation.client?.email) doc.text(`Email: ${quotation.client.email}`);
    doc.moveDown();

    // Table Header
    doc.fontSize(12).text("Items", { underline: true });
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold");
    doc.text("Product", 40, doc.y, { continued: true });
    doc.text("Size", 200, doc.y, { continued: true });
    doc.text("Qty", 280, doc.y, { continued: true });
    doc.text("Rate", 330, doc.y, { continued: true });
    doc.text("Discount", 400, doc.y, { continued: true });
    doc.text("Total", 480, doc.y);
    doc.font("Helvetica");

    // Items
    quotation.items.forEach((item) => {
      const qty = item.quantity || 1;
      const unitPrice = item.unitPrice || 0;
      doc.text(item.product?.name || item.description || "N/A", 40, doc.y, {
        continued: true,
      });
      doc.text(item.product?.size?.name || "N/A", 200, doc.y, {
        continued: true,
      });
      doc.text(String(qty), 280, doc.y, { continued: true });
      doc.text(String(unitPrice), 330, doc.y, { continued: true });
      doc.text(
        item.discountValue > 0 ? item.discountValue + "%" : "-",
        400,
        doc.y,
        { continued: true }
      );
      doc.text(String(item.totalPrice || 0), 480, doc.y);
    });

    doc.moveDown();

    // Totals
    const subtotal = quotation.items.reduce(
      (sum, i) => sum + (i.totalPrice || 0),
      0
    );
    const discountValue = quotation.discountValue || 0;
    const taxRate = quotation.taxRate || 0;
    const discountAmount =
      quotation.discountType === "percentage"
        ? (subtotal * discountValue) / 100
        : discountValue;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * taxRate) / 100;
    const totalAmount = afterDiscount + taxAmount;

    doc.moveDown();
    doc.text(`Gross Amount: ${formatCurrency(subtotal, quotation.currency)}`, {
      align: "right",
    });
    doc.text(
      `Discount: ${formatCurrency(discountAmount, quotation.currency)}`,
      { align: "right" }
    );
    doc.text(`Tax: ${formatCurrency(taxAmount, quotation.currency)}`, {
      align: "right",
    });
    doc.font("Helvetica-Bold");
    doc.text(`Net Amount: ${formatCurrency(totalAmount, quotation.currency)}`, {
      align: "right",
    });
    doc.font("Helvetica");

    // Footer
    doc.moveDown(2);
    if (configuration?.business?.mobileNum || configuration?.business?.email) {
      doc
        .fontSize(10)
        .text(
          `${configuration.business.mobileNum || ""} | ${
            configuration.business.email || ""
          }`,
          { align: "center" }
        );
    }
    if (configuration?.business?.address) {
      doc.text(configuration.business.address, { align: "center" });
    }

    doc.end();
  });
};

module.exports = { generatePDFBuffer };
