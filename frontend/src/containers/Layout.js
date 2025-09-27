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
import BottomTabs from '../pages/BottomTabs'

const Page404 = lazy(() => import('../pages/404'))
const AccessDenied = lazy(() => import('../pages/AccessDenied'))

function Layout() {
  const { isSidebarOpen, closeSidebar } = useContext(SidebarContext)
  const { isAuthenticated, loading, config } = useAuth()
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
          <div style={{ paddingBottom: window.innerWidth < 768 ? '80px' : '0' }}>
            <Suspense fallback={<ThemedSuspense />}>
              <Switch>
                {routes.map((route, i) => {
                  return route.component ? (
                    <ProtectedRoute
                      key={`${route.path}-${i}`}
                      exact={true}
                      path={`/app${route.path}`}
                      component={route.component}
                      requiredPermission={route.name}
                    />
                  ) : null
                })}
                <Route path="/app/access-denied" component={AccessDenied} />
                <Redirect exact from="/app" to="/app/dashboard" />
                <Route component={Page404} />
              </Switch>
            </Suspense>
          </div>
        </Main>
      </div>

      {/* Mobile Bottom Tabs */}
      <BottomTabs />
    </div>
  )
}

export default Layout