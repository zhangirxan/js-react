import { useSelector } from 'react-redux'
import { useCarList } from '../hooks/useCars.js'
import { selectSimilarCars } from '../store/catalogSlice.js'
import CarCard from './CarCard.jsx'

export default function SimilarCars({ make, currentId }) {
  const params = { make, sort: 'price-asc', pageSize: '5' }
  const { isPending, isError } = useCarList(params)

  const queryString = new URLSearchParams(params).toString()
  const cars = useSelector((state) => selectSimilarCars(state, queryString, currentId))

  if (isPending) return <p className="muted">Loading similar cars…</p>
  if (isError || cars.length === 0) return null

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
