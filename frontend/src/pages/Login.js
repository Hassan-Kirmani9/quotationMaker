import React, { useState, useRef, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import logo from '../assets/img/logo.png'
import { Label, Input, HelperText } from '@windmill/react-ui'
import { get, post } from '../api/axios'
import { useAuth } from '../context/AuthContext'
// Import eye icons from react-icons
import { FaEye, FaEyeSlash } from 'react-icons/fa'

function Login() {
  const history = useHistory()
  const isMounted = useRef(false)
  const { login } = useAuth()

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginLoading(true)
    setError('')

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      setLoginLoading(false)
      return
    }


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      setLoginLoading(false)
      return
    }

    try {

      const response = await post('/auth/login', {
        email: formData.email,
        password: formData.password
      });


      if (!response || response.success === false) {
        if (isMounted.current) {
          setError(response?.message || 'Login failed. Please check credentials.')
        }
        return
      }

      if (!response.data?.token) {
        if (isMounted.current) {
          setError('Invalid response from server.')
        }
        return
      }
      const { token, user, currency } = response.data

      localStorage.setItem("token", token)
      if (currency) {
        localStorage.setItem("userCurrency", currency)
      }

      if (isMounted.current) {
        login(token, user)
        history.push('/app')
      }

    } catch (err) {
      console.error('Login error:', err);

      if (isMounted.current) {

        if (err.response?.data?.message) {
          setError(err.response.data.message)
        } else if (err.response?.data) {

          setError(err.response.data.message || 'Login failed')
        } else if (err.message) {
          setError(err.message)
        } else {
          setError('An error occurred during login. Please try again.')
        }
      }
    } finally {
      if (isMounted.current) {
        setLoginLoading(false)
      }
    }
  }

  return (
    <div className="flex items-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 h-full max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-xl dark:bg-gray-700">
        <div className="flex flex-col overflow-y-auto">
          <main className="flex items-center justify-center p-6">
            <div className="w-full">
              <div className="flex justify-center mb-6">
                <img src={logo} alt="Logo" className="h-14 w-auto" />
              </div>

              <h1 className="mb-4 text-xl text-center font-semibold text-gray-700 dark:text-gray-200">
                Quotation Maker Login
              </h1>

              <form onSubmit={handleLogin}>
                <Label>
                  <span>Email Address</span>
                  <Input
                    className="mt-1"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </Label>

                <Label className="mt-4">
                  <span>Password</span>
                  <div className="relative">
                    <Input
                      className="mt-1"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 mt-1"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <FaEyeSlash className="h-5 w-5 text-gray-500" />
                      ) : (
                        <FaEye className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                </Label>

                {error && (
                  <HelperText valid={false} className="mt-2">
                    {error}
                  </HelperText>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="mt-4 w-full p-2 rounded-lg text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: "#AA1A21" }}
                >
                  {loginLoading ? 'Logging in...' : 'Log in'}
                </button>


              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Login