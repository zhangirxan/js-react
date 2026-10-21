export default function Header({ total }) {
  return (
    <header className="header">
      <div>
        <h1>Crew Control</h1>
        <p>Crews of the Odyssey, Nebula and Aurora</p>
      </div>
      <p className="header-total">{total} members</p>
    </header>
  )
}
