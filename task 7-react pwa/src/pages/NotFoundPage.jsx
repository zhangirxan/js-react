import { Link, useLocation } from 'react-router-dom'

export default function NotFoundPage() {
  const location = useLocation()

  return (
    <div className="not-found">
      <p className="not-found-code">404</p>
      <h1>This road leads nowhere</h1>
      <p className="muted">
        There is no page at <code>{location.pathname}</code>.
      </p>
      <div className="not-found-actions">
        <Link to="/" className="btn primary">Go home</Link>
        <Link to="/cars" className="btn ghost">Browse cars</Link>
      </div>
    </div>
  )
}
