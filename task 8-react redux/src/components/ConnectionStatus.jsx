import { useSelector } from 'react-redux'
import { selectIsOnline } from '../store/networkSlice.js'

export default function ConnectionStatus() {
  const online = useSelector(selectIsOnline)

  return (
    <span className={online ? 'connection online' : 'connection offline'} title={online ? 'Connected' : 'No connection'}>
      <span className="connection-dot" />
      {online ? 'Online' : 'Offline'}
    </span>
  )
}
