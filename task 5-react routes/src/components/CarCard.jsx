import { Link } from 'react-router-dom'
import CarImage from './CarImage.jsx'
import { carTitle, formatMileage, formatPrice } from '../utils/format.js'

export default function CarCard({ car }) {
  return (
    <Link to={`/cars/${car.id}`} className="car-card">
      <CarImage photo={car.photo} alt={carTitle(car)} />
      <div className="car-card-body">
        <div className="car-card-title">
          <h3>{carTitle(car)}</h3>
          <span className="year">{car.year}</span>
        </div>
        <p className="price">{formatPrice(car.price)}</p>
        <ul className="chips">
          <li>{formatMileage(car.mileage)}</li>
          <li>{car.fuel}</li>
          <li>{car.transmission}</li>
        </ul>
        <p className="city">📍 {car.city}</p>
      </div>
    </Link>
  )
}
