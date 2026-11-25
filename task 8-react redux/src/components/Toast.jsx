export default function Toast({ text, onClose }) {
  return (
    <div className="toast" role="status">
      <span>{text}</span>
      <button type="button" onClick={onClose} aria-label="Close">×</button>
    </div>
  )
}
