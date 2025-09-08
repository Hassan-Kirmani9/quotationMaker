const mongoose = require('mongoose');

const configurationSchema = new mongoose.Schema({
  bank: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Bank name cannot exceed 100 characters']
    },
    accountName: {
      type: String,
      trim: true,
      maxlength: [100, 'Account name cannot exceed 100 characters']
    },
    accountNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Account number cannot exceed 50 characters']
    }
  },
  business: {
    name: {
      type: String,
      trim: true,
      maxlength: [150, 'Business name cannot exceed 150 characters']
    },
    nameColor: {
      type: String,
      trim: true,
      default: '#333333',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color code']
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters']
    },
    mobileNum: {
      type: String,
      trim: true
    },
    businessNum: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    web: {
      type: String,
      trim: true,
      maxlength: [200, 'Website cannot exceed 200 characters']
    },
    logo: {
      type: String,
      trim: true
    },
    taxId: {
      type: String,
      trim: true,
      maxlength: [50, 'Tax ID cannot exceed 50 characters']
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'PKR', 'AED', 'CAD', 'AUD', 'JPY', 'INR', 'CHF'],
      default: 'USD'
    }
  },
  quotation: {
    validity: {
      type: Number,
      required: [true, 'Quotation validity period is required'],
      min: [1, 'Validity must be at least 1 day'],
      max: [365, 'Validity cannot exceed 365 days'],
      default: 30
    },
    terms: {
      type: String,
      trim: true,
      maxlength: [2000, 'Terms cannot exceed 2000 characters']
    },
    prefix: {
      type: String,
      trim: true,
      maxlength: [10, 'Prefix cannot exceed 10 characters'],
      default: 'QUO'
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

configurationSchema.index({ user: 1 });

module.exports = mongoose.model('Configuration', configurationSchema);