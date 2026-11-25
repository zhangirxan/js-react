// Public data comes from the server: api/cars.json and api/cars/<id>.json.
// The service worker caches these answers, so they also work offline.
const API_URL = `${import.meta.env.BASE_URL}api`

// Cars the user published or removed are kept only in this browser.
const ADDED_KEY = 'automarket-pwa-added'
const REMOVED_KEY = 'automarket-pwa-removed'

// open the site with ?fail=1 to make every request fail
const alwaysFail = new URLSearchParams(window.location.search).has('fail')

export class OfflineError extends Error {
  constructor() {
    super('You are offline and this data was not saved before.')
    this.offline = true
  }
}

function readLocal(key) {
  return JSON.parse(localStorage.getItem(key) || '[]')
}

function writeLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    throw new Error('Not enough browser storage. Try a smaller photo.')
  }
}

// GET request to our API. The service worker adds two headers when it answers from the cache:
// X-From-Cache: 1 and X-Cached-At: <date>, so the page can tell the user they see saved data.
async function fetchJson(path, signal) {
  if (alwaysFail) throw new Error('Server is not responding. Please try again.')

  let response
  try {
    response = await fetch(`${API_URL}/${path}`, { signal })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new OfflineError()
  }

  const fromCache = response.headers.get('X-From-Cache') === '1'
  // some servers answer a missing file with index.html (status 200), that is also "not found"
  const isJson = (response.headers.get('Content-Type') || '').includes('json')

  if (response.status === 404 || (response.ok && !isJson)) {
    const error = new Error('This listing does not exist or was removed.')
    error.notFound = true
    throw error
  }
  if (response.status === 503) throw new OfflineError()
  if (!response.ok) throw new Error('Server is not responding. Please try again.')

  return {
    data: await response.json(),
    fromCache,
    cachedAt: response.headers.get('X-Cached-At'),
  }
}

// server cars + cars added in this browser - cars removed in this browser
async function loadAllCars(signal) {
  const result = await fetchJson('cars.json', signal)
  const removed = readLocal(REMOVED_KEY)
  const cars = [...readLocal(ADDED_KEY), ...result.data].filter((car) => !removed.includes(car.id))
  return { cars, fromCache: result.fromCache, cachedAt: result.cachedAt }
}

function sortCars(cars, sort) {
  if (sort === 'price-asc') return cars.sort((a, b) => a.price - b.price)
  if (sort === 'price-desc') return cars.sort((a, b) => b.price - a.price)
  if (sort === 'year-desc') return cars.sort((a, b) => b.year - a.year)
  if (sort === 'mileage-asc') return cars.sort((a, b) => a.mileage - b.mileage)
  if (sort === 'power-desc') return cars.sort((a, b) => b.horsepower - a.horsepower)
  return cars.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) // newest
}

// list with search, filters, sorting and pagination
export async function getCars(params = {}, signal) {
  const { cars: allCars, fromCache, cachedAt } = await loadAllCars(signal)

  const search = (params.search || '').toLowerCase().trim()
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 12

  let cars = allCars

  if (search) {
    cars = cars.filter((car) => {
      const text = `${car.make} ${car.model} ${car.year} ${car.city} ${car.color}`.toLowerCase()
      return search.split(' ').every((word) => text.includes(word))
    })
  }
  if (params.make) cars = cars.filter((car) => car.make === params.make)
  if (params.fuel) cars = cars.filter((car) => car.fuel === params.fuel)
  if (params.body) cars = cars.filter((car) => car.body === params.body)
  if (params.maxPrice) cars = cars.filter((car) => car.price <= Number(params.maxPrice))
  if (params.yearFrom) cars = cars.filter((car) => car.year >= Number(params.yearFrom))
  if (params.owner) cars = cars.filter((car) => car.ownerId === params.owner)

  sortCars(cars, params.sort)

  const total = cars.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, totalPages)
  const items = cars.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return { items, total, page: currentPage, pageSize, totalPages, fromCache, cachedAt }
}

// all cars for the dashboard
export async function getAllCars(signal) {
  const { cars, fromCache, cachedAt } = await loadAllCars(signal)
  return { cars, fromCache, cachedAt }
}

// one car: api/cars/<id>.json
export async function getCar(id, signal) {
  const carId = Number(id)

  const added = readLocal(ADDED_KEY).find((car) => car.id === carId)
  if (added) return { car: added, fromCache: false, cachedAt: null }

  if (readLocal(REMOVED_KEY).includes(carId)) {
    const error = new Error('This listing does not exist or was removed.')
    error.notFound = true
    throw error
  }

  try {
    const result = await fetchJson(`cars/${carId}.json`, signal)
    return { car: result.data, fromCache: result.fromCache, cachedAt: result.cachedAt }
  } catch (error) {
    if (!error.offline) throw error

    // offline and this car page was never opened: maybe the car is in the saved list
    const list = await loadAllCars(signal)
    const car = list.cars.find((c) => c.id === carId)
    if (!car) throw error
    return { car, fromCache: true, cachedAt: list.cachedAt }
  }
}

// used by the Retry button on the offline page.
// ?ping=<time> is a new URL every time, so the service worker can't answer it from the cache
export async function checkConnection() {
  try {
    const response = await fetch(`${API_URL}/cars/1.json?ping=${Date.now()}`, { cache: 'no-store' })
    return response.ok && response.headers.get('X-From-Cache') !== '1'
  } catch {
    return false
  }
}

export async function createCar(data) {
  const { cars } = await loadAllCars()
  const newId = Math.max(0, ...cars.map((c) => c.id), ...readLocal(REMOVED_KEY)) + 1
  const car = { ...data, id: newId, createdAt: new Date().toISOString() }

  writeLocal(ADDED_KEY, [car, ...readLocal(ADDED_KEY)])
  return car
}

export async function deleteCar(id) {
  const carId = Number(id)
  const added = readLocal(ADDED_KEY)

  if (added.some((car) => car.id === carId)) {
    writeLocal(ADDED_KEY, added.filter((car) => car.id !== carId))
  } else {
    writeLocal(REMOVED_KEY, [...readLocal(REMOVED_KEY), carId])
  }
}
