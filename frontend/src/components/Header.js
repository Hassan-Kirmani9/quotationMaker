import React, { useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { SidebarContext } from '../context/SidebarContext'
import {
  SearchIcon,
  MoonIcon,
  SunIcon,
  BellIcon,
  MenuIcon,
  OutlineLogoutIcon,
} from '../icons'
import { Avatar, Badge, Input, Dropdown, DropdownItem, WindmillContext } from '@windmill/react-ui'
import { FaUser } from 'react-icons/fa'

function Header() {
  const { mode, toggleMode } = useContext(WindmillContext)
  const { toggleSidebar } = useContext(SidebarContext)
  const { logout, user } = useAuth()
  const history = useHistory()

  const [isNotificationsMenuOpen, setIsNotificationsMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  function handleNotificationsClick() {
    setIsNotificationsMenuOpen(!isNotificationsMenuOpen)
  }

  function handleProfileClick() {
    setIsProfileMenuOpen(!isProfileMenuOpen)
  }

  function handleLogout() {
    logout()
    history.push('/login')
  }

  // Generate initials from user name as fallback
  const getUserInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)
  }

  return (
    <header className="z-40 py-4 bg-white shadow-bottom dark:bg-gray-800">
      <div className="container flex items-center justify-between h-full px-6 mx-auto text-purple-600 dark:text-purple-300">
        {/* <!-- Mobile hamburger --> */}
        {/* <button
          className="p-1 mr-5 -ml-1 rounded-md lg:hidden focus:outline-none focus:shadow-outline-purple"
          onClick={toggleSidebar}
          aria-label="Menu"
        >
          <MenuIcon className="w-6 h-6" aria-hidden="true" />
        </button> */}
        {/* <!-- Search input --> */}
        <div className="flex justify-center flex-1 lg:mr-32">
          <div className="hidden relative w-full max-w-xl mr-6 focus-within:text-purple-500">
            <div className="absolute inset-y-0 flex items-center pl-2">
              <SearchIcon className="w-4 h-4" aria-hidden="true" />
            </div>
            <Input
              className="pl-8 text-gray-700"
              placeholder="Search for projects"
              aria-label="Search"
            />
          </div>
        </div>
        <ul className="flex items-center flex-shrink-0 space-x-6">
          {user?.name && (
            <li className="hidden md:block">
              <div className="text-right leading-tight">
                <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
                <p className="font-semibold text-green-500 dark:text-red-500">{user.name}</p>
              </div>
            </li>
          )}
          {/* <!-- Theme toggler --> */}
          <li className="flex">
            <button
              className="rounded-md focus:outline-none focus:shadow-outline-purple"
              onClick={toggleMode}
              aria-label="Toggle color mode"
            >
              {mode === 'dark' ? (
                <SunIcon className="w-5 h-5" aria-hidden="true" />
              ) : (
                <MoonIcon className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </li>
      
          {/* <!-- Profile menu --> */}
          <li className="relative">
            <button
              className="rounded-full focus:shadow-outline-purple focus:outline-none"
              onClick={handleProfileClick}
              aria-label="Account"
              aria-haspopup="true"
            >
              {user?.avatar ? (
                <Avatar
                  className="align-middle"
                  src={user.avatar}
                  alt={user.name || 'User avatar'}
                  aria-hidden="true"
                />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#9b1c1c' }}>
                  <FaUser />
                </div>
              )}
            </button>
            <Dropdown
              align="right"
              isOpen={isProfileMenuOpen}
              onClose={() => setIsProfileMenuOpen(false)}
            >
              <DropdownItem onClick={handleLogout}>
                <OutlineLogoutIcon className="w-4 h-4 mr-3" aria-hidden="true" />
                <span>Log out</span>
              </DropdownItem>
            </Dropdown>
          </li>
        </ul>
      </div>
    </header>
  )
}

export default Header