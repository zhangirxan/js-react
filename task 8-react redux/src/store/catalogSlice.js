import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import { getCars } from '../services/service.js'
import { dataInvalidated, isFresh, toErrorInfo } from './shared.js'
import { createCar, deleteCar } from './listingsSlice.js'

const MAX_LISTS = 30

// ---------- thunk ----------

// queryString is the cache key: "make=BMW&sort=price-asc&page=2"
export const fetchCars = createAsyncThunk(
  'catalog/fetchCars',
  async ({ queryString }, { signal, rejectWithValue }) => {
    try {
      const params = Object.fromEntries(new URLSearchParams(queryString))
      return await getCars(params, signal)
    } catch (error) {
      if (error.name === 'AbortError') throw error
      return rejectWithValue(toErrorInfo(error))
    }
  },
  {
    // the same list loaded less than a minute ago -> no new request
    condition: ({ queryString, force }, { getState }) => {
      if (force) return true
      return !isFresh(getState().catalog.lists[queryString])
    },
  }
)

// ---------- slice ----------

const initialState = {
  // one entry per filter combination: { data, status, error, fetchedAt, stale, requestId }
  lists: {},
  // grows after every mutation / reconnect, the hooks then load their list again
  version: 0,
}

function markAllStale(state) {
  Object.values(state.lists).forEach((entry) => {
    entry.stale = true
  })
  state.version += 1
}

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCars.pending, (state, action) => {
        const key = action.meta.arg.queryString
        const entry = state.lists[key] || { data: null, fetchedAt: 0 }
        entry.status = 'loading'
        entry.error = null
        entry.requestId = action.meta.requestId
        state.lists[key] = entry
      })
      .addCase(fetchCars.fulfilled, (state, action) => {
        const entry = state.lists[action.meta.arg.queryString]
        // an older request finished after a newer one -> ignore its answer
        if (!entry || entry.requestId !== action.meta.requestId) return

        entry.data = action.payload
        entry.status = 'succeeded'
        entry.fetchedAt = Date.now()
        entry.stale = false

        // don't keep hundreds of old filter combinations
        const keys = Object.keys(state.lists)
        if (keys.length > MAX_LISTS) {
          keys
            .sort((a, b) => state.lists[a].fetchedAt - state.lists[b].fetchedAt)
            .slice(0, keys.length - MAX_LISTS)
            .forEach((key) => delete state.lists[key])
        }
      })
      .addCase(fetchCars.rejected, (state, action) => {
        const entry = state.lists[action.meta.arg.queryString]
        if (!entry || entry.requestId !== action.meta.requestId) return

        // cancelled because the filters changed or the page closed — not an error
        if (action.meta.aborted) {
          entry.status = entry.data ? 'succeeded' : 'idle'
          return
        }
        entry.status = 'failed'
        entry.error = action.payload
      })
      // after these the lists may be outdated
      .addCase(createCar.fulfilled, markAllStale)
      .addCase(deleteCar.fulfilled, markAllStale)
      .addCase(dataInvalidated, markAllStale)
  },
})

export default catalogSlice.reducer

// ---------- selectors ----------

export const selectCarList = (state, queryString) => state.catalog.lists[queryString]
export const selectCatalogVersion = (state) => state.catalog.version

// "More BMW" on the car page: same make, without the car itself, max 4
export const selectSimilarCars = createSelector(
  [(state, queryString) => selectCarList(state, queryString)?.data?.items, (state, queryString, currentId) => currentId],
  (items, currentId) => (items ? items.filter((car) => car.id !== currentId).slice(0, 4) : [])
)
