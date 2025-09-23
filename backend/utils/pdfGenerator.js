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

    const headerY = 40;
    const logoSize = 60;
    const businessNameX = 120;
    const statusX = 450;

    if (configuration?.business?.logo) {
      try {
        const logoData = configuration.business.logo;
        if (logoData && typeof logoData === 'string' && logoData.includes('base64,')) {
          const base64Data = logoData.replace(/^data:image\/[a-z]+;base64,/, "");
          const logoBuffer = Buffer.from(base64Data, 'base64');
          doc.image(logoBuffer, 40, headerY, { width: logoSize, height: logoSize });
        }
      } catch (error) {
        console.error('Error adding logo to PDF:', error);
        doc.fontSize(10).font('Helvetica').text('[LOGO]', 40, headerY + 25);
      }
    }

    if (configuration?.business?.name) {
      const businessColor = configuration?.business?.nameColor || '#000000';
      doc.fontSize(20).font('Helvetica-Bold').fillColor(businessColor);
      doc.text(configuration.business.name, businessNameX, headerY + 20);
      doc.fillColor('black');
    }

    const status = quotation.status || 'DRAFT';
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#666666');
    doc.text(status.toUpperCase(), statusX, headerY + 20);
    doc.fillColor('black'); 

    doc.moveTo(40, headerY + logoSize + 20).lineTo(555, headerY + logoSize + 20).stroke();

    const startY = headerY + logoSize + 40;
    doc.y = startY;

    doc.fontSize(12).font("Helvetica-Bold").text("Bill To: ", 40, doc.y, { continued: true });
    doc.font("Helvetica").text(quotation.client?.name || "N/A");

    if (quotation.client?.address) {
      doc.moveDown(0.5);
      doc.font("Helvetica-Bold").text("Address: ", 40, doc.y, { continued: true });
      doc.font("Helvetica").text(quotation.client.address);
    }

    // Right side - Quotation details
    const rightX = 350;
    doc.fontSize(12).font("Helvetica-Bold").text("Quotation #:", rightX, startY);
    doc.font("Helvetica").text(quotation.quotationNumber || "QUO-202509-0001", rightX + 80, startY);

    doc.font("Helvetica-Bold").text("Date:", rightX, startY + 20);
    const formattedDate = quotation.date ?
      (typeof quotation.date === 'string' && quotation.date.includes('/') ?
        quotation.date :
        new Date(quotation.date).toLocaleDateString('en-GB')) :
      new Date().toLocaleDateString('en-GB');
    doc.font("Helvetica").text(formattedDate, rightX + 80, startY + 20);

    doc.font("Helvetica-Bold").text("Due Date:", rightX, startY + 40);
    const formattedDueDate = quotation.dueDate ?
      (typeof quotation.dueDate === 'string' && quotation.dueDate.includes('/') ?
        quotation.dueDate :
        new Date(quotation.dueDate).toLocaleDateString('en-GB')) :
      new Date().toLocaleDateString('en-GB');
    doc.font("Helvetica").text(formattedDueDate, rightX + 80, startY + 40);

    // Move to table section
    doc.y = startY + 100;
    doc.moveDown(1);

    // Table with background colors
    const tableStartY = doc.y;
    const tableHeaderHeight = 25;
    const rowHeight = 30;

    // Table header with gray background
    doc.rect(40, tableStartY, 515, tableHeaderHeight).fillAndStroke('#E8E8E8', '#000000');

    // Header text
    doc.fillColor('black').fontSize(11).font('Helvetica-Bold');
    doc.text('Particular', 50, tableStartY + 8);
    doc.text('Size', 250, tableStartY + 8);
    doc.text('Qty', 310, tableStartY + 8);
    doc.text('Rate', 360, tableStartY + 8);
    doc.text('Discount', 420, tableStartY + 8);
    doc.text('Total', 490, tableStartY + 8);

    // Table rows
    let currentRowY = tableStartY + tableHeaderHeight;
    doc.font('Helvetica').fontSize(10);

    quotation.items.forEach((item, index) => {
      const qty = item.quantity || 1;
      const unitPrice = item.unitPrice || 0;
      const discount = item.discountValue > 0 ? item.discountValue + "%" : "-";
      const total = item.totalPrice || 0;

      // Alternate row colors (white and light gray)
      const fillColor = index % 2 === 0 ? '#FFFFFF' : '#F8F8F8';
      doc.rect(40, currentRowY, 515, rowHeight).fillAndStroke(fillColor, '#CCCCCC');

      // Row text
      doc.fillColor('black');
      doc.text(item.product?.name || item.description || "N/A", 50, currentRowY + 10, {
        width: 190,
        ellipsis: true
      });
      doc.text(item.product?.size?.name || "N/A", 250, currentRowY + 10);
      doc.text(String(qty), 310, currentRowY + 10);
      doc.text(String(unitPrice), 360, currentRowY + 10);
      doc.text(discount, 420, currentRowY + 10);
      doc.text(String(total), 490, currentRowY + 10);

      currentRowY += rowHeight;
    });

    // Calculate totals
    const subtotal = quotation.items.reduce((sum, i) => sum + (i.totalPrice || 0), 0);
    const discountValue = quotation.discountValue || 0;
    const taxRate = quotation.taxRate || 0;
    const discountAmount = quotation.discountType === "percentage"
      ? (subtotal * discountValue) / 100
      : discountValue;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * taxRate) / 100;
    const totalAmount = afterDiscount + taxAmount;

    // Summary section (right-aligned) - FIXED ALIGNMENT
    doc.y = currentRowY + 20;
    const summaryStartX = 300;
    const summaryWidth = 255;
    const summaryEndX = summaryStartX + summaryWidth; // Right edge of summary box
    const labelX = summaryStartX + 10;

    // Helper function to calculate right-aligned position
    const getRightAlignedX = (text, rightEdge) => {
      const textWidth = doc.widthOfString(text);
      return rightEdge - textWidth;
    };

    doc.fontSize(11).font('Helvetica-Bold');

    // Gross Amount
    const grossAmountY = doc.y;
    doc.text('Gross Amount:', labelX, grossAmountY);
    const grossAmountText = formatCurrency(subtotal, quotation.currency);
    doc.text(grossAmountText, getRightAlignedX(grossAmountText, summaryEndX - 10), grossAmountY);
    doc.y = grossAmountY + 15;
    // Bottom border line
    doc.moveTo(summaryStartX, doc.y).lineTo(summaryStartX + summaryWidth, doc.y).stroke();
    doc.y += 10;

    // Discount
    const discountY = doc.y;
    doc.text(`Discount: ${discountValue}%`, labelX, discountY);
    const discountAmountText = formatCurrency(discountAmount, quotation.currency);
    doc.text(discountAmountText, getRightAlignedX(discountAmountText, summaryEndX - 10), discountY);
    doc.y = discountY + 15;
    // Bottom border line
    doc.moveTo(summaryStartX, doc.y).lineTo(summaryStartX + summaryWidth, doc.y).stroke();
    doc.y += 10;

    // Tax
    const taxY = doc.y;
    doc.text(`Tax: ${taxRate}%`, labelX, taxY);
    const taxAmountText = formatCurrency(taxAmount, quotation.currency);
    doc.text(taxAmountText, getRightAlignedX(taxAmountText, summaryEndX - 10), taxY);
    doc.y = taxY + 15;
    // Bottom border line
    doc.moveTo(summaryStartX, doc.y).lineTo(summaryStartX + summaryWidth, doc.y).stroke();
    doc.y += 15;

    // Net Amount with background and border
    const netAmountY = doc.y;
    doc.rect(summaryStartX, netAmountY - 5, summaryWidth, 25).fillAndStroke('#E8E8E8', '#000000');
    doc.fillColor('black').font('Helvetica-Bold');
    doc.text('Net Amount:', labelX, netAmountY + 3);
    const netAmountText = formatCurrency(totalAmount, quotation.currency);
    doc.text(netAmountText, getRightAlignedX(netAmountText, summaryEndX - 10), netAmountY + 3);
    doc.y = netAmountY + 25;

    // Currency note
    doc.moveDown(2);
    doc.fontSize(10).font('Helvetica-Oblique');
    doc.text(`All rates are stated in ${quotation.currency || 'PKR'}`, 40, doc.y);

    // Bank Details (only for invoices)
    if (quotation.status === 'invoice' && configuration?.bank) {
      doc.moveDown(1.5);
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Bank Details:', 40, doc.y);
      doc.moveDown(0.5);

      doc.fontSize(10).font('Helvetica');

      if (configuration.bank.name) {
        doc.font('Helvetica-Bold').text('Bank Name: ', 40, doc.y, { continued: true });
        doc.font('Helvetica').text(configuration.bank.name);
        doc.moveDown(0.3);
      }

      if (configuration.bank.accountName) {
        doc.font('Helvetica-Bold').text('Account Name: ', 40, doc.y, { continued: true });
        doc.font('Helvetica').text(configuration.bank.accountName);
        doc.moveDown(0.3);
      }

      if (configuration.bank.accountNumber) {
        doc.font('Helvetica-Bold').text('Account Number: ', 40, doc.y, { continued: true });
        doc.font('Helvetica').text(configuration.bank.accountNumber);
        doc.moveDown(0.3);
      }
    }
    // Terms & Conditions (from configuration)
    if (configuration?.quotation?.terms) {
      doc.moveDown(1.5);
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Terms & Conditions:', 40, doc.y);
      doc.moveDown(0.5);

      doc.fontSize(9).font('Helvetica');
      // Split by newlines to handle multiple terms
      const terms = configuration.quotation.terms.split('\n');
      terms.forEach(term => {
        if (term.trim()) { // Only add non-empty lines
          doc.text(term.trim(), 40, doc.y, {
            width: 500,
            align: 'justify'
          });
          doc.moveDown(0.3);
        }
      });
    }

    // Footer
    doc.y = 740; // Fixed position near bottom

    // Footer top border (HR)
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.5);

    // Footer content
    doc.fontSize(9).font('Helvetica');

    // First line: Mobile | Email | Website
    const firstLine = [
      configuration?.business?.mobileNum,
      configuration?.business?.email,
      configuration?.business?.web
    ].filter(Boolean).join(' | ');

    if (firstLine) {
      doc.text(firstLine, { align: 'center' });
      doc.moveDown(0.3);
    }

    // Second line: Address
    if (configuration?.business?.address) {
      doc.text(configuration.business.address, { align: 'center' });
      doc.moveDown(0.5);
    }

    // Powered by line
    doc.text('Powered by 5cube.io', { align: 'center', link: 'https://5cube.io' })

    doc.end();
  });
};

module.exports = { generatePDFBuffer };