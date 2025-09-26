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

const generateCateringPDFBuffer = (quotation, configuration) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      font: "Helvetica"
    });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // Header section - Business Name and Logos
    const pageWidth = 515; // A4 width minus margins
    const headerY = 40;

    // Replace the logo section with this:
    // Left Logo only - bigger and moved left
    if (configuration?.business?.logo) {
      try {
        const logoData = configuration.business.logo;
        if (logoData && typeof logoData === 'string' && logoData.includes('base64,')) {
          const base64Data = logoData.replace(/^data:image\/[a-z]+;base64,/, "");
          const logoBuffer = Buffer.from(base64Data, 'base64');
          // Increase size from 80 to 100 and move left by changing position from 40 to 30
          doc.image(logoBuffer, 30, headerY, { width: 100 });
        }
      } catch (error) {
        console.error('Error adding logo to PDF:', error);
      }
    }

    // Business Name in center (service name removed)
    const businessName = configuration?.business?.name || '';

    doc.fontSize(24).font('Helvetica-Bold').fillColor(configuration?.business?.nameColor || '#2a4065');
    const businessNameWidth = doc.widthOfString(businessName);
    const centerX = 40 + (pageWidth - businessNameWidth) / 2;
    doc.text(businessName, centerX, headerY + 15);
    doc.fillColor('black');

    // Move address and contact details to header
    // Address
    // Replace the address section in the header with this:
    // Address
    if (configuration?.business?.address) {
      doc.fontSize(9).font('Helvetica');
      // Calculate a narrower width for the address
      const addressWidth = Math.min(300, pageWidth); // Limit width to 400 points
      const addressCenterX = 40 + (pageWidth - addressWidth) / 2;
      doc.text(configuration.business.address, addressCenterX, doc.y, {
        width: addressWidth,
        align: 'center'
      });
      doc.moveDown(0.3);
    }

    // And modify the contact line to format like in the image:
    // Replace the contact information section with this:
    // Contact Information (phone and email on first line, web on second line)
    if (configuration?.business?.mobileNum || configuration?.business?.email || configuration?.business?.web) {
      // First line for phone and email
      const firstLineParts = [];

      if (configuration?.business?.mobileNum) {
        firstLineParts.push(configuration.business.mobileNum);
      }

      if (configuration?.business?.email) {
        firstLineParts.push(configuration.business.email);
      }

      const firstLine = firstLineParts.join(' | ');

      if (firstLine) {
        const contactWidth = Math.min(400, pageWidth);
        const contactCenterX = 40 + (pageWidth - contactWidth) / 2;
        doc.text(firstLine, contactCenterX, doc.y, {
          width: contactWidth,
          align: 'center'
        });
      }

      // Second line just for website
      if (configuration?.business?.web) {
        const webWidth = Math.min(400, pageWidth);
        const webCenterX = 40 + (pageWidth - webWidth) / 2;
        doc.text(configuration.business.web, webCenterX, doc.y, {
          width: webWidth,
          align: 'center'
        });
      }
    }
    // Add spacing adjustment after header
    doc.moveDown(0.75);

    // Move to the billing information section
    doc.moveDown(1);

    // Left side - Bill To section
    const billToY = doc.y;

    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Bill To,', 40, billToY);
    doc.font('Helvetica-Bold');
    doc.fontSize(16);
    doc.text(quotation.client?.name || '', 40, doc.y + 5);

    // Venue information if available
    if (quotation.venue) {
      doc.fontSize(10).font('Helvetica');
      doc.text(`Venue: ${quotation.venue}`, 40, doc.y + 5);
    }

    // Right side - Bill # and date
    // Use a more reliable ID extraction that doesn't assume specific length
    const quotationId = quotation._id ? quotation._id.toString() : '';
    const billNumberText = `BILL # ${quotationId.slice(-4).padStart(4, '0')}`;

    doc.fontSize(12).font('Helvetica-Bold');
    doc.text(billNumberText, 375, billToY, { align: 'right' });

    const formattedDate = quotation.createdAt ?
      new Date(quotation.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/') :
      new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/');

    doc.text(`BILL DATE: ${formattedDate}`, 375, doc.y + 5, { align: 'right' });

    // Move to main content section
    doc.moveDown(2);

    // Define table layout
    const tableX = 40;
    const tableWidth = pageWidth;
    const tableY = doc.y;
    const rowHeight = 20; // Reduced from 25 to 20 to make rows more compact

    // Column widths
    const srNoWidth = 60;
    const particularsWidth = 355;
    const amountWidth = 100;

    // Fixed position for amount column
    const amountColumnX = tableX + srNoWidth + particularsWidth;

    // Color definitions
    const headerBlue = '#b3c6e7';
    const sectionBlue = '#d9e1f2';
    const totalRowBlue = '#d9e1f2';

    // Currency symbol
    const currencySymbol = quotation.currency || configuration?.business?.currency || 'PKR';

    // Draw table outline first
    doc.rect(tableX, tableY, tableWidth, rowHeight).stroke();

    // Table header text
    doc.fillColor(headerBlue)
      .rect(tableX, tableY, tableWidth, rowHeight)
      .fill();

    doc.fillColor('black').fontSize(12).font('Helvetica-Bold');
    doc.text('Sr.No', tableX + 5, tableY + 6);
    doc.text('Particular\'s', tableX + srNoWidth + 10, tableY + 6);
    doc.text('Amount', amountColumnX + 10, tableY + 6);

    // Draw column dividers in header
    doc.moveTo(tableX + srNoWidth, tableY)
      .lineTo(tableX + srNoWidth, tableY + rowHeight)
      .stroke();

    doc.moveTo(amountColumnX, tableY)
      .lineTo(amountColumnX, tableY + rowHeight)
      .stroke();

    // Start for content rows
    let currentY = tableY + rowHeight;

    // Menu Section header
    doc.fillColor(sectionBlue)
      .rect(tableX, currentY, tableWidth, rowHeight)
      .fill();

    // Draw outer border for section header but NO INNER BORDERS
    doc.rect(tableX, currentY, tableWidth, rowHeight).stroke();

    doc.fillColor('black').fontSize(10).font('Helvetica-Bold');
    doc.text('A) Menu', tableX + 5, currentY + 6);
    currentY += rowHeight;

    // Menu items
    if (quotation.menu && quotation.menu.items) {
      quotation.menu.items.forEach((item, index) => {
        // White background for all rows
        doc.fillColor('#ffffff')
          .rect(tableX, currentY, tableWidth, rowHeight)
          .fill();

        // Draw cell borders
        doc.rect(tableX, currentY, tableWidth, rowHeight).stroke();
        doc.moveTo(tableX + srNoWidth, currentY)
          .lineTo(tableX + srNoWidth, currentY + rowHeight)
          .stroke();
        doc.moveTo(amountColumnX, currentY)
          .lineTo(amountColumnX, currentY + rowHeight)
          .stroke();

        // Cell content
        doc.fillColor('black').fontSize(10).font('Helvetica');
        doc.text((index + 1).toString(), tableX + 5, currentY + 6);
        doc.text(item.name || '', tableX + srNoWidth + 10, currentY + 6);

        // Always show '-' for menu item amounts
        doc.text('-', amountColumnX + 10, currentY + 6);
        currentY += rowHeight;
      });
    }

    // Menu Total Row - BLUE BACKGROUND
    doc.fillColor(totalRowBlue)
      .rect(tableX, currentY, tableWidth, rowHeight)
      .fill();

    // Draw cell borders
    doc.rect(tableX, currentY, tableWidth, rowHeight).stroke();
    doc.moveTo(tableX + srNoWidth, currentY)
      .lineTo(tableX + srNoWidth, currentY + rowHeight)
      .stroke();
    doc.moveTo(amountColumnX, currentY)
      .lineTo(amountColumnX, currentY + rowHeight)
      .stroke();

    doc.fillColor('black').fontSize(10).font('Helvetica-Bold');
    const perThaalRate = parseFloat(quotation.menu?.perThaalRate || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    const numberOfThaals = quotation.menu?.numberOfThaals || 0;

    doc.text(`${currencySymbol} ${perThaalRate} = Per Thaal x ${numberOfThaals} Thaal`, tableX + srNoWidth + 10, currentY + 6);

    // Format menu total with currency symbol
    const menuTotal = formatCurrency(quotation.menu?.total || 0, currencySymbol);
    doc.text(menuTotal, amountColumnX + 10, currentY + 6);

    currentY += rowHeight;

    // Extras Section
    if (quotation.extras && quotation.extras.items && quotation.extras.items.length > 0) {
      // Extras header background
      doc.fillColor(sectionBlue)
        .rect(tableX, currentY, tableWidth, rowHeight)
        .fill();

      // Draw outer border for section header but NO INNER BORDERS
      doc.rect(tableX, currentY, tableWidth, rowHeight).stroke();

      doc.fillColor('black').fontSize(10).font('Helvetica-Bold');
      doc.text('B) Extra\'s', tableX + 5, currentY + 6);
      currentY += rowHeight;

      // Extras items
      quotation.extras.items.forEach((item, index) => {
        // White background for all rows
        doc.fillColor('#ffffff')
          .rect(tableX, currentY, tableWidth, rowHeight)
          .fill();

        // Draw cell borders
        doc.rect(tableX, currentY, tableWidth, rowHeight).stroke();
        doc.moveTo(tableX + srNoWidth, currentY)
          .lineTo(tableX + srNoWidth, currentY + rowHeight)
          .stroke();
        doc.moveTo(amountColumnX, currentY)
          .lineTo(amountColumnX, currentY + rowHeight)
          .stroke();

        // Cell content
        doc.fillColor('black').fontSize(10).font('Helvetica');
        doc.text((index + 1).toString(), tableX + 5, currentY + 6);
        doc.text(item.name || '', tableX + srNoWidth + 10, currentY + 6);

        // Amount formatting with LEFT alignment for regular items
        const amount = item.amount ? parseFloat(item.amount).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) : '-';

        doc.text(amount, amountColumnX + 10, currentY + 6);
        currentY += rowHeight;
      });

      // Extras Total - BLUE BACKGROUND
      doc.fillColor(totalRowBlue)
        .rect(tableX, currentY, tableWidth, rowHeight)
        .fill();

      // Draw cell borders
      doc.rect(tableX, currentY, tableWidth, rowHeight).stroke();
      doc.moveTo(tableX + srNoWidth, currentY)
        .lineTo(tableX + srNoWidth, currentY + rowHeight)
        .stroke();
      doc.moveTo(amountColumnX, currentY)
        .lineTo(amountColumnX, currentY + rowHeight)
        .stroke();

      doc.fillColor('black').fontSize(10).font('Helvetica-Bold');
      doc.text('Total Extra\'s', tableX + srNoWidth + 10, currentY + 6);

      // Format extras total with currency symbol
      const extrasTotal = formatCurrency(quotation.extras.total || 0, currencySymbol);
      doc.text(extrasTotal, amountColumnX + 10, currentY + 6);

      currentY += rowHeight;
    }

    // Others Section
    if (quotation.others && quotation.others.items && quotation.others.items.length > 0) {
      // Others header background
      doc.fillColor(sectionBlue)
        .rect(tableX, currentY, tableWidth, rowHeight)
        .fill();

      // Draw outer border for section header but NO INNER BORDERS
      doc.rect(tableX, currentY, tableWidth, rowHeight).stroke();

      doc.fillColor('black').fontSize(10).font('Helvetica-Bold');
      doc.text('C) Other\'s', tableX + 5, currentY + 6);
      currentY += rowHeight;

      // Others items
      quotation.others.items.forEach((item, index) => {
        // White background for all rows
        doc.fillColor('#ffffff')
          .rect(tableX, currentY, tableWidth, rowHeight)
          .fill();

        // Draw cell borders
        doc.rect(tableX, currentY, tableWidth, rowHeight).stroke();
        doc.moveTo(tableX + srNoWidth, currentY)
          .lineTo(tableX + srNoWidth, currentY + rowHeight)
          .stroke();
        doc.moveTo(amountColumnX, currentY)
          .lineTo(amountColumnX, currentY + rowHeight)
          .stroke();

        // Cell content
        doc.fillColor('black').fontSize(10).font('Helvetica');
        doc.text((index + 1).toString(), tableX + 5, currentY + 6);
        doc.text(item.name || '', tableX + srNoWidth + 10, currentY + 6);

        // Amount formatting with LEFT alignment for regular items
        const amount = item.amount ? parseFloat(item.amount).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) : '-';

        doc.text(amount, amountColumnX + 10, currentY + 6);
        currentY += rowHeight;
      });

      // Others Total - BLUE BACKGROUND
      doc.fillColor(totalRowBlue)
        .rect(tableX, currentY, tableWidth, rowHeight)
        .fill();

      // Draw cell borders
      doc.rect(tableX, currentY, tableWidth, rowHeight).stroke();
      doc.moveTo(tableX + srNoWidth, currentY)
        .lineTo(tableX + srNoWidth, currentY + rowHeight)
        .stroke();
      doc.moveTo(amountColumnX, currentY)
        .lineTo(amountColumnX, currentY + rowHeight)
        .stroke();

      doc.fillColor('black').fontSize(10).font('Helvetica-Bold');
      doc.text('Total Other\'s', tableX + srNoWidth + 10, currentY + 6);

      // Format others total with currency symbol
      const othersTotal = formatCurrency(quotation.others.total || 0, currencySymbol);
      doc.text(othersTotal, amountColumnX + 10, currentY + 6);

      currentY += rowHeight;
    }

    // Costing Section
    // Costing header background
    doc.fillColor(sectionBlue)
      .rect(tableX, currentY, tableWidth, rowHeight)
      .fill();

    // Draw outer border for section header but NO INNER BORDERS
    doc.rect(tableX, currentY, tableWidth, rowHeight).stroke();

    doc.fillColor('black').fontSize(10).font('Helvetica-Bold');
    doc.text('D) Costing', tableX + 5, currentY + 6);
    currentY += rowHeight;

    // Total - white background
    doc.fillColor('#ffffff')
      .rect(tableX, currentY, tableWidth, rowHeight)
      .fill();

    // Draw cell borders
    doc.rect(tableX, currentY, tableWidth, rowHeight).stroke();
    doc.moveTo(tableX + srNoWidth, currentY)
      .lineTo(tableX + srNoWidth, currentY + rowHeight)
      .stroke();
    doc.moveTo(amountColumnX, currentY)
      .lineTo(amountColumnX, currentY + rowHeight)
      .stroke();

    doc.fillColor('black').fontSize(10).font('Helvetica-Bold');
    doc.text('Total', tableX + srNoWidth + 10, currentY + 6);

    // Format total without currency symbol (white background)
    const total = parseFloat(quotation.costing?.total || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    doc.text(total, amountColumnX + 10, currentY + 6);
    currentY += rowHeight;

    // Discount if any - white background
    doc.fillColor('#ffffff')
      .rect(tableX, currentY, tableWidth, rowHeight)
      .fill();

    // Draw cell borders
    doc.rect(tableX, currentY, tableWidth, rowHeight).stroke();
    doc.moveTo(tableX + srNoWidth, currentY)
      .lineTo(tableX + srNoWidth, currentY + rowHeight)
      .stroke();
    doc.moveTo(amountColumnX, currentY)
      .lineTo(amountColumnX, currentY + rowHeight)
      .stroke();

    doc.fillColor('black').fontSize(10).font('Helvetica-Bold');
    doc.text('Less: Discount (if any)', tableX + srNoWidth + 10, currentY + 6);

    // Format discount without currency symbol (white background)
    const discount = quotation.costing?.discount > 0
      ? parseFloat(quotation.costing.discount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
      : '-';
    doc.text(discount, amountColumnX + 10, currentY + 6);
    currentY += rowHeight;

    // Advance if any - white background
    doc.fillColor('#ffffff')
      .rect(tableX, currentY, tableWidth, rowHeight)
      .fill();

    // Draw cell borders
    doc.rect(tableX, currentY, tableWidth, rowHeight).stroke();
    doc.moveTo(tableX + srNoWidth, currentY)
      .lineTo(tableX + srNoWidth, currentY + rowHeight)
      .stroke();
    doc.moveTo(amountColumnX, currentY)
      .lineTo(amountColumnX, currentY + rowHeight)
      .stroke();

    doc.fillColor('black').fontSize(10).font('Helvetica-Bold');
    doc.text('Less: Advance (if any)', tableX + srNoWidth + 10, currentY + 6);

    // Format advance without currency symbol (white background)
    const advance = quotation.costing?.advance > 0
      ? parseFloat(quotation.costing.advance).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
      : '-';
    doc.text(advance, amountColumnX + 10, currentY + 6);
    currentY += rowHeight;

    // Grand Total - BLUE BACKGROUND
    doc.fillColor(totalRowBlue)
      .rect(tableX, currentY, tableWidth, rowHeight)
      .fill();

    // Draw cell borders
    doc.rect(tableX, currentY, tableWidth, rowHeight).stroke();
    doc.moveTo(tableX + srNoWidth, currentY)
      .lineTo(tableX + srNoWidth, currentY + rowHeight)
      .stroke();
    doc.moveTo(amountColumnX, currentY)
      .lineTo(amountColumnX, currentY + rowHeight)
      .stroke();

    doc.fillColor('black').fontSize(10).font('Helvetica-Bold');
    doc.text('Grand Total', tableX + srNoWidth + 10, currentY + 6);

    // Format grand total with currency symbol (blue background)
    const grandTotal = formatCurrency(quotation.costing?.grandTotal || 0, currencySymbol);
    doc.text(grandTotal, amountColumnX + 10, currentY + 6);

    // Prepared By section at the bottom
    doc.moveDown(1.5);
    doc.fontSize(10).font('Helvetica');
    doc.text('' + (configuration?.preparedBy || ''), 40, doc.y);

    // Signature image if available
    if (configuration?.business?.signature) {
      try {
        const sigData = configuration.business.signature;
        if (sigData && typeof sigData === 'string' && sigData.includes('base64,')) {
          const base64Data = sigData.replace(/^data:image\/[a-z]+;base64,/, "");
          const sigBuffer = Buffer.from(base64Data, 'base64');
          doc.image(sigBuffer, 400, doc.y - 30, { width: 250 });
        }
      } catch (error) {
        console.error('Error adding signature to PDF:', error);
      }
    }

    // ----------------------------------------
    // Simplified Footer section - just "Powered by 5cube.io"
    // ----------------------------------------

    // Fixed position near bottom
    doc.y = 790;

    // Footer content - only Powered by line
    doc.fontSize(9).font('Helvetica');
    doc.text('Powered by 5cube.io', { align: 'center', link: 'https://5cube.io' });

    // Finish the document
    doc.end();
  });
};

module.exports = { generateCateringPDFBuffer };