import { Link } from 'react-router-dom'
import { useCarList } from '../hooks/useCars.js'
import CarCard from '../components/CarCard.jsx'
import { Loader } from '../components/StatusView.jsx'

const HERO_PHOTO =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Porsche_911_No_1000000%2C_70_Years_Porsche_Sports_Car%2C_Berlin_%281X7A3888%29.jpg/960px-Porsche_911_No_1000000%2C_70_Years_Porsche_Sports_Car%2C_Berlin_%281X7A3888%29.jpg'

export default function HomePage() {
  const { data, isPending, isError } = useCarList({ sort: 'newest', pageSize: '4' })

  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero-text">
          <h1>Buy and sell cars without the hassle</h1>
          <p>
            AutoMarket collects used cars from private sellers all over Kazakhstan. Search by make, price or
            city, compare listings and publish your own car in a couple of minutes.
          </p>
          <div className="home-actions">
            <Link to="/cars" className="btn primary">Browse cars</Link>
            <Link to="/cars/new" className="btn light">Sell your car</Link>
          </div>
        </div>
        <img src={HERO_PHOTO} alt="Green Porsche 911" className="home-hero-photo" />
      </section>

      <section className="home-links">
        <Link to="/cars?sort=price-asc" className="home-link">
          <b>Cheapest first</b>
          <span>See the most affordable cars</span>
        </Link>
        <Link to="/cars?fuel=Electric" className="home-link">
          <b>Electric cars</b>
          <span>Tesla Model 3, Model Y and more</span>
        </Link>
        <Link to="/dashboard" className="home-link">
          <b>Market dashboard</b>
          <span>Prices, fuel types and top makes</span>
        </Link>
        <Link to="/about" className="home-link">
          <b>About the project</b>
          <span>How AutoMarket is built</span>
        </Link>
      </section>

      <section>
        <div className="section-head">
          <h2>Latest listings</h2>
          <Link to="/cars" className="see-all">All cars →</Link>
        </div>
        {isPending && <Loader text="Loading latest cars…" />}
        {isError && <p className="muted">Could not load the latest cars right now.</p>}
        {data && (
          <div className="grid">
            {data.items.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
