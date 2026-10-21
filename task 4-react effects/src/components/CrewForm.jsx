import { useState } from 'react'
import { PLANETS, RANKS, ROLES, SHIPS } from '../constants.js'

function toFormValues(member) {
  return {
    name: member?.name ?? '',
    description: member?.description ?? ROLES[0],
    rank: member?.rank ?? RANKS[0],
    callsign: member?.callsign ?? '',
    planet: member?.planet ?? PLANETS[0],
    age: member?.age ?? '',
    ship: member?.ship ?? SHIPS[0],
    skills: member?.skills?.join(', ') ?? '',
    bio: member?.bio ?? '',
  }
}

function validate(values) {
  const errors = {}
  if (!values.name.trim()) errors.name = 'Enter a name'
  else if (values.name.trim().length > 40) errors.name = 'Max 40 characters'
  if (values.age === '') errors.age = 'Enter the age'
  else if (Number(values.age) < 18 || Number(values.age) > 80) errors.age = 'Between 18 and 80'
  if (values.callsign.length > 20) errors.callsign = 'Max 20 characters'
  if (values.bio.length > 300) errors.bio = 'Max 300 characters'
  return errors
}

export default function CrewForm({ member, onSave, onCancel }) {
  const [values, setValues] = useState(() => toFormValues(member))
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const errors = validate(values)
  const shown = submitted ? errors : {}

  function handleChange(e) {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
    if (Object.keys(errors).length > 0) return

    setSaving(true)
    setError('')
    try {
      await onSave({
        name: values.name.trim(),
        description: values.description,
        rank: values.rank,
        callsign: values.callsign.trim(),
        planet: values.planet,
        age: Number(values.age),
        ship: values.ship,
        skills: values.skills.split(',').map((s) => s.trim()).filter(Boolean),
        bio: values.bio.trim(),
      })
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  const select = (name, options) => (
    <select name={name} value={values[name]} onChange={handleChange} disabled={saving}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )

  return (
    <div className="modal-backdrop" onClick={saving ? undefined : onCancel}>
      <form className="modal" onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} noValidate>
        <h2>{member ? `Edit ${member.name}` : 'New crew member'}</h2>

        <div className="form-grid">
          <label className={`field wide ${shown.name ? 'invalid' : ''}`}>
            <span>Name</span>
            <input name="name" value={values.name} onChange={handleChange} disabled={saving} placeholder="e.g. Sarah Connor" />
            {shown.name && <small>{shown.name}</small>}
          </label>
          <label className="field"><span>Role</span>{select('description', ROLES)}</label>
          <label className="field"><span>Rank</span>{select('rank', RANKS)}</label>
          <label className={`field ${shown.callsign ? 'invalid' : ''}`}>
            <span>Callsign</span>
            <input name="callsign" value={values.callsign} onChange={handleChange} disabled={saving} placeholder="e.g. Falcon" />
            {shown.callsign && <small>{shown.callsign}</small>}
          </label>
          <label className={`field ${shown.age ? 'invalid' : ''}`}>
            <span>Age</span>
            <input name="age" type="number" value={values.age} onChange={handleChange} disabled={saving} />
            {shown.age && <small>{shown.age}</small>}
          </label>
          <label className="field"><span>Home planet</span>{select('planet', PLANETS)}</label>
          <label className="field"><span>Ship</span>{select('ship', SHIPS)}</label>
          <label className="field wide">
            <span>Skills (comma separated)</span>
            <input name="skills" value={values.skills} onChange={handleChange} disabled={saving} placeholder="Piloting, Repair" />
          </label>
          <label className={`field wide ${shown.bio ? 'invalid' : ''}`}>
            <span>Bio ({values.bio.length}/300)</span>
            <textarea name="bio" rows="3" value={values.bio} onChange={handleChange} disabled={saving} />
            {shown.bio && <small>{shown.bio}</small>}
          </label>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn" onClick={onCancel} disabled={saving}>Cancel</button>
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? 'Saving…' : member ? 'Save changes' : 'Add to crew'}
          </button>
        </div>
      </form>
    </div>
  )
}
