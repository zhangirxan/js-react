import { useState } from 'react'
import { Link } from 'react-router-dom'

// placeholder: the form works, but there is no real authentication yet
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) {
      setMessage('Please fill in both fields.')
      return
    }
    setMessage('Logging in is not available yet. Accounts are coming in a future version.')
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Log in</h1>
        <p className="muted">Save favourite cars and manage your listings.</p>

        <label className="form-field">
          <span className="form-label">Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>

        <label className="form-field">
          <span className="form-label">Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </label>

        {message && <p className="login-message">{message}</p>}

        <button type="submit" className="btn primary">Log in</button>

        <p className="muted small login-footer">
          No account? You can still <Link to="/cars/new">sell a car</Link> without one.
        </p>
      </form>
    </div>
  )
}
