export function Loader({ text }) {
  return <p className="state">{text}</p>
}

export function ErrorMessage({ text, onRetry }) {
  return (
    <div className="state error">
      <p>
        <b>Error:</b> {text}
      </p>
      <button type="button" className="btn" onClick={onRetry}>Try again</button>
    </div>
  )
}

export function EmptyMessage({ title, text }) {
  return (
    <div className="state">
      <p><b>{title}</b></p>
      {text && <p>{text}</p>}
    </div>
  )
}
