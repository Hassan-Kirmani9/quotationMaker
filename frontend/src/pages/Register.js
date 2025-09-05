import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Label, Input, Button, HelperText } from '@windmill/react-ui'
import { post } from '../api/axios'
import logo from '../assets/img/logo.png'

function Register() {
  const history = useHistory()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' // Default role
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await post('/auth/register', formData)
      
      if (res.success && res.data?.token) {
        setSuccess('Registration successful! Redirecting to login...')
        setTimeout(() => history.push('/login'), 1500)
      } else {
        setError(res.message || 'Registration failed')
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 h-full max-w-md mx-auto overflow-hidden bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <div className="flex flex-col justify-center p-6">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Quotation Management Logo" className="h-14 w-auto" />
          </div>
          <h1 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200">
            Create Your Account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Label>
              <span>Full Name</span>
              <Input
                className="mt-1"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                maxLength={100}
              />
            </Label>

            <Label>
              <span>Email Address</span>
              <Input
                className="mt-1"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Label>

            <Label>
              <span>Password</span>
              <Input
                className="mt-1"
                name="password"
                type="password"
                placeholder="Enter your password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </Label>



            {error && <HelperText valid={false}>{error}</HelperText>}
            {success && <HelperText valid={true}>{success}</HelperText>}

            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <p className="text-sm text-center mt-4 text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <span
                className="text-purple-600 hover:underline cursor-pointer"
                onClick={() => history.push('/login')}
              >
                Sign in here
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register