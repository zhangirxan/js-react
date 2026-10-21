const COLORS = ['#2f6fab', '#3a8f6b', '#b5651d', '#7a4fa3', '#a63d40', '#2d8a8a', '#8a6d1f', '#4a5a8c']

export default function Avatar({ name, size = 34 }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const color = COLORS[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % COLORS.length]

  return (
    <span className="avatar" style={{ background: color, width: size, height: size, fontSize: size * 0.4 }}>
      {initials}
    </span>
  )
}
