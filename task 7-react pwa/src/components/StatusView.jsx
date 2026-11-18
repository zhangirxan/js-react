export function Loader({ text = 'Loading…' }) {
  return (
    <div className="status">
      <span className="spinner" />
      <p>{text}</p>
    </div>
  )
}

export function ErrorState({ title = 'Something went wrong', message, onRetry, children }) {
  return (
    <div className="status">
      <h3>{title}</h3>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn primary" onClick={onRetry}>
          Try again
        </button>
      )}
      {children}
    </div>
  )
}

export function EmptyState({ title, text, children }) {
  return (
    <div className="status">
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {children}
    </div>
  )
}
