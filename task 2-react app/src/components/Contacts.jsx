export default function Contacts({ github }) {
  const items = [
    { label: 'GitHub', value: github.replace('https://', ''), href: github },
    { label: 'Address', value: 'Planet Earth 🌍' },
  ]

  return (
    <section className="section" id="contacts">
      <h2>Contacts</h2>
      <div className="card contacts">
        {items.map((c) => (
          <div key={c.label} className="contact">
            <span className="contact-label">{c.label}</span>
            {c.href ? (
              <a href={c.href} target="_blank" rel="noreferrer">{c.value}</a>
            ) : (
              <span>{c.value}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
