import { useState } from 'react'
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import useCar from '../hooks/useCar.js'
import { deleteCar } from '../services/service.js'
import CarImage from '../components/CarImage.jsx'
import SimilarCars from '../components/SimilarCars.jsx'
import { ErrorState, Loader } from '../components/StatusView.jsx'
import { carTitle, formatDate, formatMileage, formatPrice } from '../utils/format.js'

export default function CarDetailsPage() {
  const { id } = useParams()

  // /cars/abc or /cars/-5 — not a valid id, no need to ask the API
  if (!/^\d+$/.test(id)) {
    return (
      <ErrorState title="Invalid listing link" message={`"${id}" is not a valid listing number.`}>
        <Link to="/cars" className="btn primary">See all cars</Link>
      </ErrorState>
    )
  }

  // key={id}: opening another car (e.g. from "More BMW") creates a fresh page,
  // so nothing from the previous car (like the delete confirmation) stays on screen
  return <CarDetails key={id} id={Number(id)} />
}

function CarDetails({ id }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { showNotice } = useOutletContext()
  const { car, status, error, reload } = useCar(id)

  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  function goBack() {
    // if the page was opened directly by link, there is nothing to go back to
    if (location.key === 'default') navigate('/cars')
    else navigate(-1)
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteCar(id)
      showNotice(`${carTitle(car)} was removed`)
      navigate('/cars')
    } catch (err) {
      setDeleteError(err.message)
      setDeleting(false)
    }
  }

  const links = (
    <div className="details-links">
      <button type="button" className="back" onClick={goBack}>← Back</button>
      <Link to="/cars" className="back">All cars</Link>
    </div>
  )

  if (status === 'loading') {
    return (
      <div className="details-page">
        {links}
        <Loader text="Loading listing…" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="details-page">
        {links}
        {error.notFound ? (
          <ErrorState title="Listing not found" message={error.message}>
            <Link to="/cars" className="btn primary">See all cars</Link>
          </ErrorState>
        ) : (
          <ErrorState message={error.message} onRetry={reload} />
        )}
      </div>
    )
  }

  const specs = [
    ['Year', car.year],
    ['Mileage', formatMileage(car.mileage)],
    ['Body', car.body],
    ['Fuel', car.fuel],
    ['Transmission', car.transmission],
    ['Power', `${car.horsepower} hp`],
    ['Color', car.color],
    ['City', car.city],
    ['Listed', formatDate(car.createdAt)],
  ]

  return (
    <div className="details-page">
      {links}

      <article className="details">
        <CarImage photo={car.photoLarge || car.photo} alt={carTitle(car)} large />

        <div className="details-info">
          <h1>
            {carTitle(car)} <span className="year">{car.year}</span>
          </h1>
          <p className="price big">{formatPrice(car.price)}</p>

          <dl className="specs">
            {specs.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          {car.description && <p className="description">{car.description}</p>}

          <div className="details-actions">
            {confirming ? (
              <div className="confirm">
                <span>Remove this listing?</span>
                <button type="button" className="btn danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Removing…' : 'Yes, remove'}
                </button>
                <button type="button" className="btn ghost" onClick={() => setConfirming(false)} disabled={deleting}>
                  Cancel
                </button>
              </div>
            ) : (
              <button type="button" className="btn danger-outline" onClick={() => setConfirming(true)}>
                Remove listing
              </button>
            )}
            {deleteError && <p className="form-error">{deleteError}</p>}
          </div>
        </div>
      </article>

      <SimilarCars make={car.make} currentId={car.id} />
    </div>
  )
}
