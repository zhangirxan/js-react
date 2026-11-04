import { generateSeed } from './seed.js'

const STORAGE_KEY = 'automarket-routes-cars'

// open the site with ?fail=1 to make every request fail
const alwaysFail = new URLSearchParams(window.location.search).has('fail')

function loadCars() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) return JSON.parse(saved)

  const cars = generateSeed()
  saveCars(cars)
  return cars
}

function saveCars(cars) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cars))
  } catch {
    throw new Error('Not enough browser storage. Try a smaller photo.')
  }
}

// pretends to be a network request: waits 350-1000 ms, can be cancelled
function fakeNetwork(signal) {
  return new Promise((resolve, reject) => {
    const delay = 350 + Math.random() * 650

    const timer = setTimeout(() => {
      if (alwaysFail) reject(new Error('Server is not responding. Please try again.'))
      else resolve()
    }, delay)

    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer)
        reject(new DOMException('Request cancelled', 'AbortError'))
      })
    }
  })
}

function copy(data) {
  return JSON.parse(JSON.stringify(data))
}

function sortCars(cars, sort) {
  if (sort === 'price-asc') return cars.sort((a, b) => a.price - b.price)
  if (sort === 'price-desc') return cars.sort((a, b) => b.price - a.price)
  if (sort === 'year-desc') return cars.sort((a, b) => b.year - a.year)
  if (sort === 'mileage-asc') return cars.sort((a, b) => a.mileage - b.mileage)
  if (sort === 'power-desc') return cars.sort((a, b) => b.horsepower - a.horsepower)
  return cars.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) // newest
}

// GET /cars?search=&make=&fuel=&body=&maxPrice=&yearFrom=&sort=&page=&pageSize=
export async function getCars(params = {}, signal) {
  await fakeNetwork(signal)

  const search = (params.search || '').toLowerCase().trim()
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 12

  let cars = loadCars()

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

  sortCars(cars, params.sort)

  const total = cars.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, totalPages)
  const items = cars.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return copy({ items, total, page: currentPage, pageSize, totalPages })
}

// GET /cars/all — used by the dashboard
export async function getAllCars(signal) {
  await fakeNetwork(signal)
  return copy(loadCars())
}

// GET /cars/:id
export async function getCar(id, signal) {
  await fakeNetwork(signal)

  const car = loadCars().find((c) => c.id === Number(id))
  if (!car) {
    const error = new Error('This listing does not exist or was removed.')
    error.notFound = true
    throw error
  }
  return copy(car)
}

// POST /cars
export async function createCar(data) {
  await fakeNetwork()

  const cars = loadCars()
  const newId = Math.max(0, ...cars.map((c) => c.id)) + 1
  const car = { ...data, id: newId, createdAt: new Date().toISOString() }

  saveCars([car, ...cars])
  return copy(car)
}

// DELETE /cars/:id
export async function deleteCar(id) {
  await fakeNetwork()
  saveCars(loadCars().filter((c) => c.id !== Number(id)))
}
