export default function Hero({ name, role, avatar, github }) {
  return (
    <section className="hero" id="top">
      <img className="avatar" src={avatar} alt={name} />
      <p className="hello">Hi, I'm</p>
      <h1>{name}</h1>
      <p className="role">{role}</p>
      <div className="hero-buttons">
        <a className="btn primary" href="#about">About me</a>
        <a className="btn" href={github} target="_blank" rel="noreferrer">GitHub</a>
      </div>
    </section>
  )
}
