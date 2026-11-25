import { useSelector } from 'react-redux'
import { selectUpdateReady } from '../store/networkSlice.js'
import { applyUpdate } from '../services/pwa.js'

export default function UpdateBanner() {
  const updateReady = useSelector(selectUpdateReady)

  if (!updateReady) return null

  return (
    <div className="update-banner" role="status">
      <span>A new version of AutoMarket is available.</span>
      <button type="button" className="btn primary small" onClick={applyUpdate}>
        Update now
      </button>
    </div>
  )
}
