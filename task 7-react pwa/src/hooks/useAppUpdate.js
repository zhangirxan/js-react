import { useEffect, useState } from 'react'
import { applyUpdate, isUpdateReady, subscribeToUpdates } from '../services/pwa.js'

export default function useAppUpdate() {
  const [updateReady, setUpdateReady] = useState(isUpdateReady())

  useEffect(() => {
    return subscribeToUpdates(setUpdateReady)
  }, [])

  return { updateReady, applyUpdate }
}
