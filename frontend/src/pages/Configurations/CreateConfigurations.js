import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { post } from '../../api/axios'
import {
  Label, Input, HelperText, Button
} from '@windmill/react-ui'
import PageTitle from '../../components/Typography/PageTitle'

function CreateConfiguration() {
  const history = useHistory()
  const [form, setForm] = useState({
    bank: {
      name: '',
      accountName: '',
      accountNumber: '',
      routingNumber: ''
    },
    business: {
      name: '',
      address: '',
      mobileNum: '',
      businessNum: '',
      email: '',
      web: '',
      logo: '',
      taxId: ''
    },
    quotation: {
      validity: 30,
      terms: '',
      notes: '',
      prefix: 'QUO'
    }
  })

  const [errors, setErrors] = useState({})
  const [apiErr, setApiErr] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    const [section, field] = name.split('.')

    setForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: field === 'validity' ? Number(value) : value
      }
    }))

    setErrors(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: ''
      }
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    const requiredFields = {
      quotation: ['validity', 'prefix']
    }

    Object.entries(requiredFields).forEach(([section, fields]) => {
      newErrors[section] = {}
      fields.forEach(field => {
        if (!String(form[section][field] || '').toString().trim()) {
          newErrors[section][field] = 'Required'
        }
      })
    })

    // Validate validity range
    if (form.quotation.validity < 1 || form.quotation.validity > 365) {
      if (!newErrors.quotation) newErrors.quotation = {}
      newErrors.quotation.validity = 'Must be between 1 and 365 days'
    }

    const hasErrors = Object.values(newErrors).some(group =>
      Object.values(group).some(msg => !!msg)
    )

    setErrors(newErrors)
    return !hasErrors
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setApiErr('')

    try {
      const res = await post('/configuration', form)
      if (res.success) {
        alert('Configuration created successfully!')
        history.push('/app/configuration')
      } else {
        setApiErr(res.message || 'Failed to create configuration')
      }
    } catch (err) {
      setApiErr(err.response?.data?.message || err.message || 'Server error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageTitle>Create Configuration</PageTitle>

      {apiErr && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {apiErr}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <form onSubmit={onSubmit}>
          {/* Bank Section */}
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Bank Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Label>
              <span>Bank Name</span>
              <Input name="bank.name" value={form.bank.name} onChange={handleChange} valid={!errors.bank?.name} />
              {errors.bank?.name && <HelperText valid={false}>{errors.bank.name}</HelperText>}
            </Label>
            <Label>
              <span>Account Name</span>
              <Input name="bank.accountName" value={form.bank.accountName} onChange={handleChange} valid={!errors.bank?.accountName} />
              {errors.bank?.accountName && <HelperText valid={false}>{errors.bank.accountName}</HelperText>}
            </Label>
            <Label>
              <span>Account Number</span>
              <Input name="bank.accountNumber" value={form.bank.accountNumber} onChange={handleChange} valid={!errors.bank?.accountNumber} />
              {errors.bank?.accountNumber && <HelperText valid={false}>{errors.bank.accountNumber}</HelperText>}
            </Label>
            <Label>
              <span>Routing Number</span>
              <Input name="bank.routingNumber" value={form.bank.routingNumber} onChange={handleChange} valid={!errors.bank?.routingNumber} />
              {errors.bank?.routingNumber && <HelperText valid={false}>{errors.bank.routingNumber}</HelperText>}
            </Label>
          </div>

          {/* Business Section */}
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Business Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Label>
              <span>Business Name</span>
              <Input name="business.name" value={form.business.name} onChange={handleChange} valid={!errors.business?.name} />
              {errors.business?.name && <HelperText valid={false}>{errors.business.name}</HelperText>}
            </Label>
            <Label>
              <span>Address</span>
              <Input name="business.address" value={form.business.address} onChange={handleChange} valid={!errors.business?.address} />
              {errors.business?.address && <HelperText valid={false}>{errors.business.address}</HelperText>}
            </Label>
            <Label>
              <span>Mobile Number</span>
              <Input name="business.mobileNum" value={form.business.mobileNum} onChange={handleChange} valid={!errors.business?.mobileNum} />
              {errors.business?.mobileNum && <HelperText valid={false}>{errors.business.mobileNum}</HelperText>}
            </Label>
            <Label>
              <span>Business Number</span>
              <Input name="business.businessNum" value={form.business.businessNum} onChange={handleChange} valid={!errors.business?.businessNum} />
              {errors.business?.businessNum && <HelperText valid={false}>{errors.business.businessNum}</HelperText>}
            </Label>
            <Label>
              <span>Email</span>
              <Input name="business.email" value={form.business.email} onChange={handleChange} valid={!errors.business?.email} type="email" />
              {errors.business?.email && <HelperText valid={false}>{errors.business.email}</HelperText>}
            </Label>
            <Label>
              <span>Website</span>
              <Input name="business.web" value={form.business.web} onChange={handleChange} valid={!errors.business?.web} />
              {errors.business?.web && <HelperText valid={false}>{errors.business.web}</HelperText>}
            </Label>
            <Label>
              <span>Logo URL</span>
              <Input name="business.logo" value={form.business.logo} onChange={handleChange} valid={!errors.business?.logo} />
              {errors.business?.logo && <HelperText valid={false}>{errors.business.logo}</HelperText>}
            </Label>
            <Label>
              <span>Tax ID</span>
              <Input name="business.taxId" value={form.business.taxId} onChange={handleChange} valid={!errors.business?.taxId} />
              {errors.business?.taxId && <HelperText valid={false}>{errors.business.taxId}</HelperText>}
            </Label>
          </div>

          {/* Quotation Settings Section */}
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Quotation Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Label>
              <span>Quotation Validity (Days) *</span>
              <Input 
                name="quotation.validity" 
                value={form.quotation.validity} 
                onChange={handleChange} 
                valid={!errors.quotation?.validity} 
                type="number"
                min="1"
                max="365"
              />
              {errors.quotation?.validity && <HelperText valid={false}>{errors.quotation.validity}</HelperText>}
            </Label>
            <Label>
              <span>Quotation Prefix *</span>
              <Input name="quotation.prefix" value={form.quotation.prefix} onChange={handleChange} valid={!errors.quotation?.prefix} />
              {errors.quotation?.prefix && <HelperText valid={false}>{errors.quotation.prefix}</HelperText>}
            </Label>
            <Label className="md:col-span-2">
              <span>Terms & Conditions</span>
              <textarea 
                name="quotation.terms" 
                value={form.quotation.terms} 
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                rows="4"
                placeholder="Enter default terms and conditions..."
              />
            </Label>
            <Label className="md:col-span-2">
              <span>Default Notes</span>
              <textarea 
                name="quotation.notes" 
                value={form.quotation.notes} 
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                rows="3"
                placeholder="Enter default notes..."
              />
            </Label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <Button layout="outline" onClick={() => history.push('/app/configuration')}>
              Cancel
            </Button>
            <Button type="submit" style={{ backgroundColor: '#AA1A21' }} className="text-white" disabled={loading}>
              {loading ? 'Creating...' : 'Create Configuration'}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}

export default CreateConfiguration