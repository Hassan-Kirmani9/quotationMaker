import React, { createContext, useContext, useState, useEffect } from 'react'
import { get } from '../api/axios'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState(null) 

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
      get('/auth/me', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then(data => {
        setUser(data)
      }).catch(() => {
        localStorage.removeItem('token')
        setIsAuthenticated(false)
      })
    }

    const fetchConfig = async () => {
      if (token) {
        try {
          const configData = await get('/configuration', {}, {
            headers: { Authorization: `Bearer ${token}` }
          })

          if (Array.isArray(configData.data) && configData.data.length > 0) {
            setConfig(configData.data[0])
          }
        } catch (err) {
          console.error('Config fetch failed', err)
        }
      }
    }

    
    fetchConfig()

    
    const handleConfigUpdate = () => {
      fetchConfig()
    }

    window.addEventListener('currencyUpdated', handleConfigUpdate)

    setLoading(false)

    
    return () => {
      window.removeEventListener('currencyUpdated', handleConfigUpdate)
    }
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('token', token)
    setIsAuthenticated(true)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user, loading, config }}>
      {children}
    </AuthContext.Provider>
  )
}