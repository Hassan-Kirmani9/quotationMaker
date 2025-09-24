/**
 * Formats a date string or Date object to DD/MM/YYYY format
 * @param {string | Date} date - The date to format
 * @returns {string} Formatted date string in DD/MM/YYYY format
 */
export const formatDate = (date) => {
  const dateObj = new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = dateObj.getFullYear();
  
  return `${day}/${month}/${year}`;
};