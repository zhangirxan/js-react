import { useEffect, useState } from 'react'
import { getCars } from '../services/service.js'

// queryString looks like "make=BMW&sort=price-asc&page=2"
export default function useCars(queryString) {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const params = Object.fromEntries(new URLSearchParams(queryString))

    setStatus('loading')

    getCars(params, controller.signal)
      .then((result) => {
        setData(result)
        setStatus('success')
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setError(err.message)
        setStatus('error')
      })

    // a new query cancels the old request, so an old answer can't replace a newer one
    return () => controller.abort()
  }, [queryString, reloadCount])

  function reload() {
    setReloadCount((count) => count + 1)
  }

  return { data, status, error, reload }
}
