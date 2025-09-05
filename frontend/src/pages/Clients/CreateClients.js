import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { post } from '../../api/axios'

import PageTitle from '../../components/Typography/PageTitle'
import SectionTitle from '../../components/Typography/SectionTitle'
import { Input, Label, Button, Select, HelperText } from '@windmill/react-ui'

function CreateClients() {
  const history = useHistory()
  
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    address: '',
    mobileNo: '',
    businessNo: '',
    city: '',
    country: ''
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')

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

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Client name is required'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters'
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required'
    } else if (formData.businessName.length > 150) {
      newErrors.businessName = 'Business name cannot exceed 150 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    if (!formData.mobileNo.trim()) {
      newErrors.mobileNo = 'Mobile number is required'
    }

    if (formData.businessNo && formData.businessNo.trim() === '') {
      setFormData(prev => ({
        ...prev,
        businessNo: ''
      }))
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required'
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
        ...formData,
        name: formData.name.trim(),
        businessName: formData.businessName.trim(),
        email: formData.email.trim().toLowerCase(),
        address: formData.address.trim(),
        mobileNo: formData.mobileNo.trim(),
        businessNo: formData.businessNo.trim() || undefined,
        city: formData.city.trim(),
        country: formData.country.trim()
      }

      const response = await post("/clients", cleanedData)
      
      if (response.success) {
        alert('Client created successfully!')
        history.push('/app/clients')
      } else {
        setApiError(response.message || 'Failed to create client. Please try again.')
      }
    } catch (error) {
      console.error('Error creating client:', error)
      
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
        setApiError('Failed to create client. Please check your connection and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    history.push('/app/clients')
  }

  const commonCountries = [
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'Germany',
    'France',
    'India',
    'Pakistan',
    'Bangladesh',
    'Other'
  ]

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <PageTitle>Add New Client</PageTitle>
        <Button 
          type="button"
          layout="outline" 
          onClick={handleCancel}
          disabled={loading}
        >
          Back to Clients
        </Button>
      </div>

      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <SectionTitle>Client Information</SectionTitle>
        
        <form onSubmit={handleSubmit}>
          {apiError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {apiError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Label>
              <span>Client Name *</span>
              <Input 
                className="mt-1" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter client's full name" 
                required
                valid={!errors.name}
                maxLength={100}
              />
              {errors.name && (
                <HelperText valid={false}>{errors.name}</HelperText>
              )}
            </Label>

            <Label>
              <span>Business Name *</span>
              <Input 
                className="mt-1" 
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="Enter business/company name" 
                required
                valid={!errors.businessName}
                maxLength={150}
              />
              {errors.businessName && (
                <HelperText valid={false}>{errors.businessName}</HelperText>
              )}
            </Label>

            <Label className="md:col-span-2">
              <span>Email Address *</span>
              <Input 
                className="mt-1" 
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="client@business.com" 
                required
                valid={!errors.email}
              />
              {errors.email && (
                <HelperText valid={false}>{errors.email}</HelperText>
              )}
            </Label>

            <Label className="md:col-span-2">
              <span>Address *</span>
              <Input 
                className="mt-1" 
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter complete business address" 
                required
                valid={!errors.address}
              />
              {errors.address && (
                <HelperText valid={false}>{errors.address}</HelperText>
              )}
            </Label>

            <Label>
              <span>Mobile Number *</span>
              <Input 
                className="mt-1" 
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handleInputChange}
                placeholder="+1-555-123-4567" 
                required
                valid={!errors.mobileNo}
              />
              {errors.mobileNo && (
                <HelperText valid={false}>{errors.mobileNo}</HelperText>
              )}
            </Label>

            <Label>
              <span>Business Number</span>
              <Input 
                className="mt-1" 
                name="businessNo"
                value={formData.businessNo}
                onChange={handleInputChange}
                placeholder="+1-555-123-4568 (Optional)"
                valid={!errors.businessNo}
              />
              {errors.businessNo && (
                <HelperText valid={false}>{errors.businessNo}</HelperText>
              )}
              <HelperText>Optional: Separate business phone number</HelperText>
            </Label>

            <Label>
              <span>City *</span>
              <Input 
                className="mt-1" 
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Enter city" 
                required
                valid={!errors.city}
              />
              {errors.city && (
                <HelperText valid={false}>{errors.city}</HelperText>
              )}
            </Label>

            <Label>
              <span>Country *</span>
              <Select
                className="mt-1"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
                valid={!errors.country}
              >
                <option value="">Select a country</option>
                {commonCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </Select>
              {formData.country === 'Other' && (
                <Input
                  className="mt-2"
                  placeholder="Please specify country"
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                />
              )}
              {errors.country && (
                <HelperText valid={false}>{errors.country}</HelperText>
              )}
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
              style={{backgroundColor:"#AA1A21"}}
              className="text-white"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Client'}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}

export default CreateClients