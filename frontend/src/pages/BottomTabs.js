import React, { useState, useEffect } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as Icons from '../icons'
import {
  IoGridOutline,
  IoDocumentTextOutline,
  IoPeopleOutline,
  IoEllipsisHorizontalOutline,
  IoClose
} from 'react-icons/io5'

function Icon({ icon, ...props }) {
  const IconComponent = Icons[icon]
  return IconComponent ? <IconComponent {...props} /> : null
}

const BottomTabs = () => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768)
  const { checkPageAccess, user } = useAuth()
  const location = useLocation()
  const history = useHistory()
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  // Check screen size and hide on desktop
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Don't render on desktop
  if (isDesktop) return null

  // Determine if user is catering-only to show appropriate quotation tab
  const isCateringOnly = () => {
    if (!user?.permissions) return false
    const permissions = user.permissions
    const hasCateringQuotations = permissions.includes('/catering-quotations')
    const hasRegularQuotations = permissions.includes('/quotations')
    const hasProducts = permissions.includes('/products')
    const hasSizes = permissions.includes('/sizes')
    
    return hasCateringQuotations && !hasRegularQuotations && !hasProducts && !hasSizes
  }

  // Get all available tabs
  const getAllTabs = () => {
    const tabs = []
    
    // Dashboard - always first if user has access
    if (checkPageAccess('/dashboard')) {
      tabs.push({
        path: '/app/dashboard',
        icon: <IoGridOutline className="w-6 h-6" />,
        name: 'Dashboard'
      })
    }

    // Regular Quotations
    if (checkPageAccess('/quotations')) {
      tabs.push({
        path: '/app/quotations',
        icon: <IoDocumentTextOutline className="w-6 h-6" />,
        name: isCateringOnly() ? 'Quotations' : 'Regular'
      })
    }

    // Catering Quotations
    if (checkPageAccess('/catering-quotations')) {
      tabs.push({
        path: '/app/catering-quotations',
        icon: <Icon icon="Catering" className="w-6 h-6" />,
        name: 'Catering'
      })
    }

    // Clients
    if (checkPageAccess('/clients')) {
      tabs.push({
        path: '/app/clients',
        icon: <IoPeopleOutline className="w-6 h-6" />,
        name: 'Clients'
      })
    }

    // Products
    if (checkPageAccess('/products')) {
      tabs.push({
        path: '/app/products',
        icon: <Icon icon="Products" className="w-6 h-6" />,
        name: 'Products'
      })
    }

    // Sizes
    if (checkPageAccess('/sizes')) {
      tabs.push({
        path: '/app/sizes',
        icon: <Icon icon="Sizes" className="w-6 h-6" />,
        name: 'Sizes'
      })
    }

    // Configuration
    if (checkPageAccess('/configuration')) {
      tabs.push({
        path: '/app/configuration',
        icon: <Icon icon="Cog" className="w-6 h-6" />,
        name: 'Config'
      })
    }

    return tabs
  }

  const allTabs = getAllTabs()
  
  // Show first 6 tabs directly, rest go in "More" menu
  const directTabs = allTabs.slice(0, 6)
  const moreItems = allTabs.slice(6)

  const isTabActive = (path) => {
    if (path === '/app/dashboard') {
      return location.pathname === '/app/dashboard' || location.pathname === '/app'
    }
    return location.pathname.startsWith(path)
  }

  const handleMoreItemClick = (path) => {
    history.push(path)
    setShowMoreMenu(false)
  }

  const handleTabClick = (path) => {
    history.push(path)
  }

  // Don't show bottom tabs if there are no tabs to show
  if (allTabs.length === 0) return null

  return (
    <>
      {/* More Menu Overlay */}
      {showMoreMenu && moreItems.length > 0 && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40
          }}
          onClick={() => setShowMoreMenu(false)}
        >
          <div 
            style={{
              position: 'absolute',
              bottom: '80px',
              left: '16px',
              right: '16px',
              maxHeight: '384px',
              overflowY: 'auto'
            }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">More Options</h3>
              <button 
                onClick={() => setShowMoreMenu(false)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <IoClose className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2">
              {moreItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleMoreItemClick(item.path)}
                  className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
                    isTabActive(item.path)
                      ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium ml-3">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar - Mobile Only */}
      <div 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
        className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
      >
        <div className="flex justify-around items-center py-2">
          {/* Direct Tabs (up to 6) */}
          {directTabs.map((tab) => (
            <button
              key={tab.path}
              onClick={() => handleTabClick(tab.path)}
              style={{ minWidth: 0, flex: 1 }}
              className={`flex flex-col items-center justify-center p-2 transition-colors ${
                isTabActive(tab.path)
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon}
              <span className="text-xs font-medium mt-1 truncate max-w-full">
                {tab.name}
              </span>
            </button>
          ))}

          {/* More Tab (only show if there are more than 6 total tabs) */}
          {moreItems.length > 0 && (
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              style={{ minWidth: 0, flex: 1 }}
              className={`flex flex-col items-center justify-center p-2 transition-colors ${
                moreItems.some(item => isTabActive(item.path))
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <IoEllipsisHorizontalOutline className="w-6 h-6" />
              <span className="text-xs font-medium mt-1">More</span>
            </button>
          )}
        </div>
      </div>
    </>
  )
}

export default BottomTabs