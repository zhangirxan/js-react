import StatusBadge from './StatusBadge.jsx'
import { EmptyMessage, ErrorMessage, Loader } from './StateMessage.jsx'

export default function CrewList({ state, search, selectedId, pending, onSelect, onRetry }) {
  if (state.status === 'error') return <ErrorMessage text={state.error} onRetry={onRetry} />

  if (state.status === 'loading' && state.items.length === 0) return <Loader text="Loading crew…" />

  if (state.status === 'success' && state.items.length === 0) {
    return search ? (
      <EmptyMessage title="Nobody found" text={`No crew member matches "${search}".`} />
    ) : (
      <EmptyMessage title="The crew is empty" text="Add the first member with “New member”." />
    )
  }

  return (
    <table className={`crew-table ${state.status === 'loading' ? 'is-loading' : ''}`}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Role</th>
          <th className="hide-sm">Ship</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {state.items.map((member) => (
          <tr
            key={member.id}
            className={member.id === selectedId ? 'selected' : ''}
            onClick={() => onSelect(member.id)}
          >
            <td>
              <button type="button" className="name-link" onClick={() => onSelect(member.id)}>
                {member.name}
              </button>
            </td>
            <td>{member.description}</td>
            <td className="hide-sm">{member.ship ?? '—'}</td>
            <td>
              {pending[member.id] ? (
                <span className="row-pending">{pending[member.id]}</span>
              ) : (
                <StatusBadge status={member.status} />
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
