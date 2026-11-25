import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { createCar as createCarRequest, deleteCar as deleteCarRequest } from '../services/service.js'
import { toErrorInfo } from './shared.js'

// ---------- thunks (mutations) ----------

export const createCar = createAsyncThunk('listings/createCar', async (data, { rejectWithValue }) => {
  try {
    return await createCarRequest(data)
  } catch (error) {
    return rejectWithValue(toErrorInfo(error))
  }
})

export const deleteCar = createAsyncThunk('listings/deleteCar', async (id, { rejectWithValue }) => {
  try {
    await deleteCarRequest(id)
    return id
  } catch (error) {
    return rejectWithValue(toErrorInfo(error))
  }
})

// ---------- slice ----------

const initialState = {
  createStatus: 'idle', // idle | loading | succeeded | failed
  createError: null,
  deletingId: null,
  deleteError: null,
}

const listingsSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    resetCreate(state) {
      state.createStatus = 'idle'
      state.createError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCar.pending, (state) => {
        state.createStatus = 'loading'
        state.createError = null
      })
      .addCase(createCar.fulfilled, (state) => {
        state.createStatus = 'succeeded'
      })
      .addCase(createCar.rejected, (state, action) => {
        state.createStatus = 'failed'
        state.createError = action.payload
      })
      .addCase(deleteCar.pending, (state, action) => {
        state.deletingId = action.meta.arg
        state.deleteError = null
      })
      .addCase(deleteCar.fulfilled, (state) => {
        state.deletingId = null
      })
      .addCase(deleteCar.rejected, (state, action) => {
        state.deletingId = null
        state.deleteError = { ...action.payload, id: action.meta.arg }
      })
  },
})

export const { resetCreate } = listingsSlice.actions
export default listingsSlice.reducer

// ---------- selectors ----------

export const selectListingsState = (state) => state.listings

