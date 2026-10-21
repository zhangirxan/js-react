import { STATUS } from '../constants.js'

export default function StatusBadge({ status }) {
  if (!status) return null
  return <span className={`badge ${status}`}>{STATUS[status] ?? status}</span>
}
