export default function Header({ total }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div>
          <h1>Crew Control</h1>
          <p>Odyssey · Nebula · Aurora</p>
        </div>
        <p className="topbar-total">
          <b>{total}</b> crew members
        </p>
      </div>
    </header>
  )
}
