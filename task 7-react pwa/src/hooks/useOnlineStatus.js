import { useEffect, useState } from 'react'
import { isOnline, subscribe } from '../services/connectivity.js'

export default function useOnlineStatus() {
  const [online, setOnline] = useState(isOnline())

  useEffect(() => {
    return subscribe(setOnline)
  }, [])

  return online
}
