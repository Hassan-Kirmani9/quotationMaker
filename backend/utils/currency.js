const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
  PKR: { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  CHF: { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' }
};

const formatCurrency = (amount, currencyCode = 'USD') => {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  return `${currency.symbol}${amount.toLocaleString()}`;
};

const getCurrencySymbol = (currencyCode = 'USD') => {
  return CURRENCIES[currencyCode]?.symbol || '$';
};

const getCurrencyName = (currencyCode = 'USD') => {
  return CURRENCIES[currencyCode]?.name || 'US Dollar';
};

module.exports = {
  CURRENCIES,
  formatCurrency,
  getCurrencySymbol,
  getCurrencyName
};