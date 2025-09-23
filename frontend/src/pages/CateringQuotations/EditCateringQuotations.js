import React, { useState, useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { get, patch } from '../../api/axios'
import PageTitle from '../../components/Typography/PageTitle'
import SectionTitle from '../../components/Typography/SectionTitle'
import { Input, Label, Button, Select, Textarea, HelperText } from '@windmill/react-ui'
import { useCurrency } from '../../context/CurrencyContext'
import { FaTable, FaTrash, FaPlus, FaMinus } from 'react-icons/fa'

function EditCateringQuotation() {
  const history = useHistory()
  const { currency, formatCurrency } = useCurrency()
  const { id } = useParams()

  const [formData, setFormData] = useState({
    client: '',
  })

  const [menu, setMenu] = useState({
    perThaalRate: 0,
    numberOfThaals: 0,
    total: 0,
    items: [
      { name: '', amount: 0 }
    ]
  })

  const [extras, setExtras] = useState({
    total: 0,
    items: [
      { name: '', amount: 0 }
    ]
  })

  const [others, setOthers] = useState({
    total: 0,
    items: [
      { name: '', amount: 0 }
    ]
  })

  const [costing, setCosting] = useState({
    total: 0,
    discount: 0,
    advance: 0,
    grandTotal: 0
  })

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [clientsList, setClientsList] = useState([])

  useEffect(() => {
    const loadCateringData = async () => {
      try {
        setFetching(true)
        setApiError('')

        const [cateringResponse, clientsResponse] = await Promise.all([
          get(`/catering-quotations/${id}`),
          get("/clients")
        ])

        if (!cateringResponse.success) {
          throw new Error('Catering Quotation not found')
        }

        const cateringData = cateringResponse.data

        setFormData({
          client: cateringData.client?._id || cateringData.client || '',
        })

        if (cateringData.menu) {
          setMenu({
            perThaalRate: cateringData.menu.perThaalRate || 0,
            numberOfThaals: cateringData.menu.numberOfThaals || 0,
            total: cateringData.menu.total || 0,
            items: cateringData.menu.items && cateringData.menu.items.length > 0 
              ? cateringData.menu.items 
              : [{ name: '', amount: 0 }]
          })
        }

        if (cateringData.extras) {
          setExtras({
            total: cateringData.extras.total || 0,
            items: cateringData.extras.items && cateringData.extras.items.length > 0 
              ? cateringData.extras.items 
              : [{ name: '', amount: 0 }]
          })
        }

        if (cateringData.others) {
          setOthers({
            total: cateringData.others.total || 0,
            items: cateringData.others.items && cateringData.others.items.length > 0 
              ? cateringData.others.items 
              : [{ name: '', amount: 0 }]
          })
        }

        if (cateringData.costing) {
          setCosting({
            total: cateringData.costing.total || 0,
            discount: cateringData.costing.discount || 0,
            advance: cateringData.costing.advance || 0,
            grandTotal: cateringData.costing.grandTotal || 0
          })
        }

        if (clientsResponse.success) {
          setClientsList(clientsResponse.data.clients || [])
        }

      } catch (error) {
        console.error('Error loading catering quotation:', error)
        setApiError(error.message || 'Failed to load catering quotation')
      } finally {
        setFetching(false)
      }
    }

    if (id) {
      loadCateringData()
    }
  }, [id])

  useEffect(() => {
    const menuTotal = menu.perThaalRate * menu.numberOfThaals
    setMenu(prev => ({ ...prev, total: menuTotal }))
  }, [menu.perThaalRate, menu.numberOfThaals])

  useEffect(() => {
    const extrasTotal = extras.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
    setExtras(prev => ({ ...prev, total: extrasTotal }))
  }, [extras.items])

  useEffect(() => {
    const othersTotal = others.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
    setOthers(prev => ({ ...prev, total: othersTotal }))
  }, [others.items])

  useEffect(() => {
    const total = menu.total + extras.total + others.total
    const grandTotal = total - costing.discount
    setCosting(prev => ({ ...prev, total, grandTotal }))
  }, [menu.total, extras.total, others.total, costing.discount])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
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

  const handleMenuChange = (field, value) => {
    setMenu(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }))
  }

  const handleMenuItemChange = (index, field, value) => {
    const updatedItems = [...menu.items]
    updatedItems[index] = { ...updatedItems[index], [field]: field === 'amount' ? (parseFloat(value) || 0) : value }
    setMenu(prev => ({ ...prev, items: updatedItems }))
  }

  const addMenuItem = () => {
    setMenu(prev => ({
      ...prev,
      items: [...prev.items, { name: '', amount: 0 }]
    }))
  }

  const removeMenuItem = (index) => {
    if (menu.items.length > 1) {
      const updatedItems = menu.items.filter((_, i) => i !== index)
      setMenu(prev => ({ ...prev, items: updatedItems }))
    }
  }

  const handleExtrasItemChange = (index, field, value) => {
    const updatedItems = [...extras.items]
    updatedItems[index] = { ...updatedItems[index], [field]: field === 'amount' ? (parseFloat(value) || 0) : value }
    setExtras(prev => ({ ...prev, items: updatedItems }))
  }

  const addExtrasItem = () => {
    setExtras(prev => ({
      ...prev,
      items: [...prev.items, { name: '', amount: 0 }]
    }))
  }

  const removeExtrasItem = (index) => {
    if (extras.items.length > 1) {
      const updatedItems = extras.items.filter((_, i) => i !== index)
      setExtras(prev => ({ ...prev, items: updatedItems }))
    }
  }

  const handleOthersItemChange = (index, field, value) => {
    const updatedItems = [...others.items]
    updatedItems[index] = { ...updatedItems[index], [field]: field === 'amount' ? (parseFloat(value) || 0) : value }
    setOthers(prev => ({ ...prev, items: updatedItems }))
  }

  const addOthersItem = () => {
    setOthers(prev => ({
      ...prev,
      items: [...prev.items, { name: '', amount: 0 }]
    }))
  }

  const removeOthersItem = (index) => {
    if (others.items.length > 1) {
      const updatedItems = others.items.filter((_, i) => i !== index)
      setOthers(prev => ({ ...prev, items: updatedItems }))
    }
  }

  const handleCostingChange = (field, value) => {
    setCosting(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.client.trim()) {
      newErrors.client = 'Client is required'
    }

    if (!menu.perThaalRate || menu.perThaalRate <= 0) {
      newErrors.perThaalRate = 'Per thaal rate is required and must be greater than 0'
    }

    if (!menu.numberOfThaals || menu.numberOfThaals <= 0) {
      newErrors.numberOfThaals = 'Number of thaals is required and must be greater than 0'
    }

    menu.items.forEach((item, index) => {
      if (!item.name.trim()) {
        newErrors[`menu_item_${index}_name`] = 'Menu item name is required'
      }
    })

    extras.items.forEach((item, index) => {
      if (!item.name.trim()) {
        newErrors[`extras_item_${index}_name`] = 'Extra item name is required'
      }
      if (item.amount < 0) {
        newErrors[`extras_item_${index}_amount`] = 'Amount cannot be negative'
      }
    })

    others.items.forEach((item, index) => {
      if (!item.name.trim()) {
        newErrors[`others_item_${index}_name`] = 'Other item name is required'
      }
      if (item.amount < 0) {
        newErrors[`others_item_${index}_amount`] = 'Amount cannot be negative'
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
      const cateringData = {
        client: formData.client,
        menu: {
          perThaalRate: menu.perThaalRate,
          numberOfThaals: menu.numberOfThaals,
          total: menu.total,
          items: menu.items.filter(item => item.name.trim() !== '')
        },
        extras: {
          total: extras.total,
          items: extras.items.filter(item => item.name.trim() !== '')
        },
        others: {
          total: others.total,
          items: others.items.filter(item => item.name.trim() !== '')
        },
        costing: {
          total: costing.total,
          discount: costing.discount,
          advance: costing.advance,
          grandTotal: costing.grandTotal
        }
      }

      const response = await patch(`/catering-quotations/${id}`, cateringData)

      if (response.success) {
        alert('Catering Quotation updated successfully!')
        history.push(`/app/catering-quotations/view/${id}`)
      } else {
        setApiError(response.message || 'Failed to update catering quotation. Please try again.')
      }
    } catch (error) {
      console.error('Error updating catering quotation:', error)

      if (error.response?.data?.message) {
        setApiError(error.response.data.message)
      } else if (error.message) {
        setApiError(error.message)
      } else {
        setApiError('Failed to update catering quotation. Please check your connection and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
      history.push('/app/catering-quotations')
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <PageTitle>Edit Catering Quotation</PageTitle>
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
          </div>

          <SectionTitle>Menu Section</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Label>
              <span>Per Thaal Rate *</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={menu.perThaalRate}
                onChange={(e) => handleMenuChange('perThaalRate', e.target.value)}
                placeholder="0.00"
                required
                valid={!errors.perThaalRate}
                className="mt-1"
              />
              {errors.perThaalRate && <HelperText valid={false}>{errors.perThaalRate}</HelperText>}
            </Label>

            <Label>
              <span>Number of Thaals *</span>
              <Input
                type="number"
                step="1"
                min="0"
                value={menu.numberOfThaals}
                onChange={(e) => handleMenuChange('numberOfThaals', e.target.value)}
                placeholder="0"
                required
                valid={!errors.numberOfThaals}
                className="mt-1"
              />
              {errors.numberOfThaals && <HelperText valid={false}>{errors.numberOfThaals}</HelperText>}
            </Label>

            <Label>
              <span>Menu Total</span>
              <Input
                type="number"
                value={menu.total.toFixed(2)}
                readOnly
                className="mt-1 bg-gray-50"
              />
            </Label>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Menu Items</h4>
            {menu.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 p-4 border border-gray-200 rounded-lg">
                <Label>
                  <span>Item Name *</span>
                  <Input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleMenuItemChange(index, 'name', e.target.value)}
                    placeholder="Enter menu item name"
                    required
                    valid={!errors[`menu_item_${index}_name`]}
                    className="mt-1"
                  />
                  {errors[`menu_item_${index}_name`] && (
                    <HelperText valid={false}>{errors[`menu_item_${index}_name`]}</HelperText>
                  )}
                </Label>

                <Label>
                  <span>Amount</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.amount}
                    onChange={(e) => handleMenuItemChange(index, 'amount', e.target.value)}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </Label>

                <div className="flex items-end">
                  {menu.items.length > 1 && (
                    <Button
                      type="button"
                      layout="outline"
                      onClick={() => removeMenuItem(index)}
                      className="mb-1"
                      style={{ backgroundColor: '#ffffff' }}
                    >
                      <FaTrash className='text-red-700' />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              layout="outline"
              onClick={addMenuItem}
              className="mt-2"
            >
              <FaPlus className="mr-2" />
              Add Menu Item
            </Button>
          </div>

          <SectionTitle>Extras Section</SectionTitle>
          <div className="mb-6">
            {extras.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 p-4 border border-gray-200 rounded-lg">
                <Label>
                  <span>Item Name *</span>
                  <Input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleExtrasItemChange(index, 'name', e.target.value)}
                    placeholder="Enter extra item name"
                    required
                    valid={!errors[`extras_item_${index}_name`]}
                    className="mt-1"
                  />
                  {errors[`extras_item_${index}_name`] && (
                    <HelperText valid={false}>{errors[`extras_item_${index}_name`]}</HelperText>
                  )}
                </Label>

                <Label>
                  <span>Amount *</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.amount}
                    onChange={(e) => handleExtrasItemChange(index, 'amount', e.target.value)}
                    placeholder="0.00"
                    required
                    valid={!errors[`extras_item_${index}_amount`]}
                    className="mt-1"
                  />
                  {errors[`extras_item_${index}_amount`] && (
                    <HelperText valid={false}>{errors[`extras_item_${index}_amount`]}</HelperText>
                  )}
                </Label>

                <div className="flex items-end">
                  {extras.items.length > 1 && (
                    <Button
                      type="button"
                      layout="outline"
                      onClick={() => removeExtrasItem(index)}
                      className="mb-1"
                      style={{ backgroundColor: '#ffffff' }}
                    >
                      <FaTrash className='text-red-700' />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            <div className="flex justify-between items-center mb-4">
              <Button
                type="button"
                layout="outline"
                onClick={addExtrasItem}
              >
                <FaPlus className="mr-2" />
                Add Extra Item
              </Button>
              <div className="text-lg font-semibold">
                Extras Total: {formatCurrency(extras.total)}
              </div>
            </div>
          </div>

          <SectionTitle>Others Section</SectionTitle>
          <div className="mb-6">
            {others.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 p-4 border border-gray-200 rounded-lg">
                <Label>
                  <span>Item Name *</span>
                  <Input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleOthersItemChange(index, 'name', e.target.value)}
                    placeholder="Enter other item name"
                    required
                    valid={!errors[`others_item_${index}_name`]}
                    className="mt-1"
                  />
                  {errors[`others_item_${index}_name`] && (
                    <HelperText valid={false}>{errors[`others_item_${index}_name`]}</HelperText>
                  )}
                </Label>

                <Label>
                  <span>Amount *</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.amount}
                    onChange={(e) => handleOthersItemChange(index, 'amount', e.target.value)}
                    placeholder="0.00"
                    required
                    valid={!errors[`others_item_${index}_amount`]}
                    className="mt-1"
                  />
                  {errors[`others_item_${index}_amount`] && (
                    <HelperText valid={false}>{errors[`others_item_${index}_amount`]}</HelperText>
                  )}
                </Label>

                <div className="flex items-end">
                  {others.items.length > 1 && (
                    <Button
                      type="button"
                      layout="outline"
                      onClick={() => removeOthersItem(index)}
                      className="mb-1"
                      style={{ backgroundColor: '#ffffff' }}
                    >
                      <FaTrash className='text-red-700' />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            <div className="flex justify-between items-center mb-4">
              <Button
                type="button"
                layout="outline"
                onClick={addOthersItem}
              >
                <FaPlus className="mr-2" />
                Add Other Item
              </Button>
              <div className="text-lg font-semibold">
                Others Total: {formatCurrency(others.total)}
              </div>
            </div>
          </div>

          <SectionTitle>Costing Details</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Label>
              <span>Total</span>
              <Input
                type="number"
                value={costing.total.toFixed(2)}
                readOnly
                className="mt-1 bg-gray-50"
              />
            </Label>

            <Label>
              <span>Discount</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={costing.discount}
                onChange={(e) => handleCostingChange('discount', e.target.value)}
                placeholder="0.00"
                className="mt-1"
              />
            </Label>

            <Label>
              <span>Advance</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={costing.advance}
                onChange={(e) => handleCostingChange('advance', e.target.value)}
                placeholder="0.00"
                className="mt-1"
              />
            </Label>

            <Label>
              <span className="font-semibold">Grand Total</span>
              <Input
                type="number"
                value={costing.grandTotal.toFixed(2)}
                readOnly
                className="mt-1 bg-gray-50 font-semibold"
              />
            </Label>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
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
              disabled={loading || clientsList.length === 0}
            >
              {loading ? 'Updating...' : 'Update Catering Quotation'}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}

export default EditCateringQuotation