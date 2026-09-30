import { useState } from 'react'
import { STATUSES } from '../data.js'
import StatusBadge from './StatusBadge.jsx'

export default function PlayerCard({ player, onStatusChange, onRemove, onReset }) {
  // local state, only this card knows about it
  const [goals, setGoals] = useState(0)
  const [note, setNote] = useState('')
  const [expanded, setExpanded] = useState(false)

  console.log(`[render] PlayerCard #${player.number} ${player.name}`)

  const unavailable = player.status !== 'available'

  return (
    <article className={`card ${player.status}`}>
      <div className="card-top">
        <span className="number">{player.number}</span>
        <div className="info">
          <h3>{player.name}</h3>
          <span className="meta">{player.position} · {player.country}</span>
        </div>
        <span className="rating">{player.rating}</span>
      </div>

      <div className="card-row">
        <StatusBadge status={player.status} />
        <select value={player.status} onChange={(e) => onStatusChange(player.id, e.target.value)}>
          {Object.entries(STATUSES).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {unavailable ? (
        <p className="out">Can't train right now</p>
      ) : (
        <div className="training">
          <span>Training goals</span>
          <div className="counter">
            <button onClick={() => setGoals((g) => Math.max(0, g - 1))}>−</button>
            <b>{goals}</b>
            <button onClick={() => setGoals((g) => g + 1)}>+</button>
          </div>
        </div>
      )}

      <input
        className="note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Coach note…"
      />

      {expanded && (
        <div className="details">
          <span>Age {player.age}</span>
          <span>Rating {player.rating}</span>
          <span>ID {player.id}</span>
        </div>
      )}

      <div className="card-actions">
        <button className="link" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Hide details' : 'Details'}
        </button>
        <button className="link" onClick={() => onReset(player.id)}>Reset card</button>
        <button className="link danger" onClick={() => onRemove(player.id)}>Remove</button>
      </div>
    </article>
  )
}
