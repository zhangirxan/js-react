export default function SortSelect({ value, onChange }) {
  return (
    <label className="sort">
      <span>Sort by</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="newest">Newest listings</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
        <option value="year-desc">Year: newest first</option>
        <option value="mileage-asc">Mileage: lowest first</option>
        <option value="power-desc">Most powerful</option>
      </select>
    </label>
  )
}
