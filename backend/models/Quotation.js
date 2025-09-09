const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [0.01, 'Quantity must be greater than 0'],
    default: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'Unit price cannot be negative']
  },
  discountValue: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%'],
    default: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price cannot be negative']
  }
});

const quotationSchema = new mongoose.Schema({
  quotationNo: {
    type: String,
    trim: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  },
  items: [quotationItemSchema],
  subtotal: {
    type: Number,
    min: [0, 'Subtotal cannot be negative'],
    default: 0
  },
  discountType: {
    type: String,
    enum: ['percentage'],
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    default: 0
  },
  discountAmount: {
    type: Number,
    min: [0, 'Discount amount cannot be negative'],
    default: 0
  },
  taxRate: {
    type: Number,
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100%'],
    default: 0
  },
  taxAmount: {
    type: Number,
    min: [0, 'Tax amount cannot be negative'],
    default: 0
  },
  totalAmount: {
    type: Number,
    min: [0, 'Total amount cannot be negative'],
    default: 0,
  },
  status: {
    type: String,
    enum: ['quotation', 'invoice'],
    default: 'quotation'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

quotationSchema.pre('save', async function (next) {
  if (this.isNew && !this.quotationNo) {
    try {
      const count = await mongoose.model('Quotation').countDocuments({
        user: this.user,
      });

      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');

      this.quotationNo = `QUO-${year}${month}-${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

quotationSchema.pre('save', function (next) {
  // Calculate item-level totals first
  this.items.forEach(item => {
    const subtotalBeforeDiscount = item.quantity * item.unitPrice;
    const itemDiscountAmount = (subtotalBeforeDiscount * item.discountValue) / 100;
    item.totalPrice = subtotalBeforeDiscount - itemDiscountAmount;
  });

  // Calculate quotation-level totals
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  this.discountAmount = (this.subtotal * this.discountValue) / 100;
  const afterDiscount = this.subtotal - this.discountAmount;
  this.taxAmount = (afterDiscount * this.taxRate) / 100;
  this.totalAmount = afterDiscount + this.taxAmount;

  next();
});

quotationSchema.index({ user: 1 });
quotationSchema.index({ client: 1 });
quotationSchema.index({ quotationNo: 1 });
quotationSchema.index({ status: 1 });
quotationSchema.index({ date: -1 });

module.exports = mongoose.model('Quotation', quotationSchema);