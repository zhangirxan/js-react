import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { logOut } from '../services/authService.js'
import ConnectionStatus from './ConnectionStatus.jsx'

export default function NavBar() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // the menu is only collapsible on phones, on wide screens it is always visible (see layout.css)
  const [menuOpen, setMenuOpen] = useState(false)

  // close the phone menu after moving to another page
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.search])

  async function handleLogout() {
    await logOut()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo">
          <img src="./favicon.svg" alt="" />
          <span className="logo-text">
            Auto<span>Market</span>
          </span>
        </Link>

        <ConnectionStatus />

        <button
          type="button"
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className={menuOpen ? 'nav-menu open' : 'nav-menu'}>
          <nav className="nav-links">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/cars" end>Cars</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/about">About</NavLink>
          </nav>

          <div className="nav-actions">
            <NavLink to="/cars/new" className="nav-sell">Sell a car</NavLink>

            {/* while Firebase checks the session we show nothing, so the buttons don't jump */}
            {!loading && user && (
              <>
                <NavLink to="/profile" className="nav-login">Profile</NavLink>
                <button type="button" className="nav-login" onClick={handleLogout}>Log out</button>
              </>
            )}

            {!loading && !user && (
              <>
                <NavLink to="/login" className="nav-login">Log in</NavLink>
                <NavLink to="/signup" className="nav-login">Sign up</NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
