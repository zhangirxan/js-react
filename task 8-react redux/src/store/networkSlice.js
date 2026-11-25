import { createSlice, isAnyOf } from '@reduxjs/toolkit'
import { fetchCars } from './catalogSlice.js'
import { fetchCarById } from './carDetailsSlice.js'
import { fetchAllCars } from './dashboardSlice.js'

const anyRequestFulfilled = isAnyOf(fetchCars.fulfilled, fetchCarById.fulfilled, fetchAllCars.fulfilled)
const anyRequestRejected = isAnyOf(fetchCars.rejected, fetchCarById.rejected, fetchAllCars.rejected)

const networkSlice = createSlice({
  name: 'network',
  initialState: {
    online: navigator.onLine,
    updateReady: false, // a new version of the app (service worker) is waiting
  },
  reducers: {
    setOnline(state, action) {
      state.online = action.payload
    },
    updateAvailable(state) {
      state.updateReady = true
    },
  },
  // navigator.onLine is not enough, so every API answer also tells if the server was reached
  extraReducers: (builder) => {
    builder
      .addMatcher(anyRequestFulfilled, (state, action) => {
        state.online = !action.payload.fromCache
      })
      .addMatcher(anyRequestRejected, (state, action) => {
        if (action.payload?.offline) state.online = false
      })
  },
})

export const { setOnline, updateAvailable } = networkSlice.actions
export default networkSlice.reducer

export const selectIsOnline = (state) => state.network.online
export const selectUpdateReady = (state) => state.network.updateReady
