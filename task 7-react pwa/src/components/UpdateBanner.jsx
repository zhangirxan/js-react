import useAppUpdate from '../hooks/useAppUpdate.js'

export default function UpdateBanner() {
  const { updateReady, applyUpdate } = useAppUpdate()

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
