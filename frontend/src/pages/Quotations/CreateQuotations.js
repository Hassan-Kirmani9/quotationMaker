import React, { useState, useEffect, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { post, get } from '../../api/axios'
import PageTitle from '../../components/Typography/PageTitle'
import SectionTitle from '../../components/Typography/SectionTitle'
import { Input, Label, Button, Select, Textarea, HelperText } from '@windmill/react-ui'
import { useCurrency } from '../../context/CurrencyContext'
import { FaTable, FaTrash, FaPlus, FaMinus } from 'react-icons/fa'

const AutocompleteSelect = ({ value, onChange, options, placeholder, error, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option.size && option.size.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const selectedOption = options.find(option => option._id === value);
  const displayValue = selectedOption ?
    `${selectedOption.name}${selectedOption.size ? ` (${selectedOption.size.name})` : ''}` : '';
  const handleInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsOpen(true);
    setHighlightedIndex(-1);

    if (term === '') {
      onChange('');
    }
  };

  const handleOptionSelect = (option) => {
    onChange(option._id);
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
    setSearchTerm('');
  };

  const handleBlur = (e) => {
    setTimeout(() => {
      if (!dropdownRef.current?.contains(e.relatedTarget)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    }, 150);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Input
        ref={inputRef}
        type="text"
        value={isOpen ? searchTerm : displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full ${error ? 'border-red-500' : ''}`}
        autoComplete="off"
      />

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto dark:bg-gray-700 dark:text-gray-400">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">No products found</div>
          ) : (
            filteredOptions.map((option, index) => (
              <div
                key={option._id}
                onClick={() => handleOptionSelect(option)}
                className={`px-3 py-2 cursor-pointer text-sm ${index === highlightedIndex
                  ? 'bg-blue-50 text-blue-900'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-600 dark:hover:text-white '
                  } ${value === option._id ? 'bg-blue-100 text-blue-900' : ''}`}
              >
                <div>
                  <div className="font-medium">{option.name}</div>
                  {option.size && (
                    <div className="text-xs text-gray-500">Size: {option.size.name}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const MobileItemCard = ({ item, index, productsList, errors, handleItemChange, removeQuotationItem, quotationItems }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm dark:bg-gray-800 dark:border-gray-600">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Item #{index + 1}</h4>
        {quotationItems.length > 1 && (
          <Button
            type="button"
            layout="outline"
            onClick={() => removeQuotationItem(index)}
            className="px-2 py-1 text-xs"
            style={{ backgroundColor: '#ffffff' }}
          >
            <FaTrash className='text-red-700' />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {/* Product Selection */}
        <Label>
          <span className="text-sm">Product *</span>
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
                {product.name}{product.size ? ` (${product.size.name})` : ''}
              </option>
            ))}
          </Select>
          {errors[`item_${index}_product`] && (
            <HelperText valid={false} className="mt-1 text-xs">
              {errors[`item_${index}_product`]}
            </HelperText>
          )}
        </Label>
        {/* Quantity and Unit Price Row */}
        <div className="grid grid-cols-2 gap-3">
          <Label>
            <span className="text-sm">Quantity *</span>
            <Input
              type="number"
              step="1"
              min="0"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
              placeholder="1"
              required
              valid={!errors[`item_${index}_quantity`]}
              className="w-full mt-1"
            />
            {errors[`item_${index}_quantity`] && (
              <HelperText valid={false} className="mt-1 text-xs">
                {errors[`item_${index}_quantity`]}
              </HelperText>
            )}
          </Label>

          <Label>
            <span className="text-sm">Unit Price *</span>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={item.unitPrice}
              onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
              placeholder="0.00"
              required
              valid={!errors[`item_${index}_unitPrice`]}
              className="w-full mt-1"
            />
            {errors[`item_${index}_unitPrice`] && (
              <HelperText valid={false} className="mt-1 text-xs">
                {errors[`item_${index}_unitPrice`]}
              </HelperText>
            )}
          </Label>
        </div>

        {/* Discount and Total Row */}
        <div className="grid grid-cols-2 gap-3">
          <Label>
            <span className="text-sm">Discount %</span>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={item.discountValue}
              onChange={(e) => handleItemChange(index, 'discountValue', e.target.value)}
              placeholder="0"
              className="w-full mt-1"
            />
          </Label>

          <Label>
            <span className="text-sm">Total</span>
            <Input
              value={item.totalPrice}
              readOnly
              className="w-full bg-gray-50 mt-1"
            />
          </Label>
        </div>
      </div>
    </div>
  );
};

function CreateQuotations() {
  const history = useHistory()
  const { currency, formatCurrency, getCurrencySymbol } = useCurrency()
  const [formData, setFormData] = useState({
    client: '',
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    taxRate: 0,
    currency: '',
  })

  const [quotationItems, setQuotationItems] = useState([
    {
      product: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discountValue: 0,
      totalPrice: 0
    }
  ])

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [clientsList, setClientsList] = useState([])
  const [productsList, setProductsList] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [configuration, setConfiguration] = useState(null)
  const [validityDays, setValidityDays] = useState(30)
  const [validUntil, setValidUntil] = useState('')
  const [subtotal, setSubtotal] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [taxAmount, setTaxAmount] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [grossAmount, setGrossAmount] = useState(0)
  const [itemDiscountsTotal, setItemDiscountsTotal] = useState(0)

  const fetchDropdownData = async () => {
    try {
      setDataLoading(true)

      const [clientsResponse, productsResponse, configResponse] = await Promise.all([
        get("/clients"),
        get("/products"),
        get("/configuration")
      ])

      if (clientsResponse.success) {
        setClientsList(clientsResponse.data.clients || [])
      }

      if (productsResponse.success) {
        setProductsList(productsResponse.data.products || [])
      }

      if (configResponse.success && configResponse.data) {
        setConfiguration(configResponse.data)
        const defaultValidity = configResponse.data.quotation?.validity || 30
        setValidityDays(defaultValidity)

        // Calculate default validUntil date
        const defaultValidUntil = new Date()
        defaultValidUntil.setDate(defaultValidUntil.getDate() + defaultValidity)
        setValidUntil(defaultValidUntil.toISOString().split('T')[0])
      }

    } catch (error) {
      console.error('Error fetching dropdown data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    fetchDropdownData()
  }, [])

  useEffect(() => {
    const newSubtotal = quotationItems.reduce((sum, item) => sum + (parseFloat(item.totalPrice) || 0), 0)
    setSubtotal(newSubtotal)

    const newDiscountAmount = (newSubtotal * formData.discountValue) / 100

    setDiscountAmount(newDiscountAmount)

    const afterDiscount = newSubtotal - newDiscountAmount
    const newTaxAmount = (afterDiscount * formData.taxRate) / 100
    setTaxAmount(newTaxAmount)

    const newTotalAmount = afterDiscount + newTaxAmount
    setTotalAmount(newTotalAmount)
  }, [quotationItems, formData.discountType, formData.discountValue, formData.taxRate])

  useEffect(() => {
    const newGrossAmount = quotationItems.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0
      const unitPrice = parseFloat(item.unitPrice) || 0
      return sum + (quantity * unitPrice)
    }, 0)
    setGrossAmount(newGrossAmount)

    const newItemDiscountsTotal = newGrossAmount - subtotal
    setItemDiscountsTotal(newItemDiscountsTotal)
  }, [quotationItems, subtotal])

  useEffect(() => {
    if (validityDays) {
      const newValidUntil = new Date()
      newValidUntil.setDate(newValidUntil.getDate() + parseInt(validityDays))
      setValidUntil(newValidUntil.toISOString().split('T')[0])
    }
  }, [validityDays])

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

  const handleItemChange = (index, field, value) => {
    const items = [...quotationItems]
    items[index][field] = value

    if (field === 'product' && value) {
      const selectedProduct = productsList.find(p => p._id === value)
      if (selectedProduct) {
        items[index].unitPrice = selectedProduct.sellingPrice
        items[index].description = selectedProduct.name
      }
    }
    if (field === 'quantity' || field === 'unitPrice' || field === 'product' || field === 'discountValue') {
      const quantity = parseFloat(items[index].quantity) || 0
      const unitPrice = parseFloat(items[index].unitPrice) || 0
      const discountValue = parseFloat(items[index].discountValue) || 0

      const subtotalBeforeDiscount = quantity * unitPrice
      const itemDiscountAmount = (subtotalBeforeDiscount * discountValue) / 100
      items[index].totalPrice = subtotalBeforeDiscount - itemDiscountAmount
    }

    setQuotationItems(items)
  }

  const addQuotationItem = () => {
    setQuotationItems([...quotationItems, {
      product: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discountValue: 0,
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
        validUntil,
        date: new Date(),
        totalAmount: totalAmount,
        subtotal: subtotal,
        discountAmount: discountAmount,
        taxAmount: taxAmount,
        items: quotationItems.map(item => ({
          product: item.product,
          description: item.description,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          discountValue: parseFloat(item.discountValue) || 0
        }))
      }
      const response = await post("/quotations", quotationData)
      if (response.success) {
        alert('Quotation created successfully!')
        // Check if the response structure has the quotation ID
        const quotationId = response.data?.quotation?._id || response.data?._id
        if (quotationId) {
          history.push(`/app/quotations/view/${quotationId}`)
        } else {
          history.push('/app/quotations')
        }
      } else {
        setApiError(response.message || 'Failed to create quotation. Please try again.')
      }
    } catch (error) {
      console.error('Error creating quotation:', error)

      if (error.response?.data?.message) {
        setApiError(error.response.data.message)
      } else if (error.message) {
        setApiError(error.message)
      } else {
        setApiError('Failed to create quotation. Please check your connection and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All entered data will be lost.')) {
      history.push('/app/quotations')
    }
  }

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading form data...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <PageTitle>Create New Quotation</PageTitle>
      </div>

      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <form onSubmit={handleSubmit}>
          {apiError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {apiError}
            </div>
          )}

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
              <span>Validity Period (Days) *</span>
              <Input
                className="mt-1"
                name="validityDays"
                value={validityDays}
                onChange={(e) => setValidityDays(e.target.value)}
                type="number"
                min="1"
                max="365"
                required
              />
              <HelperText>Number of days this quotation will remain valid</HelperText>
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

          {/* Items Section - Desktop Table View (Hidden on Mobile) */}
          <div className="mb-6 hidden md:block">
            <div className="overflow-x-auto" style={{ overflow: 'visible' }}>
              <table className="min-w-full border border-gray-200 rounded-lg dark:border-gray-800">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border-b w-2/3 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border-b w-1/12 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border-b w-1/12 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600">
                      Rate
                    </th>
                    <th className="px-0 py-3 text-left text-xs font-medium text-gray-700 border-b w-1/12 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600">
                      Discount %
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border-b w-1/4 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600">
                      Total
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 border-b w-1/12 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {quotationItems.map((item, index) => (
                    <tr key={index} className="border-b dark:border-gray-600">
                      <td className="px-2 py-3 dark:bg-gray-700 dark:text-gray-400">
                        <AutocompleteSelect
                          value={item.product}
                          onChange={(value) => handleItemChange(index, 'product', value)}
                          options={productsList}
                          placeholder="Search and select product..."
                          error={errors[`item_${index}_product`]}
                          className="w-full"
                        />
                        {errors[`item_${index}_product`] && (
                          <HelperText valid={false} className="mt-1 text-xs">
                            {errors[`item_${index}_product`]}
                          </HelperText>
                        )}
                      </td>

                      <td className="px-2 py-3 dark:bg-gray-700 dark:text-gray-400">
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          placeholder="1"
                          required
                          valid={!errors[`item_${index}_quantity`]}
                          className="w-full"
                        />
                        {errors[`item_${index}_quantity`] && (
                          <HelperText valid={false} className="mt-1 text-xs">
                            {errors[`item_${index}_quantity`]}
                          </HelperText>
                        )}
                      </td>

                      <td className="px-0 py-3 dark:bg-gray-700 dark:text-gray-400">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          placeholder="0.00"
                          required
                          valid={!errors[`item_${index}_unitPrice`]}
                          className="w-full"
                        />
                        {errors[`item_${index}_unitPrice`] && (
                          <HelperText valid={false} className="mt-1 text-xs">
                            {errors[`item_${index}_unitPrice`]}
                          </HelperText>
                        )}
                      </td>

                      <td className="px-2 py-3 dark:bg-gray-700 dark:text-gray-400">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={item.discountValue}
                          onChange={(e) => handleItemChange(index, 'discountValue', e.target.value)}
                          placeholder="0"
                          className="w-full"
                        />
                      </td>

                      <td className="px-2 py-3 dark:bg-gray-700 dark:text-gray-400">
                        <Input
                          value={item.totalPrice}
                          readOnly
                          className="w-full bg-gray-50"
                        />
                      </td>

                      <td className="px-2 py-3 text-center dark:bg-gray-700 dark:text-gray-400">
                        {quotationItems.length > 1 && (
                          <Button
                            type="button"
                            layout="outline"
                            onClick={() => removeQuotationItem(index)}
                            className="px-2 py-1 text-xs"
                            style={{ backgroundColor: '#ffffff' }}
                          >
                            <FaTrash className='text-red-700' />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Button
              type="button"
              layout="outline"
              onClick={addQuotationItem}
              className="mt-4"
            >
              <FaPlus className="mr-2" />
              Add Item
            </Button>
          </div>

          {/* Items Section - Mobile Card View (Visible on Mobile Only) */}
          <div className="mb-6 md:hidden">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Quotation Items</h3>

            {quotationItems.map((item, index) => (
              <MobileItemCard
                key={index}
                item={item}
                index={index}
                productsList={productsList}
                errors={errors}
                handleItemChange={handleItemChange}
                removeQuotationItem={removeQuotationItem}
                quotationItems={quotationItems}
              />
            ))}

            <Button
              type="button"
              layout="outline"
              onClick={addQuotationItem}
              className="w-full mt-4 flex items-center justify-center"
            >
              <FaPlus className="mr-2" />
              Add New Item
            </Button>
          </div>

          {/* Pricing Details Section */}
          <SectionTitle>Pricing Details</SectionTitle>

          {/* Desktop Pricing Layout (Hidden on Mobile) */}
          <div className="mb-6 hidden md:block">
            <div className="grid grid-cols-12 gap-2 items-end">
              {/* Gross Amount */}
              <div className="col-span-3">
                <Label>
                  <span className="text-sm">Gross Amount</span>
                  <Input
                    value={formatCurrency(subtotal)}
                    className="mt-1"
                    readOnly
                  />
                </Label>
              </div>

              {/* Discount Percentage */}
              <div className="col-span-1">
                <Label>
                  <span className="text-xs">Discount %</span>
                  <div className="relative mt-1">
                    <Input
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      type="number"
                      step="0.01"
                      min="0"
                      max="99"
                      placeholder="0"
                      maxLength="2"
                      style={{
                        WebkitAppearance: 'none',
                        MozAppearance: 'textfield'
                      }}
                      className="pl-3 pr-6 text-left text-sm w-20"
                    />
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">%</span>
                    </div>
                  </div>
                </Label>
              </div>

              {/* Discount Amount */}
              <div className="col-span-2">
                <Label>
                  <span className="text-sm">Discount Amount</span>
                  <Input
                    value={formatCurrency(discountAmount)}
                    className="mt-1"
                    readOnly
                  />
                </Label>
              </div>

              {/* Tax Percentage */}
              <div className="col-span-1">
                <Label>
                  <span className="text-sm">Tax %</span>
                  <div className="relative mt-1">
                    <Input
                      name="taxRate"
                      value={formData.taxRate}
                      onChange={handleInputChange}
                      className="pl-3 pr-6 text-left text-sm w-20"
                      type="number"
                      step="0.01"
                      min="0"
                      max="99"
                      maxLength="2"
                      style={{
                        WebkitAppearance: 'none',
                        MozAppearance: 'textfield'
                      }}
                    />
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">%</span>
                    </div>
                  </div>
                </Label>
              </div>

              {/* Tax Amount */}
              <div className="col-span-2">
                <Label>
                  <span className="text-sm">Tax Amount</span>
                  <Input
                    value={formatCurrency(taxAmount)}
                    className="mt-1"
                    readOnly
                  />
                </Label>
              </div>

              {/* Total Amount */}
              <div className="col-span-3">
                <Label>
                  <span className="text-sm font-semibold">Total Amount</span>
                  <Input
                    value={`${currency} ${totalAmount.toFixed(2)}`}
                    className="mt-1 font-semibold"
                    readOnly
                  />
                </Label>
              </div>
            </div>
          </div>

          {/* Mobile Pricing Layout (Visible on Mobile Only) */}
          <div className="mb-6 md:hidden">
            <div className="space-y-4">
              {/* Gross Amount */}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Gross Amount:</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
              </div>

              {/* Discount Section */}
              <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-700">
                <div className="grid grid-cols-2 gap-3">
                  <Label>
                    <span className="text-sm">Discount %</span>
                    <div className="relative mt-1">
                      <Input
                        name="discountValue"
                        value={formData.discountValue}
                        onChange={handleInputChange}
                        type="number"
                        step="0.01"
                        min="0"
                        max="99"
                        placeholder="0"
                        className="pr-8"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">%</span>
                      </div>
                    </div>
                  </Label>

                  <Label>
                    <span className="text-sm">Discount Amount</span>
                    <Input
                      value={formatCurrency(discountAmount)}
                      className="mt-1 bg-white"
                      readOnly
                    />
                  </Label>
                </div>
              </div>

              {/* Tax Section */}
              <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-700">
                <div className="grid grid-cols-2 gap-3">
                  <Label>
                    <span className="text-sm">Tax %</span>
                    <div className="relative mt-1">
                      <Input
                        name="taxRate"
                        value={formData.taxRate}
                        onChange={handleInputChange}
                        type="number"
                        step="0.01"
                        min="0"
                        max="99"
                        className="pr-8"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">%</span>
                      </div>
                    </div>
                  </Label>

                  <Label>
                    <span className="text-sm">Tax Amount</span>
                    <Input
                      value={formatCurrency(taxAmount)}
                      className="mt-1 bg-white"
                      readOnly
                    />
                  </Label>
                </div>
              </div>

              {/* Total Amount */}
              <div className="flex justify-between items-center p-4 rounded-lg dark:text-gray-400">
                <span className="text-lg font-bold">Total Amount:</span>
                <span className="text-lg font-bold">{currency} {totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons - Responsive Layout */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-0 sm:space-x-4 mt-6">
            <Button
              type="button"
              layout="outline"
              onClick={handleCancel}
              disabled={loading}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              style={{ backgroundColor: "#AA1A21" }}
              className="text-white w-full sm:w-auto order-1 sm:order-2"
              disabled={loading || clientsList.length === 0 || productsList.length === 0}
            >
              {loading ? 'Creating...' : 'Create Quotation'}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}

export default CreateQuotations