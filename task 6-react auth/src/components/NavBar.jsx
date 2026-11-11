import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { logOut } from '../services/authService.js'

export default function NavBar() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

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
    </header>
  )
}
