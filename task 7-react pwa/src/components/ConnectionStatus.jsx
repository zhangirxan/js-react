import useOnlineStatus from '../hooks/useOnlineStatus.js'

export default function ConnectionStatus() {
  const online = useOnlineStatus()

  return (
    <span className={online ? 'connection online' : 'connection offline'} title={online ? 'Connected' : 'No connection'}>
      <span className="connection-dot" />
      {online ? 'Online' : 'Offline'}
    </span>
  )
}
