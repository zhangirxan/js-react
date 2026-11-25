import { useSelector } from 'react-redux'
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAllCars } from '../hooks/useCars.js'
import { selectDashboardStats } from '../store/dashboardSlice.js'
import CachedNotice from '../components/CachedNotice.jsx'
import { CITIES, MAKES } from '../services/seed.js'
import StatCard from '../components/StatCard.jsx'
import Breakdown from '../components/Breakdown.jsx'
import { ErrorState, Loader } from '../components/StatusView.jsx'
import { carTitle, formatMileage, formatPrice } from '../utils/format.js'

export default function DashboardPage() {
  const { data, isPending, isError, error, refetch } = useAllCars()
  const location = useLocation()

  // the filters are in the URL too, so the dashboard can be shared or refreshed
  const [searchParams, setSearchParams] = useSearchParams()
  const make = searchParams.get('make') || ''
  const city = searchParams.get('city') || ''

  // memoized selector: calculated again only when the cars, make or city change
  const stats = useSelector((state) => selectDashboardStats(state, make, city))

  function changeFilter(name, value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(name, value)
    else next.delete(name)
    setSearchParams(next)
  }

  if (isPending) return <Loader text="Loading statistics…" />
  if (isError && error.offline) return <Navigate to="/offline" replace state={{ from: location }} />
  if (isError) return <ErrorState message={error.message} onRetry={() => refetch()} />

  // the filter is also added to every link, so "Diesel" opens diesel BMWs if BMW is chosen
  function carsLink(extra) {
    const params = new URLSearchParams(extra)
    if (make) params.set('make', make)
    return `/cars?${params}`
  }

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

      {data.fromCache && <CachedNotice cachedAt={data.cachedAt} />}

      {!stats ? (
        <ErrorState title="No listings" message="There are no cars for this make in this city.">
          <button type="button" className="btn primary" onClick={() => setSearchParams({})}>Show everything</button>
        </ErrorState>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard label="Listings" value={stats.count} hint="Open in catalog →" link={carsLink({})} />
            <StatCard label="Average price" value={formatPrice(stats.averagePrice)} />
            <StatCard label="Average mileage" value={formatMileage(stats.averageMileage)} />
            <StatCard label="Average year" value={stats.averageYear} />
            <StatCard
              label="Cheapest"
              value={formatPrice(stats.cheapest.price)}
              hint={`${carTitle(stats.cheapest)} ${stats.cheapest.year} →`}
              link={`/cars/${stats.cheapest.id}`}
            />
            <StatCard
              label="Most expensive"
              value={formatPrice(stats.mostExpensive.price)}
              hint={`${carTitle(stats.mostExpensive)} ${stats.mostExpensive.year} →`}
              link={`/cars/${stats.mostExpensive.id}`}
            />
          </div>

          <div className="breakdowns">
            <Breakdown
              title="By fuel"
              rows={stats.byFuel.map((row) => ({ ...row, link: carsLink({ fuel: row.name }) }))}
              total={stats.count}
            />
            <Breakdown
              title="By body type"
              rows={stats.byBody.map((row) => ({ ...row, link: carsLink({ body: row.name }) }))}
              total={stats.count}
            />
            {!make && (
              <Breakdown
                title="Top makes"
                rows={stats.byMake.map((row) => ({ ...row, link: `/cars?make=${encodeURIComponent(row.name)}` }))}
                total={stats.count}
              />
            )}
          </div>
        </>
      )}

      <p className="muted dashboard-note">
        Click any row to open the matching cars. Want to add yours? <Link to="/cars/new">Sell a car</Link>
      </p>
    </div>
  )
}
