import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { post, get } from '../../api/axios'

import PageTitle from '../../components/Typography/PageTitle'
import SectionTitle from '../../components/Typography/SectionTitle'
import { Input, Label, Button, Select, Textarea, HelperText } from '@windmill/react-ui'

function CreateProjects() {
  const history = useHistory()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client: ''
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [clientsList, setClientsList] = useState([])
  const [clientsLoading, setClientsLoading] = useState(true)
    const [currencyList, setcurrencyList] = useState([])
  const [currencyLoading, setcurrencyLoading] = useState(true)

  
  const fetchClients = async () => {
    try {
      setClientsLoading(true)
      const response = await get("/clients")
      
      if (response.success) {
        setClientsList(response.data)
      } else {
        console.error('Failed to fetch clients')
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setClientsLoading(false)
    }
  }

  const fetchcurrency = async () => {
    try {
      setcurrencyLoading(true)
      const response = await get("/currencies")
      
      if (response.success) {
        setcurrencyList(response.data)
      } else {
        console.error('Failed to fetch base currency')
      }
    } catch (error) {
      console.error('Error fetching base currency:', error)
    } finally {
      setcurrencyLoading(false)
    }
  }

  
  useEffect(() => {
    fetchClients()
    fetchcurrency()

  }, [])

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
      newErrors.name = 'Project name is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.client.trim()) {
      newErrors.client = 'Client is required'
    }

        if (!formData.currency.trim()) {
      newErrors.currency = 'base currency is required'
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
      const response = await post("/projects", formData)
      
      if (response.success) {
        
        alert('Project created successfully!')
        
        
        history.push('/app/projects')
      } else {
        setApiError('Failed to create project. Please try again.')
      }
    } catch (error) {
      console.error('Error creating project:', error)
      
      
      if (error.errors) {
        
        const backendErrors = {}
        Object.keys(error.errors).forEach(key => {
          backendErrors[key] = error.errors[key]
        })
        setErrors(backendErrors)
      } else if (error.message) {
        setApiError(error.message)
      } else {
        setApiError('Failed to create project. Please check your connection and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
      history.push('/app/projects')
    
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <PageTitle>Add New Project</PageTitle>
      </div>

      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <form onSubmit={handleSubmit}>
          {}
          {apiError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {apiError}
            </div>
          )}

          <Label>
            <span>Project Name *</span>
            <Input 
              className="mt-1" 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter project name" 
              required
              valid={!errors.name}
            />
            {errors.name && (
              <HelperText valid={false}>{errors.name}</HelperText>
            )}
          </Label>

          <Label className="mt-4">
            <span>Description *</span>
            <Textarea 
              className="mt-1" 
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Enter project description" 
              required
              valid={!errors.description}
            />
            {errors.description && (
              <HelperText valid={false}>{errors.description}</HelperText>
            )}
          </Label>

          <Label className="mt-4">
            <span>Client *</span>
            <Select 
              className="mt-1" 
              name="client"
              value={formData.client}
              onChange={handleInputChange}
              required
              valid={!errors.client}
              disabled={clientsLoading}
            >
              <option value="">
                {clientsLoading ? 'Loading clients...' : 'Select Client'}
              </option>
              {clientsList.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.name} - {client.businessName}
                </option>
              ))}
            </Select>
            {errors.client && (
              <HelperText valid={false}>{errors.client}</HelperText>
            )}
            {clientsList.length === 0 && !clientsLoading && (
              <HelperText valid={false}>
                No clients found. Please create a client first.
              </HelperText>
            )}
          </Label>

          <Label className="mt-4">
            <span>Base Currency *</span>
            <Select 
              className="mt-1" 
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              required
              valid={!errors.currency}
              disabled={currencyLoading}
            >
              <option value="">
                {currencyLoading ? 'Loading base currency...' : 'Select base currency'}
              </option>
              {currencyList.map((currency) => (
                <option key={currency._id} value={currency._id}>
                  {currency.currency}
                </option>
              ))}
            </Select>
            {errors.currency && (
              <HelperText valid={false}>{errors.currency}</HelperText>
            )}
            {currencyList.length === 0 && !currencyLoading && (
              <HelperText valid={false}>
                No base currency found. Please create a base currency first.
              </HelperText>
            )}
          </Label>

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
              disabled={loading || clientsLoading || clientsList.length === 0}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}

export default CreateProjects