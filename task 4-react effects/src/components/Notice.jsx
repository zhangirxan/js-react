export default function Notice({ notice, onClose }) {
  return (
    <div className={`notice ${notice.type}`} role="status">
      <span>{notice.text}</span>
      <button type="button" onClick={onClose} aria-label="Close">×</button>
    </div>
  )
}
