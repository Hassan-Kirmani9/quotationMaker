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
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // Company Header section (Logo, Business Name, Status)
    const headerY = 40;
    const logoSize = 60;
    const businessNameX = 120;
    const statusX = 450;

    // Logo (if available)
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

    // Business Name with custom color
    if (configuration?.business?.name) {
      const businessColor = configuration?.business?.nameColor || '#000000';
      doc.fontSize(20).font('Helvetica-Bold').fillColor(businessColor);
      doc.text(configuration.business.name, businessNameX, headerY + 20);
      doc.fillColor('black');
    }

    // Status
    const status = quotation.status || 'CATERING QUOTATION';
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#666666');
    doc.text(status.toUpperCase(), statusX, headerY + 20);
    doc.fillColor('black');

    // Add separator line
    doc.moveTo(40, headerY + logoSize + 20).lineTo(555, headerY + logoSize + 20).stroke();

    // Header section with client info and quotation details
    const startY = headerY + logoSize + 40;
    doc.y = startY;

    // Left side - Bill To section
    doc.fontSize(12).font("Helvetica-Bold").text("Bill To: ", 40, doc.y, { continued: true });
    doc.font("Helvetica").text(quotation.client?.name || "N/A");
    
    if (quotation.client?.address) {
      doc.moveDown(0.5);
      const addressY = doc.y;
      
      // Calculate label width first
      doc.fontSize(12).font("Helvetica-Bold");
      const labelWidth = doc.widthOfString("Address: ");
      
      // Write the label on its own line
      doc.text("Address: ", 40, addressY, { continued: false });
      
      // Calculate starting X position for address text (right after the label)
      const addressStartX = 40 + labelWidth;
      
      // Calculate available width from after label to right column start
      const availableWidth = 350 - addressStartX - 10; // 10px padding from right column
      
      // Write address starting from after the label, with proper width constraint
      doc.font("Helvetica");
      doc.text(quotation.client.address, addressStartX, addressY, {
        width: availableWidth,
        align: 'left'
      });
    }

    // Right side - Quotation details
    const rightX = 350;
    doc.fontSize(12).font("Helvetica-Bold").text("Quotation #:", rightX, startY);
    const quotationNumber = `CQ-${quotation._id.toString().slice(-8).toUpperCase()}`;
    doc.font("Helvetica").text(quotationNumber, rightX + 80, startY);
    
    doc.font("Helvetica-Bold").text("Date:", rightX, startY + 20);
    const formattedDate = quotation.createdAt ? 
      new Date(quotation.createdAt).toLocaleDateString('en-GB') : 
      new Date().toLocaleDateString('en-GB');
    doc.font("Helvetica").text(formattedDate, rightX + 80, startY + 20);

    // Move to content section
    doc.y = startY + 80;

    // MENU SECTION
    if (quotation.menu) {
      doc.fontSize(14).font("Helvetica-Bold").text("MENU SECTION", 40, doc.y);
      doc.moveDown(0.5);
      
      // Menu summary
      doc.fontSize(11).font("Helvetica");
      doc.text(`Per Thaal Rate: ${formatCurrency(quotation.menu.perThaalRate, quotation.currency)} | Number of Thaals: ${quotation.menu.numberOfThaals} | Menu Total: ${formatCurrency(quotation.menu.total, quotation.currency)}`, 40, doc.y);
      doc.moveDown(0.8);

      // Menu Items Table
      if (quotation.menu.items && quotation.menu.items.length > 0) {
        // Table header
        const tableStartY = doc.y;
        const tableHeaderHeight = 20;
        const rowHeight = 18;

        doc.rect(40, tableStartY, 515, tableHeaderHeight).fillAndStroke('#E8E8E8', '#000000');
        
        doc.fillColor('black').fontSize(10).font('Helvetica-Bold');
        doc.text('Item Name', 50, tableStartY + 6);
        doc.text('Amount', 450, tableStartY + 6);

        // Table rows
        let currentRowY = tableStartY + tableHeaderHeight;
        doc.font('Helvetica').fontSize(9);

        quotation.menu.items.forEach((item, index) => {
          const fillColor = index % 2 === 0 ? '#FFFFFF' : '#F8F8F8';
          doc.rect(40, currentRowY, 515, rowHeight).fillAndStroke(fillColor, '#CCCCCC');
          
          doc.fillColor('black');
          doc.text(item.name || "N/A", 50, currentRowY + 5, { width: 350, ellipsis: true });
          doc.text(formatCurrency(item.amount || 0, quotation.currency), 450, currentRowY + 5);

          currentRowY += rowHeight;
        });
        
        doc.y = currentRowY + 15;
      }
    }

    // EXTRAS SECTION
    if (quotation.extras && quotation.extras.items && quotation.extras.items.length > 0) {
      doc.fontSize(14).font("Helvetica-Bold").text("EXTRAS SECTION", 40, doc.y);
      doc.moveDown(0.5);
      
      // Table header
      const tableStartY = doc.y;
      const tableHeaderHeight = 20;
      const rowHeight = 18;

      doc.rect(40, tableStartY, 515, tableHeaderHeight).fillAndStroke('#E8E8E8', '#000000');
      
      doc.fillColor('black').fontSize(10).font('Helvetica-Bold');
      doc.text('Extra Item', 50, tableStartY + 6);
      doc.text('Amount', 450, tableStartY + 6);

      // Table rows
      let currentRowY = tableStartY + tableHeaderHeight;
      doc.font('Helvetica').fontSize(9);

      quotation.extras.items.forEach((item, index) => {
        const fillColor = index % 2 === 0 ? '#FFFFFF' : '#F8F8F8';
        doc.rect(40, currentRowY, 515, rowHeight).fillAndStroke(fillColor, '#CCCCCC');
        
        doc.fillColor('black');
        doc.text(item.name || "N/A", 50, currentRowY + 5, { width: 350, ellipsis: true });
        doc.text(formatCurrency(item.amount || 0, quotation.currency), 450, currentRowY + 5);

        currentRowY += rowHeight;
      });
      
      doc.y = currentRowY + 10;
      
      // Extras total
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text(`Extras Total: ${formatCurrency(quotation.extras.total || 0, quotation.currency)}`, 400, doc.y, { align: 'right', width: 115 });
      doc.moveDown(1);
    }

    // OTHERS SECTION
    if (quotation.others && quotation.others.items && quotation.others.items.length > 0) {
      doc.fontSize(14).font("Helvetica-Bold").text("OTHERS SECTION", 40, doc.y);
      doc.moveDown(0.5);
      
      // Table header
      const tableStartY = doc.y;
      const tableHeaderHeight = 20;
      const rowHeight = 18;

      doc.rect(40, tableStartY, 515, tableHeaderHeight).fillAndStroke('#E8E8E8', '#000000');
      
      doc.fillColor('black').fontSize(10).font('Helvetica-Bold');
      doc.text('Other Item', 50, tableStartY + 6);
      doc.text('Amount', 450, tableStartY + 6);

      // Table rows
      let currentRowY = tableStartY + tableHeaderHeight;
      doc.font('Helvetica').fontSize(9);

      quotation.others.items.forEach((item, index) => {
        const fillColor = index % 2 === 0 ? '#FFFFFF' : '#F8F8F8';
        doc.rect(40, currentRowY, 515, rowHeight).fillAndStroke(fillColor, '#CCCCCC');
        
        doc.fillColor('black');
        doc.text(item.name || "N/A", 50, currentRowY + 5, { width: 350, ellipsis: true });
        doc.text(formatCurrency(item.amount || 0, quotation.currency), 450, currentRowY + 5);

        currentRowY += rowHeight;
      });
      
      doc.y = currentRowY + 10;
      
      // Others total
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text(`Others Total: ${formatCurrency(quotation.others.total || 0, quotation.currency)}`, 400, doc.y, { align: 'right', width: 115 });
      doc.moveDown(1);
    }

    // COSTING SUMMARY - Keep everything together
    if (quotation.costing) {
      // Check if we need a new page
      if (doc.y > 600) {
        doc.addPage();
        doc.y = 40;
      }
      
      const summaryStartX = 300;
      const summaryWidth = 255;
      const summaryEndX = summaryStartX + summaryWidth;
      const labelX = summaryStartX + 10;

      const getRightAlignedX = (text, rightEdge) => {
        const textWidth = doc.widthOfString(text);
        return rightEdge - textWidth;
      };

      doc.fontSize(11).font('Helvetica-Bold');

      // Total
      const totalY = doc.y;
      doc.text('Total:', labelX, totalY);
      const totalText = formatCurrency(quotation.costing.total || 0, quotation.currency);
      doc.text(totalText, getRightAlignedX(totalText, summaryEndX - 10), totalY);
      doc.y = totalY + 15;
      doc.moveTo(summaryStartX, doc.y).lineTo(summaryStartX + summaryWidth, doc.y).stroke();
      doc.y += 8;

      // Discount (if > 0)
      if (quotation.costing.discount > 0) {
        const discountY = doc.y;
        doc.text('Discount:', labelX, discountY);
        const discountText = formatCurrency(quotation.costing.discount, quotation.currency);
        doc.text(discountText, getRightAlignedX(discountText, summaryEndX - 10), discountY);
        doc.y = discountY + 15;
        doc.moveTo(summaryStartX, doc.y).lineTo(summaryStartX + summaryWidth, doc.y).stroke();
        doc.y += 8;
      }

      // Advance (if > 0)
      if (quotation.costing.advance > 0) {
        const advanceY = doc.y;
        doc.text('Advance:', labelX, advanceY);
        const advanceText = formatCurrency(quotation.costing.advance, quotation.currency);
        doc.text(advanceText, getRightAlignedX(advanceText, summaryEndX - 10), advanceY);
        doc.y = advanceY + 15;
        doc.moveTo(summaryStartX, doc.y).lineTo(summaryStartX + summaryWidth, doc.y).stroke();
        doc.y += 8;
      }

      // Grand Total - keep label and value together
      const grandTotalY = doc.y;
      doc.rect(summaryStartX, grandTotalY - 5, summaryWidth, 25).fillAndStroke('#E8E8E8', '#000000');
      doc.fillColor('black').font('Helvetica-Bold');
      doc.text('Grand Total:', labelX, grandTotalY + 3);
      const grandTotalText = formatCurrency(quotation.costing.grandTotal || 0, quotation.currency);
      doc.text(grandTotalText, getRightAlignedX(grandTotalText, summaryEndX - 10), grandTotalY + 3);
      doc.y = grandTotalY + 35;
    }

    // Currency note
    doc.moveDown(1);
    doc.fontSize(10).font('Helvetica-Oblique');
    doc.text(`All rates are stated in ${quotation.currency || configuration?.business?.currency || 'PKR'}`, 40, doc.y);

    // Terms & Conditions
    if (configuration?.quotation?.terms) {
      doc.moveDown(1.5);
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Terms & Conditions:', 40, doc.y);
      doc.moveDown(0.5);

      doc.fontSize(9).font('Helvetica');
      const terms = configuration.quotation.terms.split('\n');
      terms.forEach(term => {
        if (term.trim()) {
          doc.text(term.trim(), 40, doc.y, { 
            width: 500,
            align: 'justify'
          });
          doc.moveDown(0.3);
        }
      });
    }

    // Footer - Fixed position
    const footerY = 720;
    if (doc.y < footerY) {
      doc.y = footerY;
    }
    
    // Footer top border
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.5);
    
    // Footer content
    doc.fontSize(9).font('Helvetica');
    
    const firstLine = [
      configuration?.business?.mobileNum,
      configuration?.business?.email,
      configuration?.business?.web
    ].filter(Boolean).join(' | ');
    
    if (firstLine) {
      doc.text(firstLine, { align: 'center' });
      doc.moveDown(0.3);
    }
    
    if (configuration?.business?.address) {
      doc.text(configuration.business.address, { align: 'center' });
      doc.moveDown(0.5);
    }
    
    doc.text('Powered by 5cube.io', { align: 'center' });

    doc.end();
  });
};

module.exports = { generateCateringPDFBuffer };