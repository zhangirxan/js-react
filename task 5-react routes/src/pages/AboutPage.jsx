import { Link } from 'react-router-dom'

const FEATURES = [
  ['Catalog', 'Search, 5 filters, 6 sort options and pagination. All filters are saved in the URL.'],
  ['Car page', 'Photo, 9 specs, description and other cars of the same make.'],
  ['Sell a car', 'A form with validation, photo upload and a live preview.'],
  ['Dashboard', 'Statistics and breakdowns calculated from the listings, with filters.'],
]

const TECH = ['React 19', 'React Router 7', 'Vite', 'Lazy loading', 'Simulated REST API', 'GitHub Pages']

export default function AboutPage() {
  return (
    <div className="about">
      <section className="about-card">
        <h1>About AutoMarket</h1>
        <p>
          AutoMarket is a small car marketplace I built for the React course at KBTU. It started as my midterm
          project, and in this homework I moved it to React Router: every page has its own URL, filters are kept in
          the address bar, and the heavier pages are loaded only when you open them.
        </p>
        <p>
          There is no real backend. The data comes from a simulated API that answers with a delay, can fail, and
          keeps everything in your browser's localStorage, so the app works like it talks to a server.
        </p>
      </section>

      <section className="about-grid">
        {FEATURES.map(([title, text]) => (
          <div key={title} className="about-feature">
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </section>

      <section className="about-card about-me">
        <div>
          <h2>Made by Zhanggirkhan Askarbek</h2>
          <p>4th year student at Kazakh-British Technical University, frontend developer. I like football, crypto and cars, so the theme was easy to pick.</p>
          <ul className="chips">
            {TECH.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div className="about-links">
          <a href="https://github.com/zhangirxan" target="_blank" rel="noreferrer" className="btn ghost">GitHub</a>
          <Link to="/cars" className="btn primary">Browse cars</Link>
        </div>
      </section>
    </div>
  )
}
