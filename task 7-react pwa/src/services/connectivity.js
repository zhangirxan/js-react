// Knows if the app can reach the server right now.
// navigator.onLine alone is not enough: wifi can be "connected" but without internet,
// so every API request also reports if it went through or not.

let online = navigator.onLine
const listeners = new Set()

function setOnline(value) {
  if (online === value) return
  online = value
  listeners.forEach((listener) => listener(online))
}

window.addEventListener('online', () => setOnline(true))
window.addEventListener('offline', () => setOnline(false))

export function reportRequestOk() {
  setOnline(true)
}

export function reportRequestFailed() {
  setOnline(false)
}

export function isOnline() {
  return online
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
