import { useState } from 'react'

const MAX_SIZE = 1000

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not read the photo'))
    reader.readAsDataURL(file)
  })
}

// big phone photos don't fit into localStorage, so we make them smaller first
async function shrinkPhoto(file) {
  if (typeof OffscreenCanvas === 'undefined') {
    if (file.size > 1500000) throw new Error('Photo is too big, max 1.5 MB')
    return fileToDataUrl(file)
  }

  const image = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIZE / Math.max(image.width, image.height))
  const width = Math.round(image.width * scale)
  const height = Math.round(image.height * scale)

  const canvas = new OffscreenCanvas(width, height)
  canvas.getContext('2d').drawImage(image, 0, 0, width, height)
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.75 })

  return fileToDataUrl(blob)
}

export default function PhotoPicker({ value, onChange }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Choose an image file')
      return
    }

    setLoading(true)
    setError('')
    try {
      const photo = await shrinkPhoto(file)
      onChange(photo)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  if (value) {
    return (
      <div className="photo-picker-preview">
        <img src={value} alt="Your car" />
        <button type="button" className="btn ghost small" onClick={() => onChange('')}>
          Remove photo
        </button>
      </div>
    )
  }

  return (
    <div className="photo-picker">
      <label className="photo-drop">
        <input type="file" accept="image/*" onChange={handleFile} disabled={loading} />
        <span className="photo-drop-icon">📷</span>
        <span>{loading ? 'Processing photo…' : 'Click to add a photo'}</span>
        <span className="muted small">JPG, PNG or WEBP</span>
      </label>
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}
