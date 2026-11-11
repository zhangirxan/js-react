import { useState } from 'react'

// the search runs when the user presses Enter or the button
export default function SearchBar({ value, onSearch }) {
  const [text, setText] = useState(value)

  function handleSubmit(e) {
    e.preventDefault()
    onSearch(text.trim())
  }

  return (
    <form className="search" onSubmit={handleSubmit}>
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search make, model, city, color…"
        aria-label="Search cars"
      />
      <button type="submit" className="btn primary">Search</button>
    </form>
  )
}
