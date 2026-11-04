import { useEffect, useState } from 'react'
import { getCar } from '../services/service.js'

export default function useCar(id) {
  const [car, setCar] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')

    getCar(id, controller.signal)
      .then((result) => {
        setCar(result)
        setStatus('success')
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setError(err)
        setStatus('error')
      })

    return () => controller.abort()
  }, [id, reloadCount])

  function reload() {
    setReloadCount((count) => count + 1)
  }

  return { car, status, error, reload }
}
