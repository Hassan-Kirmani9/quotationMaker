import React, { lazy } from 'react'
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
import AccessibleNavigationAnnouncer from './components/AccessibleNavigationAnnouncer'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import { CurrencyProvider } from './context/CurrencyContext'

const Layout = lazy(() => import('./containers/Layout'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const CreateAccount = lazy(() => import('./pages/CreateAccount'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const AccessDenied = lazy(() => import('./pages/AccessDenied'))

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Switch>
      <Route path="/login">
        {isAuthenticated ? <Redirect to="/app" /> : <Login />}
      </Route>
      <Route path="/register">
        {isAuthenticated ? <Redirect to="/app" /> : <Register />}
      </Route>
      <Route path="/create-account">
        {isAuthenticated ? <Redirect to="/app" /> : <CreateAccount />}
      </Route>
      <Route path="/forgot-password">
        {isAuthenticated ? <Redirect to="/app" /> : <ForgotPassword />}
      </Route>
      <Route path="/access-denied" component={AccessDenied} />

      <ProtectedRoute path="/app" component={Layout} />

      <Route exact path="/">
        {isAuthenticated ? <Redirect to="/app" /> : <Redirect to="/login" />}
      </Route>
    </Switch>
  )
}

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <Router>
          <AccessibleNavigationAnnouncer />
          <AppRoutes />
        </Router>
      </CurrencyProvider>
    </AuthProvider>
  )
}

export default App