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

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/create-account" component={CreateAccount} />
      <Route path="/forgot-password" component={ForgotPassword} />

      <ProtectedRoute path="/app" component={Layout} />

      {/* Conditional redirect based on auth status */}
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
