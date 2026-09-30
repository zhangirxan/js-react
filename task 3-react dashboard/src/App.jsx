import { useState } from 'react'
import { initialPlayers } from './data.js'
import Header from './components/Header.jsx'
import AddPlayerForm from './components/AddPlayerForm.jsx'
import Toolbar from './components/Toolbar.jsx'
import PlayerList from './components/PlayerList.jsx'

export default function App() {
  const [players, setPlayers] = useState(initialPlayers)
  const [statusFilter, setStatusFilter] = useState('all')
  const [positionFilter, setPositionFilter] = useState('all')
  const [sortBy, setSortBy] = useState('number')
  const [reversed, setReversed] = useState(false)
  // bumping a player's version changes his key -> card remounts with fresh local state
  const [versions, setVersions] = useState({})
  const [useIndexKeys, setUseIndexKeys] = useState(false)

  console.log('[render] App')

  // derived from state on every render, not stored separately
  const visible = players
    .filter(
      (p) =>
        (statusFilter === 'all' || p.status === statusFilter) &&
        (positionFilter === 'all' || p.position === positionFilter)
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'rating') return b.rating - a.rating
      return a.number - b.number
    })
  if (reversed) visible.reverse()

  function addPlayer(player) {
    setPlayers((prev) => [...prev, { ...player, id: Date.now(), status: 'available' }])
  }

  function removePlayer(id) {
    setPlayers((prev) => prev.filter((p) => p.id !== id))
  }

  function changeStatus(id, status) {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
  }

  function resetPlayer(id) {
    setVersions((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }))
  }

  function resetAll() {
    setVersions((prev) => {
      const next = { ...prev }
      players.forEach((p) => (next[p.id] = (next[p.id] ?? 0) + 1))
      return next
    })
  }

  return (
    <div className="app">
      <Header players={players} />

      <div className="layout">
        <aside>
          <AddPlayerForm onAdd={addPlayer} />
        </aside>

        <main>
          <Toolbar
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
            positionFilter={positionFilter}
            onPositionFilter={setPositionFilter}
            sortBy={sortBy}
            onSortBy={setSortBy}
            reversed={reversed}
            onReverse={() => setReversed((r) => !r)}
            onResetAll={resetAll}
            useIndexKeys={useIndexKeys}
            onToggleIndexKeys={() => setUseIndexKeys((v) => !v)}
          />

          <PlayerList
            players={visible}
            versions={versions}
            useIndexKeys={useIndexKeys}
            onStatusChange={changeStatus}
            onRemove={removePlayer}
            onReset={resetPlayer}
          />
        </main>
      </div>
    </div>
  )
}
