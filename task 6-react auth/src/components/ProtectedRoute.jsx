import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Loader } from './StatusView.jsx'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Firebase hasn't answered yet, don't redirect a logged in user by mistake
  if (loading) return <Loader text="Checking your session…" />

  if (!user) {
    // remember where the user wanted to go, LoginPage sends them back after login
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
