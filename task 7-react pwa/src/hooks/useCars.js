import { useEffect } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCar, deleteCar, getAllCars, getCar, getCars } from '../services/service.js'

// Query keys. Everything about cars starts with 'cars',
// so invalidateQueries({ queryKey: ['cars'] }) clears all of it at once.
export const carKeys = {
  all: ['cars'],
  list: (params) => ['cars', 'list', params],
  detail: (id) => ['cars', 'detail', id],
  everything: ['cars', 'everything'],
}

// list with filters, e.g. useCarList({ make: 'BMW', page: '2' })
export function useCarList(params) {
  return useQuery({
    queryKey: carKeys.list(params),
    // signal lets React Query cancel the request when the filters change
    queryFn: ({ signal }) => getCars(params, signal),
    // keep showing the old page while the next one loads
    placeholderData: keepPreviousData,
  })
}

export function useCar(id) {
  return useQuery({
    queryKey: carKeys.detail(id),
    queryFn: ({ signal }) => getCar(id, signal),
  })
}

// all cars for the dashboard
export function useAllCars() {
  return useQuery({
    queryKey: carKeys.everything,
    queryFn: ({ signal }) => getAllCars(signal),
  })
}

export function useCreateCar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => createCar(data),
    onSuccess: () => {
      // lists, dashboard and profile now have a new car -> refetch them
      queryClient.invalidateQueries({ queryKey: carKeys.all })
    },
  })
}

export function useDeleteCar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => deleteCar(id),
    onSuccess: (_result, id) => {
      queryClient.removeQueries({ queryKey: carKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: carKeys.all })
    },
  })
}

// When the connection comes back, the data on screen may be an offline copy:
// mark all cars data as outdated so React Query loads it again from the server.
export function useRefreshWhenOnline(online) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (online) queryClient.invalidateQueries({ queryKey: carKeys.all })
  }, [online, queryClient])
}
