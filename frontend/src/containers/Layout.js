import React, { useContext, Suspense, useEffect, lazy } from 'react'
import { Switch, Route, Redirect, useLocation } from 'react-router-dom'
import routes from '../routes'
import { useAuth } from '../context/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'

import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Main from '../containers/Main'
import ThemedSuspense from '../components/ThemedSuspense'
import { SidebarContext } from '../context/SidebarContext'

const Page404 = lazy(() => import('../pages/404'))
const AccessDenied = lazy(() => import('../pages/AccessDenied'))

function Layout() {
  const { isSidebarOpen, closeSidebar } = useContext(SidebarContext)
  const { isAuthenticated, loading } = useAuth()
  let location = useLocation()

  useEffect(() => {
    closeSidebar()
  }, [location])

  if (loading) {
    return <ThemedSuspense />
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />
  }

  return (
    <div
      className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${isSidebarOpen && 'overflow-hidden'}`}
    >
      <Sidebar />

      <div className="flex flex-col flex-1 w-full">
        <Header />
        <Main>
          <Suspense fallback={<ThemedSuspense />}>
            <Switch>
              {routes.map((route, i) => {
                return route.component ? (
                  <ProtectedRoute
                    key={i}
                    exact={true}
                    path={`/app${route.path}`}
                    component={route.component}
                    requiredPage={route.requiredPage}
                  />
                ) : null
              })}
              <Route path="/app/access-denied" component={AccessDenied} />
              <Redirect exact from="/app" to="/app/dashboard" />
              <Route component={Page404} />
            </Switch>
          </Suspense>
        </Main>
      </div>
    </div>
  )
}

export default Layout