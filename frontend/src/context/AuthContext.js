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
  const [organization, setOrganization] = useState(null)

  const checkPageAccess = (pagePath) => {
    if (!user || !accessiblePages.length) return false
    if (user.role === 'admin') return true
    return accessiblePages.includes(pagePath)
  }

  const getAllAvailablePages = () => {
    return [
      "/dashboard",
      "/quotations", 
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
        const userData = response.data.user
        setUser(userData)
        setAccessiblePages(userData.accessible_pages || [])
        setOrganization({
          id: userData.organization_id,
          name: userData.organization_name
        })
      }).catch((error) => {
        console.error('Auth check failed:', error)
        localStorage.removeItem('token')
        setIsAuthenticated(false)
        setUser(null)
        setAccessiblePages([])
        setOrganization(null)
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

const login = async (token, userData) => {
  localStorage.setItem('token', token)
  setIsAuthenticated(true)
  
  try {
    const response = await get('/auth/me', {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    const fullUserData = response.data.user
    setUser(fullUserData)
    setAccessiblePages(fullUserData.accessible_pages || [])
    setOrganization({
      id: fullUserData.organization_id,
      name: fullUserData.organization_name
    })
  } catch (error) {
    console.error('Failed to fetch user profile after login:', error)
    setUser(userData)
    setAccessiblePages(userData.accessible_pages || [])
    setOrganization({
      id: userData.organization_id,
      name: userData.organization_name
    })
  }
}

  const logout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    setUser(null)
    setAccessiblePages([])
    setOrganization(null)
    setConfig(null)
  }

  const updateUserPermissions = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const response = await get('/auth/permissions', {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        const userData = response.data.user
        const permissions = response.data.permissions
        
        setUser(prevUser => ({
          ...prevUser,
          ...userData
        }))
        setAccessiblePages(permissions.accessible_pages || [])
      }
    } catch (error) {
      console.error('Failed to update user permissions:', error)
    }
  }

  const contextValue = {
    isAuthenticated,
    login,
    logout,
    user,
    loading,
    config,
    accessiblePages,
    organization,
    checkPageAccess,
    getAllAvailablePages,
    updateUserPermissions
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}