import { BODIES, FUELS, MAKES } from '../services/seed.js'

const PRICES = [10000, 20000, 30000, 50000, 80000]
const YEARS = [2024, 2022, 2020, 2018, 2015, 2012]

export default function Filters({ values, onChange, onReset }) {
  const hasFilters = values.make || values.body || values.fuel || values.maxPrice || values.yearFrom || values.search

  return (
    <div className="filters">
      <label className="field-inline">
        <span>Make</span>
        <select value={values.make} onChange={(e) => onChange('make', e.target.value)}>
          <option value="">All makes</option>
          {MAKES.map((make) => (
            <option key={make} value={make}>{make}</option>
          ))}
        </select>
      </label>

      <label className="field-inline">
        <span>Body</span>
        <select value={values.body} onChange={(e) => onChange('body', e.target.value)}>
          <option value="">Any body</option>
          {BODIES.map((body) => (
            <option key={body} value={body}>{body}</option>
          ))}
        </select>
      </label>

      <label className="field-inline">
        <span>Fuel</span>
        <select value={values.fuel} onChange={(e) => onChange('fuel', e.target.value)}>
          <option value="">Any fuel</option>
          {FUELS.map((fuel) => (
            <option key={fuel} value={fuel}>{fuel}</option>
          ))}
        </select>
      </label>

      <label className="field-inline">
        <span>Max price</span>
        <select value={values.maxPrice} onChange={(e) => onChange('maxPrice', e.target.value)}>
          <option value="">No limit</option>
          {PRICES.map((price) => (
            <option key={price} value={price}>up to ${price / 1000}k</option>
          ))}
        </select>
      </label>

      <label className="field-inline">
        <span>Year from</span>
        <select value={values.yearFrom} onChange={(e) => onChange('yearFrom', e.target.value)}>
          <option value="">Any year</option>
          {YEARS.map((year) => (
            <option key={year} value={year}>{year}+</option>
          ))}
        </select>
      </label>

      {hasFilters && (
        <button type="button" className="btn ghost" onClick={onReset}>
          Reset filters
        </button>
      )}
    </div>
  )
}
