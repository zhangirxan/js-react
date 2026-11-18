import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getAuthErrorMessage, logOut } from '../services/authService.js'
import { useCarList } from '../hooks/useCars.js'
import CarCard from '../components/CarCard.jsx'
import { EmptyState, ErrorState, Loader } from '../components/StatusView.jsx'

function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function ProfilePage() {
  // ProtectedRoute already checked that the user is logged in
  const { user } = useAuth()
  const navigate = useNavigate()
  const [logoutError, setLogoutError] = useState('')

  const myCars = useCarList({ owner: user.uid, pageSize: '50' })

  async function handleLogout() {
    try {
      await logOut()
      navigate('/')
    } catch (err) {
      setLogoutError(getAuthErrorMessage(err))
    }
  }

  const isGoogle = user.providerData.some((p) => p.providerId === 'google.com')
  const name = user.displayName || user.email.split('@')[0]

  const details = [
    ['Email', user.email],
    ['User ID (UID)', user.uid],
    ['Signed in with', isGoogle ? 'Google' : 'Email and password'],
    ['Account created', formatDateTime(user.metadata.creationTime)],
    ['Last sign-in', formatDateTime(user.metadata.lastSignInTime)],
  ]

  let listings
  if (myCars.isPending) {
    listings = <Loader text="Loading your listings…" />
  } else if (myCars.isError) {
    listings = <ErrorState message={myCars.error.message} onRetry={() => myCars.refetch()} />
  } else if (myCars.data.total === 0) {
    listings = (
      <EmptyState title="No listings yet" text="Cars you publish will appear here.">
        <Link to="/cars/new" className="btn primary">Sell a car</Link>
      </EmptyState>
    )
  } else {
    listings = (
      <div className="grid">
        {myCars.data.items.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
    )
  }

  return (
    <div className="profile">
      <section className="profile-card">
        <div className="profile-head">
          {user.photoURL ? (
            <img src={user.photoURL} alt="" className="profile-avatar" referrerPolicy="no-referrer" />
          ) : (
            <span className="profile-avatar letter">{name[0].toUpperCase()}</span>
          )}
          <div>
            <h1>{name}</h1>
            <p className="muted">{user.email}</p>
          </div>
          <button type="button" className="btn ghost" onClick={handleLogout}>Log out</button>
        </div>

        <dl className="profile-details">
          {details.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        {logoutError && <p className="form-error">{logoutError}</p>}
      </section>

      <div className="section-head">
        <h2>My listings</h2>
        <Link to="/cars/new" className="see-all">Sell a car →</Link>
      </div>
      {listings}
    </div>
  )
}
