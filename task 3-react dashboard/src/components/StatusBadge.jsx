import { STATUSES } from '../data.js'

export default function StatusBadge({ status }) {
  return <span className={`badge ${status}`}>{STATUSES[status]}</span>
}
