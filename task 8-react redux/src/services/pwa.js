// Registers the service worker. When a new version is ready it calls onUpdateReady
// (main.jsx passes a function that puts "updateReady: true" into Redux).

let waitingWorker = null
let updateRequested = false

export function registerServiceWorker({ onUpdateReady }) {
  // in "npm run dev" there is no sw.js, it only exists after the build
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return

  function setWaitingWorker(worker) {
    waitingWorker = worker
    onUpdateReady()
  }

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

  // the new worker took control after "Update now" -> reload once to use the new files.
  // (on the very first visit the worker also takes control, but then nothing must reload)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!updateRequested) return
    updateRequested = false
    window.location.reload()
  })
}

export function applyUpdate() {
  if (!waitingWorker) return
  updateRequested = true
  waitingWorker.postMessage('SKIP_WAITING')
}
