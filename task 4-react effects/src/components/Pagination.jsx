export default function Pagination({ page, totalPages, disabled, onChange }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav className="pagination" aria-label="Pages">
      <button type="button" disabled={disabled || page === 1} onClick={() => onChange(page - 1)}>‹</button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={p === page ? 'current' : ''}
          disabled={disabled}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      <button type="button" disabled={disabled || page === totalPages} onClick={() => onChange(page + 1)}>›</button>
    </nav>
  )
}
