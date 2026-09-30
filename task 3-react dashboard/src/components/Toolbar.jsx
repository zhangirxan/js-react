import { POSITIONS, STATUSES } from '../data.js'

export default function Toolbar({
  statusFilter, onStatusFilter,
  positionFilter, onPositionFilter,
  sortBy, onSortBy,
  reversed, onReverse,
  onResetAll,
  useIndexKeys, onToggleIndexKeys,
}) {
  console.log('[render] Toolbar')

  const statusOptions = [['all', 'All'], ...Object.entries(STATUSES)]

  return (
    <div className="panel toolbar">
      <div className="chips">
        {statusOptions.map(([key, label]) => (
          <button
            key={key}
            className={`chip ${statusFilter === key ? 'active' : ''}`}
            onClick={() => onStatusFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="controls">
        <select value={positionFilter} onChange={(e) => onPositionFilter(e.target.value)}>
          <option value="all">All positions</option>
          {POSITIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select value={sortBy} onChange={(e) => onSortBy(e.target.value)}>
          <option value="number">Sort: number</option>
          <option value="rating">Sort: rating</option>
          <option value="name">Sort: name</option>
        </select>

        <button className="btn" onClick={onReverse}>
          {reversed ? '↑ Reversed' : '↓ Reverse'}
        </button>
        <button className="btn" onClick={onResetAll}>Reset all cards</button>

        <label className="switch">
          <input type="checkbox" checked={useIndexKeys} onChange={onToggleIndexKeys} />
          index as key
        </label>
      </div>

      {useIndexKeys && (
        <p className="warning">
          Keys are array indexes now!
        </p>
      )}
    </div>
  )
}
