import { useState } from 'react'
import StatusBadge from './StatusBadge.jsx'
import { EmptyMessage, ErrorMessage, Loader } from './StateMessage.jsx'

const ACTION_LABEL = {
  available: 'Send on mission',
  'on-mission': 'Return to base',
  injured: 'Mark as recovered',
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function DetailsPanel({ selectedId, state, pending, onClose, onRetry, onMission, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false)

  if (selectedId === null) {
    return (
      <aside className="details empty">
        <EmptyMessage title="No one selected" text="Click a name in the list to see the details." />
      </aside>
    )
  }

  const current = state.id === selectedId ? state : null
  const member = current?.item ?? null

  let body
  if (current?.status === 'error') {
    body = <ErrorMessage text={current.error} onRetry={onRetry} />
  } else if (!member) {
    body = <Loader text="Loading details…" />
  } else {
    const fields = [
      ['Role', member.description],
      ['Rank', member.rank],
      ['Callsign', member.callsign || '—'],
      ['Home planet', member.planet],
      ['Age', member.age],
      ['Ship', member.ship],
      ['Missions', member.missions ?? 0],
      ['Joined', formatDate(member.joined)],
      ['Skills', member.skills?.length ? member.skills.join(', ') : '—'],
    ]

    body = (
      <>
        <div className="details-head">
          <h2>{member.name}</h2>
          <StatusBadge status={member.status} />
        </div>

        <table className="fields">
          <tbody>
            {fields.map(([label, value]) => (
              <tr key={label}>
                <th>{label}</th>
                <td>{value ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {member.bio && <p className="bio">{member.bio}</p>}

        <div className="actions">
          <button type="button" className="btn primary" onClick={() => onMission(member)} disabled={!!pending}>
            {pending ?? ACTION_LABEL[member.status] ?? ACTION_LABEL.available}
          </button>
          <button type="button" className="btn" onClick={() => onEdit(member)} disabled={!!pending}>
            Edit
          </button>
          {confirming ? (
            <span className="confirm">
              Remove {member.name}?
              <button type="button" className="btn danger" onClick={() => onDelete(member)} disabled={!!pending}>
                Yes
              </button>
              <button type="button" className="btn" onClick={() => setConfirming(false)} disabled={!!pending}>
                No
              </button>
            </span>
          ) : (
            <button type="button" className="btn danger-text" onClick={() => setConfirming(true)} disabled={!!pending}>
              Remove
            </button>
          )}
        </div>
      </>
    )
  }

  return (
    <aside className="details">
      <button type="button" className="close" onClick={onClose}>Close</button>
      {body}
    </aside>
  )
}
