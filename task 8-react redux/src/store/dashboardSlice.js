import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import { getAllCars } from '../services/service.js'
import { dataInvalidated, isFresh, toErrorInfo } from './shared.js'
import { createCar, deleteCar } from './listingsSlice.js'

// ---------- thunk ----------

export const fetchAllCars = createAsyncThunk(
  'dashboard/fetchAllCars',
  async (_arg, { signal, rejectWithValue }) => {
    try {
      return await getAllCars(signal) // { cars, fromCache, cachedAt }
    } catch (error) {
      if (error.name === 'AbortError') throw error
      return rejectWithValue(toErrorInfo(error))
    }
  },
  {
    condition: (arg, { getState }) => Boolean(arg?.force) || !isFresh(getState().dashboard),
  }
)

// ---------- slice ----------

const initialState = { data: null, status: 'idle', error: null, fetchedAt: 0, stale: false, requestId: null, version: 0 }

function markStale(state) {
  state.stale = true
  state.version += 1
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCars.pending, (state, action) => {
        state.status = 'loading'
        state.error = null
        state.requestId = action.meta.requestId
      })
      .addCase(fetchAllCars.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return
        state.data = action.payload
        state.status = 'succeeded'
        state.fetchedAt = Date.now()
        state.stale = false
      })
      .addCase(fetchAllCars.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return
        if (action.meta.aborted) {
          state.status = state.data ? 'succeeded' : 'idle'
          return
        }
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(createCar.fulfilled, markStale)
      .addCase(deleteCar.fulfilled, markStale)
      .addCase(dataInvalidated, markStale)
  },
})

export default dashboardSlice.reducer

// ---------- selectors ----------

const NO_CARS = []

function average(numbers) {
  if (numbers.length === 0) return 0
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length
}

// [{ name: 'Petrol', count: 40 }, ...] from the biggest group
function countBy(cars, field) {
  const counts = {}
  for (const car of cars) {
    counts[car[field]] = (counts[car[field]] || 0) + 1
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export const selectDashboardState = (state) => state.dashboard
export const selectAllCars = (state) => state.dashboard.data?.cars ?? NO_CARS

// cars of the chosen make and city — recalculated only when the cars or the filters change
export const selectDashboardCars = createSelector(
  [selectAllCars, (state, make) => make, (state, make, city) => city],
  (cars, make, city) => cars.filter((car) => (!make || car.make === make) && (!city || car.city === city))
)

// all numbers for the dashboard — recalculated only when selectDashboardCars gives a new array
export const selectDashboardStats = createSelector([selectDashboardCars], (cars) => {
  if (cars.length === 0) return null

  const byPrice = [...cars].sort((a, b) => a.price - b.price)
  return {
    count: cars.length,
    averagePrice: average(cars.map((c) => c.price)),
    averageMileage: Math.round(average(cars.map((c) => c.mileage))),
    averageYear: Math.round(average(cars.map((c) => c.year))),
    cheapest: byPrice[0],
    mostExpensive: byPrice[byPrice.length - 1],
    byFuel: countBy(cars, 'fuel'),
    byBody: countBy(cars, 'body'),
    byMake: countBy(cars, 'make').slice(0, 6),
  }
})
