export const POSITIONS = ['GK', 'DEF', 'MID', 'FWD']

export const STATUSES = {
  available: 'Available',
  injured: 'Injured',
  suspended: 'Suspended',
}

export const initialPlayers = [
  { id: 1, name: 'Petr Čech', position: 'GK', number: 1, rating: 90, age: 44, country: 'Czech Republic', status: 'available' },
  { id: 2, name: 'Paolo Maldini', position: 'DEF', number: 3, rating: 94, age: 58, country: 'Italy', status: 'available' },
  { id: 3, name: 'Dani Alves', position: 'DEF', number: 2, rating: 88, age: 43, country: 'Brazil', status: 'injured' },
  { id: 4, name: 'Xavi', position: 'MID', number: 6, rating: 93, age: 46, country: 'Spain', status: 'available' },
  { id: 5, name: 'Frank Lampard', position: 'MID', number: 8, rating: 90, age: 48, country: 'England', status: 'suspended' },
  { id: 6, name: 'Lionel Messi', position: 'FWD', number: 10, rating: 95, age: 39, country: 'Argentina', status: 'available' },
  { id: 7, name: 'Erling Haaland', position: 'FWD', number: 9, rating: 91, age: 26, country: 'Norway', status: 'available' },
]
