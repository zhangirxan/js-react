import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectIsOnline, setOnline } from '../store/networkSlice.js'
import { dataInvalidated } from '../store/shared.js'

// Used once in RootLayout: browser online/offline events -> Redux,
// and when the connection comes back all car data is loaded again.
export function useNetworkWatcher() {
  const dispatch = useDispatch()
  const online = useSelector(selectIsOnline)
  const wasOnline = useRef(online)

  useEffect(() => {
    const goOnline = () => dispatch(setOnline(true))
    const goOffline = () => dispatch(setOnline(false))
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [dispatch])

  // only offline -> online, not on the first render
  useEffect(() => {
    if (online && !wasOnline.current) dispatch(dataInvalidated())
    wasOnline.current = online
  }, [online, dispatch])
}
