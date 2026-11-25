export default function FormField({ label, error, wide = false, children }) {
  let className = 'form-field'
  if (wide) className += ' wide'
  if (error) className += ' has-error'

  return (
    <label className={className}>
      <span className="form-label">{label}</span>
      {children}
      {error && <span className="form-error">{error}</span>}
    </label>
  )
}
