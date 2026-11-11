import { Link } from 'react-router-dom'

export default function StatCard({ label, value, hint, link }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {hint && (link ? <Link to={link} className="stat-hint link">{hint}</Link> : <span className="stat-hint">{hint}</span>)}
    </div>
  )
}
