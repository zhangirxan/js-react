import { createAction } from '@reduxjs/toolkit'

// "everything about cars is outdated" — after the connection comes back
export const dataInvalidated = createAction('cars/dataInvalidated')

// a list or a car is "fresh" for one minute, then it is requested again
export const FRESH_TIME = 60 * 1000

export function isFresh(entry) {
  return Boolean(entry && entry.status === 'succeeded' && !entry.stale && Date.now() - entry.fetchedAt < FRESH_TIME)
}

// Error objects can't be stored in Redux, keep only what the UI needs
export function toErrorInfo(error) {
  return {
    message: error.message || 'Something went wrong.',
    notFound: Boolean(error.notFound),
    offline: Boolean(error.offline),
  }
}
