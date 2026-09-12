import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ROLE_DASHBOARD } from '../utils/constants'

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user, initializing } = useSelector(
    (state) => state.auth
  )

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const redirectTo = ROLE_DASHBOARD[user?.role] || '/'
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
