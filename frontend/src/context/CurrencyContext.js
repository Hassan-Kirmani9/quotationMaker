import React, { createContext, useContext, useState, useEffect } from 'react'
import { get } from '../api/axios'

const CurrencyContext = createContext()

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD')
  const [loading, setLoading] = useState(true)

  const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'PKR': '₨',
    'AED': 'د.إ',
    'CAD': 'C$',
    'AUD': 'A$',
    'JPY': '¥',
    'INR': '₹',
    'CHF': 'Fr',
    'SAR': '﷼'
  }

  const fetchCurrency = async () => {
  try {
    setLoading(true)
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }
    
    const response = await get('/configuration', {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
      if (response.success) {
        const config = response.data.configuration
        const currency = config?.quotation?.currency || config?.business?.currency
        if (currency) {
          setCurrency(currency)
        }
      }
    } catch (error) {
      console.error('Error fetching currency from configuration:', error)
      
    } finally {
      setLoading(false)
    }
  }

useEffect(() => {
  fetchCurrency()

  
  const handleCurrencyUpdate = (event) => {
    const newCurrency = event.detail.currency
    if (newCurrency && newCurrency !== currency) {
      setCurrency(newCurrency) 
    }
  }

  window.addEventListener('currencyUpdated', handleCurrencyUpdate)

  
  return () => {
    window.removeEventListener('currencyUpdated', handleCurrencyUpdate)
  }
}, []) 

  const formatCurrency = (amount, showSymbol = true) => {
    try {
      const numAmount = parseFloat(amount) || 0
      if (showSymbol) {
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: currency,
          currencyDisplay: "symbol",
        }).format(numAmount)
      } else {
        return numAmount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      }
    } catch (err) {
      const symbol = currencySymbols[currency] || currency
      const formattedAmount = (parseFloat(amount) || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
      return showSymbol ? `${symbol} ${formattedAmount}` : formattedAmount
    }
  }

  const getCurrencySymbol = () => {
    return currencySymbols[currency] || currency
  }

  const updateCurrency = (newCurrency) => {
    setCurrency(newCurrency)
  }

  const refreshCurrency = () => {
    fetchCurrency()
  }

  const value = {
    currency,
    loading,
    formatCurrency,
    getCurrencySymbol,
    updateCurrency,
    refreshCurrency,
    currencySymbols
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export default CurrencyContext