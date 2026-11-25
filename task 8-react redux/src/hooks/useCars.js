import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCars, selectCarList, selectCatalogVersion } from '../store/catalogSlice.js'
import { fetchCarById, selectCarEntry, selectDetailsVersion } from '../store/carDetailsSlice.js'
import { fetchAllCars, selectDashboardState } from '../store/dashboardSlice.js'
import { createCar, deleteCar, resetCreate, selectListingsState } from '../store/listingsSlice.js'

// Every hook: asks Redux for the data, starts the thunk if it is missing or outdated,
// and cancels the request when the component no longer needs it.

// list of cars, e.g. useCarList({ make: 'BMW', page: '2' })
export function useCarList(params) {
  const dispatch = useDispatch()
  const queryString = new URLSearchParams(params).toString()
  const entry = useSelector((state) => selectCarList(state, queryString))
  const version = useSelector(selectCatalogVersion)

  // keep showing the previous list while the next page / filter is loading
  const [shownData, setShownData] = useState(null)
  if (entry?.data && entry.data !== shownData) setShownData(entry.data)

  useEffect(() => {
    const request = dispatch(fetchCars({ queryString }))
    // filters changed or the page closed -> the old request is cancelled
    return () => request.abort()
  }, [dispatch, queryString, version])

  const data = entry?.data ?? shownData
  return {
    data,
    isPending: !data && entry?.status !== 'failed',
    isFetching: entry?.status === 'loading',
    isError: entry?.status === 'failed',
    error: entry?.error,
    refetch: () => dispatch(fetchCars({ queryString, force: true })),
  }
}

export function useCar(id) {
  const dispatch = useDispatch()
  const entry = useSelector((state) => selectCarEntry(state, id))
  const version = useSelector(selectDetailsVersion)

  useEffect(() => {
    const request = dispatch(fetchCarById({ id }))
    return () => request.abort()
  }, [dispatch, id, version])

  return {
    data: entry?.data,
    isPending: !entry?.data && entry?.status !== 'failed',
    isError: entry?.status === 'failed',
    error: entry?.error,
    refetch: () => dispatch(fetchCarById({ id, force: true })),
  }
}

// all cars for the dashboard
export function useAllCars() {
  const dispatch = useDispatch()
  const dashboard = useSelector(selectDashboardState)

  useEffect(() => {
    const request = dispatch(fetchAllCars())
    return () => request.abort()
  }, [dispatch, dashboard.version])

  return {
    data: dashboard.data,
    isPending: !dashboard.data && dashboard.status !== 'failed',
    isError: dashboard.status === 'failed',
    error: dashboard.error,
    refetch: () => dispatch(fetchAllCars({ force: true })),
  }
}

export function useCreateCar() {
  const dispatch = useDispatch()
  const { createStatus, createError } = useSelector(selectListingsState)

  // leaving the form clears an old error, so it is not shown next time
  useEffect(() => {
    return () => dispatch(resetCreate())
  }, [dispatch])

  return {
    // .unwrap() returns the new car or throws the error, so the page can await it
    create: (data) => dispatch(createCar(data)).unwrap(),
    isSaving: createStatus === 'loading',
    error: createError,
    reset: () => dispatch(resetCreate()),
  }
}

export function useDeleteCar(id) {
  const dispatch = useDispatch()
  const { deletingId, deleteError } = useSelector(selectListingsState)

  return {
    remove: () => dispatch(deleteCar(id)).unwrap(),
    isDeleting: deletingId === id,
    error: deleteError?.id === id ? deleteError : null,
  }
}
