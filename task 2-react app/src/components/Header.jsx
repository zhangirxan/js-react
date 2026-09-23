const links = [
  { href: '#about', label: 'About' },
  { href: '#interests', label: 'Interests' },
  { href: '#contacts', label: 'Contacts' },
]

export default function Header({ name }) {
  const initials = name.split(' ').map((w) => w[0]).join('')

  return (
    <header className="header">
      <a href="#top" className="logo">{initials}</a>
      <nav>
        {links.map((l) => (
          <a key={l.href} href={l.href}>{l.label}</a>
        ))}
      </nav>
    </header>
  )
}
