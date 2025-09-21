import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@windmill/react-ui'
import { useAuth } from '../context/AuthContext'

function AccessDenied() {
  const { user, tenant } = useAuth()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 mx-auto">
      <div className="flex items-center">
        <div className="text-left">
          <div className="inline-flex items-center text-blue-500">
            <svg
              fill="currentColor"
              viewBox="0 0 20 20"
              className="w-12 h-12 mr-4"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-2xl font-bold tracking-wider text-gray-900 uppercase dark:text-gray-100">
              403
            </p>
          </div>
          <p className="text-2xl font-bold tracking-wider text-gray-900 dark:text-gray-100">
            Access Denied
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-4 mb-2">
            You don't have permission to access this page.
          </p>
          {user && tenant && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              <p>User: <span className="font-medium">{user.name}</span></p>
              <p>Tenant: <span className="font-medium">{tenant.name}</span></p>
              <p>Role: <span className="font-medium capitalize">{user.role}</span></p>
            </div>
          )}
          <div className="flex space-x-3">
            <Link to="/app/dashboard">
              <Button size="small">
                Go to Dashboard
              </Button>
            </Link>
            <Button layout="outline" size="small" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccessDenied