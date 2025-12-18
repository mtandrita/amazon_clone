/**
 * Format a number as Indian Rupees (INR)
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the ₹ symbol (default: true)
 * @returns {string} - Formatted currency string
 */
export const formatINR = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? '₹0' : '0'
  }

  // Use Indian number formatting (e.g., 1,00,000 instead of 100,000)
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })

  const formatted = formatter.format(amount)
  
  if (!showSymbol) {
    return formatted.replace('₹', '').trim()
  }
  
  return formatted
}

/**
 * Format price for display with proper Indian formatting
 * @param {number} price - The price to format
 * @returns {object} - Object with symbol, wholeNumber, and decimal parts
 */
export const formatPriceParts = (price) => {
  const amount = price || 0
  const wholeNumber = Math.floor(amount)
  const decimal = ((amount % 1) * 100).toFixed(0).padStart(2, '0')
  
  // Format whole number with Indian comma separators
  const formattedWhole = wholeNumber.toLocaleString('en-IN')
  
  return {
    symbol: '₹',
    wholeNumber: formattedWhole,
    decimal: decimal === '00' ? '' : `.${decimal}`
  }
}

export default formatINR
