export default function Pagination({ page, totalPages, onChange, disabled }) {
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i)
  }

  return (
    <nav className="pagination" aria-label="Pages">
      <button type="button" disabled={disabled || page === 1} onClick={() => onChange(page - 1)}>
        ‹ Prev
      </button>

      {pages.map((number) => (
        <button
          key={number}
          type="button"
          className={number === page ? 'current' : ''}
          disabled={disabled}
          onClick={() => onChange(number)}
        >
          {number}
        </button>
      ))}

      <button type="button" disabled={disabled || page === totalPages} onClick={() => onChange(page + 1)}>
        Next ›
      </button>
    </nav>
  )
}
