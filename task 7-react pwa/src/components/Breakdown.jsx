import { Link } from 'react-router-dom'

// rows: [{ name: 'Petrol', count: 40, link: '/cars?fuel=Petrol' }, ...]
export default function Breakdown({ title, rows, total }) {
  // the longest bar is the biggest group, the others are compared to it
  const biggest = rows.length > 0 ? rows[0].count : 0

  return (
    <section className="breakdown">
      <h2>{title}</h2>
      {rows.length === 0 && <p className="muted">No data</p>}
      <ul>
        {rows.map((row) => {
          const percent = Math.round((row.count / total) * 100)
          const barWidth = Math.round((row.count / biggest) * 100)
          return (
            <li key={row.name}>
              <Link to={row.link} className="breakdown-row">
                <span className="breakdown-name">{row.name}</span>
                <span className="breakdown-bar">
                  <span style={{ width: `${barWidth}%` }} />
                </span>
                <span className="breakdown-count">
                  {row.count} <small>({percent}%)</small>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
