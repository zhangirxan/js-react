import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getAllCars } from '../services/service.js'
import { CITIES, MAKES } from '../services/seed.js'
import StatCard from '../components/StatCard.jsx'
import Breakdown from '../components/Breakdown.jsx'
import { ErrorState, Loader } from '../components/StatusView.jsx'
import { carTitle, formatMileage, formatPrice } from '../utils/format.js'

function average(numbers) {
  if (numbers.length === 0) return 0
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length
}

// [{ name: 'Petrol', count: 40 }, ...] sorted from the biggest group
function countBy(cars, field) {
  const counts = {}
  for (const car of cars) {
    counts[car[field]] = (counts[car[field]] || 0) + 1
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export default function DashboardPage() {
  const [allCars, setAllCars] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)

  // the filters are in the URL too, so the dashboard can be shared or refreshed
  const [searchParams, setSearchParams] = useSearchParams()
  const make = searchParams.get('make') || ''
  const city = searchParams.get('city') || ''

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')

    getAllCars(controller.signal)
      .then((cars) => {
        setAllCars(cars)
        setStatus('success')
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setError(err.message)
        setStatus('error')
      })

    return () => controller.abort()
  }, [reloadCount])

  function changeFilter(name, value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(name, value)
    else next.delete(name)
    setSearchParams(next)
  }

  if (status === 'error') return <ErrorState message={error} onRetry={() => setReloadCount((c) => c + 1)} />
  if (!allCars) return <Loader text="Loading statistics…" />

  let cars = allCars
  if (make) cars = cars.filter((car) => car.make === make)
  if (city) cars = cars.filter((car) => car.city === city)

  // the filter is also added to every link, so "Diesel" opens diesel BMWs if BMW is chosen
  function carsLink(extra) {
    const params = new URLSearchParams(extra)
    if (make) params.set('make', make)
    return `/cars?${params}`
  }

  const byPrice = [...cars].sort((a, b) => a.price - b.price)
  const cheapest = byPrice[0]
  const mostExpensive = byPrice[byPrice.length - 1]

  const fuelRows = countBy(cars, 'fuel').map((row) => ({ ...row, link: carsLink({ fuel: row.name }) }))
  const bodyRows = countBy(cars, 'body').map((row) => ({ ...row, link: carsLink({ body: row.name }) }))
  const makeRows = countBy(cars, 'make')
    .slice(0, 6)
    .map((row) => ({ ...row, link: `/cars?make=${encodeURIComponent(row.name)}` }))

  return (
    <div className="dashboard">
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Market overview based on the current listings.</p>
        </div>

        <div className="dashboard-filters">
          <label className="field-inline">
            <span>Make</span>
            <select value={make} onChange={(e) => changeFilter('make', e.target.value)}>
              <option value="">All makes</option>
              {MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <label className="field-inline">
            <span>City</span>
            <select value={city} onChange={(e) => changeFilter('city', e.target.value)}>
              <option value="">All cities</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>
      </div>

      {cars.length === 0 ? (
        <ErrorState title="No listings" message="There are no cars for this make in this city.">
          <button type="button" className="btn primary" onClick={() => setSearchParams({})}>Show everything</button>
        </ErrorState>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard label="Listings" value={cars.length} hint="Open in catalog →" link={carsLink({})} />
            <StatCard label="Average price" value={formatPrice(average(cars.map((c) => c.price)))} />
            <StatCard label="Average mileage" value={formatMileage(Math.round(average(cars.map((c) => c.mileage))))} />
            <StatCard label="Average year" value={Math.round(average(cars.map((c) => c.year)))} />
            <StatCard
              label="Cheapest"
              value={formatPrice(cheapest.price)}
              hint={`${carTitle(cheapest)} ${cheapest.year} →`}
              link={`/cars/${cheapest.id}`}
            />
            <StatCard
              label="Most expensive"
              value={formatPrice(mostExpensive.price)}
              hint={`${carTitle(mostExpensive)} ${mostExpensive.year} →`}
              link={`/cars/${mostExpensive.id}`}
            />
          </div>

          <div className="breakdowns">
            <Breakdown title="By fuel" rows={fuelRows} total={cars.length} />
            <Breakdown title="By body type" rows={bodyRows} total={cars.length} />
            {!make && <Breakdown title="Top makes" rows={makeRows} total={cars.length} />}
          </div>
        </>
      )}

      <p className="muted dashboard-note">
        Click any row to open the matching cars. Want to add yours? <Link to="/cars/new">Sell a car</Link>
      </p>
    </div>
  )
}
