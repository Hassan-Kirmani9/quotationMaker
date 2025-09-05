import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { get, put } from '../../api/axios'
import { useHistory } from 'react-router-dom'
import {
  Button,
  Input,
  Label,
  HelperText,

} from '@windmill/react-ui'
import PageTitle from '../../components/Typography/PageTitle'

function EditClient() {
  const history = useHistory()

  const { id } = useParams()

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

  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  
  const fetchClient = async () => {
    try {
      const res = await get(`/clients/${id}`)
      if (res.success) {
        const c = res.data
        setFormData({
          name: c.name || '',
          businessName: c.businessName || '',
          email: c.email || '',

          address: c.address || '',
          mobileNo: c.mobileNo || '',
          businessNo: c.businessNo || '',
          city: c.city || '',
          country: c.country || ''
        })
      } else {
        setApiError('Client not found')
      }
    } catch (err) {
      console.error(err)
      setApiError('Failed to fetch client')
    } finally {
      setFetching(false)
    }
  }
  const handleCancel = () => {
    history.push('/app/clients')
  }

  useEffect(() => {
    fetchClient()
  }, [id])

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.businessName.trim()) newErrors.businessName = 'Business Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email Address is required'

    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.mobileNo.trim()) newErrors.mobileNo = 'Mobile No is required'
    else if (!/^[\+]?[0-9\-\s\(\)]{10,}$/.test(formData.mobileNo)) newErrors.mobileNo = 'Invalid Mobile No'

    if (formData.businessNo && !/^[\+]?[0-9\-\s\(\)]{10,}$/.test(formData.businessNo)) {
      newErrors.businessNo = 'Invalid Business No'
    }

    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.country.trim()) newErrors.country = 'Country is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    if (apiError) setApiError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const res = await put(`/clients/${id}`, formData,{
        
      })
      if (res.success) {
        history.push('/app/clients')
      } else {
        setApiError('Failed to update client')
      }
    } catch (err) {
      console.error(err)
      setApiError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <div className="text-center py-20">Loading client data...</div>
  }

  return (
    <>
      <PageTitle>Edit Client</PageTitle>

      {apiError && <div className="text-red-500 mb-4">{apiError}</div>}

      <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
        {[
          ['name', 'Name *'],
          ['businessName', 'Business Name *'],
          ['email', 'Email Address *'],
          ['address', 'Address *'],
          ['mobileNo', 'Mobile No *'],
          ['businessNo', 'Business No'],
          ['city', 'City *'],
          ['country', 'Country *']
        ].map(([field, label]) => (
          <Label key={field}>
            <span>{label}</span>
            <Input
              className="mt-1"
              name={field}
              value={formData[field]}
              onChange={handleChange}
              valid={!errors[field]}
            />
            {errors[field] && <HelperText valid={false}>{errors[field]}</HelperText>}
          </Label>
        ))}

        <div className="md:col-span-2 flex justify-end gap-4">
          <Button layout="outline" onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button type="submit" style={{ backgroundColor: '#AA1A21' }} className="text-white" disabled={loading}>
            {loading ? 'Updating...' : 'Update Client'}
          </Button>
        </div>
      </form>
    </>
  )
}

export default EditClient
