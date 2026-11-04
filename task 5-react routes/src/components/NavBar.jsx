import { Link, NavLink } from 'react-router-dom'

export default function NavBar() {
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
          <NavLink to="/login" className="nav-login">Log in</NavLink>
        </div>
      </div>
    </header>
  )
}
