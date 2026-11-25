import { useEffect, useState } from 'react'
import useDebounce from '../hooks/useDebounce.js'

// value = search from the URL. The search runs 400 ms after the user stops typing,
// or right away on Enter / the button.
export default function SearchBar({ value, onSearch }) {
  const [text, setText] = useState(value)

  // the URL changed from outside (Back button, Reset filters) -> show it in the input
  const [lastValue, setLastValue] = useState(value)
  if (value !== lastValue) {
    setLastValue(value)
    setText(value)
  }

  const debouncedText = useDebounce(text, 400)

  // runs only when the debounced text changes, not when the URL changes,
  // otherwise an old text could be written back into the URL after "Back"
  useEffect(() => {
    if (debouncedText.trim() !== value) onSearch(debouncedText.trim())
  }, [debouncedText])

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
