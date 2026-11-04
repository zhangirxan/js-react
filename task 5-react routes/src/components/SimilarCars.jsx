import useCars from '../hooks/useCars.js'
import CarCard from './CarCard.jsx'

export default function SimilarCars({ make, currentId }) {
  const query = new URLSearchParams({ make, sort: 'price-asc', pageSize: 5 }).toString()
  const { data, status } = useCars(query)

  if (status === 'loading') return <p className="muted">Loading similar cars…</p>
  if (status === 'error') return null

  const cars = data.items.filter((car) => car.id !== currentId).slice(0, 4)
  if (cars.length === 0) return null

  return (
    <section className="similar">
      <h2>More {make}</h2>
      <div className="grid">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
    </section>
  )
}
