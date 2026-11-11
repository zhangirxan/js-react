import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getAuthErrorMessage, logIn, logInWithGoogle } from '../services/authService.js'
import GoogleButton from '../components/GoogleButton.jsx'
import FirebaseWarning from '../components/FirebaseWarning.jsx'
import { Loader } from '../components/StatusView.jsx'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // ProtectedRoute puts the page the user wanted in state.from
  const from = location.state?.from
  const nextPage = from ? from.pathname + from.search : '/profile'

  if (loading) return <Loader text="Checking your session…" />

  // already logged in, or the login just worked -> go further
  if (user) return <Navigate to={nextPage} replace />

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) {
      setError('Enter your email and password.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await logIn(email, password)
      // no navigate() here: onAuthStateChanged updates the user and the <Navigate> above runs
    } catch (err) {
      setError(getAuthErrorMessage(err))
      setSubmitting(false)
    }
  }

  async function handleGoogle() {
    setSubmitting(true)
    setError('')
    try {
      await logInWithGoogle()
    } catch (err) {
      setError(getAuthErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Welcome back</h1>
        <p className="muted">Log in to sell cars and manage your listings.</p>

        <FirebaseWarning />
        {from && <p className="auth-info">Please log in to open this page.</p>}

        <GoogleButton onClick={handleGoogle} disabled={submitting} />

        <div className="divider"><span>or with email</span></div>

        <label className="form-field">
          <span className="form-label">Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
        </label>

        <label className="form-field">
          <span className="form-label">Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="btn primary" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>

        <p className="auth-footer">
          New here? <Link to="/signup" state={location.state}>Create an account</Link>
        </p>
      </form>
    </div>
  )
}
