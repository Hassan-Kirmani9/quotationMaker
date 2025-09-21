const mongoose = require('mongoose');

const configurationSchema = new mongoose.Schema({
  bank: {
    name: {
      type: String
    },
    accountName: {
      type: String
    },
    accountNumber: {
      type: String
    }
  },
  business: {
    name: {
      type: String
    },
    nameColor: {
      type: String
    },
    address: {
      type: String
    },
    mobileNum: {
      type: String
    },
    businessNum: {
      type: String
    },
    email: {
      type: String
    },
    web: {
      type: String
    },
    logo: {
      type: String
    },
    taxId: {
      type: String
    },
    currency: {
      type: String
    }
  },
  quotation: {
    validity: {
      type: Number,
      required: true
    },
    terms: {
      type: String
    },
    prefix: {
      type: String
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

module.exports = mongoose.model('Configuration', configurationSchema);
