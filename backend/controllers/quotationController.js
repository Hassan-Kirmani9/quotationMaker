const Quotation = require('../models/Quotation');
const Product = require('../models/Product');
const Client = require('../models/Client');
const Configuration = require('../models/Configuration');


const getQuotations = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, client } = req.query;
    const userId = req.user._id;


    const query = { user: userId };

    if (search) {
      query.$or = [
        { quotationNo: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    if (client) {
      query.client = client;
    }


    const quotations = await Quotation.find(query)
      .populate('client', 'name businessName email')
      .populate('items.product', 'name size')
      .populate({
        path: 'items.product',
        select: 'name size',
        populate: {
          path: 'size',
          select: 'name'
        }
      }).limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Quotation.countDocuments(query);

    res.json({
      success: true,
      data: {
        quotations,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / limit),
          total,
          limit: Number(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get quotations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quotations',
      error: error.message
    });
  }
};


const getQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findOne({
      _id: req.params.id,
      user: req.user._id
    })
      .populate('client')
      .populate({
        path: 'items.product',
        select: 'name description unit size',
        populate: {
          path: 'size',
          select: 'name'
        }
      });
    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }
    res.json({
      success: true,
      data: { quotation }
    });
  } catch (error) {
    console.error('Get quotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quotation',
      error: error.message
    });
  }
};


const createQuotation = async (req, res) => {
  try {
    const { client, title, description, items, discountType, discountValue, taxRate, currency } = req.body;


    const clientExists = await Client.findOne({ _id: client, user: req.user._id });
    if (!clientExists) {
      return res.status(400).json({
        success: false,
        message: 'Client not found'
      });
    }


    const processedItems = [];
    for (const item of items) {
      const product = await Product.findOne({ _id: item.product, user: req.user._id });
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }
      const quantity = item.quantity || 1;
      const unitPrice = item.unitPrice || product.sellingPrice;
      const discountValue = item.discountValue || 0;
      const discountType = item.discountType || 'percentage';

      const subtotalBeforeDiscount = quantity * unitPrice;
      const itemDiscountAmount = discountType === 'percentage'
        ? (subtotalBeforeDiscount * discountValue) / 100
        : discountValue;
      const totalPrice = subtotalBeforeDiscount - itemDiscountAmount;

      processedItems.push({
        product: item.product,
        description: item.description || product.description,
        quantity: quantity,
        unitPrice: unitPrice,
        discountType: discountType,
        discountValue: discountValue,
        discountAmount: itemDiscountAmount,
        totalPrice: totalPrice
      });
    }


    const config = await Configuration.findOne({ user: req.user._id });
    const validityDays = config?.quotation?.validity || 30;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validityDays);
    const defaultCurrency = config?.quotation?.currency || 'USD';

    const quotationData = {
      client,
      title,
      description,
      items: processedItems,
      validUntil,
      discountType: 'percentage',
      discountValue: discountValue || 0,
      taxRate: taxRate || 0,
      currency: currency || defaultCurrency,
      user: req.user._id
    };

    const quotation = new Quotation(quotationData);
    await quotation.save();


    await quotation.populate([
      { path: 'client', select: 'name businessName email' },
      { path: 'items.product', select: 'name description unit size', populate: { path: 'size', select: 'name' } }
    ]);

    res.status(201).json({
      success: true,
      message: 'Quotation created successfully',
      data: { quotation }
    });
  } catch (error) {
    console.error('Create quotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating quotation',
      error: error.message
    });
  }
};


const updateQuotation = async (req, res) => {
  try {
    const quotationId = req.params.id;
    const { items, discountType, discountValue, taxRate, ...otherUpdates } = req.body;

    const quotation = await Quotation.findOne({
      _id: quotationId,
      user: req.user._id
    });

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    if (items) {
      const processedItems = [];
      for (const item of items) {
        const product = await Product.findOne({ _id: item.product, user: req.user._id });
        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Product not found: ${item.product}`
          });
        }

        processedItems.push({
          product: item.product,
          description: item.description || product.description,
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || product.sellingPrice,
          totalPrice: (item.quantity || 1) * (item.unitPrice || product.sellingPrice)
        });
      }
      quotation.items = processedItems;
    }


    Object.assign(quotation, otherUpdates);

    quotation.discountType = 'percentage'; if (discountValue !== undefined) quotation.discountValue = discountValue;
    if (taxRate !== undefined) quotation.taxRate = taxRate;

    await quotation.save();


    await quotation.populate([
      { path: 'client', select: 'name businessName email' },
      { path: 'items.product', select: 'name description unit size', populate: { path: 'size', select: 'name' } }]);

    res.json({
      success: true,
      message: 'Quotation updated successfully',
      data: { quotation }
    });
  } catch (error) {
    console.error('Update quotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating quotation',
      error: error.message
    });
  }
};


const deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }


    if (quotation.status === 'invoice') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete invoices. Convert back to quotation first.'
      });
    }

    await Quotation.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Quotation deleted successfully'
    });
  } catch (error) {
    console.error('Delete quotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting quotation',
      error: error.message
    });
  }
};

const updateQuotationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['quotation', 'invoice'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be either "quotation" or "invoice"'
      });
    }

    const quotation = await Quotation.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status },
      { new: true }
    ).populate([
      { path: 'client', select: 'name businessName email' },
    ]);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    res.json({
      success: true,
      message: `Successfully converted to ${status}`,
      data: { quotation }
    });
  } catch (error) {
    console.error('Update quotation status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating quotation status',
      error: error.message
    });
  }
};


const duplicateQuotation = async (req, res) => {
  try {
    const originalQuotation = await Quotation.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!originalQuotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }


    const quotationData = originalQuotation.toObject();
    delete quotationData._id;
    delete quotationData.quotationNo;
    delete quotationData.createdAt;
    delete quotationData.updatedAt;


    quotationData.status = 'quotation';
    quotationData.date = new Date();


    const config = await Configuration.findOne({ user: req.user._id });
    const validityDays = config?.quotation?.validity || 30;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validityDays);
    quotationData.validUntil = validUntil;

    const newQuotation = new Quotation(quotationData);
    await newQuotation.save();


    await newQuotation.populate([
      { path: 'client', select: 'name businessName email' },
      { path: 'items.product', select: 'name description unit size', populate: { path: 'size', select: 'name' } }]);

    res.status(201).json({
      success: true,
      message: 'Quotation duplicated successfully',
      data: { quotation: newQuotation }
    });
  } catch (error) {
    console.error('Duplicate quotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error duplicating quotation',
      error: error.message
    });
  }
};


const getQuotationStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Quotation.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalCount = await Quotation.countDocuments({ user: userId });
    const totalValue = await Quotation.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);


    const recentQuotations = await Quotation.find({ user: userId })
      .populate('client', 'name businessName')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('quotationNo title totalAmount status createdAt');

    res.json({
      success: true,
      data: {
        stats: {
          total: totalCount,
          totalValue: totalValue[0]?.total || 0,
          byStatus: stats.reduce((acc, stat) => {
            acc[stat._id] = {
              count: stat.count,
              totalAmount: stat.totalAmount
            };
            return acc;
          }, {})
        },
        recentQuotations
      }
    });
  } catch (error) {
    console.error('Get quotation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quotation statistics',
      error: error.message
    });
  }
};

const generateQuotationPDF = async (req, res) => {
  try {
    const quotation = await Quotation.findOne({
      _id: req.params.id,
      user: req.user._id
    })
      .populate('client')
      .populate({
        path: 'items.product',
        select: 'name description unit size',
        populate: {
          path: 'size',
          select: 'name'
        }
      });
    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    const configuration = await Configuration.findOne({ user: req.user._id });

    const subtotal = quotation.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const discountValue = quotation.discountValue || 0;
    const taxRate = quotation.taxRate || 0;
    const discountAmount = quotation.discountType === 'percentage'
      ? (subtotal * discountValue) / 100
      : discountValue;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * taxRate) / 100;
    const totalAmount = afterDiscount + taxAmount;


    const formatCurrency = (amount) => {
      const currencySymbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'PKR': 'PKR',
        'AED': 'د.إ',
        'CAD': 'C$',
        'AUD': 'A$',
        'JPY': '¥',
        'INR': '₹',
        'CHF': 'Fr',
        'SAR': '﷼'
      };

      const currency = quotation.currency || 'PKR';
      const symbol = currencySymbols[currency] || currency;
      const numAmount = parseFloat(amount) || 0;

      return `${symbol} ${numAmount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    };


    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };


    const htmlTemplate = `
   <!DOCTYPE html>
   <html>
   <head>
       <meta charset="UTF-8">
       <style>
        body { 
    font-family: Arial, sans-serif; 
    margin: 0; 
    padding: 20px 20px 80px 20px; 
    color: #333; 
}
.footer-section { 
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    padding-top: 20px; 
    border-top: 1px solid #ddd;
    background: white;
}  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
.business-name { flex: 1; display: flex; align-items: center; justify-content: center; margin-top:10px;}   
.logo { max-width: 120px; max-height: 80px; }
           .document-title { font-size: 28px; font-weight: bold; color: #333; text-align: right; }
           .company-info { margin-bottom: 30px; }
           .billing-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
           .bill-to { width: 45%; }
           .document-details { width: 45%; text-align: right; }      
           .bill-to h3, .document-details h3 { margin: 0 0 10px 0; font-size: 14px; font-weight: bold; }
           .bill-to p, .document-details p { margin: 2px 0; font-size: 14px; }
           .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
           .items-table th { background-color: #f5f5f5; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-weight: bold; }
           .items-table td { padding: 10px 12px; border-bottom: 1px solid #eee; }
           .items-table .text-right { text-align: right; }
           .items-table .text-center { text-align: center; }
           .totals-section { margin-top: 30px; display: flex; justify-content: flex-end; }
           .totals-table { width: 300px; }
           .totals-table tr td { padding: 8px 12px; border-bottom: 1px solid #eee; }
           .totals-table .total-row { font-weight: bold; font-size: 16px; border-top: 2px solid #333; }
           .additional-sections { margin-top: 30px; margin-bottom: 20px; }
           .bank-details { margin-bottom: 20px; }
           .bank-details h4 { margin: 0 0 10px 0; font-size: 14px; font-weight: bold; }
           .terms-section { margin-top: 20px; }
           .terms-section h4 { margin: 0 0 10px 0; font-size: 14px; font-weight: bold; }
           .terms-section p { font-size: 12px; line-height: 1.4; }
           .contact-footer { text-align: center; font-size: 12px; color: #666; }
       </style>
   </head>
   <body>
<div class="header">
  <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
    <div style="display: flex; align-items: center; gap: 50px;">
      ${configuration && configuration.business && configuration.business.logo ? `<img src="${configuration.business.logo}" class="logo" alt="Company Logo">` : ''}
<div style="font-size: 32px; font-weight: bold; color: ${configuration && configuration.business && configuration.business.nameColor ? configuration.business.nameColor : '#333'}; margin-left: 40px;">        ${configuration && configuration.business && configuration.business.name ? configuration.business.name : ''}
      </div>
    </div>
    <div style="font-size: 32px; font-weight: bold; color: #333;">
      ${quotation.status.toUpperCase()}
    </div>
  </div>
</div>

       <div class="billing-section">
        <div class="bill-to">
  <p><strong>Bill To:</strong> <span style="color: ${configuration && configuration.business && configuration.business.businessNameColor ? configuration.business.businessNameColor : '#000000'}">${quotation.client && quotation.client.name ? quotation.client.name : 'N/A'}</span></p>
  <p><strong>Address:</strong> ${quotation.client && quotation.client.address ? quotation.client.address : ''} ${quotation.client && quotation.client.city ? quotation.client.city : ''}, ${quotation.client && quotation.client.country ? quotation.client.country : ''}</p>
</div>
           
           <div class="document-details">
<p><strong>${quotation.status === 'invoice' ? 'Invoice' : 'Quotation'} #:</strong> ${quotation.status === 'invoice' ? quotation.quotationNo.replace(/^QUO-/, 'INV-') : quotation.quotationNo}</p>               <p><strong>Date:</strong> ${formatDate(quotation.date)}</p>
               ${quotation.validUntil ? `<p><strong>Due Date:</strong> ${formatDate(quotation.validUntil)}</p>` : ''}
           </div>
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
  ${quotation.items.map(item => {
      const quantity = item.quantity || 1;
      const unitPrice = item.unitPrice || 0;
      const subtotalBeforeDiscount = quantity * unitPrice;
      const itemDiscountValue = item.discountValue || 0;
      const itemDiscountAmount = item.discountAmount || 0;

      return `
    <tr>
        <td>${(item.product && item.product.name) || item.description || 'N/A'}</td>
        <td class="text-center">${(item.product && item.product.size && item.product.size.name) || 'N/A'}</td>
        <td class="text-center">${quantity}</td>
        <td class="text-right">${unitPrice}</td>
        <td class="text-center">${itemDiscountValue > 0 ? itemDiscountValue + '%' : '-'}</td>
        <td class="text-right">${item.totalPrice || 0}</td>
    </tr>
`;
    }).join('')}
</tbody>
</table>

       <div class="totals-section">
           <table class="totals-table">
               <tr>
                   <td><strong>Gross Amount:</strong></td>
                   <td class="text-right">${formatCurrency(subtotal)}</td>
               </tr>
<tr>
    <td><strong>Discount:</strong> ${discountValue > 0 ? `${discountValue}%` : ''}</td>
    <td class="text-right">${formatCurrency(discountAmount)}</td>
</tr>
<tr>
    <td><strong>Tax:</strong> ${taxRate > 0 ? `${taxRate}%` : ''}</td>
    <td class="text-right">${formatCurrency(taxAmount)}</td>
</tr>
               <tr class="total-row">
                   <td><strong>Net Amount:</strong></td>
                   <td class="text-right">${formatCurrency(totalAmount)}</td>
               </tr>
           </table>
       </div>

       <div class="additional-sections">
<p><em>All rates are stated in ${quotation.currency || (configuration?.quotation?.currency || 'PKR')}</em></p>       
${configuration && configuration.bank && configuration.bank.name && quotation.status === 'invoice' ? `
<div class="bank-details">
    <h4>Money transfer to the account below:</h4>
    <p><strong>Bank Name:</strong> ${configuration.bank.name}</p>
    <p><strong>Account Title:</strong> ${configuration.bank.accountName || ''}</p>
    <p><strong>Account No:</strong> ${configuration.bank.accountNumber || ''}</p>
` : ''}
${configuration && configuration.quotation && configuration.quotation.terms ? `
<div class="terms-section">
    <h4>Terms & Conditions:</h4>
    <p style="white-space: pre-wrap;">${configuration.quotation.terms}</p>
</div>
` : ''}
       </div>

       <div class="footer-section">
           <div class="contact-footer">
           <p>
    ${configuration && configuration.business && configuration.business.mobileNum ? configuration.business.mobileNum : ''} | 
    ${configuration && configuration.business && configuration.business.email ? configuration.business.email : ''} | 
    ${configuration && configuration.business && configuration.business.web ? configuration.business.web : ''} | 
    </p>
   <p> ${configuration && configuration.business && configuration.business.address ? configuration.business.address : ''}</p>
<em>Powered by <a href="https://5cube.io" target="_blank" style="color: #666; text-decoration: none;">5cube.io</a></em>           </div>
       </div>
   </body>
   </html>
   `;


    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    await browser.close();


    res.setHeader('Content-Type', 'application/pdf');
    const displayNumber = quotation.status === 'invoice' ? quotation.quotationNo.replace(/^QUO-/, 'INV-') : quotation.quotationNo;
    res.setHeader('Content-Disposition', `attachment; filename="${displayNumber}.pdf"`); res.send(pdf);

  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message
    });
  }
};

module.exports = {
  getQuotations,
  getQuotation,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  updateQuotationStatus,
  duplicateQuotation,
  getQuotationStats,
  generateQuotationPDF
};