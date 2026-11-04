import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { createCar } from '../services/service.js'
import { BODIES, CITIES, COLORS, FUELS, MAKES, TRANSMISSIONS } from '../services/seed.js'
import FormField from '../components/FormField.jsx'
import CarImage from '../components/CarImage.jsx'
import PhotoPicker from '../components/PhotoPicker.jsx'
import { formatMileage, formatPrice } from '../utils/format.js'

const EMPTY_FORM = {
  make: '',
  model: '',
  year: '',
  price: '',
  mileage: '',
  horsepower: '',
  body: 'Sedan',
  fuel: 'Petrol',
  transmission: 'Automatic',
  color: 'White',
  city: 'Almaty',
  description: '',
  photo: '',
}

function validate(form) {
  const errors = {}
  const year = Number(form.year)
  const price = Number(form.price)
  const mileage = Number(form.mileage)
  const power = Number(form.horsepower)

  if (!form.make) errors.make = 'Choose a make'
  if (!form.model.trim()) errors.model = 'Enter the model'
  if (!form.year) errors.year = 'Enter the year'
  else if (year < 1980 || year > 2027) errors.year = 'Between 1980 and 2027'
  if (!form.price) errors.price = 'Enter the price'
  else if (price < 500 || price > 1000000) errors.price = 'Between $500 and $1,000,000'
  if (form.mileage === '') errors.mileage = 'Enter the mileage'
  else if (mileage < 0 || mileage > 1000000) errors.mileage = 'Between 0 and 1,000,000 km'
  if (!form.horsepower) errors.horsepower = 'Enter engine power'
  else if (power < 40 || power > 1500) errors.horsepower = 'Between 40 and 1500 hp'
  if (form.description.length > 500) errors.description = 'Max 500 characters'

  return errors
}

export default function SellPage() {
  const navigate = useNavigate()
  const { showNotice } = useOutletContext()

  const [form, setForm] = useState(EMPTY_FORM)
  const [triedToSubmit, setTriedToSubmit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const errors = validate(form)
  // don't show red errors before the first click on "Publish"
  const shownErrors = triedToSubmit ? errors : {}

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setTriedToSubmit(true)
    if (Object.keys(errors).length > 0) return

    setSaving(true)
    setSaveError('')
    try {
      const car = await createCar({
        ...form,
        model: form.model.trim(),
        description: form.description.trim(),
        year: Number(form.year),
        price: Number(form.price),
        mileage: Number(form.mileage),
        horsepower: Number(form.horsepower),
        photo: form.photo || null,
        photoLarge: form.photo || null,
      })
      showNotice(`${car.make} ${car.model} is published`)
      navigate(`/cars/${car.id}`)
    } catch (err) {
      setSaveError(err.message)
      setSaving(false)
    }
  }

  function handleClear() {
    setForm(EMPTY_FORM)
    setTriedToSubmit(false)
    setSaveError('')
  }

  return (
    <div className="sell-page">
      <div className="sell-head">
        <h1>Sell your car</h1>
        <p className="muted">Fill in the details. The listing appears in the catalog right away.</p>
      </div>

      <div className="sell-layout">
        <form className="sell-form" onSubmit={handleSubmit} noValidate>
          <FormField label="Photo" wide>
            <PhotoPicker value={form.photo} onChange={(photo) => setForm({ ...form, photo })} />
          </FormField>

          <FormField label="Make" error={shownErrors.make}>
            <select name="make" value={form.make} onChange={handleChange}>
              <option value="">Choose make</option>
              {MAKES.map((make) => <option key={make} value={make}>{make}</option>)}
            </select>
          </FormField>

          <FormField label="Model" error={shownErrors.model}>
            <input name="model" value={form.model} onChange={handleChange} placeholder="e.g. Camry" />
          </FormField>

          <FormField label="Year" error={shownErrors.year}>
            <input name="year" type="number" value={form.year} onChange={handleChange} placeholder="2020" />
          </FormField>

          <FormField label="Price, $" error={shownErrors.price}>
            <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="25000" />
          </FormField>

          <FormField label="Mileage, km" error={shownErrors.mileage}>
            <input name="mileage" type="number" value={form.mileage} onChange={handleChange} placeholder="60000" />
          </FormField>

          <FormField label="Power, hp" error={shownErrors.horsepower}>
            <input name="horsepower" type="number" value={form.horsepower} onChange={handleChange} placeholder="180" />
          </FormField>

          <FormField label="Body">
            <select name="body" value={form.body} onChange={handleChange}>
              {BODIES.map((body) => <option key={body} value={body}>{body}</option>)}
            </select>
          </FormField>

          <FormField label="Fuel">
            <select name="fuel" value={form.fuel} onChange={handleChange}>
              {FUELS.map((fuel) => <option key={fuel} value={fuel}>{fuel}</option>)}
            </select>
          </FormField>

          <FormField label="Transmission">
            <select name="transmission" value={form.transmission} onChange={handleChange}>
              {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>

          <FormField label="Color">
            <select name="color" value={form.color} onChange={handleChange}>
              {COLORS.map((color) => <option key={color} value={color}>{color}</option>)}
            </select>
          </FormField>

          <FormField label="City" wide>
            <select name="city" value={form.city} onChange={handleChange}>
              {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
            </select>
          </FormField>

          <FormField label={`Description (${form.description.length}/500)`} error={shownErrors.description} wide>
            <textarea
              name="description"
              rows="4"
              value={form.description}
              onChange={handleChange}
              placeholder="Condition, service history, extras…"
            />
          </FormField>

          {saveError && <p className="form-error wide">{saveError}</p>}

          <div className="form-actions wide">
            <button type="button" className="btn ghost" onClick={handleClear} disabled={saving}>Clear</button>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? 'Publishing…' : 'Publish listing'}
            </button>
          </div>
        </form>

        <aside className="preview">
          <p className="preview-label">Preview</p>
          <div className="car-card static">
            <CarImage photo={form.photo} alt="Preview" />
            <div className="car-card-body">
              <div className="car-card-title">
                <h3>{form.make || 'Make'} {form.model || 'Model'}</h3>
                <span className="year">{form.year || '----'}</span>
              </div>
              <p className="price">{form.price ? formatPrice(Number(form.price)) : '$ —'}</p>
              <ul className="chips">
                <li>{form.mileage ? formatMileage(Number(form.mileage)) : '— km'}</li>
                <li>{form.fuel}</li>
                <li>{form.transmission}</li>
              </ul>
              <p className="city">📍 {form.city}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
