import React, { useState, useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { get, put } from '../../api/axios'
import PageTitle from '../../components/Typography/PageTitle'
import SectionTitle from '../../components/Typography/SectionTitle'
import { Input, Label, Button, Select, Textarea, HelperText } from '@windmill/react-ui'
import { useCurrency } from '../../context/CurrencyContext'

function EditQuotations() {
  const history = useHistory()
  const { currency, formatCurrency, getCurrencySymbol } = useCurrency()

  const { id } = useParams()

  const [formData, setFormData] = useState({
    client: '',
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    taxRate: 0,
    currency: '',
    notes: '',
    terms: ''
  })

  const [quotationItems, setQuotationItems] = useState([
    {
      product: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    }
  ])

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [clientsList, setClientsList] = useState([])
  const [productsList, setProductsList] = useState([])

  // Calculated values
  const [subtotal, setSubtotal] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [taxAmount, setTaxAmount] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)

  // Fetch quotation and dropdown data
  useEffect(() => {
    const loadQuotationData = async () => {
      try {
        setFetching(true)
        setApiError('')

        const [quotationResponse, clientsResponse, productsResponse] = await Promise.all([
          get(`/quotations/${id}`),
          get("/clients"),
          get("/products")
        ])

        if (!quotationResponse.success) {
          throw new Error('Quotation not found')
        }

        const quotation = quotationResponse.data.quotation

        // Set form data
        setFormData({
          client: quotation.client?._id || '',
          title: quotation.title || '',
          description: quotation.description || '',
          discountType: quotation.discountType || 'percentage',
          discountValue: quotation.discountValue || 0,
          taxRate: quotation.taxRate || 0,
          currency: quotation.currency || '',
          notes: quotation.notes || '',
          terms: quotation.terms || ''
        })

        // Set quotation items
        if (quotation.items && quotation.items.length > 0) {
          setQuotationItems(quotation.items.map(item => ({
            product: item.product?._id || item.product || '',
            description: item.description || '',
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            totalPrice: item.totalPrice || 0
          })))
        }

        // Set dropdown data
        if (clientsResponse.success) {
          setClientsList(clientsResponse.data.clients || [])
        }

        if (productsResponse.success) {
          setProductsList(productsResponse.data.products || [])
        }

      } catch (error) {
        console.error('Error loading quotation:', error)
        setApiError(error.message || 'Failed to load quotation')
      } finally {
        setFetching(false)
      }
    }

    if (id) {
      loadQuotationData()
    }
  }, [id])

  // Calculate totals whenever items or discounts change
  useEffect(() => {
    const newSubtotal = quotationItems.reduce((sum, item) => sum + (parseFloat(item.totalPrice) || 0), 0)
    setSubtotal(newSubtotal)

    const newDiscountAmount = formData.discountType === 'percentage' 
      ? (newSubtotal * formData.discountValue) / 100
      : formData.discountValue

    setDiscountAmount(newDiscountAmount)

    const afterDiscount = newSubtotal - newDiscountAmount
    const newTaxAmount = (afterDiscount * formData.taxRate) / 100
    setTaxAmount(newTaxAmount)

    const newTotalAmount = afterDiscount + newTaxAmount
    setTotalAmount(newTotalAmount)
  }, [quotationItems, formData.discountType, formData.discountValue, formData.taxRate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'discountValue' || name === 'taxRate' ? parseFloat(value) || 0 : value
    }))

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    if (apiError) {
      setApiError('')
    }
  }

  // Handle item changes
  const handleItemChange = (index, field, value) => {
    const items = [...quotationItems]
    items[index][field] = value

    // If product is selected, auto-fill price and description
    if (field === 'product' && value) {
      const selectedProduct = productsList.find(p => p._id === value)
      if (selectedProduct) {
        items[index].unitPrice = selectedProduct.sellingPrice
        items[index].description = selectedProduct.description
      }
    }

    // Calculate total price for this item
    if (field === 'quantity' || field === 'unitPrice' || field === 'product') {
      const quantity = parseFloat(items[index].quantity) || 0
      const unitPrice = parseFloat(items[index].unitPrice) || 0
      items[index].totalPrice = quantity * unitPrice
    }

    setQuotationItems(items)
  }

  const addQuotationItem = () => {
    setQuotationItems([...quotationItems, {
      product: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    }])
  }

  const removeQuotationItem = (index) => {
    if (quotationItems.length > 1) {
      const updatedItems = quotationItems.filter((_, i) => i !== index)
      setQuotationItems(updatedItems)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.client.trim()) {
      newErrors.client = 'Client is required'
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    // Validate items
    quotationItems.forEach((item, index) => {
      if (!item.product) {
        newErrors[`item_${index}_product`] = 'Product is required'
      }
      if (!item.quantity || parseFloat(item.quantity) <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0'
      }
      if (!item.unitPrice || parseFloat(item.unitPrice) < 0) {
        newErrors[`item_${index}_unitPrice`] = 'Unit price cannot be negative'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setApiError('')

    try {
      const quotationData = {
        ...formData,
        items: quotationItems.map(item => ({
          product: item.product,
          description: item.description,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice)
        }))
      }

      const response = await put(`/quotations/${id}`, quotationData)

      if (response.success) {
        alert('Quotation updated successfully!')
        history.push('/app/quotations')
      } else {
        setApiError(response.message || 'Failed to update quotation. Please try again.')
      }
    } catch (error) {
      console.error('Error updating quotation:', error)

      if (error.response?.data?.message) {
        setApiError(error.response.data.message)
      } else if (error.message) {
        setApiError(error.message)
      } else {
        setApiError('Failed to update quotation. Please check your connection and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
      history.push('/app/quotations')
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading quotation...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <PageTitle>Edit Quotation</PageTitle>
      </div>

      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <form onSubmit={handleSubmit}>
          {apiError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {apiError}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Label>
              <span>Client *</span>
              <Select
                className="mt-1"
                name="client"
                value={formData.client}
                onChange={handleInputChange}
                required
                valid={!errors.client}
              >
                <option value="">Select Client</option>
                {clientsList.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name} - {client.businessName}
                  </option>
                ))}
              </Select>
              {errors.client && <HelperText valid={false}>{errors.client}</HelperText>}
            </Label>

            <Label>
              <span>Currency</span>
              <Input
                className="mt-1"
                name="currency"
                value={formData.currency || "Will use default currency from configuration"}
                onChange={handleInputChange}
                placeholder="Currency"
              />
              <HelperText>Currency is set in Configuration settings</HelperText>
            </Label>

            <Label className="md:col-span-2">
              <span>Title *</span>
              <Input
                className="mt-1"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter quotation title"
                required
                valid={!errors.title}
              />
              {errors.title && (
                <HelperText valid={false}>{errors.title}</HelperText>
              )}
            </Label>

            <Label className="md:col-span-2">
              <span>Description</span>
              <Textarea
                className="mt-1"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Enter quotation description"
              />
            </Label>
          </div>

          {/* Quotation Items */}
          <SectionTitle>Quotation Items</SectionTitle>
          <div className="mb-6">
            {quotationItems.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4 p-4 border rounded-lg">
                <Label className="md:col-span-2">
                  <span>Product *</span>
                  <Select
                    className="mt-1"
                    value={item.product}
                    onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                    required
                    valid={!errors[`item_${index}_product`]}
                  >
                    <option value="">Select Product</option>
                    {productsList.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </Select>
                  {errors[`item_${index}_product`] && (
                    <HelperText valid={false}>{errors[`item_${index}_product`]}</HelperText>
                  )}
                </Label>

                <Label>
                  <span>Quantity *</span>
                  <Input
                    className="mt-1"
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    placeholder="1"
                    required
                    valid={!errors[`item_${index}_quantity`]}
                  />
                  {errors[`item_${index}_quantity`] && (
                    <HelperText valid={false}>{errors[`item_${index}_quantity`]}</HelperText>
                  )}
                </Label>

                <Label>
                  <span>Unit Price *</span>
                  <Input
                    className="mt-1"
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                    placeholder="0.00"
                    required
                    valid={!errors[`item_${index}_unitPrice`]}
                  />
                  {errors[`item_${index}_unitPrice`] && (
                    <HelperText valid={false}>{errors[`item_${index}_unitPrice`]}</HelperText>
                  )}
                </Label>

                <Label>
                  <span>Total Price</span>
                  <Input
                    className="mt-1"
                    type="number"
                    value={item.totalPrice.toFixed(2)}
                    readOnly
                  />
                </Label>

                <div className="flex items-end">
                  <Button
                    type="button"
                    layout="outline"
                    onClick={() => removeQuotationItem(index)}
                    disabled={quotationItems.length === 1}
                    className="w-full"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            <Button
              type="button"
              layout="outline"
              onClick={addQuotationItem}
              className="mt-2"
            >
              Add Item
            </Button>
          </div>

          {/* Pricing Summary */}
          <SectionTitle>Pricing Details</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Label>
              <span>Subtotal</span>
              <Input 
                value={subtotal.toFixed(2)} 
                className="mt-1"
                type="number"
                readOnly
              />
            </Label>

            <Label>
              <span>Discount Type</span>
              <Select
                name="discountType"
                value={formData.discountType}
                onChange={handleInputChange}
                className="mt-1"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </Select>
            </Label>

            <Label>
              <span>Discount Value</span>
              <Input
                name="discountValue"
                value={formData.discountValue}
                onChange={handleInputChange}
                className="mt-1"
                type="number"
                step="0.01"
                min="0"
                placeholder={formData.discountType === 'percentage' ? '0%' : '0.00'}
              />
            </Label>

            <Label>
              <span>Discount Amount</span>
              <Input 
                value={discountAmount.toFixed(2)} 
                className="mt-1"
                type="number"
                readOnly
              />
            </Label>

            <Label>
              <span>Tax Rate (%)</span>
              <Input
                name="taxRate"
                value={formData.taxRate}
                onChange={handleInputChange}
                className="mt-1"
                type="number"
                step="0.01"
                min="0"
                max="100"
              />
            </Label>

            <Label>
              <span>Tax Amount</span>
              <Input 
                value={taxAmount.toFixed(2)} 
                className="mt-1"
                type="number"
                readOnly
              />
            </Label>

            <Label className="md:col-span-2">
              <span className="text-lg font-semibold">Total Amount</span>
              <Input 
                value={totalAmount.toFixed(2)} 
                className="mt-1 text-lg font-semibold"
                type="number"
                readOnly
              />
            </Label>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            <Label>
              <span>Terms & Conditions</span>
              <Textarea
                className="mt-1"
                name="terms"
                value={formData.terms}
                onChange={handleInputChange}
                rows="3"
                placeholder="Enter terms and conditions"
              />
            </Label>

            <Label>
              <span>Notes</span>
              <Textarea
                className="mt-1"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="2"
                placeholder="Enter any additional notes"
              />
            </Label>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button
              type="button"
              layout="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              style={{ backgroundColor: "#AA1A21" }}
              className="text-white"
              disabled={loading || clientsList.length === 0 || productsList.length === 0}
            >
              {loading ? 'Updating...' : 'Update Quotation'}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}

export default EditQuotations