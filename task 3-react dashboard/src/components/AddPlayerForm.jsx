import { useState } from 'react'
import { POSITIONS } from '../data.js'

const emptyForm = { name: '', position: 'MID', number: '', rating: 75, age: '', country: '' }

export default function AddPlayerForm({ onAdd }) {
  // inputs are local state of the form, the parent only gets the finished player
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  console.log('[render] AddPlayerForm')

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Enter a player name')
      return
    }
    onAdd({
      ...form,
      name: form.name.trim(),
      country: form.country.trim() || 'Unknown',
      number: Number(form.number) || 0,
      rating: Number(form.rating),
      age: Number(form.age) || 18,
    })
    setForm(emptyForm)
    setError('')
  }

  return (
    <form className="panel form" onSubmit={handleSubmit}>
      <h2>Add player</h2>

      <label>
        Name
        <input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Andrea Pirlo" />
      </label>

      <div className="row">
        <label>
          Position
          <select value={form.position} onChange={(e) => update('position', e.target.value)}>
            {POSITIONS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label>
          Number
          <input type="number" min="1" max="99" value={form.number} onChange={(e) => update('number', e.target.value)} />
        </label>
      </div>

      <div className="row">
        <label>
          Age
          <input type="number" min="15" max="45" value={form.age} onChange={(e) => update('age', e.target.value)} />
        </label>
        <label>
          Country
          <input value={form.country} onChange={(e) => update('country', e.target.value)} />
        </label>
      </div>

      <label>
        Rating: <b>{form.rating}</b>
        <input type="range" min="50" max="99" value={form.rating} onChange={(e) => update('rating', e.target.value)} />
      </label>

      {error && <p className="error">{error}</p>}

      <button className="btn primary" type="submit">Add to squad</button>
    </form>
  )
}
