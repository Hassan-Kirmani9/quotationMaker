import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { get, put } from '../../api/axios'
import {
  Label,
  Input,
  Textarea,
  Select,
  HelperText,
  Button
} from '@windmill/react-ui'
import PageTitle from '../../components/Typography/PageTitle'

function EditProject() {
  const history = useHistory()

  const { id } = useParams()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client: '',
    currency: ''
  })

  const [clients, setClients] = useState([])
  const [currency, setcurrency] = useState([])

  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetchClients()
    fetchcurrency()
    fetchProject()
  }, [id])

  const fetchProject = async () => {
    try {
      const res = await get(`/projects/${id}`)
      if (res.success) {
        const p = res.data
        setFormData({
          name: p.name || '',
          description: p.description || '',
          client: p.client?._id || '',
          currency: p.currency?._id || ''

        })
      } else {
        setApiError('Project not found')
      }
    } catch (err) {
      console.error(err)
      setApiError('Failed to fetch project')
    } finally {
      setFetching(false)
    }
  }
  const handleCancel = () => {
    history.push('/app/clients')
  }

  const fetchClients = async () => {
    try {
      const res = await get('/clients')
      if (res.success) {
        setClients(res.data)
      } else {
        setClients([])
      }
    } catch (err) {
      console.error('Error fetching clients:', err)
    }
  }

  const fetchcurrency = async () => {
    try {
      const res = await get('/currencies')
      if (res.success) {
        setcurrency(res.data)
      } else {
        setcurrency([])
      }
    } catch (err) {
      console.error('Error fetching currency:', err)
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Project name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.client.trim()) newErrors.client = 'Client is required'
    if (!formData.currency.trim()) newErrors.currency = 'currency is required'

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
      const res = await put(`/projects/${id}`, formData)
      if (res.success) {
        history.push('/app/projects')
      } else {
        setApiError('Failed to update project')
      }
    } catch (err) {
      setApiError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="text-center py-20">Loading project...</div>

  return (
    <>
      <PageTitle>Edit Project</PageTitle>
      {apiError && <div className="mb-4 text-red-600">{apiError}</div>}

      <form onSubmit={handleSubmit} className="grid gap-6 max-w-4xl">
        <Label>
          <span>Project Name *</span>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            valid={!errors.name}
          />
          {errors.name && <HelperText valid={false}>{errors.name}</HelperText>}
        </Label>

        <Label>
          <span>Description *</span>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            valid={!errors.description}
          />
          {errors.description && <HelperText valid={false}>{errors.description}</HelperText>}
        </Label>

        <Label>
          <span>Client *</span>
          <Select
            name="client"
            value={formData.client}
            onChange={handleChange}
            valid={!errors.client}
          >
            <option value="">Select Client</option>
            {clients.map(c => (
              <option key={c._id} value={c._id}>
                {c.name} - {c.businessName}
              </option>
            ))}
          </Select>
          {errors.client && <HelperText valid={false}>{errors.client}</HelperText>}
        </Label>

        <Label>
          <span>Base Currency *</span>
          <Select
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            valid={!errors.currency}
          >
            <option value="">Select currency</option>
            {currency.map(c => (
              <option key={c._id} value={c._id}>
                {c.currency}
              </option>
            ))}
          </Select>
          {errors.currency && <HelperText valid={false}>{errors.currency}</HelperText>}
        </Label>

        <div className="flex gap-4">
          <Button layout="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            style={{ backgroundColor: '#AA1A21' }}
            className="text-white"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Project'}
          </Button>
        </div>
      </form>
    </>
  )
}

export default EditProject
