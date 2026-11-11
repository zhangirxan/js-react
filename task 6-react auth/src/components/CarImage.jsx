import { useState } from 'react'

export default function CarImage({ photo, alt, large = false }) {
  const [failed, setFailed] = useState(false)
  const className = large ? 'car-image large' : 'car-image'

  if (!photo || failed) {
    return (
      <div className={`${className} no-photo`}>
        <span>No photo</span>
      </div>
    )
  }

  return (
    <div className={className}>
      <img src={photo} alt={alt} loading="lazy" onError={() => setFailed(true)} />
    </div>
  )
}
