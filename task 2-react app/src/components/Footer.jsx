export default function Footer({ name }) {
  return (
    <footer className="footer">
      © {new Date().getFullYear()} {name} · made with React
    </footer>
  )
}
