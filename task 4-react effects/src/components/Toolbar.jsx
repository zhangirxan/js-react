export default function Toolbar({ search, sort, onSearch, onSort, onReload, onCreate, loading }) {
  return (
    <div className="toolbar">
      <input
        type="search"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search by name or role"
        aria-label="Search crew"
      />
      <select value={sort} onChange={(e) => onSort(e.target.value)} aria-label="Sort">
        <option value="name">Name A–Z</option>
        <option value="name-desc">Name Z–A</option>
      </select>
      <button type="button" className="btn" onClick={onReload} disabled={loading}>
        {loading ? 'Loading…' : 'Reload'}
      </button>
      <button type="button" className="btn primary" onClick={onCreate}>
        New member
      </button>
    </div>
  )
}
