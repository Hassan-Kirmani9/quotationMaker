const puppeteer = require("puppeteer");

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

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const buildQuotationHTML = (quotation, configuration, totals) => {
  const {
    subtotal,
    discountValue,
    discountAmount,
    taxRate,
    taxAmount,
    totalAmount,
  } = totals;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px 20px 80px 20px; color: #333; }
        .footer-section { position: fixed; bottom: 20px; left: 20px; right: 20px; padding-top: 20px; border-top: 1px solid #ddd; background: white; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
        .logo { max-width: 120px; max-height: 80px; }
        .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        .items-table th { background-color: #f5f5f5; padding: 12px; border-bottom: 2px solid #ddd; font-weight: bold; text-align: left; }
        .items-table td { padding: 10px 12px; border-bottom: 1px solid #eee; }
        .items-table .text-right { text-align: right; }
        .items-table .text-center { text-align: center; }
        .totals-section { margin-top: 30px; display: flex; justify-content: flex-end; }
        .totals-table { width: 300px; }
        .totals-table tr td { padding: 8px 12px; border-bottom: 1px solid #eee; }
        .totals-table .total-row { font-weight: bold; font-size: 16px; border-top: 2px solid #333; }
      </style>
    </head>
    <body>
      <div class="header">
        ${
          configuration?.business?.logo
            ? `<img src="${configuration.business.logo}" class="logo" />`
            : ""
        }
        <div style="font-size: 32px; font-weight: bold;">${quotation.status.toUpperCase()}</div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Particular</th>
            <th class="text-center">Size</th>
            <th class="text-center">Qty</th>
            <th class="text-right">Rate</th>
            <th class="text-center">Discount</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${quotation.items
            .map((item) => {
              const quantity = item.quantity || 1;
              const unitPrice = item.unitPrice || 0;
              return `
                <tr>
                  <td>${item.product?.name || item.description || "N/A"}</td>
                  <td class="text-center">${
                    item.product?.size?.name || "N/A"
                  }</td>
                  <td class="text-center">${quantity}</td>
                  <td class="text-right">${unitPrice}</td>
                  <td class="text-center">${
                    item.discountValue > 0 ? item.discountValue + "%" : "-"
                  }</td>
                  <td class="text-right">${item.totalPrice || 0}</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>

      <div class="totals-section">
        <table class="totals-table">
          <tr><td><strong>Gross Amount:</strong></td><td class="text-right">${formatCurrency(
            subtotal,
            quotation.currency
          )}</td></tr>
          <tr><td><strong>Discount:</strong></td><td class="text-right">${formatCurrency(
            discountAmount,
            quotation.currency
          )}</td></tr>
          <tr><td><strong>Tax:</strong></td><td class="text-right">${formatCurrency(
            taxAmount,
            quotation.currency
          )}</td></tr>
          <tr class="total-row"><td><strong>Net Amount:</strong></td><td class="text-right">${formatCurrency(
            totalAmount,
            quotation.currency
          )}</td></tr>
        </table>
      </div>
    </body>
    </html>
  `;
};

const generatePDFBuffer = async (quotation, configuration) => {
  const subtotal = quotation.items.reduce(
    (sum, item) => sum + (item.totalPrice || 0),
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

  const htmlTemplate = buildQuotationHTML(quotation, configuration, {
    subtotal,
    discountValue,
    discountAmount,
    taxRate,
    taxAmount,
    totalAmount,
  });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(htmlTemplate, { waitUntil: "networkidle0" });
  const pdf = await page.pdf({ format: "A4", printBackground: true });
  await browser.close();

  return pdf;
};

module.exports = { generatePDFBuffer };
