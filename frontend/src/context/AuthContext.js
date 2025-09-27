import React, { createContext, useContext, useState, useEffect } from 'react'
import { get } from '../api/axios'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState(null)
  const [accessiblePages, setAccessiblePages] = useState([])
  const [tenant, setTenant] = useState(null)

  const checkPageAccess = (permissionName) => {
    if (!user || !user.permissions) return false
    if (user.role === 'admin') return true
    return user.permissions.includes(permissionName)
  }

const getAllAvailablePages = () => {
    return [
      "/dashboard",
      "/quotations",
      "/catering-quotations",
      "/clients",
      "/products",
      "/sizes",
      "/configuration"
    ]
}
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
      get('/auth/me', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then(response => {
        // Correct structure: user data is directly in response.data
        if (response && response.data) {
          const userData = response.data
          setUser(userData)

          // Use permissions from backend (already includes / prefix from backend)

          setTenant({
            id: userData.organization_id || userData.tenant_id,
            name: userData.organization_name || userData.tenant_name
          })
        }
      }).catch((error) => {
        console.error('Auth check failed:', error)
        localStorage.removeItem('token')
        setIsAuthenticated(false)
        setUser(null)
        setAccessiblePages([])
        setTenant(null)
      })
    }

    // Rest of the useEffect remains the same...
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

  const login = async (token, userData) => {
    localStorage.setItem('token', token)
    setIsAuthenticated(true)

    try {
      const response = await get('/auth/me', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (response && response.data) {
        const fullUserData = response.data
        setUser(fullUserData)

        // Use permissions from backend
        const accessiblePages = fullUserData.permissions?.map(p => `/${p}`) || []
        setAccessiblePages(accessiblePages)

        setTenant({
          id: fullUserData.organization_id || fullUserData.tenant_id,
          name: fullUserData.organization_name || fullUserData.tenant_name
        })
      }
    } catch (error) {
      console.error('Failed to fetch user profile after login:', error)
      setUser(userData || {})
      setAccessiblePages(["/dashboard", "/quotations", "/clients", "/products", "/sizes", "/configuration"])
      setTenant(null)
    }
  }
  const logout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    setUser(null)
    setAccessiblePages([])
    setTenant(null)
    setConfig(null)
  }

  const contextValue = {
    isAuthenticated,
    login,
    logout,
    user,
    loading,
    config,
    accessiblePages,
    tenant,
    checkPageAccess,
    getAllAvailablePages,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}