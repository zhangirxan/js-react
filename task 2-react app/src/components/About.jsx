const facts = [
  { value: '4th', label: 'year at KBTU' },
  { value: 'React', label: 'main stack' },
  { value: '∞', label: 'cups of coffee' },
]

export default function About() {
  return (
    <section className="section" id="about">
      <h2>About Me</h2>
      <div className="card about">
        <p>
          I'm a 4th year student at Kazakh-British Technical University and a young frontend
          developer. I like building clean, simple interfaces with JavaScript and React, and I keep
          learning something new every week.
        </p>
        <p>
          Outside of code I'm into football, crypto and cars.
        </p>
        <div className="facts">
          {facts.map((f) => (
            <div key={f.label} className="fact">
              <span className="fact-value">{f.value}</span>
              <span className="fact-label">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
