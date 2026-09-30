import { STATUSES } from '../data.js'

export default function Header({ players }) {
  console.log('[render] Header')

  const avgRating = players.length
    ? Math.round(players.reduce((sum, p) => sum + p.rating, 0) / players.length)
    : 0

  const stats = [
    { label: 'Players', value: players.length },
    ...Object.entries(STATUSES).map(([key, label]) => ({
      label,
      value: players.filter((p) => p.status === key).length,
      tone: key,
    })),
    { label: 'Avg rating', value: avgRating },
  ]

  return (
    <header className="header">
      <div className="brand">
        <img src={`${import.meta.env.BASE_URL}ball.png`} alt="" />
        <div>
          <h1>Squad Board</h1>
          <p>Manage your football squad before the next match</p>
        </div>
      </div>

      <div className="stats">
        {stats.map((s) => (
          <div key={s.label} className={`stat ${s.tone ?? ''}`}>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </header>
  )
}
