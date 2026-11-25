// Writes the public "API" as static JSON files:
//   public/api/cars.json      - the list
//   public/api/cars/<id>.json - one file per car (details)
// GitHub Pages serves them like a read-only REST API.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { generateSeed } from '../src/services/seed.js'

const cars = generateSeed()
const dir = new URL('../public/api/', import.meta.url)

rmSync(dir, { recursive: true, force: true })
mkdirSync(new URL('cars/', dir), { recursive: true })

writeFileSync(new URL('cars.json', dir), JSON.stringify(cars))
for (const car of cars) {
  writeFileSync(new URL(`cars/${car.id}.json`, dir), JSON.stringify(car))
}

console.log(`API: wrote ${cars.length} cars`)
