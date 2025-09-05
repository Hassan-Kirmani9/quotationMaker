import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { post } from '../../api/axios'

import PageTitle from '../../components/Typography/PageTitle'
import SectionTitle from '../../components/Typography/SectionTitle'
import { Input, Label, Button, HelperText } from '@windmill/react-ui'

function CreateProducts() {
  const history = useHistory()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sellingPrice: 0,
    purchasePrice: 0
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'sellingPrice' || name === 'purchasePrice' ? parseFloat(value) || 0 : value
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

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required'
    } else if (formData.name.length > 200) {
      newErrors.name = 'Product name cannot exceed 200 characters'
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters'
    }

    if (!formData.sellingPrice || formData.sellingPrice < 0) {
      newErrors.sellingPrice = 'Selling price must be 0 or greater'
    }

    if (!formData.purchasePrice || formData.purchasePrice < 0) {
      newErrors.purchasePrice = 'Purchase price must be 0 or greater'
    }

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
      const cleanedData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        sellingPrice: parseFloat(formData.sellingPrice),
        purchasePrice: parseFloat(formData.purchasePrice)
      }

      const response = await post("/products", cleanedData)
      
      if (response.success) {
        alert('Product created successfully!')
        history.push('/app/products')
      } else {
        setApiError(response.message || 'Failed to create product. Please try again.')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      
      if (error.response?.data?.message) {
        setApiError(error.response.data.message)
      } else if (error.response?.data?.error) {
        if (typeof error.response.data.error === 'string') {
          setApiError(error.response.data.error)
        } else if (error.response.data.error.errors) {
          const backendErrors = {}
          Object.keys(error.response.data.error.errors).forEach(key => {
            backendErrors[key] = error.response.data.error.errors[key].message
          })
          setErrors(backendErrors)
        }
      } else if (error.message) {
        setApiError(error.message)
      } else {
        setApiError('Failed to create product. Please check your connection and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    history.push('/app/products')
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <PageTitle>Add New Product</PageTitle>
        <Button 
          type="button"
          layout="outline" 
          onClick={handleCancel}
          disabled={loading}
        >
          Back to Products
        </Button>
      </div>

      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <SectionTitle>Product Information</SectionTitle>
        
        <form onSubmit={handleSubmit}>
          {apiError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {apiError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <Label>
              <span>Product Name *</span>
              <Input 
                className="mt-1" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter product name" 
                required
                valid={!errors.name}
                maxLength={200}
              />
              {errors.name && (
                <HelperText valid={false}>{errors.name}</HelperText>
              )}
            </Label>

            <Label>
              <span>Description</span>
              <textarea
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Enter product description (optional)"
                maxLength={1000}
              />
              {errors.description && (
                <HelperText valid={false}>{errors.description}</HelperText>
              )}
            </Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Label>
                <span>Purchase Price *</span>
                <Input 
                  className="mt-1" 
                  name="purchasePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.purchasePrice}
                  onChange={handleInputChange}
                  placeholder="0.00" 
                  required
                  valid={!errors.purchasePrice}
                />
                {errors.purchasePrice && (
                  <HelperText valid={false}>{errors.purchasePrice}</HelperText>
                )}
              </Label>

              <Label>
                <span>Selling Price *</span>
                <Input 
                  className="mt-1" 
                  name="sellingPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.sellingPrice}
                  onChange={handleInputChange}
                  placeholder="0.00" 
                  required
                  valid={!errors.sellingPrice}
                />
                {errors.sellingPrice && (
                  <HelperText valid={false}>{errors.sellingPrice}</HelperText>
                )}
              </Label>
            </div>
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
              style={{backgroundColor:"#AA1A21"}}
              className="text-white"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}

export default CreateProducts