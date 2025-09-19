import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemedSuspense from './ThemedSuspense'

const ProtectedRoute = ({ component: Component, requiredPage, ...rest }) => {
  const { isAuthenticated, loading, checkPageAccess } = useAuth()

  if (loading) {
    return <ThemedSuspense />
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />
  }

  if (requiredPage && !checkPageAccess(requiredPage)) {
    return <Redirect to="/app/dashboard" />
  }

  return (
    <Route
      {...rest}
      render={(props) => <Component {...props} />}
    />
  )
}

export default ProtectedRoute