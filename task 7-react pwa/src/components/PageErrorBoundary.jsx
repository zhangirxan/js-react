import { Component } from 'react'
import { Link } from 'react-router-dom'

// If a page crashes or its code can't be downloaded (for example offline),
// show a message instead of a blank screen. Error boundaries can only be class components.
export default class PageErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="status">
        <h3>This page could not be opened</h3>
        <p>Maybe the connection is lost. Pages you opened before still work offline.</p>
        <button type="button" className="btn primary" onClick={() => window.location.reload()}>
          Try again
        </button>
        <Link to="/offline" className="text-link">Connection help</Link>
      </div>
    )
  }
}
