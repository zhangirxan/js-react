// Registers the service worker and tells the app when a new version is ready.

let waitingWorker = null
const listeners = new Set()

function setWaitingWorker(worker) {
  waitingWorker = worker
  listeners.forEach((listener) => listener(Boolean(worker)))
}

export function registerServiceWorker() {
  // in "npm run dev" there is no sw.js, it only exists after the build
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return

  window.addEventListener('load', async () => {
    const registration = await navigator.serviceWorker.register('./sw.js')

    // a new version was downloaded earlier and is still waiting
    if (registration.waiting && navigator.serviceWorker.controller) {
      setWaitingWorker(registration.waiting)
    }

    // a new version starts downloading
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      newWorker.addEventListener('statechange', () => {
        // "installed" + there is an old worker = this is an update, not the first visit
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          setWaitingWorker(newWorker)
        }
      })
    })

    // check for a new version every 30 minutes while the app is open
    setInterval(() => registration.update(), 30 * 60 * 1000)
  })

  // the new worker took control -> reload once to use the new files
  let reloading = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return
    reloading = true
    window.location.reload()
  })
}

export function isUpdateReady() {
  return Boolean(waitingWorker)
}

export function applyUpdate() {
  if (waitingWorker) waitingWorker.postMessage('SKIP_WAITING')
}

export function subscribeToUpdates(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
