// AutoMarket service worker.
// During the build Vite fills in VERSION and PRECACHE_FILES below (see vite.config.js).

const VERSION = 'bde8b59a'
const PRECACHE_FILES = [
  "./assets/AboutPage-8YiUtn5Q.js",
  "./assets/CarDetailsPage-CUi9EWeY.js",
  "./assets/DashboardPage-D3g1VN_9.js",
  "./assets/FirebaseWarning-DIoiifa_.js",
  "./assets/index-BaFOr6S8.css",
  "./assets/index-eIkQf8Og.js",
  "./assets/LoginPage-DtrR8gs6.js",
  "./assets/NotFoundPage-ph6_Yvse.js",
  "./assets/ProfilePage-CJ2VTp-4.js",
  "./assets/SellPage-DTF_XNVi.js",
  "./assets/SignupPage-BVmSbxfp.js",
  "./favicon.svg",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-192.png",
  "./icons/maskable-512.png",
  "./index.html",
  "./manifest.json",
  "./offline.html"
]

const SHELL_CACHE = `automarket-shell-${VERSION}` // new name for every build
const IMAGE_CACHE = 'automarket-images-v1'
const API_CACHE = 'automarket-api-v1'
const CURRENT_CACHES = [SHELL_CACHE, IMAGE_CACHE, API_CACHE]

const MAX_IMAGES = 80
const MAX_API_ANSWERS = 60
const API_TIMEOUT = 4000

// servers send a "Vary" header; without ignoreVary a saved file may not match a request
// that has slightly different headers (for example JS modules are loaded with an Origin header)
const MATCH_OPTIONS = { ignoreVary: true }

// Firebase login requests must never end up in a cache
const AUTH_HOSTS = ['identitytoolkit.googleapis.com', 'securetoken.googleapis.com', 'apis.google.com', 'accounts.google.com']

// ---------- install: save the app shell ----------
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(PRECACHE_FILES)))
  // no skipWaiting() here: the new version waits until the user presses "Update"
})

// ---------- activate: delete caches of old versions ----------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith('automarket-') && !CURRENT_CACHES.includes(name))
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  )
})

// the page sends this message when the user presses "Update"
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting()
})

// ---------- fetch: decide how to answer every request ----------
self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)

  // only GET can be cached; login requests always go straight to the network
  if (request.method !== 'GET') return
  if (AUTH_HOSTS.includes(url.hostname)) return

  const isSameOrigin = url.origin === self.location.origin

  if (request.mode === 'navigate') {
    event.respondWith(pageNetworkFirst(request))
    return
  }

  if (isSameOrigin && url.pathname.includes('/api/')) {
    event.respondWith(apiNetworkFirst(request))
    return
  }

  if (request.destination === 'image' || request.destination === 'font' || url.hostname === 'fonts.googleapis.com') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, MAX_IMAGES))
    return
  }

  if (isSameOrigin) {
    event.respondWith(cacheFirst(request, SHELL_CACHE))
  }
  // everything else (Firebase SDK, Google scripts...) is not touched
})

// ---------- strategies ----------

// Pages: try the network (to get the newest version), offline -> saved index.html -> offline.html
async function pageNetworkFirst(request) {
  try {
    return await fetch(request)
  } catch {
    const cache = await caches.open(SHELL_CACHE)
    return (await cache.match('./index.html', MATCH_OPTIONS)) || (await cache.match('./offline.html', MATCH_OPTIONS))
  }
}

// API: network first (fresh data), if it fails or takes too long -> the saved answer
async function apiNetworkFirst(request) {
  const cache = await caches.open(API_CACHE)

  try {
    // 'no-cache' = really ask the server, don't take the browser's own HTTP cache
    const response = await fetchWithTimeout(new Request(request, { cache: 'no-cache' }), API_TIMEOUT)
    if (response.ok) {
      const copy = await withHeaders(response.clone(), { 'X-Cached-At': new Date().toISOString() })
      await cache.put(request, copy)
      await trimCache(API_CACHE, MAX_API_ANSWERS)
    }
    return response
  } catch {
    const saved = await cache.match(request, MATCH_OPTIONS)
    if (saved) return await withHeaders(saved, { 'X-From-Cache': '1' })

    return new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// Images, fonts, JS/CSS: they never change at the same URL, so the cache is enough
async function cacheFirst(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  const saved = await cache.match(request, MATCH_OPTIONS)
  if (saved) return saved

  try {
    const response = await fetch(request)
    // images from other sites come back "opaque" (status 0), they can still be cached
    if (response.ok || response.type === 'opaque') {
      await cache.put(request, response.clone())
      if (maxEntries) await trimCache(cacheName, maxEntries)
    }
    return response
  } catch {
    return new Response('', { status: 504 })
  }
}

// ---------- helpers ----------

function fetchWithTimeout(request, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms)
    fetch(request)
      .then((response) => {
        clearTimeout(timer)
        resolve(response)
      })
      .catch((error) => {
        clearTimeout(timer)
        reject(error)
      })
  })
}

// a copy of the response with extra headers
async function withHeaders(response, extra) {
  const headers = new Headers(response.headers)
  Object.entries(extra).forEach(([key, value]) => headers.set(key, value))
  const body = await response.blob()
  return new Response(body, { status: response.status, statusText: response.statusText, headers })
}

// keep only the newest entries (the oldest ones are first in the list)
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  for (let i = 0; i < keys.length - maxEntries; i++) {
    await cache.delete(keys[i])
  }
}
