import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { checkConnection } from '../services/service.js'
import { selectIsOnline, setOnline } from '../store/networkSlice.js'

export default function OfflinePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const online = useSelector(selectIsOnline)
  const [checking, setChecking] = useState(false)
  const [message, setMessage] = useState('')

  // the page the user tried to open (pages send it in state when they redirect here)
  const from = location.state?.from
  const backTo = from ? from.pathname + from.search : '/'

  async function retry() {
    setChecking(true)
    setMessage('')
    const ok = await checkConnection()
    setChecking(false)
    dispatch(setOnline(ok))

    if (ok) navigate(backTo, { replace: true })
    else setMessage('Still no connection. Try again in a moment.')
  }

  // we were sent here from a page and the network is back -> check and return there automatically
  useEffect(() => {
    if (!online || !from) return
    let cancelled = false
    checkConnection().then((ok) => {
      if (ok && !cancelled) navigate(backTo, { replace: true })
    })
    return () => {
      cancelled = true
    }
  }, [online, from, backTo, navigate])

  return (
    <div className="offline-page">
      <div className="offline-card">
        <span className="offline-icon" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 8.8a15 15 0 0 1 4.2-2.6M22 8.8a15 15 0 0 0-11.5-3.5M5 12.5a10 10 0 0 1 3-1.9M19 12.5a10 10 0 0 0-4.4-2.3M8.5 16.4a5 5 0 0 1 7 0M12 20h.01M3 3l18 18" />
          </svg>
        </span>
        <h1>You are offline</h1>
        <p className="muted">
          This page needs data that was not saved on your device yet. Pages and cars you opened before still
          work — try the catalog.
        </p>

        <button type="button" className="btn primary" onClick={retry} disabled={checking}>
          {checking ? 'Checking connection…' : 'Retry connection'}
        </button>
        {message && <p className="offline-message">{message}</p>}

        <div className="offline-links">
          <Link to="/cars">Saved catalog</Link>
          <Link to="/">Home</Link>
        </div>
      </div>
    </div>
  )
}
