import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getCar } from '../services/service.js'
import { dataInvalidated, isFresh, toErrorInfo } from './shared.js'
import { deleteCar } from './listingsSlice.js'

// ---------- thunk ----------

export const fetchCarById = createAsyncThunk(
  'carDetails/fetchCarById',
  async ({ id }, { signal, rejectWithValue }) => {
    try {
      return await getCar(id, signal) // { car, fromCache, cachedAt }
    } catch (error) {
      if (error.name === 'AbortError') throw error
      return rejectWithValue(toErrorInfo(error))
    }
  },
  {
    condition: ({ id, force }, { getState }) => force || !isFresh(getState().carDetails.byId[id]),
  }
)

// ---------- slice ----------

const carDetailsSlice = createSlice({
  name: 'carDetails',
  // byId: { 5: { data, status, error, fetchedAt, stale, requestId } }
  initialState: { byId: {}, version: 0 },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCarById.pending, (state, action) => {
        const id = action.meta.arg.id
        const entry = state.byId[id] || { data: null, fetchedAt: 0 }
        entry.status = 'loading'
        entry.error = null
        entry.requestId = action.meta.requestId
        state.byId[id] = entry
      })
      .addCase(fetchCarById.fulfilled, (state, action) => {
        const entry = state.byId[action.meta.arg.id]
        if (!entry || entry.requestId !== action.meta.requestId) return
        entry.data = action.payload
        entry.status = 'succeeded'
        entry.fetchedAt = Date.now()
        entry.stale = false
      })
      .addCase(fetchCarById.rejected, (state, action) => {
        const entry = state.byId[action.meta.arg.id]
        if (!entry || entry.requestId !== action.meta.requestId) return
        if (action.meta.aborted) {
          entry.status = entry.data ? 'succeeded' : 'idle'
          return
        }
        entry.status = 'failed'
        entry.error = action.payload
      })
      // the removed car must not be shown from memory
      .addCase(deleteCar.fulfilled, (state, action) => {
        delete state.byId[action.payload]
      })
      .addCase(dataInvalidated, (state) => {
        Object.values(state.byId).forEach((entry) => {
          entry.stale = true
        })
        state.version += 1
      })
  },
})

export default carDetailsSlice.reducer

// ---------- selectors ----------

export const selectCarEntry = (state, id) => state.carDetails.byId[id]
export const selectDetailsVersion = (state) => state.carDetails.version
