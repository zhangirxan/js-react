function formatTime(value) {
  if (!value) return 'earlier'
  return new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

// shown when the service worker answered from its cache instead of the network
export default function CachedNotice({ cachedAt }) {
  return (
    <p className="cached-notice">
      <b>Offline copy.</b> You are viewing data saved on {formatTime(cachedAt)}. It will refresh when the
      connection is back.
    </p>
  )
}
