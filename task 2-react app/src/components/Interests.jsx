const interests = [
  { icon: '⚽', title: 'Football', text: 'Playing with friends and watching big matches on weekends.' },
  { icon: '₿', title: 'Crypto', text: 'Following the market and reading about blockchain tech.' },
  { icon: '🏎️', title: 'Cars', text: 'Fast cars, car design and everything about motorsport.' },
  { icon: '💻', title: 'Frontend', text: 'JavaScript, React and making UIs that feel nice to use.' },
]

export default function Interests() {
  return (
    <section className="section" id="interests">
      <h2>Interests</h2>
      <div className="grid">
        {interests.map((item) => (
          <div key={item.title} className="card interest">
            <span className="icon">{item.icon}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
