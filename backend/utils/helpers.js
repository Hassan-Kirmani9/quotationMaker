const mongoose = require('mongoose');


const helpers = {
  
  isValidObjectId: (id) => {
    return mongoose.Types.ObjectId.isValid(id);
  },

  
  generateRandomString: (length = 10) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  },

  
  formatCurrency: (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  },

  
  calculatePercentage: (value, total) => {
    if (total === 0) return 0;
    return (value / total) * 100;
  },

  
  calculateDiscountAmount: (subtotal, discountType, discountValue) => {
    if (discountType === 'percentage') {
      return (subtotal * discountValue) / 100;
    }
    return discountValue;
  },

  
  calculateTaxAmount: (amount, taxRate) => {
    return (amount * taxRate) / 100;
  },

  
  generateQuotationNumber: (count, prefix = 'QUO') => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    return `${prefix}-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  },

  
  addDaysToDate: (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  
  isDateExpired: (date) => {
    return new Date(date) < new Date();
  },

  
  sanitizeSearchString: (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },

  
  buildSearchQuery: (searchTerm, fields) => {
    const sanitized = helpers.sanitizeSearchString(searchTerm);
    return {
      $or: fields.map(field => ({
        [field]: { $regex: sanitized, $options: 'i' }
      }))
    };
  },

  
  paginateQuery: (query, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    return query.skip(skip).limit(limit);
  },

  
  buildPaginationResponse: (page, limit, total) => {
    return {
      current: Number(page),
      pages: Math.ceil(total / limit),
      total,
      limit: Number(limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    };
  },

  
  cleanObject: (obj) => {
    return Object.keys(obj).reduce((cleaned, key) => {
      if (obj[key] !== undefined && obj[key] !== null) {
        cleaned[key] = obj[key];
      }
      return cleaned;
    }, {});
  },

  
  deepMerge: (target, source) => {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = helpers.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  },

  
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  
  capitalizeFirst: (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  
  toSlug: (str) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  
  getFileExtension: (filename) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  },

  
  formatDate: (date, locale = 'en-US') => {
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  
  getDateRange: (startDate, endDate) => {
    const dates = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }
};

module.exports = helpers;