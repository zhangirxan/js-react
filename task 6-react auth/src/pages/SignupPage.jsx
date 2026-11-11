import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getAuthErrorMessage, logInWithGoogle, signUp } from '../services/authService.js'
import GoogleButton from '../components/GoogleButton.jsx'
import FirebaseWarning from '../components/FirebaseWarning.jsx'
import { Loader } from '../components/StatusView.jsx'

function validate(email, password, confirm) {
  const errors = {}
  if (!email) errors.email = 'Enter your email'
  else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'This email does not look right'
  if (!password) errors.password = 'Choose a password'
  else if (password.length < 6) errors.password = 'At least 6 characters'
  if (confirm !== password) errors.confirm = 'Passwords do not match'
  return errors
}

export default function SignupPage() {
  const { user, loading } = useAuth()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [triedToSubmit, setTriedToSubmit] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const errors = validate(email, password, confirm)
  const shownErrors = triedToSubmit ? errors : {}

  const from = location.state?.from
  const nextPage = from ? from.pathname + from.search : '/profile'

  if (loading) return <Loader text="Checking your session…" />
  if (user) return <Navigate to={nextPage} replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setTriedToSubmit(true)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    setError('')
    try {
      await signUp(email, password)
      // Firebase logs the new user in right away, <Navigate> above takes them further
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
        <h1>Create an account</h1>
        <p className="muted">It takes less than a minute.</p>

        <FirebaseWarning />

        <GoogleButton onClick={handleGoogle} disabled={submitting} text="Sign up with Google" />

        <div className="divider"><span>or with email</span></div>

        <label className={shownErrors.email ? 'form-field has-error' : 'form-field'}>
          <span className="form-label">Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          {shownErrors.email && <span className="form-error">{shownErrors.email}</span>}
        </label>

        <label className={shownErrors.password ? 'form-field has-error' : 'form-field'}>
          <span className="form-label">Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" />
          {shownErrors.password && <span className="form-error">{shownErrors.password}</span>}
        </label>

        <label className={shownErrors.confirm ? 'form-field has-error' : 'form-field'}>
          <span className="form-label">Confirm password</span>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat the password" autoComplete="new-password" />
          {shownErrors.confirm && <span className="form-error">{shownErrors.confirm}</span>}
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="btn primary" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>

        <p className="auth-footer">
          Already have an account? <Link to="/login" state={location.state}>Log in</Link>
        </p>
      </form>
    </div>
  )
}
