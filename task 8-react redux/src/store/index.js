import { configureStore } from '@reduxjs/toolkit'
import catalogReducer from './catalogSlice.js'
import carDetailsReducer from './carDetailsSlice.js'
import dashboardReducer from './dashboardSlice.js'
import listingsReducer from './listingsSlice.js'
import networkReducer from './networkSlice.js'

export const store = configureStore({
  reducer: {
    catalog: catalogReducer, // car lists, cached per filter combination
    carDetails: carDetailsReducer, // one car per id
    dashboard: dashboardReducer, // all cars + statistics
    listings: listingsReducer, // create / delete
    network: networkReducer, // online / offline, app update
  },
})
